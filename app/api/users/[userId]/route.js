import * as userController from '../../../../server/controllers/userController.js';
import { executeController } from '../../../../lib/routeHandler.js';
import { validateUpdateUserPayload } from '../../../../lib/validation.js';

export const runtime = 'nodejs';

export async function PUT(request, { params }) {
  return executeController(request, userController.updateUser, {
    params,
    roles: ['Admin'],
    validateBody: validateUpdateUserPayload
  });
}
