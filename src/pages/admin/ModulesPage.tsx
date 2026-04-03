import { useEffect, useState, useMemo } from 'react';
import {
  Card, Table, Tree, Typography, Button, Modal, Form, Input, InputNumber, Select, Tag,
  message, Space, Popconfirm, Alert, Divider, Row, Col,
} from 'antd';
import {
  PlusOutlined, DeleteOutlined, EditOutlined,
  DashboardOutlined, SafetyOutlined, FileProtectOutlined, DatabaseOutlined,
  SettingOutlined, TeamOutlined, LockOutlined, BankOutlined, BookOutlined,
  AppstoreOutlined, FolderOutlined, ApiOutlined, BellOutlined,
  AuditOutlined, FileSearchOutlined, ExperimentOutlined, CloudOutlined,
  ToolOutlined, GlobalOutlined, SafetyCertificateOutlined,
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import type { DataNode } from 'antd/es/tree';
import { adminApi } from '../../api/admin.api';
import type { ModuleWithPermissions, Permission } from '../../types';

const { Title, Text, Paragraph } = Typography;

const iconMap: Record<string, React.ReactNode> = {
  DashboardOutlined: <DashboardOutlined />,
  SafetyOutlined: <SafetyOutlined />,
  FileProtectOutlined: <FileProtectOutlined />,
  DatabaseOutlined: <DatabaseOutlined />,
  SettingOutlined: <SettingOutlined />,
  TeamOutlined: <TeamOutlined />,
  LockOutlined: <LockOutlined />,
  BankOutlined: <BankOutlined />,
  BookOutlined: <BookOutlined />,
  AppstoreOutlined: <AppstoreOutlined />,
  FolderOutlined: <FolderOutlined />,
  ApiOutlined: <ApiOutlined />,
  BellOutlined: <BellOutlined />,
  AuditOutlined: <AuditOutlined />,
  FileSearchOutlined: <FileSearchOutlined />,
  ExperimentOutlined: <ExperimentOutlined />,
  CloudOutlined: <CloudOutlined />,
  ToolOutlined: <ToolOutlined />,
  GlobalOutlined: <GlobalOutlined />,
  SafetyCertificateOutlined: <SafetyCertificateOutlined />,
};

const iconOptions = Object.keys(iconMap).map(name => ({
  label: name.replace('Outlined', ''),
  value: name,
  icon: iconMap[name],
}));

const actionOptions = [
  { label: 'read', value: 'read' },
  { label: 'create', value: 'create' },
  { label: 'update', value: 'update' },
  { label: 'delete', value: 'delete' },
  { label: 'export', value: 'export' },
  { label: 'manage', value: 'manage' },
];

export default function ModulesPage() {
  const [modules, setModules] = useState<ModuleWithPermissions[]>([]);
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [loading, setLoading] = useState(true);

  // Module modal
  const [modModalOpen, setModModalOpen] = useState(false);
  const [editingModule, setEditingModule] = useState<ModuleWithPermissions | null>(null);
  const [modForm] = Form.useForm();

  // Permission modal
  const [permModalOpen, setPermModalOpen] = useState(false);
  const [editingPerm, setEditingPerm] = useState<Permission | null>(null);
  const [permForm] = Form.useForm();

  const [refreshKey, setRefreshKey] = useState(0);
  const reload = () => setRefreshKey(k => k + 1);

  useEffect(() => {
    let ignore = false;
    const load = async () => {
      setLoading(true);
      const [modsRes, permsRes] = await Promise.all([
        adminApi.listModulesWithPermissions(),
        adminApi.listAllPermissions(),
      ]);
      if (!ignore) {
        setModules(modsRes.data.data);
        setPermissions(permsRes.data.data);
        setLoading(false);
      }
    };
    load();
    return () => { ignore = true; };
  }, [refreshKey]);

  // ── Module Tree ──
  const buildModuleNode = (mod: ModuleWithPermissions, childrenMods: ModuleWithPermissions[]) => (
    <Space>
      {iconMap[mod.icon] ?? <FolderOutlined />}
      <Text strong={mod.parentId === null}>{mod.name}</Text>
      <Text type="secondary" style={{ fontSize: 12 }}>{mod.route}</Text>
      <Space size={4}>
        {mod.modulePermissions.map(mp => {
          const perm = permissions.find(p => p.id === mp.permissionId);
          return perm ? <Tag key={perm.id} style={{ fontSize: 11 }}>{perm.name}</Tag> : null;
        })}
      </Space>
      <Button type="text" size="small" icon={<EditOutlined />} onClick={(e) => { e.stopPropagation(); openEditModule(mod); }} />
      <Popconfirm title="¿Eliminar módulo?" onConfirm={() => handleDeleteModule(mod.id)} disabled={childrenMods.length > 0}>
        <Button type="text" size="small" danger icon={<DeleteOutlined />} disabled={childrenMods.length > 0} onClick={(e) => e.stopPropagation()} />
      </Popconfirm>
    </Space>
  );

  const treeData: DataNode[] = modules
    .filter(m => m.parentId === null)
    .sort((a, b) => a.displayOrder - b.displayOrder)
    .map(root => {
      const children = modules.filter(m => m.parentId === root.id).sort((a, b) => a.displayOrder - b.displayOrder);
      return {
        key: root.id,
        title: buildModuleNode(root, children),
        children: children.map(child => ({
          key: child.id,
          title: buildModuleNode(child, []),
        })),
      };
    });

  // ── Module CRUD ──
  const openCreateModule = () => {
    setEditingModule(null);
    modForm.resetFields();
    modForm.setFieldsValue({ displayOrder: modules.length + 1 });
    setModModalOpen(true);
  };

  const openEditModule = (mod: ModuleWithPermissions) => {
    setEditingModule(mod);
    modForm.setFieldsValue({
      name: mod.name,
      route: mod.route,
      icon: mod.icon,
      parentId: mod.parentId,
      displayOrder: mod.displayOrder,
      permissionIds: mod.modulePermissions.map(mp => mp.permissionId),
    });
    setModModalOpen(true);
  };

  const handleSaveModule = async () => {
    const values = await modForm.validateFields();
    if (editingModule) {
      await adminApi.updateModule(editingModule.id, values);
      message.success('Módulo actualizado');
    } else {
      await adminApi.createModule(values);
      message.success('Módulo creado');
    }
    setModModalOpen(false);
    reload();
  };

  const handleDeleteModule = async (id: number) => {
    try {
      await adminApi.deleteModule(id);
      message.success('Módulo eliminado');
      reload();
    } catch {
      message.error('No se pudo eliminar el módulo');
    }
  };

  // ── Permission CRUD ──
  const openCreatePerm = () => {
    setEditingPerm(null);
    permForm.resetFields();
    setPermModalOpen(true);
  };

  const openEditPerm = (perm: Permission) => {
    setEditingPerm(perm);
    const [mod, action] = perm.name.split(':');
    permForm.setFieldsValue({ module: mod, action, description: perm.description });
    setPermModalOpen(true);
  };

  const handleSavePerm = async () => {
    const values = await permForm.validateFields();
    const name = `${values.module}:${values.action}`;
    if (editingPerm) {
      await adminApi.updatePermission(editingPerm.id, { name, description: values.description, module: values.module });
      message.success('Permiso actualizado');
    } else {
      await adminApi.createPermission({ name, description: values.description, module: values.module });
      message.success('Permiso creado');
    }
    setPermModalOpen(false);
    reload();
  };

  const handleDeletePerm = async (id: number) => {
    try {
      await adminApi.deletePermission(id);
      message.success('Permiso eliminado');
      reload();
    } catch {
      message.error('No se pudo eliminar. Puede estar asignado a roles.');
    }
  };

  // ── Permissions grouped for display ──
  const permissionsByModule = useMemo(() => {
    const grouped: Record<string, Permission[]> = {};
    for (const p of permissions) {
      if (!grouped[p.module]) grouped[p.module] = [];
      grouped[p.module].push(p);
    }
    return grouped;
  }, [permissions]);

  const permColumns: ColumnsType<Permission> = [
    { title: 'Permiso', dataIndex: 'name', sorter: (a, b) => a.name.localeCompare(b.name), render: (v: string) => <Text code>{v}</Text> },
    { title: 'Descripción', dataIndex: 'description', render: (v: string | null) => v ?? '—' },
    { title: 'Módulo', dataIndex: 'module', filters: Object.keys(permissionsByModule).map(m => ({ text: m, value: m })), onFilter: (v, r) => r.module === v, render: (v: string) => <Tag>{v}</Tag> },
    {
      title: 'Usado en',
      width: 90,
      align: 'center',
      render: (_, record) => {
        const count = modules.filter(m => m.modulePermissions.some(mp => mp.permissionId === record.id)).length;
        return <Text type="secondary">{count} mód.</Text>;
      },
    },
    {
      title: 'Acciones',
      width: 100,
      render: (_, record) => (
        <Space>
          <Button type="text" size="small" icon={<EditOutlined />} onClick={() => openEditPerm(record)} />
          <Popconfirm title="¿Eliminar permiso?" onConfirm={() => handleDeletePerm(record.id)}>
            <Button type="text" size="small" danger icon={<DeleteOutlined />} />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  const rootModules = modules.filter(m => m.parentId === null);

  return (
    <>
      <Title level={3} style={{ marginBottom: 8 }}>Módulos y Permisos</Title>
      <Alert
        type="info"
        showIcon
        style={{ marginBottom: 24 }}
        message="Panel de configuración del sistema"
        description={
          <Paragraph style={{ margin: 0, fontSize: 13 }}>
            Aquí se gestionan los módulos del sidebar y los permisos del sistema. <strong>Para agregar una nueva pantalla:</strong> (1) Crea el componente React y regístralo en <Text code>routeRegistry.ts</Text>, (2) Crea el módulo aquí con su ruta e icono, (3) Crea o vincula los permisos necesarios, (4) Asigna los permisos a los roles desde la página de Roles.
          </Paragraph>
        }
      />

      <Row gutter={[24, 24]}>
        <Col span={24}>
          <Card
            title="Árbol de Módulos"
            extra={<Button type="primary" icon={<PlusOutlined />} onClick={openCreateModule}>Nuevo módulo</Button>}
            loading={loading}
          >
            {treeData.length > 0 ? (
              <Tree
                treeData={treeData}
                defaultExpandAll
                selectable={false}
                showLine={{ showLeafIcon: false }}
                style={{ fontSize: 14 }}
              />
            ) : (
              <Text type="secondary">No hay módulos configurados</Text>
            )}
          </Card>
        </Col>

        <Col span={24}>
          <Card
            title="Permisos del Sistema"
            extra={<Button type="primary" icon={<PlusOutlined />} onClick={openCreatePerm}>Nuevo permiso</Button>}
          >
            <Table
              rowKey="id"
              columns={permColumns}
              dataSource={permissions}
              loading={loading}
              pagination={{ pageSize: 20, showTotal: t => `${t} permisos` }}
              size="small"
            />
          </Card>
        </Col>
      </Row>

      {/* Modal Módulo */}
      <Modal
        title={editingModule ? 'Editar módulo' : 'Nuevo módulo'}
        open={modModalOpen}
        onOk={handleSaveModule}
        onCancel={() => setModModalOpen(false)}
        okText={editingModule ? 'Guardar' : 'Crear'}
        cancelText="Cancelar"
        width={560}
      >
        <Form form={modForm} layout="vertical">
          <Form.Item name="name" label="Nombre" rules={[{ required: true, message: 'Campo requerido' }]}>
            <Input placeholder="Ej: Reportes" />
          </Form.Item>
          <Form.Item name="route" label="Ruta" rules={[{ required: true, message: 'Campo requerido' }, { pattern: /^\//, message: 'Debe iniciar con /' }]}>
            <Input placeholder="Ej: /reports" />
          </Form.Item>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="icon" label="Icono" rules={[{ required: true, message: 'Seleccione un icono' }]}>
                <Select
                  showSearch
                  placeholder="Seleccionar icono"
                  options={iconOptions}
                  optionRender={(option) => (
                    <Space>
                      {iconMap[option.value as string]}
                      <span>{option.label}</span>
                    </Space>
                  )}
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="displayOrder" label="Orden">
                <InputNumber min={0} style={{ width: '100%' }} />
              </Form.Item>
            </Col>
          </Row>
          <Form.Item name="parentId" label="Módulo padre">
            <Select
              allowClear
              placeholder="Ninguno (raíz)"
              options={rootModules.map(m => ({ label: m.name, value: m.id }))}
            />
          </Form.Item>
          <Divider style={{ margin: '12px 0' }} />
          <Form.Item name="permissionIds" label="Permisos requeridos para ver este módulo">
            <Select
              mode="multiple"
              placeholder="Seleccionar permisos"
              options={permissions.map(p => ({ label: `${p.name} — ${p.description}`, value: p.id }))}
              optionFilterProp="label"
            />
          </Form.Item>
        </Form>
      </Modal>

      {/* Modal Permiso */}
      <Modal
        title={editingPerm ? 'Editar permiso' : 'Nuevo permiso'}
        open={permModalOpen}
        onOk={handleSavePerm}
        onCancel={() => setPermModalOpen(false)}
        okText={editingPerm ? 'Guardar' : 'Crear'}
        cancelText="Cancelar"
        width={480}
      >
        <Form form={permForm} layout="vertical">
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="module" label="Módulo" rules={[{ required: true, message: 'Requerido' }]}>
                <Input placeholder="Ej: reports" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="action" label="Acción" rules={[{ required: true, message: 'Requerido' }]}>
                <Select options={actionOptions} placeholder="Seleccionar" />
              </Form.Item>
            </Col>
          </Row>
          <Form.Item label="Nombre generado">
            <Form.Item noStyle shouldUpdate>
              {() => {
                const mod = permForm.getFieldValue('module') ?? '';
                const act = permForm.getFieldValue('action') ?? '';
                return <Text code>{mod && act ? `${mod}:${act}` : '—'}</Text>;
              }}
            </Form.Item>
          </Form.Item>
          <Form.Item name="description" label="Descripción" rules={[{ required: true, message: 'Requerido' }]}>
            <Input placeholder="Ej: Ver reportes del sistema" />
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
}
