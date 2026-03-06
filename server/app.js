import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import mongoose from "mongoose";
import authRoutes from "./routes/authRoutes.js";
import testRoutes from "./routes/testRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import bookRoutes from "./routes/bookRoutes.js";
import requestRoutes from "./routes/requestRoutes.js";

dotenv.config();

const app = express();

app.use(
  cors({
    origin: ["http://localhost:5173", "http://localhost:5174", "http://127.0.0.1:5173", "http://127.0.0.1:5174"],
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);
app.use(express.json());

app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB подключена"))
  .catch((err) => console.error("Ошибка подключения MongoDB:", err));

app.use("/api/auth", authRoutes);
app.use("/api/test", testRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/books", bookRoutes);
app.use("/api/requests", requestRoutes);

app.get("/", (req, res) => {
  res.send("Library API работает 🚀");
});

// Тест: GET /api/health — проверить, что сервер и прокси работают
app.get("/api/health", (req, res) => {
  res.json({ ok: true, message: "API доступен" });
});

export default app;