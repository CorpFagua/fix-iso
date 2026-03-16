import { createContext } from 'react';
import type { Company } from '../types';

export interface CompanyContextValue {
  companies: Company[];
  selectedCompany: Company | null;
  selectCompany: (id: number) => void;
  clearCompany: () => void;
  loading: boolean;
}

export const CompanyContext = createContext<CompanyContextValue | null>(null);
