import { http, HttpResponse } from 'msw';
import { mockDocuments, mockTemplates } from '../data/documents.mock';

export const documentsHandlers = [
  /* ---------- LIST ---------- */
  http.get('/api/documents', ({ request }) => {
    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get('page') ?? '1', 10);
    const limit = parseInt(url.searchParams.get('limit') ?? '10', 10);
    const typeFilter = url.searchParams.get('type');
    const companyId = url.searchParams.get('companyId');

    let filtered = [...mockDocuments];
    if (typeFilter) filtered = filtered.filter(d => d.documentType === typeFilter);
    if (companyId) filtered = filtered.filter(d => d.companyId === Number(companyId));

    const total = filtered.length;
    const start = (page - 1) * limit;
    const data = filtered.slice(start, start + limit);

    return HttpResponse.json({
      data,
      meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
    });
  }),

  /* ---------- TEMPLATES ---------- */
  http.get('/api/documents/templates', () => {
    return HttpResponse.json({ data: mockTemplates });
  }),

  /* ---------- GET BY ID ---------- */
  http.get('/api/documents/:id', ({ params }) => {
    const all = [...mockDocuments, ...mockTemplates];
    const doc = all.find(d => d.id === Number(params.id));
    if (!doc) return HttpResponse.json({ error: 'No encontrado' }, { status: 404 });
    return HttpResponse.json({ data: doc });
  }),

  /* ---------- CREATE ---------- */
  http.post('/api/documents', async ({ request }) => {
    const body = (await request.json()) as Record<string, unknown>;
    const newDoc = {
      id: mockDocuments.length + 200,
      companyId: (body.companyId as number) ?? null,
      name: body.name as string,
      description: (body.description as string) ?? null,
      documentType: body.documentType as string,
      driveFileId: null,
      driveUrl: (body.driveUrl as string) ?? null,
      driveFolderId: null,
      relatedEntityType: (body.relatedEntityType as string) ?? null,
      relatedEntityId: (body.relatedEntityId as number) ?? null,
      createdById: 1,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      company: body.companyId ? { id: body.companyId as number, name: 'TechSecure S.A.S' } : null,
      createdBy: { id: 1, name: 'Carlos Mendoza' },
    };
    return HttpResponse.json({ data: newDoc }, { status: 201 });
  }),

  /* ---------- UPLOAD ---------- */
  http.post('/api/documents/upload', () => {
    const newDoc = {
      id: mockDocuments.length + 300,
      companyId: 1,
      name: 'Archivo subido',
      description: null,
      documentType: 'EVIDENCIA',
      driveFileId: 'drive-new-upload',
      driveUrl: 'https://drive.google.com/file/d/drive-new-upload/view',
      driveFolderId: 'folder-company1-evidencias',
      relatedEntityType: null,
      relatedEntityId: null,
      createdById: 1,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      company: { id: 1, name: 'TechSecure S.A.S' },
      createdBy: { id: 1, name: 'Carlos Mendoza' },
    };
    return HttpResponse.json({ data: newDoc }, { status: 201 });
  }),

  /* ---------- UPDATE ---------- */
  http.put('/api/documents/:id', async ({ params, request }) => {
    const doc = mockDocuments.find(d => d.id === Number(params.id));
    if (!doc) return HttpResponse.json({ error: 'No encontrado' }, { status: 404 });
    const body = (await request.json()) as Record<string, unknown>;
    Object.assign(doc, body, { updatedAt: new Date().toISOString() });
    return HttpResponse.json({ data: doc });
  }),

  /* ---------- DELETE ---------- */
  http.delete('/api/documents/:id', ({ params }) => {
    const idx = mockDocuments.findIndex(d => d.id === Number(params.id));
    if (idx === -1) return HttpResponse.json({ error: 'No encontrado' }, { status: 404 });
    mockDocuments.splice(idx, 1);
    return HttpResponse.json({ message: 'Documento eliminado' });
  }),

  /* ---------- INIT COMPANY FOLDERS ---------- */
  http.post('/api/documents/init-company-folders/:companyId', () => {
    return HttpResponse.json({
      data: {
        ACTA: 'folder-actas',
        REPORTE_AUDITORIA: 'folder-reportes',
        EVIDENCIA: 'folder-evidencias',
        POLITICA: 'folder-politicas',
        PLAN_TRATAMIENTO: 'folder-planes',
        INFORME_CAPACITACION: 'folder-capacitaciones',
      },
    });
  }),
];
