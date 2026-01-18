from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from app.connection_manager import manager
from app.services.audio_processor import AudioProcessor
from app.services.transcriber import transcriber_service
from app.services.translator import translator_service
from gtts import gTTS
import json
import base64
import io
import time
import asyncio
import numpy as np
from functools import partial
import os
from dotenv import load_dotenv
import logging

# Load environment variables
load_dotenv()

# --- Logging Configuration ---
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(message)s",
    handlers=[
        logging.FileHandler("app.log"),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger(__name__)

logger.info("BACKEND SERVER RESTARTED SUCCESSFULLY (NumPy IMPORTED)")

app = FastAPI()

# Configurable CORS
ALLOWED_ORIGINS = os.getenv("ALLOWED_ORIGINS", "*").split(",")
print(f"CORS Allowed Origins: {ALLOWED_ORIGINS}")

app.add_middleware(
    CORSMiddleware, allow_origins=ALLOWED_ORIGINS, allow_credentials=True, allow_methods=["*"], allow_headers=["*"],
)

# --- AUTH ROUTER ---
from app.auth import router as auth_router
app.include_router(auth_router, prefix="/auth", tags=["Authentication"])

def generate_audio_sync(text, lang):
    """Synchronous gTTS generation (Blocking)"""
    try:
        if not text: return None
        tts = gTTS(text=text, lang=lang, slow=False)
        mp3_fp = io.BytesIO()
        tts.write_to_fp(mp3_fp)
        mp3_fp.seek(0)
        return base64.b64encode(mp3_fp.read()).decode("utf-8")
    except Exception as e:
        print(f"TTS Error: {e}")
        return None

async def generate_audio(text, lang):
    """Async wrapper for TTS"""
    loop = asyncio.get_running_loop()
    return await loop.run_in_executor(None, generate_audio_sync, text, lang)

@app.websocket("/ws/{role}/{user_id}")
async def websocket_endpoint(websocket: WebSocket, role: str, user_id: str, lang: str = "en"):
    await manager.connect_user(role, user_id, websocket, lang)
    processor = AudioProcessor()

    # Handle Auto-Detect
    # logic: if lang is 'auto', we pass None to the transcriber
    trans_lang = None if lang == "auto" else lang
    
    # Buffer to hold the growing PCM audio chunks for this sentence
    # Changed from bytearray to list[bytes] to prevent "BufferError" (locking issues)
    pcm_chunks = []
    
    # Concurrency Lock: Prevents multiple transcription threads from overlapping
    # If the AI is busy, we will DROP the "preview" update (Traffic shaping)
    transcription_lock = asyncio.Lock()

    print(f"Connection Established: {user_id}")
    
    # Latency Optimization: Throttle intermediate updates
    last_transcribe_time = 0.0

    # Sticky Language Detection: Remembers language for the current sentence
    # We use a mutable dict so the background task 'run_preview' can update it
    session_state = {"lang": None}

    try:
        while (True):
            message = await websocket.receive()
            # print(f"DEBUG: Msg Type: {message.get('type')}") # Reduce noise
            if message["type"] == "websocket.disconnect":
                print(f"Client Disconnected! Code: {message.get('code')} Reason: {message.get('reason')}")
                raise WebSocketDisconnect()

            partner_id = manager.active_pairs.get(user_id)
            target_lang = "en"
            if partner_id:
                target_lang = await manager.get_user_lang(partner_id)

            msg_type = message.get("type")

            # --- CASE A: AUDIO STREAM (Raw PCM Float32) ---
            if msg_type == "websocket.receive.bytes" or "bytes" in message:
                audio_chunk = message.get("bytes")
                if audio_chunk:
                    # Safety check
                    if len(audio_chunk) % 4 != 0: continue
                        
                    # 1. Append to List (Safe, O(1))
                    pcm_chunks.append(audio_chunk)
                    
                    # 2. Check VAD (Needs full context?)
                    # For VAD, we need to look at recent history. 
                    # Combining ALL chunks is fast for < 30s audio.
                    full_audio_bytes = b"".join(pcm_chunks)
                    pcm_audio = np.frombuffer(full_audio_bytes, dtype=np.float32)
                    
                    # 3. Throttled Transcription (Every 0.5s)
                    now = time.time()
                    
                    # DIGITAL GAIN: Boost volume by 4.0x (Software Pre-amp)
                    # 1.5 was too weak (Amp 0.05). We need roughly 0.2-0.5 for clear speech.
                    pcm_audio = pcm_audio * 4.0
                    
                    # Check if speaking
                    # OPTIMIZATION: Only check VAD on the last 0.3s (4800 samples)
                    vad_chunk = pcm_audio[-4800:] if len(pcm_audio) > 4800 else pcm_audio
                    
                    # DEBUG AMPLITUDE: Check if mic is too quiet
                    max_amp = float(np.max(np.abs(vad_chunk))) if len(vad_chunk) > 0 else 0.0
                    
                    # HYBRID VAD:
                    # 1. Trust Silero VAD
                    # 2. OR Trust raw Amplitude > 0.01 (Fallback if VAD fails on foreign language)
                    is_speaking = processor.has_speech(vad_chunk) or (max_amp > 0.01)
                    
                    if is_speaking:
                         # print(f"Speech Detected! Amp: {max_amp:.4f}")
                         last_transcribe_time = now # Reset silence timer if speaking
                    
                    silence_duration = now - last_transcribe_time
                    
                    # RE-IMPLEMENTATION OF SMART FLUSH LOGIC:
                    
                    if is_speaking:
                        # ACTIVE SPEECH: Update Preview periodically
                        if not hasattr(websocket, "last_preview_time"): websocket.last_preview_time = 0
                        
                        if (now - websocket.last_preview_time) > 0.5:
                            # CONCURRENCY CHECK: Only transcribe if AI is FREE
                            # If locked, we SKIP this preview. This prevents "infinite loop" / lag buildup.
                            if not transcription_lock.locked():
                                # Lock and Run
                                # Sticky Logic: Use cached language if we found one, else use global setting
                                # CHECK: If trans_lang is set, we MUST use it. 
                                # session_state["lang"] is only for "auto" mode persistence.
                                effective_lang = trans_lang if trans_lang else session_state["lang"]
                                
                                # DEBUG LANGUAGE: Critical to verify "kn" is passed
                                logger.info(f"Previewing with Lang: {effective_lang} (User Req: {trans_lang})")
                                
                                websocket.last_preview_time = now
                                
                                # OPTIMIZATION: Rolling Window for Preview
                                # Only transcribe the last 15 seconds (240,000 samples)
                                # This keeps "preview" fast even for long audio.
                                # The final "Commit" will still use full audio.
                                samples_15s = 16000 * 15
                                preview_audio = pcm_audio[-samples_15s:] if len(pcm_audio) > samples_15s else pcm_audio
                                
                                asyncio.create_task(run_preview(websocket, preview_audio, effective_lang, transcription_lock, session_state))
                            else:
                                # System busy, skipping frame (Traffic shaping)
                                # print("⚠️ Skipping Preview (System Busy)")
                                pass
                            
                        websocket.last_speech_time = now

                    else:
                        # SILENCE DETECTED
                        if not hasattr(websocket, "last_speech_time"): websocket.last_speech_time = now
                        
                        silence_dur = now - websocket.last_speech_time
                        
                        if silence_dur > 1.2 and len(pcm_audio) > 16000:
                            # > 1.2s Silence -> COMMIT
                            print(f"Silence ({silence_dur:.1f}s) -> Committing (Async).")
                            print(f"Silence ({silence_dur:.1f}s) -> Committing (Async).")
                            
                            # Fire and forget (Background Commit) to prevent blocking WS loop
                            effective_lang = trans_lang if trans_lang else session_state["lang"]
                            
                            # Offload to background task
                            asyncio.create_task(process_commit(websocket, pcm_audio, effective_lang, transcription_lock))
                            
                            # Clear Buffer (Reset list)
                            pcm_chunks = []
                            # Reset flags
                            websocket.last_speech_time = now 
                            # Reset Sticky Language (Next sentence might be different)
                            session_state["lang"] = None 

            # --- CASE B: TEXT / COMMANDS ---
            elif msg_type == "websocket.receive.text" or "text" in message:
                text_data = message.get("text")
                try: parsed = json.loads(text_data)
                except: parsed = {"text": text_data}

                # 1. HANDLE "STOP RECORDING" (FORCE FLUSH)
                if parsed.get("type") == "stop_recording":
                    print(f"{user_id}: Stop Received.")
                    # Flush whatever is left
                    # (Code condensed for brevity, logic remains same)
                    if len(pcm_chunks) > 0:
                        full_audio_bytes = b"".join(pcm_chunks)
                        pcm_audio = np.frombuffer(full_audio_bytes, dtype=np.float32)
                        pcm_chunks = [] 
                        
                        async with transcription_lock:
                            effective_lang = trans_lang if trans_lang else session_state["lang"]
                            final_text, detected_lang = await run_transcribe_sync(pcm_audio, effective_lang)
                            
                        if final_text:
                             await websocket.send_json({"type": "preview", "text": final_text})

                # 2. HANDLE "LANGUAGE CHANGE"
                elif parsed.get("type") == "language_change":
                    new_lang = parsed.get("lang")
                    if new_lang:
                        await manager.update_user_lang(user_id, new_lang)
                        # Update local state for transcription
                        if new_lang == "auto":
                            trans_lang = None
                            session_state["lang"] = None  
                        else:
                            trans_lang = new_lang
                            session_state["lang"] = new_lang
                        
                        logger.info(f"Language updated to: {new_lang}")
                        await websocket.send_json({"system": f"Language switched to {new_lang}"})

                # 3. HANDLE "TEXT MESSAGE" (SEND)
                elif "text" in parsed:
                    actual_text = parsed["text"]
                    if not actual_text.strip(): continue

                    print(f"{user_id} sending: {actual_text}")
                    
                    # ASYNC TRANSLATION (Non-blocking)
                    # Google Translate API is slow, so we must run it in a thread.
                    loop = asyncio.get_running_loop()
                    translated_text = await loop.run_in_executor(
                        None, 
                        translator_service.translate_text, 
                        actual_text, lang, target_lang
                    )
                    
                    audio_b64 = await generate_audio(translated_text, target_lang)

                    # 1. Send Text Update
                    text_payload = {
                        "sender": user_id,
                        "original": actual_text,
                        "translated": translated_text,
                        "src_lang": lang,
                        "target_lang": target_lang
                    }
                    await websocket.send_json(text_payload)
                    await manager.send_to_partner(user_id, text_payload)

                    # 2. Send Audio Update (If available)
                    if audio_b64:
                        audio_payload = {
                            "type": "audio",
                            "payload": audio_b64,
                            "sender": user_id
                        }
                        await websocket.send_json(audio_payload)
                        await manager.send_to_partner(user_id, audio_payload)

    except WebSocketDisconnect:
        await manager.disconnect(user_id)

# --- HELPER FUNCTIONS FOR CONCURRENCY ---
async def run_preview(websocket, pcm_audio, lang, lock, session_state=None):
    """
    Runs transcription getting the lock first.
    Returns: None (Sends WS message directly)
    """
    async with lock:
        loop = asyncio.get_event_loop()
        try:
             # Unpack tuple from transcriber
             result = await loop.run_in_executor(None, partial(transcriber_service.transcribe_audio, pcm_audio, language=lang))
             text, detected_info = result
             
             if text:
                 # Update Sticky Language if it was Auto
                 if session_state and detected_info and not session_state["lang"]:
                     print(f"Auto-Detected Logic: Locked to '{detected_info}'")
                     session_state["lang"] = detected_info
                 
                 await websocket.send_json({"type": "preview", "text": text})
        except Exception as e:
            print(f"Preview Error: {e}")

async def process_commit(websocket, pcm_audio, lang, lock):
    """
    Runs final transcription and commits (Async Background Task).
    """
    async with lock:
        try:
            final_text, detected_lang = await run_transcribe_sync(pcm_audio, lang)
            if final_text:
                await websocket.send_json({"type": "commit", "text": final_text})
        except Exception as e:
            print(f"Commit Error: {e}")

async def run_transcribe_sync(pcm_audio, lang):
    """
    Helper to run transcription in executor (blocking wrapper)
    """
    loop = asyncio.get_event_loop()
    try:
        return await loop.run_in_executor(None, partial(transcriber_service.transcribe_audio, pcm_audio, language=lang))
    except Exception as e:
        print(f"Transcribe Error: {e}")
        return None, None

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)