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
  progressPercentage: number;
  tasksCompleted: number;
  notesCount: number;
}

export interface UpdateSoAPayload {
  applicable: boolean;
  justification?: string;
  implementationStatus?: string;
  forceDeactivate?: boolean;
}

export interface ControlEvidence {
  id: number;
  companyControlId: number;
  fileUrl: string;
  description: string | null;
  uploadedByName: string;
  uploadedAt: string;
}

// ── Implementation module ────────────────────────────────────────────────────

export type ImplementationDimension =
  | 'policy'
  | 'procedures'
  | 'technical'
  | 'evidence'
  | 'training'
  | 'monitoring';

export type TaskStatus = 'not_started' | 'in_progress' | 'completed';

export interface ImplementationTask {
  id: number;
  dimension: ImplementationDimension;
  dimensionLabel: string;
  dimensionDescription: string;
  status: TaskStatus;
  notes: string | null;
  completedAt: string | null;
  updatedAt: string;
}

export interface ImplementationNote {
  id: number;
  userId: number;
  userName: string;
  content: string;
  createdAt: string;
}

export interface ImplementationControlSummary {
  companyControlId: number;
  controlId: number;
  code: string;
  title: string;
  themeName: string;
  status: string;
  maturityLevel: string;
  assignedUserName: string | null;
  progressPercentage: number;
  tasksCompleted: number;
  totalTasks: number;
}

export interface ImplementationControlDetail extends ImplementationControlSummary {
  description: string;
  tasks: ImplementationTask[];
  notes: ImplementationNote[];
}

export interface ImplementationDomainSummary {
  themeId: number;
  themeName: string;
  totalControls: number;
  progressPercentage: number;
}

export interface ImplementationGlobalSummary {
  totalControls: number;
  progressPercentage: number;
  byDomain: ImplementationDomainSummary[];
  byDimension: Array<{
    dimension: ImplementationDimension;
    label: string;
    completedCount: number;
    totalCount: number;
  }>;
}
