import Expense from '../models/Expense.js';
import Approval from '../models/Approval.js';
import ApprovalRule from '../models/ApprovalRule.js';
import User from '../models/User.js';
import { logAuditAction } from '../utils/auditLog.js';
import { convertAmountToCurrency } from '../utils/currency.js';

const resolveAmountInBaseCurrency = async ({ amount, currency, amountInBaseCurrency, baseCurrency }) => {
  const parsedAmount = Number(amount);
  const normalizedCurrency = typeof currency === 'string' ? currency.trim().toUpperCase() : null;
  const normalizedBaseCurrency = typeof baseCurrency === 'string' ? baseCurrency.trim().toUpperCase() : null;
  const parsedBaseAmount = Number(amountInBaseCurrency);

  if (!Number.isFinite(parsedAmount) || parsedAmount <= 0) {
    throw new Error('INVALID_EXPENSE_AMOUNT');
  }

  if (!normalizedCurrency || normalizedCurrency.length !== 3) {
    throw new Error('INVALID_EXPENSE_CURRENCY');
  }

  if (!normalizedBaseCurrency || normalizedBaseCurrency.length !== 3) {
    return parsedAmount;
  }

  if (normalizedCurrency === normalizedBaseCurrency) {
    return parsedAmount;
  }

  if (Number.isFinite(parsedBaseAmount) && parsedBaseAmount > 0) {
    return parsedBaseAmount;
  }

  return convertAmountToCurrency({
    amount: parsedAmount,
    fromCurrency: normalizedCurrency,
    toCurrency: normalizedBaseCurrency,
  });
};

const initializeApprovalChain = async ({ expense, companyId, submitter }) => {
  const approvalRule = await ApprovalRule.findOne({ company: companyId, isActive: true });

  if (!approvalRule || approvalRule.steps.length === 0) {
    if (submitter?.manager) {
      await Approval.create({
        expense: expense._id,
        approver: submitter.manager,
        step: 1,
        status: 'Pending'
      });
      expense.currentApprovalStep = 1;
      expense.status = 'Waiting Approval';
      return;
    }

    expense.currentApprovalStep = 0;
    expense.status = 'Approved';
    return;
  }

  const firstStep = approvalRule.steps.find((step) => step.stepNumber === 1);
  if (!firstStep || firstStep.approvers.length === 0) {
    expense.currentApprovalStep = 0;
    expense.status = 'Approved';
    return;
  }

  for (const approverId of firstStep.approvers) {
    await Approval.create({
      expense: expense._id,
      approver: approverId,
      step: 1,
      status: 'Pending'
    });
  }

  expense.currentApprovalStep = 1;
  expense.status = 'Waiting Approval';
};

export const createExpense = async (req, res) => {
  try {
    const { description, category, date, amount, currency, paidBy, remarks, receiptUrl, amountInBaseCurrency } = req.body;
    const normalizedAmountInBaseCurrency = await resolveAmountInBaseCurrency({
      amount,
      currency,
      amountInBaseCurrency,
      baseCurrency: req.user?.company?.baseCurrency,
    });

    const expense = await Expense.create({
      employee: req.userId,
      company: req.companyId,
      description,
      category,
      date,
      amount,
      currency,
      amountInBaseCurrency: normalizedAmountInBaseCurrency,
      paidBy,
      remarks,
      receiptUrl,
      status: 'Draft'
    });

    // Log expense creation
    await logAuditAction({
      company: req.companyId,
      user: req.userId,
      action: 'CREATE',
      resourceType: 'Expense',
      resourceId: expense._id,
      details: { 
        description,
        category,
        amount: normalizedAmountInBaseCurrency,
        status: 'Draft'
      }
    }).catch(err => console.error('Audit log error:', err));

    const populatedExpense = await Expense.findById(expense._id).populate('employee', 'name email');

    res.status(201).json({ expense: populatedExpense });
  } catch (error) {
    if (error.message === 'INVALID_EXPENSE_AMOUNT' || error.message === 'INVALID_EXPENSE_CURRENCY') {
      return res.status(400).json({ error: 'Invalid amount or currency for expense' });
    }

    if ((error.message || '').toLowerCase().includes('exchange')) {
      return res.status(502).json({ error: 'Unable to convert amount to company base currency at the moment' });
    }

    console.error('Create expense error:', error);
    res.status(500).json({ 
      error: 'Error creating expense',
      message: error.message
     });
  }
};

