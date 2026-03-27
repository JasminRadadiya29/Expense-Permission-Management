import mongoose from 'mongoose';
import Approval from '../models/Approval.js';
import Expense from '../models/Expense.js';
import ApprovalRule from '../models/ApprovalRule.js';
import { logAuditAction } from '../utils/auditLog.js';

export const getApprovalsForUser = async (req, res) => {
  try {
    const approvals = await Approval.find({
      approver: req.userId,
      status: 'Pending'
    })
      .populate({
        path: 'expense',
        populate: {
          path: 'employee',
          select: 'name email'
        }
      })
      .sort({ createdAt: -1 });

    res.json({ approvals });
  } catch (error) {
    console.error('Get approvals error:', error);
    res.status(500).json({ error: 'Error fetching approvals' });
  }
};

export const processApproval = async (req, res) => {
  const session = await mongoose.startSession();

  try {
    const { approvalId } = req.params;
    const { status, comments } = req.body;

    let approvalDocId;
    let expenseDocId;

    await session.withTransaction(async () => {
      const approval = await Approval.findOne({
        _id: approvalId,
        approver: req.userId,
      }).session(session);

      if (!approval) {
        throw new Error('APPROVAL_NOT_FOUND');
      }

      if (approval.status !== 'Pending') {
        throw new Error('APPROVAL_ALREADY_PROCESSED');
      }

      const expense = await Expense.findById(approval.expense).session(session);
      if (!expense) {
        throw new Error('EXPENSE_NOT_FOUND');
      }

      if (expense.status !== 'Waiting Approval') {
        throw new Error('EXPENSE_NOT_WAITING_APPROVAL');
      }

      approval.status = status;
      approval.comments = comments || '';
      approval.approvedAt = new Date();
      await approval.save({ session });

      if (status === 'Rejected') {
        await Approval.updateMany(
          { expense: expense._id, status: 'Pending' },
          { status: 'Rejected', comments: 'Closed due to rejection in approval chain', approvedAt: new Date() },
          { session },
        );
        expense.status = 'Rejected';
        await expense.save({ session });

        approvalDocId = approval._id;
        expenseDocId = expense._id;
        return;
      }

      const currentStepApprovals = await Approval.find({
        expense: expense._id,
        step: approval.step,
      }).session(session);

      const approvalRule = await ApprovalRule.findOne({
        company: expense.company,
        isActive: true,
      }).session(session);

      let stepCompleted = false;

      if (approvalRule && approvalRule.steps.length > 0) {
        const currentStepRule = approvalRule.steps.find((s) => s.stepNumber === approval.step);

        if (currentStepRule) {
          if (currentStepRule.approvalType === 'specific' && currentStepRule.specificApprovers.length > 0) {
            const hasSpecificApproval = currentStepApprovals.some(
              (a) =>
                a.status === 'Approved' &&
                currentStepRule.specificApprovers.some((sa) => sa.toString() === a.approver.toString()),
            );
            stepCompleted = hasSpecificApproval;
          } else if (currentStepRule.approvalType === 'percentage') {
            const approvedCount = currentStepApprovals.filter((a) => a.status === 'Approved').length;
            const totalCount = currentStepApprovals.length;
            const approvalPercentage = (approvedCount / totalCount) * 100;
            stepCompleted = approvalPercentage >= (currentStepRule.requiredPercentage || 100);
          } else if (currentStepRule.approvalType === 'hybrid') {
            const hasSpecificApproval =
              currentStepRule.specificApprovers.length > 0 &&
              currentStepApprovals.some(
                (a) =>
                  a.status === 'Approved' &&
                  currentStepRule.specificApprovers.some((sa) => sa.toString() === a.approver.toString()),
              );

            const approvedCount = currentStepApprovals.filter((a) => a.status === 'Approved').length;
            const totalCount = currentStepApprovals.length;
            const approvalPercentage = (approvedCount / totalCount) * 100;
            const meetsPercentage = approvalPercentage >= (currentStepRule.requiredPercentage || 100);

            stepCompleted = hasSpecificApproval || meetsPercentage;
          } else {
            stepCompleted = currentStepApprovals.every((a) => a.status === 'Approved');
          }
        } else {
          stepCompleted = currentStepApprovals.every((a) => a.status === 'Approved');
        }
      } else {
        stepCompleted = currentStepApprovals.every((a) => a.status === 'Approved');
      }

      if (stepCompleted) {
        const nextStep = approval.step + 1;
        const nextStepRule = approvalRule?.steps.find((s) => s.stepNumber === nextStep);

        if (nextStepRule && nextStepRule.approvers.length > 0) {
          const nextStepDocs = nextStepRule.approvers.map((approverId) => ({
            expense: expense._id,
            approver: approverId,
            step: nextStep,
            status: 'Pending',
          }));

          await Approval.insertMany(nextStepDocs, { session });
          expense.currentApprovalStep = nextStep;
          await expense.save({ session });
        } else {
          expense.status = 'Approved';
          await expense.save({ session });
        }
      }

      approvalDocId = approval._id;
      expenseDocId = expense._id;
    });

    const [updatedApproval, expense] = await Promise.all([
      Approval.findById(approvalDocId).populate({
        path: 'expense',
        populate: {
          path: 'employee',
          select: 'name email',
        },
      }),
      Expense.findById(expenseDocId),
    ]);

    // Log approval action
    const action = updatedApproval.status === 'Rejected' ? 'REJECT' : 'APPROVE';
    await logAuditAction({
      company: expense.company,
      user: req.userId,
      action,
      resourceType: 'Approval',
      resourceId: approvalDocId,
      details: {
        expenseId: expenseDocId,
        approvalStatus: updatedApproval.status,
        comments: updatedApproval.comments,
        expenseStatus: expense.status
      }
    }).catch(err => console.error('Audit log error:', err));

    return res.json({ approval: updatedApproval, expense });
  } catch (error) {
    if (error.message === 'APPROVAL_NOT_FOUND') {
      return res.status(404).json({ error: 'Approval not found' });
    }
    if (error.message === 'APPROVAL_ALREADY_PROCESSED') {
      return res.status(400).json({ error: 'Approval already processed' });
    }
    if (error.message === 'EXPENSE_NOT_FOUND') {
      return res.status(404).json({ error: 'Expense not found' });
    }
    if (error.message === 'EXPENSE_NOT_WAITING_APPROVAL') {
      return res.status(400).json({ error: 'Expense is not in approval workflow' });
    }

    console.error('Process approval error:', error);
    return res.status(500).json({ error: 'Error processing approval' });
  } finally {
    await session.endSession();
  }
};

export const getAllApprovals = async (req, res) => {
  try {
    const approvals = await Approval.find({ approver: req.userId })
      .populate({
        path: 'expense',
        populate: {
          path: 'employee',
          select: 'name email'
        }
      })
      .sort({ createdAt: -1 });

    res.json({ approvals });
  } catch (error) {
    console.error('Get all approvals error:', error);
    res.status(500).json({ error: 'Error fetching approvals' });
  }
};