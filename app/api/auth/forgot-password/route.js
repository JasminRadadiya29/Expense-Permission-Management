import * as authController from '../../../../server/controllers/authController.js';
import { executeController } from '../../../../lib/routeHandler.js';
import { validateForgotPasswordPayload } from '../../../../lib/validation.js';

export const runtime = 'nodejs';

export async function POST(request) {
  return executeController(request, authController.forgotPassword, {
    validateBody: validateForgotPasswordPayload,
    rateLimit: {
      key: 'auth-forgot-password',
      maxRequests: 5,
      windowMs: 30 * 60 * 1000,
      identifierFields: ['email'],
    },
  });
}
