import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import { checkRole } from "../middleware/roleMiddleware.js";
import {
  listPendingUsers,
  approveUser,
  rejectUser,
} from "../controllers/adminUserController.js";

const router = express.Router();

router.get("/dashboard", protect, checkRole("admin"), (req, res) => {
  res.json({ message: "Добро пожаловать, админ 👑" });
});

router.get("/users/pending", protect, checkRole("admin"), listPendingUsers);
router.patch("/users/:id/approve", protect, checkRole("admin"), approveUser);
router.patch("/users/:id/reject", protect, checkRole("admin"), rejectUser);

export default router;