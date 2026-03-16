import { setupWorker } from 'msw/browser';
import { authHandlers } from './handlers/auth.handlers';
import { usersHandlers } from './handlers/users.handlers';
import { controlsHandlers } from './handlers/controls.handlers';
import { assetsHandlers } from './handlers/assets.handlers';
import { dashboardHandlers } from './handlers/dashboard.handlers';
import { adminHandlers } from './handlers/admin.handlers';

export const worker = setupWorker(
  ...authHandlers,
  ...usersHandlers,
  ...controlsHandlers,
  ...assetsHandlers,
  ...dashboardHandlers,
  ...adminHandlers,
);
