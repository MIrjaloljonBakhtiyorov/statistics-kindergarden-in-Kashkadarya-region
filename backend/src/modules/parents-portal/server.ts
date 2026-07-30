import { env } from '../../config/env.js';
import { createParentPortalApp } from './app.js';

const app = createParentPortalApp();

app.listen(env.parentPortalPort, () => {
  console.log(`Parent Portal service running on http://localhost:${env.parentPortalPort}`);
});
