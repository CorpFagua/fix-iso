import { useEffect, useState, useRef } from 'react';
import { Card, Table, Typography, Button, Modal, Form, Input, Checkbox, Collapse, message, Space } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { adminApi } from '../../api/admin.api';
import type { Role, PermissionGroup, ModuleWithPermissions } from '../../types';
import SidebarPreview from '../../components/SidebarPreview';

const { Title } = Typography;

export default function RolesPage() {
  const [roles, setRoles] = useState<Role[]>([]);
  const [permGroups, setPermGroups] = useState<PermissionGroup[]>([]);
  const [modulesWithPerms, setModulesWithPerms] = useState<ModuleWithPermissions[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [permModalOpen, setPermModalOpen] = useState(false);
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);
  const [selectedPermIds, setSelectedPermIds] = useState<number[]>([]);
  const [form] = Form.useForm();

  const fetchRolesRef = useRef<(() => void) | undefined>(undefined);

  useEffect(() => {
    let ignore = false;
    const loadRoles = async () => {
      setLoading(true);
      const { data } = await adminApi.listRoles();
      if (!ignore) {
        setRoles(data.data);
        setLoading(false);
      }
    };
    loadRoles();
    fetchRolesRef.current = loadRoles;
    adminApi.listPermissions().then(r => { if (!ignore) setPermGroups(r.data.data); });
    adminApi.listModulesWithPermissions().then(r => { if (!ignore) setModulesWithPerms(r.data.data); });
    return () => { ignore = true; };
  }, []);

  const handleCreate = async () => {
    const values = await form.validateFields();
    await adminApi.createRole({
      name: values.name,
      description: values.description,
      permissionIds: values.permissionIds ?? [],
    });
    message.success('Rol creado');
    setModalOpen(false);
    form.resetFields();
    fetchRolesRef.current?.();
  };

  const openPermissions = async (role: Role) => {
    setSelectedRole(role);
    const { data } = await adminApi.getRolePermissions(role.id);
    setSelectedPermIds(data.data);
    setPermModalOpen(true);
  };

  const savePermissions = async () => {
    if (!selectedRole) return;
    await adminApi.updateRolePermissions(selectedRole.id, selectedPermIds);
    message.success('Permisos actualizados');
    setPermModalOpen(false);
    fetchRolesRef.current?.();
  };

  const columns: ColumnsType<Role> = [
    { title: 'Rol', dataIndex: 'name', sorter: (a, b) => a.name.localeCompare(b.name) },
    { title: 'Descripción', dataIndex: 'description', render: (v: string | null) => v ?? '—' },
    { title: 'Usuarios', dataIndex: 'usersCount', width: 100, align: 'center' },
    { title: 'Permisos', dataIndex: 'permissionsCount', width: 100, align: 'center' },
    {
      title: 'Acciones',
      width: 130,
      render: (_, record) => (
        <Button type="link" onClick={() => openPermissions(record)}>Gestionar permisos</Button>
      ),
    },
  ];

  const collapseItems = permGroups.map(group => {
    const groupPermIds = group.permissions.map(p => p.id);
    return {
      key: group.module,
      label: `${group.module} (${group.permissions.length})`,
      children: (
        <Checkbox.Group
          value={selectedPermIds.filter(id => groupPermIds.includes(id))}
          onChange={vals => {
            const others = selectedPermIds.filter(id => !groupPermIds.includes(id));
            setSelectedPermIds([...others, ...(vals as number[])]);
          }}
        >
          <Space direction="vertical">
            {group.permissions.map(p => (
              <Checkbox key={p.id} value={p.id}>
                {p.name} — <span style={{ color: '#888' }}>{p.description}</span>
              </Checkbox>
            ))}
          </Space>
        </Checkbox.Group>
      ),
    };
  });

  return (
    <>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <Title level={3} style={{ margin: 0 }}>Roles y Permisos</Title>
        <Button type="primary" icon={<PlusOutlined />} onClick={() => setModalOpen(true)}>Nuevo rol</Button>
      </div>
      <Card>
        <Table
          rowKey="id"
          columns={columns}
          dataSource={roles}
          loading={loading}
          pagination={false}
          size="middle"
        />
      </Card>

      <Modal
        title="Nuevo rol"
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
        </Form>
      </Modal>

      <Modal
        title={`Permisos — ${selectedRole?.name ?? ''}`}
        open={permModalOpen}
        onOk={savePermissions}
        onCancel={() => setPermModalOpen(false)}
        okText="Guardar"
        cancelText="Cancelar"
        width={960}
      >
        <div style={{ display: 'flex', gap: 24 }}>
          <div style={{ flexShrink: 0 }}>
            <Typography.Text strong style={{ display: 'block', marginBottom: 8, fontSize: 13 }}>
              Preview del sidebar
            </Typography.Text>
            <SidebarPreview permissionIds={selectedPermIds} allModules={modulesWithPerms} />
          </div>
          <div style={{ flex: 1, minWidth: 0, maxHeight: 520, overflowY: 'auto' }}>
            <Collapse items={collapseItems} defaultActiveKey={permGroups.map(g => g.module)} />
          </div>
        </div>
      </Modal>
    </>
  );
}
