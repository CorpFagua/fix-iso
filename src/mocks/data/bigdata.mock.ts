import type {
  ThreatMapResponse,
  MitreIsoCorrelationResponse,
  CompanyRiskScoreResponse,
  ThreatTimelineResponse,
} from '../../types/bigdata.types';

// ─── Threat Map ───────────────────────────────────────────────────────────────
export const mockThreatMap: ThreatMapResponse = {
  total_events: 1000000,
  generated_at: '2026-04-13T00:00:00',
  countries: [
    { code: 'CN', total_attacks: 248320, lat: 35.86, lon: 104.19, avg_severity_score: 2.9, top_techniques: ['T1046', 'T1595', 'T1110'], by_severity: { low: 22000, medium: 95000, high: 112320, critical: 19000 } },
    { code: 'RU', total_attacks: 192000, lat: 61.52, lon: 105.31, avg_severity_score: 3.1, top_techniques: ['T1110', 'T1566', 'T1190'], by_severity: { low: 12000, medium: 60000, high: 98000, critical: 22000 } },
    { code: 'US', total_attacks: 115000, lat: 37.09, lon: -95.71, avg_severity_score: 2.5, top_techniques: ['T1566', 'T1046', 'T1071'], by_severity: { low: 30000, medium: 55000, high: 25000, critical: 5000 } },
    { code: 'BR', total_attacks: 87400, lat: -14.23, lon: -51.92, avg_severity_score: 2.3, top_techniques: ['T1566', 'T1598', 'T1110'], by_severity: { low: 28000, medium: 42000, high: 15400, critical: 2000 } },
    { code: 'IN', total_attacks: 72000, lat: 20.59, lon: 78.96, avg_severity_score: 2.1, top_techniques: ['T1046', 'T1110', 'T1562'], by_severity: { low: 30000, medium: 32000, high: 9000, critical: 1000 } },
    { code: 'NG', total_attacks: 63000, lat: 9.08, lon: 8.67, avg_severity_score: 2.6, top_techniques: ['T1566', 'T1598', 'T1078'], by_severity: { low: 15000, medium: 28000, high: 18000, critical: 2000 } },
    { code: 'KP', total_attacks: 55000, lat: 40.33, lon: 127.51, avg_severity_score: 3.6, top_techniques: ['T1190', 'T1561', 'T1070'], by_severity: { low: 2000, medium: 10000, high: 25000, critical: 18000 } },
    { code: 'UA', total_attacks: 41000, lat: 48.37, lon: 31.16, avg_severity_score: 2.7, top_techniques: ['T1046', 'T1595', 'T1562'], by_severity: { low: 10000, medium: 18000, high: 10000, critical: 3000 } },
    { code: 'TR', total_attacks: 35000, lat: 38.96, lon: 35.24, avg_severity_score: 2.2, top_techniques: ['T1110', 'T1046', 'T1566'], by_severity: { low: 14000, medium: 16000, high: 4500, critical: 500 } },
    { code: 'VN', total_attacks: 29000, lat: 14.05, lon: 108.27, avg_severity_score: 2.4, top_techniques: ['T1046', 'T1562', 'T1110'], by_severity: { low: 10000, medium: 14000, high: 4500, critical: 500 } },
  ],
};

// ─── Threat Timeline ─────────────────────────────────────────────────────────
function generateTimeline(): ThreatTimelineResponse['timeline'] {
  const days = [];
  const start = new Date('2026-01-14');
  for (let i = 0; i < 89; i++) {
    const d = new Date(start);
    d.setDate(start.getDate() + i);
    days.push({
      date: d.toISOString().slice(0, 10),
      attacks: {
        scan: Math.round(3000 + Math.random() * 1500),
        phishing: Math.round(2000 + Math.random() * 800),
        brute_force: Math.round(1200 + Math.random() * 600),
        malware: Math.round(800 + Math.random() * 400),
        exploit: Math.round(400 + Math.random() * 200),
      },
    });
  }
  return days;
}

export const mockThreatTimeline: ThreatTimelineResponse = {
  timeline: generateTimeline(),
  attack_type_breakdown: {
    scan: 400000,
    phishing: 250000,
    brute_force: 150000,
    malware: 100000,
    exploit: 50000,
    botnet: 30000,
    ddos: 20000,
  },
};

