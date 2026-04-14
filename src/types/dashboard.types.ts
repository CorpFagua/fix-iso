export interface DimensionProgress {
  dimension: string;
  total: number;
  completed: number;
  percentage: number;
}

export interface DashboardStats {
  totalControls: number;
  implementedControls: number;
  inProgressControls: number;
  pendingControls: number;
  compliancePercentage: number;
  totalAssets: number;
  highRiskAssets: number;
  upcomingAudits: number;
  completedAudits: number;
  evaluatedControls: number;
  compliantControls: number;
  overallRiskLevel: string;
  implementationByDimension: DimensionProgress[];
}

export interface ComplianceByTheme {
  theme: string;
  implemented: number;
  inProgress: number;
  pending: number;
  total: number;
}

export interface RiskOverview {
  level: string;
  count: number;
}

export interface RecentActivity {
  id: number;
  userName: string;
  action: string;
  entityType: string;
  description: string;
  createdAt: string;
}

export interface CompanyDashboardStats extends DashboardStats {
  companyId: number;
  companyName: string;
}
