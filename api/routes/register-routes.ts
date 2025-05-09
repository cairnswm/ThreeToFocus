import { Express, Request, Response } from 'express';
import { APIConfig, FunctionRequest } from '../types';
import { pool } from '../config/database';
import { authorizeRequest } from '../middleware/security';
import { getUserSummary } from '../functions/user-functions';

export function registerRoutes(app: Express, config: APIConfig) {
  const functionMap: Record<string, (req: FunctionRequest) => Promise<any>> = {
    getUserSummary
  };

  config.routes.forEach(route => {
    const handler = async (req: Request, res: Response) => {
      if (!(await authorizeRequest(req, route, pool))) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      if (!route.model) {
        return res.status(400).json({ error: 'Model not specified for route' });
      }
      
      const table = route.model.toLowerCase();
      
      if (route.handlerFunction && functionMap[route.handlerFunction]) {
        const func = functionMap[route.handlerFunction];
        const funcReq = req as FunctionRequest;
        funcReq.queryParams = req.query;
        funcReq.bodyContent = req.body;
        
        const result = await func(funcReq);
        return res.status(200).json(result);
      }
      
      try {
        switch (route.operation) {
          case 'create': {
            if (!route.model || !config.models[route.model]) {
              return res.status(400).json({ error: 'Invalid model' });
            }
            
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
            if (!route.model || !config.models[route.model]) {
              return res.status(400).json({ error: 'Invalid model' });
            }
            
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
    if (route.method && route.path) {
      (app as any)[route.method](route.path, handler);
    }
  });
}
