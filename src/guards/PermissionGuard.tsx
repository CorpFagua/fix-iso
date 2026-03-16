import type { ReactNode } from 'react';
import { Result } from 'antd';
import { usePermissions } from '../hooks/usePermissions';

interface Props {
  permission?: string;
  permissions?: string[];
  mode?: 'any' | 'all';
  fallback?: ReactNode;
  children: ReactNode;
}

export default function PermissionGuard({
  permission,
  permissions = [],
  mode = 'any',
  fallback = null,
  children,
}: Props) {
  const { hasPermission, hasAnyPermission, hasAllPermissions } = usePermissions();

  let allowed = false;
  if (permission) {
    allowed = hasPermission(permission);
  } else if (permissions.length > 0) {
    allowed = mode === 'all' ? hasAllPermissions(permissions) : hasAnyPermission(permissions);
  } else {
    allowed = true;
  }

  if (!allowed) {
    return fallback ?? (
      <Result
        status="403"
        title="Sin acceso"
        subTitle="No tienes permisos para ver esta sección."
      />
    );
  }

  return <>{children}</>;
}
