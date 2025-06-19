import React, { useState, useEffect, useRef } from "react";
import { io } from "socket.io-client";

const socket = io("https://chat-backend-27gg.onrender.com");

export default function ChatApp() {
  const [message, setMessage] = useState("");
  const [chat, setChat] = useState([]);
  const chatEndRef = useRef(null);

  useEffect(() => {
    socket.on("connect", () => {
      console.log("✅ Connected to socket:", socket.id);
    });

    socket.on("message", (data) => {
      if (data.sender !== socket.id) {
        setChat((prev) => [...prev, { text: data.text, from: "other" }]);
      }
    });

    return () => socket.off("message");
  }, []);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chat]);

  const send = () => {
    const trimmed = message.trim();
    if (trimmed) {
      setChat((prev) => [...prev, { text: trimmed, from: "me" }]);
      socket.emit("message", {
        text: trimmed,
        sender: socket.id,
      });
      setMessage("");
    }
  };
  

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        height: "100dvh", // dynamic viewport height fixes mobile keyboard issue
        background: "#121212",
        fontFamily: "sans-serif",
        boxSizing: "border-box",
        overflow: "hidden", // prevent scroll bounce
      }}
    >
      {/* Message Area */}
      <div
        style={{
          flex: 1,
          overflowY: "auto",
          display: "flex",
          flexDirection: "column",
          gap: "0.5rem",
          padding: "1rem",
          paddingBottom: "0.5rem",
          boxSizing: "border-box",
        }}
      >
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
      <div
        style={{
          padding: "0.75rem 1rem",
          borderTop: "1px solid #2a2a2a",
          background: "#121212",
          boxSizing: "border-box",
        }}
      >
        <input
          type="text"
          value={message}
          placeholder="Write a message..."
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && send()}
          style={{
            width: "100%",
            padding: "0.8rem 1rem",
            borderRadius: "999px",
            border: "none",
            outline: "none",
            background: "#1c1c1e",
            color: "#fff",
            fontSize: "1rem",
          }}
        />
      </div>
    </div>
  );
}
