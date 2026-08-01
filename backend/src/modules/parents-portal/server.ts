import { env } from '../../config/env.js';
import { createParentPortalApp } from './app.js';
import { schemaReady } from '../../db/schema.js';

schemaReady
  .then(() => {
    const app = createParentPortalApp();
    app.listen(env.parentPortalPort, () => {
      console.log(`Parent Portal service running on http://localhost:${env.parentPortalPort}`);
    });
  })
  .catch((error: Error) => {
    console.error('Database schema initialization failed:', error.message);
    process.exit(1);
  });
