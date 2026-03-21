import Approval from '../models/Approval.js';
import Expense from '../models/Expense.js';
import ApprovalRule from '../models/ApprovalRule.js';

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
  try {
    const { approvalId } = req.params;
    const { status, comments } = req.body;

    const approval = await Approval.findOne({
      _id: approvalId,
      approver: req.userId
    }).populate('expense');

    if (!approval) {
      return res.status(404).json({ error: 'Approval not found' });
    }

    if (approval.status !== 'Pending') {
      return res.status(400).json({ error: 'Approval already processed' });
    }

    approval.status = status;
    approval.comments = comments || '';
    approval.approvedAt = new Date();
    await approval.save();

    const expense = await Expense.findById(approval.expense._id);

    if (status === 'Rejected') {
      expense.status = 'Rejected';
      await expense.save();
      return res.json({ approval, expense });
    }

    const currentStepApprovals = await Approval.find({
      expense: expense._id,
      step: approval.step
    });

    const approvalRule = await ApprovalRule.findOne({
      company: expense.company,
      isActive: true
    });

    let stepCompleted = false;

    if (approvalRule && approvalRule.steps.length > 0) {
      const currentStepRule = approvalRule.steps.find(s => s.stepNumber === approval.step);

      if (currentStepRule) {
        if (currentStepRule.approvalType === 'specific' && currentStepRule.specificApprovers.length > 0) {
          const hasSpecificApproval = currentStepApprovals.some(
            a => a.status === 'Approved' &&
            currentStepRule.specificApprovers.some(sa => sa.toString() === a.approver.toString())
          );
          stepCompleted = hasSpecificApproval;
        } else if (currentStepRule.approvalType === 'percentage') {
          const approvedCount = currentStepApprovals.filter(a => a.status === 'Approved').length;
          const totalCount = currentStepApprovals.length;
          const approvalPercentage = (approvedCount / totalCount) * 100;
          stepCompleted = approvalPercentage >= (currentStepRule.requiredPercentage || 100);
        } else if (currentStepRule.approvalType === 'hybrid') {
          const hasSpecificApproval = currentStepRule.specificApprovers.length > 0 &&
            currentStepApprovals.some(
              a => a.status === 'Approved' &&
              currentStepRule.specificApprovers.some(sa => sa.toString() === a.approver.toString())
            );

          const approvedCount = currentStepApprovals.filter(a => a.status === 'Approved').length;
          const totalCount = currentStepApprovals.length;
          const approvalPercentage = (approvedCount / totalCount) * 100;
          const meetsPercentage = approvalPercentage >= (currentStepRule.requiredPercentage || 100);

          stepCompleted = hasSpecificApproval || meetsPercentage;
        } else {
          stepCompleted = currentStepApprovals.every(a => a.status === 'Approved');
        }
      } else {
        stepCompleted = currentStepApprovals.every(a => a.status === 'Approved');
      }
    } else {
      stepCompleted = currentStepApprovals.every(a => a.status === 'Approved');
    }

    if (stepCompleted) {
      const nextStep = approval.step + 1;
      const nextStepRule = approvalRule?.steps.find(s => s.stepNumber === nextStep);

      if (nextStepRule && nextStepRule.approvers.length > 0) {
        for (const approverId of nextStepRule.approvers) {
          await Approval.create({
            expense: expense._id,
            approver: approverId,
            step: nextStep,
            status: 'Pending'
          });
        }
        expense.currentApprovalStep = nextStep;
        await expense.save();
      } else {
        expense.status = 'Approved';
        await expense.save();
      }
    }

    const updatedApproval = await Approval.findById(approval._id)
      .populate({
        path: 'expense',
        populate: {
          path: 'employee',
          select: 'name email'
        }
      });

    res.json({ approval: updatedApproval, expense });
  } catch (error) {
    console.error('Process approval error:', error);
    res.status(500).json({ error: 'Error processing approval' });
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