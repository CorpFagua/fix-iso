import { useEffect, useState, useRef } from 'react';
import { Table, Card, Switch, Input, Tag, Typography, message } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { controlsApi } from '../../api/controls.api';
import type { SoAEntry } from '../../types';
import { useCompany } from '../../hooks/useCompany';
import NoCompanySelected from '../../components/NoCompanySelected';

const { Title } = Typography;

export default function SoAPage() {
  const { selectedCompany } = useCompany();
  const [entries, setEntries] = useState<SoAEntry[]>([]);
  const [loading, setLoading] = useState(true);

  const loadRef = useRef<(() => void) | undefined>(undefined);

  useEffect(() => {
    if (!selectedCompany) return;
    let ignore = false;
    const load = async () => {
      setLoading(true);
      const { data } = await controlsApi.getSoA(selectedCompany.id);
      if (!ignore) {
        setEntries(data.data);
        setLoading(false);
      }
    };
    load();
    loadRef.current = load;
    return () => { ignore = true; };
  }, [selectedCompany]);

  const toggleApplicable = async (record: SoAEntry) => {
    await controlsApi.updateSoA(selectedCompany!.id, record.controlId, {
      applicable: !record.applicable,
      justification: record.justification ?? undefined,
    });
    message.success(`Control ${record.code} actualizado`);
    loadRef.current?.();
  };

  const updateJustification = async (record: SoAEntry, justification: string) => {
    await controlsApi.updateSoA(selectedCompany!.id, record.controlId, {
      applicable: record.applicable,
      justification,
    });
    message.success('Justificación guardada');
    loadRef.current?.();
  };

  const columns: ColumnsType<SoAEntry> = [
    { title: 'Código', dataIndex: 'code', width: 90, sorter: (a, b) => a.code.localeCompare(b.code) },
    { title: 'Control', dataIndex: 'title', ellipsis: true },
    { title: 'Dominio', dataIndex: 'themeName', width: 140 },
    {
      title: 'Aplicable',
      dataIndex: 'applicable',
      width: 100,
      align: 'center',
      render: (val: boolean, record) => (
        <Switch checked={val} onChange={() => toggleApplicable(record)} />
      ),
    },
    {
      title: 'Estado impl.',
      dataIndex: 'implementationStatus',
      width: 130,
      render: (s: string) => {
        const color = s === 'implemented' ? 'success' : s === 'in_progress' ? 'processing' : 'default';
        const label = s === 'implemented' ? 'Implementado' : s === 'in_progress' ? 'En progreso' : 'Pendiente';
        return <Tag color={color}>{label}</Tag>;
      },
    },
    {
      title: 'Justificación',
      dataIndex: 'justification',
      width: 260,
      render: (val: string | null, record) => (
        <Input.TextArea
          autoSize={{ minRows: 1, maxRows: 3 }}
          defaultValue={val ?? ''}
          placeholder={!record.applicable ? 'Justifique la exclusión' : ''}
          onBlur={e => {
            if (e.target.value !== (val ?? '')) {
              updateJustification(record, e.target.value);
            }
          }}
        />
      ),
    },
  ];

  if (!selectedCompany) return <NoCompanySelected feature="la Declaración de Aplicabilidad" />;

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
    </>
  );
}
