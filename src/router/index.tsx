import { createBrowserRouter } from 'react-router';
import AuthLayout from '../layouts/AuthLayout';
import MainLayout from '../layouts/MainLayout';
import AuthGuard from '../guards/AuthGuard';
import LoginPage from '../pages/auth/LoginPage';
import DashboardPage from '../pages/dashboard/DashboardPage';
import ControlsListPage from '../pages/controls/ControlsListPage';
import SoAPage from '../pages/controls/SoAPage';
import AssetsListPage from '../pages/assets/AssetsListPage';
import AssetDetailPage from '../pages/assets/AssetDetailPage';
import UsersPage from '../pages/admin/UsersPage';
import RolesPage from '../pages/admin/RolesPage';
import NotFoundPage from '../pages/NotFoundPage';

const router = createBrowserRouter([
  {
    element: <AuthLayout />,
    children: [
      { path: '/login', element: <LoginPage /> },
    ],
  },
  {
    element: <AuthGuard />,
    children: [
      {
        element: <MainLayout />,
        children: [
          { path: '/', element: <DashboardPage /> },
          { path: '/dashboard', element: <DashboardPage /> },
          { path: '/controls', element: <ControlsListPage /> },
          { path: '/soa', element: <SoAPage /> },
          { path: '/assets', element: <AssetsListPage /> },
          { path: '/assets/:id', element: <AssetDetailPage /> },
          { path: '/admin/users', element: <UsersPage /> },
          { path: '/admin/roles', element: <RolesPage /> },
          { path: '*', element: <NotFoundPage /> },
        ],
      },
    ],
  },
]);

export default router;
