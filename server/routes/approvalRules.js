import express from 'express';
import * as approvalRuleController from '../controllers/approvalRuleController.js';
import { auth, authorize } from '../middleware/auth.js';

const router = express.Router();

router.get('/', auth, authorize('Admin'), approvalRuleController.getApprovalRules);
router.post('/', auth, authorize('Admin'), approvalRuleController.createApprovalRule);
router.put('/:ruleId', auth, authorize('Admin'), approvalRuleController.updateApprovalRule);
router.delete('/:ruleId', auth, authorize('Admin'), approvalRuleController.deleteApprovalRule);

export default router;