import apiClient from './client';
import type { Role, Permission, PermissionGroup, ModuleWithPermissions, UserEffectivePermissions } from '../types';
import type { UserModule } from '../types/auth.types';

export const adminApi = {
  // Roles
  listRoles() {
    return apiClient.get<{ data: Role[] }>('/api/roles');
  },
  createRole(payload: { name: string; description?: string; permissionIds: number[] }) {
    return apiClient.post<{ data: Role }>('/api/roles', payload);
  },
  updateRole(id: number, payload: { name?: string; description?: string }) {
    return apiClient.put<{ data: Role }>(`/api/roles/${id}`, payload);
  },
  getRolePermissions(roleId: number) {
    return apiClient.get<{ data: number[] }>(`/api/roles/${roleId}/permissions`);
  },
  updateRolePermissions(roleId: number, permissionIds: number[]) {
    return apiClient.put(`/api/roles/${roleId}/permissions`, { permissionIds });
  },

  // Permissions
  listPermissions() {
    return apiClient.get<{ data: PermissionGroup[] }>('/api/permissions');
  },
  listAllPermissions() {
    return apiClient.get<{ data: Permission[] }>('/api/permissions/all');
  },
  createPermission(payload: { name: string; description: string; module: string }) {
    return apiClient.post<{ data: Permission }>('/api/permissions', payload);
  },
  updatePermission(id: number, payload: { name?: string; description?: string; module?: string }) {
    return apiClient.put<{ data: Permission }>(`/api/permissions/${id}`, payload);
  },
  deletePermission(id: number) {
    return apiClient.delete(`/api/permissions/${id}`);
  },

  // Modules
  listModules() {
    return apiClient.get<{ data: UserModule[] }>('/api/modules');
  },
  listModulesWithPermissions() {
    return apiClient.get<{ data: ModuleWithPermissions[] }>('/api/modules/with-permissions');
  },
  createModule(payload: { name: string; route: string; icon: string; parentId?: number | null; displayOrder?: number; permissionIds?: number[] }) {
    return apiClient.post<{ data: ModuleWithPermissions }>('/api/modules', payload);
  },
  updateModule(id: number, payload: { name?: string; route?: string; icon?: string; parentId?: number | null; displayOrder?: number; permissionIds?: number[] }) {
    return apiClient.put<{ data: ModuleWithPermissions }>(`/api/modules/${id}`, payload);
  },
  deleteModule(id: number) {
    return apiClient.delete(`/api/modules/${id}`);
  },

  // User effective permissions
  getUserEffectivePermissions(userId: number) {
    return apiClient.get<{ data: UserEffectivePermissions }>(`/api/users/${userId}/effective-permissions`);
  },
};