export const submitExpense = async (req, res) => {
  try {
    const { expenseId } = req.params;

    const expense = await Expense.findOne({ _id: expenseId, employee: req.userId });
    if (!expense) {
      return res.status(404).json({ error: 'Expense not found' });
    }

    if (expense.status !== 'Draft') {
      return res.status(400).json({ error: 'Expense already submitted' });
    }

    await initializeApprovalChain({
      expense,
      companyId: req.companyId,
      submitter: req.user,
    });

    await expense.save();

    // Log expense submission (status change to Waiting Approval)
    await logAuditAction({
      company: req.companyId,
      user: req.userId,
      action: 'UPDATE',
      resourceType: 'Expense',
      resourceId: expense._id,
      details: { 
        oldStatus: 'Draft',
        newStatus: 'Waiting Approval',
        action: 'submitted'
      }
    }).catch(err => console.error('Audit log error:', err));

    const updatedExpense = await Expense.findById(expense._id).populate('employee', 'name email');

    res.json({ expense: updatedExpense });
  } catch (error) {
    console.error('Submit expense error:', error);
    res.status(500).json({ error: 'Error submitting expense' });
  }
};

export const getExpenses = async (req, res) => {
  try {
    let query = { company: req.companyId };

    if (req.user.role === 'Employee') {
      query.employee = req.userId;
    } else if (req.user.role === 'Manager') {
      const teamMembers = await User.find({ manager: req.userId, isActive: true }).select('_id');
      const teamIds = [req.userId, ...teamMembers.map(m => m._id)];
      query.employee = { $in: teamIds };
    }

    const expenses = await Expense.find(query)
      .populate('employee', 'name email')
      .sort({ createdAt: -1 });

    res.json({ expenses });
  } catch (error) {
    console.error('Get expenses error:', error);
    res.status(500).json({ error: 'Error fetching expenses' });
  }
};

export const getExpenseById = async (req, res) => {
  try {
    const { expenseId } = req.params;

    const expense = await Expense.findOne({ _id: expenseId, company: req.companyId })
      .populate('employee', 'name email');

    if (!expense) {
      return res.status(404).json({ error: 'Expense not found' });
    }

    if (req.user.role === 'Employee' && expense.employee._id.toString() !== req.userId.toString()) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const approvals = await Approval.find({ expense: expenseId }).populate('approver', 'name email role');

    res.json({ expense, approvals });
  } catch (error) {
    console.error('Get expense error:', error);
    res.status(500).json({ error: 'Error fetching expense' });
  }
};

export const updateExpense = async (req, res) => {
  try {
    const { expenseId } = req.params;
    const { description, category, date, amount, currency, paidBy, remarks, receiptUrl, amountInBaseCurrency } = req.body;

    const expense = await Expense.findOne({ _id: expenseId, employee: req.userId });
    if (!expense) {
      return res.status(404).json({ error: 'Expense not found' });
    }

    if (expense.status !== 'Draft') {
      return res.status(400).json({ error: 'Cannot edit submitted expense' });
    }

    if (description) expense.description = description;
    if (category) expense.category = category;
    if (date) expense.date = date;
    if (amount !== undefined) expense.amount = amount;
    if (currency !== undefined) expense.currency = currency;

    if (amount !== undefined || currency !== undefined || amountInBaseCurrency !== undefined) {
      expense.amountInBaseCurrency = await resolveAmountInBaseCurrency({
        amount: expense.amount,
        currency: expense.currency,
        amountInBaseCurrency,
        baseCurrency: req.user?.company?.baseCurrency,
      });
    }
    if (paidBy) expense.paidBy = paidBy;
    if (remarks !== undefined) expense.remarks = remarks;
    if (receiptUrl !== undefined) expense.receiptUrl = receiptUrl;

    await expense.save();

    const updatedExpense = await Expense.findById(expense._id).populate('employee', 'name email');

    res.json({ expense: updatedExpense });
  } catch (error) {
    if (error.message === 'INVALID_EXPENSE_AMOUNT' || error.message === 'INVALID_EXPENSE_CURRENCY') {
      return res.status(400).json({ error: 'Invalid amount or currency for expense' });
    }

    if ((error.message || '').toLowerCase().includes('exchange')) {
      return res.status(502).json({ error: 'Unable to convert amount to company base currency at the moment' });
    }

    console.error('Update expense error:', error);
    res.status(500).json({ error: 'Error updating expense' });
  }
};

export const resubmitExpense = async (req, res) => {
  try {
    const { expenseId } = req.params;

    const expense = await Expense.findOne({ _id: expenseId, employee: req.userId, company: req.companyId });
    if (!expense) {
      return res.status(404).json({ error: 'Expense not found' });
    }

    if (expense.status !== 'Rejected') {
      return res.status(400).json({ error: 'Only rejected expenses can be resubmitted' });
    }

    await Approval.updateMany(
      { expense: expense._id, status: 'Pending' },
      { status: 'Rejected', comments: 'Closed due to expense resubmission', approvedAt: new Date() }
    );

    expense.currentApprovalStep = 0;

    await initializeApprovalChain({
      expense,
      companyId: req.companyId,
      submitter: req.user,
    });

    await expense.save();

    const updatedExpense = await Expense.findById(expense._id).populate('employee', 'name email');

    return res.json({ expense: updatedExpense, message: 'Expense resubmitted successfully' });
  } catch (error) {
    console.error('Resubmit expense error:', error);
    return res.status(500).json({ error: 'Error resubmitting expense' });
  }
};