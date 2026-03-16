import { useState, useEffect, useCallback, type ReactNode } from 'react';
import { companiesApi } from '../api/companies.api';
import type { Company } from '../types';
import { CompanyContext } from './CompanyContext';

const STORAGE_KEY = 'fix-iso-selected-company';

export default function CompanyProvider({ children }: { children: ReactNode }) {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let ignore = false;
    companiesApi.list().then((res) => {
      if (ignore) return;
      const list: Company[] = res.data.data;
      setCompanies(list);

      const savedId = sessionStorage.getItem(STORAGE_KEY);
      if (savedId) {
        const found = list.find(c => c.id === Number(savedId));
        if (found) setSelectedCompany(found);
      } else if (list.length === 1) {
        setSelectedCompany(list[0]);
        sessionStorage.setItem(STORAGE_KEY, String(list[0].id));
      }
      setLoading(false);
    });
    return () => { ignore = true; };
  }, []);

  const selectCompany = useCallback((id: number) => {
    const found = companies.find(c => c.id === id);
    if (found) {
      setSelectedCompany(found);
      sessionStorage.setItem(STORAGE_KEY, String(id));
    }
  }, [companies]);

  const clearCompany = useCallback(() => {
    setSelectedCompany(null);
    sessionStorage.removeItem(STORAGE_KEY);
  }, []);

  return (
    <CompanyContext value={{ companies, selectedCompany, selectCompany, clearCompany, loading }}>
      {children}
    </CompanyContext>
  );
}
