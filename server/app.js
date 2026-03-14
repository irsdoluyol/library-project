import express from "express";
import cors from "cors";
import helmet from "helmet";
import cookieParser from "cookie-parser";
import rateLimit from "express-rate-limit";
import dotenv from "dotenv";
import mongoose from "mongoose";
import { validateEnv } from "./utils/validateEnv.js";
import authRoutes from "./routes/authRoutes.js";
import testRoutes from "./routes/testRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import bookRoutes from "./routes/bookRoutes.js";
import requestRoutes from "./routes/requestRoutes.js";

if (process.env.NODE_ENV !== "test") {
  dotenv.config({ quiet: true });
}
validateEnv();

const isDev = process.env.NODE_ENV !== "production";

const corsOrigins = process.env.CORS_ORIGINS
  ? process.env.CORS_ORIGINS.split(",").map((o) => o.trim())
  : ["http://localhost:5173", "http://localhost:5174", "http://127.0.0.1:5173", "http://127.0.0.1:5174"];

const app = express();

app.use(helmet({ crossOriginResourcePolicy: { policy: "cross-origin" } }));
app.use(
  cors({
    origin: corsOrigins,
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);
app.use(cookieParser());
app.use(express.json());

app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

const isTest = process.env.NODE_ENV === "test";
const isProd = process.env.NODE_ENV === "production";
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: isTest ? 10000 : isProd ? 20 : 1000,
  message: { message: "Слишком много попыток входа. Попробуйте через 15 минут." },
  standardHeaders: true,
  legacyHeaders: false,
});

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: isTest ? 10000 : isProd ? 100 : 2000,
  message: { message: "Слишком много запросов. Попробуйте позже." },
  standardHeaders: true,
  legacyHeaders: false,
});

async function connectMongo() {
  const maxRetries = 3;
  for (let i = 0; i < maxRetries; i++) {
    try {
      await mongoose.connect(process.env.MONGO_URI);
      console.log("MongoDB подключена");
      return;
    } catch (err) {
      console.error(`MongoDB: попытка ${i + 1}/${maxRetries} —`, err.message);
      if (i === maxRetries - 1) throw err;
      await new Promise((r) => setTimeout(r, 2000 * (i + 1)));
    }
  }
}
connectMongo().catch((err) => {
  console.error("Не удалось подключиться к MongoDB:", err.message);
  process.exit(1);
});

app.use("/api", apiLimiter);
app.use("/api/auth", authLimiter, authRoutes);
if (isDev) {
  app.use("/api/test", testRoutes);
}
app.use("/api/admin", adminRoutes);
app.use("/api/books", bookRoutes);
app.use("/api/requests", requestRoutes);

app.get("/", (req, res) => {
  res.send("Library API работает 🚀");
});

app.get("/api/health", (req, res) => {
  res.json({ ok: true, message: "API доступен" });
});

app.use((req, res) => {
  res.status(404).json({ message: "Маршрут не найден" });
});

app.use((err, req, res, next) => {
  console.error("[Error]", err.message);
  const status = err.status || err.statusCode || 500;
  const message = process.env.NODE_ENV === "production" ? "Ошибка сервера" : err.message;
  res.status(status).json({ message });
});

export default app;