import * as approvalController from '../../../../../server/controllers/approvalController.js';
import { executeController } from '../../../../../lib/routeHandler.js';
import { validateProcessApprovalPayload } from '../../../../../lib/validation.js';

export const runtime = 'nodejs';

export async function POST(request, context) {
  const params = await context.params;
  return executeController(request, approvalController.processApproval, {
    params,
    roles: ['Admin', 'Manager'],
    validateBody: validateProcessApprovalPayload,
    csrf: true,
    idempotent: true,
  });
}
