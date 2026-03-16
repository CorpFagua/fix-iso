import { ConfigProvider } from 'antd';
import { RouterProvider } from 'react-router';
import esES from 'antd/locale/es_ES';
import { AuthProvider } from './context/AuthProvider';
import antdTheme from './theme/antdTheme';
import router from './router';

export default function App() {
  return (
    <ConfigProvider theme={antdTheme} locale={esES}>
      <AuthProvider>
        <RouterProvider router={router} />
      </AuthProvider>
    </ConfigProvider>
  );
}
