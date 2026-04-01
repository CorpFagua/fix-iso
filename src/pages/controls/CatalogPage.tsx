import { useEffect, useState, useRef } from 'react';
import { Table, Card, Tag, Select, Input, Typography, Space, Drawer, Form, Button, message } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { controlsApi } from '../../api/controls.api';
import type { UpdateCatalogControlPayload } from '../../api/controls.api';
import type { IsoControl, IsoTheme } from '../../types';
import { usePermissions } from '../../hooks/usePermissions';

const { Title } = Typography;
const { Search } = Input;

const controlTypeLabels: Record<string, string> = {
  preventive: 'Preventivo',
  detective: 'Detectivo',
  corrective: 'Correctivo',
};

const controlTypeColors: Record<string, string> = {
  preventive: 'blue',
  detective: 'orange',
  corrective: 'red',
};

export default function CatalogPage() {
  const { hasPermission } = usePermissions();
  const canEdit = hasPermission('controls:update');

  const [controls, setControls] = useState<IsoControl[]>([]);
  const [themes, setThemes] = useState<IsoTheme[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [themeFilter, setThemeFilter] = useState<number | undefined>();
  const [typeFilter, setTypeFilter] = useState<string | undefined>();
  const [search, setSearch] = useState('');
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selected, setSelected] = useState<IsoControl | null>(null);
  const [saving, setSaving] = useState(false);
  const [form] = Form.useForm();

  const loadRef = useRef<(() => void) | undefined>(undefined);

  useEffect(() => {
    let ignore = false;
    controlsApi.listThemes().then(r => { if (!ignore) setThemes(r.data.data); });
    return () => { ignore = true; };
  }, []);

  useEffect(() => {
    let ignore = false;
    const load = async () => {
      setLoading(true);
      const { data } = await controlsApi.listCatalog({
        themeId: themeFilter,
        controlType: typeFilter,
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
    loadRef.current = load;
    return () => { ignore = true; };
  }, [page, themeFilter, typeFilter, search]);

  const openDrawer = (record: IsoControl) => {
    if (!canEdit) return;
    setSelected(record);
    form.setFieldsValue({
      title: record.title,
      description: record.description,
      controlType: record.controlType,
      properties: record.properties,
    });
    setDrawerOpen(true);
  };

  const onSave = async () => {
    if (!selected) return;
    const values: UpdateCatalogControlPayload = await form.validateFields();
    setSaving(true);
    try {
      await controlsApi.updateCatalogControl(selected.id, values);
      message.success('Control actualizado');
      setDrawerOpen(false);
      loadRef.current?.();
    } finally {
      setSaving(false);
    }
  };

  const columns: ColumnsType<IsoControl> = [
    {
      title: 'Código',
      dataIndex: 'code',
      width: 90,
      sorter: (a, b) => a.code.localeCompare(b.code),
    },
    {
      title: 'Título',
      dataIndex: 'title',
      ellipsis: true,
    },
    {
      title: 'Dominio',
      dataIndex: 'themeName',
      width: 200,
    },
    {
      title: 'Tipo',
      dataIndex: 'controlType',
      width: 120,
      render: (v: string) => (
        <Tag color={controlTypeColors[v] ?? 'default'}>
          {controlTypeLabels[v] ?? v}
        </Tag>
      ),
    },
    {
      title: 'Propiedades',
      dataIndex: 'properties',
      width: 200,
      ellipsis: true,
      render: (v: string) => v || '—',
    },
  ];

  return (
    <>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <Title level={3} style={{ margin: 0 }}>Catálogo ISO 27001:2022</Title>
        <Tag color="blue">{total} controles</Tag>
      </div>
      <Card>
        <Space wrap style={{ marginBottom: 16 }}>
          <Select
            placeholder="Filtrar dominio"
            allowClear
            style={{ width: 220 }}
            value={themeFilter}
            onChange={v => { setThemeFilter(v); setPage(1); }}
            options={themes.map(t => ({ label: t.name, value: t.id }))}
          />
          <Select
            placeholder="Tipo de control"
            allowClear
            style={{ width: 160 }}
            value={typeFilter}
            onChange={v => { setTypeFilter(v); setPage(1); }}
            options={Object.entries(controlTypeLabels).map(([k, v]) => ({ label: v, value: k }))}
          />
          <Search
            placeholder="Buscar por código o título..."
            allowClear
            style={{ width: 260 }}
            onSearch={v => { setSearch(v); setPage(1); }}
          />
        </Space>
        <Table
          rowKey="id"
          columns={columns}
          dataSource={controls}
          loading={loading}
          pagination={{
            current: page,
            pageSize: 15,
            total,
            onChange: setPage,
            showTotal: t => `${t} controles`,
          }}
          onRow={record => ({
            onClick: canEdit ? () => openDrawer(record) : undefined,
            style: canEdit ? { cursor: 'pointer' } : undefined,
          })}
          size="middle"
        />
      </Card>

      {canEdit && (
        <Drawer
          title={selected ? `${selected.code} — Editar control` : ''}
          width={520}
          open={drawerOpen}
          onClose={() => setDrawerOpen(false)}
          extra={
            <Button type="primary" onClick={onSave} loading={saving}>
              Guardar
            </Button>
          }
        >
          {selected && (
            <Form form={form} layout="vertical">
              <Form.Item label="Código">
                <Input value={selected.code} disabled />
              </Form.Item>
              <Form.Item
                name="title"
                label="Título"
                rules={[{ required: true, message: 'Campo requerido' }]}
              >
                <Input />
              </Form.Item>
              <Form.Item name="description" label="Descripción">
                <Input.TextArea rows={4} />
              </Form.Item>
              <Form.Item name="controlType" label="Tipo de control">
                <Select
                  options={Object.entries(controlTypeLabels).map(([k, v]) => ({ label: v, value: k }))}
                />
              </Form.Item>
              <Form.Item name="properties" label="Propiedades">
                <Input.TextArea
                  rows={3}
                  placeholder='Ej: "Confidentiality, Integrity, Availability"'
                />
              </Form.Item>
            </Form>
          )}
        </Drawer>
      )}
    </>
  );
}
