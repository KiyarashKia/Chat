import React, { useState, useEffect, useRef } from "react";
import { io } from "socket.io-client";

const socket = io("https://chat-backend-27gg.onrender.com");

export default function ChatApp() {
  const [message, setMessage] = useState("");
  const [chat, setChat] = useState([]);
  const [socketId, setSocketId] = useState(null);
  const chatEndRef = useRef(null);
  const inputRef = useRef(null);

  // Preserve socket ID across refreshes
  useEffect(() => {
    const saveId = () => {
      if (socketId) localStorage.setItem("lastSocketId", socketId);
    };
    window.addEventListener("beforeunload", saveId);
    return () => window.removeEventListener("beforeunload", saveId);
  }, [socketId]);

  useEffect(() => {
    const oldId = localStorage.getItem("lastSocketId");

    socket.on("connect", () => {
      // Update to new socket ID and store for next refresh
      setSocketId(socket.id);
      localStorage.setItem("lastSocketId", socket.id);

      socket.on("chat-history", (history) => {
        const idToMatch = oldId || socket.id;
        const formattedHistory = history.map((msg) => ({
          text: msg.text,
          from: msg.sender === idToMatch ? "me" : "other",
        }));
        setChat(formattedHistory);
      });

      socket.on("message", (data) => {
        const from = data.sender === socket.id ? "me" : "other";
        setChat((prev) => [...prev, { text: data.text, from }]);
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
      setChat((prev) => [...prev, { text: trimmed, from: "me" }]);
      socket.emit("message", { text: trimmed, sender: socketId });
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
