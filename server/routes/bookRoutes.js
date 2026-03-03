import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import { checkRole } from "../middleware/roleMiddleware.js";
import {
  getBooks,
  createBook,
  updateBook,
  deleteBook,
  borrowBook,
  returnBook,
  getMyBooks,
} from "../controllers/bookController.js";

const router = express.Router();

router.get("/", getBooks);

router.get("/my", protect, getMyBooks);
router.post("/:id/borrow", protect, borrowBook);
router.post("/:id/return", protect, returnBook);

router.post("/", protect, checkRole("admin"), createBook);
router.put("/:id", protect, checkRole("admin"), updateBook);
router.delete("/:id", protect, checkRole("admin"), deleteBook);

export default router;