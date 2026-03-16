import { useState, useCallback, useEffect, type ReactNode } from 'react';
import { authApi } from '../api/auth.api';
import { setAccessToken } from '../api/client';
import type { AuthUser } from '../types';
import { AuthContext } from './AuthContext';

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const login = useCallback(async (email: string, password: string) => {
    const { data } = await authApi.login({ email, password });
    setAccessToken(data.accessToken);
    sessionStorage.setItem('refreshToken', data.refreshToken);
    setUser(data.user);
  }, []);

  const logout = useCallback(async () => {
    const refreshToken = sessionStorage.getItem('refreshToken');
    try {
      if (refreshToken) await authApi.logout(refreshToken);
    } catch { /* ignore */ }
    setAccessToken(null);
    sessionStorage.removeItem('refreshToken');
    setUser(null);
  }, []);

  useEffect(() => {
    let ignore = false;
    const refreshToken = sessionStorage.getItem('refreshToken');
    if (!refreshToken) {
      setIsLoading(false);
      return;
    }
    authApi
      .refresh(refreshToken)
      .then(({ data }) => {
        setAccessToken(data.accessToken);
        sessionStorage.setItem('refreshToken', data.refreshToken);
        return authApi.me();
      })
      .then(({ data }) => {
        if (!ignore) setUser(data.data);
      })
      .catch(() => {
        setAccessToken(null);
        sessionStorage.removeItem('refreshToken');
      })
      .finally(() => {
        if (!ignore) setIsLoading(false);
      });
    return () => { ignore = true; };
  }, []);

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
