import type { ThemeConfig } from 'antd';

const theme: ThemeConfig = {
  token: {
    colorPrimary: '#1B4F72',
    colorSuccess: '#27AE60',
    colorWarning: '#F39C12',
    colorError: '#E74C3C',
    colorInfo: '#2980B9',
    borderRadius: 6,
    fontFamily: "'Outfit', 'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
    fontSize: 14,
    colorBgContainer: '#FFFFFF',
    colorBgLayout: '#F4F6F9',
    controlHeight: 36,
  },
  components: {
    Layout: {
      siderBg: '#0B2239',
      headerBg: '#FFFFFF',
      bodyBg: '#F4F6F9',
    },
    Menu: {
      darkItemBg: '#0B2239',
      darkItemColor: '#AEB6BF',
      darkItemHoverColor: '#FFFFFF',
      darkItemSelectedBg: '#1B4F72',
      darkItemSelectedColor: '#FFFFFF',
      darkSubMenuItemBg: '#071A2C',
      itemHeight: 44,
      iconSize: 18,
    },
    Button: {
      primaryShadow: 'none',
    },
    Card: {
      headerBg: 'transparent',
    },
    Table: {
      headerBg: '#F8F9FB',
      headerColor: '#5D6D7E',
    },
  },
};

export default theme;
