import { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router';
import {
  Card, Typography, Progress, Tag, Button, Space, Select,
  Input, Timeline, Avatar, Divider, Row, Col, Skeleton,
  message, Tooltip, Badge,
} from 'antd';
import {
  ArrowLeftOutlined,
  CheckCircleFilled,
  MinusCircleFilled,
  ClockCircleFilled,
  SendOutlined,
  UserOutlined,
  FileTextOutlined,
  DeploymentUnitOutlined,
  SafetyCertificateOutlined,
  TeamOutlined,
  LineChartOutlined,
  AuditOutlined,
  FileSearchOutlined,
} from '@ant-design/icons';
import { implementationApi } from '../../api/implementation.api';
import type {
  ImplementationControlDetail,
  ImplementationTask,
  TaskStatus,
} from '../../types';
import { useCompany } from '../../hooks/useCompany';
import dayjs from 'dayjs';

const { Title, Text, Paragraph } = Typography;

// ── Dimensiones: iconos y colores ─────────────────────────────────────────

const dimensionMeta: Record<string, { icon: React.ReactNode; color: string }> = {
  policy: { icon: <FileTextOutlined />, color: '#1677ff' },
  procedures: { icon: <AuditOutlined />, color: '#722ed1' },
  technical: { icon: <DeploymentUnitOutlined />, color: '#13c2c2' },
  evidence: { icon: <FileSearchOutlined />, color: '#fa8c16' },
  training: { icon: <TeamOutlined />, color: '#eb2f96' },
  monitoring: { icon: <LineChartOutlined />, color: '#52c41a' },
};

const taskStatusConfig: Record<TaskStatus, { label: string; color: string; icon: React.ReactNode }> = {
  not_started: { label: 'No iniciado', color: 'default', icon: <MinusCircleFilled style={{ color: '#d9d9d9' }} /> },
  in_progress: { label: 'En progreso', color: 'processing', icon: <ClockCircleFilled style={{ color: '#1677ff' }} /> },
  completed: { label: 'Completado', color: 'success', icon: <CheckCircleFilled style={{ color: '#52c41a' }} /> },
};

const maturityLabels: Record<string, string> = {
  initial: 'Inicial',
  managed: 'Gestionado',
  defined: 'Definido',
  measured: 'Medido',
  optimized: 'Optimizado',
};

const controlStatusLabels: Record<string, string> = {
  pending: 'Pendiente',
  in_progress: 'En progreso',
  implemented: 'Implementado',
  non_compliant: 'No conformidad',
  under_review: 'En revisión',
};

const controlStatusColors: Record<string, string> = {
  pending: 'default',
  in_progress: 'processing',
  implemented: 'success',
  non_compliant: 'error',
  under_review: 'warning',
};

function progressColor(pct: number): string {
  if (pct >= 80) return '#52c41a';
  if (pct >= 40) return '#faad14';
  return '#ff4d4f';
}

// ── Task card component ──────────────────────────────────────────────────────

function TaskCard({
  task,
  onUpdate,
  updating,
}: {
  task: ImplementationTask;
  onUpdate: (taskId: number, status: TaskStatus, notes: string) => Promise<void>;
  updating: boolean;
}) {
  const [localNotes, setLocalNotes] = useState(task.notes ?? '');
  const [localStatus, setLocalStatus] = useState<TaskStatus>(task.status);
  const [dirty, setDirty] = useState(false);
  const meta = dimensionMeta[task.dimension] ?? { icon: <SafetyCertificateOutlined />, color: '#8c8c8c' };
  const statusCfg = taskStatusConfig[localStatus];

  const handleSave = async () => {
    await onUpdate(task.id, localStatus, localNotes);
    setDirty(false);
  };

  return (
    <Card
      size="small"
      style={{
        borderLeft: `4px solid ${meta.color}`,
        opacity: localStatus === 'completed' ? 0.85 : 1,
      }}
      bodyStyle={{ padding: '12px 16px' }}
    >
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
        <div
          style={{
            width: 36,
            height: 36,
            borderRadius: 8,
            background: `${meta.color}18`,
            color: meta.color,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 16,
            flexShrink: 0,
          }}
        >
          {meta.icon}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4, flexWrap: 'wrap', gap: 8 }}>
            <Text strong style={{ fontSize: 13 }}>{task.dimensionLabel}</Text>
            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              {statusCfg.icon}
              <Select<TaskStatus>
                value={localStatus}
                size="small"
                style={{ width: 130 }}
                onChange={v => { setLocalStatus(v); setDirty(true); }}
                options={[
                  { value: 'not_started', label: 'No iniciado' },
                  { value: 'in_progress', label: 'En progreso' },
                  { value: 'completed', label: 'Completado' },
                ]}
              />
            </div>
          </div>
          <Text type="secondary" style={{ fontSize: 11, display: 'block', marginBottom: 8 }}>
            {task.dimensionDescription}
          </Text>
          <Input.TextArea
            value={localNotes}
            onChange={e => { setLocalNotes(e.target.value); setDirty(true); }}
            placeholder="Notas sobre esta dimensión (qué se ha hecho, qué falta, referencias a documentos...)"
            autoSize={{ minRows: 2, maxRows: 5 }}
            style={{ fontSize: 12 }}
          />
          {dirty && (
            <div style={{ marginTop: 8, display: 'flex', justifyContent: 'flex-end' }}>
              <Button
                size="small"
                type="primary"
                loading={updating}
                onClick={handleSave}
              >
                Guardar cambios
              </Button>
            </div>
          )}
          {task.completedAt && (
            <Text type="secondary" style={{ fontSize: 11, marginTop: 4, display: 'block' }}>
              Completado el {dayjs(task.completedAt).format('DD MMM YYYY')}
            </Text>
          )}
        </div>
      </div>
    </Card>
  );
}

