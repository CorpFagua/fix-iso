import { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router';
import { Table, Card, Tag, Select, Input, Typography, Space, Button, Modal, Form, message, Popconfirm } from 'antd';
import { PlusOutlined, DeleteOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { assetsApi } from '../../api/assets.api';
import type { Asset, AssetType, AssetClassification, CreateAssetPayload } from '../../types';
import { useCompany } from '../../hooks/useCompany';
import NoCompanySelected from '../../components/NoCompanySelected';

const { Title } = Typography;
const { Search } = Input;

const typeLabels: Record<AssetType, string> = {
  information: 'Información',
  software: 'Software',
  hardware: 'Hardware',
  service: 'Servicio',
  people: 'Personas',
  intangible: 'Intangible',
};

const classLabels: Record<AssetClassification, string> = {
  public: 'Público',
  internal: 'Interno',
  confidential: 'Confidencial',
  restricted: 'Restringido',
};

const classColors: Record<AssetClassification, string> = {
  public: 'green',
  internal: 'blue',
  confidential: 'orange',
  restricted: 'red',
};

export default function AssetsListPage() {
  const navigate = useNavigate();
  const { selectedCompany } = useCompany();
  const [assets, setAssets] = useState<Asset[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [typeFilter, setTypeFilter] = useState<string | undefined>();
  const [classFilter, setClassFilter] = useState<string | undefined>();
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [form] = Form.useForm();

  const fetchAssetsRef = useRef<(() => void) | undefined>(undefined);

  useEffect(() => {
    if (!selectedCompany) return;
    let ignore = false;
    const load = async () => {
      setLoading(true);
      const { data } = await assetsApi.list(selectedCompany.id, {
        assetType: typeFilter,
        classification: classFilter,
        search: search || undefined,
        page,
        limit: 15,
      });
      if (!ignore) {
        setAssets(data.data);
        setTotal(data.meta.total);
        setLoading(false);
      }
    };
    load();
    fetchAssetsRef.current = load;
    return () => { ignore = true; };
  }, [selectedCompany, page, typeFilter, classFilter, search]);

  const handleCreate = async () => {
    const values = await form.validateFields();
    const payload: CreateAssetPayload = {
      ...values,
      ownerId: 1,
    };
    await assetsApi.create(selectedCompany!.id, payload);
    message.success('Activo creado');
    setModalOpen(false);
    form.resetFields();
    fetchAssetsRef.current?.();
  };

  const handleDelete = async (id: number) => {
    await assetsApi.remove(selectedCompany!.id, id);
    message.success('Activo eliminado');
    fetchAssetsRef.current?.();
  };

  const columns: ColumnsType<Asset> = [
    { title: 'Nombre', dataIndex: 'name', sorter: (a, b) => a.name.localeCompare(b.name) },
    {
      title: 'Tipo',
      dataIndex: 'assetType',
      width: 120,
      render: (v: AssetType) => typeLabels[v],
    },
    {
      title: 'Clasificación',
      dataIndex: 'classification',
      width: 130,
      render: (v: AssetClassification) => <Tag color={classColors[v]}>{classLabels[v]}</Tag>,
    },
    { title: 'Propietario', dataIndex: 'ownerName', width: 150 },
    {
      title: 'Estado',
      dataIndex: 'status',
      width: 100,
      render: (s: string) => <Tag color={s === 'active' ? 'success' : 'default'}>{s === 'active' ? 'Activo' : s}</Tag>,
    },
    {
      title: 'Riesgos',
      dataIndex: 'risksCount',
      width: 80,
      align: 'center',
      sorter: (a, b) => a.risksCount - b.risksCount,
    },
    {
      title: '',
      width: 50,
      render: (_, record) => (
        <Popconfirm title="¿Eliminar activo?" onConfirm={() => handleDelete(record.id)}>
          <Button type="text" danger icon={<DeleteOutlined />} size="small" onClick={e => e.stopPropagation()} />
        </Popconfirm>
      ),
    },
  ];

  if (!selectedCompany) return <NoCompanySelected feature="gestión de activos" />;

  return (
    <>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <Title level={3} style={{ margin: 0 }}>Gestión de Activos</Title>
        <Button type="primary" icon={<PlusOutlined />} onClick={() => setModalOpen(true)}>
          Nuevo activo
        </Button>
      </div>
      <Card>
        <Space wrap style={{ marginBottom: 16 }}>
          <Select
            placeholder="Tipo"
            allowClear
            style={{ width: 160 }}
            value={typeFilter}
            onChange={v => { setTypeFilter(v); setPage(1); }}
            options={Object.entries(typeLabels).map(([k, v]) => ({ label: v, value: k }))}
          />
          <Select
            placeholder="Clasificación"
            allowClear
            style={{ width: 160 }}
            value={classFilter}
            onChange={v => { setClassFilter(v); setPage(1); }}
            options={Object.entries(classLabels).map(([k, v]) => ({ label: v, value: k }))}
          />
          <Search
            placeholder="Buscar activo..."
            allowClear
            style={{ width: 240 }}
            onSearch={v => { setSearch(v); setPage(1); }}
          />
        </Space>
        <Table
          rowKey="id"
          columns={columns}
          dataSource={assets}
          loading={loading}
          pagination={{ current: page, pageSize: 15, total, onChange: setPage, showTotal: t => `${t} activos` }}
          onRow={record => ({ onClick: () => navigate(`/assets/${record.id}`), style: { cursor: 'pointer' } })}
          size="middle"
        />
      </Card>

      <Modal
        title="Nuevo activo"
        open={modalOpen}
        onOk={handleCreate}
        onCancel={() => { setModalOpen(false); form.resetFields(); }}
        okText="Crear"
        cancelText="Cancelar"
      >
        <Form form={form} layout="vertical">
          <Form.Item name="name" label="Nombre" rules={[{ required: true, message: 'Campo requerido' }]}>
            <Input />
          </Form.Item>
          <Form.Item name="description" label="Descripción">
            <Input.TextArea rows={2} />
          </Form.Item>
          <Form.Item name="assetType" label="Tipo" rules={[{ required: true, message: 'Campo requerido' }]}>
            <Select options={Object.entries(typeLabels).map(([k, v]) => ({ label: v, value: k }))} />
          </Form.Item>
          <Form.Item name="classification" label="Clasificación" rules={[{ required: true, message: 'Campo requerido' }]}>
            <Select options={Object.entries(classLabels).map(([k, v]) => ({ label: v, value: k }))} />
          </Form.Item>
          <Form.Item name="location" label="Ubicación">
            <Input />
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
}
