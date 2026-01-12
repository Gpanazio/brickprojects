import express from 'express';
import fs from 'fs';
import path from 'path';
import multer from 'multer';
import { fileURLToPath } from 'url';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const publicPath = path.join(__dirname, '../../public');

const ensureDir = (dirPath) => {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
};

const sanitizeFilename = (originalName) => {
  const timestamp = Date.now();
  const safeName = originalName
    .toLowerCase()
    .replace(/[^a-z0-9.-]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
  return `${timestamp}-${safeName}`;
};

const getUploadFolder = (req) => (req.body.folder === 'projetos' ? 'projetos' : 'assets');

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const folder = getUploadFolder(req);
    const targetDir = path.join(publicPath, folder);
    ensureDir(targetDir);
    cb(null, targetDir);
  },
  filename: (req, file, cb) => {
    cb(null, sanitizeFilename(file.originalname));
  }
});

const fileFilter = (req, file, cb) => {
  const folder = getUploadFolder(req);
  const isPdf = file.mimetype === 'application/pdf';
  const isImage = file.mimetype.startsWith('image/');

  if (folder === 'projetos' && !isPdf) {
    return cb(new Error('Apenas PDFs são permitidos na pasta de projetos.'));
  }

  if (folder === 'assets' && !isImage) {
    return cb(new Error('Apenas imagens são permitidas na pasta de assets.'));
  }

  return cb(null, true);
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 20 * 1024 * 1024 }
});

router.post('/', authenticateToken, upload.single('file'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'Arquivo não encontrado.' });
  }

  const folder = getUploadFolder(req);
  return res.json({ url: `/${folder}/${req.file.filename}` });
});

router.use((err, req, res, next) => {
  if (err) {
    return res.status(400).json({ error: err.message });
  }
  next();
});

export default router;
