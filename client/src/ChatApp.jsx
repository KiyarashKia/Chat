import React, { useState, useEffect, useRef } from "react";
import { io } from "socket.io-client";

const socket = io("https://chat-backend-27gg.onrender.com");

export default function ChatApp() {
  const [message, setMessage] = useState("");
  const [chat, setChat] = useState([]);
  const [socketId, setSocketId] = useState(null);
  const chatEndRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    socket.on("connect", () => {
      const myId = socket.id;
      setSocketId(myId);

      socket.on("chat-history", (history) => {
        // Format history messages based on sender
        const formattedHistory = history.map((msg) => ({
          text: msg.text,
          from: msg.sender === myId ? "me" : "other",
        }));
        setChat(formattedHistory);
      });

      socket.on("message", (data) => {
        // Format incoming message based on sender
        const formattedMsg = {
          text: data.text,
          from: data.sender === myId ? "me" : "other",
        };
        setChat((prev) => [...prev, formattedMsg]);
      });
    });

    return () => {
      socket.off("connect");
      socket.off("chat-history");
      socket.off("message");
    };
  }, []);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chat]);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const send = () => {
    const trimmed = message.trim();
    if (trimmed) {
      // Show own message immediately
      setChat((prev) => [...prev, { text: trimmed, from: "me" }]);
      socket.emit("message", {
        text: trimmed,
        sender: socketId,
      });
      setMessage("");
    }
  };

  return (
    <div
      style={{
        height: "100dvh",
        display: "flex",
        flexDirection: "column",
        background: "#121212",
        fontFamily: "sans-serif",
        boxSizing: "border-box",
        overflow: "hidden",
      }}
    >
      {/* Chat messages */}
      <div
        style={{
          flex: 1,
          overflowY: "auto",
          display: "flex",
          flexDirection: "column",
          gap: "0.5rem",
          padding: "1rem",
          boxSizing: "border-box",
          WebkitOverflowScrolling: "touch",
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
              fontSize: "1rem",
            }}
          >
            {msg.text}
          </div>
        ))}
        <div ref={chatEndRef} />
      </div>

      {/* Chat input */}
      <div
        style={{
          padding: "0.75rem 1rem",
          borderTop: "1px solid #2a2a2a",
          background: "#121212",
          boxSizing: "border-box",
        }}
      >
        <input
          ref={inputRef}
          type="text"
          value={message}
          inputMode="text"
          autoComplete="off"
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

