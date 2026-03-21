import * as userController from '../../../../server/controllers/userController.js';
import { executeController } from '../../../../lib/routeHandler.js';

export const runtime = 'nodejs';

export async function PUT(request, { params }) {
  return executeController(request, userController.updateUser, {
    params,
    roles: ['Admin']
  });
}
