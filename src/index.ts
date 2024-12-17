import express from "express";
import bodyParser from "body-parser";
import db from "./config/db.config";
import router from "./routes";
import { Server } from "socket.io";
import http from "http";
import cors from "cors";
import path from "path";
import dotenv from "dotenv";
dotenv.config();
const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*", // Update this to your frontend's URL in production
    methods: ["GET", "POST"],
  },
});

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use("/v1/user", router);

// Serve the HTML file
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});
app.get("/test", (req, res) => {
  console.log("Test")
})

// Socket.IO connection
io.on("connection", (socket) => {
  console.log("A user connected:", socket.id);

  socket.on("joinRoom", (room) => {
    socket.join(room);
    console.log(`Socket ${socket.id} joined room ${room}`);
    socket.to(room).emit("message", `User ${socket.id} has joined room ${room}`);
  });

  socket.on("leaveRoom", (room) => {
    socket.leave(room);
    console.log(`Socket ${socket.id} left room ${room}`);
    socket.to(room).emit("message", `User ${socket.id} has left room ${room}`);
  });

  socket.on("broadcastToRoom", ({ room, message }) => {
    socket.to(room).emit("message", message);
  });

  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);
  });
});

// Database connection and server start
db.initialize()
  .then(() => {
    console.log("Database connection established.");
    server.listen(8000, () => {
      console.log("Server is running on port 8000");
    });
  })
  .catch((error) => {
    console.error("Unable to connect to the database:", error);
    process.exit();
  });
