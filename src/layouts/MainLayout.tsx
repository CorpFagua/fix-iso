import { useState } from 'react';
import { Outlet, useLocation } from 'react-router';
import { Layout, Dropdown, Avatar, Breadcrumb, theme } from 'antd';
import { UserOutlined, LogoutOutlined } from '@ant-design/icons';
import { useAuth } from '../hooks/useAuth';
import Sidebar from './Sidebar';
import CompanySelector from '../components/CompanySelector';

const { Header, Content } = Layout;

const breadcrumbMap: Record<string, string> = {
  dashboard: 'Dashboard',
  companies: 'Empresas',
  controls: 'Controles ISO',
  soa: 'Declaración de Aplicabilidad',
  assets: 'Activos',
  admin: 'Administración',
  users: 'Usuarios',
  roles: 'Roles y Permisos',
  new: 'Nuevo',
  bigdata: 'Inteligencia de Amenazas',
};

export default function MainLayout() {
  const [collapsed, setCollapsed] = useState(false);
  const { user, logout } = useAuth();
  const location = useLocation();
  const { token } = theme.useToken();

  const pathParts = location.pathname.split('/').filter(Boolean);
  const breadcrumbItems = [
    { title: 'Inicio' },
    ...pathParts.map(part => ({
      title: breadcrumbMap[part] ?? part,
    })),
  ];

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sidebar collapsed={collapsed} onCollapse={setCollapsed} />
      <Layout>
        <Header
          style={{
            padding: '0 24px',
            background: token.colorBgContainer,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderBottom: `1px solid ${token.colorBorderSecondary}`,
          }}
        >
          <CompanySelector />
          <Dropdown
            menu={{
              items: [
                {
                  key: 'profile',
                  icon: <UserOutlined />,
                  label: user?.name ?? 'Usuario',
                  disabled: true,
                },
                { type: 'divider' },
                {
                  key: 'logout',
                  icon: <LogoutOutlined />,
                  label: 'Cerrar sesión',
                  danger: true,
                  onClick: logout,
                },
              ],
            }}
            placement="bottomRight"
          >
            <Avatar
              style={{ backgroundColor: token.colorPrimary, cursor: 'pointer' }}
              icon={<UserOutlined />}
            />
          </Dropdown>
        </Header>
        <Content style={{ margin: 24 }}>
          <Breadcrumb items={breadcrumbItems} style={{ marginBottom: 16 }} />
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  );
}
