import express, { Request } from 'express';
import multer from 'multer';
import path from 'path';

const router = express.Router();

// Set up storage
const storage = multer.diskStorage({
  destination: (req: Request, file: Express.Multer.File, cb: (error: Error | null, destination: string) => void) => {
    cb(null, path.join(__dirname, '../../uploads'));
  },
  filename: (req: Request, file: Express.Multer.File, cb: (error: Error | null, filename: string) => void) => {
    cb(null, Date.now() + '-' + file.originalname);
  }
});

const upload = multer({ storage });

// POST /api/upload
router.post('/', upload.single('file'), (req: Request, res) => {
  const file = req.file as Express.Multer.File;
  if (!file) {
    return res.status(400).json({ message: 'No file uploaded' });
  }
  res.json({ filename: file.filename, path: `/uploads/${file.filename}` });
});

export default router; 