export interface Company {
  id: number;
  name: string;
  sectorId: number;
  sectorName: string;
  sizeId: number;
  sizeName: string;
  country: string;
  createdBy: number;
  createdAt: string;
}

export interface CompanyUser {
  companyId: number;
  userId: number;
  userName: string;
  userEmail: string;
  roleInCompany: string | null;
  assignedAt: string;
}

export interface CreateCompanyPayload {
  name: string;
  sectorId: number;
  sizeId: number;
  country: string;
}

export type UpdateCompanyPayload = Partial<CreateCompanyPayload>;

export interface CompanySummary {
  id: number;
  name: string;
  sectorName: string;
  controlsTotal: number;
  controlsImplemented: number;
  compliancePercentage: number;
  riskLevel: string;
}
