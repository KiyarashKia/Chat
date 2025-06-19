const express = require("express");
const http = require("http");
const cors = require("cors");
const { Server } = require("socket.io");

const app = express();
app.use(cors());

const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: "*" }
});

const messageHistory = []; // stores last 10 messages
const MAX_MESSAGES = 10;
const HISTORY_CLEAR_INTERVAL = 20 * 60 * 1000; // 20 minutes in milliseconds

io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  // Send last 10 messages to new user
  socket.emit("chat-history", messageHistory);

  socket.on("message", (data) => {
    // Validate and save to history
    const validatedMessage = {
      text: data.text,
      sender: data.sender,
      from: "me" // Store the original sender's perspective
    };
    messageHistory.push(validatedMessage);
    if (messageHistory.length > MAX_MESSAGES) {
      messageHistory.shift(); // keep only last 10
    }

    // Broadcast to others with their perspective
    socket.broadcast.emit("message", {
      ...validatedMessage,
      from: "other" // Recipients see it as from other
    });
  });

  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);
  });
});

// Clear history every 20 minutes
setInterval(() => {
  messageHistory.length = 0;
  console.log("Chat history cleared.");
}, HISTORY_CLEAR_INTERVAL);

const port = process.env.PORT || 3001;
server.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
