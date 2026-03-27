import * as authController from '../../../../server/controllers/authController.js';
import { executeController } from '../../../../lib/routeHandler.js';
import { validateResetPasswordPayload } from '../../../../lib/validation.js';

export const runtime = 'nodejs';

export async function POST(request) {
  return executeController(request, authController.resetPassword, {
    validateBody: validateResetPasswordPayload,
    rateLimit: {
      key: 'auth-reset-password',
      maxRequests: 10,
      windowMs: 30 * 60 * 1000,
    },
  });
}
