import * as approvalRuleController from '../../../server/controllers/approvalRuleController.js';
import { executeController } from '../../../lib/routeHandler.js';

export const runtime = 'nodejs';

export async function GET(request) {
  return executeController(request, approvalRuleController.getApprovalRules, { roles: ['Admin'] });
}

export async function POST(request) {
  return executeController(request, approvalRuleController.createApprovalRule, { roles: ['Admin'] });
}
