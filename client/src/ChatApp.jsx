import React, { useState, useEffect, useRef } from "react";
import { io } from "socket.io-client";

const socket = io();

export default function ChatApp() {
  const [message, setMessage] = useState("");
  const [chat, setChat] = useState([]);
  const [socketId, setSocketId] = useState(null);
  const chatEndRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    socket.on("connect", () => {
      const id = socket.id;
      setSocketId(id);

      // Maintain list of this client's socket IDs across refreshes
      const stored = JSON.parse(localStorage.getItem("socketIds") || "[]");
      if (!stored.includes(id)) {
        stored.push(id);
        localStorage.setItem("socketIds", JSON.stringify(stored));
      }

      // Handle history mapping using all past IDs
      socket.on("chat-history", (history) => {
        const ids = JSON.parse(localStorage.getItem("socketIds") || "[]");
        const formattedHistory = history.map((msg) => ({
          text: msg.text,
          from: ids.includes(msg.sender) ? "me" : "other",
        }));
        setChat(formattedHistory);
      });

      // Handle live messages (only current session)
      socket.on("message", (data) => {
        const from = data.sender === id ? "me" : "other";
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
