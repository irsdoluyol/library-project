import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import { checkRole } from "../middleware/roleMiddleware.js";
import { uploadBookFile as multerUpload, uploadCover as multerCover } from "../config/multer.js";
import {
  getBooks,
  createBook,
  updateBook,
  deleteBook,
  borrowBook,
  returnBook,
  getMyBooks,
  uploadBookFile,
  uploadCover,
  getCover,
  readBookFile,
} from "../controllers/bookController.js";

const router = express.Router();

router.get("/", getBooks);
router.get("/my", protect, getMyBooks);
router.get("/:id/cover", getCover);
router.post("/:id/borrow", protect, borrowBook);
router.post("/:id/return", protect, returnBook);
router.get("/:id/read", protect, readBookFile);

router.post("/", protect, checkRole("admin"), createBook);
router.put("/:id", protect, checkRole("admin"), updateBook);
router.delete("/:id", protect, checkRole("admin"), deleteBook);
router.post(
  "/:id/upload",
  protect,
  checkRole("admin"),
  (req, res, next) => {
    multerUpload.single("file")(req, res, (err) => {
      if (err) {
        if (err.code === "LIMIT_FILE_SIZE") {
          return res.status(400).json({ message: "Файл слишком большой (макс. 50 МБ)" });
        }
        return res.status(400).json({ message: err.message || "Ошибка загрузки файла" });
      }
      next();
    });
  },
  uploadBookFile
);

router.post(
  "/:id/cover",
  protect,
  checkRole("admin"),
  (req, res, next) => {
    multerCover.single("cover")(req, res, (err) => {
      if (err) {
        if (err.code === "LIMIT_FILE_SIZE") {
          return res.status(400).json({ message: "Изображение слишком большое (макс. 5 МБ)" });
        }
        return res.status(400).json({ message: err.message || "Ошибка загрузки обложки" });
      }
      next();
    });
  },
  uploadCover
);

export default router;