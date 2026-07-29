import cors from 'cors';
import express from 'express';
import fs from 'fs';
import multer from 'multer';
import path from 'path';
import crypto from 'crypto';
import { fileURLToPath } from 'url';

import './db/schema.js';
import kindergartenAdminRoutes from './modules/admin/routes/kindergartenRoutes.js';
import KindergartenController from './modules/admin/controllers/kindergartenController.js';
import kindergartenSystemRoutes from './modules/kindergarten/routes/kindergartenRoutes.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const uploadsDir = path.join(__dirname, '../uploads');
const uploadBuckets = new Set(['system-assets', 'website-assets']);

const resolveUploadBucket = (value?: string) => {
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

const upload = multer({ storage });

export const createApp = () => {
  const app = express();

  app.disable('x-powered-by');
  app.use(cors());
  app.use(express.json({ limit: '50mb' }));
  app.use((err: any, _req: express.Request, res: express.Response, next: express.NextFunction) => {
    if (err instanceof SyntaxError && 'body' in err) {
      return res.status(400).json({ error: "JSON formati noto'g'ri" });
    }
    return next(err);
  });
  app.use('/uploads', express.static(uploadsDir, {
    etag: true,
    immutable: true,
    maxAge: '30d',
  }));

  const handleUploadResponse = (req: express.Request, res: express.Response) => {
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

  app.post('/api/upload', upload.single('image'), handleUploadResponse);
  app.post('/api/upload/:bucket', upload.single('image'), handleUploadResponse);

  app.get('/api/health', (_req, res) => {
    res.json({ status: 'ok', message: 'Unified Backend is running' });
  });

  app.get('/', (_req, res) => {
    res.json({ status: 'ok', service: 'raqamli-mtt-backend' });
  });

  app.get('/api/public/sites/:slug', KindergartenController.getPublicWebsiteBySlug);
  app.use('/api/kindergartens', kindergartenAdminRoutes);
  app.use('/api', kindergartenSystemRoutes);

  return app;
};
