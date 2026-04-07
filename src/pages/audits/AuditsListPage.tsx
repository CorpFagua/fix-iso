import { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router';
import {
  Table, Card, Tag, Select, Typography, Space, Button,
  Modal, Form, DatePicker, Input, message, Popconfirm, Progress,
} from 'antd';
import { PlusOutlined, DeleteOutlined, EyeOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import dayjs from 'dayjs';
import { auditsApi } from '../../api/audits.api';
import type { Audit, AuditStatus } from '../../types';
import { useCompany } from '../../hooks/useCompany';
import NoCompanySelected from '../../components/NoCompanySelected';

const { Title } = Typography;

const statusLabels: Record<AuditStatus, string> = {
  planned: 'Planificada',
  in_progress: 'En progreso',
  completed: 'Completada',
};

const statusColors: Record<AuditStatus, string> = {
  planned: 'blue',
  in_progress: 'orange',
  completed: 'green',
};

export default function AuditsListPage() {
  const navigate = useNavigate();
  const { selectedCompany } = useCompany();

  const [audits, setAudits] = useState<Audit[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState<string | undefined>();
  const [modalOpen, setModalOpen] = useState(false);
  const [creating, setCreating] = useState(false);
  const [form] = Form.useForm();

  const fetchRef = useRef<(() => void) | undefined>(undefined);

  useEffect(() => {
    if (!selectedCompany) return;
    let ignore = false;
    const load = async () => {
      setLoading(true);
      try {
        const { data } = await auditsApi.list(selectedCompany.id, {
          status: statusFilter,
          page,
          limit: 15,
        });
        if (!ignore) {
          setAudits(data.data);
          setTotal(data.meta.total);
        }
      } catch {
        if (!ignore) message.error('Error al cargar auditorías');
      } finally {
        if (!ignore) setLoading(false);
      }
    };
    load();
    fetchRef.current = load;
    return () => { ignore = true; };
  }, [selectedCompany, page, statusFilter]);

  const handleCreate = async () => {
    const values = await form.validateFields();
    setCreating(true);
    try {
      await auditsApi.create(selectedCompany!.id, {
        date: values.date.format('YYYY-MM-DD'),
        notes: values.notes || undefined,
      });
      message.success('Auditoría creada con checklist de controles');
      setModalOpen(false);
      form.resetFields();
      fetchRef.current?.();
    } catch (error) {
      const err = error as { response?: { status: number; data?: { error: string } } };
      if (err.response?.status === 400) {
        message.warning(err.response.data?.error || 'Primero debe generar los controles ISO para esta empresa.');
      } else {
        message.error('Error al crear auditoría');
      }
    } finally {
      setCreating(false);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await auditsApi.remove(selectedCompany!.id, id);
      message.success('Auditoría eliminada');
      fetchRef.current?.();
    } catch {
      message.error('Error al eliminar auditoría');
    }
  };

  const columns: ColumnsType<Audit> = [
    {
      title: 'Fecha',
      dataIndex: 'date',
      width: 130,
      render: (v: string) => dayjs(v).format('DD/MM/YYYY'),
      sorter: (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
    },
    {
      title: 'Auditor',
      dataIndex: 'auditorName',
      width: 180,
    },
    {
      title: 'Estado',
      dataIndex: 'status',
      width: 130,
      render: (v: AuditStatus) => <Tag color={statusColors[v]}>{statusLabels[v]}</Tag>,
    },
    {
      title: 'Progreso',
      width: 200,
      render: (_, record) => {
        const percent = record.totalControls > 0
          ? Math.round((record.evaluatedCount / record.totalControls) * 100)
          : 0;
        return (
          <Space direction="vertical" size={0} style={{ width: '100%' }}>
            <Progress percent={percent} size="small" strokeColor={percent === 100 ? '#52c41a' : '#1890ff'} />
            <span style={{ fontSize: 12, color: '#888' }}>
              {record.evaluatedCount}/{record.totalControls} evaluados
            </span>
          </Space>
        );
      },
    },
    {
      title: 'Conformes',
      width: 100,
      align: 'center',
      render: (_, record) => {
        const percent = record.evaluatedCount > 0
          ? Math.round((record.compliantCount / record.evaluatedCount) * 100)
          : 0;
        return (
          <Tag color={percent >= 80 ? 'green' : percent >= 50 ? 'orange' : 'red'}>
            {record.compliantCount} ({percent}%)
          </Tag>
        );
      },
    },
    {
      title: 'Notas',
      dataIndex: 'notes',
      ellipsis: true,
    },
    {
      title: 'Acciones',
      width: 100,
      render: (_, record) => (
        <Space>
          <Button
            type="text"
            icon={<EyeOutlined />}
            size="small"
            title="Ver checklist"
            onClick={(e) => { e.stopPropagation(); navigate(`/audits/${record.id}`); }}
          />
          <Popconfirm
            title="¿Eliminar esta auditoría?"
            description="Se eliminarán todos los resultados del checklist."
            onConfirm={() => handleDelete(record.id)}
          >
            <Button
              type="text"
              danger
              icon={<DeleteOutlined />}
              size="small"
              onClick={(e) => e.stopPropagation()}
            />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  if (!selectedCompany) return <NoCompanySelected feature="auditorías" />;

  return (
    <>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <Title level={3} style={{ margin: 0 }}>Auditorías</Title>
        <Button type="primary" icon={<PlusOutlined />} onClick={() => setModalOpen(true)}>
          Nueva auditoría
        </Button>
      </div>

      <Card>
        <Space wrap style={{ marginBottom: 16 }}>
          <Select
            placeholder="Estado"
            allowClear
            style={{ width: 180 }}
            value={statusFilter}
            onChange={(v) => { setStatusFilter(v); setPage(1); }}
            options={Object.entries(statusLabels).map(([k, v]) => ({ label: v, value: k }))}
          />
        </Space>

        <Table
          rowKey="id"
          columns={columns}
          dataSource={audits}
          loading={loading}
          pagination={{
            current: page,
            pageSize: 15,
            total,
            onChange: setPage,
            showTotal: (t) => `${t} auditorías`,
          }}
          onRow={(record) => ({
            onClick: () => navigate(`/audits/${record.id}`),
            style: { cursor: 'pointer' },
          })}
          size="middle"
        />
      </Card>

      <Modal
        title="Nueva auditoría"
        open={modalOpen}
        onOk={handleCreate}
        onCancel={() => { setModalOpen(false); form.resetFields(); }}
        okText="Crear"
        cancelText="Cancelar"
        confirmLoading={creating}
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="date"
            label="Fecha de auditoría"
            rules={[{ required: true, message: 'Seleccione una fecha' }]}
          >
            <DatePicker style={{ width: '100%' }} format="DD/MM/YYYY" />
          </Form.Item>
          <Form.Item name="notes" label="Notas (opcional)">
            <Input.TextArea rows={3} placeholder="Descripción o notas de la auditoría..." />
          </Form.Item>
        </Form>
        <div style={{ padding: '8px 0', fontSize: 13, color: '#888' }}>
          Al crear la auditoría, se generará automáticamente un checklist con los controles ISO aplicables
          según el sector y tamaño de la empresa seleccionada.
        </div>
      </Modal>
    </>
  );
}
