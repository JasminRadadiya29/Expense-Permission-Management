import express from 'express';
import * as approvalController from '../controllers/approvalController.js';
import { auth, authorize } from '../middleware/auth.js';

const router = express.Router();

router.get('/pending', auth, authorize('Manager', 'Admin'), approvalController.getApprovalsForUser);
router.get('/', auth, authorize('Manager', 'Admin'), approvalController.getAllApprovals);
router.post('/:approvalId/process', auth, authorize('Manager', 'Admin'), approvalController.processApproval);

export default router;