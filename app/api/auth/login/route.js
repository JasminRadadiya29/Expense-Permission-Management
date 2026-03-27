import * as authController from '../../../../server/controllers/authController.js';
import { executeController } from '../../../../lib/routeHandler.js';
import { validateLoginPayload } from '../../../../lib/validation.js';

export const runtime = 'nodejs';

export async function POST(request) {
  return executeController(request, authController.login, {
    validateBody: validateLoginPayload,
    rateLimit: {
      key: 'auth-login',
      maxRequests: 10,
      windowMs: 15 * 60 * 1000,
      identifierFields: ['email'],
    },
  });
}
