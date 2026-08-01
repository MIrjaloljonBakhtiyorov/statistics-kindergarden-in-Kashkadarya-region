import { createApp } from './app.js';
import { env } from './config/env.js';
import { schemaReady } from './db/schema.js';

schemaReady
  .then(() => {
    const app = createApp();
    app.listen(env.port, () => {
      console.log(`Unified Backend running on http://localhost:${env.port}`);
    });
  })
  .catch((error: Error) => {
    console.error('Database schema initialization failed:', error.message);
    process.exit(1);
  });
