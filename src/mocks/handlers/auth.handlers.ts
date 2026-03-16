import { http, HttpResponse } from 'msw';
import { mockUsers, getAuthUser } from '../data/users.mock';

const VALID_CREDENTIALS = { email: 'admin@fixiso.com', password: 'Admin123!' };

export const authHandlers = [
  http.post('/api/auth/login', async ({ request }) => {
    const body = (await request.json()) as { email: string; password: string };

    const user = mockUsers.find(u => u.email === body.email);
    if (!user || body.password !== VALID_CREDENTIALS.password) {
      return HttpResponse.json({ error: 'Credenciales inválidas' }, { status: 401 });
    }
    if (!user.isActive) {
      return HttpResponse.json({ error: 'Cuenta desactivada' }, { status: 401 });
    }

    const authUser = getAuthUser(user.id);
    return HttpResponse.json({
      accessToken: `mock-access-token-${user.id}`,
      refreshToken: `mock-refresh-token-${user.id}`,
      user: authUser,
    });
  }),

  http.post('/api/auth/refresh', async ({ request }) => {
    const body = (await request.json()) as { refreshToken: string };
    const match = body.refreshToken.match(/mock-refresh-token-(\d+)/);
    if (!match) {
      return HttpResponse.json({ error: 'Token inválido' }, { status: 401 });
    }
    const userId = parseInt(match[1], 10);
    return HttpResponse.json({
      accessToken: `mock-access-token-${userId}`,
      refreshToken: `mock-refresh-token-${userId}`,
    });
  }),

  http.post('/api/auth/logout', () => {
    return HttpResponse.json({ message: 'Sesión cerrada' });
  }),

  http.get('/api/auth/me', ({ request }) => {
    const auth = request.headers.get('Authorization');
    if (!auth) return HttpResponse.json({ error: 'No autorizado' }, { status: 401 });

    const match = auth.match(/mock-access-token-(\d+)/);
    const userId = match ? parseInt(match[1], 10) : 1;
    const authUser = getAuthUser(userId);
    if (!authUser) return HttpResponse.json({ error: 'Usuario no encontrado' }, { status: 404 });

    return HttpResponse.json({ data: authUser });
  }),
];
