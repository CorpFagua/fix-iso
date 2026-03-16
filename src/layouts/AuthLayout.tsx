import { Outlet } from 'react-router';
import { Layout, theme } from 'antd';

const { Content } = Layout;

export default function AuthLayout() {
  const { token } = theme.useToken();

  return (
    <Layout style={{ minHeight: '100vh', background: token.colorBgLayout }}>
      <Content
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Outlet />
      </Content>
    </Layout>
  );
}
