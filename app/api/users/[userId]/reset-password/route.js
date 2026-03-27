import * as userController from '../../../../../server/controllers/userController.js';
import { executeController } from '../../../../../lib/routeHandler.js';

export const runtime = 'nodejs';

export async function POST(request, context) {
  const params = await context.params;
  return executeController(request, userController.resetUserPassword, {
    params,
    roles: ['Admin'],
    rateLimit: {
      key: 'admin-reset-user-password',
      maxRequests: 10,
      windowMs: 60 * 60 * 1000,
      identifierFields: ['params.userId'],
    },
  });
}
