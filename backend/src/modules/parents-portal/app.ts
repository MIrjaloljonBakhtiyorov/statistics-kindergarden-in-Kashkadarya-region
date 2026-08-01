import cors from 'cors';
import express from 'express';

import { schemaReady } from '../../db/schema.js';
import { authRoutes } from '../kindergarten/routes/auth.routes.js';
import { messagesRoutes } from '../kindergarten/routes/messages.routes.js';
import { handleUploadResponse, upload, uploadsDir } from '../shared/upload.js';
import { parentsRoutes } from './parentPortal.routes.js';

export { schemaReady };

export const createParentPortalApp = () => {
  const app = express();

  app.disable('x-powered-by');
  app.use(cors());
  app.use(express.json({ limit: '10mb' }));
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

  app.get('/', (_req, res) => {
    res.json({ status: 'ok', service: 'parent-portal-service' });
  });
  app.get('/api/health', (_req, res) => {
    res.json({ status: 'ok', service: 'parent-portal-service' });
  });
  app.get('/api/parent-portal/health', (_req, res) => {
    res.json({ status: 'ok', service: 'parent-portal-service' });
  });

  app.post('/api/upload', upload.single('image'), handleUploadResponse);
  app.post('/api/upload/:bucket', upload.single('image'), handleUploadResponse);
  app.use('/api', authRoutes);
  app.use('/api', parentsRoutes);
  app.use('/api', messagesRoutes);

  return app;
};
