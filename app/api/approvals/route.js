import * as approvalController from '../../../server/controllers/approvalController.js';
import { executeController } from '../../../lib/routeHandler.js';

export const runtime = 'nodejs';

export async function GET(request) {
  return executeController(request, approvalController.getAllApprovals, { roles: ['Admin', 'Manager'] });
}
