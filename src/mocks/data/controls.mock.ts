import type { CompanyControl, SoAEntry } from '../../types';

interface IsoControlSeed {
  id: number;
  code: string;
  title: string;
  themeId: number;
  themeName: string;
  controlType: 'preventive' | 'detective' | 'corrective';
  properties: string;
}

// Subconjunto representativo de los 93 controles ISO 27001:2022 Anexo A
export const mockIsoControls: IsoControlSeed[] = [
  // Organizational (A.5) — 37 controles, mostramos los más relevantes
  { id: 1, code: 'A.5.1', title: 'Políticas de seguridad de la información', themeId: 1, themeName: 'Organizational', controlType: 'preventive', properties: 'C,I,A' },
  { id: 2, code: 'A.5.2', title: 'Roles y responsabilidades de seguridad', themeId: 1, themeName: 'Organizational', controlType: 'preventive', properties: 'C,I,A' },
  { id: 3, code: 'A.5.3', title: 'Segregación de funciones', themeId: 1, themeName: 'Organizational', controlType: 'preventive', properties: 'C,I,A' },
  { id: 4, code: 'A.5.4', title: 'Responsabilidades de la dirección', themeId: 1, themeName: 'Organizational', controlType: 'preventive', properties: 'C,I,A' },
  { id: 5, code: 'A.5.5', title: 'Contacto con autoridades', themeId: 1, themeName: 'Organizational', controlType: 'preventive', properties: 'C,I,A' },
  { id: 6, code: 'A.5.6', title: 'Contacto con grupos de interés especial', themeId: 1, themeName: 'Organizational', controlType: 'preventive', properties: 'C,I,A' },
  { id: 7, code: 'A.5.7', title: 'Inteligencia sobre amenazas', themeId: 1, themeName: 'Organizational', controlType: 'preventive', properties: 'C,I,A' },
  { id: 8, code: 'A.5.8', title: 'Seguridad en gestión de proyectos', themeId: 1, themeName: 'Organizational', controlType: 'preventive', properties: 'C,I,A' },
  { id: 9, code: 'A.5.9', title: 'Inventario de información y activos', themeId: 1, themeName: 'Organizational', controlType: 'preventive', properties: 'C,I,A' },
  { id: 10, code: 'A.5.10', title: 'Uso aceptable de información y activos', themeId: 1, themeName: 'Organizational', controlType: 'preventive', properties: 'C,I,A' },
  { id: 11, code: 'A.5.11', title: 'Devolución de activos', themeId: 1, themeName: 'Organizational', controlType: 'preventive', properties: 'C,I,A' },
  { id: 12, code: 'A.5.12', title: 'Clasificación de la información', themeId: 1, themeName: 'Organizational', controlType: 'preventive', properties: 'C,I,A' },
  { id: 13, code: 'A.5.13', title: 'Etiquetado de la información', themeId: 1, themeName: 'Organizational', controlType: 'preventive', properties: 'C,I,A' },
  { id: 14, code: 'A.5.14', title: 'Transferencia de información', themeId: 1, themeName: 'Organizational', controlType: 'preventive', properties: 'C,I' },
  { id: 15, code: 'A.5.15', title: 'Control de acceso', themeId: 1, themeName: 'Organizational', controlType: 'preventive', properties: 'C' },
  { id: 16, code: 'A.5.16', title: 'Gestión de identidades', themeId: 1, themeName: 'Organizational', controlType: 'preventive', properties: 'C' },
  { id: 17, code: 'A.5.17', title: 'Información de autenticación', themeId: 1, themeName: 'Organizational', controlType: 'preventive', properties: 'C' },
  { id: 18, code: 'A.5.18', title: 'Derechos de acceso', themeId: 1, themeName: 'Organizational', controlType: 'preventive', properties: 'C' },
  { id: 19, code: 'A.5.19', title: 'Seguridad en relaciones con proveedores', themeId: 1, themeName: 'Organizational', controlType: 'preventive', properties: 'C,I,A' },
  { id: 20, code: 'A.5.20', title: 'Seguridad en acuerdos con proveedores', themeId: 1, themeName: 'Organizational', controlType: 'preventive', properties: 'C,I,A' },
  { id: 21, code: 'A.5.21', title: 'Gestión de seguridad en la cadena TIC', themeId: 1, themeName: 'Organizational', controlType: 'preventive', properties: 'C,I,A' },
  { id: 22, code: 'A.5.22', title: 'Monitoreo y revisión de servicios de proveedores', themeId: 1, themeName: 'Organizational', controlType: 'detective', properties: 'C,I,A' },
  { id: 23, code: 'A.5.23', title: 'Seguridad para uso de servicios cloud', themeId: 1, themeName: 'Organizational', controlType: 'preventive', properties: 'C,I,A' },
  { id: 24, code: 'A.5.24', title: 'Planificación de gestión de incidentes', themeId: 1, themeName: 'Organizational', controlType: 'corrective', properties: 'C,I,A' },
  { id: 25, code: 'A.5.25', title: 'Evaluación y decisión sobre eventos de seguridad', themeId: 1, themeName: 'Organizational', controlType: 'detective', properties: 'C,I,A' },
  { id: 26, code: 'A.5.26', title: 'Respuesta a incidentes de seguridad', themeId: 1, themeName: 'Organizational', controlType: 'corrective', properties: 'C,I,A' },
  { id: 27, code: 'A.5.27', title: 'Aprendizaje de incidentes de seguridad', themeId: 1, themeName: 'Organizational', controlType: 'corrective', properties: 'C,I,A' },
  { id: 28, code: 'A.5.28', title: 'Recolección de evidencia', themeId: 1, themeName: 'Organizational', controlType: 'detective', properties: 'C,I,A' },
  { id: 29, code: 'A.5.29', title: 'Seguridad durante disrupciones', themeId: 1, themeName: 'Organizational', controlType: 'preventive', properties: 'A' },
  { id: 30, code: 'A.5.30', title: 'Preparación TIC para continuidad del negocio', themeId: 1, themeName: 'Organizational', controlType: 'preventive', properties: 'A' },
  { id: 31, code: 'A.5.31', title: 'Requisitos legales y contractuales', themeId: 1, themeName: 'Organizational', controlType: 'preventive', properties: 'C,I,A' },
  { id: 32, code: 'A.5.32', title: 'Derechos de propiedad intelectual', themeId: 1, themeName: 'Organizational', controlType: 'preventive', properties: 'C' },
  { id: 33, code: 'A.5.33', title: 'Protección de registros', themeId: 1, themeName: 'Organizational', controlType: 'preventive', properties: 'C,I,A' },
  { id: 34, code: 'A.5.34', title: 'Privacidad y protección de datos personales', themeId: 1, themeName: 'Organizational', controlType: 'preventive', properties: 'C' },
  { id: 35, code: 'A.5.35', title: 'Revisión independiente de seguridad', themeId: 1, themeName: 'Organizational', controlType: 'detective', properties: 'C,I,A' },
  { id: 36, code: 'A.5.36', title: 'Cumplimiento de políticas y normas', themeId: 1, themeName: 'Organizational', controlType: 'detective', properties: 'C,I,A' },
  { id: 37, code: 'A.5.37', title: 'Procedimientos operativos documentados', themeId: 1, themeName: 'Organizational', controlType: 'preventive', properties: 'C,I,A' },
  // People (A.6) — 8 controles
  { id: 38, code: 'A.6.1', title: 'Verificación de antecedentes', themeId: 2, themeName: 'People', controlType: 'preventive', properties: 'C' },
  { id: 39, code: 'A.6.2', title: 'Términos y condiciones de empleo', themeId: 2, themeName: 'People', controlType: 'preventive', properties: 'C,I,A' },
  { id: 40, code: 'A.6.3', title: 'Concienciación y formación en seguridad', themeId: 2, themeName: 'People', controlType: 'preventive', properties: 'C,I,A' },
  { id: 41, code: 'A.6.4', title: 'Proceso disciplinario', themeId: 2, themeName: 'People', controlType: 'preventive', properties: 'C,I,A' },
  { id: 42, code: 'A.6.5', title: 'Responsabilidades tras el cese', themeId: 2, themeName: 'People', controlType: 'preventive', properties: 'C,I,A' },
  { id: 43, code: 'A.6.6', title: 'Acuerdos de confidencialidad', themeId: 2, themeName: 'People', controlType: 'preventive', properties: 'C' },
  { id: 44, code: 'A.6.7', title: 'Trabajo remoto', themeId: 2, themeName: 'People', controlType: 'preventive', properties: 'C,I,A' },
  { id: 45, code: 'A.6.8', title: 'Reporte de eventos de seguridad', themeId: 2, themeName: 'People', controlType: 'detective', properties: 'C,I,A' },
  // Physical (A.7) — 14 controles
  { id: 46, code: 'A.7.1', title: 'Perímetros de seguridad física', themeId: 3, themeName: 'Physical', controlType: 'preventive', properties: 'C,I,A' },
  { id: 47, code: 'A.7.2', title: 'Controles de entrada física', themeId: 3, themeName: 'Physical', controlType: 'preventive', properties: 'C,I,A' },
  { id: 48, code: 'A.7.3', title: 'Seguridad de oficinas e instalaciones', themeId: 3, themeName: 'Physical', controlType: 'preventive', properties: 'C,I,A' },
  { id: 49, code: 'A.7.4', title: 'Monitoreo de seguridad física', themeId: 3, themeName: 'Physical', controlType: 'detective', properties: 'C,I,A' },
  { id: 50, code: 'A.7.5', title: 'Protección contra amenazas ambientales', themeId: 3, themeName: 'Physical', controlType: 'preventive', properties: 'A' },
  { id: 51, code: 'A.7.6', title: 'Trabajo en áreas seguras', themeId: 3, themeName: 'Physical', controlType: 'preventive', properties: 'C,I,A' },
  { id: 52, code: 'A.7.7', title: 'Escritorio y pantalla limpios', themeId: 3, themeName: 'Physical', controlType: 'preventive', properties: 'C' },
  { id: 53, code: 'A.7.8', title: 'Ubicación y protección de equipos', themeId: 3, themeName: 'Physical', controlType: 'preventive', properties: 'C,I,A' },
  { id: 54, code: 'A.7.9', title: 'Seguridad de activos fuera de las instalaciones', themeId: 3, themeName: 'Physical', controlType: 'preventive', properties: 'C,I,A' },
  { id: 55, code: 'A.7.10', title: 'Medios de almacenamiento', themeId: 3, themeName: 'Physical', controlType: 'preventive', properties: 'C,I,A' },
  { id: 56, code: 'A.7.11', title: 'Servicios de soporte', themeId: 3, themeName: 'Physical', controlType: 'preventive', properties: 'A' },
  { id: 57, code: 'A.7.12', title: 'Seguridad del cableado', themeId: 3, themeName: 'Physical', controlType: 'preventive', properties: 'C,A' },
  { id: 58, code: 'A.7.13', title: 'Mantenimiento de equipos', themeId: 3, themeName: 'Physical', controlType: 'preventive', properties: 'I,A' },
  { id: 59, code: 'A.7.14', title: 'Eliminación o reutilización segura de equipos', themeId: 3, themeName: 'Physical', controlType: 'preventive', properties: 'C' },
  // Technological (A.8) — 34 controles
  { id: 60, code: 'A.8.1', title: 'Dispositivos endpoint de usuario', themeId: 4, themeName: 'Technological', controlType: 'preventive', properties: 'C,I,A' },
  { id: 61, code: 'A.8.2', title: 'Derechos de acceso privilegiado', themeId: 4, themeName: 'Technological', controlType: 'preventive', properties: 'C,I,A' },
  { id: 62, code: 'A.8.3', title: 'Restricción de acceso a la información', themeId: 4, themeName: 'Technological', controlType: 'preventive', properties: 'C' },
  { id: 63, code: 'A.8.4', title: 'Acceso al código fuente', themeId: 4, themeName: 'Technological', controlType: 'preventive', properties: 'C,I' },
  { id: 64, code: 'A.8.5', title: 'Autenticación segura', themeId: 4, themeName: 'Technological', controlType: 'preventive', properties: 'C,I,A' },
  { id: 65, code: 'A.8.6', title: 'Gestión de capacidad', themeId: 4, themeName: 'Technological', controlType: 'preventive', properties: 'A' },
  { id: 66, code: 'A.8.7', title: 'Protección contra malware', themeId: 4, themeName: 'Technological', controlType: 'preventive', properties: 'C,I,A' },
  { id: 67, code: 'A.8.8', title: 'Gestión de vulnerabilidades técnicas', themeId: 4, themeName: 'Technological', controlType: 'preventive', properties: 'C,I,A' },
  { id: 68, code: 'A.8.9', title: 'Gestión de configuración', themeId: 4, themeName: 'Technological', controlType: 'preventive', properties: 'C,I,A' },
  { id: 69, code: 'A.8.10', title: 'Eliminación de información', themeId: 4, themeName: 'Technological', controlType: 'preventive', properties: 'C' },
  { id: 70, code: 'A.8.11', title: 'Enmascaramiento de datos', themeId: 4, themeName: 'Technological', controlType: 'preventive', properties: 'C' },
  { id: 71, code: 'A.8.12', title: 'Prevención de fuga de datos', themeId: 4, themeName: 'Technological', controlType: 'preventive', properties: 'C' },
  { id: 72, code: 'A.8.13', title: 'Respaldo de la información', themeId: 4, themeName: 'Technological', controlType: 'corrective', properties: 'I,A' },
  { id: 73, code: 'A.8.14', title: 'Redundancia de instalaciones de procesamiento', themeId: 4, themeName: 'Technological', controlType: 'preventive', properties: 'A' },
  { id: 74, code: 'A.8.15', title: 'Registro de eventos (logging)', themeId: 4, themeName: 'Technological', controlType: 'detective', properties: 'C,I,A' },
  { id: 75, code: 'A.8.16', title: 'Actividades de monitoreo', themeId: 4, themeName: 'Technological', controlType: 'detective', properties: 'C,I,A' },
  { id: 76, code: 'A.8.17', title: 'Sincronización de relojes', themeId: 4, themeName: 'Technological', controlType: 'detective', properties: 'I' },
  { id: 77, code: 'A.8.18', title: 'Uso de programas utilitarios privilegiados', themeId: 4, themeName: 'Technological', controlType: 'preventive', properties: 'C,I,A' },
  { id: 78, code: 'A.8.19', title: 'Instalación de software en sistemas operativos', themeId: 4, themeName: 'Technological', controlType: 'preventive', properties: 'C,I,A' },
  { id: 79, code: 'A.8.20', title: 'Seguridad de redes', themeId: 4, themeName: 'Technological', controlType: 'preventive', properties: 'C,I,A' },
  { id: 80, code: 'A.8.21', title: 'Seguridad de servicios de red', themeId: 4, themeName: 'Technological', controlType: 'preventive', properties: 'C,I,A' },
  { id: 81, code: 'A.8.22', title: 'Segregación de redes', themeId: 4, themeName: 'Technological', controlType: 'preventive', properties: 'C,I' },
  { id: 82, code: 'A.8.23', title: 'Filtrado web', themeId: 4, themeName: 'Technological', controlType: 'preventive', properties: 'C' },
  { id: 83, code: 'A.8.24', title: 'Uso de criptografía', themeId: 4, themeName: 'Technological', controlType: 'preventive', properties: 'C,I' },
  { id: 84, code: 'A.8.25', title: 'Ciclo de vida de desarrollo seguro', themeId: 4, themeName: 'Technological', controlType: 'preventive', properties: 'C,I,A' },
  { id: 85, code: 'A.8.26', title: 'Requisitos de seguridad de aplicaciones', themeId: 4, themeName: 'Technological', controlType: 'preventive', properties: 'C,I,A' },
  { id: 86, code: 'A.8.27', title: 'Principios de arquitectura e ingeniería segura', themeId: 4, themeName: 'Technological', controlType: 'preventive', properties: 'C,I,A' },
  { id: 87, code: 'A.8.28', title: 'Codificación segura', themeId: 4, themeName: 'Technological', controlType: 'preventive', properties: 'C,I,A' },
  { id: 88, code: 'A.8.29', title: 'Pruebas de seguridad en desarrollo y aceptación', themeId: 4, themeName: 'Technological', controlType: 'detective', properties: 'C,I,A' },
  { id: 89, code: 'A.8.30', title: 'Desarrollo tercerizado', themeId: 4, themeName: 'Technological', controlType: 'preventive', properties: 'C,I,A' },
  { id: 90, code: 'A.8.31', title: 'Separación de entornos de desarrollo, pruebas y producción', themeId: 4, themeName: 'Technological', controlType: 'preventive', properties: 'C,I,A' },
  { id: 91, code: 'A.8.32', title: 'Gestión de cambios', themeId: 4, themeName: 'Technological', controlType: 'preventive', properties: 'C,I,A' },
  { id: 92, code: 'A.8.33', title: 'Información de pruebas', themeId: 4, themeName: 'Technological', controlType: 'preventive', properties: 'C' },
  { id: 93, code: 'A.8.34', title: 'Protección de sistemas de información durante pruebas de auditoría', themeId: 4, themeName: 'Technological', controlType: 'preventive', properties: 'C,I,A' },
];

