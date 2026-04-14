import { Card, Table, Tag, Typography, Space, Tooltip, Progress, Alert } from 'antd';
import {
  CheckCircleOutlined,
  ClockCircleOutlined,
  WarningOutlined,
  CloseCircleOutlined,
  InfoCircleOutlined,
} from '@ant-design/icons';
import type {
  MitreIsoCorrelationResponse,
  TechniqueEntry,
} from '../../types/bigdata.types';

const { Text } = Typography;

type CoverageStatus = 'covered' | 'partial' | 'gap';

interface TableRow extends TechniqueEntry {
  coverage: CoverageStatus;
}

const STATUS_CONFIG: Record<CoverageStatus, { color: string; icon: React.ReactNode; label: string }> = {
  covered: { color: '#52c41a', icon: <CheckCircleOutlined />, label: 'Cubierto' },
  partial: { color: '#faad14', icon: <ClockCircleOutlined />, label: 'En progreso' },
  gap: { color: '#cf1322', icon: <CloseCircleOutlined />, label: 'Sin control' },
};

const TACTIC_LABELS: Record<string, string> = {
  reconnaissance: 'Reconocimiento',
  initial_access: 'Acceso Inicial',
  credential_access: 'Credenciales',
  defense_evasion: 'Evasión',
  discovery: 'Descubrimiento',
  lateral_movement: 'Mov. Lateral',
  collection: 'Colección',
  command_and_control: 'C2',
  exfiltration: 'Exfiltración',
  impact: 'Impacto',
  execution: 'Ejecución',
  persistence: 'Persistencia',
  privilege_escalation: 'Escalación',
  resource_development: 'Recursos',
  unknown: 'Desconocido',
};

interface Props {
  data: MitreIsoCorrelationResponse;
}

export default function MitreCorrelationSection({ data }: Props) {
  if (data.has_data === false) {
    return (
      <Alert
        type="info"
        icon={<InfoCircleOutlined />}
        showIcon
        message="Sin controles ISO asignados"
        description="Esta empresa aún no tiene controles ISO 27001 registrados en el sistema. Asigna controles desde la sección de gestión para ver el análisis de cobertura MITRE ATT&CK."
        style={{ borderRadius: 8 }}
      />
    );
  }

  const rows: TableRow[] = [
    ...data.gap_techniques.map((t) => ({ ...t, coverage: 'gap' as CoverageStatus })),
    ...data.partial_techniques.map((t) => ({ ...t, coverage: 'partial' as CoverageStatus })),
    ...data.covered_techniques.map((t) => ({ ...t, coverage: 'covered' as CoverageStatus })),
  ];

  const columns = [
    {
      title: 'Estado',
      dataIndex: 'coverage',
      key: 'coverage',
      width: 110,
      filters: [
        { text: 'Sin control', value: 'gap' },
        { text: 'En progreso', value: 'partial' },
        { text: 'Cubierto', value: 'covered' },
      ],
      onFilter: (value: unknown, record: TableRow) => record.coverage === value,
      render: (status: CoverageStatus) => {
        const { color, icon, label } = STATUS_CONFIG[status];
        return (
          <Tag color={color} icon={icon}>
            {label}
          </Tag>
        );
      },
    },
    {
      title: 'Técnica MITRE',
      key: 'technique',
      render: (_: unknown, row: TableRow) => (
        <Space direction="vertical" size={0}>
          <Text strong style={{ fontSize: 13 }}>{row.technique_id}</Text>
          <Text type="secondary" style={{ fontSize: 12 }}>{row.technique_name}</Text>
        </Space>
      ),
    },
    {
      title: 'Táctica',
      dataIndex: 'tactic',
      key: 'tactic',
      render: (t: string) => (
        <Tag color="blue">{TACTIC_LABELS[t] || t}</Tag>
      ),
    },
    {
      title: 'Frecuencia global',
      dataIndex: 'frequency_pct',
      key: 'frequency',
      sorter: (a: TableRow, b: TableRow) => b.frequency_pct - a.frequency_pct,
      render: (pct: number, row: TableRow) => (
        <Tooltip title={`${row.frequency.toLocaleString()} eventos`}>
          <Progress
            percent={Math.min(pct * 5, 100)}
            strokeColor={row.frequency_pct > 10 ? '#cf1322' : row.frequency_pct > 5 ? '#faad14' : '#52c41a'}
            size="small"
            format={() => `${pct.toFixed(1)}%`}
          />
        </Tooltip>
      ),
    },
    {
      title: 'Controles ISO',
      dataIndex: 'iso_controls',
      key: 'iso_controls',
      render: (controls: TechniqueEntry['iso_controls']) => (
        <Space wrap>
          {controls.slice(0, 4).map((c) => (
            <Tooltip key={c.control_code} title={`Estado: ${c.status}`}>
              <Tag
                color={
                  c.status === 'implemented'
                    ? 'green'
                    : c.status === 'in_progress'
                    ? 'orange'
                    : c.status === 'not_assigned'
                    ? 'default'
                    : 'red'
                }
              >
                {c.control_code}
              </Tag>
            </Tooltip>
          ))}
          {controls.length > 4 && (
            <Text type="secondary" style={{ fontSize: 11 }}>+{controls.length - 4}</Text>
          )}
        </Space>
      ),
    },
  ];

  const { summary } = data;
  const coveragePct = summary.coverage_percentage;

  return (
    <Space direction="vertical" size={20} style={{ width: '100%' }}>
      {/* Summary cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16 }}>
        {[
          { label: 'Técnicas activas', value: summary.total_active_techniques, color: '#1677ff' },
          { label: 'Sin control (gaps)', value: summary.gaps, color: '#cf1322' },
          { label: 'En progreso', value: summary.partial, color: '#faad14' },
          { label: 'Cubiertas', value: summary.covered, color: '#52c41a' },
        ].map(({ label, value, color }) => (
          <Card key={label} size="small" style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 28, fontWeight: 700, color }}>{value}</div>
            <Text type="secondary" style={{ fontSize: 12 }}>{label}</Text>
          </Card>
        ))}
      </div>

      <Card
        title="Cobertura general de técnicas activas"
        extra={<Text strong style={{ fontSize: 16 }}>{coveragePct.toFixed(1)}%</Text>}
      >
        <Progress
          percent={coveragePct}
          strokeColor={{
            '0%': '#cf1322',
            '50%': '#faad14',
            '100%': '#52c41a',
          }}
          size={['100%', 16]}
        />
      </Card>

      <Card
        title="Técnicas MITRE detectadas vs controles ISO"
        extra={<Text type="secondary">{rows.length} técnicas</Text>}
      >
        <Table
          dataSource={rows}
          columns={columns}
          rowKey="technique_id"
          size="small"
          pagination={{ pageSize: 12, showSizeChanger: false }}
          rowClassName={(row) =>
            row.coverage === 'gap' ? 'bigdata-gap-row' : ''
          }
        />
      </Card>
    </Space>
  );
}
