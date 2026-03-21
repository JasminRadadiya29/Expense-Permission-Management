import * as userController from '../../../../../server/controllers/userController.js';
import { executeController } from '../../../../../lib/routeHandler.js';

export const runtime = 'nodejs';

export async function POST(request, { params }) {
  return executeController(request, userController.resetUserPassword, {
    params,
    roles: ['Admin']
  });
}
