import fs from "fs";
import multer from "multer";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const uploadDir = path.join(__dirname, "../uploads/books");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const bookId = req.params.id;
    const allowed = [".pdf", ".txt"];
    const finalExt = allowed.includes(ext) ? ext : ".txt";
    cb(null, `${bookId}${finalExt}`);
  },
});

export const uploadBookFile = multer({
  storage,
  limits: { fileSize: 50 * 1024 * 1024 },
});

export { uploadDir };
