import { useEffect, useState, useRef, useCallback } from 'react';
import { Card, Table, Typography, Button, Select, Space, message, Popconfirm, Tag, Switch, InputNumber, Input } from 'antd';
import { DeleteOutlined, SearchOutlined, ReloadOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { controlsApi } from '../../api/controls.api';
import apiClient from '../../api/client';

const { Title, Text } = Typography;

interface Sector { id: number; name: string; }
interface CompanySize { id: number; name: string; }

interface ApplicabilityRule {
  id: number;
  controlId: number;
  controlCode: string;
  controlTitle: string;
  sectorId: number;
  sectorName: string;
  sizeId: number;
  sizeName: string;
  priority: number;
  mandatory: boolean;
}

const PRIORITY_COLORS: Record<number, string> = { 1: 'red', 2: 'orange', 3: 'green' };
const PRIORITY_LABELS: Record<number, string> = { 1: 'Alta', 2: 'Media', 3: 'Baja' };

export default function ApplicabilityRulesPage() {
  const [rules, setRules] = useState<ApplicabilityRule[]>([]);
  const [sectors, setSectors] = useState<Sector[]>([]);
  const [sizes, setSizes] = useState<CompanySize[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(50);

  // Filters
  const [filterSector, setFilterSector] = useState<number | undefined>();
  const [filterSize, setFilterSize] = useState<number | undefined>();
  const [filterSearch, setFilterSearch] = useState('');
  const [searchInput, setSearchInput] = useState('');

  // Inline edit state: ruleId => { priority, mandatory }
  const [editingRows, setEditingRows] = useState<Record<number, { priority: number; mandatory: boolean }>>({});
  const [savingRow, setSavingRow] = useState<Record<number, boolean>>({});

  const loadRef = useRef<(() => void) | undefined>(undefined);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await controlsApi.listApplicabilityRules({
        sectorId: filterSector,
        sizeId: filterSize,
        search: filterSearch || undefined,
        page,
        limit: pageSize,
      });
      setRules(res.data.data);
      setTotal(res.data.meta.total);
    } finally {
      setLoading(false);
    }
  }, [filterSector, filterSize, filterSearch, page, pageSize]);

  useEffect(() => {
    loadRef.current = load;
  }, [load]);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    apiClient.get<{ data: Sector[] }>('/api/catalogs/sectors').then(r => setSectors(r.data.data));
    apiClient.get<{ data: CompanySize[] }>('/api/catalogs/company-sizes').then(r => setSizes(r.data.data));
  }, []);

  const handleSearch = () => {
    setFilterSearch(searchInput);
    setPage(1);
  };

  const handleFilterChange = (setter: (v: number | undefined) => void) => (val: number | undefined) => {
    setter(val);
    setPage(1);
  };

  const startEdit = (rule: ApplicabilityRule) => {
    setEditingRows(prev => ({ ...prev, [rule.id]: { priority: rule.priority, mandatory: rule.mandatory } }));
  };

  const cancelEdit = (id: number) => {
    setEditingRows(prev => { const next = { ...prev }; delete next[id]; return next; });
  };

  const handleSave = async (id: number) => {
    const edited = editingRows[id];
    if (!edited) return;
    setSavingRow(prev => ({ ...prev, [id]: true }));
    try {
      await controlsApi.updateApplicabilityRule(id, edited);
      message.success('Regla actualizada');
      cancelEdit(id);
      loadRef.current?.();
    } catch {
      message.error('Error al guardar');
    } finally {
      setSavingRow(prev => ({ ...prev, [id]: false }));
    }
  };

  const handleDelete = async (id: number) => {
    await controlsApi.deleteApplicabilityRule(id);
    message.success('Regla eliminada');
    loadRef.current?.();
  };

  const columns: ColumnsType<ApplicabilityRule> = [
    {
      title: 'Control',
      key: 'control',
      width: 340,
      render: (_, r) => (
        <Space direction="vertical" size={0}>
          <Text strong style={{ fontSize: 12 }}>{r.controlCode}</Text>
          <Text type="secondary" style={{ fontSize: 12 }}>{r.controlTitle}</Text>
        </Space>
      ),
    },
    {
      title: 'Sector',
      dataIndex: 'sectorName',
      width: 130,
      render: (v: string) => <Tag>{v}</Tag>,
    },
    {
      title: 'Tamaño',
      dataIndex: 'sizeName',
      width: 120,
      render: (v: string) => <Tag color="blue">{v}</Tag>,
    },
    {
      title: 'Prioridad',
      dataIndex: 'priority',
      width: 130,
      render: (v: number, r) => {
        const editing = editingRows[r.id];
        if (editing) {
          return (
            <InputNumber
              min={1}
              max={3}
              value={editing.priority}
              style={{ width: 70 }}
              onChange={(val) => setEditingRows(prev => ({ ...prev, [r.id]: { ...prev[r.id], priority: val ?? 1 } }))}
            />
          );
        }
        return <Tag color={PRIORITY_COLORS[v]}>{PRIORITY_LABELS[v] ?? v}</Tag>;
      },
    },
    {
      title: 'Obligatorio',
      dataIndex: 'mandatory',
      width: 110,
      render: (v: boolean, r) => {
        const editing = editingRows[r.id];
        if (editing) {
          return (
            <Switch
              checked={editing.mandatory}
              size="small"
              onChange={(val) => setEditingRows(prev => ({ ...prev, [r.id]: { ...prev[r.id], mandatory: val } }))}
            />
          );
        }
        return v
          ? <Tag color="volcano">Obligatorio</Tag>
          : <Tag color="default">Recomendado</Tag>;
      },
    },
    {
      title: 'Acciones',
      width: 180,
      render: (_, r) => {
        const editing = editingRows[r.id];
        if (editing) {
          return (
            <Space>
              <Button
                type="primary"
                size="small"
                loading={savingRow[r.id]}
                onClick={() => handleSave(r.id)}
              >
                Guardar
              </Button>
              <Button size="small" onClick={() => cancelEdit(r.id)}>Cancelar</Button>
            </Space>
          );
        }
        return (
          <Space>
            <Button size="small" onClick={() => startEdit(r)}>Editar</Button>
            <Popconfirm
              title="¿Eliminar esta regla?"
              description="Esta acción se aplicará en la próxima generación de controles."
              onConfirm={() => handleDelete(r.id)}
              okText="Eliminar"
              cancelText="Cancelar"
            >
              <Button size="small" danger icon={<DeleteOutlined />} />
            </Popconfirm>
          </Space>
        );
      },
    },
  ];

  return (
    <Card>
      <Space direction="vertical" size="middle" style={{ width: '100%' }}>
        <Space style={{ justifyContent: 'space-between', width: '100%', flexWrap: 'wrap' }}>
          <Title level={4} style={{ margin: 0 }}>Reglas de Aplicabilidad</Title>
          <Text type="secondary">{total} reglas configuradas</Text>
        </Space>

        <Space wrap>
          <Input
            placeholder="Buscar por código o título"
            value={searchInput}
            onChange={e => setSearchInput(e.target.value)}
            onPressEnter={handleSearch}
            style={{ width: 240 }}
            suffix={<SearchOutlined style={{ cursor: 'pointer', color: '#999' }} onClick={handleSearch} />}
            allowClear
            onClear={() => { setFilterSearch(''); setSearchInput(''); setPage(1); }}
          />
          <Select
            placeholder="Sector"
            allowClear
            style={{ width: 160 }}
            value={filterSector}
            onChange={handleFilterChange(setFilterSector)}
            options={sectors.map(s => ({ value: s.id, label: s.name }))}
          />
          <Select
            placeholder="Tamaño empresa"
            allowClear
            style={{ width: 160 }}
            value={filterSize}
            onChange={handleFilterChange(setFilterSize)}
            options={sizes.map(s => ({ value: s.id, label: s.name }))}
          />
          <Button icon={<ReloadOutlined />} onClick={() => loadRef.current?.()}>
            Recargar
          </Button>
        </Space>

        <Table<ApplicabilityRule>
          rowKey="id"
          columns={columns}
          dataSource={rules}
          loading={loading}
          size="small"
          pagination={{
            current: page,
            pageSize,
            total,
            showTotal: (t) => `${t} reglas`,
            onChange: (p) => setPage(p),
          }}
          scroll={{ x: 900 }}
        />
      </Space>
    </Card>
  );
}
