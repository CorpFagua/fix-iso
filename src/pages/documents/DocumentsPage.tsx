import { useEffect, useState, useCallback } from 'react';
import {
  Table, Card, Typography, Button, Space, Tag, Select, Input, Modal, Form, Upload, Tabs, Empty, message,
} from 'antd';
import {
  UploadOutlined, FileTextOutlined, EyeOutlined, DeleteOutlined,
  LinkOutlined, SearchOutlined, CloudUploadOutlined,
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { documentsApi } from '../../api/documents.api';
import { useCompany } from '../../hooks/useCompany';
import type { Document, DocumentType } from '../../types';
import { DOCUMENT_TYPE_LABELS } from '../../types';

const { Title } = Typography;

const DOC_TYPE_OPTIONS = Object.entries(DOCUMENT_TYPE_LABELS)
  .filter(([key]) => key !== 'PLANTILLA')
  .map(([value, label]) => ({ value, label }));

const DOC_TYPE_COLORS: Record<string, string> = {
  ACTA: 'blue',
  REPORTE_AUDITORIA: 'purple',
  EVIDENCIA: 'green',
  POLITICA: 'orange',
  PLAN_TRATAMIENTO: 'gold',
  INFORME_CAPACITACION: 'cyan',
  PLANTILLA: 'default',
};

export default function DocumentsPage() {
  const { selectedCompany } = useCompany();
  const [documents, setDocuments] = useState<Document[]>([]);
  const [templates, setTemplates] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [filterType, setFilterType] = useState<DocumentType | undefined>();
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [form] = Form.useForm();

  const loadDocuments = useCallback(async () => {
    setLoading(true);
    try {
      const res = await documentsApi.list({
        companyId: selectedCompany?.id,
        type: filterType,
        page,
        limit: 15,
      });
      setDocuments(res.data.data);
      setTotal(res.data.meta.total);
    } catch {
      message.error('Error al cargar documentos');
    }
    setLoading(false);
  }, [selectedCompany, filterType, page]);

  const loadTemplates = useCallback(async () => {
    try {
      const res = await documentsApi.templates();
      setTemplates(res.data.data);
    } catch { /* templates are optional */ }
  }, []);

  useEffect(() => { loadDocuments(); }, [loadDocuments]);
  useEffect(() => { loadTemplates(); }, [loadTemplates]);

  const handleDelete = async (id: number) => {
    Modal.confirm({
      title: '¿Eliminar documento?',
      content: 'Esta acción no se puede deshacer.',
      okText: 'Eliminar',
      okType: 'danger',
      cancelText: 'Cancelar',
      async onOk() {
        await documentsApi.remove(id);
        message.success('Documento eliminado');
        loadDocuments();
      },
    });
  };

  const handleUpload = async (values: any) => {
    if (!values.file?.[0]) {
      message.warning('Selecciona un archivo');
      return;
    }
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append('file', values.file[0].originFileObj);
      fd.append('companyId', String(selectedCompany?.id ?? ''));
      fd.append('name', values.name);
      fd.append('documentType', values.documentType);
      if (values.description) fd.append('description', values.description);

      await documentsApi.upload(fd);
      message.success('Documento subido correctamente');
      setModalOpen(false);
      form.resetFields();
      loadDocuments();
    } catch {
      message.error('Error al subir documento');
    }
    setUploading(false);
  };

  const handleCreateLink = async (values: any) => {
    setUploading(true);
    try {
      await documentsApi.create({
        companyId: selectedCompany?.id,
        name: values.name,
        description: values.description,
        documentType: values.documentType,
        driveUrl: values.driveUrl,
        relatedEntityType: values.relatedEntityType,
      });
      message.success('Documento registrado');
      setModalOpen(false);
      form.resetFields();
      loadDocuments();
    } catch {
      message.error('Error al registrar documento');
    }
    setUploading(false);
  };

  const filteredDocs = search
    ? documents.filter(d => d.name.toLowerCase().includes(search.toLowerCase()))
    : documents;

  const columns: ColumnsType<Document> = [
    {
      title: 'Nombre',
      dataIndex: 'name',
      key: 'name',
      render: (name: string, record) => (
        <Space>
          <FileTextOutlined />
          <span>{name}</span>
          {record.driveUrl && (
            <a href={record.driveUrl} target="_blank" rel="noopener noreferrer">
              <LinkOutlined />
            </a>
          )}
        </Space>
      ),
    },
    {
      title: 'Tipo',
      dataIndex: 'documentType',
      key: 'documentType',
      width: 180,
      render: (type: DocumentType) => (
        <Tag color={DOC_TYPE_COLORS[type] ?? 'default'}>{DOCUMENT_TYPE_LABELS[type]}</Tag>
      ),
    },
    ...(!selectedCompany ? [{
      title: 'Empresa',
      key: 'company',
      width: 180,
      render: (_: unknown, record: Document) => record.company?.name ?? '—',
    }] : []),
    {
      title: 'Creado por',
      key: 'createdBy',
      width: 150,
      render: (_: unknown, record: Document) => record.createdBy.name,
    },
    {
      title: 'Fecha',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 140,
      render: (d: string) => new Date(d).toLocaleDateString('es-CO', { day: '2-digit', month: 'short', year: 'numeric' }),
    },
    {
      title: 'Acciones',
      key: 'actions',
      width: 120,
      render: (_: unknown, record: Document) => (
        <Space>
          {record.driveUrl && (
            <Button type="link" size="small" icon={<EyeOutlined />} href={record.driveUrl} target="_blank" rel="noopener noreferrer" />
          )}
          <Button type="link" size="small" danger icon={<DeleteOutlined />} onClick={() => handleDelete(record.id)} />
        </Space>
      ),
    },
  ];

  const templateColumns: ColumnsType<Document> = [
    {
      title: 'Nombre',
      dataIndex: 'name',
      key: 'name',
      render: (name: string) => <Space><FileTextOutlined />{name}</Space>,
    },
    {
      title: 'Descripción',
      dataIndex: 'description',
      key: 'description',
    },
    {
      title: 'Acciones',
      key: 'actions',
      width: 120,
      render: (_: unknown, record: Document) => (
        record.driveUrl ? (
          <Button type="link" icon={<EyeOutlined />} href={record.driveUrl} target="_blank" rel="noopener noreferrer">
            Ver plantilla
          </Button>
        ) : '—'
      ),
    },
  ];

  return (
    <>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <Title level={3} style={{ margin: 0 }}>
          Documentos{selectedCompany ? ` — ${selectedCompany.name}` : ''}
        </Title>
        <Button type="primary" icon={<CloudUploadOutlined />} onClick={() => setModalOpen(true)}>
          Nuevo documento
        </Button>
      </div>

      <Tabs
        defaultActiveKey="documents"
        items={[
          {
            key: 'documents',
            label: 'Documentos',
            children: (
              <Card>
                <Space style={{ marginBottom: 16, width: '100%', justifyContent: 'space-between' }} wrap>
                  <Space>
                    <Select
                      placeholder="Filtrar por tipo"
                      allowClear
                      style={{ width: 220 }}
                      options={DOC_TYPE_OPTIONS}
                      value={filterType}
                      onChange={v => { setFilterType(v); setPage(1); }}
                    />
                    <Input
                      placeholder="Buscar por nombre"
                      prefix={<SearchOutlined />}
                      value={search}
                      onChange={e => setSearch(e.target.value)}
                      style={{ width: 220 }}
                      allowClear
                    />
                  </Space>
                </Space>
                <Table
                  rowKey="id"
                  columns={columns}
                  dataSource={filteredDocs}
                  loading={loading}
                  size="small"
                  pagination={{
                    current: page,
                    total,
                    pageSize: 15,
                    onChange: setPage,
                    showTotal: t => `${t} documentos`,
                  }}
                />
              </Card>
            ),
          },
          {
            key: 'templates',
            label: 'Plantillas',
            children: (
              <Card>
                {templates.length === 0 ? (
                  <Empty description="No hay plantillas registradas" />
                ) : (
                  <Table
                    rowKey="id"
                    columns={templateColumns}
                    dataSource={templates}
                    pagination={false}
                    size="small"
                  />
                )}
              </Card>
            ),
          },
        ]}
      />

      {/* Modal for upload/link */}
      <Modal
        title="Nuevo documento"
        open={modalOpen}
        onCancel={() => { setModalOpen(false); form.resetFields(); }}
        footer={null}
        width={520}
      >
        <Tabs
          items={[
            {
              key: 'upload',
              label: 'Subir archivo',
              children: (
                <Form form={form} layout="vertical" onFinish={handleUpload}>
                  <Form.Item name="name" label="Nombre" rules={[{ required: true, message: 'Requerido' }]}>
                    <Input placeholder="Nombre del documento" />
                  </Form.Item>
                  <Form.Item name="documentType" label="Tipo" rules={[{ required: true, message: 'Requerido' }]}>
                    <Select options={DOC_TYPE_OPTIONS} placeholder="Seleccionar tipo" />
                  </Form.Item>
                  <Form.Item name="description" label="Descripción">
                    <Input.TextArea rows={2} placeholder="Descripción breve (opcional)" />
                  </Form.Item>
                  <Form.Item name="file" label="Archivo" valuePropName="fileList" getValueFromEvent={e => Array.isArray(e) ? e : e?.fileList} rules={[{ required: true, message: 'Selecciona un archivo' }]}>
                    <Upload beforeUpload={() => false} maxCount={1}>
                      <Button icon={<UploadOutlined />}>Seleccionar archivo</Button>
                    </Upload>
                  </Form.Item>
                  <Form.Item>
                    <Button type="primary" htmlType="submit" loading={uploading} block>
                      Subir documento
                    </Button>
                  </Form.Item>
                </Form>
              ),
            },
            {
              key: 'link',
              label: 'Registrar enlace',
              children: (
                <Form layout="vertical" onFinish={handleCreateLink}>
                  <Form.Item name="name" label="Nombre" rules={[{ required: true, message: 'Requerido' }]}>
                    <Input placeholder="Nombre del documento" />
                  </Form.Item>
                  <Form.Item name="documentType" label="Tipo" rules={[{ required: true, message: 'Requerido' }]}>
                    <Select options={DOC_TYPE_OPTIONS} placeholder="Seleccionar tipo" />
                  </Form.Item>
                  <Form.Item name="driveUrl" label="URL del documento" rules={[{ required: true, type: 'url', message: 'Ingresa una URL válida' }]}>
                    <Input placeholder="https://drive.google.com/..." />
                  </Form.Item>
                  <Form.Item name="description" label="Descripción">
                    <Input.TextArea rows={2} placeholder="Descripción breve (opcional)" />
                  </Form.Item>
                  <Form.Item name="relatedEntityType" label="Relacionar con">
                    <Select allowClear placeholder="Opcional" options={[
                      { value: 'control', label: 'Control' },
                      { value: 'audit', label: 'Auditoría' },
                      { value: 'asset', label: 'Activo' },
                      { value: 'training', label: 'Capacitación' },
                    ]} />
                  </Form.Item>
                  <Form.Item>
                    <Button type="primary" htmlType="submit" loading={uploading} block>
                      Registrar enlace
                    </Button>
                  </Form.Item>
                </Form>
              ),
            },
          ]}
        />
      </Modal>
    </>
  );
}
