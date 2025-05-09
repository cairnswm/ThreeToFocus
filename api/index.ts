import express from 'express';
import { loadApiConfig } from './utils/route-utils';
import { registerRoutes } from './routes/register-routes';
import { swaggerDocs } from './utils/swagger';

const app = express();
app.use(express.json());

const config = loadApiConfig();
registerRoutes(app, config);
swaggerDocs(app, config);

app.listen(3000, () => {
  console.log(`API running at http://localhost:3000`);
});
