import torch
from transformers import Wav2Vec2ForCTC, AutoProcessor
import numpy as np
import os

class TranscriberService:
    def __init__(self):
        print("Loading Meta MMS-1B (Massively Multilingual Speech) Model...")
        self.model_id = "facebook/mms-1b-all"
        
        try:
            self.processor = AutoProcessor.from_pretrained(self.model_id)
            self.model = Wav2Vec2ForCTC.from_pretrained(self.model_id)
            
            # --- SPEED OPTIMIZATION ---
            # 1. Use all CPU cores (Safe)
            torch.set_num_threads(os.cpu_count()) 
            
            # REMOVED QUANTIZATION: 
            # It breaks the "Adapter" system (MMS needs dynamic checks which Int8 freezes)
            
            # Map frontend codes (ISO 639-1) to MMS codes (ISO 639-3)
            # Full 22 Official Indian Languages + Major Global
            self.lang_map = {
                # --- INDIAN LANGUAGES (22 Official) ---
                "as": "asm", # Assamese
                "bn": "ben", # Bengali
                "brx": "brx", # Bodo (Verify if MMS supports brx, defaulting to asm if not? No, MMS supports it)
                "doi": "doi", # Dogri
                "gu": "guj", # Gujarati
                "hi": "hin", # Hindi
                "kn": "kan", # Kannada
                "ks": "kas", # Kashmiri
                "kok": "kok", # Konkani
                "mai": "mai", # Maithili 
                "ml": "mal", # Malayalam
                "mni": "mni", # Manipuri (Meitei)
                "mr": "mar", # Marathi
                "ne": "nep", # Nepali
                "or": "ori", # Odia
                "pa": "pan", # Punjabi
                "sa": "san", # Sanskrit
                "sat": "sat", # Santali
                "sd": "snd", # Sindhi
                "ta": "tam", # Tamil
                "te": "tel", # Telugu
               
                
                # --- GLOBAL MAJOR ---
                "en": "eng", # English
                "fr": "fra", # French
                "es": "spa", # Spanish
                "de": "deu", # German
                "it": "ita", # Italian
                "pt": "por", # Portuguese
                "ru": "rus", # Russian
                "zh": "cmn", # Chinese (Mandarin)
                "ja": "jpn", # Japanese
                "ko": "kor", # Korean
                "ar": "ara", # Arabic
                "nl": "nld", # Dutch
                "pl": "pol", # Polish
                "id": "ind", # Indonesian
                "vi": "vie", # Vietnamese
                "th": "tha", # Thai
                "ur": "urd-script_arabic", # Urdu
            }
            
            print("[OK] Meta MMS-1B Loaded Successfully.")
            
        except Exception as e:
            print(f"[ERROR] Failed to load MMS model: {e}")
            self.model = None
            self.processor = None

    def transcribe_audio(self, audio_data, language=None):
        """
        Transcribes audio using Meta MMS.
        """
        if self.model is None:
            return "Error: Model not loaded.", "en"

        # 1. Handle Empty Input
        if audio_data is None or len(audio_data) == 0:
            return "", "en"

        # 2. Normalize Input to Float32 Numpy Array
        if isinstance(audio_data, bytes):
            audio_array = np.frombuffer(audio_data, dtype=np.int16).astype(np.float32) / 32768.0
        else:
            audio_array = audio_data

        # 3. Determine Language Adapter
        # Default to Kannada if not specified or unknown
        target_code = self.lang_map.get(language, "kan") 
        
        try:
            # Load Adapter (This is fast, just switches weights)
            self.processor.tokenizer.set_target_lang(target_code)
            self.model.load_adapter(target_code)
            
            # 4. Prepare Types
            # processor expects raw audio array
            inputs = self.processor(audio_array, sampling_rate=16000, return_tensors="pt")

            # 5. Inference
            with torch.no_grad():
                outputs = self.model(**inputs)

            # 6. Decode
            ids = torch.argmax(outputs.logits, dim=-1)[0]
            transcription = self.processor.decode(ids)
            
            # Cleanup text (MMS might output raw tokens sometimes?)
            # Usually clean.
            
            print(f"MMS ({target_code}): {transcription}")
            return transcription, language or "kn"

        except Exception as e:
            print(f"Transcription Error (MMS): {e}")
            return "", "en"

transcriber_service = TranscriberService()