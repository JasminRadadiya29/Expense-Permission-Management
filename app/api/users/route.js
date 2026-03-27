import * as userController from '../../../server/controllers/userController.js';
import { executeController } from '../../../lib/routeHandler.js';
import { validateCreateUserPayload } from '../../../lib/validation.js';

export const runtime = 'nodejs';

export async function GET(request) {
  return executeController(request, userController.getUsers, { roles: ['Admin', 'Manager'] });
}

export async function POST(request) {
  return executeController(request, userController.createUser, {
    roles: ['Admin'],
    validateBody: validateCreateUserPayload,
    rateLimit: {
      key: 'admin-create-user',
      maxRequests: 20,
      windowMs: 60 * 60 * 1000,
      identifierFields: ['email'],
    },
    csrf: true,
    idempotent: true,
  });
}
