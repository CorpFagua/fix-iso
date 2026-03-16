import { useState } from 'react';
import { useNavigate } from 'react-router';
import { Card, Form, Input, Button, Typography, Alert, theme } from 'antd';
import { LockOutlined, MailOutlined } from '@ant-design/icons';
import { useAuth } from '../../hooks/useAuth';

const { Title, Text } = Typography;

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { token } = theme.useToken();

  const onFinish = async (values: { email: string; password: string }) => {
    setLoading(true);
    setError(null);
    try {
      await login(values.email, values.password);
      navigate('/dashboard', { replace: true });
    } catch {
      setError('Credenciales inválidas. Intente nuevamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ width: '100%', maxWidth: 400 }}>
      <div style={{ textAlign: 'center', marginBottom: 32 }}>
        <Title level={2} style={{ color: token.colorPrimary, marginBottom: 4 }}>
          Fix-ISO
        </Title>
        <Text type="secondary">Plataforma de gestión ISO 27001</Text>
      </div>
      <Card>
        <Title level={4} style={{ textAlign: 'center', marginBottom: 24 }}>
          Iniciar sesión
        </Title>
        {error && (
          <Alert title={error} type="error" showIcon closable style={{ marginBottom: 16 }} />
        )}
        <Form layout="vertical" onFinish={onFinish} autoComplete="off">
          <Form.Item
            name="email"
            label="Correo electrónico"
            rules={[
              { required: true, message: 'Ingrese su correo' },
              { type: 'email', message: 'Correo no válido' },
            ]}
          >
            <Input prefix={<MailOutlined />} placeholder="admin@fixiso.com" size="large" />
          </Form.Item>
          <Form.Item
            name="password"
            label="Contraseña"
            rules={[{ required: true, message: 'Ingrese su contraseña' }]}
          >
            <Input.Password prefix={<LockOutlined />} placeholder="Contraseña" size="large" />
          </Form.Item>
          <Form.Item style={{ marginBottom: 0 }}>
            <Button type="primary" htmlType="submit" loading={loading} block size="large">
              Ingresar
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
}
