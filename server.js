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

io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  // Send last 10 messages to new user
  socket.emit("chat-history", messageHistory);

  socket.on("message", (data) => {
    // Save to history
    messageHistory.push(data);
    if (messageHistory.length > 10) {
      messageHistory.shift(); // keep only last 10
    }

    // Broadcast to others
    socket.broadcast.emit("message", data);
  });

  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);
  });
});

const port = process.env.PORT || 3001;
server.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
