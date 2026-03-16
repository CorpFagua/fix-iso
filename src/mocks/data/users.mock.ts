import type { AuthUser } from '../../types';
import type { User } from '../../types';
import { mockCompanyUsers } from './companies.mock';

export const mockUsers: User[] = [
  {
    id: 1, name: 'Carlos Mendoza', email: 'admin@fixiso.com', phone: '+57 310 555 1234',
    avatarUrl: null, isActive: true, lastLoginAt: '2026-03-15T14:30:00Z', createdAt: '2025-01-10T08:00:00Z',
    roles: [{ id: 1, name: 'super_admin' }],
  },
  {
    id: 2, name: 'Laura García', email: 'laura.garcia@empresa.com', phone: '+57 311 555 5678',
    avatarUrl: null, isActive: true, lastLoginAt: '2026-03-14T09:15:00Z', createdAt: '2025-02-15T10:00:00Z',
    roles: [{ id: 2, name: 'admin' }],
  },
  {
    id: 3, name: 'Andrés Rojas', email: 'andres.rojas@empresa.com', phone: '+57 312 555 9012',
    avatarUrl: null, isActive: true, lastLoginAt: '2026-03-13T16:45:00Z', createdAt: '2025-03-20T12:00:00Z',
    roles: [{ id: 3, name: 'auditor' }],
  },
  {
    id: 4, name: 'Diana Torres', email: 'diana.torres@empresa.com', phone: null,
    avatarUrl: null, isActive: true, lastLoginAt: '2026-03-12T11:00:00Z', createdAt: '2025-04-05T09:00:00Z',
    roles: [{ id: 4, name: 'consultant' }],
  },
  {
    id: 5, name: 'Miguel Sánchez', email: 'miguel.sanchez@empresa.com', phone: '+57 315 555 3456',
    avatarUrl: null, isActive: true, lastLoginAt: '2026-03-10T08:30:00Z', createdAt: '2025-05-12T14:00:00Z',
    roles: [{ id: 5, name: 'employee' }],
  },
  {
    id: 6, name: 'Paola Ramírez', email: 'paola.ramirez@empresa.com', phone: null,
    avatarUrl: null, isActive: false, lastLoginAt: '2026-01-20T10:00:00Z', createdAt: '2025-06-01T08:00:00Z',
    roles: [{ id: 5, name: 'employee' }],
  },
];

const allModules = [
  { id: 1, name: 'Dashboard', route: '/dashboard', icon: 'DashboardOutlined', parentId: null, displayOrder: 1 },
  { id: 8, name: 'Empresas', route: '/companies', icon: 'BankOutlined', parentId: null, displayOrder: 2 },
  { id: 2, name: 'Controles ISO', route: '/controls', icon: 'SafetyOutlined', parentId: null, displayOrder: 3 },
  { id: 3, name: 'Declaración de Aplicabilidad', route: '/soa', icon: 'FileProtectOutlined', parentId: null, displayOrder: 4 },
  { id: 4, name: 'Activos', route: '/assets', icon: 'DatabaseOutlined', parentId: null, displayOrder: 5 },
  { id: 5, name: 'Administración', route: '/admin', icon: 'SettingOutlined', parentId: null, displayOrder: 6 },
  { id: 6, name: 'Usuarios', route: '/admin/users', icon: 'TeamOutlined', parentId: 5, displayOrder: 1 },
  { id: 7, name: 'Roles y Permisos', route: '/admin/roles', icon: 'LockOutlined', parentId: 5, displayOrder: 2 },
];

const allPermissions = [
  'dashboard:read',
  'companies:read', 'companies:create', 'companies:update', 'companies:delete',
  'controls:read', 'controls:create', 'controls:update', 'controls:delete', 'controls:export',
  'soa:read', 'soa:update',
  'assets:read', 'assets:create', 'assets:update', 'assets:delete',
  'users:read', 'users:create', 'users:update', 'users:delete',
  'roles:read', 'roles:create', 'roles:update', 'roles:delete',
  'audits:read', 'audits:create', 'audits:update',
  'risk:read', 'risk:create', 'risk:update',
  'evidence:read', 'evidence:create', 'evidence:delete',
  'audit_log:read',
  'notifications:read',
];

const permissionsByRole: Record<string, string[]> = {
  super_admin: allPermissions,
  admin: allPermissions.filter(p => !p.startsWith('audit_log')),
  auditor: [
    'dashboard:read', 'companies:read', 'controls:read', 'controls:export', 'soa:read',
    'assets:read', 'audits:read', 'audits:create', 'audits:update',
    'risk:read', 'evidence:read', 'notifications:read',
  ],
  consultant: [
    'dashboard:read', 'companies:read', 'controls:read', 'controls:update', 'controls:export',
    'soa:read', 'soa:update', 'assets:read', 'assets:create', 'assets:update',
    'risk:read', 'risk:create', 'risk:update', 'evidence:read', 'evidence:create',
    'notifications:read',
  ],
  employee: [
    'dashboard:read', 'controls:read', 'assets:read', 'evidence:read',
    'evidence:create', 'notifications:read',
  ],
};

const modulesByRole: Record<string, number[]> = {
  super_admin: [1, 2, 3, 4, 5, 6, 7, 8],
  admin: [1, 2, 3, 4, 5, 6, 7, 8],
  auditor: [1, 2, 3, 4, 8],
  consultant: [1, 2, 3, 4, 8],
  employee: [1, 2, 4],
};

export function getAuthUser(userId: number): AuthUser | null {
  const user = mockUsers.find(u => u.id === userId);
  if (!user) return null;
  const roleName = user.roles[0]?.name ?? 'employee';
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    avatarUrl: user.avatarUrl,
    roles: user.roles.map(r => r.name),
    permissions: permissionsByRole[roleName] ?? [],
    modules: allModules.filter(m => (modulesByRole[roleName] ?? []).includes(m.id)),
    assignedCompanyIds: mockCompanyUsers.filter(cu => cu.userId === user.id).map(cu => cu.companyId),
  };
}

export { allModules, allPermissions, permissionsByRole };
