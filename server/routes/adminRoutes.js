import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import { checkRole } from "../middleware/roleMiddleware.js";

const router = express.Router();

router.get("/dashboard", protect, checkRole("admin"), (req, res) => {
  res.json({ message: "Добро пожаловать, админ 👑" });
});

export default router;