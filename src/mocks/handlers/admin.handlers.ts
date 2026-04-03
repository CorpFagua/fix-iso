import { http, HttpResponse } from 'msw';
import { mockRoles, mockPermissions, mockPermissionGroups, mockRolePermissions } from '../data/roles.mock';
import { allModules, permissionsByRole } from '../data/users.mock';
import { mockUsers } from '../data/users.mock';

// Module permissions map (moduleId -> permissionIds)
const mockModulePermissions: Record<number, number[]> = {
  1: [1],       // Dashboard -> dashboard:read
  8: [2],       // Empresas -> companies:read
  2: [6],       // Controles -> controls:read
  3: [11],      // SoA -> soa:read
  4: [13],      // Activos -> assets:read
  5: [17, 21, 8, 36], // Admin -> users:read, roles:read, controls:update, modules:manage
  6: [17],      // Usuarios -> users:read
  7: [21],      // Roles -> roles:read
  9: [8],       // Catálogo -> controls:update
  10: [36],     // Módulos -> modules:manage
};

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

  // Permissions
  http.get('/api/permissions', () => {
    return HttpResponse.json({ data: mockPermissionGroups });
  }),

  http.get('/api/permissions/all', () => {
    return HttpResponse.json({ data: mockPermissions });
  }),

  http.post('/api/permissions', async ({ request }) => {
    const body = (await request.json()) as { name: string; description: string; module: string };
    const newPerm = { id: mockPermissions.length + 1, ...body };
    mockPermissions.push(newPerm);
    return HttpResponse.json({ data: newPerm }, { status: 201 });
  }),

  http.put('/api/permissions/:id', async ({ params, request }) => {
    const perm = mockPermissions.find(p => p.id === Number(params.id));
    if (!perm) return HttpResponse.json({ error: 'No encontrado' }, { status: 404 });
    const body = (await request.json()) as Record<string, unknown>;
    Object.assign(perm, body);
    return HttpResponse.json({ data: perm });
  }),

  http.delete('/api/permissions/:id', ({ params }) => {
    const idx = mockPermissions.findIndex(p => p.id === Number(params.id));
    if (idx === -1) return HttpResponse.json({ error: 'No encontrado' }, { status: 404 });
    mockPermissions.splice(idx, 1);
    return new HttpResponse(null, { status: 204 });
  }),

  // Modules
  http.get('/api/modules', () => {
    return HttpResponse.json({ data: allModules });
  }),

  http.get('/api/modules/with-permissions', () => {
    const data = allModules.map(m => ({
      ...m,
      modulePermissions: (mockModulePermissions[m.id] ?? []).map(pid => ({ permissionId: pid })),
    }));
    return HttpResponse.json({ data });
  }),

  http.post('/api/modules', async ({ request }) => {
    const body = (await request.json()) as Record<string, unknown>;
    const newMod = {
      id: Math.max(...allModules.map(m => m.id)) + 1,
      name: body.name as string,
      route: body.route as string,
      icon: body.icon as string,
      parentId: (body.parentId as number | null) ?? null,
      displayOrder: (body.displayOrder as number) ?? 0,
    };
    allModules.push(newMod);
    const permIds = (body.permissionIds as number[]) ?? [];
    mockModulePermissions[newMod.id] = permIds;
    return HttpResponse.json({
      data: { ...newMod, modulePermissions: permIds.map(pid => ({ permissionId: pid })) },
    }, { status: 201 });
  }),

  http.put('/api/modules/:id', async ({ params, request }) => {
    const mod = allModules.find(m => m.id === Number(params.id));
    if (!mod) return HttpResponse.json({ error: 'No encontrado' }, { status: 404 });
    const body = (await request.json()) as Record<string, unknown>;
    if (body.name !== undefined) mod.name = body.name as string;
    if (body.route !== undefined) mod.route = body.route as string;
    if (body.icon !== undefined) mod.icon = body.icon as string;
    if (body.parentId !== undefined) mod.parentId = body.parentId as number | null;
    if (body.displayOrder !== undefined) mod.displayOrder = body.displayOrder as number;
    if (body.permissionIds !== undefined) mockModulePermissions[mod.id] = body.permissionIds as number[];
    return HttpResponse.json({
      data: { ...mod, modulePermissions: (mockModulePermissions[mod.id] ?? []).map(pid => ({ permissionId: pid })) },
    });
  }),

  http.delete('/api/modules/:id', ({ params }) => {
    const id = Number(params.id);
    const hasChildren = allModules.some(m => m.parentId === id);
    if (hasChildren) return HttpResponse.json({ error: 'Tiene submódulos' }, { status: 409 });
    const idx = allModules.findIndex(m => m.id === id);
    if (idx === -1) return HttpResponse.json({ error: 'No encontrado' }, { status: 404 });
    allModules.splice(idx, 1);
    delete mockModulePermissions[id];
    return new HttpResponse(null, { status: 204 });
  }),

  // User effective permissions
  http.get('/api/users/:id/effective-permissions', ({ params }) => {
    const userId = Number(params.id);
    const user = mockUsers.find(u => u.id === userId);
    if (!user) return HttpResponse.json({ error: 'No encontrado' }, { status: 404 });
    const roleName = user.roles[0]?.name ?? 'employee';
    const perms = permissionsByRole[roleName] ?? [];
    // Resolve permissionIds from permission names
    const permIds = perms
      .map(name => mockPermissions.find(p => p.name === name)?.id)
      .filter((id): id is number => id !== undefined);

    const permIdSet = new Set(permIds);
    const visibleModules = allModules.filter(m => {
      const modPerms = mockModulePermissions[m.id] ?? [];
      if (modPerms.length === 0) return true;
      return modPerms.some(pid => permIdSet.has(pid));
    });

    return HttpResponse.json({
      data: { permissionIds: permIds, permissions: perms, modules: visibleModules },
    });
  }),
];
