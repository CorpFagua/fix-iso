import { Suspense } from 'react';
import { createBrowserRouter } from 'react-router';
import { Spin } from 'antd';
import AuthLayout from '../layouts/AuthLayout';
import MainLayout from '../layouts/MainLayout';
import AuthGuard from '../guards/AuthGuard';
import PermissionGuard from '../guards/PermissionGuard';
import LoginPage from '../pages/auth/LoginPage';
import DashboardPage from '../pages/dashboard/DashboardPage';
import ImplementationPage from '../pages/controls/ImplementationPage';
import ImplementationDetailPage from '../pages/controls/ImplementationDetailPage';
import CatalogPage from '../pages/controls/CatalogPage';
import SoAPage from '../pages/controls/SoAPage';
import AssetsListPage from '../pages/assets/AssetsListPage';
import AssetDetailPage from '../pages/assets/AssetDetailPage';
import CompaniesPage from '../pages/companies/CompaniesPage';
import UsersPage from '../pages/admin/UsersPage';
import RolesPage from '../pages/admin/RolesPage';
import ModulesPage from '../pages/admin/ModulesPage';
import ApplicabilityRulesPage from '../pages/admin/ApplicabilityRulesPage';
import AdminTrainingsPage from '../pages/admin/AdminTrainingsPage';
import TrainingsPage from '../pages/trainings/TrainingsPage';
import TrainingDetailPage from '../pages/trainings/TrainingDetailPage';
import NotFoundPage from '../pages/NotFoundPage';
import { routeRegistry } from './routeRegistry';

const dynamicRoutes = Object.entries(routeRegistry).map(([path, entry]) => {
  const LazyComponent = entry.component;
  const element = (
    <Suspense fallback={<Spin style={{ display: 'block', margin: '80px auto' }} />}>
      <LazyComponent />
    </Suspense>
  );
  return {
    path,
    element: entry.permission
      ? <PermissionGuard permission={entry.permission}>{element}</PermissionGuard>
      : element,
  };
});

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
            path: '/implementation',
            element: <PermissionGuard permission="controls:read"><ImplementationPage /></PermissionGuard>,
          },
          {
            path: '/implementation/:controlId',
            element: <PermissionGuard permission="controls:read"><ImplementationDetailPage /></PermissionGuard>,
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
            path: '/admin/modules',
            element: <PermissionGuard permission="modules:manage"><ModulesPage /></PermissionGuard>,
          },
          {
            path: '/admin/applicability',
            element: <PermissionGuard permission="controls:update"><ApplicabilityRulesPage /></PermissionGuard>,
          },
          {
            path: '/catalog',
            element: <PermissionGuard permission="controls:update"><CatalogPage /></PermissionGuard>,
          },
          {
            path: '/trainings',
            element: <PermissionGuard permission="trainings:read"><TrainingsPage /></PermissionGuard>,
          },
          {
            path: '/trainings/:trainingId',
            element: <PermissionGuard permission="trainings:read"><TrainingDetailPage /></PermissionGuard>,
          },
          {
            path: '/admin/trainings',
            element: <PermissionGuard permission="trainings:create"><AdminTrainingsPage /></PermissionGuard>,
          },
          ...dynamicRoutes,
          { path: '*', element: <NotFoundPage /> },
        ],
      },
    ],
  },
]);

export default router;
