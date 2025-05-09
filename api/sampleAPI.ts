// single-file-api.ts
import express, { Express, Request, Response, NextFunction } from 'express';
import swaggerUi from 'swagger-ui-express';
import mysql from 'mysql2/promise';
import jwt from 'jsonwebtoken';

interface APIConfig {
  models: Record<string, Record<string, string>>;
  routes: RouteGroup[];
}

interface RouteGroup {
  path: string;
  model?: string;
  actions?: Record<
    'list' | 'get' | 'create' | 'update' | 'delete' | 'sublist' | 'custom' | 'function',
    Partial<RouteConfig>
  >;
  routes?: RouteGroup[];
}

interface RouteConfig {
  secured?: boolean | string;
  ownershipCheckField?: string;
  updateFields?: string[];
  customQuery?: string;
  handlerFunction?: string;
  parentKey?: string;
}

interface FunctionRequest extends Request {
  queryParams?: any;
  bodyContent?: any;
}

const pool = mysql.createPool({
  host: 'localhost',
  user: 'root',
  password: 'password',
  database: 'mydb',
});

async function checkApiSecurity(req: Request, userId: string): Promise<boolean> {
  // Example custom security function
  // This could check specific permissions, roles, or other conditions
  const userRole = await getUserRole(userId);
  return userRole === 'admin' || userRole === 'manager';
}

async function getUserRole(userId: string): Promise<string> {
  // Mock function to get user role
  // In a real app, this would query a database
  return 'user';
}

async function authorizeRequest(req: Request, routeConfig: any, pool: mysql.Pool): Promise<boolean> {
  // If secured is explicitly set to false, allow access
  if (routeConfig?.secured === false) return true;
  
  // Default is secured (even if not specified)
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) return false;
  
  try {
    const decoded = jwt.verify(token, 'your-secret-key');
    (req as any).user = decoded;
    const userId = (decoded as any).id;

    // If secured is a string, it's a custom security function name
    if (typeof routeConfig?.secured === 'string') {
      const securityFunctionName = routeConfig.secured;
      const securityFunctions: Record<string, (req: Request, userId: string) => Promise<boolean>> = {
        checkApiSecurity
      };
      
      if (!securityFunctions[securityFunctionName]) {
        throw new Error(`Security function '${securityFunctionName}' not found.`);
      }
      
      return await securityFunctions[securityFunctionName](req, userId);
    }
    
    // Standard ownership check
    if (routeConfig?.ownershipCheckField && req.params.id) {
      const table = routeConfig.model?.toLowerCase();
      const [rows] = await pool.execute(
        `SELECT ${routeConfig.ownershipCheckField} FROM ${table} WHERE id = ?`,
        [req.params.id]
      );
      const ownerId = (rows as any[])[0]?.[routeConfig.ownershipCheckField];
      return ownerId == userId;
    }
    
    // Default to allowing access if authenticated
    return true;
  } catch (err) {
    return false;
  }
}

async function getUserSummary(req: FunctionRequest): Promise<any> {
  const userId = req.params.id;
  const [tickets] = await pool.execute('SELECT COUNT(*) as total FROM tickets WHERE user_id = ?', [userId]);
  const [person] = await pool.execute('SELECT * FROM person WHERE id = ?', [userId]);
  
  // Include query parameters and body content in the response if available
  return {
    user: (person as any[])[0] || {},
    totalTickets: (tickets as any[])[0]?.total || 0,
    queryParams: req.queryParams || req.query,
    bodyContent: req.bodyContent || req.body,
    method: req.method
  };
}

const exampleConfig: APIConfig = {
  models: {
    Person: { id: "number", name: "string" },
    Ticket: { id: "number", user_id: "number", subject: "string" },
    Event: { id: "number", title: "string" }
  },
  routes: [
    {
      path: "/people",
      model: "Person",
      actions: {
        // Public list endpoint - explicitly unsecured
        list: { secured: false },
        // Create is secured by default (no need to specify secured: true)
        create: {}
      },
      routes: [
        {
          path: ":id",
          actions: {
            // Function with default security
            get: { handlerFunction: "getUserSummary" },
            // Standard security with ownership check
            update: { ownershipCheckField: "id", updateFields: ["name"] },
            // Custom security function
            delete: { secured: "checkApiSecurity", ownershipCheckField: "id" }
          },
          routes: [
            {
              path: "tickets",
              model: "Ticket",
              actions: {
                // Public sublist - explicitly unsecured
                sublist: { parentKey: "user_id", secured: false },
                // Default security
                create: {},
                // Standard security with ownership check
                delete: { ownershipCheckField: "user_id" },
                custom: {
                  customQuery: "SELECT DATE(created_at) as day, COUNT(*) as count FROM tickets WHERE user_id = ? GROUP BY day ORDER BY day"
                }
              }
            }
          ]
        }
      ]
    },
    {
      path: "/tickets/:id",
      model: "Ticket",
      actions: {
        // Public get endpoint
        get: { secured: false },
        // Function with default security
        create: { handlerFunction: "getUserSummary" },
        // Function with standard security and ownership check
        update: { ownershipCheckField: "user_id", updateFields: ["subject"], handlerFunction: "getUserSummary" },
        // Function with custom security
        delete: { secured: "checkApiSecurity", ownershipCheckField: "user_id", handlerFunction: "getUserSummary" }
      }
    },
    {
      path: "/events",
      model: "Event",
      routes: [
        {
          path: ":id/tickets",
          model: "Ticket",
          actions: {
            // Default security (secured: true)
            sublist: { parentKey: "event_id" }
          }
        }
      ]
    }
  ]
};

