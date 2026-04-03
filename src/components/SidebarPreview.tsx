import { useMemo } from 'react';
import { Menu, Typography } from 'antd';
import {
  DashboardOutlined,
  SafetyOutlined,
  FileProtectOutlined,
  DatabaseOutlined,
  SettingOutlined,
  TeamOutlined,
  LockOutlined,
  BankOutlined,
  BookOutlined,
  AppstoreOutlined,
} from '@ant-design/icons';
import type { MenuProps } from 'antd';
import type { ModuleWithPermissions } from '../types';

const { Text } = Typography;

const iconMap: Record<string, React.ReactNode> = {
  DashboardOutlined: <DashboardOutlined />,
  SafetyOutlined: <SafetyOutlined />,
  FileProtectOutlined: <FileProtectOutlined />,
  DatabaseOutlined: <DatabaseOutlined />,
  SettingOutlined: <SettingOutlined />,
  TeamOutlined: <TeamOutlined />,
  LockOutlined: <LockOutlined />,
  BankOutlined: <BankOutlined />,
  BookOutlined: <BookOutlined />,
  AppstoreOutlined: <AppstoreOutlined />,
};

interface Props {
  permissionIds: number[];
  allModules: ModuleWithPermissions[];
}

export default function SidebarPreview({ permissionIds, allModules }: Props) {
  const permIdSet = useMemo(() => new Set(permissionIds), [permissionIds]);

  const visibleModules = useMemo(() => {
    return allModules.filter(m => {
      if (m.modulePermissions.length === 0) return true;
      return m.modulePermissions.some(mp => permIdSet.has(mp.permissionId));
    });
  }, [allModules, permIdSet]);

  const menuItems: MenuProps['items'] = useMemo(() => {
    const roots = visibleModules
      .filter(m => m.parentId === null)
      .sort((a, b) => a.displayOrder - b.displayOrder);

    return roots.reduce<NonNullable<MenuProps['items']>>((acc, root) => {
      const children = visibleModules
        .filter(m => m.parentId === root.id)
        .sort((a, b) => a.displayOrder - b.displayOrder);

      if (children.length > 0) {
        acc.push({
          key: root.route,
          icon: iconMap[root.icon] ?? <SettingOutlined />,
          label: root.name,
          children: children.map(child => ({
            key: child.route,
            icon: iconMap[child.icon],
            label: child.name,
          })),
        });
        return acc;
      }

      acc.push({
        key: root.route,
        icon: iconMap[root.icon] ?? <DashboardOutlined />,
        label: root.name,
      });
      return acc;
    }, []);
  }, [visibleModules]);

  const openKeys = useMemo(() => {
    const roots = visibleModules.filter(m => m.parentId === null);
    return roots
      .filter(r => visibleModules.some(m => m.parentId === r.id))
      .map(r => r.route);
  }, [visibleModules]);

  return (
    <div
      style={{
        width: 220,
        background: '#001529',
        borderRadius: 8,
        overflow: 'hidden',
        flexShrink: 0,
      }}
    >
      <div
        style={{
          height: 48,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          borderBottom: '1px solid rgba(255,255,255,0.08)',
        }}
      >
        <span style={{ color: '#fff', fontWeight: 700, fontSize: 16, letterSpacing: 1 }}>
          Fix-ISO
        </span>
      </div>
      {menuItems && menuItems.length > 0 ? (
        <Menu
          theme="dark"
          mode="inline"
          items={menuItems}
          defaultOpenKeys={openKeys}
          selectable={false}
          style={{ borderRight: 0 }}
        />
      ) : (
        <div style={{ padding: '24px 16px', textAlign: 'center' }}>
          <Text type="secondary" style={{ color: 'rgba(255,255,255,0.45)', fontSize: 13 }}>
            Sin módulos visibles
          </Text>
        </div>
      )}
      <div style={{ padding: '8px 16px', borderTop: '1px solid rgba(255,255,255,0.08)' }}>
        <Text style={{ color: 'rgba(255,255,255,0.45)', fontSize: 11 }}>
          {visibleModules.filter(m => m.parentId === null).length} secciones visibles
        </Text>
      </div>
    </div>
  );
}
