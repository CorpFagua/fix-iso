import { Result, Button } from 'antd';
import { BankOutlined } from '@ant-design/icons';
import { useCompany } from '../hooks/useCompany';

interface Props {
  feature: string;
}

export default function NoCompanySelected({ feature }: Props) {
  const { companies, selectCompany } = useCompany();

  return (
    <Result
      icon={<BankOutlined style={{ color: '#1B4F72' }} />}
      title="Seleccione una empresa"
      subTitle={`Para acceder a ${feature}, seleccione una empresa en el menú superior.`}
      extra={
        companies.length > 0 ? (
          <Button type="primary" onClick={() => selectCompany(companies[0].id)}>
            Seleccionar {companies[0].name}
          </Button>
        ) : undefined
      }
    />
  );
}