// ─── MITRE-ISO Correlation ────────────────────────────────────────────────────
export const mockCorrelation: MitreIsoCorrelationResponse = {
  company_id: 1,
  generated_at: '2026-04-13T00:00:00',
  summary: {
    total_active_techniques: 18,
    covered: 6,
    partial: 4,
    gaps: 8,
    coverage_percentage: 33.3,
  },
  covered_techniques: [
    { technique_id: 'T1566', technique_name: 'Phishing', tactic: 'initial_access', frequency: 250000, frequency_pct: 25.0, severity_avg: 3.0, gap_weight: 0.1, iso_controls: [{ control_code: 'A.6.3', status: 'implemented' }, { control_code: 'A.8.7', status: 'implemented' }] },
    { technique_id: 'T1110', technique_name: 'Brute Force', tactic: 'credential_access', frequency: 150000, frequency_pct: 15.0, severity_avg: 3.2, gap_weight: 0.1, iso_controls: [{ control_code: 'A.8.5', status: 'implemented' }, { control_code: 'A.6.4', status: 'implemented' }] },
    { technique_id: 'T1598', technique_name: 'Phishing for Info', tactic: 'reconnaissance', frequency: 80000, frequency_pct: 8.0, severity_avg: 2.5, gap_weight: 0.1, iso_controls: [{ control_code: 'A.6.1', status: 'implemented' }] },
    { technique_id: 'T1592', technique_name: 'Gather Victim Info', tactic: 'reconnaissance', frequency: 60000, frequency_pct: 6.0, severity_avg: 1.8, gap_weight: 0.1, iso_controls: [{ control_code: 'A.5.1', status: 'implemented' }] },
    { technique_id: 'T1078', technique_name: 'Valid Accounts', tactic: 'initial_access', frequency: 45000, frequency_pct: 4.5, severity_avg: 3.5, gap_weight: 0.1, iso_controls: [{ control_code: 'A.8.5', status: 'implemented' }] },
    { technique_id: 'T1018', technique_name: 'Remote System Discovery', tactic: 'discovery', frequency: 30000, frequency_pct: 3.0, severity_avg: 2.0, gap_weight: 0.1, iso_controls: [{ control_code: 'A.5.1', status: 'implemented' }] },
  ],
  partial_techniques: [
    { technique_id: 'T1071', technique_name: 'App Layer Protocol (C2)', tactic: 'command_and_control', frequency: 95000, frequency_pct: 9.5, severity_avg: 3.3, gap_weight: 0.5, iso_controls: [{ control_code: 'A.8.10', status: 'in_progress' }, { control_code: 'A.8.16', status: 'pending' }] },
    { technique_id: 'T1562', technique_name: 'Impair Defenses', tactic: 'defense_evasion', frequency: 70000, frequency_pct: 7.0, severity_avg: 3.6, gap_weight: 0.5, iso_controls: [{ control_code: 'A.5.2', status: 'in_progress' }] },
    { technique_id: 'T1046', technique_name: 'Network Service Discovery', tactic: 'discovery', frequency: 55000, frequency_pct: 5.5, severity_avg: 2.2, gap_weight: 0.5, iso_controls: [{ control_code: 'A.8.12', status: 'in_progress' }] },
    { technique_id: 'T1556', technique_name: 'Modify Auth Process', tactic: 'credential_access', frequency: 40000, frequency_pct: 4.0, severity_avg: 3.8, gap_weight: 0.5, iso_controls: [{ control_code: 'A.8.5', status: 'in_progress' }] },
  ],
  gap_techniques: [
    { technique_id: 'T1190', technique_name: 'Exploit Public-Facing App', tactic: 'initial_access', frequency: 120000, frequency_pct: 12.0, severity_avg: 3.9, gap_weight: 1.0, iso_controls: [{ control_code: 'A.8.28', status: 'not_assigned' }] },
    { technique_id: 'T1595', technique_name: 'Active Scanning', tactic: 'reconnaissance', frequency: 100000, frequency_pct: 10.0, severity_avg: 1.5, gap_weight: 1.0, iso_controls: [{ control_code: 'A.5.7', status: 'not_assigned' }] },
    { technique_id: 'T1070', technique_name: 'Indicator Removal', tactic: 'defense_evasion', frequency: 75000, frequency_pct: 7.5, severity_avg: 3.4, gap_weight: 1.0, iso_controls: [{ control_code: 'A.5.2', status: 'not_assigned' }] },
    { technique_id: 'T1041', technique_name: 'Exfiltration Over C2', tactic: 'exfiltration', frequency: 50000, frequency_pct: 5.0, severity_avg: 3.7, gap_weight: 1.0, iso_controls: [{ control_code: 'A.8.9', status: 'not_assigned' }] },
    { technique_id: 'T1098', technique_name: 'Account Manipulation', tactic: 'persistence', frequency: 35000, frequency_pct: 3.5, severity_avg: 3.2, gap_weight: 1.0, iso_controls: [{ control_code: 'A.8.21', status: 'not_assigned' }] },
    { technique_id: 'T1561', technique_name: 'Disk Wipe', tactic: 'impact', frequency: 22000, frequency_pct: 2.2, severity_avg: 4.0, gap_weight: 1.0, iso_controls: [{ control_code: 'A.8.25', status: 'not_assigned' }] },
    { technique_id: 'T1200', technique_name: 'Hardware Additions', tactic: 'initial_access', frequency: 15000, frequency_pct: 1.5, severity_avg: 3.0, gap_weight: 1.0, iso_controls: [{ control_code: 'A.7.1', status: 'not_assigned' }] },
    { technique_id: 'T1052', technique_name: 'Exfiltration Over Physical', tactic: 'exfiltration', frequency: 8000, frequency_pct: 0.8, severity_avg: 2.8, gap_weight: 1.0, iso_controls: [{ control_code: 'A.8.24', status: 'not_assigned' }] },
  ],
};

