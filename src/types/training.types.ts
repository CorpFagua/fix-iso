export type TrainingType = 'ORGANIZATIONAL' | 'PEOPLE' | 'PHYSICAL' | 'TECHNOLOGICAL' | 'PROCESS';
export type EnrollmentStatus = 'PENDING' | 'COMPLETED';

export const trainingTypeLabels: Record<TrainingType, string> = {
  ORGANIZATIONAL: 'Controles Organizativos',
  PEOPLE: 'Controles de Personas',
  PHYSICAL: 'Controles Físicos',
  TECHNOLOGICAL: 'Controles Tecnológicos',
  PROCESS: 'De Procesos',
};

export const enrollmentStatusLabels: Record<EnrollmentStatus, string> = {
  PENDING: 'Pendiente de capacitación',
  COMPLETED: 'Capacitado',
};

export interface TrainingResource {
  id: string;
  type: 'url' | 'pdf' | 'video';
  url?: string;
  filename?: string;
  title?: string;
}

export interface Training {
  id: number;
  title: string;
  description: string | null;
  trainingType: TrainingType;
  resourcesJson: TrainingResource[];
  createdBy: number;
  creatorName: string;
  isActive: boolean;
  companiesCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface TrainingDetail extends Omit<Training, 'companiesCount'> {
  companyTrainings: {
    id: number;
    companyId: number;
    companyName: string;
    assignedAt: string;
    enrollmentsCount: number;
  }[];
}

export interface CompanyTrainingEnrollment {
  id: number;
  userId: number;
  userName: string;
  userEmail: string;
  status: EnrollmentStatus;
  enrolledAt: string;
  completedAt: string | null;
  notes: string | null;
}

export interface CompanyTraining {
  id: number;
  trainingId: number;
  companyId: number;
  title: string;
  description: string | null;
  trainingType: TrainingType;
  resourcesJson: TrainingResource[];
  trainingCreatedAt: string;
  assignedAt: string;
  assignedByName: string;
  enrollments: CompanyTrainingEnrollment[];
}

export interface CreateTrainingPayload {
  title: string;
  description?: string;
  trainingType: TrainingType;
  resourcesJson?: TrainingResource[];
}

export interface UpdateTrainingPayload {
  title?: string;
  description?: string;
  trainingType?: TrainingType;
  resourcesJson?: TrainingResource[];
}

export interface AvailableTraining {
  id: number;
  title: string;
  trainingType: TrainingType;
  description: string | null;
  createdAt: string;
}
