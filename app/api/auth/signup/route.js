import * as authController from '../../../../server/controllers/authController.js';
import { executeController } from '../../../../lib/routeHandler.js';
import { validateSignupPayload } from '../../../../lib/validation.js';

export const runtime = 'nodejs';

export async function POST(request) {
  return executeController(request, authController.signup, { validateBody: validateSignupPayload });
}