// ── Main page ────────────────────────────────────────────────────────────────

export default function ImplementationDetailPage() {
  const { controlId } = useParams<{ controlId: string }>();
  const navigate = useNavigate();
  const { selectedCompany } = useCompany();

  const [detail, setDetail] = useState<ImplementationControlDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [updatingTaskId, setUpdatingTaskId] = useState<number | null>(null);
  const [noteContent, setNoteContent] = useState('');
  const [addingNote, setAddingNote] = useState(false);
  const notesEndRef = useRef<HTMLDivElement>(null);

  const load = async () => {
    if (!selectedCompany || !controlId) return;
    setLoading(true);
    try {
      const { data } = await implementationApi.getControlDetail(selectedCompany.id, parseInt(controlId));
      setDetail(data.data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedCompany, controlId]);

  const handleUpdateTask = async (taskId: number, status: TaskStatus, notes: string) => {
    if (!selectedCompany || !controlId) return;
    setUpdatingTaskId(taskId);
    try {
      await implementationApi.updateTask(selectedCompany.id, parseInt(controlId), taskId, { status, notes });
      message.success('Dimensión actualizada');
      await load();
    } finally {
      setUpdatingTaskId(null);
    }
  };

  const handleAddNote = async () => {
    if (!selectedCompany || !controlId || !noteContent.trim()) return;
    setAddingNote(true);
    try {
      await implementationApi.addNote(selectedCompany.id, parseInt(controlId), noteContent.trim());
      setNoteContent('');
      message.success('Nota agregada');
      await load();
      setTimeout(() => notesEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
    } finally {
      setAddingNote(false);
    }
  };

  if (!selectedCompany) {
    return (
      <div style={{ padding: 24 }}>
        <Button icon={<ArrowLeftOutlined />} onClick={() => navigate('/implementation')}>Volver</Button>
      </div>
    );
  }

  if (loading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <Skeleton.Button active size="small" style={{ width: 120 }} />
        <Skeleton active paragraph={{ rows: 3 }} />
        <Row gutter={16}>{[...Array(6)].map((_, i) => (
          <Col key={i} xs={24} md={12}><Skeleton active paragraph={{ rows: 3 }} /></Col>
        ))}</Row>
      </div>
    );
  }

  if (!detail) {
    return (
      <div>
        <Button icon={<ArrowLeftOutlined />} onClick={() => navigate('/implementation')}>Volver</Button>
        <Text type="secondary" style={{ marginLeft: 16 }}>Control no encontrado para esta empresa.</Text>
      </div>
    );
  }

  const completedTasks = detail.tasks.filter(t => t.status === 'completed').length;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {/* Breadcrumb / Back */}
      <div>
        <Button
          type="text"
          icon={<ArrowLeftOutlined />}
          onClick={() => navigate('/implementation')}
          style={{ paddingLeft: 0, color: '#595959' }}
        >
          Implementación
        </Button>
      </div>

      {/* Control header */}
      <Card>
        <Row gutter={24} align="middle">
          <Col xs={24} md={16}>
            <Space size={8} style={{ marginBottom: 8 }}>
              <Tag style={{ fontFamily: 'monospace', fontWeight: 700 }}>{detail.code}</Tag>
              <Tag color="blue">{detail.themeName}</Tag>
              <Tag color={controlStatusColors[detail.status] ?? 'default'}>
                {controlStatusLabels[detail.status] ?? detail.status}
              </Tag>
              <Tag>{maturityLabels[detail.maturityLevel] ?? detail.maturityLevel}</Tag>
            </Space>
            <Title level={4} style={{ margin: '4px 0 8px' }}>{detail.title}</Title>
            {detail.description && (
              <Paragraph type="secondary" style={{ margin: 0, fontSize: 13 }}>
                {detail.description}
              </Paragraph>
            )}
            {detail.assignedUserName && (
              <div style={{ marginTop: 8 }}>
                <Text type="secondary" style={{ fontSize: 12 }}>
                  <UserOutlined style={{ marginRight: 4 }} />
                  Responsable: <strong>{detail.assignedUserName}</strong>
                </Text>
              </div>
            )}
          </Col>
          <Col xs={24} md={8}>
            <div style={{ textAlign: 'center' }}>
              <Tooltip title={`${completedTasks} de ${detail.totalTasks} dimensiones completadas`}>
                <Progress
                  type="circle"
                  percent={detail.progressPercentage}
                  strokeColor={progressColor(detail.progressPercentage)}
                  size={100}
                  format={pct => (
                    <div>
                      <div style={{ fontSize: 20, fontWeight: 700 }}>{pct}%</div>
                      <div style={{ fontSize: 10, color: '#8c8c8c' }}>{completedTasks}/{detail.totalTasks}</div>
                    </div>
                  )}
                />
              </Tooltip>
              <div style={{ marginTop: 8 }}>
                <Text type="secondary" style={{ fontSize: 12 }}>Avance de implementación</Text>
              </div>
            </div>
          </Col>
        </Row>
      </Card>

      {/* Guía contextual ISO */}
      <Card
        size="small"
        style={{ background: '#f0f5ff', borderColor: '#adc6ff' }}
        bodyStyle={{ padding: '10px 16px' }}
      >
        <Text style={{ fontSize: 12, color: '#1d39c4' }}>
          <strong>¿Cómo funciona la implementación ISO 27001?</strong> Cada control se implementa
          en 6 dimensiones: desde la definición de política hasta el monitoreo continuo.
          Actualiza el estado y agrega notas por cada dimensión conforme avances.
          El porcentaje de cumplimiento se calcula automáticamente.
        </Text>
      </Card>

      {/* 6 dimensiones de implementación */}
      <div>
        <Title level={5} style={{ marginBottom: 12 }}>
          Dimensiones de implementación
          <Badge
            count={`${completedTasks}/${detail.totalTasks}`}
            style={{ marginLeft: 8, backgroundColor: progressColor(detail.progressPercentage), fontSize: 11 }}
          />
        </Title>
        <Row gutter={[12, 12]}>
          {detail.tasks.map(task => (
            <Col key={task.id} xs={24} md={12}>
              <TaskCard
                task={task}
                onUpdate={handleUpdateTask}
                updating={updatingTaskId === task.id}
              />
            </Col>
          ))}
        </Row>
      </div>

      <Divider style={{ margin: '8px 0' }} />

      {/* Notas y actividad */}
      <div>
        <Title level={5} style={{ marginBottom: 12 }}>
          Notas y actividad
          <Text type="secondary" style={{ fontSize: 12, fontWeight: 400, marginLeft: 8 }}>
            ({detail.notes.length} {detail.notes.length === 1 ? 'nota' : 'notas'})
          </Text>
        </Title>

        {/* Agregar nota */}
        <Card size="small" style={{ marginBottom: 16 }}>
          <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
            <Avatar size={32} icon={<UserOutlined />} style={{ flexShrink: 0, marginTop: 4 }} />
            <div style={{ flex: 1 }}>
              <Input.TextArea
                value={noteContent}
                onChange={e => setNoteContent(e.target.value)}
                placeholder="Registra qué se ha hecho, decisiones tomadas, próximos pasos, links a documentos..."
                autoSize={{ minRows: 2, maxRows: 6 }}
                onPressEnter={e => {
                  if (e.ctrlKey || e.metaKey) handleAddNote();
                }}
              />
              <div style={{ marginTop: 8, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Text type="secondary" style={{ fontSize: 11 }}>Ctrl+Enter para enviar</Text>
                <Button
                  type="primary"
                  size="small"
                  icon={<SendOutlined />}
                  loading={addingNote}
                  disabled={!noteContent.trim()}
                  onClick={handleAddNote}
                >
                  Agregar nota
                </Button>
              </div>
            </div>
          </div>
        </Card>

        {/* Timeline de notas */}
        {detail.notes.length > 0 ? (
          <Timeline
            items={detail.notes.map(note => ({
              key: note.id,
              dot: (
                <Avatar size={24} icon={<UserOutlined />} style={{ fontSize: 11 }} />
              ),
              children: (
                <Card size="small" style={{ marginBottom: 4 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 4 }}>
                    <Text strong style={{ fontSize: 13 }}>{note.userName}</Text>
                    <Tooltip title={dayjs(note.createdAt).format('DD/MM/YYYY HH:mm')}>
                      <Text type="secondary" style={{ fontSize: 11 }}>
                        {dayjs(note.createdAt).fromNow()}
                      </Text>
                    </Tooltip>
                  </div>
                  <Text style={{ fontSize: 13, whiteSpace: 'pre-wrap' }}>{note.content}</Text>
                </Card>
              ),
            }))}
          />
        ) : (
          <div style={{ textAlign: 'center', padding: '24px 0', color: '#8c8c8c' }}>
            <Text type="secondary">No hay notas aún. Sé el primero en registrar el avance.</Text>
          </div>
        )}
        <div ref={notesEndRef} />
      </div>
    </div>
  );
}
