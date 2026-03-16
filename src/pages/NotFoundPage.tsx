import { useNavigate } from 'react-router';
import { Result, Button } from 'antd';

export default function NotFoundPage() {
  const navigate = useNavigate();

  return (
    <Result
      status="404"
      title="404"
      subTitle="La página que buscas no existe."
      extra={
        <Button type="primary" onClick={() => navigate('/dashboard')}>
          Volver al inicio
        </Button>
      }
    />
  );
}
