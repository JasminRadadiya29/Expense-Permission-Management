import Expense from '../models/Expense.js';
import Approval from '../models/Approval.js';
import User from '../models/User.js';
import { logAuditAction } from '../utils/auditLog.js';

/**
 * Get expense summary report
 * Includes: total count, total amount, breakdown by status/category
 */
export const getExpenseSummary = async (req, res) => {
  try {
    const { companyId, userId, startDate, endDate } = req.body;

    const query = { company: companyId };
    if (startDate || endDate) {
      query.date = {};
      if (startDate) query.date.$gte = new Date(startDate);
      if (endDate) query.date.$lte = new Date(endDate);
    }

    // Summary by status
    const statusSummary = await Expense.aggregate([
      { $match: query },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
          totalAmount: { $sum: '$amountInBaseCurrency' },
          avgAmount: { $avg: '$amountInBaseCurrency' }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    // Summary by category
    const categorySummary = await Expense.aggregate([
      { $match: query },
      {
        $group: {
          _id: '$category',
          count: { $sum: 1 },
          totalAmount: { $sum: '$amountInBaseCurrency' }
        }
      },
      { $sort: { totalAmount: -1 } }
    ]);

    // Summary by employee
    const employeeSummary = await Expense.aggregate([
      { $match: query },
      {
        $group: {
          _id: '$employee',
          count: { $sum: 1 },
          totalAmount: { $sum: '$amountInBaseCurrency' }
        }
      },
      { $lookup: { from: 'users', localField: '_id', foreignField: '_id', as: 'employeeDetails' } },
      { $unwind: { path: '$employeeDetails', preserveNullAndEmptyArrays: true } },
      {
        $project: {
          employeeId: '$_id',
          employeeName: '$employeeDetails.name',
          count: 1,
          totalAmount: 1,
          _id: 0
        }
      },
      { $sort: { totalAmount: -1 } }
    ]);

    // Grand totals
    const grandTotals = await Expense.aggregate([
      { $match: query },
      {
        $group: {
          _id: null,
          totalCount: { $sum: 1 },
          totalAmount: { $sum: '$amountInBaseCurrency' }
        }
      }
    ]);

    res.json({
      message: 'Expense summary retrieved',
      data: {
        grandTotals: grandTotals[0] || { totalCount: 0, totalAmount: 0 },
        byStatus: statusSummary,
        byCategory: categorySummary,
        byEmployee: employeeSummary
      }
    });
  } catch (error) {
    console.error('Error fetching expense summary:', error);
    res.status(500).json({ error: 'Failed to fetch expense summary', details: error.message });
  }
};

/**
 * Get approval metrics report
 * Includes: approval/rejection rates, average approval time, approval patterns
 */
export const getApprovalMetrics = async (req, res) => {
  try {
    const { companyId, userId, startDate, endDate } = req.body;

    const dateQuery = {};
    if (startDate || endDate) {
      dateQuery.createdAt = {};
      if (startDate) dateQuery.createdAt.$gte = new Date(startDate);
      if (endDate) dateQuery.createdAt.$lte = new Date(endDate);
    }

    // Get expenses for company
    const expenses = await Expense.find({ company: companyId }).select('_id');
    const expenseIds = expenses.map(e => e._id);

    // Approval status breakdown
    const approvalStats = await Approval.aggregate([
      {
        $match: {
          expense: { $in: expenseIds },
          ...dateQuery
        }
      },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    // Approval rate by approver
    const approverStats = await Approval.aggregate([
      {
        $match: {
          expense: { $in: expenseIds },
          status: { $in: ['Approved', 'Rejected'] }
        }
      },
      {
        $group: {
          _id: '$approver',
          approved: {
            $sum: { $cond: [{ $eq: ['$status', 'Approved'] }, 1, 0] }
          },
          rejected: {
            $sum: { $cond: [{ $eq: ['$status', 'Rejected'] }, 1, 0] }
          },
          total: { $sum: 1 }
        }
      },
      { $lookup: { from: 'users', localField: '_id', foreignField: '_id', as: 'approverDetails' } },
      { $unwind: { path: '$approverDetails', preserveNullAndEmptyArrays: true } },
      {
        $project: {
          _id: 1,
          approverId: '$_id',
          approverName: '$approverDetails.name',
          approved: 1,
          rejected: 1,
          total: 1,
          approvalRate: {
            $cond: [
              { $gt: ['$total', 0] },
              { $multiply: [{ $divide: ['$approved', '$total'] }, 100] },
              0
            ]
          }
        }
      },
      { $sort: { total: -1 } }
    ]);

    // Average approval time (in days)
    const timeStats = await Expense.aggregate([
      { $match: { company: companyId } },
      {
        $addFields: {
          approvalTime: {
            $cond: [
              { $and: [{ $ne: ['$submittedAt', null] }, { $ne: ['$approvedAt', null] }] },
              { $divide: [{ $subtract: ['$approvedAt', '$submittedAt'] }, 1000 * 60 * 60 * 24] },
              null
            ]
          }
        }
      },
      { $match: { approvalTime: { $ne: null } } },
      {
        $group: {
          _id: null,
          avgApprovalTime: { $avg: '$approvalTime' },
          minApprovalTime: { $min: '$approvalTime' },
          maxApprovalTime: { $max: '$approvalTime' }
        }
      }
    ]);

    res.json({
      message: 'Approval metrics retrieved',
      data: {
        approvalStatus: approvalStats,
        approverPerformance: approverStats,
        timeMetrics: timeStats[0] || { avgApprovalTime: 0, minApprovalTime: 0, maxApprovalTime: 0 }
      }
    });
  } catch (error) {
    console.error('Error fetching approval metrics:', error);
    res.status(500).json({ error: 'Failed to fetch approval metrics', details: error.message });
  }
};

/**
 * Get budget analysis report
 * Includes: budget vs. actual, budget utilization by department/employee/category
 */
export const getBudgetAnalysis = async (req, res) => {
  try {
    const { companyId, userId, startDate, endDate } = req.body;

    const query = { company: companyId, status: 'Approved' };
    if (startDate || endDate) {
      query.date = {};
      if (startDate) query.date.$gte = new Date(startDate);
      if (endDate) query.date.$lte = new Date(endDate);
    }

    // Get employees by department (mock departments from company)
    const employees = await User.find({ company: companyId, isActive: true }).select('_id name department');

    // Budget by employee (mock: could come from a Budget model if it exists)
    const spendByEmployee = await Expense.aggregate([
      { $match: query },
      {
        $group: {
          _id: '$employee',
          totalSpent: { $sum: '$amountInBaseCurrency' },
          count: { $sum: 1 }
        }
      },
      { $lookup: { from: 'users', localField: '_id', foreignField: '_id', as: 'employeeDetails' } },
      { $unwind: { path: '$employeeDetails', preserveNullAndEmptyArrays: true } },
      {
        $project: {
          employeeId: '$_id',
          employeeName: '$employeeDetails.name',
          totalSpent: 1,
          count: 1,
          _id: 0
        }
      },
      { $sort: { totalSpent: -1 } }
    ]);

    // Budget by category
    const spendByCategory = await Expense.aggregate([
      { $match: query },
      {
        $group: {
          _id: '$category',
          totalSpent: { $sum: '$amountInBaseCurrency' },
          count: { $sum: 1 }
        }
      },
      { $sort: { totalSpent: -1 } }
    ]);

    // Total budget metrics
    const budgetMetrics = await Expense.aggregate([
      { $match: query },
      {
        $group: {
          _id: null,
          totalApprovedAmount: { $sum: '$amountInBaseCurrency' },
          totalExpenses: { $sum: 1 },
          avgExpenseValue: { $avg: '$amountInBaseCurrency' }
        }
      }
    ]);

    res.json({
      message: 'Budget analysis retrieved',
      data: {
        byEmployee: spendByEmployee,
        byCategory: spendByCategory,
        budgetMetrics: budgetMetrics[0] || { totalApprovedAmount: 0, totalExpenses: 0, avgExpenseValue: 0 }
      }
    });
  } catch (error) {
    console.error('Error fetching budget analysis:', error);
    res.status(500).json({ error: 'Failed to fetch budget analysis', details: error.message });
  }
};

/**
 * Get audit trail for compliance/auditing
 */
export const getAuditTrail = async (req, res) => {
  try {
    const { userId, limit = 100, skip = 0 } = req.body || {};
    const { getAuditLogs } = await import('../utils/auditLog.js');

    const query = {
      company: req.companyId,
    };

    if (userId) {
      query.user = userId;
    }

    const parsedLimit = Number.isFinite(Number(limit)) ? Number(limit) : 100;
    const parsedSkip = Number.isFinite(Number(skip)) ? Number(skip) : 0;

    const auditLogs = await getAuditLogs(query, parsedLimit, parsedSkip);

    res.json({
      message: 'Audit trail retrieved',
      data: auditLogs
    });
  } catch (error) {
    console.error('Error fetching audit trail:', error);
    res.status(500).json({ error: 'Failed to fetch audit trail', details: error.message });
  }
};
