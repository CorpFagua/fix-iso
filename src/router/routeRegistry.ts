import { lazy, type ComponentType } from 'react';

export interface RouteEntry {
  component: React.LazyExoticComponent<ComponentType<unknown>>;
  permission?: string;
}

/**
 * Registro dinámico de rutas.
 *
 * Cuando agregas una nueva pantalla al sistema:
 * 1. Crea tu componente en src/pages/
 * 2. Regístralo aquí con lazy(() => import(...))
 * 3. Ve a /admin/modules y crea el módulo (nombre, ruta, icono, permisos)
 * 4. Asigna los permisos necesarios a los roles correspondientes
 *
 * La ruta (key) debe coincidir EXACTAMENTE con la ruta que registres en el módulo.
 * El campo `permission` se usa para PermissionGuard automático.
 *
 * Ejemplo:
 *   '/reports': {
 *     component: lazy(() => import('../pages/reports/ReportsPage')),
 *     permission: 'reports:read',
 *   },
 */
export const routeRegistry: Record<string, RouteEntry> = {
  // ── Rutas dinámicas: agrega nuevas pantallas aquí ──
  // '/reports': {
  //   component: lazy(() => import('../pages/reports/ReportsPage')),
  //   permission: 'reports:read',
  // },
};
