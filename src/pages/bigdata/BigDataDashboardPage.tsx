import { useEffect, useState } from 'react';
import { Tabs, Spin, Alert, Button, Typography, Space, Tag, Tooltip } from 'antd';
import {
  GlobalOutlined,
  ApartmentOutlined,
  DashboardOutlined,
  ReloadOutlined,
  BankOutlined,
} from '@ant-design/icons';
import { useCompany } from '../../hooks/useCompany';
import { bigdataApi } from '../../api/bigdata.api';
import type {
  ThreatMapResponse,
  MitreIsoCorrelationResponse,
  CompanyRiskScoreResponse,
} from '../../types/bigdata.types';
import ThreatMapSection from './ThreatMapSection';
import MitreCorrelationSection from './MitreCorrelationSection';
import RiskScoreSection from './RiskScoreSection';

const { Title, Text } = Typography;

export default function BigDataDashboardPage() {
  const { selectedCompany } = useCompany();
  const companyId = selectedCompany?.id;

  const [threatMap, setThreatMap] = useState<ThreatMapResponse | null>(null);
  const [correlation, setCorrelation] = useState<MitreIsoCorrelationResponse | null>(null);
  const [riskScore, setRiskScore] = useState<CompanyRiskScoreResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pipelineRunning, setPipelineRunning] = useState(false);
  const [activeTab, setActiveTab] = useState('threat-map');

  const fetchAll = (cid?: number) => {
    setLoading(true);
    setError(null);

    Promise.all([
      bigdataApi.threatMap(),
      bigdataApi.mitreIsoCorrelation(cid),
      bigdataApi.companyRiskScore(cid),
    ])
      .then(([mapRes, corrRes, scoreRes]) => {
        setThreatMap(mapRes.data.data);
        setCorrelation(corrRes.data.data);
        setRiskScore(scoreRes.data.data);
      })
      .catch((err) => {
        const msg = err?.response?.data?.error || err?.message || 'Error al cargar datos de BigData';
        setError(msg);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    let ignore = false;
    setLoading(true);
    setError(null);

    Promise.all([
      bigdataApi.threatMap(),
      bigdataApi.mitreIsoCorrelation(companyId),
      bigdataApi.companyRiskScore(companyId),
    ])
      .then(([mapRes, corrRes, scoreRes]) => {
        if (ignore) return;
        setThreatMap(mapRes.data.data);
        setCorrelation(corrRes.data.data);
        setRiskScore(scoreRes.data.data);
      })
      .catch((err) => {
        if (ignore) return;
        const msg = err?.response?.data?.error || err?.message || 'Error al cargar datos de BigData';
        setError(msg);
      })
      .finally(() => { if (!ignore) setLoading(false); });

    return () => { ignore = true; };
  }, [companyId]);

  const handleRunPipeline = () => {
    setPipelineRunning(true);
    bigdataApi.runPipeline()
      .then(() => {
        // Poll until data refreshes (~30s for Spark to complete)
        setTimeout(() => {
          fetchAll(companyId);
          setPipelineRunning(false);
        }, 35_000);
      })
      .catch(() => setPipelineRunning(false));
  };

  const tabs = [
    {
      key: 'threat-map',
      label: (
        <Space>
          <GlobalOutlined />
          Mapa de Amenazas
        </Space>
      ),
      children: threatMap ? <ThreatMapSection data={threatMap} /> : null,
    },
    {
      key: 'mitre-correlation',
      label: (
        <Space>
          <ApartmentOutlined />
          Correlación MITRE-ISO
        </Space>
      ),
      children: !companyId ? (
        <Alert
          type="info"
          showIcon
          icon={<BankOutlined />}
          message="Selecciona una empresa"
          description="La correlación MITRE-ISO compara las amenazas globales con los controles implementados por empresa. Selecciona una empresa en el selector superior para ver su análisis."
          style={{ marginTop: 24 }}
        />
      ) : correlation ? (
        <MitreCorrelationSection data={correlation} />
      ) : null,
    },
    {
      key: 'risk-score',
      label: (
        <Space>
          <DashboardOutlined />
          Score de Riesgo
          {riskScore && riskScore.overall_score != null && (
            <Tag
              color={
                riskScore.risk_level === 'critical'
                  ? 'red'
                  : riskScore.risk_level === 'high'
                  ? 'orange'
                  : riskScore.risk_level === 'medium'
                  ? 'gold'
                  : 'green'
              }
            >
              {riskScore.overall_score.toFixed(0)}
            </Tag>
          )}
        </Space>
      ),
      children: !companyId ? (
        <Alert
          type="info"
          showIcon
          icon={<BankOutlined />}
          message="Selecciona una empresa"
          description="El score de riesgo calcula la exposición de cada empresa cruzando sus brechas de control ISO con la frecuencia y severidad de ataques reales. Selecciona una empresa para verlo."
          style={{ marginTop: 24 }}
        />
      ) : riskScore ? (
        <RiskScoreSection data={riskScore} />
      ) : null,
    },
  ];

  return (
    <div style={{ padding: '24px' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 }}>
        <div>
          <Title level={3} style={{ margin: 0 }}>
            Inteligencia de Amenazas
          </Title>
          <Text type="secondary">
            Análisis PySpark de amenazas globales correlacionadas con ISO 27001
            {riskScore && (
              <> — <Text strong>{riskScore.company_name}</Text></>
            )}
          </Text>
          {companyId && (
            <div style={{ marginTop: 4 }}>
              <Tag icon={<BankOutlined />} color="blue">
                {riskScore?.company_name ?? `Empresa #${companyId}`}
              </Tag>
              <Tag color="default">
                {riskScore?.sector ?? 'Sector desconocido'}
              </Tag>
            </div>
          )}
          {!companyId && (
            <div style={{ marginTop: 4 }}>
              <Tag icon={<BankOutlined />} color="default">
                Mapa de amenazas global — selecciona una empresa para análisis de brecha
              </Tag>
            </div>
          )}
        </div>
        <Tooltip title={pipelineRunning ? 'Procesando (~35s)...' : 'Re-ejecutar análisis Spark'}>
          <Button
            icon={<ReloadOutlined spin={pipelineRunning} />}
            onClick={handleRunPipeline}
            loading={pipelineRunning}
            disabled={pipelineRunning}
          >
            {pipelineRunning ? 'Procesando...' : 'Actualizar análisis'}
          </Button>
        </Tooltip>
      </div>

      {/* Error state */}
      {error && !loading && (
        <Alert
          type="warning"
          showIcon
          message="Datos de BigData no disponibles"
          description={
            <Space direction="vertical">
              <Text>{error}</Text>
              <Text type="secondary">
                Para generar los datos ejecuta en terminal:
                <br />
                <code>cd bigDataFixiso && python main.py --mode synthetic</code>
                <br />
                <code>python main.py --mode analytics</code>
                <br />
                <code>uvicorn api.main:app --port 8000</code>
              </Text>
            </Space>
          }
          style={{ marginBottom: 24 }}
        />
      )}

      {/* Loading */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '80px 0' }}>
          <Spin size="large" tip="Cargando análisis de amenazas..." />
        </div>
      ) : (
        !error && (
          <Tabs
            activeKey={activeTab}
            onChange={setActiveTab}
            items={tabs}
            size="large"
          />
        )
      )}
    </div>
  );
}
