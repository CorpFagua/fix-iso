import { useEffect, useState, useRef } from 'react';
import {
  Table, Card, Tag, Input, Typography, Button, Modal, Form, Select, Switch, message, Popconfirm, Space,
} from 'antd';
import { PlusOutlined, DeleteOutlined, EditOutlined, EyeOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { usersApi } from '../../api/users.api';
import { adminApi } from '../../api/admin.api';
import type { User, CreateUserPayload, UpdateUserPayload, Role, ModuleWithPermissions, UserEffectivePermissions } from '../../types';
import SidebarPreview from '../../components/SidebarPreview';

const { Title } = Typography;
const { Search } = Input;

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<User | null>(null);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewUser, setPreviewUser] = useState<User | null>(null);
  const [previewPerms, setPreviewPerms] = useState<UserEffectivePermissions | null>(null);
  const [modulesWithPerms, setModulesWithPerms] = useState<ModuleWithPermissions[]>([]);
  const [form] = Form.useForm();

  const fetchUsersRef = useRef<(() => void) | undefined>(undefined);

  useEffect(() => {
    let ignore = false;
    adminApi.listRoles().then(r => { if (!ignore) setRoles(r.data.data); });
    adminApi.listModulesWithPermissions().then(r => { if (!ignore) setModulesWithPerms(r.data.data); });
    return () => { ignore = true; };
  }, []);

  useEffect(() => {
    let ignore = false;
    const load = async () => {
      setLoading(true);
      const { data } = await usersApi.list({ page, limit: 15, search: search || undefined });
      if (!ignore) {
        setUsers(data.data);
        setTotal(data.meta.total);
        setLoading(false);
      }
    };
    load();
    fetchUsersRef.current = load;
    return () => { ignore = true; };
  }, [page, search]);

  const openCreate = () => {
    setEditing(null);
    form.resetFields();
    setModalOpen(true);
  };

  const openEdit = (record: User) => {
    setEditing(record);
    form.setFieldsValue({
      name: record.name,
      email: record.email,
      phone: record.phone,
      isActive: record.isActive,
      roleIds: record.roles.map(r => r.id),
    });
    setModalOpen(true);
  };

  const openPreview = async (record: User) => {
    setPreviewUser(record);
    const { data } = await adminApi.getUserEffectivePermissions(record.id);
    setPreviewPerms(data.data);
    setPreviewOpen(true);
  };

  const handleSave = async () => {
    const values = await form.validateFields();
    if (editing) {
      const payload: UpdateUserPayload = {
        name: values.name,
        email: values.email,
        phone: values.phone,
        isActive: values.isActive,
        roleIds: values.roleIds,
      };
      await usersApi.update(editing.id, payload);
      message.success('Usuario actualizado');
    } else {
      const payload: CreateUserPayload = {
        name: values.name,
        email: values.email,
        password: values.password,
        phone: values.phone,
        roleIds: values.roleIds,
      };
      await usersApi.create(payload);
      message.success('Usuario creado');
    }
    setModalOpen(false);
    fetchUsersRef.current?.();
  };

  const handleDelete = async (id: number) => {
    await usersApi.remove(id);
    message.success('Usuario eliminado');
    fetchUsersRef.current?.();
  };

  const columns: ColumnsType<User> = [
    { title: 'Nombre', dataIndex: 'name', sorter: (a, b) => a.name.localeCompare(b.name) },
    { title: 'Email', dataIndex: 'email' },
    {
      title: 'Roles',
      dataIndex: 'roles',
      render: (r: User['roles']) => r.map(role => <Tag key={role.id}>{role.name}</Tag>),
    },
    {
      title: 'Estado',
      dataIndex: 'isActive',
      width: 100,
      render: (v: boolean) => <Tag color={v ? 'success' : 'default'}>{v ? 'Activo' : 'Inactivo'}</Tag>,
    },
    {
      title: 'Acciones',
      width: 130,
      render: (_, record) => (
        <Space>
          <Button type="text" icon={<EyeOutlined />} size="small" title="Ver sidebar" onClick={() => openPreview(record)} />
          <Button type="text" icon={<EditOutlined />} size="small" onClick={() => openEdit(record)} />
          <Popconfirm title="¿Eliminar usuario?" onConfirm={() => handleDelete(record.id)}>
            <Button type="text" danger icon={<DeleteOutlined />} size="small" />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <Title level={3} style={{ margin: 0 }}>Gestión de Usuarios</Title>
        <Button type="primary" icon={<PlusOutlined />} onClick={openCreate}>Nuevo usuario</Button>
      </div>
      <Card>
        <Search
          placeholder="Buscar usuario..."
          allowClear
          style={{ width: 300, marginBottom: 16 }}
          onSearch={v => { setSearch(v); setPage(1); }}
        />
        <Table
          rowKey="id"
          columns={columns}
          dataSource={users}
          loading={loading}
          pagination={{ current: page, pageSize: 15, total, onChange: setPage, showTotal: t => `${t} usuarios` }}
          size="middle"
        />
      </Card>

      <Modal
        title={editing ? 'Editar usuario' : 'Nuevo usuario'}
        open={modalOpen}
        onOk={handleSave}
        onCancel={() => setModalOpen(false)}
        okText={editing ? 'Guardar' : 'Crear'}
        cancelText="Cancelar"
      >
        <Form form={form} layout="vertical">
          <Form.Item name="name" label="Nombre" rules={[{ required: true, message: 'Campo requerido' }]}>
            <Input />
          </Form.Item>
          <Form.Item name="email" label="Email" rules={[{ required: true, type: 'email', message: 'Email válido requerido' }]}>
            <Input />
          </Form.Item>
          {!editing && (
            <Form.Item name="password" label="Contraseña" rules={[{ required: true, min: 6, message: 'Mínimo 6 caracteres' }]}>
              <Input.Password />
            </Form.Item>
          )}
          <Form.Item name="phone" label="Teléfono">
            <Input />
          </Form.Item>
          <Form.Item name="roleIds" label="Roles" rules={[{ required: true, message: 'Seleccione al menos un rol' }]}>
            <Select
              mode="multiple"
              options={roles.map(r => ({ label: r.name, value: r.id }))}
              placeholder="Seleccionar roles"
            />
          </Form.Item>
          {editing && (
            <Form.Item name="isActive" label="Activo" valuePropName="checked">
              <Switch />
            </Form.Item>
          )}
        </Form>
      </Modal>

      <Modal
        title={`Sidebar — ${previewUser?.name ?? ''}`}
        open={previewOpen}
        onCancel={() => setPreviewOpen(false)}
        footer={null}
        width={320}
      >
        {previewPerms && (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
            <SidebarPreview permissionIds={previewPerms.permissionIds} allModules={modulesWithPerms} />
            <Typography.Text type="secondary" style={{ fontSize: 12 }}>
              {previewPerms.permissions.length} permisos activos
            </Typography.Text>
          </div>
        )}
      </Modal>
    </>
  );
}
