import { Select, Space, Typography } from 'antd';
import { BankOutlined, GlobalOutlined } from '@ant-design/icons';
import { useCompany } from '../hooks/useCompany';

const { Text } = Typography;

export default function CompanySelector() {
  const { companies, selectedCompany, selectCompany, clearCompany, loading } = useCompany();

  return (
    <Space size={8} align="center">
      <BankOutlined style={{ fontSize: 16, color: '#8c8c8c' }} />
      <Select
        placeholder="Seleccionar empresa"
        loading={loading}
        value={selectedCompany?.id ?? undefined}
        onChange={(value) => {
          if (value === -1) {
            clearCompany();
          } else {
            selectCompany(value);
          }
        }}
        style={{ minWidth: 220 }}
        options={[
          {
            value: -1,
            label: (
              <Space size={6}>
                <GlobalOutlined />
                <Text>Vista global</Text>
              </Space>
            ),
          },
          ...companies.map((c) => ({
            value: c.id,
            label: c.name,
          })),
        ]}
      />
    </Space>
  );
}
