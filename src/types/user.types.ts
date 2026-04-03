export interface User {
  id: number;
  name: string;
  email: string;
  phone: string | null;
  avatarUrl: string | null;
  isActive: boolean;
  lastLoginAt: string | null;
  createdAt: string;
  roles: RoleSummary[];
}

export interface RoleSummary {
  id: number;
  name: string;
}

export interface CreateUserPayload {
  name: string;
  email: string;
  password: string;
  phone?: string;
  roleIds: number[];
}

export interface UpdateUserPayload {
  name?: string;
  email?: string;
  phone?: string;
  isActive?: boolean;
  roleIds?: number[];
}

export interface Role {
  id: number;
  name: string;
  description: string | null;
  usersCount: number;
  permissionsCount: number;
}

export interface Permission {
  id: number;
  name: string;
  description: string | null;
  module: string;
}

export interface PermissionGroup {
  module: string;
  permissions: Permission[];
}

export interface ModuleWithPermissions {
  id: number;
  name: string;
  route: string;
  icon: string;
  parentId: number | null;
  displayOrder: number;
  modulePermissions: { permissionId: number }[];
}

export interface UserEffectivePermissions {
  permissionIds: number[];
  permissions: string[];
  modules: { id: number; name: string; route: string; icon: string; parentId: number | null; displayOrder: number }[];
}