// ─── Risk Score ───────────────────────────────────────────────────────────────
export const mockRiskScore: CompanyRiskScoreResponse = {
  company_id: 1,
  company_name: 'TechCorp S.A.',
  sector: 'Technology',
  overall_score: 58.4,
  risk_level: 'high',
  sector_avg_score: 52.1,
  generated_at: '2026-04-13T00:00:00',
  breakdown: {
    threat_gap_score: 45.2,
    asset_exposure_score: 13.2,
    control_coverage_pct: 33.3,
    uncovered_techniques: 8,
    partial_techniques: 4,
    covered_techniques: 6,
  },
  top_risks: [
    { technique_id: 'T1190', technique_name: 'Exploit Public-Facing App', tactic: 'initial_access', frequency_pct: 12.0, severity_avg: 3.9 },
    { technique_id: 'T1595', technique_name: 'Active Scanning', tactic: 'reconnaissance', frequency_pct: 10.0, severity_avg: 1.5 },
    { technique_id: 'T1070', technique_name: 'Indicator Removal', tactic: 'defense_evasion', frequency_pct: 7.5, severity_avg: 3.4 },
    { technique_id: 'T1041', technique_name: 'Exfiltration Over C2', tactic: 'exfiltration', frequency_pct: 5.0, severity_avg: 3.7 },
    { technique_id: 'T1098', technique_name: 'Account Manipulation', tactic: 'persistence', frequency_pct: 3.5, severity_avg: 3.2 },
  ],
};

