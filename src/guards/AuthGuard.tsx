import { Navigate, Outlet } from 'react-router';
import { Spin } from 'antd';
import { useAuth } from '../hooks/useAuth';
import CompanyProvider from '../context/CompanyProvider';

export default function AuthGuard() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <Spin size="large" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return (
    <CompanyProvider>
      <Outlet />
    </CompanyProvider>
  );
}
