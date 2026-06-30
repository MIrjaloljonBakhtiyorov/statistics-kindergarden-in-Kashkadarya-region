import cors from 'cors';
import express from 'express';
import fs from 'fs';
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';

import './db/schema.js';
import kindergartenAdminRoutes from './modules/admin/routes/kindergartenRoutes.js';
import kindergartenSystemRoutes from './modules/kindergarten/routes/kindergartenRoutes.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const uploadsDir = path.join(__dirname, '../uploads');

fs.mkdirSync(uploadsDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (_req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});

const upload = multer({ storage });

export const createApp = () => {
  const app = express();

  app.use(cors());
  app.use(express.json({ limit: '50mb' }));
  app.use((err: any, _req: express.Request, res: express.Response, next: express.NextFunction) => {
    if (err instanceof SyntaxError && 'body' in err) {
      return res.status(400).json({ error: "JSON formati noto'g'ri" });
    }
    return next(err);
  });
  app.use('/uploads', express.static(uploadsDir));

  app.post('/api/upload', upload.single('image'), (req, res) => {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }
    return res.json({ url: `/uploads/${req.file.filename}` });
  });

  app.get('/api/health', (_req, res) => {
    res.json({ status: 'ok', message: 'Unified Backend is running' });
  });

  app.use('/api/kindergartens', kindergartenAdminRoutes);
  app.use('/api', kindergartenSystemRoutes);

  return app;
};
