import { Column } from '@ant-design/charts';
import { Card, Table, Tag, Typography, Space, Progress } from 'antd';
import type { ThreatMapResponse, ThreatMapCountry } from '../../types/bigdata.types';

const { Text } = Typography;

const SEVERITY_COLOR: Record<string, string> = {
  critical: '#cf1322',
  high: '#fa541c',
  medium: '#faad14',
  low: '#52c41a',
};

const TOP_N = 15;

interface Props {
  data: ThreatMapResponse;
}

export default function ThreatMapSection({ data }: Props) {
  const topCountries = [...data.countries]
    .sort((a, b) => b.total_attacks - a.total_attacks)
    .slice(0, TOP_N);

  const chartData = topCountries.flatMap((c) =>
    (['critical', 'high', 'medium', 'low'] as const).map((sev) => ({
      country: c.code,
      severity: sev.charAt(0).toUpperCase() + sev.slice(1),
      attacks: c.by_severity[sev],
    })),
  );

  const chartConfig = {
    data: chartData,
    xField: 'country',
    yField: 'attacks',
    colorField: 'severity',
    stack: true,
    style: { maxWidth: 24 },
    scale: {
      color: {
        range: [
          SEVERITY_COLOR.low,
          SEVERITY_COLOR.medium,
          SEVERITY_COLOR.high,
          SEVERITY_COLOR.critical,
        ],
      },
    },
    axis: {
      x: { title: 'País de origen' },
      y: { title: 'Eventos detectados' },
    },
    legend: { position: 'top-right' as const },
  };

  const columns = [
    {
      title: 'País',
      dataIndex: 'code',
      key: 'code',
      render: (code: string) => <Text strong>{code}</Text>,
    },
    {
      title: 'Total ataques',
      dataIndex: 'total_attacks',
      key: 'total_attacks',
      sorter: (a: ThreatMapCountry, b: ThreatMapCountry) => b.total_attacks - a.total_attacks,
      render: (n: number) => n.toLocaleString(),
    },
    {
      title: 'Distribución severidad',
      key: 'severity',
      render: (_: unknown, row: ThreatMapCountry) => {
        const total = row.total_attacks;
        return (
          <Space direction="vertical" size={2} style={{ width: 160 }}>
            {(['critical', 'high', 'medium', 'low'] as const).map((sev) => {
              const pct = total > 0 ? Math.round((row.by_severity[sev] / total) * 100) : 0;
              return pct > 0 ? (
                <Progress
                  key={sev}
                  percent={pct}
                  strokeColor={SEVERITY_COLOR[sev]}
                  size="small"
                  format={() => `${sev} ${pct}%`}
                />
              ) : null;
            })}
          </Space>
        );
      },
    },
    {
      title: 'Top técnicas MITRE',
      dataIndex: 'top_techniques',
      key: 'top_techniques',
      render: (techniques: string[]) => (
        <Space wrap>
          {techniques.slice(0, 3).map((t) => (
            <Tag key={t} color="geekblue">{t}</Tag>
          ))}
        </Space>
      ),
    },
  ];

  return (
    <Space direction="vertical" size={24} style={{ width: '100%' }}>
      <Card
        title={`Distribución de ataques por país — Top ${TOP_N} orígenes`}
        extra={
          <Text type="secondary">
            {data.total_events.toLocaleString()} eventos analizados
          </Text>
        }
      >
        <Column {...chartConfig} height={280} />
      </Card>

      <Card title="Detalle por país de origen">
        <Table
          dataSource={topCountries}
          columns={columns}
          rowKey="code"
          size="small"
          pagination={{ pageSize: 10, showSizeChanger: false }}
        />
      </Card>
    </Space>
  );
}
