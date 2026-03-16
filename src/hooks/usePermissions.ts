import { useCallback } from 'react';
import { useAuth } from './useAuth';

export function usePermissions() {
  const { user } = useAuth();
  const permissions = user?.permissions ?? [];

  const hasPermission = useCallback(
    (permission: string) => permissions.includes(permission),
    [permissions],
  );

  const hasAnyPermission = useCallback(
    (perms: string[]) => perms.some(p => permissions.includes(p)),
    [permissions],
  );

  const hasAllPermissions = useCallback(
    (perms: string[]) => perms.every(p => permissions.includes(p)),
    [permissions],
  );

  return { permissions, hasPermission, hasAnyPermission, hasAllPermissions };
}
