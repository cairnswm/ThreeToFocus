import { Request } from 'express';
import jwt from 'jsonwebtoken';
import mysql from 'mysql2/promise';
import { RouteConfig } from '../types';
import { pool } from '../config/database';

export async function checkApiSecurity(req: Request, userId: string): Promise<boolean> {
  const userRole = await getUserRole(userId);
  return userRole === 'admin' || userRole === 'manager';
}

export async function getUserRole(userId: string): Promise<string> {
  return 'user';
}

export async function authorizeRequest(req: Request, routeConfig: any, pool: mysql.Pool): Promise<boolean> {
  if (routeConfig?.secured === false) return true;
  
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) return false;
  
  try {
    const decoded = jwt.verify(token, 'your-secret-key');
    (req as any).user = decoded;
    const userId = (decoded as any).id;

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
    
    if (routeConfig?.ownershipCheckField && req.params.id) {
      const table = routeConfig.model?.toLowerCase();
      const [rows] = await pool.execute(
        `SELECT ${routeConfig.ownershipCheckField} FROM ${table} WHERE id = ?`,
        [req.params.id]
      );
      const ownerId = (rows as any[])[0]?.[routeConfig.ownershipCheckField];
      return ownerId == userId;
    }
    
    return true;
  } catch (err) {
    return false;
  }
}
