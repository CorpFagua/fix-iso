import { useEffect, useState, useRef } from 'react';
import { Table, Card, Typography, Button, Modal, Form, Input, Select, Space, message, Popconfirm, Tag } from 'antd';
import { PlusOutlined, DeleteOutlined, EditOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { companiesApi } from '../../api/companies.api';
import apiClient from '../../api/client';
import type { Company, CreateCompanyPayload } from '../../types';

const { Title } = Typography;

interface Sector {
  id: number;
  name: string;
}

interface CompanySize {
  id: number;
  name: string;
}

export default function CompaniesPage() {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [sectors, setSectors] = useState<Sector[]>([]);
  const [sizes, setSizes] = useState<CompanySize[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Company | null>(null);
  const [form] = Form.useForm();

  const loadRef = useRef<(() => void) | undefined>(undefined);

  useEffect(() => {
    let ignore = false;
    const load = async () => {
      setLoading(true);
      const [companiesRes, sectorsRes, sizesRes] = await Promise.all([
        companiesApi.list(),
        apiClient.get<{ data: Sector[] }>('/api/catalogs/sectors'),
        apiClient.get<{ data: CompanySize[] }>('/api/catalogs/company-sizes'),
      ]);
      if (!ignore) {
        setCompanies(companiesRes.data.data);
        setSectors(sectorsRes.data.data);
        setSizes(sizesRes.data.data);
        setLoading(false);
      }
    };
    load();
    loadRef.current = load;
    return () => { ignore = true; };
  }, []);

  const openCreate = () => {
    setEditing(null);
    form.resetFields();
    setModalOpen(true);
  };

  const openEdit = (record: Company) => {
    setEditing(record);
    form.setFieldsValue({
      name: record.name,
      sectorId: record.sectorId,
      sizeId: record.sizeId,
      country: record.country,
    });
    setModalOpen(true);
  };

  const handleSave = async () => {
    const values: CreateCompanyPayload = await form.validateFields();
    if (editing) {
      await companiesApi.update(editing.id, values);
      message.success('Empresa actualizada');
    } else {
      await companiesApi.create(values);
      message.success('Empresa creada');
    }
    setModalOpen(false);
    form.resetFields();
    setEditing(null);
    loadRef.current?.();
  };

  const handleDelete = async (id: number) => {
    await companiesApi.remove(id);
    message.success('Empresa eliminada');
    loadRef.current?.();
  };

  const columns: ColumnsType<Company> = [
    { title: 'Nombre', dataIndex: 'name', sorter: (a, b) => a.name.localeCompare(b.name) },
    { title: 'Sector', dataIndex: 'sectorName', width: 150 },
    {
      title: 'Tamaño',
      dataIndex: 'sizeName',
      width: 120,
      render: (v: string) => <Tag>{v}</Tag>,
    },
    { title: 'País', dataIndex: 'country', width: 120 },
    {
      title: 'Creación',
      dataIndex: 'createdAt',
      width: 130,
      render: (d: string) => new Date(d).toLocaleDateString('es-CO', { day: '2-digit', month: 'short', year: 'numeric' }),
    },
    {
      title: '',
      width: 90,
      render: (_, record) => (
        <Space>
          <Button type="text" icon={<EditOutlined />} size="small" onClick={() => openEdit(record)} />
          <Popconfirm title="¿Eliminar empresa?" onConfirm={() => handleDelete(record.id)}>
            <Button type="text" danger icon={<DeleteOutlined />} size="small" />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <Title level={3} style={{ margin: 0 }}>Empresas</Title>
        <Button type="primary" icon={<PlusOutlined />} onClick={openCreate}>
          Nueva empresa
        </Button>
      </div>
      <Card>
        <Table
          rowKey="id"
          columns={columns}
          dataSource={companies}
          loading={loading}
          pagination={{ pageSize: 10, showTotal: t => `${t} empresas` }}
          size="middle"
        />
      </Card>

      <Modal
        title={editing ? 'Editar empresa' : 'Nueva empresa'}
        open={modalOpen}
        onOk={handleSave}
        onCancel={() => { setModalOpen(false); form.resetFields(); setEditing(null); }}
        okText={editing ? 'Guardar' : 'Crear'}
        cancelText="Cancelar"
      >
        <Form form={form} layout="vertical">
          <Form.Item name="name" label="Nombre" rules={[{ required: true, message: 'Campo requerido' }]}>
            <Input />
          </Form.Item>
          <Form.Item name="sectorId" label="Sector" rules={[{ required: true, message: 'Campo requerido' }]}>
            <Select options={sectors.map(s => ({ label: s.name, value: s.id }))} />
          </Form.Item>
          <Form.Item name="sizeId" label="Tamaño" rules={[{ required: true, message: 'Campo requerido' }]}>
            <Select options={sizes.map(s => ({ label: s.name, value: s.id }))} />
          </Form.Item>
          <Form.Item name="country" label="País" rules={[{ required: true, message: 'Campo requerido' }]}>
            <Input />
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
}
