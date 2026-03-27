import * as expenseController from '../../../../server/controllers/expenseController.js';
import { executeController } from '../../../../lib/routeHandler.js';
import { validateUpdateExpensePayload } from '../../../../lib/validation.js';

export const runtime = 'nodejs';

export async function GET(request, context) {
  const params = await context.params;
  return executeController(request, expenseController.getExpenseById, {
    params,
    roles: ['Admin', 'Manager', 'Employee']
  });
}

export async function PUT(request, context) {
  const params = await context.params;
  return executeController(request, expenseController.updateExpense, {
    params,
    roles: ['Admin', 'Manager', 'Employee'],
    validateBody: validateUpdateExpensePayload
  });
}
