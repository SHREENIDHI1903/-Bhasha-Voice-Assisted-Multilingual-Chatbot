//This hook purely manages the connection. It doesn't know about audio; it just sends and receives data.
// src/hooks/useWebSocket.js
import { useState, useRef, useCallback } from 'react';

export const useWebSocket = (url) => {
  const [isConnected, setIsConnected] = useState(false);
  const [messages, setMessages] = useState([]);
  const socketRef = useRef(null);

  const connect = useCallback(() => {
    // Prevent double connections
    if (socketRef.current?.readyState === WebSocket.OPEN) return;

    console.log("Connecting to:", url);
    socketRef.current = new WebSocket(url);
    socketRef.current.binaryType = "arraybuffer"; // Fix: Explicitly handle binary

    socketRef.current.onopen = () => {
      setIsConnected(true);
      console.log("WebSocket Open");
    };

    socketRef.current.onmessage = (event) => {
      let data = event.data;
      try {
        if (typeof data === 'string' && (data.startsWith('{') || data.startsWith('['))) {
          data = JSON.parse(data);
        }
      } catch (e) { }

      // LOGIC: Merge "Audio" packets into previous "Text" packets
      if (data && data.type === 'audio') {
        setMessages(prev => {
          try {
            // 1. Create a copy (shallow copy of array, but we need deep to edit obj)
            const newParams = [...prev];
            // 2. Search Backwards for the matching sender
            for (let i = newParams.length - 1; i >= 0; i--) {
              let msg = newParams[i];
              let content;
              try {
                content = typeof msg.text === 'object' ? { ...msg.text } : JSON.parse(msg.text);
              } catch (e) { continue; }

              // Found the last message from this user?
              if (!content.system && content.sender === data.sender) {
                // Attach Audio!
                content.audio64 = data.payload;
                newParams[i] = { ...msg, text: content }; // Update state
                return newParams;
              }
            }
            return prev; // No match found
          } catch (err) {
            console.error("Audio Merge Error:", err);
            return prev;
          }
        });
      }
      // Normal Message
      else {
        setMessages((prev) => [...prev, { text: data, timestamp: new Date() }]);
      }
    };

    socketRef.current.onclose = () => {
      setIsConnected(false);
      console.log("WebSocket Closed");
    };
  }, [url]);

  const disconnect = useCallback(() => {
    if (socketRef.current) socketRef.current.close();
  }, []);

  const sendBytes = useCallback((data) => {
    if (socketRef.current?.readyState === WebSocket.OPEN) {
      // Fix: Send as Blob to guarantee binary frame
      socketRef.current.send(new Blob([data]));
      // console.log("WS Sent Bytes"); // DEBUG
    } else {
      console.warn("WS Not Open. Cannot send bytes.");
    }
  }, []);

  const sendJson = useCallback((data) => {
    if (socketRef.current?.readyState === WebSocket.OPEN) {
      socketRef.current.send(JSON.stringify(data));
    } else {
      console.warn("WS Not Open. Cannot send JSON.");
    }
  }, []);

  return { isConnected, messages, connect, disconnect, sendBytes, sendJson, socketRef };
};