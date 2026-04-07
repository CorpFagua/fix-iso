import { useEffect, useState, useRef } from 'react';
import {
  Table, Card, Tag, Input, Typography, Button, Modal, Form, Select, message, Popconfirm, Space,
} from 'antd';
import { PlusOutlined, DeleteOutlined, EditOutlined, LinkOutlined, MinusCircleOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { trainingsApi } from '../../api/trainings.api';
import type { Training, TrainingType, CreateTrainingPayload, UpdateTrainingPayload, TrainingResource } from '../../types';
import { trainingTypeLabels } from '../../types';

const { Title } = Typography;
const { Search } = Input;

const typeColors: Record<TrainingType, string> = {
  ORGANIZATIONAL: 'blue',
  PEOPLE: 'green',
  PHYSICAL: 'orange',
  TECHNOLOGICAL: 'purple',
  PROCESS: 'cyan',
};

export default function AdminTrainingsPage() {
  const [trainings, setTrainings] = useState<Training[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<string | undefined>();
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Training | null>(null);
  const [form] = Form.useForm();

  const fetchRef = useRef<(() => void) | undefined>(undefined);

  useEffect(() => {
    let ignore = false;
    const load = async () => {
      setLoading(true);
      const { data } = await trainingsApi.list({
        page,
        limit: 15,
        search: search || undefined,
        trainingType: typeFilter,
      });
      if (!ignore) {
        setTrainings(data.data);
        setTotal(data.meta.total);
        setLoading(false);
      }
    };
    load();
    fetchRef.current = load;
    return () => { ignore = true; };
  }, [page, search, typeFilter]);

  const openCreate = () => {
    setEditing(null);
    form.resetFields();
    form.setFieldsValue({ resources: [] });
    setModalOpen(true);
  };

  const openEdit = (record: Training) => {
    setEditing(record);
    form.setFieldsValue({
      title: record.title,
      description: record.description,
      trainingType: record.trainingType,
      resources: record.resourcesJson.map(r => ({
        type: r.type,
        title: r.title ?? '',
        url: r.url ?? '',
        filename: r.filename ?? '',
      })),
    });
    setModalOpen(true);
  };

  const handleSave = async () => {
    const values = await form.validateFields();
    const resources: TrainingResource[] = (values.resources ?? []).map((r: Record<string, string>, i: number) => ({
      id: `res-${Date.now()}-${i}`,
      type: r.type,
      title: r.title || undefined,
      url: r.type === 'url' || r.type === 'video' ? r.url : undefined,
      filename: r.type === 'pdf' ? r.filename : undefined,
    }));

    if (editing) {
      const payload: UpdateTrainingPayload = {
        title: values.title,
        description: values.description,
        trainingType: values.trainingType,
        resourcesJson: resources,
      };
      await trainingsApi.update(editing.id, payload);
      message.success('Capacitación actualizada');
    } else {
      const payload: CreateTrainingPayload = {
        title: values.title,
        description: values.description,
        trainingType: values.trainingType,
        resourcesJson: resources,
      };
      await trainingsApi.create(payload);
      message.success('Capacitación creada');
    }
    setModalOpen(false);
    fetchRef.current?.();
  };

  const handleDelete = async (id: number) => {
    await trainingsApi.remove(id);
    message.success('Capacitación eliminada');
    fetchRef.current?.();
  };

  const columns: ColumnsType<Training> = [
    { title: 'Título', dataIndex: 'title', sorter: (a, b) => a.title.localeCompare(b.title) },
    {
      title: 'Tipo',
      dataIndex: 'trainingType',
      width: 200,
      render: (v: TrainingType) => <Tag color={typeColors[v]}>{trainingTypeLabels[v]}</Tag>,
    },
    { title: 'Recursos', dataIndex: 'resourcesJson', width: 90, align: 'center', render: (r: TrainingResource[]) => r.length },
    { title: 'Empresas', dataIndex: 'companiesCount', width: 90, align: 'center' },
    { title: 'Creador', dataIndex: 'creatorName', width: 150 },
    {
      title: 'Estado',
      dataIndex: 'isActive',
      width: 100,
      render: (v: boolean) => <Tag color={v ? 'success' : 'default'}>{v ? 'Activo' : 'Inactivo'}</Tag>,
    },
    {
      title: 'Acciones',
      width: 100,
      render: (_, record) => (
        <Space>
          <Button type="text" icon={<EditOutlined />} size="small" onClick={() => openEdit(record)} />
          <Popconfirm title="¿Eliminar capacitación?" onConfirm={() => handleDelete(record.id)}>
            <Button type="text" danger icon={<DeleteOutlined />} size="small" />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <Title level={3} style={{ margin: 0 }}>Gestión de Capacitaciones</Title>
        <Button type="primary" icon={<PlusOutlined />} onClick={openCreate}>Nueva capacitación</Button>
      </div>
      <Card>
        <Space wrap style={{ marginBottom: 16 }}>
          <Select
            placeholder="Tipo"
            allowClear
            style={{ width: 220 }}
            value={typeFilter}
            onChange={v => { setTypeFilter(v); setPage(1); }}
            options={Object.entries(trainingTypeLabels).map(([k, v]) => ({ label: v, value: k }))}
          />
          <Search
            placeholder="Buscar capacitación..."
            allowClear
            style={{ width: 260 }}
            onSearch={v => { setSearch(v); setPage(1); }}
          />
        </Space>
        <Table
          rowKey="id"
          columns={columns}
          dataSource={trainings}
          loading={loading}
          pagination={{ current: page, pageSize: 15, total, onChange: setPage, showTotal: t => `${t} capacitaciones` }}
          size="middle"
        />
      </Card>

      <Modal
        title={editing ? 'Editar capacitación' : 'Nueva capacitación'}
        open={modalOpen}
        onOk={handleSave}
        onCancel={() => setModalOpen(false)}
        okText={editing ? 'Guardar' : 'Crear'}
        cancelText="Cancelar"
        width={640}
      >
        <Form form={form} layout="vertical">
          <Form.Item name="title" label="Título" rules={[{ required: true, message: 'Campo requerido' }]}>
            <Input />
          </Form.Item>
          <Form.Item name="description" label="Descripción">
            <Input.TextArea rows={3} />
          </Form.Item>
          <Form.Item name="trainingType" label="Tipo de capacitación" rules={[{ required: true, message: 'Campo requerido' }]}>
            <Select options={Object.entries(trainingTypeLabels).map(([k, v]) => ({ label: v, value: k }))} placeholder="Seleccionar tipo" />
          </Form.Item>

          <Typography.Text strong style={{ display: 'block', marginBottom: 8 }}>Recursos</Typography.Text>
          <Form.List name="resources">
            {(fields, { add, remove }) => (
              <>
                {fields.map(({ key, name, ...restField }) => (
                  <Space key={key} align="start" style={{ display: 'flex', marginBottom: 8 }}>
                    <Form.Item {...restField} name={[name, 'type']} rules={[{ required: true, message: 'Requerido' }]}>
                      <Select style={{ width: 110 }} placeholder="Tipo" options={[
                        { label: 'URL', value: 'url' },
                        { label: 'PDF', value: 'pdf' },
                        { label: 'Video', value: 'video' },
                      ]} />
                    </Form.Item>
                    <Form.Item {...restField} name={[name, 'title']}>
                      <Input placeholder="Título del recurso" style={{ width: 160 }} />
                    </Form.Item>
                    <Form.Item {...restField} name={[name, 'url']}>
                      <Input placeholder="URL o nombre de archivo" prefix={<LinkOutlined />} style={{ width: 240 }} />
                    </Form.Item>
                    <MinusCircleOutlined onClick={() => remove(name)} style={{ marginTop: 8, color: '#ff4d4f' }} />
                  </Space>
                ))}
                <Button type="dashed" onClick={() => add()} icon={<PlusOutlined />} block>
                  Agregar recurso
                </Button>
              </>
            )}
          </Form.List>
        </Form>
      </Modal>
    </>
  );
}
