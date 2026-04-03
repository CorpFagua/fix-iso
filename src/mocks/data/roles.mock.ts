import type { Role, Permission, PermissionGroup } from '../../types';

export const mockRoles: Role[] = [
  { id: 1, name: 'super_admin', description: 'Acceso total al sistema, gestión de plataforma', usersCount: 1, permissionsCount: 37 },
  { id: 2, name: 'admin', description: 'Administrador de empresa, gestiona usuarios y configuración', usersCount: 1, permissionsCount: 30 },
  { id: 3, name: 'auditor', description: 'Realiza auditorías internas, acceso de lectura amplio', usersCount: 1, permissionsCount: 12 },
  { id: 4, name: 'consultant', description: 'Consultor ISO, gestiona controles, riesgos y SoA', usersCount: 1, permissionsCount: 16 },
  { id: 5, name: 'employee', description: 'Empleado base, acceso limitado a tareas asignadas', usersCount: 2, permissionsCount: 6 },
];

export const mockPermissions: Permission[] = [
  { id: 1, name: 'dashboard:read', description: 'Ver panel de control', module: 'dashboard' },
  { id: 2, name: 'companies:read', description: 'Ver empresas', module: 'companies' },
  { id: 3, name: 'companies:create', description: 'Crear empresas', module: 'companies' },
  { id: 4, name: 'companies:update', description: 'Actualizar empresas', module: 'companies' },
  { id: 5, name: 'companies:delete', description: 'Eliminar empresas', module: 'companies' },
  { id: 6, name: 'controls:read', description: 'Ver controles ISO', module: 'controls' },
  { id: 7, name: 'controls:create', description: 'Crear controles', module: 'controls' },
  { id: 8, name: 'controls:update', description: 'Actualizar controles', module: 'controls' },
  { id: 9, name: 'controls:delete', description: 'Eliminar controles', module: 'controls' },
  { id: 10, name: 'controls:export', description: 'Exportar controles', module: 'controls' },
  { id: 11, name: 'soa:read', description: 'Ver declaración de aplicabilidad', module: 'soa' },
  { id: 12, name: 'soa:update', description: 'Actualizar declaración de aplicabilidad', module: 'soa' },
  { id: 13, name: 'assets:read', description: 'Ver activos', module: 'assets' },
  { id: 14, name: 'assets:create', description: 'Crear activos', module: 'assets' },
  { id: 15, name: 'assets:update', description: 'Actualizar activos', module: 'assets' },
  { id: 16, name: 'assets:delete', description: 'Eliminar activos', module: 'assets' },
  { id: 17, name: 'users:read', description: 'Ver usuarios', module: 'users' },
  { id: 18, name: 'users:create', description: 'Crear usuarios', module: 'users' },
  { id: 19, name: 'users:update', description: 'Actualizar usuarios', module: 'users' },
  { id: 20, name: 'users:delete', description: 'Desactivar usuarios', module: 'users' },
  { id: 21, name: 'roles:read', description: 'Ver roles', module: 'roles' },
  { id: 22, name: 'roles:create', description: 'Crear roles', module: 'roles' },
  { id: 23, name: 'roles:update', description: 'Actualizar roles', module: 'roles' },
  { id: 24, name: 'roles:delete', description: 'Eliminar roles', module: 'roles' },
  { id: 25, name: 'audits:read', description: 'Ver auditorías', module: 'audits' },
  { id: 26, name: 'audits:create', description: 'Crear auditorías', module: 'audits' },
  { id: 27, name: 'audits:update', description: 'Actualizar auditorías', module: 'audits' },
  { id: 28, name: 'risk:read', description: 'Ver evaluaciones de riesgo', module: 'risk' },
  { id: 29, name: 'risk:create', description: 'Crear evaluaciones de riesgo', module: 'risk' },
  { id: 30, name: 'risk:update', description: 'Actualizar evaluaciones de riesgo', module: 'risk' },
  { id: 31, name: 'evidence:read', description: 'Ver evidencias', module: 'evidence' },
  { id: 32, name: 'evidence:create', description: 'Subir evidencias', module: 'evidence' },
  { id: 33, name: 'evidence:delete', description: 'Eliminar evidencias', module: 'evidence' },
  { id: 34, name: 'audit_log:read', description: 'Ver registro de auditoría del sistema', module: 'audit_log' },
  { id: 35, name: 'notifications:read', description: 'Ver notificaciones', module: 'notifications' },
  { id: 36, name: 'modules:manage', description: 'Gestionar módulos del sistema', module: 'modules' },
  { id: 37, name: 'permissions:manage', description: 'Gestionar permisos del sistema', module: 'permissions' },
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
  3: [1, 2, 6, 10, 11, 13, 25, 26, 27, 28, 31, 35],
  4: [1, 2, 6, 8, 10, 11, 12, 13, 14, 15, 28, 29, 30, 31, 32, 35],
  5: [1, 6, 13, 31, 32, 35],
};