// ─── Per-company mock variants ────────────────────────────────────────────────
// Company 2: Mediana empresa — riesgo medio, cobertura parcial
const mockCorrelationCompany2: MitreIsoCorrelationResponse = {
  company_id: 2,
  generated_at: '2026-04-13T00:00:00',
  summary: { total_active_techniques: 18, covered: 10, partial: 5, gaps: 3, coverage_percentage: 55.6 },
  covered_techniques: [
    { technique_id: 'T1566', technique_name: 'Phishing', tactic: 'initial_access', frequency: 250000, frequency_pct: 25.0, severity_avg: 3.0, gap_weight: 0.1, iso_controls: [{ control_code: 'A.6.3', status: 'implemented' }] },
    { technique_id: 'T1110', technique_name: 'Brute Force', tactic: 'credential_access', frequency: 150000, frequency_pct: 15.0, severity_avg: 3.2, gap_weight: 0.1, iso_controls: [{ control_code: 'A.8.5', status: 'implemented' }] },
    { technique_id: 'T1598', technique_name: 'Phishing for Info', tactic: 'reconnaissance', frequency: 80000, frequency_pct: 8.0, severity_avg: 2.5, gap_weight: 0.1, iso_controls: [{ control_code: 'A.6.1', status: 'implemented' }] },
    { technique_id: 'T1592', technique_name: 'Gather Victim Info', tactic: 'reconnaissance', frequency: 60000, frequency_pct: 6.0, severity_avg: 1.8, gap_weight: 0.1, iso_controls: [{ control_code: 'A.5.1', status: 'implemented' }] },
    { technique_id: 'T1078', technique_name: 'Valid Accounts', tactic: 'initial_access', frequency: 45000, frequency_pct: 4.5, severity_avg: 3.5, gap_weight: 0.1, iso_controls: [{ control_code: 'A.8.5', status: 'implemented' }] },
    { technique_id: 'T1046', technique_name: 'Network Service Discovery', tactic: 'discovery', frequency: 55000, frequency_pct: 5.5, severity_avg: 2.2, gap_weight: 0.1, iso_controls: [{ control_code: 'A.8.12', status: 'implemented' }] },
    { technique_id: 'T1071', technique_name: 'App Layer Protocol (C2)', tactic: 'command_and_control', frequency: 95000, frequency_pct: 9.5, severity_avg: 3.3, gap_weight: 0.1, iso_controls: [{ control_code: 'A.8.16', status: 'implemented' }] },
    { technique_id: 'T1562', technique_name: 'Impair Defenses', tactic: 'defense_evasion', frequency: 70000, frequency_pct: 7.0, severity_avg: 3.6, gap_weight: 0.1, iso_controls: [{ control_code: 'A.5.2', status: 'implemented' }] },
    { technique_id: 'T1018', technique_name: 'Remote System Discovery', tactic: 'discovery', frequency: 30000, frequency_pct: 3.0, severity_avg: 2.0, gap_weight: 0.1, iso_controls: [{ control_code: 'A.5.1', status: 'implemented' }] },
    { technique_id: 'T1556', technique_name: 'Modify Auth Process', tactic: 'credential_access', frequency: 40000, frequency_pct: 4.0, severity_avg: 3.8, gap_weight: 0.1, iso_controls: [{ control_code: 'A.8.5', status: 'implemented' }] },
  ],
  partial_techniques: [
    { technique_id: 'T1190', technique_name: 'Exploit Public-Facing App', tactic: 'initial_access', frequency: 120000, frequency_pct: 12.0, severity_avg: 3.9, gap_weight: 0.5, iso_controls: [{ control_code: 'A.8.28', status: 'in_progress' }] },
    { technique_id: 'T1595', technique_name: 'Active Scanning', tactic: 'reconnaissance', frequency: 100000, frequency_pct: 10.0, severity_avg: 1.5, gap_weight: 0.5, iso_controls: [{ control_code: 'A.5.7', status: 'in_progress' }] },
    { technique_id: 'T1070', technique_name: 'Indicator Removal', tactic: 'defense_evasion', frequency: 75000, frequency_pct: 7.5, severity_avg: 3.4, gap_weight: 0.5, iso_controls: [{ control_code: 'A.5.2', status: 'in_progress' }] },
    { technique_id: 'T1041', technique_name: 'Exfiltration Over C2', tactic: 'exfiltration', frequency: 50000, frequency_pct: 5.0, severity_avg: 3.7, gap_weight: 0.5, iso_controls: [{ control_code: 'A.8.9', status: 'in_progress' }] },
    { technique_id: 'T1098', technique_name: 'Account Manipulation', tactic: 'persistence', frequency: 35000, frequency_pct: 3.5, severity_avg: 3.2, gap_weight: 0.5, iso_controls: [{ control_code: 'A.8.21', status: 'in_progress' }] },
  ],
  gap_techniques: [
    { technique_id: 'T1200', technique_name: 'Hardware Additions', tactic: 'initial_access', frequency: 15000, frequency_pct: 1.5, severity_avg: 3.0, gap_weight: 1.0, iso_controls: [{ control_code: 'A.7.1', status: 'not_assigned' }] },
    { technique_id: 'T1561', technique_name: 'Disk Wipe', tactic: 'impact', frequency: 22000, frequency_pct: 2.2, severity_avg: 4.0, gap_weight: 1.0, iso_controls: [{ control_code: 'A.8.25', status: 'not_assigned' }] },
    { technique_id: 'T1052', technique_name: 'Exfiltration Over Physical', tactic: 'exfiltration', frequency: 8000, frequency_pct: 0.8, severity_avg: 2.8, gap_weight: 1.0, iso_controls: [{ control_code: 'A.8.24', status: 'not_assigned' }] },
  ],
};

