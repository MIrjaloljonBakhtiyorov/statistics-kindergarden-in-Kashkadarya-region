import crypto from 'crypto';
import { Request, Response } from 'express';
import fs from 'fs';
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const uploadsDir = path.join(__dirname, '../../../uploads');

const uploadBuckets = new Set(['system-assets', 'website-assets']);

export const resolveUploadBucket = (value?: string) => {
  const bucket = String(value || 'system-assets')
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9-]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-+|-+$/g, '');

  return uploadBuckets.has(bucket) ? bucket : 'system-assets';
};

const ensureUploadFolders = () => {
  fs.mkdirSync(uploadsDir, { recursive: true });
  for (const bucket of uploadBuckets) {
    fs.mkdirSync(path.join(uploadsDir, bucket), { recursive: true });
  }
};

const safeUploadFileName = (file: Express.Multer.File) => {
  const ext = path.extname(file.originalname || '').toLowerCase().replace(/[^a-z0-9.]/g, '');
  const baseName = path
    .basename(file.originalname || 'file', ext)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 48) || 'file';

  return `${Date.now()}-${crypto.randomUUID()}-${baseName}${ext}`;
};

ensureUploadFolders();

const storage = multer.diskStorage({
  destination: (req, _file, cb) => {
    const bucket = resolveUploadBucket(req.params.bucket || req.body?.bucket);
    const targetDir = path.join(uploadsDir, bucket);
    fs.mkdirSync(targetDir, { recursive: true });
    cb(null, targetDir);
  },
  filename: (_req, file, cb) => {
    cb(null, safeUploadFileName(file));
  },
});

export const upload = multer({ storage });

export const handleUploadResponse = (req: Request, res: Response) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }
  const bucket = resolveUploadBucket(req.params.bucket || req.body?.bucket);
  return res.json({
    url: `/uploads/${bucket}/${req.file.filename}`,
    bucket,
    filename: req.file.filename,
  });
};
