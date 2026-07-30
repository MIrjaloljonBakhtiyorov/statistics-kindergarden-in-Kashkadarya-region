import cors from 'cors';
import express from 'express';

import './db/schema.js';
import kindergartenAdminRoutes from './modules/admin/routes/kindergartenRoutes.js';
import KindergartenController from './modules/admin/controllers/kindergartenController.js';
import kindergartenSystemRoutes from './modules/kindergarten/routes/kindergartenRoutes.js';
import { handleUploadResponse, upload, uploadsDir } from './modules/shared/upload.js';

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
