export type AssetType =
  | 'information'
  | 'software'
  | 'hardware'
  | 'service'
  | 'people'
  | 'intangible';

export type AssetClassification =
  | 'public'
  | 'internal'
  | 'confidential'
  | 'restricted';

export type AssetStatus = 'active' | 'retired' | 'disposed';

export type RiskLevel = 'low' | 'medium' | 'high' | 'critical';
export type RiskTreatment = 'mitigate' | 'accept' | 'transfer' | 'avoid';

export interface Asset {
  id: number;
  companyId: number;
  name: string;
  description: string | null;
  assetType: AssetType;
  classification: AssetClassification;
  ownerName: string;
  ownerId: number;
  custodianName: string | null;
  custodianId: number | null;
  location: string | null;
  status: AssetStatus;
  risksCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateAssetPayload {
  name: string;
  description?: string;
  assetType: AssetType;
  classification: AssetClassification;
  ownerId: number;
  custodianId?: number;
  location?: string;
}

export interface UpdateAssetPayload {
  name?: string;
  description?: string;
  assetType?: AssetType;
  classification?: AssetClassification;
  ownerId?: number;
  custodianId?: number;
  location?: string;
  status?: AssetStatus;
}

export interface AssetRiskAssessment {
  id: number;
  assetId: number;
  threat: string;
  vulnerability: string;
  likelihood: number;
  impact: number;
  riskScore: number;
  riskLevel: RiskLevel;
  treatment: RiskTreatment;
  treatmentPlan: string | null;
  residualRiskScore: number | null;
  assessedByName: string;
  createdAt: string;
}

export interface CreateRiskPayload {
  threat: string;
  vulnerability: string;
  likelihood: number;
  impact: number;
  treatment: RiskTreatment;
  treatmentPlan?: string;
}
