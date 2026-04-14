import { setupWorker } from 'msw/browser';
import { authHandlers } from './handlers/auth.handlers';
import { usersHandlers } from './handlers/users.handlers';
import { controlsHandlers } from './handlers/controls.handlers';
import { assetsHandlers } from './handlers/assets.handlers';
import { dashboardHandlers } from './handlers/dashboard.handlers';
import { adminHandlers } from './handlers/admin.handlers';
import { companiesHandlers } from './handlers/companies.handlers';
import { applicabilityHandlers } from './handlers/applicability.handlers';
import { trainingsHandlers } from './handlers/trainings.handlers';
import { bigdataHandlers } from './handlers/bigdata.handlers';
import { documentsHandlers } from './handlers/documents.handlers';
import { reportsHandlers } from './handlers/reports.handlers';

export const worker = setupWorker(
  ...authHandlers,
  ...usersHandlers,
  ...controlsHandlers,
  ...assetsHandlers,
  ...dashboardHandlers,
  ...adminHandlers,
  ...companiesHandlers,
  ...applicabilityHandlers,
  ...trainingsHandlers,
  ...bigdataHandlers,
  ...documentsHandlers,
  ...reportsHandlers,
);
