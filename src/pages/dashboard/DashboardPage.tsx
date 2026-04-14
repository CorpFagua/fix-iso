import { useEffect, useState } from 'react';
import { Row, Col, Card, Statistic, Table, Typography, Spin, Progress, Tag, Dropdown, message } from 'antd';
import {
  SafetyOutlined,
  CheckCircleOutlined,
  SyncOutlined,
  WarningOutlined,
  BankOutlined,
  AuditOutlined,
  DownloadOutlined,
  FilePdfOutlined,
  FileExcelOutlined,
} from '@ant-design/icons';
import { Column, Pie, Bar } from '@ant-design/charts';
import { dashboardApi } from '../../api/dashboard.api';
import { reportsApi } from '../../api/reports.api';
import { useCompany } from '../../hooks/useCompany';
import type { DashboardStats, ComplianceByTheme, RiskOverview, RecentActivity, CompanySummary } from '../../types';

const { Title, Text } = Typography;

// BUG FIX: keys in English to match backend response
const riskColor: Record<string, string> = {
  critical: '#cf1322',
  high: '#fa541c',
  medium: '#faad14',
  low: '#52c41a',
};

const riskLabel: Record<string, string> = {
  critical: 'Crítico',
  high: 'Alto',
  medium: 'Medio',
  low: 'Bajo',
};

const dimensionLabels: Record<string, string> = {
  policy: 'Políticas',
  procedures: 'Procedimientos',
  technical: 'Técnico',
  evidence: 'Evidencias',
  training: 'Capacitación',
  monitoring: 'Monitoreo',
};

