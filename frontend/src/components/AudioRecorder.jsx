import React, { useState, useRef, useEffect } from 'react';
import { Mic, Square } from 'lucide-react';

const AudioRecorder = ({ onAudioData, onStop, disabled }) => {
  const [isRecording, setIsRecording] = useState(false);
  const [selectedDeviceId, setSelectedDeviceId] = useState('');
  const [devices, setDevices] = useState([]);

  const audioContextRef = useRef(null);
  const streamRef = useRef(null);
  const workletNodeRef = useRef(null);

  // Fetch available microphones
  const fetchDevices = async () => {
    try {
      const devs = await navigator.mediaDevices.enumerateDevices();
      const inputs = devs.filter(d => d.kind === 'audioinput');
      setDevices(inputs);
      if (inputs.length > 0 && !selectedDeviceId) {
        setSelectedDeviceId(inputs[0].deviceId);
      }
    } catch (e) {
      console.error("Could not fetch devices:", e);
    }
  };

  useEffect(() => {
    fetchDevices();
    return () => stopRecording(); // Cleanup on unmount
  }, []);

  const startRecording = async () => {
    try {
      const constraints = {
        audio: {
          deviceId: selectedDeviceId ? { exact: selectedDeviceId } : undefined,
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
          channelCount: 1
        }
      };

      console.log("🎤 Requesting Mic (PCM)...");
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      streamRef.current = stream;

      // 1. Create AudioContext at 16kHz (Browser handles resampling!)
      const context = new (window.AudioContext || window.webkitAudioContext)({ sampleRate: 16000 });
      audioContextRef.current = context;

      // 2. AudioWorklet (Via Blob to avoid external file)
      // This simple processor just passes input to output (and posts message)
      const workletCode = `
        class PCMProcessor extends AudioWorkletProcessor {
          constructor() {
            super();
            this.buffer = [];
            this.bufferSize = 2048; // ~128ms chunks (good balance)
          }
          process(inputs, outputs, parameters) {
            const input = inputs[0];
            if (input.length > 0) {
              const channel = input[0];
              // Simple loop is fast enough for audio thread
              for (let i = 0; i < channel.length; i++) {
                this.buffer.push(channel[i]);
              }
              if (this.buffer.length >= this.bufferSize) {
                this.port.postMessage(new Float32Array(this.buffer));
                this.buffer = [];
              }
            }
            return true;
          }
        }
        registerProcessor('pcm-processor', PCMProcessor);
      `;
      const blob = new Blob([workletCode], { type: 'application/javascript' });
      const workletUrl = URL.createObjectURL(blob);

      await context.audioWorklet.addModule(workletUrl);

      const source = context.createMediaStreamSource(stream);
      const workletNode = new AudioWorkletNode(context, 'pcm-processor');

      workletNode.port.onmessage = (event) => {
        // event.data is Float32Array
        // Send directly (WebSocket handles binary)
        onAudioData(event.data);
      };

      source.connect(workletNode);
      // Connect to destination if you want self-monitoring (we don't)
      // workletNode.connect(context.destination); 

      workletNodeRef.current = workletNode;
      setIsRecording(true);

    } catch (err) {
      console.error("Mic Error:", err);
      alert(`Could not access microphone: ${err.message}`);
    }
  };

  const stopRecording = () => {
    if (audioContextRef.current) {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    if (workletNodeRef.current) {
      workletNodeRef.current = null;
    }

    setIsRecording(false);
    if (onStop) onStop();
  };

  const handleClick = () => {
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  };

  const btnStyle = {
    backgroundColor: isRecording ? '#dc2626' : '#059669',
    color: 'white',
    border: 'none',
    width: '45px',
    height: '45px',
    borderRadius: '50%',
    cursor: disabled ? 'not-allowed' : 'pointer',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    boxShadow: '0 2px 5px rgba(0,0,0,0.2)',
    transition: 'all 0.2s',
    opacity: disabled ? 0.5 : 1
  };

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
      <select
        value={selectedDeviceId}
        onChange={(e) => setSelectedDeviceId(e.target.value)}
        disabled={isRecording || disabled}
        style={{
          backgroundColor: '#374151',
          color: 'white',
          border: '1px solid #4b5563',
          borderRadius: '4px',
          padding: '4px 8px',
          fontSize: '0.875rem',
          maxWidth: '150px'
        }}
      >
        {devices.map((device) => (
          <option key={device.deviceId} value={device.deviceId}>
            {device.label || `Mic ${device.deviceId.slice(0, 5)}...`}
          </option>
        ))}
      </select>

      <button onClick={handleClick} disabled={disabled} style={btnStyle} title={isRecording ? "Stop Recording" : "Start Recording"}>
        {isRecording ? <Square size={20} fill="white" /> : <Mic size={24} />}
      </button>
    </div>
  );
};

export default AudioRecorder;