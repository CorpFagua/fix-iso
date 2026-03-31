import { useEffect, useState, useRef } from 'react';
import { Table, Card, Typography, Button, Modal, Form, Input, Select, Space, message, Popconfirm, Tag, Drawer, Avatar } from 'antd';
import { PlusOutlined, DeleteOutlined, EditOutlined, TeamOutlined, UserDeleteOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { companiesApi } from '../../api/companies.api';
import apiClient from '../../api/client';
import type { Company, CompanyUser, CreateCompanyPayload } from '../../types';

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

  // Team drawer state
  const [teamDrawerOpen, setTeamDrawerOpen] = useState(false);
  const [teamCompany, setTeamCompany] = useState<Company | null>(null);
  const [teamUsers, setTeamUsers] = useState<CompanyUser[]>([]);
  const [teamLoading, setTeamLoading] = useState(false);
  const [assignUserId, setAssignUserId] = useState<number | undefined>();
  const [assignRole, setAssignRole] = useState<string | undefined>();
  const [allUsers, setAllUsers] = useState<{ id: number; name: string; email: string }[]>([]);
  const [assigning, setAssigning] = useState(false);

  const loadRef = useRef<(() => void) | undefined>(undefined);

  useEffect(() => {
    let ignore = false;
    const load = async () => {
      setLoading(true);
      const [companiesRes, sectorsRes, sizesRes, usersRes] = await Promise.all([
        companiesApi.list(),
        apiClient.get<{ data: Sector[] }>('/api/catalogs/sectors'),
        apiClient.get<{ data: CompanySize[] }>('/api/catalogs/company-sizes'),
        apiClient.get<{ data: { id: number; name: string; email: string }[] }>('/api/users'),
      ]);
      if (!ignore) {
        setCompanies(companiesRes.data.data);
        setSectors(sectorsRes.data.data);
        setSizes(sizesRes.data.data);
        setAllUsers(usersRes.data.data);
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

  const openTeamDrawer = async (record: Company) => {
    setTeamCompany(record);
    setTeamDrawerOpen(true);
    setAssignUserId(undefined);
    setAssignRole(undefined);
    setTeamLoading(true);
    try {
      const res = await companiesApi.getUsers(record.id);
      setTeamUsers(res.data.data);
    } finally {
      setTeamLoading(false);
    }
  };

  const handleAssignUser = async () => {
    if (!teamCompany || !assignUserId) return;
    setAssigning(true);
    try {
      await companiesApi.assignUser(teamCompany.id, assignUserId, assignRole);
      message.success('Usuario asignado');
      setAssignUserId(undefined);
      setAssignRole(undefined);
      const res = await companiesApi.getUsers(teamCompany.id);
      setTeamUsers(res.data.data);
    } finally {
      setAssigning(false);
    }
  };

  const handleRemoveUser = async (userId: number) => {
    if (!teamCompany) return;
    await companiesApi.removeUser(teamCompany.id, userId);
    message.success('Usuario removido');
    const res = await companiesApi.getUsers(teamCompany.id);
    setTeamUsers(res.data.data);
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
      width: 120,
      render: (_, record) => (
        <Space>
          <Button
            type="text"
            icon={<TeamOutlined />}
            size="small"
            title="Equipo asignado"
            onClick={() => openTeamDrawer(record)}
          />
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

      <Drawer
        title={teamCompany ? `Equipo — ${teamCompany.name}` : 'Equipo asignado'}
        width={480}
        open={teamDrawerOpen}
        onClose={() => setTeamDrawerOpen(false)}
        destroyOnHidden
      >
        <Space.Compact style={{ width: '100%', marginBottom: 16 }}>
          <Select
            placeholder="Seleccionar usuario"
            showSearch
            filterOption={(input, opt) =>
              String(opt?.label ?? '').toLowerCase().includes(input.toLowerCase())
            }
            style={{ flex: 1 }}
            value={assignUserId}
            onChange={v => setAssignUserId(v)}
            options={allUsers
              .filter(u => !teamUsers.some(tu => tu.userId === u.id))
              .map(u => ({ label: `${u.name} (${u.email})`, value: u.id }))}
          />
          <Select
            placeholder="Rol (opc.)"
            allowClear
            style={{ width: 130 }}
            value={assignRole}
            onChange={v => setAssignRole(v)}
            options={[
              { label: 'Encargado', value: 'manager' },
              { label: 'Auditor', value: 'auditor' },
              { label: 'Consultor', value: 'consultant' },
            ]}
          />
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={handleAssignUser}
            loading={assigning}
            disabled={!assignUserId}
          >
            Asignar
          </Button>
        </Space.Compact>

        <Table<CompanyUser>
          rowKey="userId"
          loading={teamLoading}
          dataSource={teamUsers}
          pagination={false}
          size="small"
          columns={[
            {
              title: 'Usuario',
              dataIndex: 'userName',
              render: (name: string, r) => (
                <Space>
                  <Avatar size="small" style={{ backgroundColor: '#1677ff' }}>
                    {name?.[0]?.toUpperCase() ?? 'U'}
                  </Avatar>
                  <span>{name ?? r.userId}</span>
                </Space>
              ),
            },
            {
              title: 'Rol en empresa',
              dataIndex: 'roleInCompany',
              width: 120,
              render: (v: string | null) => v ?? '—',
            },
            {
              title: '',
              width: 50,
              render: (_, r) => (
                <Popconfirm title="¿Remover usuario?" onConfirm={() => handleRemoveUser(r.userId)}>
                  <Button type="text" danger icon={<UserDeleteOutlined />} size="small" />
                </Popconfirm>
              ),
            },
          ]}
        />
      </Drawer>
    </>
  );
}
