import { http, HttpResponse } from 'msw';
import { mockTrainings, mockCompanyTrainings } from '../data/trainings.mock';

let nextTrainingId = mockTrainings.length + 1;

export const trainingsHandlers = [
  // ─── Admin: list all trainings ────────────────────
  http.get('/api/trainings', ({ request }) => {
    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get('page') ?? '1', 10);
    const limit = parseInt(url.searchParams.get('limit') ?? '20', 10);
    const typeFilter = url.searchParams.get('trainingType');
    const search = (url.searchParams.get('search') ?? '').toLowerCase();

    let filtered = mockTrainings.filter((t) => t.isActive);
    if (typeFilter) filtered = filtered.filter((t) => t.trainingType === typeFilter);
    if (search) filtered = filtered.filter((t) => t.title.toLowerCase().includes(search) || t.description?.toLowerCase().includes(search));

    const total = filtered.length;
    const start = (page - 1) * limit;
    const data = filtered.slice(start, start + limit);

    return HttpResponse.json({
      data,
      meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
    });
  }),

  // ─── Admin: get training by id ────────────────────
  http.get('/api/trainings/:id', ({ params }) => {
    const t = mockTrainings.find((t) => t.id === Number(params.id));
    if (!t) return HttpResponse.json({ error: 'No encontrada' }, { status: 404 });
    return HttpResponse.json({ data: { ...t, companyTrainings: [] } });
  }),

  // ─── Admin: create training ───────────────────────
  http.post('/api/trainings', async ({ request }) => {
    const body = (await request.json()) as Record<string, unknown>;
    const now = new Date().toISOString();
    const newTraining = {
      id: nextTrainingId++,
      title: body.title as string,
      description: (body.description as string) ?? null,
      trainingType: body.trainingType as string,
      resourcesJson: (body.resourcesJson as unknown[]) ?? [],
      createdBy: 1,
      creatorName: 'Carlos Mendoza',
      isActive: true,
      companiesCount: 0,
      createdAt: now,
      updatedAt: now,
    };
    mockTrainings.push(newTraining as typeof mockTrainings[0]);
    return HttpResponse.json({ data: newTraining }, { status: 201 });
  }),

  // ─── Admin: update training ───────────────────────
  http.put('/api/trainings/:id', async ({ params, request }) => {
    const id = Number(params.id);
    const body = (await request.json()) as Record<string, unknown>;
    const idx = mockTrainings.findIndex((t) => t.id === id);
    if (idx === -1) return HttpResponse.json({ error: 'No encontrada' }, { status: 404 });

    if (body.title) mockTrainings[idx].title = body.title as string;
    if (body.description !== undefined) mockTrainings[idx].description = body.description as string;
    if (body.trainingType) mockTrainings[idx].trainingType = body.trainingType as typeof mockTrainings[0]['trainingType'];
    if (body.resourcesJson) mockTrainings[idx].resourcesJson = body.resourcesJson as typeof mockTrainings[0]['resourcesJson'];
    mockTrainings[idx].updatedAt = new Date().toISOString();

    return HttpResponse.json({ data: mockTrainings[idx] });
  }),

  // ─── Admin: delete training ───────────────────────
  http.delete('/api/trainings/:id', ({ params }) => {
    const idx = mockTrainings.findIndex((t) => t.id === Number(params.id));
    if (idx !== -1) mockTrainings[idx].isActive = false;
    return new HttpResponse(null, { status: 204 });
  }),

  // ─── Company: list assigned trainings ─────────────
  http.get('/api/companies/:companyId/trainings', ({ params }) => {
    const companyId = Number(params.companyId);
    const data = mockCompanyTrainings.filter((ct) => ct.companyId === companyId);
    return HttpResponse.json({ data });
  }),

  // ─── Company: available (not yet assigned) ────────
  http.get('/api/companies/:companyId/trainings/available', ({ params }) => {
    const companyId = Number(params.companyId);
    const assignedIds = mockCompanyTrainings.filter((ct) => ct.companyId === companyId).map((ct) => ct.trainingId);
    const data = mockTrainings
      .filter((t) => t.isActive && !assignedIds.includes(t.id))
      .map((t) => ({ id: t.id, title: t.title, trainingType: t.trainingType, description: t.description, createdAt: t.createdAt }));
    return HttpResponse.json({ data });
  }),

  // ─── Company: get training detail ─────────────────
  http.get('/api/companies/:companyId/trainings/:trainingId', ({ params }) => {
    const ct = mockCompanyTrainings.find(
      (ct) => ct.companyId === Number(params.companyId) && ct.trainingId === Number(params.trainingId),
    );
    if (!ct) return HttpResponse.json({ error: 'No encontrada' }, { status: 404 });
    return HttpResponse.json({ data: ct });
  }),

  // ─── Company: assign training ─────────────────────
  http.post('/api/companies/:companyId/trainings', async ({ params, request }) => {
    const companyId = Number(params.companyId);
    const body = (await request.json()) as { trainingId: number };
    const training = mockTrainings.find((t) => t.id === body.trainingId);
    if (!training) return HttpResponse.json({ error: 'No encontrada' }, { status: 404 });

    const newCt = {
      id: mockCompanyTrainings.length + 1,
      trainingId: training.id,
      companyId,
      title: training.title,
      description: training.description,
      trainingType: training.trainingType,
      resourcesJson: training.resourcesJson,
      trainingCreatedAt: training.createdAt,
      assignedAt: new Date().toISOString(),
      assignedByName: 'Carlos Mendoza',
      enrollments: [],
    };
    mockCompanyTrainings.push(newCt as typeof mockCompanyTrainings[0]);
    return HttpResponse.json({ data: newCt }, { status: 201 });
  }),

  // ─── Company: update enrollment status ────────────
  http.patch('/api/companies/:companyId/trainings/enrollments/:enrollmentId', async ({ params, request }) => {
    const enrollmentId = Number(params.enrollmentId);
    const body = (await request.json()) as { status: string };

    for (const ct of mockCompanyTrainings) {
      const enrollment = ct.enrollments.find((e) => e.id === enrollmentId);
      if (enrollment) {
        enrollment.status = body.status as typeof enrollment.status;
        if (body.status === 'COMPLETED') enrollment.completedAt = new Date().toISOString();
        return HttpResponse.json({ data: enrollment });
      }
    }
    return HttpResponse.json({ error: 'No encontrado' }, { status: 404 });
  }),

  // ─── Company: enroll user ─────────────────────────
  http.post('/api/companies/:companyId/trainings/enroll', async ({ request }) => {
    const body = (await request.json()) as { companyTrainingId: number };
    const ct = mockCompanyTrainings.find((ct) => ct.id === body.companyTrainingId);
    if (!ct) return HttpResponse.json({ error: 'No encontrada' }, { status: 404 });

    const newEnrollment = {
      id: Math.max(...mockCompanyTrainings.flatMap((ct) => ct.enrollments.map((e) => e.id)), 0) + 1,
      userId: 1,
      userName: 'Carlos Mendoza',
      userEmail: 'admin@fixiso.com',
      status: 'PENDING' as const,
      enrolledAt: new Date().toISOString(),
      completedAt: null,
      notes: null,
    };
    ct.enrollments.push(newEnrollment);
    return HttpResponse.json({ data: newEnrollment }, { status: 201 });
  }),
];