export const mockThemes = [
  { id: 1, name: 'Organizational', description: 'Controles organizacionales para la gestión de la seguridad de la información', controlsCount: 37 },
  { id: 2, name: 'People', description: 'Controles relacionados con las personas y la cultura de seguridad', controlsCount: 8 },
  { id: 3, name: 'Physical', description: 'Controles de seguridad física y protección del entorno', controlsCount: 14 },
  { id: 4, name: 'Technological', description: 'Controles tecnológicos para la protección de sistemas de información', controlsCount: 34 },
];

const statuses: CompanyControl['status'][] = ['implemented', 'in_progress', 'pending', 'non_compliant', 'under_review'];
const maturityLevels: CompanyControl['maturityLevel'][] = ['initial', 'managed', 'defined', 'measured', 'optimized'];
const assignees = [
  { id: 1, name: 'Carlos Mendoza' },
  { id: 2, name: 'Laura García' },
  { id: 4, name: 'Diana Torres' },
  { id: 5, name: 'Miguel Sánchez' },
];

function generateCompanyControls(companyId: number, seed: number): CompanyControl[] {
  return mockIsoControls.map((ctrl, i) => {
    const s = ((i * 7 + seed) % 100);
    const statusIdx = s < 40 ? 0 : s < 60 ? 1 : s < 80 ? 2 : s < 90 ? 3 : 4;
    const status = statuses[statusIdx];
    const matIdx = status === 'implemented' ? 3 + (i % 2) : status === 'in_progress' ? 1 + (i % 2) : 0;
    const compliance = status === 'implemented' ? 100 : status === 'in_progress' ? 30 + (s % 50) : status === 'under_review' ? 70 + (s % 25) : 0;
    const assignee = assignees[i % assignees.length];

    return {
      id: ctrl.id + (companyId - 1) * 1000,
      companyId,
      controlId: ctrl.id,
      code: ctrl.code,
      title: ctrl.title,
      themeName: ctrl.themeName,
      status,
      maturityLevel: maturityLevels[matIdx],
      compliancePercentage: compliance,
      assignedUserName: status !== 'pending' ? assignee.name : null,
      assignedUserId: status !== 'pending' ? assignee.id : null,
      implementationDate: status === 'implemented' ? '2026-02-15' : null,
      reviewDate: status === 'implemented' ? '2026-08-15' : null,
      notes: null,
      createdAt: '2025-06-01T00:00:00Z',
      updatedAt: '2026-03-10T00:00:00Z',
    };
  });
}

