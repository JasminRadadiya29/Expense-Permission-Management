import * as approvalRuleController from '../../../../server/controllers/approvalRuleController.js';
import { executeController } from '../../../../lib/routeHandler.js';
import { validateApprovalRulePayload } from '../../../../lib/validation.js';

export const runtime = 'nodejs';

export async function PUT(request, { params }) {
  return executeController(request, approvalRuleController.updateApprovalRule, {
    params,
    roles: ['Admin'],
    validateBody: validateApprovalRulePayload
  });
}

export async function DELETE(request, { params }) {
  return executeController(request, approvalRuleController.deleteApprovalRule, {
    params,
    roles: ['Admin']
  });
}
