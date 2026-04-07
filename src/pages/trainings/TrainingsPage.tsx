import { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router';
import { Table, Card, Tag, Typography, Button, Modal, message, Empty } from 'antd';
import { PlusOutlined, DeleteOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { trainingsApi } from '../../api/trainings.api';
import type { CompanyTraining, TrainingType, EnrollmentStatus, AvailableTraining } from '../../types';
import { trainingTypeLabels, enrollmentStatusLabels } from '../../types';
import { useCompany } from '../../hooks/useCompany';
import { useAuth } from '../../hooks/useAuth';
import NoCompanySelected from '../../components/NoCompanySelected';

const { Title } = Typography;

const typeColors: Record<TrainingType, string> = {
  ORGANIZATIONAL: 'blue',
  PEOPLE: 'green',
  PHYSICAL: 'orange',
  TECHNOLOGICAL: 'purple',
  PROCESS: 'cyan',
};

const statusColors: Record<EnrollmentStatus, string> = {
  PENDING: 'warning',
  COMPLETED: 'success',
};

export default function TrainingsPage() {
  const navigate = useNavigate();
  const { selectedCompany } = useCompany();
  const { user } = useAuth();
  const [trainings, setTrainings] = useState<CompanyTraining[]>([]);
  const [loading, setLoading] = useState(true);
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [available, setAvailable] = useState<AvailableTraining[]>([]);
  const [loadingAvailable, setLoadingAvailable] = useState(false);

  const fetchRef = useRef<(() => void) | undefined>(undefined);

  useEffect(() => {
    if (!selectedCompany) return;
    let ignore = false;
    const load = async () => {
      setLoading(true);
      const { data } = await trainingsApi.listByCompany(selectedCompany.id);
      if (!ignore) {
        setTrainings(data.data);
        setLoading(false);
      }
    };
    load();
    fetchRef.current = load;
    return () => { ignore = true; };
  }, [selectedCompany]);

  const openAddModal = async () => {
    setAddModalOpen(true);
    setLoadingAvailable(true);
    const { data } = await trainingsApi.available(selectedCompany!.id);
    setAvailable(data.data);
    setLoadingAvailable(false);
  };

  const handleAssign = async (trainingId: number) => {
    await trainingsApi.assignToCompany(selectedCompany!.id, trainingId);
    message.success('Capacitación asignada');
    setAddModalOpen(false);
    fetchRef.current?.();
  };

  const handleRemove = async (trainingId: number) => {
    await trainingsApi.removeFromCompany(selectedCompany!.id, trainingId);
    message.success('Capacitación removida');
    fetchRef.current?.();
  };

  const getMyEnrollment = (training: CompanyTraining) => {
    if (!user) return null;
    return training.enrollments.find(e => e.userId === user.id) ?? null;
  };

  const columns: ColumnsType<CompanyTraining> = [
    {
      title: 'Nombre',
      dataIndex: 'title',
      sorter: (a, b) => a.title.localeCompare(b.title),
    },
    {
      title: 'Tipo',
      dataIndex: 'trainingType',
      width: 200,
      render: (v: TrainingType) => <Tag color={typeColors[v]}>{trainingTypeLabels[v]}</Tag>,
    },
    {
      title: 'Estado',
      width: 200,
      render: (_, record) => {
        const enrollment = getMyEnrollment(record);
        if (!enrollment) return <Tag>No inscrito</Tag>;
        return (
          <Tag color={statusColors[enrollment.status]}>
            {enrollmentStatusLabels[enrollment.status]}
          </Tag>
        );
      },
    },
    {
      title: 'Inscritos',
      width: 90,
      align: 'center',
      render: (_, record) => record.enrollments.length,
    },
    {
      title: '',
      width: 50,
      render: (_, record) => (
        <Button
          type="text"
          danger
          icon={<DeleteOutlined />}
          size="small"
          onClick={e => { e.stopPropagation(); handleRemove(record.trainingId); }}
          title="Remover de empresa"
        />
      ),
    },
  ];

  const availableColumns: ColumnsType<AvailableTraining> = [
    { title: 'Título', dataIndex: 'title' },
    {
      title: 'Tipo',
      dataIndex: 'trainingType',
      width: 200,
      render: (v: TrainingType) => <Tag color={typeColors[v]}>{trainingTypeLabels[v]}</Tag>,
    },
    {
      title: '',
      width: 100,
      render: (_, record) => (
        <Button type="primary" size="small" onClick={() => handleAssign(record.id)}>Asignar</Button>
      ),
    },
  ];

  if (!selectedCompany) return <NoCompanySelected feature="capacitaciones" />;

  return (
    <>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <Title level={3} style={{ margin: 0 }}>Capacitaciones</Title>
        <Button type="primary" icon={<PlusOutlined />} onClick={openAddModal}>
          Agregar capacitación
        </Button>
      </div>
      <Card>
        <Table
          rowKey="id"
          columns={columns}
          dataSource={trainings}
          loading={loading}
          pagination={false}
          onRow={record => ({ onClick: () => navigate(`/trainings/${record.trainingId}`), style: { cursor: 'pointer' } })}
          size="middle"
        />
      </Card>

      <Modal
        title="Agregar capacitación"
        open={addModalOpen}
        onCancel={() => setAddModalOpen(false)}
        footer={null}
        width={600}
      >
        {loadingAvailable ? (
          <div style={{ textAlign: 'center', padding: 24 }}>Cargando...</div>
        ) : available.length === 0 ? (
          <Empty description="No hay capacitaciones disponibles para asignar" />
        ) : (
          <Table
            rowKey="id"
            columns={availableColumns}
            dataSource={available}
            pagination={false}
            size="small"
          />
        )}
      </Modal>
    </>
  );
}
