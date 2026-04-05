import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import {
  Table, Card, Tag, Select, Input, Typography, Space, Progress,
  Row, Col, Statistic, Tooltip, Skeleton,
} from 'antd';
import type { ColumnsType } from 'antd/es/table';
import {
  CheckCircleOutlined,
  ClockCircleOutlined,
  ExclamationCircleOutlined,
  RightOutlined,
} from '@ant-design/icons';
import { implementationApi } from '../../api/implementation.api';
import { controlsApi } from '../../api/controls.api';
import type {
  ImplementationControlSummary,
  ImplementationGlobalSummary,
  IsoTheme,
} from '../../types';
import { useCompany } from '../../hooks/useCompany';
import NoCompanySelected from '../../components/NoCompanySelected';

const { Title, Text } = Typography;
const { Search } = Input;

const statusLabels: Record<string, string> = {
  pending: 'Pendiente',
  in_progress: 'En progreso',
  implemented: 'Implementado',
  non_compliant: 'No conformidad',
  under_review: 'En revisión',
};

const statusColors: Record<string, string> = {
  pending: 'default',
  in_progress: 'processing',
  implemented: 'success',
  non_compliant: 'error',
  under_review: 'warning',
};

function progressColor(pct: number): string {
  if (pct >= 80) return '#52c41a';
  if (pct >= 40) return '#faad14';
  return '#ff4d4f';
}

