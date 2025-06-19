import React, { useState, useEffect } from "react";
import { io } from "socket.io-client";

const socket = io("http://localhost:3001");

export default function ChatApp() {
  const [message, setMessage] = useState("");
  const [chat, setChat] = useState([]);

  useEffect(() => {
    console.log("Attempting to connect to socket...");
    socket.on("connect", () => {
      console.log("Connected to socket:", socket.id);
    });
    socket.on("message", (msg) => {
      setChat((prev) => [...prev, { text: msg, from: "other" }]);
    });
    return () => socket.off("message");
  }, []);

  const send = () => {
    if (message.trim()) {
      setChat((prev) => [...prev, { text: message, from: "me" }]);
      socket.emit("message", message);
      setMessage("");
    }
  };

  return (
    <div style={{
      height: "100vh",
      display: "flex",
      flexDirection: "column",
      background: "#121212",
      color: "#fff",
      fontFamily: "sans-serif",
      padding: "1rem"
    }}>
      <div style={{
        flex: 1,
        overflowY: "auto",
        marginBottom: "1rem",
        display: "flex",
        flexDirection: "column",
        gap: "0.5rem"
      }}>
        {chat.map((msg, idx) => (
          <div
            key={idx}
            style={{
              alignSelf: msg.from === "me" ? "flex-end" : "flex-start",
              background: msg.from === "me" ? "#1f6feb" : "#30363d",
              padding: "0.5rem 1rem",
              borderRadius: "1rem",
              maxWidth: "60%",
              wordBreak: "break-word"
            }}
          >
            {msg.text}
          </div>
        ))}
      </div>

      <div style={{ display: "flex", gap: "0.5rem" }}>
        <input
          type="text"
          value={message}
          placeholder="Write a message..."
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && send()}
          style={{
            flex: 1,
            padding: "0.75rem",
            borderRadius: "999px",
            border: "none",
            outline: "none",
            background: "#1c1c1e",
            color: "#fff"
          }}
        />
      </div>
    </div>
  );
}
