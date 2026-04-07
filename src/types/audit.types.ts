export type AuditStatus = 'planned' | 'in_progress' | 'completed';
export type AuditResultValue = 'not_evaluated' | 'compliant' | 'non_compliant';

export interface Audit {
  id: number;
  companyId: number;
  auditorId: number;
  auditorName: string;
  date: string;
  status: AuditStatus;
  notes: string | null;
  totalControls: number;
  evaluatedCount: number;
  compliantCount: number;
  createdAt: string;
}

export interface AuditResult {
  id: number;
  controlId: number;
  code: string;
  title: string;
  themeName: string;
  themeId: number;
  result: AuditResultValue;
  comments: string | null;
  evidence: string | null;
}

export interface AuditDetail extends Audit {
  results: AuditResult[];
}

export interface CreateAuditPayload {
  date: string;
  notes?: string;
}

export interface UpdateAuditPayload {
  status?: AuditStatus;
  notes?: string;
}

export interface UpdateAuditResultPayload {
  result: AuditResultValue;
  comments?: string;
  evidence?: string;
}
