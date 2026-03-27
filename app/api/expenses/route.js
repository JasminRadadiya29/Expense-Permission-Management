import * as expenseController from '../../../server/controllers/expenseController.js';
import { executeController } from '../../../lib/routeHandler.js';
import { validateCreateExpensePayload } from '../../../lib/validation.js';

export const runtime = 'nodejs';

export async function GET(request) {
  return executeController(request, expenseController.getExpenses, { roles: ['Admin', 'Manager', 'Employee'] });
}

export async function POST(request) {
  return executeController(request, expenseController.createExpense, {
    roles: ['Admin', 'Manager', 'Employee'],
    validateBody: validateCreateExpensePayload,
    csrf: true,
    idempotent: true,
  });
}
