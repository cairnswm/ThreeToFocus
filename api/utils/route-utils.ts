import { APIConfig, RouteGroup } from '../types';
import { exampleConfig } from '../config/api-config';

export function expandRoutes(basePath: string, group: RouteGroup, model: string, collected: APIConfig['routes'][number][]): void {
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

export function flattenConfig(config: APIConfig): APIConfig {
  const flatRoutes: APIConfig['routes'] = [];
  config.routes.forEach(route => expandRoutes(route.path, route, route.model || '', flatRoutes));
  return { models: config.models, routes: flatRoutes };
}

export function loadApiConfig(): APIConfig {
  return flattenConfig(exampleConfig);
}
