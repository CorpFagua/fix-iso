import { useEffect, useState, useRef } from 'react';
import { Table, Card, Tag, Select, Input, Typography, Space, Drawer, Form, Slider, DatePicker, Button, message } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { controlsApi } from '../../api/controls.api';
import type { CompanyControl, IsoTheme, CompanyControlStatus, MaturityLevel, UpdateCompanyControlPayload } from '../../types';
import { useCompany } from '../../hooks/useCompany';
import NoCompanySelected from '../../components/NoCompanySelected';
import dayjs from 'dayjs';

const { Title } = Typography;
const { Search } = Input;

const statusLabels: Record<CompanyControlStatus, string> = {
  pending: 'Pendiente',
  in_progress: 'En progreso',
  implemented: 'Implementado',
  non_compliant: 'No conformidad',
  under_review: 'En revisión',
};

const statusColors: Record<CompanyControlStatus, string> = {
  pending: 'default',
  in_progress: 'processing',
  implemented: 'success',
  non_compliant: 'error',
  under_review: 'warning',
};

const maturityLabels: Record<MaturityLevel, string> = {
  initial: 'Inicial',
  managed: 'Gestionado',
  defined: 'Definido',
  measured: 'Medido',
  optimized: 'Optimizado',
};

export default function ControlsListPage() {
  const { selectedCompany } = useCompany();
  const [controls, setControls] = useState<CompanyControl[]>([]);
  const [themes, setThemes] = useState<IsoTheme[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [themeFilter, setThemeFilter] = useState<number | undefined>();
  const [statusFilter, setStatusFilter] = useState<string | undefined>();
  const [search, setSearch] = useState('');
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selected, setSelected] = useState<CompanyControl | null>(null);
  const [form] = Form.useForm();

  const fetchControlsRef = useRef<(() => void) | undefined>(undefined);

  useEffect(() => {
    let ignore = false;
    controlsApi.listThemes().then(r => { if (!ignore) setThemes(r.data.data); });
    return () => { ignore = true; };
  }, []);

  useEffect(() => {
    if (!selectedCompany) return;
    let ignore = false;
    const load = async () => {
      setLoading(true);
      const { data } = await controlsApi.listCompanyControls(selectedCompany.id, {
        themeId: themeFilter,
        status: statusFilter,
        search: search || undefined,
        page,
        limit: 15,
      });
      if (!ignore) {
        setControls(data.data);
        setTotal(data.meta.total);
        setLoading(false);
      }
    };
    load();
    fetchControlsRef.current = load;
    return () => { ignore = true; };
  }, [selectedCompany, page, themeFilter, statusFilter, search]);

  const openDrawer = (record: CompanyControl) => {
    setSelected(record);
    form.setFieldsValue({
      status: record.status,
      maturityLevel: record.maturityLevel,
      compliancePercentage: record.compliancePercentage,
      notes: record.notes,
      reviewDate: record.reviewDate ? dayjs(record.reviewDate) : null,
    });
    setDrawerOpen(true);
  };

  const onSave = async () => {
    if (!selected) return;
    const values = await form.validateFields();
    const payload: UpdateCompanyControlPayload = {
      ...values,
      reviewDate: values.reviewDate?.toISOString(),
    };
    await controlsApi.updateCompanyControl(selectedCompany!.id, selected.id, payload);
    message.success('Control actualizado');
    setDrawerOpen(false);
    fetchControlsRef.current?.();
  };

  const columns: ColumnsType<CompanyControl> = [
    { title: 'Código', dataIndex: 'code', width: 90, sorter: (a, b) => a.code.localeCompare(b.code) },
    { title: 'Título', dataIndex: 'title', ellipsis: true },
    { title: 'Dominio', dataIndex: 'themeName', width: 140 },
    {
      title: 'Estado',
      dataIndex: 'status',
      width: 130,
      render: (s: CompanyControlStatus) => <Tag color={statusColors[s]}>{statusLabels[s]}</Tag>,
    },
    {
      title: 'Madurez',
      dataIndex: 'maturityLevel',
      width: 120,
      render: (m: MaturityLevel) => maturityLabels[m],
    },
    {
      title: 'Cumplimiento',
      dataIndex: 'compliancePercentage',
      width: 120,
      render: (v: number) => `${v}%`,
      sorter: (a, b) => a.compliancePercentage - b.compliancePercentage,
    },
    { title: 'Responsable', dataIndex: 'assignedUserName', width: 150, render: (v: string | null) => v ?? '—' },
  ];

  if (!selectedCompany) return <NoCompanySelected feature="controles ISO" />;

  return (
    <>
      <Title level={3}>Controles ISO 27001</Title>
      <Card>
        <Space wrap style={{ marginBottom: 16 }}>
          <Select
            placeholder="Filtrar dominio"
            allowClear
            style={{ width: 200 }}
            value={themeFilter}
            onChange={v => { setThemeFilter(v); setPage(1); }}
            options={themes.map(t => ({ label: t.name, value: t.id }))}
          />
          <Select
            placeholder="Estado"
            allowClear
            style={{ width: 160 }}
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
          rowKey="id"
          columns={columns}
          dataSource={controls}
          loading={loading}
          pagination={{ current: page, pageSize: 15, total, onChange: setPage, showTotal: t => `${t} controles` }}
          onRow={record => ({ onClick: () => openDrawer(record), style: { cursor: 'pointer' } })}
          size="middle"
        />
      </Card>

      <Drawer
        title={selected ? `${selected.code} — ${selected.title}` : ''}
        width={480}
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        extra={<Button type="primary" onClick={onSave}>Guardar</Button>}
      >
        <Form form={form} layout="vertical">
          <Form.Item name="status" label="Estado">
            <Select options={Object.entries(statusLabels).map(([k, v]) => ({ label: v, value: k }))} />
          </Form.Item>
          <Form.Item name="maturityLevel" label="Nivel de madurez">
            <Select options={Object.entries(maturityLabels).map(([k, v]) => ({ label: v, value: k }))} />
          </Form.Item>
          <Form.Item name="compliancePercentage" label="Porcentaje de cumplimiento">
            <Slider min={0} max={100} marks={{ 0: '0%', 50: '50%', 100: '100%' }} />
          </Form.Item>
          <Form.Item name="reviewDate" label="Fecha de revisión">
            <DatePicker style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="notes" label="Notas">
            <Input.TextArea rows={4} />
          </Form.Item>
        </Form>
      </Drawer>
    </>
  );
}
