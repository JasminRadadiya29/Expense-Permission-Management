import { executeController } from '../../../lib/routeHandler.js';
import { getExpenseSummary, getApprovalMetrics, getBudgetAnalysis, getAuditTrail } from '../../../server/controllers/reportingController.js';

export async function POST(request) {
  return executeController(request, getReportData, { roles: ['Admin'] });
}

const getReportData = async (req, res) => {
  try {
    const { reportType } = req.body || {};
    
    switch (reportType) {
      case 'expense-summary':
        return await getExpenseSummary(req, res);
      case 'approval-metrics':
        return await getApprovalMetrics(req, res);
      case 'budget-analysis':
        return await getBudgetAnalysis(req, res);
      case 'audit-trail':
        return await getAuditTrail(req, res);
      default:
        res.status(400).json({ error: 'Invalid report type. Supported: expense-summary, approval-metrics, budget-analysis, audit-trail' });
    }
  } catch (error) {
    console.error('Report generation error:', error);
    res.status(500).json({ error: 'Error generating report' });
  }
};
