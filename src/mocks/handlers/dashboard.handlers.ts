import { http, HttpResponse } from 'msw';
import { mockCompanyControls } from '../data/controls.mock';
import { mockAssets, mockAssetRisks } from '../data/assets.mock';

export const dashboardHandlers = [
  http.get('/api/dashboard/stats', () => {
    const total = mockCompanyControls.length;
    const implemented = mockCompanyControls.filter(c => c.status === 'implemented').length;
    const inProgress = mockCompanyControls.filter(c => c.status === 'in_progress').length;
    const pending = mockCompanyControls.filter(c => c.status === 'pending').length;

    const highRiskAssets = new Set(
      mockAssetRisks.filter(r => r.riskLevel === 'high' || r.riskLevel === 'critical').map(r => r.assetId),
    ).size;

    return HttpResponse.json({
      data: {
        totalControls: total,
        implementedControls: implemented,
        inProgressControls: inProgress,
        pendingControls: pending,
        compliancePercentage: Math.round((implemented / total) * 100 * 10) / 10,
        totalAssets: mockAssets.filter(a => a.status === 'active').length,
        highRiskAssets,
        upcomingAudits: 2,
        overallRiskLevel: 'medium',
      },
    });
  }),

  http.get('/api/dashboard/compliance-progress', () => {
    const themes = ['Organizational', 'People', 'Physical', 'Technological'];
    const data = themes.map(theme => {
      const controls = mockCompanyControls.filter(c => c.themeName === theme);
      return {
        theme,
        implemented: controls.filter(c => c.status === 'implemented').length,
        inProgress: controls.filter(c => c.status === 'in_progress').length,
        pending: controls.filter(c => c.status === 'pending' || c.status === 'non_compliant' || c.status === 'under_review').length,
        total: controls.length,
      };
    });
    return HttpResponse.json({ data });
  }),

  http.get('/api/dashboard/risk-overview', () => {
    const levels = ['low', 'medium', 'high', 'critical'];
    const data = levels.map(level => ({
      level,
      count: mockAssetRisks.filter(r => r.riskLevel === level).length,
    }));
    return HttpResponse.json({ data });
  }),

  http.get('/api/dashboard/recent-activity', () => {
    const data = [
      { id: 1, userName: 'Carlos Mendoza', action: 'update', entityType: 'company_control', description: 'Actualizó estado de A.5.1 a "Implementado"', createdAt: '2026-03-15T14:30:00Z' },
      { id: 2, userName: 'Diana Torres', action: 'create', entityType: 'asset_risk', description: 'Agregó evaluación de riesgo al activo "Servidor de BD"', createdAt: '2026-03-15T11:20:00Z' },
      { id: 3, userName: 'Laura García', action: 'update', entityType: 'soa', description: 'Actualizó aplicabilidad de A.7.7 en SoA', createdAt: '2026-03-14T16:45:00Z' },
      { id: 4, userName: 'Carlos Mendoza', action: 'create', entityType: 'user', description: 'Creó usuario paola.ramirez@empresa.com', createdAt: '2026-03-14T09:00:00Z' },
      { id: 5, userName: 'Andrés Rojas', action: 'create', entityType: 'audit', description: 'Programó auditoría interna para abril 2026', createdAt: '2026-03-13T15:10:00Z' },
      { id: 6, userName: 'Diana Torres', action: 'create', entityType: 'evidence', description: 'Subió evidencia para control A.5.15', createdAt: '2026-03-13T10:30:00Z' },
      { id: 7, userName: 'Miguel Sánchez', action: 'update', entityType: 'asset', description: 'Actualizó clasificación de "Laptops Empleados"', createdAt: '2026-03-12T14:00:00Z' },
      { id: 8, userName: 'Laura García', action: 'update', entityType: 'role', description: 'Actualizó permisos del rol "consultant"', createdAt: '2026-03-12T09:15:00Z' },
    ];
    return HttpResponse.json({ data });
  }),
];
