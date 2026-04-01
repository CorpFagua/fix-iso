import { createBrowserRouter } from 'react-router';
import AuthLayout from '../layouts/AuthLayout';
import MainLayout from '../layouts/MainLayout';
import AuthGuard from '../guards/AuthGuard';
import PermissionGuard from '../guards/PermissionGuard';
import LoginPage from '../pages/auth/LoginPage';
import DashboardPage from '../pages/dashboard/DashboardPage';
import ControlsListPage from '../pages/controls/ControlsListPage';
import CatalogPage from '../pages/controls/CatalogPage';
import SoAPage from '../pages/controls/SoAPage';
import AssetsListPage from '../pages/assets/AssetsListPage';
import AssetDetailPage from '../pages/assets/AssetDetailPage';
import CompaniesPage from '../pages/companies/CompaniesPage';
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
          {
            path: '/controls',
            element: <PermissionGuard permission="controls:read"><ControlsListPage /></PermissionGuard>,
          },
          {
            path: '/soa',
            element: <PermissionGuard permission="soa:read"><SoAPage /></PermissionGuard>,
          },
          {
            path: '/companies',
            element: <PermissionGuard permission="companies:read"><CompaniesPage /></PermissionGuard>,
          },
          {
            path: '/assets',
            element: <PermissionGuard permission="assets:read"><AssetsListPage /></PermissionGuard>,
          },
          {
            path: '/assets/:id',
            element: <PermissionGuard permission="assets:read"><AssetDetailPage /></PermissionGuard>,
          },
          {
            path: '/admin/users',
            element: <PermissionGuard permission="users:read"><UsersPage /></PermissionGuard>,
          },
          {
            path: '/admin/roles',
            element: <PermissionGuard permission="roles:read"><RolesPage /></PermissionGuard>,
          },
          {
            path: '/catalog',
            element: <PermissionGuard permission="controls:update"><CatalogPage /></PermissionGuard>,
          },
          { path: '*', element: <NotFoundPage /> },
        ],
      },
    ],
  },
]);

export default router;
