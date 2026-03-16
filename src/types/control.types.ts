export interface IsoTheme {
  id: number;
  name: string;
  description: string | null;
  controlsCount: number;
}

export interface IsoControl {
  id: number;
  code: string;
  title: string;
  description: string;
  themeId: number;
  themeName: string;
  controlType: 'preventive' | 'detective' | 'corrective';
  properties: string;
  version: string;
}

export type CompanyControlStatus =
  | 'pending'
  | 'in_progress'
  | 'implemented'
  | 'non_compliant'
  | 'under_review';

export type MaturityLevel =
  | 'initial'
  | 'managed'
  | 'defined'
  | 'measured'
  | 'optimized';

export interface CompanyControl {
  id: number;
  companyId: number;
  controlId: number;
  code: string;
  title: string;
  themeName: string;
  status: CompanyControlStatus;
  maturityLevel: MaturityLevel;
  compliancePercentage: number;
  assignedUserName: string | null;
  assignedUserId: number | null;
  implementationDate: string | null;
  reviewDate: string | null;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface UpdateCompanyControlPayload {
  status?: CompanyControlStatus;
  maturityLevel?: MaturityLevel;
  compliancePercentage?: number;
  assignedUser?: number;
  notes?: string;
  reviewDate?: string;
}

export interface SoAEntry {
  controlId: number;
  code: string;
  title: string;
  themeName: string;
  applicable: boolean;
  justification: string | null;
  implementationStatus: string;
}

export interface UpdateSoAPayload {
  applicable: boolean;
  justification?: string;
  implementationStatus?: string;
}

export interface ControlEvidence {
  id: number;
  companyControlId: number;
  fileUrl: string;
  description: string | null;
  uploadedByName: string;
  uploadedAt: string;
}
