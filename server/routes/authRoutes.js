import express from "express";
import {
  registerUser,
  loginUser,
  getMe,
  logoutUser,
  verifyEmail,
  resendVerification,
} from "../controllers/authController.js";
import { protect, optionalProtect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/register", registerUser);
router.post("/verify-email", verifyEmail);
router.post("/resend-verification", resendVerification);
router.post("/login", loginUser);
router.post("/logout", logoutUser);
router.get("/me", optionalProtect, getMe);

export default router;