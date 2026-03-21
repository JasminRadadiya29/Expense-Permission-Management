import express from 'express';
import * as expenseController from '../controllers/expenseController.js';
import { auth } from '../middleware/auth.js';

const router = express.Router();

router.post('/', auth, expenseController.createExpense);
router.post('/:expenseId/submit', auth, expenseController.submitExpense);
router.get('/', auth, expenseController.getExpenses);
router.get('/:expenseId', auth, expenseController.getExpenseById);
router.put('/:expenseId', auth, expenseController.updateExpense);

export default router;