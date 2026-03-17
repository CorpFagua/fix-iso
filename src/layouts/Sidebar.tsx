import { useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router';
import { Layout, Menu } from 'antd';
import {
  DashboardOutlined,
  SafetyOutlined,
  FileProtectOutlined,
  DatabaseOutlined,
  SettingOutlined,
  TeamOutlined,
  LockOutlined,
  BankOutlined,
} from '@ant-design/icons';
import type { MenuProps } from 'antd';
import { useAuth } from '../hooks/useAuth';

const { Sider } = Layout;

const iconMap: Record<string, React.ReactNode> = {
  DashboardOutlined: <DashboardOutlined />,
  SafetyOutlined: <SafetyOutlined />,
  FileProtectOutlined: <FileProtectOutlined />,
  DatabaseOutlined: <DatabaseOutlined />,
  SettingOutlined: <SettingOutlined />,
  TeamOutlined: <TeamOutlined />,
  LockOutlined: <LockOutlined />,
  BankOutlined: <BankOutlined />,
};

interface Props {
  collapsed: boolean;
  onCollapse: (collapsed: boolean) => void;
}

export default function Sidebar({ collapsed, onCollapse }: Props) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const menuItems: MenuProps['items'] = useMemo(() => {
    if (!user) return [];
    const modules = user.modules;
    const roots = modules
      .filter(m => m.parentId === null)
      .sort((a, b) => a.displayOrder - b.displayOrder);

    return roots.map(root => {
      const children = modules
        .filter(m => m.parentId === root.id)
        .sort((a, b) => a.displayOrder - b.displayOrder);

      if (children.length > 0) {
        return {
          key: root.route,
          icon: iconMap[root.icon] ?? <SettingOutlined />,
          label: root.name,
          children: children.map(child => ({
            key: child.route,
            icon: iconMap[child.icon],
            label: child.name,
          })),
        };
      }

      return {
        key: root.route,
        icon: iconMap[root.icon] ?? <DashboardOutlined />,
        label: root.name,
      };
    });
  }, [user]);

  const selectedKey = useMemo(() => {
    const path = location.pathname;
    if (path.startsWith('/admin/users')) return '/admin/users';
    if (path.startsWith('/admin/roles')) return '/admin/roles';
    if (path.startsWith('/controls')) return '/controls';
    if (path.startsWith('/assets')) return '/assets';
    if (path.startsWith('/companies')) return '/companies';
    if (path.startsWith('/soa')) return '/soa';
    return '/dashboard';
  }, [location.pathname]);

  const openKey = useMemo(() => {
    if (location.pathname.startsWith('/admin')) return ['/admin'];
    return [];
  }, [location.pathname]);

  return (
    <Sider
      collapsible
      collapsed={collapsed}
      onCollapse={onCollapse}
      width={240}
      style={{ minHeight: '100vh' }}
    >
      <div
        style={{
          height: 64,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          borderBottom: '1px solid rgba(255,255,255,0.08)',
        }}
      >
        <span style={{ color: '#fff', fontWeight: 700, fontSize: collapsed ? 16 : 20, letterSpacing: 1 }}>
          {collapsed ? 'FI' : 'Fix-ISO'}
        </span>
      </div>
      <Menu
        theme="dark"
        mode="inline"
        selectedKeys={[selectedKey]}
        defaultOpenKeys={openKey}
        items={menuItems}
        onClick={({ key }) => navigate(key)}
      />
    </Sider>
  );
}
