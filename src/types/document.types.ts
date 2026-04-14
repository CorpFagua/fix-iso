export type DocumentType =
  | 'ACTA'
  | 'REPORTE_AUDITORIA'
  | 'EVIDENCIA'
  | 'POLITICA'
  | 'PLAN_TRATAMIENTO'
  | 'INFORME_CAPACITACION'
  | 'PLANTILLA';

export const DOCUMENT_TYPE_LABELS: Record<DocumentType, string> = {
  ACTA: 'Acta',
  REPORTE_AUDITORIA: 'Reporte de Auditoría',
  EVIDENCIA: 'Evidencia',
  POLITICA: 'Política',
  PLAN_TRATAMIENTO: 'Plan de Tratamiento',
  INFORME_CAPACITACION: 'Informe de Capacitación',
  PLANTILLA: 'Plantilla',
};

export interface Document {
  id: number;
  companyId: number | null;
  name: string;
  description: string | null;
  documentType: DocumentType;
  driveFileId: string | null;
  driveUrl: string | null;
  driveFolderId: string | null;
  relatedEntityType: string | null;
  relatedEntityId: number | null;
  createdById: number;
  createdAt: string;
  updatedAt: string;
  company: { id: number; name: string } | null;
  createdBy: { id: number; name: string };
}

export interface CreateDocumentPayload {
  companyId?: number;
  name: string;
  description?: string;
  documentType: DocumentType;
  driveFileId?: string;
  driveUrl?: string;
  driveFolderId?: string;
  relatedEntityType?: string;
  relatedEntityId?: number;
}

export interface UpdateDocumentPayload {
  name?: string;
  description?: string;
  relatedEntityType?: string;
  relatedEntityId?: number;
}
