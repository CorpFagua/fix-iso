import { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router';
import {
  Card, Descriptions, Tag, Typography, Spin, Table, Button, Modal, Form, Input, Select, Slider, Space, message,
} from 'antd';
import { ArrowLeftOutlined, PlusOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { assetsApi } from '../../api/assets.api';
import type {
  Asset, AssetRiskAssessment, AssetType, AssetClassification, RiskLevel, RiskTreatment, CreateRiskPayload,
} from '../../types';
import { useCompany } from '../../hooks/useCompany';
import NoCompanySelected from '../../components/NoCompanySelected';

const { Title } = Typography;

const typeLabels: Record<AssetType, string> = {
  information: 'Información', software: 'Software', hardware: 'Hardware',
  service: 'Servicio', people: 'Personas', intangible: 'Intangible',
};
const classLabels: Record<AssetClassification, string> = {
  public: 'Público', internal: 'Interno', confidential: 'Confidencial', restricted: 'Restringido',
};
const classColors: Record<AssetClassification, string> = {
  public: 'green', internal: 'blue', confidential: 'orange', restricted: 'red',
};
const riskColors: Record<RiskLevel, string> = {
  low: 'green', medium: 'gold', high: 'orange', critical: 'red',
};
const riskLabels: Record<RiskLevel, string> = {
  low: 'Bajo', medium: 'Medio', high: 'Alto', critical: 'Crítico',
};
const treatmentLabels: Record<RiskTreatment, string> = {
  mitigate: 'Mitigar', accept: 'Aceptar', transfer: 'Transferir', avoid: 'Evitar',
};

export default function AssetDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { selectedCompany } = useCompany();
  const [asset, setAsset] = useState<Asset | null>(null);
  const [risks, setRisks] = useState<AssetRiskAssessment[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [form] = Form.useForm();

  const loadRef = useRef<(() => void) | undefined>(undefined);

  useEffect(() => {
    if (!selectedCompany) return;
    let ignore = false;
    const load = async () => {
      setLoading(true);
      const { data } = await assetsApi.getById(selectedCompany.id, Number(id));
      if (!ignore) {
        setAsset(data.data);
        setRisks(data.data.risks);
        setLoading(false);
      }
    };
    load();
    loadRef.current = load;
    return () => { ignore = true; };
  }, [id, selectedCompany]);

  const handleAddRisk = async () => {
    const values = await form.validateFields();
    const payload: CreateRiskPayload = values;
    await assetsApi.addRisk(selectedCompany!.id, Number(id), payload);
    message.success('Riesgo registrado');
    setModalOpen(false);
    form.resetFields();
    loadRef.current?.();
  };

  if (!selectedCompany) return <NoCompanySelected feature="detalle de activos" />;
  if (loading || !asset) return <Spin size="large" style={{ display: 'block', margin: '80px auto' }} />;

  const riskColumns: ColumnsType<AssetRiskAssessment> = [
    { title: 'Amenaza', dataIndex: 'threat' },
    { title: 'Vulnerabilidad', dataIndex: 'vulnerability' },
    { title: 'Prob.', dataIndex: 'likelihood', width: 60, align: 'center' },
    { title: 'Impacto', dataIndex: 'impact', width: 60, align: 'center' },
    { title: 'Score', dataIndex: 'riskScore', width: 60, align: 'center' },
    {
      title: 'Nivel',
      dataIndex: 'riskLevel',
      width: 100,
      render: (l: RiskLevel) => <Tag color={riskColors[l]}>{riskLabels[l]}</Tag>,
    },
    {
      title: 'Tratamiento',
      dataIndex: 'treatment',
      width: 110,
      render: (t: RiskTreatment) => treatmentLabels[t],
    },
    { title: 'Evaluado por', dataIndex: 'assessedByName', width: 150 },
  ];

  return (
    <>
      <Space style={{ marginBottom: 16 }}>
        <Button icon={<ArrowLeftOutlined />} onClick={() => navigate('/assets')}>Volver</Button>
      </Space>
      <Title level={3}>{asset.name}</Title>

      <Card style={{ marginBottom: 24 }}>
        <Descriptions column={{ xs: 1, sm: 2, md: 3 }} bordered size="small">
          <Descriptions.Item label="Tipo">{typeLabels[asset.assetType]}</Descriptions.Item>
          <Descriptions.Item label="Clasificación">
            <Tag color={classColors[asset.classification]}>{classLabels[asset.classification]}</Tag>
          </Descriptions.Item>
          <Descriptions.Item label="Estado">
            <Tag color={asset.status === 'active' ? 'success' : 'default'}>{asset.status === 'active' ? 'Activo' : asset.status}</Tag>
          </Descriptions.Item>
          <Descriptions.Item label="Propietario">{asset.ownerName}</Descriptions.Item>
          <Descriptions.Item label="Custodio">{asset.custodianName ?? '—'}</Descriptions.Item>
          <Descriptions.Item label="Ubicación">{asset.location ?? '—'}</Descriptions.Item>
          <Descriptions.Item label="Descripción" span={3}>{asset.description ?? '—'}</Descriptions.Item>
        </Descriptions>
      </Card>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <Title level={4} style={{ margin: 0 }}>Evaluación de riesgos</Title>
        <Button type="primary" icon={<PlusOutlined />} onClick={() => setModalOpen(true)}>Agregar riesgo</Button>
      </div>
      <Card>
        <Table rowKey="id" columns={riskColumns} dataSource={risks} pagination={false} size="small" />
      </Card>

      <Modal
        title="Nuevo riesgo"
        open={modalOpen}
        onOk={handleAddRisk}
        onCancel={() => { setModalOpen(false); form.resetFields(); }}
        okText="Registrar"
        cancelText="Cancelar"
      >
        <Form form={form} layout="vertical">
          <Form.Item name="threat" label="Amenaza" rules={[{ required: true, message: 'Campo requerido' }]}>
            <Input />
          </Form.Item>
          <Form.Item name="vulnerability" label="Vulnerabilidad" rules={[{ required: true, message: 'Campo requerido' }]}>
            <Input />
          </Form.Item>
          <Form.Item name="likelihood" label="Probabilidad (1-5)" initialValue={3}>
            <Slider min={1} max={5} marks={{ 1: '1', 2: '2', 3: '3', 4: '4', 5: '5' }} />
          </Form.Item>
          <Form.Item name="impact" label="Impacto (1-5)" initialValue={3}>
            <Slider min={1} max={5} marks={{ 1: '1', 2: '2', 3: '3', 4: '4', 5: '5' }} />
          </Form.Item>
          <Form.Item name="treatment" label="Tratamiento" rules={[{ required: true, message: 'Campo requerido' }]}>
            <Select options={Object.entries(treatmentLabels).map(([k, v]) => ({ label: v, value: k }))} />
          </Form.Item>
          <Form.Item name="treatmentPlan" label="Plan de tratamiento">
            <Input.TextArea rows={3} />
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
}
