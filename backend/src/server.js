import express from "express";
import "dotenv/config";
import cookieParser from "cookie-parser";
import cors from "cors";
import path from "path";
import session from "express-session";
import passport from "passport";
import helmet from "helmet";
import compression from "compression";
import morgan from "morgan";

import "./config/passport.js";
import authRoutes from "./routes/auth.route.js";
import chatRoutes from "./routes/chat.route.js";
import aiRoutes from "./routes/ai.route.js";
import conversationRoutes from "./routes/conversation.route.js";
import { connectDB } from "./lib/db.js";

const app = express();
const PORT = process.env.PORT || 3000;
const __dirname = path.resolve();

// CORS configuration - allow frontend origin
const FRONTEND_URL =
  process.env.NODE_ENV === "production"
    ? "http://localhost:3000" // Same origin in production
    : "http://localhost:5173"; // Dev server

app.use(
  cors({
    origin: ["http://localhost:3000", "http://localhost:5173"],
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

app.use(morgan("dev"));
app.use(compression());
app.use(cookieParser());
app.use(express.json());

app.use(
  session({
    secret: process.env.JWT_SECRET_KEY,
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: process.env.NODE_ENV === "production",
      httpOnly: true,
      sameSite: "lax", // Changed from "none" to "lax" for localhost
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    },
  })
);

app.use(passport.initialize());
app.use(passport.session());

// API Routes
app.use("/api/auth", authRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/ai", aiRoutes);
app.use("/api", conversationRoutes);

// Serve static files from the built frontend
if (process.env.NODE_ENV === "production") {
  app.use(express.static(path.join(__dirname, "../frontend/dist")));

  // Handle SPA routing - serve index.html for all non-API routes
  app.get("*", (req, res) => {
    if (!req.path.startsWith("/api/")) {
      res.sendFile(path.join(__dirname, "../frontend/dist/index.html"));
    }
  });
}

// Simple heartbeat endpoint
app.get("/api/heartbeat", (req, res) => {
  res.json({ status: "ok", timestamp: Date.now() });
});

async function startServer() {
  try {
    await connectDB();
    app.listen(PORT, "0.0.0.0", () => {
      console.log(`Server running on http://localhost:${PORT}`);
      console.log(`Frontend accessible at: http://localhost:${PORT}`);
    });
  } catch (err) {
    console.error("Startup failed:", err);
    process.exit(1);
  }
}

startServer();
