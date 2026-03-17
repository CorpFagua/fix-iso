import { useContext } from 'react';
import { CompanyContext } from '../context/CompanyContext';

export function useCompany() {
  const ctx = useContext(CompanyContext);
  if (!ctx) throw new Error('useCompany must be used within CompanyProvider');
  return ctx;
}
