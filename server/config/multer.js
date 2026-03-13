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

const coverDir = path.join(__dirname, "../uploads/covers");
if (!fs.existsSync(coverDir)) {
  fs.mkdirSync(coverDir, { recursive: true });
}

const coverStorage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, coverDir),
  filename: (req, file, cb) => {
    const ext = (path.extname(file.originalname) || ".jpg").toLowerCase();
    const allowed = [".jpg", ".jpeg", ".png", ".webp"];
    const finalExt = allowed.includes(ext) ? (ext === ".jpeg" ? ".jpg" : ext) : ".jpg";
    cb(null, `${req.params.id}${finalExt}`);
  },
});

export const uploadBookFile = multer({
  storage,
  limits: { fileSize: 50 * 1024 * 1024 },
});

export const uploadCover = multer({
  storage: coverStorage,
  limits: { fileSize: 5 * 1024 * 1024 },
});

export { uploadDir, coverDir };