// Company 1: TechCorp (seed 13 = original)
export const mockCompanyControls: CompanyControl[] = generateCompanyControls(1, 13);

// Company 2: Financiera del Valle (seed 37 = different distribution)
export const mockCompanyControls2: CompanyControl[] = generateCompanyControls(2, 37);

// All company controls combined
export const allMockCompanyControls: CompanyControl[] = [...mockCompanyControls, ...mockCompanyControls2];

function generateSoA(companyId: number): SoAEntry[] {
  return mockIsoControls.map(ctrl => ({
    controlId: ctrl.id,
    code: ctrl.code,
    title: ctrl.title,
    themeName: ctrl.themeName,
    applicable: companyId === 1
      ? (ctrl.id !== 52 && ctrl.id !== 73)
      : (ctrl.id !== 44 && ctrl.id !== 59),
    justification: companyId === 1
      ? (ctrl.id === 52 ? 'No aplica: la empresa opera 100% remoto' : ctrl.id === 73 ? 'No aplica: la infraestructura es 100% cloud SaaS' : null)
      : (ctrl.id === 44 ? 'No aplica: todo el personal es presencial' : ctrl.id === 59 ? 'No aplica: no se reutilizan equipos' : null),
    implementationStatus: (companyId === 1 ? (ctrl.id === 52 || ctrl.id === 73) : (ctrl.id === 44 || ctrl.id === 59))
      ? 'not_applicable'
      : 'in_progress',
  }));
}

export const mockSoA: SoAEntry[] = generateSoA(1);
export const mockSoA2: SoAEntry[] = generateSoA(2);
export const allMockSoA: Record<number, SoAEntry[]> = { 1: mockSoA, 2: mockSoA2 };
