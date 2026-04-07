import { useEffect, useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router';
import {
  Card, Typography, Tag, Space, Button, Collapse, Radio, Input,
  message, Spin, Statistic, Row, Col, Progress, Breadcrumb, Dropdown,
} from 'antd';
import {
  ArrowLeftOutlined, CheckCircleOutlined,
  CloseCircleOutlined, MinusCircleOutlined, DownOutlined,
} from '@ant-design/icons';
import { auditsApi } from '../../api/audits.api';
import type { AuditDetail, AuditResult, AuditResultValue, AuditStatus } from '../../types';
import { useCompany } from '../../hooks/useCompany';
import NoCompanySelected from '../../components/NoCompanySelected';

const { Title, Text } = Typography;

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

const resultOptions: { value: AuditResultValue; label: string; color: string; icon: React.ReactNode }[] = [
  { value: 'not_evaluated', label: 'No evaluado', color: '#d9d9d9', icon: <MinusCircleOutlined /> },
  { value: 'compliant', label: 'Conforme', color: '#52c41a', icon: <CheckCircleOutlined /> },
  { value: 'non_compliant', label: 'No conforme', color: '#ff4d4f', icon: <CloseCircleOutlined /> },
];

const resultColorMap: Record<AuditResultValue, string> = {
  not_evaluated: 'default',
  compliant: 'success',
  non_compliant: 'error',
};

const themeLabels: Record<string, string> = {
  Organizational: 'A.5 — Controles organizacionales',
  People: 'A.6 — Controles de personas',
  Physical: 'A.7 — Controles físicos',
  Technological: 'A.8 — Controles tecnológicos',
};

export default function AuditChecklistPage() {
  const { auditId } = useParams<{ auditId: string }>();
  const navigate = useNavigate();
  const { selectedCompany } = useCompany();

  const [audit, setAudit] = useState<AuditDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [savingMap, setSavingMap] = useState<Record<number, boolean>>({});
  const [commentMap, setCommentMap] = useState<Record<number, string>>({});
  const [expandedComment, setExpandedComment] = useState<number | null>(null);

  useEffect(() => {
    if (!selectedCompany || !auditId) return;
    let ignore = false;
    const load = async () => {
      setLoading(true);
      try {
        const { data } = await auditsApi.getById(selectedCompany.id, parseInt(auditId));
        if (!ignore) {
          setAudit(data.data);
          const comments: Record<number, string> = {};
          data.data.results.forEach((r) => {
            comments[r.controlId] = r.comments ?? '';
          });
          setCommentMap(comments);
        }
      } catch {
        if (!ignore) message.error('Error al cargar la auditoría');
      } finally {
        if (!ignore) setLoading(false);
      }
    };
    load();
    return () => { ignore = true; };
  }, [selectedCompany, auditId]);

  const grouped = useMemo(() => {
    if (!audit) return [];
    const groups: Record<string, { themeName: string; themeId: number; results: AuditResult[] }> = {};
    for (const r of audit.results) {
      if (!groups[r.themeName]) {
        groups[r.themeName] = { themeName: r.themeName, themeId: r.themeId, results: [] };
      }
      groups[r.themeName].results.push(r);
    }
    return Object.values(groups).sort((a, b) => a.themeId - b.themeId);
  }, [audit]);

  const stats = useMemo(() => {
    if (!audit) return { total: 0, evaluated: 0, compliant: 0, nonCompliant: 0 };
    const results = audit.results;
    return {
      total: results.length,
      evaluated: results.filter((r) => r.result !== 'not_evaluated').length,
      compliant: results.filter((r) => r.result === 'compliant').length,
      nonCompliant: results.filter((r) => r.result === 'non_compliant').length,
    };
  }, [audit]);

  const handleResultChange = async (controlId: number, result: AuditResultValue) => {
    if (!audit || !selectedCompany) return;
    setSavingMap((prev) => ({ ...prev, [controlId]: true }));
    try {
      const { data } = await auditsApi.updateResult(
        selectedCompany.id,
        audit.id,
        controlId,
        { result, comments: commentMap[controlId] || undefined },
      );
      setAudit((prev) => {
        if (!prev) return prev;
        const updated = prev.results.map((r) =>
          r.controlId === controlId ? { ...r, ...data.data } : r,
        );
        const evaluatedCount = updated.filter((r) => r.result !== 'not_evaluated').length;
        const compliantCount = updated.filter((r) => r.result === 'compliant').length;
        const allEvaluated = updated.every((r) => r.result !== 'not_evaluated');
        const anyEvaluated = updated.some((r) => r.result !== 'not_evaluated');
        let status = prev.status;
        if (allEvaluated) status = 'completed';
        else if (anyEvaluated && status === 'planned') status = 'in_progress';
        return { ...prev, results: updated, evaluatedCount, compliantCount, status };
      });
    } catch {
      message.error('Error al actualizar resultado');
    } finally {
      setSavingMap((prev) => ({ ...prev, [controlId]: false }));
    }
  };

  const handleSaveComment = async (controlId: number) => {
    if (!audit || !selectedCompany) return;
    const current = audit.results.find((r) => r.controlId === controlId);
    if (!current) return;
    setSavingMap((prev) => ({ ...prev, [controlId]: true }));
    try {
      await auditsApi.updateResult(selectedCompany.id, audit.id, controlId, {
        result: current.result,
        comments: commentMap[controlId] || undefined,
      });
      setAudit((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          results: prev.results.map((r) =>
            r.controlId === controlId ? { ...r, comments: commentMap[controlId] || null } : r,
          ),
        };
      });
      message.success('Comentario guardado');
    } catch {
      message.error('Error al guardar comentario');
    } finally {
      setSavingMap((prev) => ({ ...prev, [controlId]: false }));
    }
  };

  const handleStatusChange = async (newStatus: AuditStatus) => {
    if (!audit || !selectedCompany) return;
    try {
      await auditsApi.update(selectedCompany.id, audit.id, { status: newStatus });
      setAudit((prev) => prev ? { ...prev, status: newStatus } : prev);
      message.success(`Estado cambiado a: ${statusLabels[newStatus]}`);
    } catch {
      message.error('Error al cambiar estado');
    }
  };

  if (!selectedCompany) return <NoCompanySelected feature="auditorías" />;

  if (loading) {
    return <div style={{ textAlign: 'center', padding: 80 }}><Spin size="large" /></div>;
  }

  if (!audit) {
    return <div style={{ textAlign: 'center', padding: 80 }}><Text type="secondary">Auditoría no encontrada</Text></div>;
  }

  const evaluatedPercent = stats.total > 0 ? Math.round((stats.evaluated / stats.total) * 100) : 0;

  return (
    <>
      <Breadcrumb
        style={{ marginBottom: 16 }}
        items={[
          { title: <a onClick={() => navigate('/audits')}>Auditorías</a> },
          { title: `Auditoría #${audit.id}` },
        ]}
      />

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <Space>
          <Button icon={<ArrowLeftOutlined />} onClick={() => navigate('/audits')} />
          <Title level={3} style={{ margin: 0 }}>Checklist de Auditoría</Title>
          <Tag color={statusColors[audit.status]}>{statusLabels[audit.status]}</Tag>
        </Space>
        <Dropdown
          menu={{
            items: (['planned', 'in_progress', 'completed'] as AuditStatus[]).map((s) => ({
              key: s,
              label: statusLabels[s],
              disabled: s === audit.status,
            })),
            onClick: ({ key }) => handleStatusChange(key as AuditStatus),
          }}
        >
          <Button>
            Cambiar estado <DownOutlined />
          </Button>
        </Dropdown>
      </div>

      {/* Info Card */}
      <Card size="small" style={{ marginBottom: 16 }}>
        <Row gutter={16}>
          <Col span={6}><Text type="secondary">Fecha:</Text> <Text strong>{new Date(audit.date).toLocaleDateString('es-CO')}</Text></Col>
          <Col span={6}><Text type="secondary">Auditor:</Text> <Text strong>{audit.auditorName}</Text></Col>
          <Col span={12}><Text type="secondary">Notas:</Text> <Text>{audit.notes || '—'}</Text></Col>
        </Row>
      </Card>

      {/* Statistics */}
      <Row gutter={16} style={{ marginBottom: 16 }}>
        <Col span={6}>
          <Card size="small">
            <Statistic title="Total controles" value={stats.total} />
          </Card>
        </Col>
        <Col span={6}>
          <Card size="small">
            <Statistic title="Evaluados" value={stats.evaluated} suffix={`/ ${stats.total}`} />
            <Progress percent={evaluatedPercent} size="small" showInfo={false} />
          </Card>
        </Col>
        <Col span={6}>
          <Card size="small">
            <Statistic title="Conformes" value={stats.compliant} valueStyle={{ color: '#52c41a' }} prefix={<CheckCircleOutlined />} />
          </Card>
        </Col>
        <Col span={6}>
          <Card size="small">
            <Statistic title="No conformes" value={stats.nonCompliant} valueStyle={{ color: '#ff4d4f' }} prefix={<CloseCircleOutlined />} />
          </Card>
        </Col>
      </Row>

      {/* Checklist grouped by theme */}
      <Collapse
        defaultActiveKey={grouped.map((g) => g.themeName)}
        items={grouped.map((group) => {
          const groupEvaluated = group.results.filter((r) => r.result !== 'not_evaluated').length;
          const groupCompliant = group.results.filter((r) => r.result === 'compliant').length;

          return {
            key: group.themeName,
            label: (
              <Space>
                <Text strong>{themeLabels[group.themeName] ?? group.themeName}</Text>
                <Tag>{group.results.length} controles</Tag>
                <Tag color="blue">{groupEvaluated}/{group.results.length} evaluados</Tag>
                {groupCompliant > 0 && <Tag color="green">{groupCompliant} conformes</Tag>}
              </Space>
            ),
            children: (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {group.results.map((result) => (
                  <Card
                    key={result.controlId}
                    size="small"
                    style={{
                      borderLeft: `4px solid ${resultOptions.find((o) => o.value === result.result)?.color ?? '#d9d9d9'}`,
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 16 }}>
                      <div style={{ flex: 1 }}>
                        <Space align="start">
                          <Tag color={resultColorMap[result.result]} style={{ minWidth: 50, textAlign: 'center' }}>
                            {result.code}
                          </Tag>
                          <div>
                            <Text strong>{result.title}</Text>
                          </div>
                        </Space>
                      </div>
                      <div>
                        <Radio.Group
                          value={result.result}
                          onChange={(e) => handleResultChange(result.controlId, e.target.value)}
                          disabled={savingMap[result.controlId]}
                          optionType="button"
                          buttonStyle="solid"
                          size="small"
                        >
                          {resultOptions.map((opt) => (
                            <Radio.Button
                              key={opt.value}
                              value={opt.value}
                              style={result.result === opt.value ? { backgroundColor: opt.color, borderColor: opt.color, color: '#fff' } : {}}
                            >
                              {opt.icon} {opt.label}
                            </Radio.Button>
                          ))}
                        </Radio.Group>
                      </div>
                    </div>

                    {/* Comment section */}
                    <div style={{ marginTop: 8 }}>
                      {expandedComment === result.controlId ? (
                        <Space.Compact style={{ width: '100%' }}>
                          <Input.TextArea
                            value={commentMap[result.controlId] ?? ''}
                            onChange={(e) => setCommentMap((prev) => ({ ...prev, [result.controlId]: e.target.value }))}
                            placeholder="Comentarios u observaciones..."
                            autoSize={{ minRows: 1, maxRows: 3 }}
                            style={{ flex: 1 }}
                          />
                          <Button
                            type="primary"
                            size="small"
                            loading={savingMap[result.controlId]}
                            onClick={() => { handleSaveComment(result.controlId); setExpandedComment(null); }}
                            style={{ height: 'auto' }}
                          >
                            Guardar
                          </Button>
                          <Button size="small" onClick={() => setExpandedComment(null)} style={{ height: 'auto' }}>
                            Cerrar
                          </Button>
                        </Space.Compact>
                      ) : (
                        <Button
                          type="link"
                          size="small"
                          onClick={() => setExpandedComment(result.controlId)}
                          style={{ padding: 0, fontSize: 12 }}
                        >
                          {result.comments ? `💬 ${result.comments}` : '+ Agregar comentario'}
                        </Button>
                      )}
                    </div>
                  </Card>
                ))}
              </div>
            ),
          };
        })}
      />
    </>
  );
}
