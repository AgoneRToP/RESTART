import multer from "multer";
import path from "node:path";
import fs from "node:fs";

const UPLOAD_FOLDER = path.join(process.cwd(), "uploads");

fs.mkdirSync(UPLOAD_FOLDER, { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, UPLOAD_FOLDER);
  },
  filename: (req, file, cb) => {
    cb(null, new Date().toISOString() + file.originalname);
  },
});

export const upload = multer({ storage });