export default function DashboardPage() {
  const { selectedCompany, selectCompany } = useCompany();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [compliance, setCompliance] = useState<ComplianceByTheme[]>([]);
  const [risk, setRisk] = useState<RiskOverview[]>([]);
  const [activity, setActivity] = useState<RecentActivity[]>([]);
  const [globalData, setGlobalData] = useState<CompanySummary[]>([]);
  // Track which company's data is currently loaded; undefined = nothing loaded yet.
  // loading is derived — no synchronous setState needed inside the effect.
  const [loadedFor, setLoadedFor] = useState<number | 'global' | undefined>(undefined);
  const loading = selectedCompany ? loadedFor !== selectedCompany.id : loadedFor !== 'global';
  const [downloading, setDownloading] = useState(false);

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
        setLoadedFor(selectedCompany.id);
      }).catch(() => {
        if (!ignore) message.error('Error al cargar datos del dashboard');
      });
    } else {
      dashboardApi.globalSummary().then(res => {
        if (ignore) return;
        setGlobalData(res.data.data);
        setStats(null);
        setLoadedFor('global');
      }).catch(() => {
        if (!ignore) message.error('Error al cargar resumen global');
      });
    }
    return () => { ignore = true; };
  }, [selectedCompany]);

  const handleDownload = async (format: 'pdf' | 'xlsx') => {
    if (!selectedCompany) return;
    setDownloading(true);
    try {
      const res = await reportsApi.downloadReport(selectedCompany.id, format);
      const blob = new Blob([res.data]);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Informe_${selectedCompany.name.replace(/\s+/g, '_')}.${format === 'pdf' ? 'pdf' : 'xlsx'}`;
      a.click();
      window.URL.revokeObjectURL(url);
      message.success(`Informe ${format.toUpperCase()} descargado`);
    } catch {
      message.error('Error al descargar informe');
    }
    setDownloading(false);
  };

  if (loading) return <Spin size="large" style={{ display: 'block', margin: '80px auto' }} />;

  // --- Global view ---
  if (!selectedCompany) {
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
                    <Tag color={riskColor[company.riskLevel] ? riskColor[company.riskLevel].replace('#', '') : undefined}>
                      {riskLabel[company.riskLevel] ?? company.riskLevel}
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
    { title: 'Cumplimiento general', value: stats.compliancePercentage, suffix: '%', icon: <SafetyOutlined />, color: '#1B4F72' },
    { title: 'Controles implementados', value: stats.implementedControls, suffix: `/ ${stats.totalControls}`, icon: <CheckCircleOutlined />, color: '#52c41a' },
    { title: 'Controles en progreso', value: stats.inProgressControls, icon: <SyncOutlined />, color: '#faad14' },
    { title: 'Activos alto riesgo', value: stats.highRiskAssets, suffix: `/ ${stats.totalAssets}`, icon: <WarningOutlined />, color: '#cf1322' },
    { title: 'Auditorías completadas', value: stats.completedAudits, icon: <AuditOutlined />, color: '#1890ff' },
    { title: 'Controles conformes', value: stats.compliantControls, suffix: stats.evaluatedControls > 0 ? `/ ${stats.evaluatedControls}` : undefined, icon: <CheckCircleOutlined />, color: '#722ed1' },
  ];

  const complianceData = compliance.flatMap(c => [
    { theme: c.theme, status: 'Implementado', count: c.implemented },
    { theme: c.theme, status: 'En progreso', count: c.inProgress },
    { theme: c.theme, status: 'Pendiente', count: c.pending },
  ]);

  // FIX: translate risk levels for display
  const riskData = risk.map(r => ({
    ...r,
    label: riskLabel[r.level] ?? r.level,
  }));

  const implementationData = (stats.implementationByDimension ?? []).map(d => ({
    dimension: dimensionLabels[d.dimension] ?? d.dimension,
    percentage: d.percentage,
    completed: d.completed,
    total: d.total,
  }));

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
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <Title level={3} style={{ margin: 0 }}>Dashboard — {selectedCompany.name}</Title>
        <Dropdown
          menu={{
            items: [
              { key: 'pdf', icon: <FilePdfOutlined />, label: 'Descargar PDF' },
              { key: 'xlsx', icon: <FileExcelOutlined />, label: 'Descargar Excel' },
            ],
            onClick: ({ key }) => handleDownload(key as 'pdf' | 'xlsx'),
          }}
        >
          <span>
            <Tag
              icon={<DownloadOutlined />}
              color="processing"
              style={{ cursor: 'pointer', fontSize: 14, padding: '4px 12px' }}
            >
              {downloading ? 'Generando...' : 'Descargar informe'}
            </Tag>
          </span>
        </Dropdown>
      </div>

      {/* Stat cards — 6 cards in 2 rows */}
      <Row gutter={[16, 16]}>
        {statCards.map(c => (
          <Col xs={24} sm={12} lg={4} key={c.title}>
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

      {/* Charts row 1: compliance + risk */}
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
              legend={{ position: 'top' as const }}
            />
          </Card>
        </Col>
        <Col xs={24} lg={10}>
          <Card title="Distribución de riesgo">
            <Pie
              data={riskData}
              angleField="count"
              colorField="label"
              color={({ label }: { label: string }) => {
                const key = Object.entries(riskLabel).find(([, v]) => v === label)?.[0] ?? '';
                return riskColor[key] ?? '#8c8c8c';
              }}
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

      {/* Charts row 2: implementation dimensions */}
      {implementationData.length > 0 && (
        <Row gutter={[16, 16]} style={{ marginTop: 24 }}>
          <Col span={24}>
            <Card title="Progreso de implementación por dimensión">
              <Bar
                data={implementationData}
                xField="percentage"
                yField="dimension"
                height={220}
                color="#1B4F72"
                label={{
                  position: 'right' as const,
                  content: (item: { percentage: number; completed: number; total: number }) => `${item.percentage}% (${item.completed}/${item.total})`,
                }}
                xAxis={{ max: 100, label: { formatter: (v: string) => `${v}%` } }}
                barWidthRatio={0.5}
              />
            </Card>
          </Col>
        </Row>
      )}

      {/* Activity table */}
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
