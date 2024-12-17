"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const body_parser_1 = __importDefault(require("body-parser"));
const db_config_1 = __importDefault(require("./config/db.config"));
const routes_1 = __importDefault(require("./routes"));
const socket_io_1 = require("socket.io");
const http_1 = __importDefault(require("http"));
const cors_1 = __importDefault(require("cors"));
const path_1 = __importDefault(require("path"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const app = (0, express_1.default)();
const server = http_1.default.createServer(app);
const io = new socket_io_1.Server(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"],
    },
});
app.use((0, cors_1.default)());
app.use(body_parser_1.default.json());
app.use(body_parser_1.default.urlencoded({ extended: true }));
app.use("/v1/user", routes_1.default);
// Serve the HTML file
app.get("/", (req, res) => {
    res.sendFile(path_1.default.join(__dirname, "index.html"));
});
app.get("/test", (req, res) => {
    console.log("Test");
});
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
db_config_1.default.initialize()
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
