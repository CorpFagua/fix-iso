import type { Company, CompanyUser } from '../../types';

export const mockCompanies: Company[] = [
  {
    id: 1,
    name: 'TechCorp Solutions S.A.S.',
    sectorId: 1,
    sectorName: 'Tecnología',
    sizeId: 4,
    sizeName: 'Grande',
    country: 'Colombia',
    createdBy: 1,
    createdAt: '2025-06-01T00:00:00Z',
  },
  {
    id: 2,
    name: 'Financiera del Valle S.A.',
    sectorId: 2,
    sectorName: 'Financiero',
    sizeId: 3,
    sizeName: 'Mediana',
    country: 'Colombia',
    createdBy: 1,
    createdAt: '2025-08-15T00:00:00Z',
  },
  {
    id: 3,
    name: 'Hospital San Rafael',
    sectorId: 3,
    sectorName: 'Salud',
    sizeId: 4,
    sizeName: 'Grande',
    country: 'Colombia',
    createdBy: 1,
    createdAt: '2025-10-01T00:00:00Z',
  },
];

export const mockCompanyUsers: CompanyUser[] = [
  // TechCorp — todos asignados
  { companyId: 1, userId: 1, userName: 'Carlos Mendoza', userEmail: 'admin@fixiso.com', roleInCompany: 'Líder de implementación', assignedAt: '2025-06-01T00:00:00Z' },
  { companyId: 1, userId: 2, userName: 'Laura García', userEmail: 'laura.garcia@empresa.com', roleInCompany: 'CISO', assignedAt: '2025-06-01T00:00:00Z' },
  { companyId: 1, userId: 4, userName: 'Diana Torres', userEmail: 'diana.torres@empresa.com', roleInCompany: 'Consultora ISO', assignedAt: '2025-06-15T00:00:00Z' },
  { companyId: 1, userId: 5, userName: 'Miguel Sánchez', userEmail: 'miguel.sanchez@empresa.com', roleInCompany: 'Responsable TI', assignedAt: '2025-07-01T00:00:00Z' },
  // Financiera del Valle — algunos
  { companyId: 2, userId: 1, userName: 'Carlos Mendoza', userEmail: 'admin@fixiso.com', roleInCompany: 'Líder de implementación', assignedAt: '2025-08-15T00:00:00Z' },
  { companyId: 2, userId: 3, userName: 'Andrés Rojas', userEmail: 'andres.rojas@empresa.com', roleInCompany: 'Auditor interno', assignedAt: '2025-08-20T00:00:00Z' },
  { companyId: 2, userId: 4, userName: 'Diana Torres', userEmail: 'diana.torres@empresa.com', roleInCompany: 'Consultora ISO', assignedAt: '2025-09-01T00:00:00Z' },
  // Hospital San Rafael — pocos
  { companyId: 3, userId: 1, userName: 'Carlos Mendoza', userEmail: 'admin@fixiso.com', roleInCompany: 'Líder de implementación', assignedAt: '2025-10-01T00:00:00Z' },
  { companyId: 3, userId: 2, userName: 'Laura García', userEmail: 'laura.garcia@empresa.com', roleInCompany: 'DPO', assignedAt: '2025-10-10T00:00:00Z' },
];

export const mockSectors = [
  { id: 1, name: 'Tecnología' },
  { id: 2, name: 'Financiero' },
  { id: 3, name: 'Salud' },
  { id: 4, name: 'Gobierno' },
  { id: 5, name: 'Educación' },
];

export const mockCompanySizes = [
  { id: 1, name: 'Micro' },
  { id: 2, name: 'Pequeña' },
  { id: 3, name: 'Mediana' },
  { id: 4, name: 'Grande' },
];
