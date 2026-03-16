import { http, HttpResponse } from 'msw';
import { mockRoles, mockPermissionGroups, mockRolePermissions } from '../data/roles.mock';
import { allModules } from '../data/users.mock';

export const adminHandlers = [
  http.get('/api/roles', () => {
    return HttpResponse.json({ data: mockRoles });
  }),

  http.post('/api/roles', async ({ request }) => {
    const body = (await request.json()) as Record<string, unknown>;
    const newRole = {
      id: mockRoles.length + 1,
      name: body.name as string,
      description: (body.description as string) ?? null,
      usersCount: 0,
      permissionsCount: ((body.permissionIds as number[]) ?? []).length,
    };
    mockRoles.push(newRole);
    return HttpResponse.json({ data: newRole }, { status: 201 });
  }),

  http.put('/api/roles/:id', async ({ params, request }) => {
    const role = mockRoles.find(r => r.id === Number(params.id));
    if (!role) return HttpResponse.json({ error: 'No encontrado' }, { status: 404 });
    const body = (await request.json()) as Record<string, unknown>;
    Object.assign(role, {
      name: (body.name as string) ?? role.name,
      description: body.description !== undefined ? body.description : role.description,
    });
    return HttpResponse.json({ data: role });
  }),

  http.get('/api/roles/:id/permissions', ({ params }) => {
    const roleId = Number(params.id);
    const pIds = mockRolePermissions[roleId] ?? [];
    return HttpResponse.json({ data: pIds });
  }),

  http.put('/api/roles/:id/permissions', async ({ params, request }) => {
    const roleId = Number(params.id);
    const body = (await request.json()) as { permissionIds: number[] };
    mockRolePermissions[roleId] = body.permissionIds;
    const role = mockRoles.find(r => r.id === roleId);
    if (role) role.permissionsCount = body.permissionIds.length;
    return HttpResponse.json({ message: 'Permisos actualizados' });
  }),

  http.get('/api/permissions', () => {
    return HttpResponse.json({ data: mockPermissionGroups });
  }),

  http.get('/api/modules', () => {
    return HttpResponse.json({ data: allModules });
  }),
];
