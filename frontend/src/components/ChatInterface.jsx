import React, { useEffect, useRef, useState } from 'react';
import { PhoneOff, User, Send, Mic, Volume2, Square } from 'lucide-react';
import AudioRecorder from './AudioRecorder';
import { useWebSocket } from '../hooks/useWebSocket';

const ChatInterface = ({ role, userId, lang, onLogout }) => {
  const baseUrl = import.meta.env.VITE_WS_URL || 'ws://localhost:8000';
  const wsUrl = `${baseUrl}/ws/${role}/${userId}?lang=${lang}`;
  const { isConnected, messages, connect, disconnect, sendBytes, sendJson } = useWebSocket(wsUrl);

  const [inputText, setInputText] = useState("");
  const [previewText, setPreviewText] = useState("");
  const messagesEndRef = useRef(null);
  const lastProcessedRef = useRef(null); // Prevents duplicate processing
  const [isProcessing, setIsProcessing] = useState(false);
  const [completionStatus, setCompletionStatus] = useState(false);

  // Audio Playback State
  const currentAudioRef = useRef(null);
  const [playingIndex, setPlayingIndex] = useState(null);

  const themeColor = role === 'customer' ? '#2563eb' : '#059669';

  useEffect(() => {
    connect();
    return () => disconnect();
  }, [connect, disconnect]);

  // --- MESSAGE HANDLER ---
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });

    if (messages.length === 0) return;
    const lastMsgObj = messages[messages.length - 1];

    // Prevent duplicate processing of the same message
    if (lastProcessedRef.current === lastMsgObj) return;
    lastProcessedRef.current = lastMsgObj;

    try {
      const data = typeof lastMsgObj.text === 'object' ? lastMsgObj.text : JSON.parse(lastMsgObj.text);

      // 1. DICTATION PREVIEW: Ghost Text
      if (data.type === 'preview') {
        setPreviewText(data.text); // Just replace the ghost text!
      }

      // 2. SMART FLUSH COMMIT
      if (data.type === 'commit') {
        console.log("Committing Text:", data.text);
        setInputText(prev => {
          const separator = prev.trim() ? " " : "";
          return (prev.trim() + separator + data.text).trim();
        });
        setPreviewText(""); // Clear ghost text
      }

      // 3. PROCESSING STATUS
      if (data.type === 'status') {
        const isNowProcessing = data.status === 'processing';
        setIsProcessing(isNowProcessing);

        // If we just finished processing, show "Complete" for 3s
        if (!isNowProcessing) {
          setCompletionStatus(true);
          setTimeout(() => setCompletionStatus(false), 3000);
        }
      }
    } catch (e) { }
  }, [messages]);

  const playAudio = (b64, index) => {
    // 1. Stop currently playing audio (if any)
    if (currentAudioRef.current) {
      currentAudioRef.current.pause();
      currentAudioRef.current = null;
      setPlayingIndex(null);
    }

    // 2. If user clicked the SAME button, we just stop (Toggle Off)
    if (playingIndex === index) {
      return;
    }

    // 3. Play New Audio
    try {
      const audio = new Audio("data:audio/mp3;base64," + b64);
      currentAudioRef.current = audio;
      setPlayingIndex(index);

      audio.onended = () => {
        setPlayingIndex(null);
        currentAudioRef.current = null;
      };

      audio.play().catch(e => console.log("Auto-play blocked"));
    } catch (e) { }
  };

  const handleSendText = () => {
    // Combine typed + preview
    const finalText = (inputText + (previewText ? " " + previewText : "")).trim();
    if (!finalText) return;

    // Use safe wrapper
    sendJson({ text: finalText });
    setInputText("");
    setPreviewText("");
  };

  const handleStopRecording = () => {
    // Use safe wrapper
    sendJson({ type: "stop_recording" });

    // Commit preview to main text
    if (previewText) {
      setInputText(prev => (prev + " " + previewText).trim());
      setPreviewText("");
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') handleSendText();
  };

  // --- STANDARD MOBILE LAYOUT ---
  // Relies on "interactive-widget=resizes-content" in index.html
  // to resize the viewport when keyboard opens.

  return (
    <div
      style={{
        width: '100%',
        height: '100%', // Fills #root (which is 100% of body)
        backgroundColor: '#e5ddd5',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden', // Prevent outer scroll 
        position: 'absolute', // Ensures it covers everything without being 'fixed' in a weird way
        top: 0, left: 0, right: 0, bottom: 0
      }}
    >

      {/* HEADER */}
      <div style={{ height: '60px', backgroundColor: themeColor, color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 20px', boxShadow: '0 2px 5px rgba(0,0,0,0.2)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{ padding: '8px', background: 'rgba(255,255,255,0.2)', borderRadius: '50%' }}>
            <User size={24} color="white" />
          </div>
          <div>
            <h2 style={{ margin: 0, fontSize: '16px', fontWeight: 'bold' }}>{userId} ({lang})</h2>
            <div style={{ fontSize: '12px', opacity: 0.9 }}>
              {isProcessing ? '⏳ Transcribing...' : (completionStatus ? '✅ Transcribe Complete' : (isConnected ? '🟢 Online' : '🔴 Disconnected'))}
            </div>
          </div>
        </div>
        <button onClick={onLogout} style={{ background: 'transparent', border: 'none', color: 'white', cursor: 'pointer' }}><PhoneOff size={24} /></button>
      </div>

      {/* CHAT AREA */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '20px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {messages.map((msg, index) => {
          let content = {};
          let isMe = false;
          let isSystem = false;

          try {
            const raw = typeof msg.text === 'object' ? msg.text : JSON.parse(msg.text);

            // Hide "preview" and "audio" messages from chat history
            if (raw.type === 'preview') return null;
            if (raw.type === 'audio') return null;

            if (raw.system) { isSystem = true; content = raw; }
            else { content = raw; isMe = content.sender === userId; }
          } catch (e) { isSystem = true; content = { system: typeof msg.text === 'string' ? msg.text : JSON.stringify(msg.text) }; }

          if (isSystem) return <div key={index} style={{ alignSelf: 'center', backgroundColor: '#fff3cd', color: '#854d0e', padding: '5px 15px', borderRadius: '15px', fontSize: '12px', border: '1px solid #fef9c3' }}>{content.system}</div>;

          return (
            <div key={index} style={{
              alignSelf: isMe ? 'flex-end' : 'flex-start',
              backgroundColor: isMe ? '#dcf8c6' : '#ffffff',
              padding: '12px 16px', borderRadius: '12px',
              maxWidth: '75%', boxShadow: '0 1px 2px rgba(0,0,0,0.1)',
              borderTopRightRadius: isMe ? 0 : '12px', borderTopLeftRadius: !isMe ? 0 : '12px'
            }}>
              {!isMe && <div style={{ fontSize: '11px', fontWeight: 'bold', color: themeColor, marginBottom: '4px' }}>{content.sender}</div>}
              <div style={{ fontSize: '15px', color: '#111' }}>{content.original}</div>
              {content.translated && (
                <div style={{ marginTop: '8px', paddingTop: '8px', borderTop: '1px solid #eee', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <div style={{ flex: 1, fontSize: '14px', color: '#004d40', fontStyle: 'italic' }}>{content.translated}</div>
                  {content.audio64 && (
                    <button onClick={() => playAudio(content.audio64, index)} style={{ border: 'none', background: '#eee', borderRadius: '50%', padding: '5px', cursor: 'pointer' }}>
                      {playingIndex === index ? <Square size={16} fill="#004d40" color="#004d40" /> : <Volume2 size={16} color="#004d40" />}
                    </button>
                  )}
                </div>
              )}
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* INPUT BAR */}
      <div style={{
        flexShrink: 0,
        zIndex: 100, // Ensure it stays on top
        minHeight: '70px',
        backgroundColor: '#f0f2f5',
        borderTop: '1px solid #ccc',
        display: 'flex',
        alignItems: 'center',
        padding: '10px 15px',
        gap: '10px',
        paddingBottom: 'max(10px, env(safe-area-inset-bottom))' // Respect iPhone Home Bar
      }}>
        <input
          style={{ flex: 1, height: '45px', padding: '0 15px', borderRadius: '25px', border: '1px solid #ddd', outline: 'none', fontSize: '16px' }}
          value={inputText + (previewText ? (inputText ? " " : "") + previewText : "")}
          onChange={(e) => {
            setInputText(e.target.value);
            setPreviewText(""); // If user types, clear ghost text to avoid confusion? 
            // Or better: Treat user edit as committing the ghost text?
            // Simple approach: User typing overrides preview for now.
          }}
          onKeyPress={handleKeyPress}
          placeholder="Type or Speak..."
          disabled={!isConnected}
        />

        {/* MIC BUTTON (Always Visible) */}
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <AudioRecorder
            onAudioData={sendBytes}
            onStop={handleStopRecording}
            disabled={!isConnected}
          />
        </div>

        {/* SEND BUTTON (Always Visible) */}
        <button
          onClick={handleSendText}
          disabled={!inputText.trim() && !previewText.trim()}
          style={{
            width: '45px', height: '45px', borderRadius: '50%', border: 'none',
            backgroundColor: (inputText.trim() || previewText.trim()) ? themeColor : '#ccc', // Gray out if empty
            color: 'white', cursor: (inputText.trim() || previewText.trim()) ? 'pointer' : 'default',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            transition: 'background-color 0.2s'
          }}>
          <Send size={20} />
        </button>
      </div>
    </div>
  );
};

export default ChatInterface;