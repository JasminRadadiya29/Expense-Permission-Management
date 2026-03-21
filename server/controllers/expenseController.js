import Expense from '../models/Expense.js';
import Approval from '../models/Approval.js';
import ApprovalRule from '../models/ApprovalRule.js';
import User from '../models/User.js';

export const createExpense = async (req, res) => {
  try {
    const { description, category, date, amount, currency, paidBy, remarks, receiptUrl, amountInBaseCurrency } = req.body;

    const expense = await Expense.create({
      employee: req.userId,
      company: req.companyId,
      description,
      category,
      date,
      amount,
      currency,
      amountInBaseCurrency,
      paidBy,
      remarks,
      receiptUrl,
      status: 'Draft'
    });

    const populatedExpense = await Expense.findById(expense._id).populate('employee', 'name email');

    res.status(201).json({ expense: populatedExpense });
  } catch (error) {
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

    const approvalRule = await ApprovalRule.findOne({ company: req.companyId, isActive: true });

    if (!approvalRule || approvalRule.steps.length === 0) {
      if (req.user.manager) {
        await Approval.create({
          expense: expense._id,
          approver: req.user.manager,
          step: 1,
          status: 'Pending'
        });
        expense.currentApprovalStep = 1;
      } else {
        expense.status = 'Approved';
        await expense.save();
        return res.json({ expense });
      }
    } else {
      const firstStep = approvalRule.steps.find(s => s.stepNumber === 1);
      if (firstStep && firstStep.approvers.length > 0) {
        for (const approverId of firstStep.approvers) {
          await Approval.create({
            expense: expense._id,
            approver: approverId,
            step: 1,
            status: 'Pending'
          });
        }
        expense.currentApprovalStep = 1;
      }
    }

    expense.status = 'Waiting Approval';
    await expense.save();

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
      const teamMembers = await User.find({ manager: req.userId }).select('_id');
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
    if (amount) expense.amount = amount;
    if (currency) expense.currency = currency;
    if (amountInBaseCurrency) expense.amountInBaseCurrency = amountInBaseCurrency;
    if (paidBy) expense.paidBy = paidBy;
    if (remarks !== undefined) expense.remarks = remarks;
    if (receiptUrl !== undefined) expense.receiptUrl = receiptUrl;

    await expense.save();

    const updatedExpense = await Expense.findById(expense._id).populate('employee', 'name email');

    res.json({ expense: updatedExpense });
  } catch (error) {
    console.error('Update expense error:', error);
    res.status(500).json({ error: 'Error updating expense' });
  }
};