function expandRoutes(basePath: string, group: RouteGroup, model: string, collected: APIConfig['routes'][number][]): void {
  if (group.actions) {
    Object.entries(group.actions).forEach(([operation, cfg]) => {
      const method = operation === 'create' ? 'post' :
                     operation === 'update' ? 'put' :
                     operation === 'delete' ? 'delete' :
                     'get';
      collected.push({
        path: `${basePath}`,
        method,
        model: group.model || model,
        operation: operation as any,
        ...cfg
      });
    });
  }
  group.routes?.forEach(child => {
    expandRoutes(`${basePath}/${child.path}`, child, child.model || model, collected);
  });
}

function flattenConfig(config: APIConfig): APIConfig {
  const flatRoutes: APIConfig['routes'] = [];
  config.routes.forEach(route => expandRoutes(route.path, route, route.model || '', flatRoutes));
  return { models: config.models, routes: flatRoutes };
}

function loadApiConfig(): APIConfig {
  return flattenConfig(exampleConfig);
}

function registerRoutes(app: Express, config: APIConfig) {
  const functionMap: Record<string, (req: FunctionRequest) => Promise<any>> = {
    getUserSummary
  };

  config.routes.forEach(route => {
    const handler = async (req: Request, res: Response) => {
      if (!(await authorizeRequest(req, route, pool))) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const table = route.model.toLowerCase();
      
      // Check if this route has a handler function
      if (route.handlerFunction && functionMap[route.handlerFunction]) {
        const func = functionMap[route.handlerFunction];
        // Prepare request with query params and body content
        const funcReq = req as FunctionRequest;
        funcReq.queryParams = req.query;
        funcReq.bodyContent = req.body;
        
        const result = await func(funcReq);
        return res.status(200).json(result);
      }
      
      try {
        switch (route.operation) {
          case 'create': {
            const keys = Object.keys(config.models[route.model]).filter(k => k !== 'id');
            const values = keys.map(k => req.body[k]);
            const [result] = await pool.execute(
              `INSERT INTO ${table} (${keys.join(',')}) VALUES (${keys.map(() => '?').join(',')})`,
              values
            );
            const insertId = (result as any).insertId;
            res.status(201).json({ id: insertId, ...req.body });
            break;
          }
          case 'update': {
            const allowed = route.updateFields ?? Object.keys(config.models[route.model]).filter(k => k !== 'id');
            const keys = Object.keys(req.body).filter(k => allowed.includes(k));
            const values = keys.map(k => req.body[k]);
            values.push(req.params.id);
            await pool.execute(
              `UPDATE ${table} SET ${keys.map(k => `${k}=?`).join(',')} WHERE id = ?`,
              values
            );
            res.status(200).json({ id: req.params.id, ...req.body });
            break;
          }
          case 'delete': {
            await pool.execute(`DELETE FROM ${table} WHERE id = ?`, [req.params.id]);
            res.status(204).send();
            break;
          }
          case 'get': {
            const [rows] = await pool.execute(`SELECT * FROM ${table} WHERE id = ?`, [req.params.id]);
            if ((rows as any[]).length === 0) {
              res.status(404).json({ error: 'Not found' });
            } else {
              res.status(200).json((rows as any[])[0]);
            }
            break;
          }
          case 'sublist': {
            const key = route.parentKey || 'user_id';
            const [rows] = await pool.execute(`SELECT * FROM ${table} WHERE ${key} = ?`, [req.params.id]);
            res.status(200).json(rows);
            break;
          }
          case 'custom': {
            const [rows] = await pool.execute(route.customQuery || '', [req.params.id]);
            res.status(200).json(rows);
            break;
          }
          case 'function': {
            const func = route.handlerFunction && functionMap[route.handlerFunction];
            if (!func) {
              throw new Error(`Handler function '${route.handlerFunction}' not found.`);
            }
            const funcReq = req as FunctionRequest;
            funcReq.queryParams = req.query;
            funcReq.bodyContent = req.body;
            
            const result = await func(funcReq);
            res.status(200).json(result);
            break;
          }
          default: {
            const [rows] = await pool.execute(`SELECT * FROM ${table}`);
            res.json(rows);
          }
        }
      } catch (err: any) {
        res.status(500).json({ error: err.message });
      }
    };
    (app as any)[route.method](route.path, handler);
  });
}

function swaggerDocs(app: Express, config: APIConfig) {
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

const app = express();
app.use(express.json());

const config = loadApiConfig();
registerRoutes(app, config);
swaggerDocs(app, config);

app.listen(3000, () => {
  console.log(`API running at http://localhost:3000`);
});
