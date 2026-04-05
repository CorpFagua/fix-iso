import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import {
  Table, Card, Switch, Input, Typography, Modal, Button,
  Progress, Tooltip, Alert, Space,
} from 'antd';
import {
  WarningFilled,
  CheckCircleFilled,
  DeleteOutlined,
  ArrowRightOutlined,
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { controlsApi } from '../../api/controls.api';
import type { SoAEntry } from '../../types';
import { useCompany } from '../../hooks/useCompany';
import NoCompanySelected from '../../components/NoCompanySelected';

const { Title, Text, Paragraph } = Typography;

interface DeactivateState {
  open: boolean;
  record: SoAEntry | null;
  justification: string;
  submitting: boolean;
}

function progressColor(pct: number): string {
  if (pct >= 80) return '#52c41a';
  if (pct >= 40) return '#faad14';
  return '#ff4d4f';
}

export default function SoAPage() {
  const { selectedCompany } = useCompany();
  const navigate = useNavigate();
  const [entries, setEntries] = useState<SoAEntry[]>([]);
  const [loadKey, setLoadKey] = useState(0);
  const [loadedKey, setLoadedKey] = useState(-1);
  const [deactivate, setDeactivate] = useState<DeactivateState>({
    open: false, record: null, justification: '', submitting: false,
  });

  const loading = loadedKey !== loadKey;

  useEffect(() => {
    if (!selectedCompany) return;
    let cancelled = false;
    controlsApi.getSoA(selectedCompany.id)
      .then(({ data }) => {
        if (!cancelled) { setEntries(data.data); setLoadedKey(loadKey); }
      })
      .catch(() => { if (!cancelled) setLoadedKey(loadKey); });
    return () => { cancelled = true; };
  }, [selectedCompany, loadKey]);

  const reload = () => setLoadKey(k => k + 1);

  // ── Toggle applicable ────────────────────────────────────────────────────

  const handleToggle = (record: SoAEntry) => {
    if (!record.applicable) {
      // Activating: safe, do it directly
      activateControl(record);
      return;
    }

    // Deactivating: always show confirmation, danger level varies
    setDeactivate({ open: true, record, justification: record.justification ?? '', submitting: false });
  };

  const activateControl = async (record: SoAEntry) => {
    await controlsApi.updateSoA(selectedCompany!.id, record.controlId, {
      applicable: true,
      justification: undefined,
      implementationStatus: 'not_started',
    });
    reload();
  };

  const confirmDeactivate = async (force: boolean) => {
    if (!deactivate.record) return;
    setDeactivate(s => ({ ...s, submitting: true }));
    try {
      await controlsApi.updateSoA(selectedCompany!.id, deactivate.record.controlId, {
        applicable: false,
        justification: deactivate.justification || undefined,
        implementationStatus: 'not_applicable',
        forceDeactivate: force,
      });
      setDeactivate({ open: false, record: null, justification: '', submitting: false });
      reload();
    } catch {
      setDeactivate(s => ({ ...s, submitting: false }));
    }
  };

  const updateJustification = async (record: SoAEntry, justification: string) => {
    await controlsApi.updateSoA(selectedCompany!.id, record.controlId, {
      applicable: record.applicable,
      justification,
    });
    reload();
  };

  // ── Table columns ────────────────────────────────────────────────────────

  const columns: ColumnsType<SoAEntry> = [
    {
      title: 'Código',
      dataIndex: 'code',
      width: 80,
      sorter: (a, b) => a.code.localeCompare(b.code),
    },
    {
      title: 'Control',
      dataIndex: 'title',
      ellipsis: true,
    },
    {
      title: 'Dominio',
      dataIndex: 'themeName',
      width: 140,
      ellipsis: true,
    },
    {
      title: 'Aplicable',
      dataIndex: 'applicable',
      width: 110,
      align: 'center',
      render: (val: boolean, record) => (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
          <Switch
            checked={val}
            onChange={() => handleToggle(record)}
            style={val ? undefined : { background: '#d9d9d9' }}
          />
          {val && record.tasksCompleted > 0 && (
            <Tooltip title={`${record.tasksCompleted}/6 dimensiones implementadas`}>
              <span style={{ fontSize: 10, color: progressColor(record.progressPercentage), fontWeight: 600, cursor: 'default' }}>
                {record.tasksCompleted}/6 dims
              </span>
            </Tooltip>
          )}
        </div>
      ),
    },
    {
      title: 'Progreso impl.',
      width: 140,
      render: (_: unknown, record) => {
        if (!record.applicable) return <Text type="secondary" style={{ fontSize: 12 }}>No aplica</Text>;
        if (record.tasksCompleted === 0 && record.progressPercentage === 0) {
          return <Text type="secondary" style={{ fontSize: 12 }}>Sin iniciar</Text>;
        }
        return (
          <Tooltip title={`${record.tasksCompleted}/6 dimensiones · ${record.notesCount} nota${record.notesCount !== 1 ? 's' : ''}`}>
            <Progress
              percent={record.progressPercentage}
              size="small"
              strokeColor={progressColor(record.progressPercentage)}
              style={{ margin: 0 }}
              format={p => <span style={{ fontSize: 10 }}>{p}%</span>}
            />
          </Tooltip>
        );
      },
    },
    {
      title: 'Justificación / Notas',
      dataIndex: 'justification',
      render: (val: string | null, record) => (
        <Input.TextArea
          autoSize={{ minRows: 1, maxRows: 3 }}
          defaultValue={val ?? ''}
          key={`${record.controlId}-${val}`}
          placeholder={!record.applicable ? 'Justifique por qué no aplica...' : 'Observaciones opcionales'}
          onBlur={e => {
            if (e.target.value !== (val ?? '')) updateJustification(record, e.target.value);
          }}
          style={{ fontSize: 12 }}
        />
      ),
    },
    {
      width: 40,
      render: (_: unknown, record) => record.applicable && record.tasksCompleted > 0 ? (
        <Tooltip title="Ver implementación">
          <Button
            type="text"
            size="small"
            icon={<ArrowRightOutlined style={{ color: '#1677ff' }} />}
            onClick={e => { e.stopPropagation(); navigate(`/implementation/${record.controlId}`); }}
          />
        </Tooltip>
      ) : null,
    },
  ];

  if (!selectedCompany) return <NoCompanySelected feature="la Declaración de Aplicabilidad" />;

  // ── Determine if deactivation is dangerous ───────────────────────────────
  const rec = deactivate.record;
  const hasProgress = rec ? (rec.tasksCompleted > 0 || rec.notesCount > 0) : false;

  return (
    <>
      <Title level={3}>Declaración de Aplicabilidad (SoA)</Title>
      <Card>
        <Table
          rowKey="controlId"
          columns={columns}
          dataSource={entries}
          loading={loading}
          pagination={{ pageSize: 20, showTotal: t => `${t} controles` }}
          size="middle"
        />
      </Card>

      {/* ── Modal de desactivación ──────────────────────────────────────── */}
      <Modal
        open={deactivate.open}
        onCancel={() => setDeactivate(s => ({ ...s, open: false }))}
        footer={null}
        width={480}
        closable={!deactivate.submitting}
        maskClosable={!deactivate.submitting}
        title={null}
      >
        {rec && (
          <div>
            {/* Header del modal */}
            <div style={{
              background: hasProgress ? '#fff1f0' : '#fffbe6',
              border: `1px solid ${hasProgress ? '#ffccc7' : '#ffe58f'}`,
              borderRadius: 8,
              padding: '16px 20px',
              marginBottom: 20,
              display: 'flex',
              gap: 12,
              alignItems: 'flex-start',
            }}>
              <WarningFilled style={{ fontSize: 24, color: hasProgress ? '#ff4d4f' : '#faad14', marginTop: 2, flexShrink: 0 }} />
              <div>
                <Text strong style={{ fontSize: 15, color: hasProgress ? '#cf1322' : '#d46b08', display: 'block', marginBottom: 4 }}>
                  {hasProgress ? 'Acción destructiva — se perderá información' : 'Marcar como no aplicable'}
                </Text>
                <Text style={{ fontSize: 12, color: '#595959' }}>
                  <strong>{rec.code}</strong> — {rec.title}
                </Text>
              </div>
            </div>

            {/* Detalle del impacto si tiene progreso */}
            {hasProgress && (
              <Alert
                type="error"
                style={{ marginBottom: 16 }}
                showIcon
                icon={<DeleteOutlined style={{ color: '#ff4d4f' }} />}
                message={
                  <Text strong style={{ color: '#cf1322' }}>
                    Se eliminará permanentemente:
                  </Text>
                }
                description={
                  <Space direction="vertical" size={2} style={{ marginTop: 4 }}>
                    {rec.tasksCompleted > 0 && (
                      <Text style={{ fontSize: 13 }}>
                        • <strong>{rec.tasksCompleted} dimensión{rec.tasksCompleted > 1 ? 'es' : ''} completada{rec.tasksCompleted > 1 ? 's' : ''}</strong> de implementación
                      </Text>
                    )}
                    {rec.progressPercentage > 0 && rec.tasksCompleted === 0 && (
                      <Text style={{ fontSize: 13 }}>
                        • Dimensiones en progreso ({rec.progressPercentage}% de avance)
                      </Text>
                    )}
                    {rec.notesCount > 0 && (
                      <Text style={{ fontSize: 13 }}>
                        • <strong>{rec.notesCount} nota{rec.notesCount > 1 ? 's' : ''}</strong> de seguimiento registrada{rec.notesCount > 1 ? 's' : ''}
                      </Text>
                    )}
                    <Text style={{ fontSize: 13, marginTop: 4 }} type="danger">
                      Esta información no se puede recuperar.
                    </Text>
                  </Space>
                }
              />
            )}

            {!hasProgress && (
              <Paragraph style={{ color: '#595959', marginBottom: 16 }}>
                El control se marcará como no aplicable y se eliminará del módulo de Implementación.
                Si deseas, puedes documentar la razón de exclusión.
              </Paragraph>
            )}

            {/* Justificación */}
            <div style={{ marginBottom: 20 }}>
              <Text strong style={{ display: 'block', marginBottom: 6 }}>
                Justificación de exclusión {hasProgress ? <Text type="danger">(requerida)</Text> : <Text type="secondary">(opcional)</Text>}
              </Text>
              <Input.TextArea
                value={deactivate.justification}
                onChange={e => setDeactivate(s => ({ ...s, justification: e.target.value }))}
                placeholder="Explica por qué este control no aplica a esta empresa..."
                autoSize={{ minRows: 2, maxRows: 4 }}
                autoFocus
              />
            </div>

            {/* Botones */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
              <Button
                onClick={() => setDeactivate(s => ({ ...s, open: false }))}
                disabled={deactivate.submitting}
              >
                Cancelar
              </Button>
              {hasProgress ? (
                <Button
                  danger
                  type="primary"
                  loading={deactivate.submitting}
                  disabled={!deactivate.justification.trim()}
                  icon={<DeleteOutlined />}
                  onClick={() => confirmDeactivate(true)}
                >
                  Sí, eliminar y desactivar
                </Button>
              ) : (
                <Button
                  type="primary"
                  loading={deactivate.submitting}
                  icon={<CheckCircleFilled />}
                  onClick={() => confirmDeactivate(false)}
                  style={{ background: '#faad14', borderColor: '#faad14' }}
                >
                  Confirmar exclusión
                </Button>
              )}
            </div>
          </div>
        )}
      </Modal>
    </>
  );
}
