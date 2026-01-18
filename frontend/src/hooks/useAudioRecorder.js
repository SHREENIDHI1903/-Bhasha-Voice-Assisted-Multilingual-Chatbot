// src/hooks/useAudioRecorder.js
import { useState, useRef, useEffect } from 'react';
import { downsampleBuffer, convertFloat32ToInt16 } from '../utils/audioConverter';

const TARGET_SAMPLE_RATE = 16000;
// We send chunks every 4096 samples (approx 250ms) to keep streaming smooth
const BUFFER_SIZE = 4096; 

export const useAudioRecorder = (role, userId) => {
    const [isRecording, setIsRecording] = useState(false);
    const [messages, setMessages] = useState([]);
    const [connectionStatus, setConnectionStatus] = useState("Disconnected");
    
    const socketRef = useRef(null);
    const audioContextRef = useRef(null);
    const processorRef = useRef(null);
    const streamRef = useRef(null);

    // 1. Connect to WebSocket
    const connect = () => {
        const wsUrl = `ws://127.0.0.1:8000/ws/${role}/${userId}`;
        console.log("Connecting to:", wsUrl);
        
        socketRef.current = new WebSocket(wsUrl);

        socketRef.current.onopen = () => {
            setConnectionStatus("Connected");
            console.log("WebSocket Connected");
        };

        socketRef.current.onmessage = (event) => {
            // Backend sends text messages (e.g., "You: Hello", "Customer: ...")
            const text = event.data;
            setMessages((prev) => [...prev, { text, sender: 'system', timestamp: new Date() }]);
        };

        socketRef.current.onclose = () => setConnectionStatus("Disconnected");
        socketRef.current.onerror = (err) => console.error("WebSocket Error:", err);
    };

    // 2. Start Recording (Microphone -> AudioContext -> Processor -> WebSocket)
    const startRecording = async () => {
        if (!socketRef.current || socketRef.current.readyState !== WebSocket.OPEN) {
            alert("WebSocket is not connected!");
            return;
        }

        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            streamRef.current = stream;

            // Initialize Audio Context (Browser's native audio engine)
            audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
            const source = audioContextRef.current.createMediaStreamSource(stream);
            
            // Create a ScriptProcessor to intercept audio chunks
            // Note: AudioWorklet is more modern, but ScriptProcessor is easier for simple prototypes
            processorRef.current = audioContextRef.current.createScriptProcessor(BUFFER_SIZE, 1, 1);

            processorRef.current.onaudioprocess = (e) => {
                if (!isRecording) return; // Safety check

                const inputData = e.inputBuffer.getChannelData(0);
                
                // A. Downsample (48kHz -> 16kHz)
                const downsampled = downsampleBuffer(inputData, audioContextRef.current.sampleRate, TARGET_SAMPLE_RATE);
                
                // B. Convert (Float32 -> Int16 PCM)
                const pcm16 = convertFloat32ToInt16(downsampled);

                // C. Send to Backend
                if (socketRef.current.readyState === WebSocket.OPEN) {
                    socketRef.current.send(pcm16);
                }
            };

            source.connect(processorRef.current);
            processorRef.current.connect(audioContextRef.current.destination); // Required for script processor to run

            setIsRecording(true);
        } catch (err) {
            console.error("Error accessing microphone:", err);
            alert("Could not access microphone.");
        }
    };

    // 3. Stop Recording
    const stopRecording = () => {
        if (streamRef.current) {
            streamRef.current.getTracks().forEach(track => track.stop());
        }
        if (processorRef.current) {
            processorRef.current.disconnect();
        }
        if (audioContextRef.current) {
            audioContextRef.current.close();
        }
        setIsRecording(false);
    };

    const disconnect = () => {
        stopRecording();
        if (socketRef.current) socketRef.current.close();
    };

    return {
        isRecording,
        connectionStatus,
        messages,
        connect,
        disconnect,
        startRecording,
        stopRecording
    };
};