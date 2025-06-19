import React, { useState, useEffect, useRef } from "react";
import { io } from "socket.io-client";

const socket = io("https://chat-backend.onrender.com");

export default function ChatApp() {
  const [message, setMessage] = useState("");
  const [chat, setChat] = useState([]);
  const chatEndRef = useRef(null);

  useEffect(() => {
    socket.on("connect", () => {
      console.log("✅ Connected to socket:", socket.id);
    });

    socket.on("message", (msg) => {
      setChat((prev) => [...prev, { text: msg, from: "other" }]);
    });

    return () => socket.disconnect();
  }, []);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chat]);

  const send = () => {
    const trimmed = message.trim();
    if (trimmed) {
      setChat((prev) => [...prev, { text: trimmed, from: "me" }]);
      socket.emit("message", trimmed);
      setMessage("");
    }
  };

  return (
    <div style={{
      display: "flex",
      flexDirection: "column",
      height: "100vh",
      background: "#121212",
      fontFamily: "sans-serif",
      padding: "1rem",
      boxSizing: "border-box"
    }}>
      {/* Message Area */}
      <div style={{
        flex: 1,
        overflowY: "auto",
        display: "flex",
        flexDirection: "column",
        gap: "0.5rem",
        paddingBottom: "0.5rem"
      }}>
        {chat.map((msg, idx) => (
          <div
            key={idx}
            style={{
              alignSelf: msg.from === "me" ? "flex-end" : "flex-start",
              background: msg.from === "me" ? "#1f6feb" : "#30363d",
              color: "#fff",
              padding: "0.6rem 1rem",
              borderRadius: "1rem",
              maxWidth: "80%",
              wordBreak: "break-word",
              fontSize: "0.95rem",
            }}
          >
            {msg.text}
          </div>
        ))}
        <div ref={chatEndRef} />
      </div>

      {/* Input */}
      <div style={{
        display: "flex",
        paddingTop: "0.5rem",
        borderTop: "1px solid #2a2a2a"
      }}>
        <input
          type="text"
          value={message}
          placeholder="Write a message..."
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && send()}
          style={{
            flex: 1,
            padding: "0.8rem 1rem",
            borderRadius: "999px",
            border: "none",
            outline: "none",
            background: "#1c1c1e",
            color: "#fff",
            fontSize: "1rem"
          }}
        />
      </div>
    </div>
  );
}
