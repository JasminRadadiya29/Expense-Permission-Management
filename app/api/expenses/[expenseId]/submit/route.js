import * as expenseController from '../../../../../server/controllers/expenseController.js';
import { executeController } from '../../../../../lib/routeHandler.js';

export const runtime = 'nodejs';

export async function POST(request, context) {
  const params = await context.params;
  return executeController(request, expenseController.submitExpense, {
    params,
    roles: ['Admin', 'Manager', 'Employee']
  });
}
