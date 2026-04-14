// ─── Threat Map ──────────────────────────────────────────────────────────────

export interface SeverityBreakdown {
  low: number;
  medium: number;
  high: number;
  critical: number;
}

export interface ThreatMapCountry {
  code: string;
  total_attacks: number;
  lat: number | null;
  lon: number | null;
  by_severity: SeverityBreakdown;
  avg_severity_score: number;
  top_techniques: string[];
}

export interface ThreatMapResponse {
  countries: ThreatMapCountry[];
  total_events: number;
  generated_at?: string;
}

// ─── Threat Timeline ─────────────────────────────────────────────────────────

export interface TimelineDay {
  date: string;
  attacks: Record<string, number>;
}

export interface ThreatTimelineResponse {
  timeline: TimelineDay[];
  attack_type_breakdown: Record<string, number>;
}

// ─── MITRE-ISO Correlation ───────────────────────────────────────────────────

export interface ControlStatusEntry {
  control_code: string;
  status: string;
}

export interface TechniqueEntry {
  technique_id: string;
  technique_name: string;
  tactic: string;
  frequency: number;
  frequency_pct: number;
  severity_avg: number;
  iso_controls: ControlStatusEntry[];
  gap_weight: number;
}

export interface CorrelationSummary {
  total_active_techniques: number;
  covered: number;
  partial: number;
  gaps: number;
  coverage_percentage: number;
}

export interface MitreIsoCorrelationResponse {
  company_id: number;
  covered_techniques: TechniqueEntry[];
  partial_techniques: TechniqueEntry[];
  gap_techniques: TechniqueEntry[];
  summary: CorrelationSummary;
  generated_at?: string;
  has_data?: boolean;
}

// ─── Company Risk Score ───────────────────────────────────────────────────────

export interface RiskBreakdown {
  threat_gap_score: number;
  asset_exposure_score: number;
  control_coverage_pct: number;
  uncovered_techniques: number;
  partial_techniques: number;
  covered_techniques: number;
}

export interface TopRisk {
  technique_id: string;
  technique_name: string;
  tactic: string;
  frequency_pct: number;
  severity_avg: number;
}

export interface CompanyRiskScoreResponse {
  company_id: number;
  company_name: string;
  sector: string;
  overall_score: number | null;
  risk_level: 'low' | 'medium' | 'high' | 'critical' | null;
  breakdown: RiskBreakdown | null;
  top_risks: TopRisk[];
  sector_avg_score: number | null;
  generated_at?: string;
  has_data?: boolean;
}

// ─── Pipeline ────────────────────────────────────────────────────────────────

export interface PipelineStatus {
  status: string;
  message: string;
  duration_seconds?: number;
  jobs?: Record<string, unknown>;
}

export interface BigDataHealth {
  status: string;
  data_available: boolean;
}
