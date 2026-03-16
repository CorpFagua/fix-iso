import { useEffect, useState } from 'react';
import { Row, Col, Card, Statistic, Table, Typography, Spin, Progress, Tag } from 'antd';
import {
  SafetyOutlined,
  CheckCircleOutlined,
  SyncOutlined,
  WarningOutlined,
  BankOutlined,
} from '@ant-design/icons';
import { Column, Pie } from '@ant-design/charts';
import { dashboardApi } from '../../api/dashboard.api';
import { useCompany } from '../../hooks/useCompany';
import type { DashboardStats, ComplianceByTheme, RiskOverview, RecentActivity, CompanySummary } from '../../types';

const { Title, Text } = Typography;

const riskColor: Record<string, string> = {
  Crítico: '#cf1322',
  Alto: '#fa541c',
  Medio: '#faad14',
  Bajo: '#52c41a',
  'Sin evaluar': '#8c8c8c',
};

export default function DashboardPage() {
  const { selectedCompany, selectCompany } = useCompany();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [compliance, setCompliance] = useState<ComplianceByTheme[]>([]);
  const [risk, setRisk] = useState<RiskOverview[]>([]);
  const [activity, setActivity] = useState<RecentActivity[]>([]);
  const [globalData, setGlobalData] = useState<CompanySummary[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let ignore = false;
    if (selectedCompany) {
      Promise.all([
        dashboardApi.stats(selectedCompany.id),
        dashboardApi.complianceProgress(selectedCompany.id),
        dashboardApi.riskOverview(selectedCompany.id),
        dashboardApi.recentActivity(selectedCompany.id),
      ]).then(([s, c, r, a]) => {
        if (ignore) return;
        setStats(s.data.data);
        setCompliance(c.data.data);
        setRisk(r.data.data);
        setActivity(a.data.data);
        setGlobalData([]);
        setLoading(false);
      });
    } else {
      dashboardApi.globalSummary().then(res => {
        if (ignore) return;
        setGlobalData(res.data.data);
        setStats(null);
        setLoading(false);
      });
    }
    return () => { ignore = true; };
  }, [selectedCompany]);

  if (loading) return <Spin size="large" style={{ display: 'block', margin: '80px auto' }} />;

  // --- Global view ---
  if (!selectedCompany) {
    const riskTagColor: Record<string, string> = {
      low: 'green',
      medium: 'gold',
      high: 'orange',
      critical: 'red',
    };
    const riskTagLabel: Record<string, string> = {
      low: 'Bajo',
      medium: 'Medio',
      high: 'Alto',
      critical: 'Crítico',
    };
    return (
      <>
        <Title level={3} style={{ marginBottom: 24 }}>Vista Global — Empresas</Title>
        <Row gutter={[16, 16]}>
          {globalData.map(company => (
            <Col xs={24} sm={12} lg={8} key={company.id}>
              <Card
                hoverable
                onClick={() => selectCompany(company.id)}
                styles={{ body: { padding: 20 } }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
                  <BankOutlined style={{ fontSize: 24, color: '#1B4F72' }} />
                  <div>
                    <Text strong style={{ fontSize: 16 }}>{company.name}</Text>
                    <br />
                    <Text type="secondary">{company.sectorName}</Text>
                  </div>
                </div>
                <div style={{ marginBottom: 12 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                    <Text type="secondary">Cumplimiento</Text>
                    <Text strong>{company.compliancePercentage}%</Text>
                  </div>
                  <Progress
                    percent={company.compliancePercentage}
                    showInfo={false}
                    strokeColor={company.compliancePercentage >= 70 ? '#52c41a' : company.compliancePercentage >= 40 ? '#faad14' : '#ff4d4f'}
                  />
                </div>
                <Row>
                  <Col span={12}>
                    <Statistic
                      title="Controles"
                      value={company.controlsImplemented}
                      suffix={`/ ${company.controlsTotal}`}
                      valueStyle={{ fontSize: 16 }}
                    />
                  </Col>
                  <Col span={12} style={{ textAlign: 'right' }}>
                    <Text type="secondary" style={{ fontSize: 12 }}>Riesgo</Text>
                    <br />
                    <Tag color={riskTagColor[company.riskLevel] ?? 'default'}>
                      {riskTagLabel[company.riskLevel] ?? company.riskLevel}
                    </Tag>
                  </Col>
                </Row>
              </Card>
            </Col>
          ))}
        </Row>
      </>
    );
  }

  // --- Per-company view ---
  if (!stats) return <Spin size="large" style={{ display: 'block', margin: '80px auto' }} />;

  const statCards = [
    {
      title: 'Cumplimiento general',
      value: stats.compliancePercentage,
      suffix: '%',
      icon: <SafetyOutlined />,
      color: '#1B4F72',
    },
    {
      title: 'Controles implementados',
      value: stats.implementedControls,
      suffix: `/ ${stats.totalControls}`,
      icon: <CheckCircleOutlined />,
      color: '#52c41a',
    },
    {
      title: 'Controles en progreso',
      value: stats.inProgressControls,
      icon: <SyncOutlined />,
      color: '#faad14',
    },
    {
      title: 'Activos alto riesgo',
      value: stats.highRiskAssets,
      suffix: `/ ${stats.totalAssets}`,
      icon: <WarningOutlined />,
      color: '#cf1322',
    },
  ];

  const complianceData = compliance.flatMap(c => [
    { theme: c.theme, status: 'Implementado', count: c.implemented },
    { theme: c.theme, status: 'En progreso', count: c.inProgress },
    { theme: c.theme, status: 'Pendiente', count: c.pending },
  ]);

  const activityColumns = [
    { title: 'Usuario', dataIndex: 'userName', key: 'userName', width: 150 },
    { title: 'Acción', dataIndex: 'action', key: 'action', width: 100 },
    { title: 'Tipo', dataIndex: 'entityType', key: 'entityType', width: 120 },
    { title: 'Descripción', dataIndex: 'description', key: 'description' },
    {
      title: 'Fecha',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 170,
      render: (d: string) => new Date(d).toLocaleDateString('es-CO', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }),
    },
  ];

  return (
    <>
      <Title level={3} style={{ marginBottom: 24 }}>Dashboard — {selectedCompany.name}</Title>

      <Row gutter={[16, 16]}>
        {statCards.map(c => (
          <Col xs={24} sm={12} lg={6} key={c.title}>
            <Card>
              <Statistic
                title={c.title}
                value={c.value}
                suffix={c.suffix}
                prefix={<span style={{ color: c.color }}>{c.icon}</span>}
                valueStyle={{ color: c.color }}
              />
            </Card>
          </Col>
        ))}
      </Row>

      <Row gutter={[16, 16]} style={{ marginTop: 24 }}>
        <Col xs={24} lg={14}>
          <Card title="Cumplimiento por dominio">
            <Column
              data={complianceData}
              xField="theme"
              yField="count"
              colorField="status"
              isStack
              color={['#52c41a', '#faad14', '#ff4d4f']}
              height={300}
              label={{ position: 'middle' as const }}
              xAxis={{ label: { autoRotate: true, autoHide: false } }}
            />
          </Card>
        </Col>
        <Col xs={24} lg={10}>
          <Card title="Distribución de riesgo">
            <Pie
              data={risk}
              angleField="count"
              colorField="level"
              color={({ level }: { level: string }) => riskColor[level] ?? '#8c8c8c'}
              radius={0.9}
              innerRadius={0.6}
              height={300}
              label={{ type: 'spider' as const, content: '{name}\n{value}' }}
              legend={{ position: 'bottom' as const }}
              statistic={{
                title: { content: 'Riesgo' },
                content: { content: '' },
              }}
            />
          </Card>
        </Col>
      </Row>

      <Card title="Actividad reciente" style={{ marginTop: 24 }}>
        <Table
          rowKey="id"
          columns={activityColumns}
          dataSource={activity}
          pagination={false}
          size="small"
        />
      </Card>
    </>
  );
}
