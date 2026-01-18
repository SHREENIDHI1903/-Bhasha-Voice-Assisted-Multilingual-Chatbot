import asyncio
import websockets
import json
import numpy as np
import io
from gtts import gTTS
import av
import time

async def test_transcription():
    # 1. Generate Hindi Audio
    print("Generating Hindi Audio...")
    text = "नमस्ते, मेरा फोन काम नहीं कर रहा है।" # "Hello, my phone is not working."
    tts = gTTS(text=text, lang='hi', slow=False)
    mp3_fp = io.BytesIO()
    tts.write_to_fp(mp3_fp)
    mp3_fp.seek(0)
    
    # 2. Decode MP3 to PCM Float32 (16kHz, Mono)
    print("Decoding Audio...")
    container = av.open(mp3_fp)
    stream = container.streams.audio[0]
    
    resampler = av.AudioResampler(format='flt', layout='mono', rate=16000)
    
    pcm_bytes = bytearray()
    
    for frame in container.decode(stream):
        frame.pts = None
        for re_frame in resampler.resample(frame):
            # Check if planarity/packing is correct. 
            # 'flt' format in pyav usually gives planar data, but for mono it's just one plane.
            pcm = re_frame.to_ndarray() # Shape (1, samples)
            pcm_bytes.extend(pcm.tobytes())
            
    print(f"Audio Ready. Bytes: {len(pcm_bytes)}")
    
    # 3. Connect to Websocket
    uri = "ws://localhost:8000/ws/customer/test_user_hi?lang=hi"
    print(f"Connecting to {uri}...")
    
    async with websockets.connect(uri) as websocket:
        print("Connected.")
        
        # 4. Stream Audio in chunks
        chunk_size = 4096 # bytes
        offset = 0
        
        # Start a listener task
        async def listen():
            try:
                commit_received = False
                while True:
                    try:
                        msg = await asyncio.wait_for(websocket.recv(), timeout=5.0)
                        if isinstance(msg, str):
                            data = json.loads(msg)
                            print(f"Received: {data}")
                            if data.get("type") == "commit":
                                commit_received = True
                    except asyncio.TimeoutError:
                        print("Timeout waiting for message.")
                        break
            except Exception as e:
                print(f"Listener Error: {e}")
                
        listener_task = asyncio.create_task(listen())
        
        while offset < len(pcm_bytes):
            chunk = pcm_bytes[offset:offset+chunk_size]
            await websocket.send(chunk)
            offset += chunk_size
            await asyncio.sleep(0.05) # Simulate real-time streaming
            
        print("Finished sending audio.")
        
        # Send Stop Recording
        await websocket.send(json.dumps({"type": "stop_recording"}))
        
        await asyncio.sleep(5) # Wait for final response
        listener_task.cancel()
        
if __name__ == "__main__":
    asyncio.run(test_transcription())
