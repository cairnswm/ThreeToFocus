import { FunctionRequest } from '../types';
import { pool } from '../config/database';

export async function getUserSummary(req: FunctionRequest): Promise<any> {
  const userId = req.params.id;
  const [tickets] = await pool.execute('SELECT COUNT(*) as total FROM tickets WHERE user_id = ?', [userId]);
  const [person] = await pool.execute('SELECT * FROM person WHERE id = ?', [userId]);
  
  return {
    user: (person as any[])[0] || {},
    totalTickets: (tickets as any[])[0]?.total || 0,
    queryParams: req.queryParams || req.query,
    bodyContent: req.bodyContent || req.body,
    method: req.method
  };
}
