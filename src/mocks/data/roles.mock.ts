import type { Role, Permission, PermissionGroup } from '../../types';

export const mockRoles: Role[] = [
  { id: 1, name: 'super_admin', description: 'Acceso total al sistema, gestión de plataforma', usersCount: 1, permissionsCount: 28 },
  { id: 2, name: 'admin', description: 'Administrador de empresa, gestiona usuarios y configuración', usersCount: 1, permissionsCount: 26 },
  { id: 3, name: 'auditor', description: 'Realiza auditorías internas, acceso de lectura amplio', usersCount: 1, permissionsCount: 11 },
  { id: 4, name: 'consultant', description: 'Consultor ISO, gestiona controles, riesgos y SoA', usersCount: 1, permissionsCount: 15 },
  { id: 5, name: 'employee', description: 'Empleado base, acceso limitado a tareas asignadas', usersCount: 2, permissionsCount: 6 },
];

export const mockPermissions: Permission[] = [
  { id: 1, name: 'dashboard:read', description: 'Ver panel de control', module: 'dashboard' },
  { id: 2, name: 'controls:read', description: 'Ver controles ISO', module: 'controls' },
  { id: 3, name: 'controls:create', description: 'Crear controles', module: 'controls' },
  { id: 4, name: 'controls:update', description: 'Actualizar controles', module: 'controls' },
  { id: 5, name: 'controls:delete', description: 'Eliminar controles', module: 'controls' },
  { id: 6, name: 'controls:export', description: 'Exportar controles', module: 'controls' },
  { id: 7, name: 'soa:read', description: 'Ver declaración de aplicabilidad', module: 'soa' },
  { id: 8, name: 'soa:update', description: 'Actualizar declaración de aplicabilidad', module: 'soa' },
  { id: 9, name: 'assets:read', description: 'Ver activos', module: 'assets' },
  { id: 10, name: 'assets:create', description: 'Crear activos', module: 'assets' },
  { id: 11, name: 'assets:update', description: 'Actualizar activos', module: 'assets' },
  { id: 12, name: 'assets:delete', description: 'Eliminar activos', module: 'assets' },
  { id: 13, name: 'users:read', description: 'Ver usuarios', module: 'users' },
  { id: 14, name: 'users:create', description: 'Crear usuarios', module: 'users' },
  { id: 15, name: 'users:update', description: 'Actualizar usuarios', module: 'users' },
  { id: 16, name: 'users:delete', description: 'Desactivar usuarios', module: 'users' },
  { id: 17, name: 'roles:read', description: 'Ver roles', module: 'roles' },
  { id: 18, name: 'roles:create', description: 'Crear roles', module: 'roles' },
  { id: 19, name: 'roles:update', description: 'Actualizar roles', module: 'roles' },
  { id: 20, name: 'roles:delete', description: 'Eliminar roles', module: 'roles' },
  { id: 21, name: 'audits:read', description: 'Ver auditorías', module: 'audits' },
  { id: 22, name: 'audits:create', description: 'Crear auditorías', module: 'audits' },
  { id: 23, name: 'audits:update', description: 'Actualizar auditorías', module: 'audits' },
  { id: 24, name: 'risk:read', description: 'Ver evaluaciones de riesgo', module: 'risk' },
  { id: 25, name: 'risk:create', description: 'Crear evaluaciones de riesgo', module: 'risk' },
  { id: 26, name: 'risk:update', description: 'Actualizar evaluaciones de riesgo', module: 'risk' },
  { id: 27, name: 'evidence:read', description: 'Ver evidencias', module: 'evidence' },
  { id: 28, name: 'evidence:create', description: 'Subir evidencias', module: 'evidence' },
  { id: 29, name: 'evidence:delete', description: 'Eliminar evidencias', module: 'evidence' },
  { id: 30, name: 'audit_log:read', description: 'Ver registro de auditoría del sistema', module: 'audit_log' },
  { id: 31, name: 'notifications:read', description: 'Ver notificaciones', module: 'notifications' },
];

export const mockPermissionGroups: PermissionGroup[] = Array.from(
  new Set(mockPermissions.map(p => p.module)),
).map(mod => ({
  module: mod,
  permissions: mockPermissions.filter(p => p.module === mod),
}));

export const mockRolePermissions: Record<number, number[]> = {
  1: mockPermissions.map(p => p.id),
  2: mockPermissions.filter(p => p.module !== 'audit_log').map(p => p.id),
  3: [1, 2, 6, 7, 9, 21, 22, 23, 24, 27, 31],
  4: [1, 2, 4, 6, 7, 8, 9, 10, 11, 24, 25, 26, 27, 28, 31],
  5: [1, 2, 9, 27, 28, 31],
};
