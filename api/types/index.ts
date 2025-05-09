import { Request } from 'express';

export interface APIConfig {
  models: Record<string, Record<string, string>>;
  routes: RouteGroup[];
}

export interface RouteGroup {
  path: string;
  model?: string;
  method?: string;
  operation?: string;
  actions?: Partial<Record<
    'list' | 'get' | 'create' | 'update' | 'delete' | 'sublist' | 'custom' | 'function',
    Partial<RouteConfig>
  >>;
  routes?: RouteGroup[];
  secured?: boolean | string;
  ownershipCheckField?: string;
  updateFields?: string[];
  customQuery?: string;
  handlerFunction?: string;
  parentKey?: string;
}

export interface RouteConfig {
  secured?: boolean | string;
  ownershipCheckField?: string;
  updateFields?: string[];
  customQuery?: string;
  handlerFunction?: string;
  parentKey?: string;
}

export interface FunctionRequest extends Request {
  queryParams?: Record<string, unknown>;
  bodyContent?: Record<string, unknown>;
  user?: Record<string, unknown>;
}
