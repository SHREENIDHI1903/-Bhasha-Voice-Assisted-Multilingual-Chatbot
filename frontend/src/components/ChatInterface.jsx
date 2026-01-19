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
      className="bg-pattern"
      style={{
        width: '100%',
        height: '100%',
        fontFamily: "'Inter', sans-serif",
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        position: 'absolute',
        top: 0, left: 0, right: 0, bottom: 0
      }}
    >

      {/* HEADER (Glassmorphism) */}
      <div className="glass" style={{
        height: '60px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 20px',
        position: 'absolute', top: 0, left: 0, right: 0, zIndex: 50
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{
            width: '40px', height: '40px',
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: 'white',
            boxShadow: '0 2px 10px rgba(118, 75, 162, 0.3)'
          }}>
            <User size={20} />
          </div>
          <div>
            <h2 style={{ margin: 0, fontSize: '15px', fontWeight: '600', color: '#1f2937' }}>{userId} ({lang})</h2>
            <div style={{ fontSize: '12px', color: isProcessing ? '#d97706' : '#10b981', fontWeight: '500' }}>
              {isProcessing ? '⏳ Transcribing...' : (completionStatus ? '✅ Complete' : (isConnected ? '🟢 Online' : '🔴 Disconnected'))}
            </div>
          </div>
        </div>
        <button onClick={onLogout} style={{ background: 'transparent', border: 'none', color: '#4b5563', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2px' }}>
          <PhoneOff size={20} />
          <span style={{ fontSize: '10px', fontWeight: 'bold' }}>End Chat</span>
        </button>
      </div>

      {/* CHAT AREA */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '80px 20px 100px 20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
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
            else {
              content = { ...raw };
              isMe = content.sender === userId;

              // Normalize backend inconsistencies
              if (!content.text && content.original) content.text = content.original;
              if (!content.lang && content.src_lang) content.lang = content.src_lang;
            }
          } catch (e) { isSystem = true; content = { system: typeof msg.text === 'string' ? msg.text : JSON.stringify(msg.text) }; }

          if (isSystem) return <div key={index} style={{ alignSelf: 'center', backgroundColor: '#fff3cd', color: '#854d0e', padding: '5px 15px', borderRadius: '15px', fontSize: '12px', border: '1px solid #fef9c3' }}>{content.system}</div>;

          return (
            <div key={index} className="msg-animate" style={{
              alignSelf: isMe ? 'flex-end' : 'flex-start',
              maxWidth: '85%',
              position: 'relative'
            }}>
              <div style={{
                backgroundColor: isMe ? '#2563eb' : '#ffffff', // Blue vs White
                color: isMe ? 'white' : '#1f2937',
                padding: '12px 18px',
                borderRadius: isMe ? '20px 20px 4px 20px' : '20px 20px 20px 4px', // Squircle
                boxShadow: '0 2px 5px rgba(0,0,0,0.05)',
                fontSize: '15px',
                lineHeight: '1.5',
                wordBreak: 'break-word',
                whiteSpace: 'pre-wrap',
                border: isMe ? 'none' : '1px solid #f3f4f6'
              }}>
                <span style={{ color: isMe ? '#ffffff' : '#1f2937' }}>
                  {content.text || content.original || content.input || ""}
                </span>
                {msg.type === 'preview' && <span style={{ opacity: 0.6 }}>...</span>}
              </div>

              {/* Language Tag */}
              {content.lang && (
                <div style={{
                  fontSize: '10px',
                  marginTop: '4px',
                  textAlign: isMe ? 'right' : 'left',
                  color: '#9ca3af',
                  padding: '0 4px',
                  fontWeight: '500'
                }}>
                  {content.lang.toUpperCase()}
                </div>
              )}

              {/* Translation (if any) */}
              {content.translated && (
                <div style={{
                  marginTop: '6px',
                  padding: '8px',
                  backgroundColor: 'rgba(255,255,255,0.5)',
                  borderRadius: '8px',
                  fontSize: '13px',
                  color: '#047857',
                  border: '1px solid rgba(0,0,0,0.05)'
                }}>
                  {content.translated}
                </div>
              )}
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* INPUT BAR (Floating) */}
      <div className="glass" style={{
        position: 'fixed',
        bottom: 0, left: 0, right: 0,
        zIndex: 9999,
        padding: '15px',
        paddingBottom: 'max(15px, env(safe-area-inset-bottom))',
        display: 'flex',
        alignItems: 'end',
        gap: '12px',
        borderTop: 'none',
        boxShadow: '0 -4px 20px rgba(0,0,0,0.04)'
      }}>
        <textarea
          style={{
            flex: 1,
            height: '50px',
            padding: '14px 20px',
            borderRadius: '25px',
            border: '1px solid #e5e7eb',
            outline: 'none',
            fontSize: '15px',
            resize: 'none',
            overflowY: 'auto',
            fontFamily: 'inherit',
            lineHeight: '1.4',
            whiteSpace: 'pre-wrap',
            wordBreak: 'break-word',
            backgroundColor: 'rgba(255,255,255,0.9)',
            boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.05)'
          }}
          value={inputText + (previewText ? (inputText ? " " : "") + previewText : "")}
          onChange={(e) => {
            setInputText(e.target.value);
            setPreviewText("");
          }}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              handleSendText();
            }
          }}
          placeholder="Message..."
          disabled={!isConnected}
        />

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', paddingBottom: '4px' }}>
          <AudioRecorder
            onAudioData={sendBytes}
            onStop={handleStopRecording}
            disabled={!isConnected}
          />

          <button
            onClick={handleSendText}
            disabled={!inputText.trim() && !previewText.trim()}
            style={{
              flexShrink: 0,
              width: '42px', height: '42px', borderRadius: '50%', border: 'none',
              backgroundColor: (inputText.trim() || previewText.trim()) ? '#2563eb' : '#d1d5db',
              color: 'white', cursor: (inputText.trim() || previewText.trim()) ? 'pointer' : 'default',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
              boxShadow: (inputText.trim() || previewText.trim()) ? '0 4px 6px -1px rgba(37, 99, 235, 0.3)' : 'none',
              transform: (inputText.trim() || previewText.trim()) ? 'scale(1)' : 'scale(0.95)'
            }}>
            <Send size={18} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatInterface;