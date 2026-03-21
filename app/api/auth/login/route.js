import * as authController from '../../../../server/controllers/authController.js';
import { executeController } from '../../../../lib/routeHandler.js';

export const runtime = 'nodejs';

export async function POST(request) {
  return executeController(request, authController.login);
}
