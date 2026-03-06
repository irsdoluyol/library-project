import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import { checkRole } from "../middleware/roleMiddleware.js";
import {
  createRequest,
  getMyRequests,
  getAllRequests,
  updateRequestStatus,
} from "../controllers/requestController.js";

const router = express.Router();

router.post("/", protect, createRequest);
router.get("/", protect, getMyRequests);
router.get("/all", protect, checkRole("admin"), getAllRequests);
router.patch("/:id", protect, checkRole("admin"), updateRequestStatus);

export default router;