export default function ImplementationPage() {
  const { selectedCompany } = useCompany();
  const navigate = useNavigate();

  const [controls, setControls] = useState<ImplementationControlSummary[]>([]);
  const [summary, setSummary] = useState<ImplementationGlobalSummary | null>(null);
  const [themes, setThemes] = useState<IsoTheme[]>([]);
  const [loading, setLoading] = useState(true);
  const [summaryLoading, setSummaryLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [themeFilter, setThemeFilter] = useState<number | undefined>();
  const [statusFilter, setStatusFilter] = useState<string | undefined>();
  const [search, setSearch] = useState('');

  useEffect(() => {
    let ignore = false;
    controlsApi.listThemes().then(r => { if (!ignore) setThemes(r.data.data); });
    return () => { ignore = true; };
  }, []);

  useEffect(() => {
    if (!selectedCompany) return;
    let cancelled = false;

    implementationApi.listControls(selectedCompany.id, {
      themeId: themeFilter,
      status: statusFilter,
      search: search || undefined,
      page,
      limit: 20,
    }).then(({ data }) => {
      if (!cancelled) {
        setControls(data.data);
        setTotal(data.meta.total);
        setLoading(false);
      }
    });

    implementationApi.getSummary(selectedCompany.id).then(({ data }) => {
      if (!cancelled) {
        setSummary(data.data);
        setSummaryLoading(false);
      }
    });

    return () => { cancelled = true; };
  }, [selectedCompany, themeFilter, statusFilter, search, page]);

  const columns: ColumnsType<ImplementationControlSummary> = [
    {
      title: 'Código',
      dataIndex: 'code',
      width: 80,
      sorter: (a, b) => a.code.localeCompare(b.code),
    },
    {
      title: 'Control',
      dataIndex: 'title',
      ellipsis: true,
    },
    {
      title: 'Dominio',
      dataIndex: 'themeName',
      width: 160,
      ellipsis: true,
    },
    {
      title: 'Estado',
      dataIndex: 'status',
      width: 130,
      render: (s: string) => <Tag color={statusColors[s] ?? 'default'}>{statusLabels[s] ?? s}</Tag>,
    },
    {
      title: 'Progreso de implementación',
      dataIndex: 'progressPercentage',
      width: 220,
      sorter: (a, b) => a.progressPercentage - b.progressPercentage,
      render: (pct: number, record) => (
        <Tooltip title={`${record.tasksCompleted} de ${record.totalTasks} dimensiones completadas`}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Progress
              percent={pct}
              size="small"
              strokeColor={progressColor(pct)}
              style={{ flex: 1, marginBottom: 0 }}
              format={p => <span style={{ fontSize: 11 }}>{p}%</span>}
            />
          </div>
        </Tooltip>
      ),
    },
    {
      title: 'Responsable',
      dataIndex: 'assignedUserName',
      width: 140,
      render: (v: string | null) => v ?? <Text type="secondary">—</Text>,
    },
    {
      width: 36,
      render: () => <RightOutlined style={{ color: '#8c8c8c' }} />,
    },
  ];

  if (!selectedCompany) return <NoCompanySelected feature="el Módulo de Implementación" />;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <Title level={3} style={{ margin: 0 }}>Implementación ISO 27001</Title>
          <Text type="secondary">Gestión del avance de implementación por control aplicable</Text>
        </div>
      </div>

      {/* Tarjetas de resumen global */}
      {summaryLoading ? (
        <Row gutter={16}><Col span={24}><Skeleton active paragraph={{ rows: 2 }} /></Col></Row>
      ) : summary && (
        <>
          <Row gutter={16}>
            <Col xs={24} sm={8} md={6}>
              <Card size="small">
                <Statistic
                  title="Progreso global"
                  value={summary.progressPercentage}
                  suffix="%"
                  prefix={summary.progressPercentage >= 80
                    ? <CheckCircleOutlined style={{ color: '#52c41a' }} />
                    : summary.progressPercentage >= 40
                    ? <ClockCircleOutlined style={{ color: '#faad14' }} />
                    : <ExclamationCircleOutlined style={{ color: '#ff4d4f' }} />}
                />
                <Progress
                  percent={summary.progressPercentage}
                  strokeColor={progressColor(summary.progressPercentage)}
                  showInfo={false}
                  size="small"
                  style={{ marginTop: 8 }}
                />
              </Card>
            </Col>
            <Col xs={24} sm={8} md={6}>
              <Card size="small">
                <Statistic
                  title="Controles aplicables"
                  value={summary.totalControls}
                  suffix="controles"
                />
              </Card>
            </Col>
            {summary.byDimension.slice(0, 2).map(dim => (
              <Col key={dim.dimension} xs={24} sm={12} md={6}>
                <Card size="small">
                  <Statistic
                    title={dim.label}
                    value={dim.totalCount > 0 ? Math.round((dim.completedCount / dim.totalCount) * 100) : 0}
                    suffix="%"
                  />
                  <Progress
                    percent={dim.totalCount > 0 ? Math.round((dim.completedCount / dim.totalCount) * 100) : 0}
                    strokeColor={progressColor(dim.totalCount > 0 ? Math.round((dim.completedCount / dim.totalCount) * 100) : 0)}
                    showInfo={false}
                    size="small"
                    style={{ marginTop: 8 }}
                  />
                </Card>
              </Col>
            ))}
          </Row>

          {/* Barras de progreso por dominio ISO */}
          <Card
            size="small"
            title={<span style={{ fontWeight: 600 }}>Avance por dominio ISO 27001</span>}
          >
            <Row gutter={[16, 10]}>
              {summary.byDomain.map(domain => (
                <Col key={domain.themeId} xs={24} sm={12} md={8}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Text style={{ fontSize: 12 }} ellipsis={{ tooltip: domain.themeName }}>
                        {domain.themeName}
                      </Text>
                      <Text style={{ fontSize: 12, color: progressColor(domain.progressPercentage), fontWeight: 600 }}>
                        {domain.progressPercentage}%
                      </Text>
                    </div>
                    <Progress
                      percent={domain.progressPercentage}
                      strokeColor={progressColor(domain.progressPercentage)}
                      showInfo={false}
                      size="small"
                      style={{ margin: 0 }}
                    />
                    <Text type="secondary" style={{ fontSize: 11 }}>{domain.totalControls} controles</Text>
                  </div>
                </Col>
              ))}
            </Row>
          </Card>
        </>
      )}

      {/* Tabla de controles */}
      <Card size="small">
        <Space wrap style={{ marginBottom: 12 }}>
          <Select
            placeholder="Dominio"
            allowClear
            style={{ width: 200 }}
            value={themeFilter}
            onChange={v => { setThemeFilter(v); setPage(1); }}
            options={themes.map(t => ({ label: t.name, value: t.id }))}
          />
          <Select
            placeholder="Estado"
            allowClear
            style={{ width: 150 }}
            value={statusFilter}
            onChange={v => { setStatusFilter(v); setPage(1); }}
            options={Object.entries(statusLabels).map(([k, v]) => ({ label: v, value: k }))}
          />
          <Search
            placeholder="Buscar control..."
            allowClear
            style={{ width: 240 }}
            onSearch={v => { setSearch(v); setPage(1); }}
          />
        </Space>
        <Table
          rowKey="companyControlId"
          columns={columns}
          dataSource={controls}
          loading={loading}
          pagination={{
            current: page,
            pageSize: 20,
            total,
            onChange: setPage,
            showTotal: t => `${t} controles`,
            size: 'small',
          }}
          onRow={record => ({
            onClick: () => navigate(`/implementation/${record.controlId}`),
            style: { cursor: 'pointer' },
          })}
          size="middle"
        />
      </Card>
    </div>
  );
}
