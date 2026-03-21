import * as authController from '../../../../server/controllers/authController.js';
import { executeController } from '../../../../lib/routeHandler.js';

export const runtime = 'nodejs';

export async function GET(request) {
  return executeController(request, authController.getMe, { roles: ['Admin', 'Manager', 'Employee'] });
}
