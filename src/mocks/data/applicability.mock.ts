/**
 * Mock data for control applicability rules (sector + size combinations)
 */

export interface ApplicabilityRule {
  id: number;
  controlId: number;
  sectorId: number;
  sizeId: number;
  priority: number;
  mandatory: boolean;
}

// Simplified mock applicability rules
// In real usage, these would come from the backend's control_applicability table
export const mockApplicabilityRules: ApplicabilityRule[] = [
  // TechCorp (sector: 1-Tecnología, size: 4-Grande) — all controls applicable, HIGH priority
  ...Array.from({ length: 93 }, (_, i) => ({
    id: i + 1,
    controlId: i + 1,
    sectorId: 1,
    sizeId: 4,
    priority: i < 30 ? 1 : i < 60 ? 2 : 3,
    mandatory: i < 50,
  })),

  // Financiera del Valle (sector: 2-Financiero, size: 3-Mediana)
  ...Array.from({ length: 93 }, (_, i) => ({
    id: 1000 + i + 1,
    controlId: i + 1,
    sectorId: 2,
    sizeId: 3,
    priority: i < 40 ? 1 : i < 70 ? 2 : 3,
    mandatory: i < 60,
  })),

  // Hospital San Rafael (sector: 3-Salud, size: 4-Grande)
  ...Array.from({ length: 93 }, (_, i) => ({
    id: 2000 + i + 1,
    controlId: i + 1,
    sectorId: 3,
    sizeId: 4,
    priority: i < 35 ? 1 : i < 65 ? 2 : 3,
    mandatory: i < 55,
  })),

  // Generic rules for other sectors/sizes
  ...Array.from({ length: 93 }, (_, i) => ({
    id: 3000 + i + 1,
    controlId: i + 1,
    sectorId: 4,
    sizeId: 2,
    priority: i < 25 ? 1 : i < 50 ? 2 : 3,
    mandatory: i < 35,
  })),
];

export interface GenerateControlsResponse {
  total: number;
  applicable: number;
  mandatory: number;
  recommended: number;
}

export function generateMockControlsResult(
  sector: string,
  size: string,
): GenerateControlsResponse {
  // Simple logic: sector and size affect the number of applicable controls
  const sectorFactor: Record<string, number> = {
    Tecnología: 0.95,
    Financiero: 0.98,
    Salud: 0.97,
    Gobierno: 0.99,
    Educación: 0.85,
    Manufactura: 0.80,
    Retail: 0.75,
  };

  const sizeFactor: Record<string, number> = {
    Micro: 0.60,
    Pequeña: 0.75,
    Mediana: 0.90,
    Grande: 1.0,
  };

  const baseApplicable = Math.round(
    93 * (sectorFactor[sector] || 0.8) * (sizeFactor[size] || 0.8),
  );
  const mandatory = Math.round(baseApplicable * 0.6);

  return {
    total: 93,
    applicable: Math.max(15, baseApplicable), // At least 15 controls
    mandatory: Math.max(8, mandatory),
    recommended: Math.max(5, baseApplicable - mandatory),
  };
}
