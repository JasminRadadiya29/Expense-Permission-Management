import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { BarChart3, CalendarDays, RefreshCw, TrendingUp, Clock3, AlertCircle } from 'lucide-react';
import api, { getApiErrorMessage } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { formatCurrencyAmount, formatNumber, getCompanyBaseCurrency } from '../services/currency';

const createDateRange = () => {
  const end = new Date();
  const start = new Date();
  start.setDate(end.getDate() - 30);

  const toInput = (date) => date.toISOString().slice(0, 10);

  return {
    startDate: toInput(start),
    endDate: toInput(end),
  };
};

const formatPercent = (value) => `${(Number(value) || 0).toFixed(1)}%`;

export default function Reports() {
  const { user } = useAuth();
  const baseCurrency = getCompanyBaseCurrency(user);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [dateRange, setDateRange] = useState(createDateRange);

  const [expenseSummary, setExpenseSummary] = useState({
    grandTotals: { totalCount: 0, totalAmount: 0 },
    byStatus: [],
    byCategory: [],
    byEmployee: [],
  });

  const [approvalMetrics, setApprovalMetrics] = useState({
    approvalStatus: [],
    approverPerformance: [],
    timeMetrics: { avgApprovalTime: 0, minApprovalTime: 0, maxApprovalTime: 0 },
  });

  const [budgetAnalysis, setBudgetAnalysis] = useState({
    byEmployee: [],
    byCategory: [],
    budgetMetrics: { totalApprovedAmount: 0, totalExpenses: 0, avgExpenseValue: 0 },
  });

  const companyId = useMemo(() => {
    if (!user?.company) return null;
    if (typeof user.company === 'string') return user.company;
    return user.company._id || null;
  }, [user]);

  const fetchReports = useCallback(async () => {
    if (!companyId) {
      setError('Company context missing for this user.');
      setLoading(false);
      return;
    }

    setLoading(true);
    setError('');

    const payload = {
      companyId,
      startDate: dateRange.startDate,
      endDate: dateRange.endDate,
    };

    try {
      const [summaryResponse, approvalResponse, budgetResponse] = await Promise.all([
        api.post('/reports', { ...payload, reportType: 'expense-summary' }),
        api.post('/reports', { ...payload, reportType: 'approval-metrics' }),
        api.post('/reports', { ...payload, reportType: 'budget-analysis' }),
      ]);

      setExpenseSummary(summaryResponse.data?.data || {
        grandTotals: { totalCount: 0, totalAmount: 0 },
        byStatus: [],
        byCategory: [],
        byEmployee: [],
      });

      setApprovalMetrics(approvalResponse.data?.data || {
        approvalStatus: [],
        approverPerformance: [],
        timeMetrics: { avgApprovalTime: 0, minApprovalTime: 0, maxApprovalTime: 0 },
      });

      setBudgetAnalysis(budgetResponse.data?.data || {
        byEmployee: [],
        byCategory: [],
        budgetMetrics: { totalApprovedAmount: 0, totalExpenses: 0, avgExpenseValue: 0 },
      });
    } catch (requestError) {
      setError(getApiErrorMessage(requestError, 'Failed to load reports'));
    } finally {
      setLoading(false);
    }
  }, [companyId, dateRange.endDate, dateRange.startDate]);

  useEffect(() => {
    fetchReports();
  }, [fetchReports]);

  const approvalStatusMap = useMemo(() => {
    return approvalMetrics.approvalStatus.reduce((acc, item) => {
      acc[item._id || 'Unknown'] = item.count || 0;
      return acc;
    }, {});
  }, [approvalMetrics.approvalStatus]);

  return (
    <div className="min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-4">
          <div>
            <h1 className="text-4xl font-bold text-white mb-1">Reports Center</h1>
            <p className="text-slate-400 text-lg">Expense summary, approvals, and budget insights</p>
          </div>

          <div className="bg-white/5 border border-white/10 rounded-2xl p-4 flex flex-col sm:flex-row gap-3">
            <label className="text-sm text-slate-300 flex flex-col gap-1">
              <span className="inline-flex items-center gap-1.5">
                <CalendarDays size={14} />
                Start
              </span>
              <input
                type="date"
                value={dateRange.startDate}
                onChange={(event) => setDateRange((prev) => ({ ...prev, startDate: event.target.value }))}
                className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white"
              />
            </label>

            <label className="text-sm text-slate-300 flex flex-col gap-1">
              <span className="inline-flex items-center gap-1.5">
                <CalendarDays size={14} />
                End
              </span>
              <input
                type="date"
                value={dateRange.endDate}
                onChange={(event) => setDateRange((prev) => ({ ...prev, endDate: event.target.value }))}
                className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white"
              />
            </label>

            <button
              type="button"
              onClick={fetchReports}
              className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold transition-all mt-5 sm:mt-0"
            >
              <RefreshCw size={16} />
              Refresh
            </button>
          </div>
        </div>

        {error && (
          <div className="p-4 rounded-xl border border-red-500/30 bg-red-500/10 text-red-200 text-sm font-medium inline-flex items-center gap-2">
            <AlertCircle size={16} />
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5">
          <div className="bg-white/5 border border-white/10 rounded-2xl p-5">
            <p className="text-xs uppercase tracking-wider text-slate-400 font-bold">Total Expenses</p>
            <p className="text-3xl font-bold text-white mt-1">{loading ? '...' : formatNumber(expenseSummary.grandTotals?.totalCount)}</p>
          </div>
          <div className="bg-white/5 border border-white/10 rounded-2xl p-5">
            <p className="text-xs uppercase tracking-wider text-slate-400 font-bold">Total Amount</p>
            <p className="text-3xl font-bold text-white mt-1">{loading ? '...' : formatCurrencyAmount(expenseSummary.grandTotals?.totalAmount, baseCurrency)}</p>
          </div>
          <div className="bg-white/5 border border-white/10 rounded-2xl p-5">
            <p className="text-xs uppercase tracking-wider text-slate-400 font-bold">Approved Amount</p>
            <p className="text-3xl font-bold text-white mt-1">{loading ? '...' : formatCurrencyAmount(budgetAnalysis.budgetMetrics?.totalApprovedAmount, baseCurrency)}</p>
          </div>
          <div className="bg-white/5 border border-white/10 rounded-2xl p-5">
            <p className="text-xs uppercase tracking-wider text-slate-400 font-bold">Avg Approval Time</p>
            <p className="text-3xl font-bold text-white mt-1">{loading ? '...' : `${Number(approvalMetrics.timeMetrics?.avgApprovalTime || 0).toFixed(2)} days`}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          <section className="bg-white/5 border border-white/10 rounded-2xl p-5">
            <h2 className="text-xl font-bold text-white inline-flex items-center gap-2 mb-4">
              <BarChart3 size={18} className="text-blue-400" />
              Expense Summary by Status
            </h2>
            <div className="space-y-3">
              {!loading && expenseSummary.byStatus.length === 0 && (
                <p className="text-slate-400 text-sm">No status data for this period.</p>
              )}
              {expenseSummary.byStatus.map((row) => (
                <div key={row._id || 'Unknown'} className="grid grid-cols-3 gap-2 text-sm bg-white/5 border border-white/5 rounded-lg px-3 py-2">
                  <span className="text-slate-200 font-semibold">{row._id || 'Unknown'}</span>
                  <span className="text-slate-300 text-right">{formatNumber(row.count)}</span>
                  <span className="text-slate-300 text-right">{formatCurrencyAmount(row.totalAmount, baseCurrency)}</span>
                </div>
              ))}
            </div>
          </section>

          <section className="bg-white/5 border border-white/10 rounded-2xl p-5">
            <h2 className="text-xl font-bold text-white inline-flex items-center gap-2 mb-4">
              <TrendingUp size={18} className="text-emerald-400" />
              Top Categories by Spend
            </h2>
            <div className="space-y-3">
              {!loading && budgetAnalysis.byCategory.length === 0 && (
                <p className="text-slate-400 text-sm">No category spend data for this period.</p>
              )}
              {budgetAnalysis.byCategory.slice(0, 8).map((row) => (
                <div key={row._id || 'Uncategorized'} className="grid grid-cols-3 gap-2 text-sm bg-white/5 border border-white/5 rounded-lg px-3 py-2">
                  <span className="text-slate-200 font-semibold truncate">{row._id || 'Uncategorized'}</span>
                  <span className="text-slate-300 text-right">{formatNumber(row.count)}</span>
                  <span className="text-slate-300 text-right">{formatCurrencyAmount(row.totalSpent || row.totalAmount, baseCurrency)}</span>
                </div>
              ))}
            </div>
          </section>

          <section className="bg-white/5 border border-white/10 rounded-2xl p-5">
            <h2 className="text-xl font-bold text-white inline-flex items-center gap-2 mb-4">
              <Clock3 size={18} className="text-violet-400" />
              Approver Performance
            </h2>
            <div className="space-y-3">
              {!loading && approvalMetrics.approverPerformance.length === 0 && (
                <p className="text-slate-400 text-sm">No approver activity in this period.</p>
              )}
              {approvalMetrics.approverPerformance.map((row) => (
                <div key={row.approverId || 'unknown'} className="grid grid-cols-4 gap-2 text-sm bg-white/5 border border-white/5 rounded-lg px-3 py-2">
                  <span className="text-slate-200 font-semibold truncate">{row.approverName || 'Unknown'}</span>
                  <span className="text-emerald-300 text-right">{formatNumber(row.approved)}</span>
                  <span className="text-red-300 text-right">{formatNumber(row.rejected)}</span>
                  <span className="text-slate-300 text-right">{formatPercent(row.approvalRate)}</span>
                </div>
              ))}
            </div>
          </section>

          <section className="bg-white/5 border border-white/10 rounded-2xl p-5">
            <h2 className="text-xl font-bold text-white inline-flex items-center gap-2 mb-4">
              <BarChart3 size={18} className="text-amber-400" />
              Approval Status Distribution
            </h2>
            <div className="space-y-3">
              {!loading && Object.keys(approvalStatusMap).length === 0 && (
                <p className="text-slate-400 text-sm">No approval status data in this period.</p>
              )}
              {Object.entries(approvalStatusMap).map(([status, count]) => (
                <div key={status} className="flex items-center justify-between text-sm bg-white/5 border border-white/5 rounded-lg px-3 py-2">
                  <span className="text-slate-200 font-semibold">{status}</span>
                  <span className="text-slate-300">{formatNumber(count)}</span>
                </div>
              ))}
            </div>
          </section>
        </div>

        <section className="bg-white/5 border border-white/10 rounded-2xl p-5">
          <h2 className="text-xl font-bold text-white mb-4">Spend by Employee</h2>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[680px]">
              <thead>
                <tr className="text-left border-b border-white/10">
                  <th className="py-3 px-2 text-xs font-bold tracking-wider text-slate-400 uppercase">Employee</th>
                  <th className="py-3 px-2 text-xs font-bold tracking-wider text-slate-400 uppercase text-right">Expenses</th>
                  <th className="py-3 px-2 text-xs font-bold tracking-wider text-slate-400 uppercase text-right">Total Spent</th>
                </tr>
              </thead>
              <tbody>
                {!loading && budgetAnalysis.byEmployee.length === 0 && (
                  <tr>
                    <td colSpan={3} className="py-8 text-center text-slate-400">No employee spend data for this period.</td>
                  </tr>
                )}
                {budgetAnalysis.byEmployee.slice(0, 12).map((row) => (
                  <tr key={row.employeeId || row.employeeName} className="border-b border-white/5 hover:bg-white/5">
                    <td className="py-3 px-2 text-slate-200 font-medium">{row.employeeName || 'Unknown'}</td>
                    <td className="py-3 px-2 text-slate-300 text-right">{formatNumber(row.count)}</td>
                    <td className="py-3 px-2 text-slate-300 text-right">{formatCurrencyAmount(row.totalSpent, baseCurrency)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </div>
  );
}
