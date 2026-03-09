const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");
const dotenv = require("dotenv");

dotenv.config();

const connectDB = require("./config/db");
const authRoutes = require("./routes/authRoutes");
const buildingRoutes = require("./routes/buildingRoutes");
const chatRoutes = require("./routes/chatRoutes");

// Connect to MongoDB
connectDB();

const app = express();
const server = http.createServer(app);

// Socket.io setup
const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL || "http://localhost:3000",
    methods: ["GET", "POST"],
  },
});

// ─── Middleware ──────────────────────────────────────────────────────────────
app.use(cors({ origin: process.env.CLIENT_URL || "http://localhost:3000" }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ─── Routes ──────────────────────────────────────────────────────────────────
app.use("/auth", authRoutes);
app.use("/buildings", buildingRoutes);
app.use("/chat", chatRoutes);

// Health check
app.get("/", (req, res) => {
  res.json({ message: "✅ Civil Build Rating API is running" });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ message: "Route not found" });
});

// ─── Socket.io Real-time Chat ─────────────────────────────────────────────────
const activeUsers = new Map(); // socketId → { userId, buildingId }

io.on("connection", (socket) => {
  console.log(`🔌 Socket connected: ${socket.id}`);

  // Join a building's chat room
  socket.on("join_room", ({ buildingId, userId, userName }) => {
    socket.join(buildingId);
    activeUsers.set(socket.id, { userId, buildingId, userName });

    console.log(`👤 ${userName} joined room: ${buildingId}`);

    // Notify others in the room
    socket.to(buildingId).emit("user_joined", {
      message: `${userName} joined the chat`,
      userId,
    });
  });

  // Send a real-time message
  socket.on("send_message", (data) => {
    const { buildingId, message } = data;

    // Broadcast to everyone in the room (including sender)
    io.to(buildingId).emit("receive_message", {
      ...message,
      timestamp: new Date().toISOString(),
    });

    console.log(`💬 Message in room ${buildingId} from ${message.senderName}`);
  });

  // Typing indicator
  socket.on("typing", ({ buildingId, userName }) => {
    socket.to(buildingId).emit("user_typing", { userName });
  });

  socket.on("stop_typing", ({ buildingId }) => {
    socket.to(buildingId).emit("user_stop_typing");
  });

  // Leave room
  socket.on("leave_room", ({ buildingId, userName }) => {
    socket.leave(buildingId);
    socket.to(buildingId).emit("user_left", {
      message: `${userName} left the chat`,
    });
  });

  // Handle disconnect
  socket.on("disconnect", () => {
    const user = activeUsers.get(socket.id);
    if (user) {
      socket.to(user.buildingId).emit("user_left", {
        message: `${user.userName} disconnected`,
      });
      activeUsers.delete(socket.id);
    }
    console.log(`❌ Socket disconnected: ${socket.id}`);
  });
});

// ─── Start Server ─────────────────────────────────────────────────────────────
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`📡 Socket.io ready for real-time chat`);
});
