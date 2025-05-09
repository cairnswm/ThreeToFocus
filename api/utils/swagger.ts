import { Express } from 'express';
import swaggerUi from 'swagger-ui-express';
import { APIConfig } from '../types';

export function swaggerDocs(app: Express, config: APIConfig) {
  const paths: any = {};

  config.routes.forEach((route: any) => {
    const method = route.method.toLowerCase();
    if (!paths[route.path]) paths[route.path] = {};
    paths[route.path][method] = {
      tags: [route.model],
      responses: {
        "200": { description: `${route.operation} ${route.model}` }
      }
    };
  });

  const schemas: any = {};
  Object.entries(config.models).forEach(([modelName, props]) => {
    schemas[modelName] = {
      type: "object",
      properties: Object.fromEntries(
        Object.entries(props).map(([k, v]) => [k, { type: v }])
      )
    };
  });

  const swaggerSpec = {
    openapi: '3.0.0',
    info: {
      title: 'JSON API',
      version: '1.0.0',
    },
    paths,
    components: {
      schemas
    }
  };

  app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
}
