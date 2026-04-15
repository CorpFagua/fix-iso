import { Card, Col, Row, Tag, Typography, Space, List, Tooltip, Progress, Alert } from 'antd';
import { Gauge } from '@ant-design/charts';
import { InfoCircleOutlined } from '@ant-design/icons';
import type { CompanyRiskScoreResponse } from '../../types/bigdata.types';

const { Text, Title } = Typography;

const RISK_COLOR: Record<string, string> = {
  critical: '#cf1322',
  high: '#fa541c',
  medium: '#faad14',
  low: '#52c41a',
};

const RISK_LABEL_ES: Record<string, string> = {
  critical: 'Crítico',
  high: 'Alto',
  medium: 'Medio',
  low: 'Bajo',
};

const TACTIC_LABELS: Record<string, string> = {
  reconnaissance: 'Reconocimiento',
  initial_access: 'Acceso Inicial',
  credential_access: 'Credenciales',
  defense_evasion: 'Evasión',
  discovery: 'Descubrimiento',
  lateral_movement: 'Mov. Lateral',
  command_and_control: 'C2',
  exfiltration: 'Exfiltración',
  impact: 'Impacto',
  execution: 'Ejecución',
  persistence: 'Persistencia',
  unknown: 'Desconocido',
};

interface Props {
  data: CompanyRiskScoreResponse;
}

export default function RiskScoreSection({ data }: Props) {
  if (data.has_data === false) {
    return (
      <Alert
        type="info"
        icon={<InfoCircleOutlined />}
        showIcon
        message="Sin controles ISO asignados"
        description="Esta empresa aún no tiene controles ISO 27001 registrados. Asigna controles desde la sección de gestión para calcular el score de riesgo real."
        style={{ borderRadius: 8 }}
      />
    );
  }

  const overallScore = data.overall_score ?? 0;
  const riskLevel = data.risk_level ?? '';
  const riskColor = RISK_COLOR[riskLevel] || '#8c8c8c';

  const gaugeConfig = {
    data: { target: overallScore, total: 100, name: 'Riesgo' },
    scale: {
      color: {
        range: ['#52c41a', '#faad14', '#fa541c', '#cf1322'],
      },
    },
    style: {
      textContent: () =>
        `${overallScore.toFixed(1)}\n${RISK_LABEL_ES[riskLevel] || riskLevel || ''}`,  
    },
    height: 220,
  };

  const breakdown = data.breakdown!;

  return (
    <Space direction="vertical" size={20} style={{ width: '100%' }}>
      <Row gutter={[20, 20]}>
        {/* Gauge */}
        <Col xs={24} md={8}>
          <Card
            style={{ textAlign: 'center' }}
            title="Score de Riesgo Global"
          >
            <Gauge {...gaugeConfig} />
            <div style={{ marginTop: 8 }}>
              <Tag color={riskColor} style={{ fontSize: 14, padding: '4px 12px' }}>
                {RISK_LABEL_ES[riskLevel] || riskLevel}
              </Tag>
            </div>
          </Card>
        </Col>

        {/* Breakdown */}
        <Col xs={24} md={8}>
          <Card title="Composición del score">
            <Space direction="vertical" size={16} style={{ width: '100%' }}>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Text>Brechas de control</Text>
                  <Text strong>{breakdown.threat_gap_score.toFixed(1)} / 75</Text>
                </div>
                <Progress
                  percent={(breakdown.threat_gap_score / 75) * 100}
                  strokeColor="#fa541c"
                  showInfo={false}
                  size="small"
                />
              </div>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Text>Exposición de activos</Text>
                  <Text strong>{breakdown.asset_exposure_score.toFixed(1)} / 25</Text>
                </div>
                <Progress
                  percent={(breakdown.asset_exposure_score / 25) * 100}
                  strokeColor="#faad14"
                  showInfo={false}
                  size="small"
                />
              </div>

              <div style={{ borderTop: '1px solid #f0f0f0', paddingTop: 12 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                  <Text type="secondary">Técnicas sin control</Text>
                  <Tag color="red">{breakdown.uncovered_techniques}</Tag>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                  <Text type="secondary">Técnicas en progreso</Text>
                  <Tag color="orange">{breakdown.partial_techniques}</Tag>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Text type="secondary">Técnicas cubiertas</Text>
                  <Tag color="green">{breakdown.covered_techniques}</Tag>
                </div>
              </div>
            </Space>
          </Card>
        </Col>

        {/* Sector comparison */}
        <Col xs={24} md={8}>
          <Card title="Comparación con el sector">
            <Space direction="vertical" size={20} style={{ width: '100%' }}>
              <div style={{ textAlign: 'center' }}>
                <Title level={4} style={{ color: riskColor, margin: 0 }}>
                  {overallScore.toFixed(1)}
                </Title>
                <Text type="secondary">{data.company_name}</Text>
              </div>

              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                  <Text>Tu empresa</Text>
                  <Text strong style={{ color: riskColor }}>{overallScore.toFixed(1)}</Text>
                </div>
                <Progress
                  percent={overallScore}
                  strokeColor={riskColor}
                  showInfo={false}
                />
              </div>

              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                  <Text>Promedio sector ({data.sector})</Text>
                  <Text strong>{data.sector_avg_score != null ? data.sector_avg_score.toFixed(1) : '—'}</Text>
                </div>
                <Progress
                  percent={data.sector_avg_score ?? 0}
                  strokeColor="#8c8c8c"
                  showInfo={false}
                />
              </div>

              <div style={{ textAlign: 'center', paddingTop: 8 }}>
                {data.sector_avg_score == null ? (
                  <Tag color="default">Sin datos de sector para comparar</Tag>
                ) : overallScore <= data.sector_avg_score ? (
                  <Tag color="green">Mejor que el promedio del sector</Tag>
                ) : (
                  <Tag color="red">Por encima del promedio del sector</Tag>
                )}
              </div>
            </Space>
          </Card>
        </Col>
      </Row>

      {/* Top risks */}
      {data.top_risks.length > 0 && (
        <Card title="Amenazas prioritarias sin cobertura de control">
          <List
            dataSource={data.top_risks}
            renderItem={(risk) => (
              <List.Item>
                <Space style={{ width: '100%', justifyContent: 'space-between' }} wrap>
                  <Space>
                    <Tag color="geekblue">{risk.technique_id}</Tag>
                    <Text strong>{risk.technique_name}</Text>
                    <Tag color="blue">{TACTIC_LABELS[risk.tactic] || risk.tactic}</Tag>
                  </Space>
                  <Space>
                    <Tooltip title="Frecuencia global">
                      <Text type="secondary">{risk.frequency_pct.toFixed(1)}% frecuencia</Text>
                    </Tooltip>
                    <Tooltip title="Severidad promedio (1=low, 4=critical)">
                      <Tag
                        color={
                          risk.severity_avg >= 3.5
                            ? 'red'
                            : risk.severity_avg >= 2.5
                            ? 'orange'
                            : 'gold'
                        }
                      >
                        sev {risk.severity_avg.toFixed(1)}
                      </Tag>
                    </Tooltip>
                  </Space>
                </Space>
              </List.Item>
            )}
          />
        </Card>
      )}
    </Space>
  );
}
