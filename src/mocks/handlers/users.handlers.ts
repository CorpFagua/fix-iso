import { http, HttpResponse } from 'msw';
import { mockUsers } from '../data/users.mock';

export const usersHandlers = [
  http.get('/api/users', ({ request }) => {
    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get('page') ?? '1', 10);
    const limit = parseInt(url.searchParams.get('limit') ?? '10', 10);
    const search = (url.searchParams.get('search') ?? '').toLowerCase();

    let filtered = mockUsers;
    if (search) {
      filtered = filtered.filter(
        u => u.name.toLowerCase().includes(search) || u.email.toLowerCase().includes(search),
      );
    }

    const total = filtered.length;
    const start = (page - 1) * limit;
    const data = filtered.slice(start, start + limit);

    return HttpResponse.json({
      data,
      meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
    });
  }),

  http.get('/api/users/:id', ({ params }) => {
    const user = mockUsers.find(u => u.id === Number(params.id));
    if (!user) return HttpResponse.json({ error: 'Usuario no encontrado' }, { status: 404 });
    return HttpResponse.json({ data: user });
  }),

  http.post('/api/users', async ({ request }) => {
    const body = (await request.json()) as Record<string, unknown>;
    const newUser = {
      id: mockUsers.length + 1,
      name: body.name as string,
      email: body.email as string,
      phone: (body.phone as string) ?? null,
      avatarUrl: null,
      isActive: true,
      lastLoginAt: null,
      createdAt: new Date().toISOString(),
      roles: [{ id: 5, name: 'employee' }],
    };
    mockUsers.push(newUser);
    return HttpResponse.json({ data: newUser }, { status: 201 });
  }),

  http.put('/api/users/:id', async ({ params, request }) => {
    const user = mockUsers.find(u => u.id === Number(params.id));
    if (!user) return HttpResponse.json({ error: 'No encontrado' }, { status: 404 });
    const body = (await request.json()) as Record<string, unknown>;
    Object.assign(user, {
      name: (body.name as string) ?? user.name,
      email: (body.email as string) ?? user.email,
      phone: body.phone !== undefined ? body.phone : user.phone,
      isActive: body.isActive !== undefined ? body.isActive : user.isActive,
    });
    return HttpResponse.json({ data: user });
  }),

  http.delete('/api/users/:id', ({ params }) => {
    const user = mockUsers.find(u => u.id === Number(params.id));
    if (!user) return HttpResponse.json({ error: 'No encontrado' }, { status: 404 });
    user.isActive = false;
    return HttpResponse.json({ message: 'Usuario desactivado' });
  }),
];
