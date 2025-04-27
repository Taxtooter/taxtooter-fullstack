import express, { Request } from 'express';
import multer from 'multer';
import path from 'path';

const router = express.Router();

// Set up storage
const storage = multer.diskStorage({
  // @ts-ignore
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '../../uploads'));
  },
  // @ts-ignore
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname);
  }
});

const upload = multer({ storage });

// POST /api/upload
router.post('/', upload.single('file'), (req: Request, res) => {
  // @ts-ignore
  const file = req.file;
  if (!file) {
    return res.status(400).json({ message: 'No file uploaded' });
  }
  res.json({ filename: file.filename, path: `/uploads/${file.filename}` });
});

export default router; 