import * as userController from '../../../../server/controllers/userController.js';
import { executeController } from '../../../../lib/routeHandler.js';

export const runtime = 'nodejs';

export async function GET(request) {
  return executeController(request, userController.getManagers, { roles: ['Admin', 'Manager', 'Employee'] });
}
