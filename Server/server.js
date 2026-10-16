const http = require("http");
const path = require("path");
const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const jwt = require("jsonwebtoken");
const { Server } = require("socket.io");

dotenv.config();

const connectDB = require("./config/db");
const passport = require("./config/passport");
const { errorMiddleware } = require("./middleware/errorMiddleware");

connectDB();

const app = express();
const server = http.createServer(app);

const allowedOrigins = [
  process.env.CLIENT_URL || "http://localhost:5173",
  "http://localhost:5173",
  "http://localhost:5174",
];

const io = new Server(server, {
  cors: { origin: allowedOrigins, credentials: true },
});

io.use((socket, next) => {
  try {
    const token = socket.handshake.auth?.token || socket.handshake.query?.token;
    if (!token) return next(new Error("Authentication required"));
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    socket.user = payload;
    next();
  } catch {
    next(new Error("Invalid token"));
  }
});

io.on("connection", (socket) => {
  socket.join(`user:${socket.user.userId}`);
  if (socket.user.role === "worker") socket.join("workers");
  if (socket.user.role === "admin") socket.join("admins");
});

app.set("io", io);

app.use(
  cors({
    origin: allowedOrigins,
    credentials: true,
  })
);
app.use(express.json({ limit: "2mb" }));
app.use("/uploads", express.static(path.join(__dirname, "uploads")));
app.use(passport.initialize());

app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/tickets", require("./routes/ticketRoutes"));
app.use("/api/workers", require("./routes/workerRoutes"));
app.use("/api/admin", require("./routes/adminRoutes"));
app.use("/api/notifications", require("./routes/notificationRoutes"));

app.get("/", (_req, res) => {
  res.json({ message: "FixFlow API is running" });
});

app.use(errorMiddleware);

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
