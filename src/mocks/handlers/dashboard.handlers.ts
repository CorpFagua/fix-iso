import { http, HttpResponse } from 'msw';
import { allMockCompanyControls } from '../data/controls.mock';
import { mockAssets, mockAssetRisks } from '../data/assets.mock';
import { mockCompanies } from '../data/companies.mock';

function getControlsByCompany(companyId?: number) {
  return companyId
    ? allMockCompanyControls.filter(c => c.companyId === companyId)
    : allMockCompanyControls.filter(c => c.companyId === 1); // default to company 1 for global
}

function getAssetsByCompany(companyId?: number) {
  return companyId
    ? mockAssets.filter(a => a.companyId === companyId)
    : mockAssets;
}

function getRisksByAssets(assets: typeof mockAssets) {
  const assetIds = new Set(assets.map(a => a.id));
  return mockAssetRisks.filter(r => assetIds.has(r.assetId));
}

export const dashboardHandlers = [
  http.get('/api/dashboard/stats', ({ request }) => {
    const url = new URL(request.url);
    const companyIdParam = url.searchParams.get('companyId');
    const companyId = companyIdParam ? Number(companyIdParam) : undefined;

    const controls = getControlsByCompany(companyId);
    const assets = getAssetsByCompany(companyId);
    const risks = getRisksByAssets(assets);

    const total = controls.length;
    const implemented = controls.filter(c => c.status === 'implemented').length;
    const inProgress = controls.filter(c => c.status === 'in_progress').length;
    const pending = controls.filter(c => c.status === 'pending').length;

    const highRiskAssets = new Set(
      risks.filter(r => r.riskLevel === 'high' || r.riskLevel === 'critical').map(r => r.assetId),
    ).size;

    return HttpResponse.json({
      data: {
        totalControls: total,
        implementedControls: implemented,
        inProgressControls: inProgress,
        pendingControls: pending,
        compliancePercentage: total > 0 ? Math.round((implemented / total) * 100 * 10) / 10 : 0,
        totalAssets: assets.filter(a => a.status === 'active').length,
        highRiskAssets,
        upcomingAudits: 2,
        overallRiskLevel: highRiskAssets > 2 ? 'high' : 'medium',
      },
    });
  }),

  http.get('/api/dashboard/compliance-progress', ({ request }) => {
    const url = new URL(request.url);
    const companyIdParam = url.searchParams.get('companyId');
    const companyId = companyIdParam ? Number(companyIdParam) : undefined;

    const controls = getControlsByCompany(companyId);
    const themes = ['Organizational', 'People', 'Physical', 'Technological'];
    const data = themes.map(theme => {
      const themeControls = controls.filter(c => c.themeName === theme);
      return {
        theme,
        implemented: themeControls.filter(c => c.status === 'implemented').length,
        inProgress: themeControls.filter(c => c.status === 'in_progress').length,
        pending: themeControls.filter(c => c.status === 'pending' || c.status === 'non_compliant' || c.status === 'under_review').length,
        total: themeControls.length,
      };
    });
    return HttpResponse.json({ data });
  }),

  http.get('/api/dashboard/risk-overview', ({ request }) => {
    const url = new URL(request.url);
    const companyIdParam = url.searchParams.get('companyId');
    const companyId = companyIdParam ? Number(companyIdParam) : undefined;

    const assets = getAssetsByCompany(companyId);
    const risks = getRisksByAssets(assets);
    const levels = ['low', 'medium', 'high', 'critical'];
    const data = levels.map(level => ({
      level,
      count: risks.filter(r => r.riskLevel === level).length,
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

  http.get('/api/dashboard/global', () => {
    const data = mockCompanies.map(company => {
      const controls = allMockCompanyControls.filter(c => c.companyId === company.id);
      const total = controls.length;
      const implemented = controls.filter(c => c.status === 'implemented').length;

      const companyAssets = mockAssets.filter(a => a.companyId === company.id);
      const companyRisks = getRisksByAssets(companyAssets);
      const hasHighRisk = companyRisks.some(r => r.riskLevel === 'high' || r.riskLevel === 'critical');

      return {
        id: company.id,
        name: company.name,
        sectorName: company.sectorName,
        controlsTotal: total,
        controlsImplemented: implemented,
        compliancePercentage: total > 0 ? Math.round((implemented / total) * 100 * 10) / 10 : 0,
        riskLevel: hasHighRisk ? 'high' : 'medium',
      };
    });
    return HttpResponse.json({ data });
  }),
];
