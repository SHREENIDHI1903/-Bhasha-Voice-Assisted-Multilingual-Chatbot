#Handles Voice Activity Detection (VAD) and buffers raw bytes into valid 30ms frames.
import torch
import torch
import numpy as np
import io
import av

class AudioProcessor:
    def __init__(self):
        # Load Silero VAD Model
        self.model, utils = torch.hub.load(
            repo_or_dir='snakers4/silero-vad',
            model='silero_vad',
            force_reload=False,
            trust_repo=True
        )
        (self.get_speech_timestamps, _, self.read_audio, _, _) = utils
        
        self.sample_rate = 16000
        self.audio_buffer = bytearray()
        self.speech_buffer = bytearray()
        self.is_speaking = False
        self.is_speaking = False
        self.threshold = 0.1 # Tuning: Aggressive Low Threshold
        
        # New: Silence Tolerance
        self.silence_counter = 0
        self.silence_tolerance = 10 # 10 chunks * 30ms = 300ms of silence allowed

    def process_stream(self, chunk_bytes: bytes):
        """
        Analyzes audio chunk.
        Returns: Audio bytes IF a sentence is finished. Otherwise None.
        """
        self.audio_buffer.extend(chunk_bytes)
        
        # FIX: Window size must be exactly 512 samples for 16k rate.
        # 512 samples * 2 bytes/sample = 1024 bytes
        window_size = 1024 
        
        while len(self.audio_buffer) >= window_size:
            chunk = self.audio_buffer[:window_size]
            self.audio_buffer = self.audio_buffer[window_size:]
            
            # Convert to Float32 for VAD
            audio_int16 = np.frombuffer(chunk, dtype=np.int16)
            audio_float32 = audio_int16.astype(np.float32) / 32768.0
            
            # DEBUG: Check if audio is silent
            print(f"DEBUG: Max Signal: {np.max(np.abs(audio_float32)):.4f}")
            
            # Additional safety check for exact shape
            if len(audio_float32) != 512:
                continue

            tensor = torch.from_numpy(audio_float32)

            # Check if this chunk contains speech
            speech_prob = self.model(tensor, self.sample_rate).item()
            print(f"DEBUG: VAD Score: {speech_prob:.4f}") # Trace sensitivity
            
            if speech_prob > self.threshold:
                # SPEECH DETECTED
                self.is_speaking = True
                self.silence_counter = 0 # Reset silence count
                self.speech_buffer.extend(chunk)
            else:
                # SILENCE DETECTED
                if self.is_speaking:
                     # Calculate how long we've been silent
                     self.silence_counter += 1
                     
                     if self.silence_counter > self.silence_tolerance:
                        # We genuinely finished talking! Return the sentence.
                        self.is_speaking = False
                        self.silence_counter = 0
                        result = bytes(self.speech_buffer)
                        self.speech_buffer = bytearray() # Clear buffer
                        return result
                     else:
                        # Temporary silence (breath/pause) - KEEP BUFFERING
                        self.speech_buffer.extend(chunk)
        
        return None

    def flush(self):
        """
        FORCE returns whatever is in the buffer (Called when user clicks Stop)
        """
        if len(self.speech_buffer) > 0:
            print(f"⚠️ Flushing {len(self.speech_buffer)} bytes of audio...")
            result = bytes(self.speech_buffer)
            self.speech_buffer = bytearray()
            self.is_speaking = False
            return result
        return None

    # decode_webm_to_pcm REMOVED - We now expect raw PCM input.

    def has_speech(self, pcm_array: np.ndarray) -> bool:
        """
        Quick check if the audio array contains speech.
        1. Volume Gate
        2. VAD Model Check
        """
        if len(pcm_array) < 512: return False
        
        # 1. Volume Gate (Filter absolute silence)
        max_vol = np.max(np.abs(pcm_array))
        if max_vol < 0.01: # Silence threshold
            return False

        # 2. VAD Model Check (Sample center of array)
        # We take a window from the middle/end to see if active
        # FIX: Check last 1 second (approx 32 * 512 samples) to capture end of sentences
        window_size = 512
        chunk_count = 32 # ~1 second
        
        if len(pcm_array) < window_size:
            return False

        # Scan backwards up to 1 second
        max_chunks = min(len(pcm_array) // window_size, chunk_count)
        
        for i in range(max_chunks):
            # chunks from end: -512, -1024...
            start = -window_size * (i + 1)
            end = -window_size * i if i > 0 else None
            
            chunk = pcm_array[start:end]
            if len(chunk) != window_size: continue
            
            tensor = torch.from_numpy(chunk)
            speech_prob = self.model(tensor, self.sample_rate).item()
            
            if speech_prob > self.threshold:
                return True
                
        return False