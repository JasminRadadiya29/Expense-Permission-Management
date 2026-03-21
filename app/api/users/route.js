import * as userController from '../../../server/controllers/userController.js';
import { executeController } from '../../../lib/routeHandler.js';

export const runtime = 'nodejs';

export async function GET(request) {
  return executeController(request, userController.getUsers, { roles: ['Admin', 'Manager'] });
}

export async function POST(request) {
  return executeController(request, userController.createUser, { roles: ['Admin'] });
}
