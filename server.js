const express = require("express");
const http = require("http");
const cors = require("cors");
const { Server } = require("socket.io");

const app = express();
app.use(cors());

const server = http.createServer(app);

const io = new Server(server, {
  cors: { origin: "*" } // tighten this in production
});

io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  socket.on("message", (data) => {
    console.log("Message received from client:", data);
    io.emit("message", data); // broadcast to all
  });

  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);
  });
});

server.listen(3001, () => {
  console.log("Socket server running on port 3001");
});
