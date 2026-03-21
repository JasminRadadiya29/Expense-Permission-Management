import * as approvalRuleController from '../../../../server/controllers/approvalRuleController.js';
import { executeController } from '../../../../lib/routeHandler.js';

export const runtime = 'nodejs';

export async function PUT(request, { params }) {
  return executeController(request, approvalRuleController.updateApprovalRule, {
    params,
    roles: ['Admin']
  });
}

export async function DELETE(request, { params }) {
  return executeController(request, approvalRuleController.deleteApprovalRule, {
    params,
    roles: ['Admin']
  });
}
