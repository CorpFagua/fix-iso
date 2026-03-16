import apiClient from './client';
import type { Role, Permission, PermissionGroup } from '../types';
import type { UserModule } from '../types/auth.types';

export const adminApi = {
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
  listPermissions() {
    return apiClient.get<{ data: PermissionGroup[] }>('/api/permissions');
  },
  listAllPermissions() {
    return apiClient.get<{ data: Permission[] }>('/api/permissions/all');
  },
  listModules() {
    return apiClient.get<{ data: UserModule[] }>('/api/modules');
  },
};