const mockRiskScoreCompany2: CompanyRiskScoreResponse = {
  company_id: 2,
  company_name: 'Industrias Mediana S.A.S.',
  sector: 'Manufacturing',
  overall_score: 34.1,
  risk_level: 'medium',
  sector_avg_score: 48.3,
  generated_at: '2026-04-13T00:00:00',
  breakdown: {
    threat_gap_score: 22.5,
    asset_exposure_score: 11.6,
    control_coverage_pct: 55.6,
    uncovered_techniques: 3,
    partial_techniques: 5,
    covered_techniques: 10,
  },
  top_risks: [
    { technique_id: 'T1190', technique_name: 'Exploit Public-Facing App', tactic: 'initial_access', frequency_pct: 12.0, severity_avg: 3.9 },
    { technique_id: 'T1070', technique_name: 'Indicator Removal', tactic: 'defense_evasion', frequency_pct: 7.5, severity_avg: 3.4 },
    { technique_id: 'T1561', technique_name: 'Disk Wipe', tactic: 'impact', frequency_pct: 2.2, severity_avg: 4.0 },
  ],
};

// Company 3: Empresa crítica — riesgo crítico, casi sin controles
const mockCorrelationCompany3: MitreIsoCorrelationResponse = {
  company_id: 3,
  generated_at: '2026-04-13T00:00:00',
  summary: { total_active_techniques: 18, covered: 2, partial: 2, gaps: 14, coverage_percentage: 11.1 },
  covered_techniques: [
    { technique_id: 'T1566', technique_name: 'Phishing', tactic: 'initial_access', frequency: 250000, frequency_pct: 25.0, severity_avg: 3.0, gap_weight: 0.1, iso_controls: [{ control_code: 'A.6.3', status: 'implemented' }] },
    { technique_id: 'T1110', technique_name: 'Brute Force', tactic: 'credential_access', frequency: 150000, frequency_pct: 15.0, severity_avg: 3.2, gap_weight: 0.1, iso_controls: [{ control_code: 'A.8.5', status: 'implemented' }] },
  ],
  partial_techniques: [
    { technique_id: 'T1071', technique_name: 'App Layer Protocol (C2)', tactic: 'command_and_control', frequency: 95000, frequency_pct: 9.5, severity_avg: 3.3, gap_weight: 0.5, iso_controls: [{ control_code: 'A.8.16', status: 'in_progress' }] },
    { technique_id: 'T1595', technique_name: 'Active Scanning', tactic: 'reconnaissance', frequency: 100000, frequency_pct: 10.0, severity_avg: 1.5, gap_weight: 0.5, iso_controls: [{ control_code: 'A.5.7', status: 'pending' }] },
  ],
  gap_techniques: [
    { technique_id: 'T1190', technique_name: 'Exploit Public-Facing App', tactic: 'initial_access', frequency: 120000, frequency_pct: 12.0, severity_avg: 3.9, gap_weight: 1.0, iso_controls: [{ control_code: 'A.8.28', status: 'not_assigned' }] },
    { technique_id: 'T1070', technique_name: 'Indicator Removal', tactic: 'defense_evasion', frequency: 75000, frequency_pct: 7.5, severity_avg: 3.4, gap_weight: 1.0, iso_controls: [{ control_code: 'A.5.2', status: 'not_assigned' }] },
    { technique_id: 'T1041', technique_name: 'Exfiltration Over C2', tactic: 'exfiltration', frequency: 50000, frequency_pct: 5.0, severity_avg: 3.7, gap_weight: 1.0, iso_controls: [{ control_code: 'A.8.9', status: 'not_assigned' }] },
    { technique_id: 'T1098', technique_name: 'Account Manipulation', tactic: 'persistence', frequency: 35000, frequency_pct: 3.5, severity_avg: 3.2, gap_weight: 1.0, iso_controls: [{ control_code: 'A.8.21', status: 'not_assigned' }] },
    { technique_id: 'T1561', technique_name: 'Disk Wipe', tactic: 'impact', frequency: 22000, frequency_pct: 2.2, severity_avg: 4.0, gap_weight: 1.0, iso_controls: [{ control_code: 'A.8.25', status: 'not_assigned' }] },
    { technique_id: 'T1592', technique_name: 'Gather Victim Info', tactic: 'reconnaissance', frequency: 60000, frequency_pct: 6.0, severity_avg: 1.8, gap_weight: 1.0, iso_controls: [{ control_code: 'A.5.1', status: 'not_assigned' }] },
    { technique_id: 'T1046', technique_name: 'Network Service Discovery', tactic: 'discovery', frequency: 55000, frequency_pct: 5.5, severity_avg: 2.2, gap_weight: 1.0, iso_controls: [{ control_code: 'A.8.12', status: 'not_assigned' }] },
    { technique_id: 'T1562', technique_name: 'Impair Defenses', tactic: 'defense_evasion', frequency: 70000, frequency_pct: 7.0, severity_avg: 3.6, gap_weight: 1.0, iso_controls: [{ control_code: 'A.5.2', status: 'not_assigned' }] },
    { technique_id: 'T1078', technique_name: 'Valid Accounts', tactic: 'initial_access', frequency: 45000, frequency_pct: 4.5, severity_avg: 3.5, gap_weight: 1.0, iso_controls: [{ control_code: 'A.8.5', status: 'not_assigned' }] },
    { technique_id: 'T1200', technique_name: 'Hardware Additions', tactic: 'initial_access', frequency: 15000, frequency_pct: 1.5, severity_avg: 3.0, gap_weight: 1.0, iso_controls: [{ control_code: 'A.7.1', status: 'not_assigned' }] },
    { technique_id: 'T1556', technique_name: 'Modify Auth Process', tactic: 'credential_access', frequency: 40000, frequency_pct: 4.0, severity_avg: 3.8, gap_weight: 1.0, iso_controls: [{ control_code: 'A.8.5', status: 'not_assigned' }] },
    { technique_id: 'T1052', technique_name: 'Exfiltration Over Physical', tactic: 'exfiltration', frequency: 8000, frequency_pct: 0.8, severity_avg: 2.8, gap_weight: 1.0, iso_controls: [{ control_code: 'A.8.24', status: 'not_assigned' }] },
    { technique_id: 'T1598', technique_name: 'Phishing for Info', tactic: 'reconnaissance', frequency: 80000, frequency_pct: 8.0, severity_avg: 2.5, gap_weight: 1.0, iso_controls: [{ control_code: 'A.6.1', status: 'not_assigned' }] },
    { technique_id: 'T1018', technique_name: 'Remote System Discovery', tactic: 'discovery', frequency: 30000, frequency_pct: 3.0, severity_avg: 2.0, gap_weight: 1.0, iso_controls: [{ control_code: 'A.5.1', status: 'not_assigned' }] },
  ],
};

