import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router';
import { Card, Descriptions, Tag, Typography, Spin, Button, Space, Table, message } from 'antd';
import { ArrowLeftOutlined, CheckCircleOutlined, LinkOutlined, FilePdfOutlined, PlayCircleOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { trainingsApi } from '../../api/trainings.api';
import type { CompanyTraining, CompanyTrainingEnrollment, TrainingType, EnrollmentStatus, TrainingResource } from '../../types';
import { trainingTypeLabels, enrollmentStatusLabels } from '../../types';
import { useCompany } from '../../hooks/useCompany';
import { useAuth } from '../../hooks/useAuth';
import NoCompanySelected from '../../components/NoCompanySelected';

const { Title, Text, Link } = Typography;

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

const resourceIcon: Record<string, React.ReactNode> = {
  url: <LinkOutlined />,
  pdf: <FilePdfOutlined />,
  video: <PlayCircleOutlined />,
};

export default function TrainingDetailPage() {
  const { trainingId } = useParams<{ trainingId: string }>();
  const navigate = useNavigate();
  const { selectedCompany } = useCompany();
  const { user } = useAuth();
  const [training, setTraining] = useState<CompanyTraining | null>(null);
  const [loading, setLoading] = useState(true);
  const [enrolling, setEnrolling] = useState(false);
  const [completing, setCompleting] = useState(false);

  useEffect(() => {
    if (!selectedCompany) return;
    let ignore = false;
    const load = async () => {
      setLoading(true);
      const { data } = await trainingsApi.getCompanyTraining(selectedCompany.id, Number(trainingId));
      if (!ignore) {
        setTraining(data.data);
        setLoading(false);
      }
    };
    load();
    return () => { ignore = true; };
  }, [trainingId, selectedCompany]);

  const myEnrollment = training?.enrollments.find(e => e.userId === user?.id) ?? null;

  const handleEnroll = async () => {
    if (!training || !selectedCompany) return;
    setEnrolling(true);
    await trainingsApi.enroll(selectedCompany.id, training.id);
    message.success('Inscrito correctamente');
    const { data } = await trainingsApi.getCompanyTraining(selectedCompany.id, Number(trainingId));
    setTraining(data.data);
    setEnrolling(false);
  };

  const handleComplete = async () => {
    if (!myEnrollment || !selectedCompany) return;
    setCompleting(true);
    await trainingsApi.updateEnrollment(selectedCompany.id, myEnrollment.id, 'COMPLETED');
    message.success('Marcado como capacitado');
    const { data } = await trainingsApi.getCompanyTraining(selectedCompany.id, Number(trainingId));
    setTraining(data.data);
    setCompleting(false);
  };

  if (!selectedCompany) return <NoCompanySelected feature="detalle de capacitación" />;
  if (loading || !training) return <Spin size="large" style={{ display: 'block', margin: '80px auto' }} />;

  const enrollmentColumns: ColumnsType<CompanyTrainingEnrollment> = [
    { title: 'Nombre', dataIndex: 'userName' },
    { title: 'Email', dataIndex: 'userEmail' },
    {
      title: 'Estado',
      dataIndex: 'status',
      width: 200,
      render: (v: EnrollmentStatus) => (
        <Tag color={statusColors[v]}>{enrollmentStatusLabels[v]}</Tag>
      ),
    },
    {
      title: 'Fecha inscripción',
      dataIndex: 'enrolledAt',
      width: 160,
      render: (v: string) => new Date(v).toLocaleDateString('es'),
    },
    {
      title: 'Completado',
      dataIndex: 'completedAt',
      width: 160,
      render: (v: string | null) => v ? new Date(v).toLocaleDateString('es') : '—',
    },
  ];

  return (
    <>
      <Space style={{ marginBottom: 16 }}>
        <Button icon={<ArrowLeftOutlined />} onClick={() => navigate('/trainings')}>Volver</Button>
      </Space>
      <Title level={3}>{training.title}</Title>

      {/* Información general */}
      <Card style={{ marginBottom: 24 }}>
        <Descriptions column={{ xs: 1, sm: 2, md: 3 }} bordered size="small">
          <Descriptions.Item label="Tipo">
            <Tag color={typeColors[training.trainingType]}>{trainingTypeLabels[training.trainingType]}</Tag>
          </Descriptions.Item>
          <Descriptions.Item label="Asignada por">{training.assignedByName}</Descriptions.Item>
          <Descriptions.Item label="Fecha asignación">
            {new Date(training.assignedAt).toLocaleDateString('es')}
          </Descriptions.Item>
          <Descriptions.Item label="Descripción" span={3}>
            {training.description ?? '—'}
          </Descriptions.Item>
        </Descriptions>
      </Card>

      {/* Recursos */}
      <Card title="Recursos de la capacitación" style={{ marginBottom: 24 }}>
        {training.resourcesJson.length === 0 ? (
          <Text type="secondary">No hay recursos disponibles.</Text>
        ) : (
          <Space direction="vertical" style={{ width: '100%' }}>
            {training.resourcesJson.map((resource: TrainingResource, idx: number) => (
              <Card key={resource.id ?? idx} size="small" type="inner">
                <Space>
                  {resourceIcon[resource.type] ?? <LinkOutlined />}
                  <Text strong>{resource.title ?? `Recurso ${idx + 1}`}</Text>
                  <Tag>{resource.type.toUpperCase()}</Tag>
                  {(resource.type === 'url' || resource.type === 'video') && resource.url && (
                    <Link href={resource.url} target="_blank" rel="noopener noreferrer">Abrir enlace</Link>
                  )}
                  {resource.type === 'pdf' && resource.filename && (
                    <Text type="secondary">{resource.filename}</Text>
                  )}
                </Space>
              </Card>
            ))}
          </Space>
        )}
      </Card>

      {/* Mi estado / acciones */}
      <Card title="Mi estado" style={{ marginBottom: 24 }}>
        {!myEnrollment ? (
          <Space direction="vertical">
            <Text>No estás inscrito en esta capacitación.</Text>
            <Button type="primary" loading={enrolling} onClick={handleEnroll}>
              Inscribirme
            </Button>
          </Space>
        ) : (
          <Space direction="vertical">
            <Space>
              <Text>Estado:</Text>
              <Tag color={statusColors[myEnrollment.status]}>
                {enrollmentStatusLabels[myEnrollment.status]}
              </Tag>
            </Space>
            {myEnrollment.status === 'PENDING' && (
              <Button
                type="primary"
                icon={<CheckCircleOutlined />}
                loading={completing}
                onClick={handleComplete}
              >
                Marcar como capacitado
              </Button>
            )}
            {myEnrollment.completedAt && (
              <Text type="secondary">
                Completado el {new Date(myEnrollment.completedAt).toLocaleDateString('es')}
              </Text>
            )}
          </Space>
        )}
      </Card>

      {/* Inscripciones */}
      <Title level={4}>Inscripciones</Title>
      <Card>
        <Table
          rowKey="id"
          columns={enrollmentColumns}
          dataSource={training.enrollments}
          pagination={false}
          size="small"
        />
      </Card>
    </>
  );
}