const mockRiskScoreCompany3: CompanyRiskScoreResponse = {
  company_id: 3,
  company_name: 'StartupTech Colombia',
  sector: 'Technology',
  overall_score: 81.7,
  risk_level: 'critical',
  sector_avg_score: 52.1,
  generated_at: '2026-04-13T00:00:00',
  breakdown: {
    threat_gap_score: 65.0,
    asset_exposure_score: 16.7,
    control_coverage_pct: 11.1,
    uncovered_techniques: 14,
    partial_techniques: 2,
    covered_techniques: 2,
  },
  top_risks: [
    { technique_id: 'T1190', technique_name: 'Exploit Public-Facing App', tactic: 'initial_access', frequency_pct: 12.0, severity_avg: 3.9 },
    { technique_id: 'T1562', technique_name: 'Impair Defenses', tactic: 'defense_evasion', frequency_pct: 7.0, severity_avg: 3.6 },
    { technique_id: 'T1041', technique_name: 'Exfiltration Over C2', tactic: 'exfiltration', frequency_pct: 5.0, severity_avg: 3.7 },
    { technique_id: 'T1561', technique_name: 'Disk Wipe', tactic: 'impact', frequency_pct: 2.2, severity_avg: 4.0 },
    { technique_id: 'T1556', technique_name: 'Modify Auth Process', tactic: 'credential_access', frequency_pct: 4.0, severity_avg: 3.8 },
  ],
};

// Maps para lookup rápido por companyId
export const mockCorrelationByCompany: Record<number, MitreIsoCorrelationResponse> = {
  1: mockCorrelation,
  2: mockCorrelationCompany2,
  3: mockCorrelationCompany3,
};

export const mockRiskScoreByCompany: Record<number, CompanyRiskScoreResponse> = {
  1: mockRiskScore,
  2: mockRiskScoreCompany2,
  3: mockRiskScoreCompany3,
};

