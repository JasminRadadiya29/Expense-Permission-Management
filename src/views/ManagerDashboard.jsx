import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { useToast } from '../components/Toast.jsx';
import StatCard from '../components/StatCard.jsx';
import { Check, X, DollarSign, Clock, CheckCircle, FileText, User, Calendar, CreditCard, MessageSquare, TrendingUp } from 'lucide-react';

const ManagerDashboard = () => {
  const [approvals, setApprovals] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedApproval, setSelectedApproval] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [comments, setComments] = useState('');
  const toast = useToast();

  useEffect(() => {
    fetchApprovals();
  }, []);

  const fetchApprovals = async () => {
    try {
      const response = await api.get('/approvals/pending');
      setApprovals(response.data.approvals);
    } catch (err) {
      console.error('Error fetching approvals:', err);
    }
  };

  const handleApproval = async (approvalId, status) => {
    setLoading(true);
    try {
      await api.post(`/approvals/${approvalId}/process`, { status, comments });
      setShowModal(false);
      setSelectedApproval(null);
      setComments('');
      fetchApprovals();
      toast.success(`Expense ${status.toLowerCase()} successfully!`);
    } catch (err) {
      toast.error(err.response?.data?.error || 'Error processing approval');
    } finally {
      setLoading(false);
    }
  };

  const openApprovalModal = (approval) => {
    setSelectedApproval(approval);
    setShowModal(true);
  };

  const getCategoryColor = (category) => {
    const colors = {
      'Travel': 'bg-blue-500/20 text-blue-300 border-blue-500/30',
      'Food': 'bg-orange-500/20 text-orange-300 border-orange-500/30',
      'Office Supplies': 'bg-purple-500/20 text-purple-300 border-purple-500/30',
      'Software': 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30',
      'Hardware': 'bg-slate-500/20 text-slate-300 border-slate-500/30',
      'Marketing': 'bg-pink-500/20 text-pink-300 border-pink-500/30',
      'Other': 'bg-slate-500/20 text-slate-300 border-slate-500/30'
    };
    return colors[category] || colors['Other'];
  };

  const totalAmount = approvals.reduce((sum, a) => sum + (a.expense?.amount || 0), 0);

  return (
    <div className="min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-1">
            Pending Approvals
          </h1>
          <p className="text-slate-400 text-lg">Review and approve expense requests from your team</p>
        </div>

        {/* Stat Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <StatCard
            title="Pending Approvals"
            value={approvals.length}
            subtitle={<span className="text-amber-400">Awaiting review</span>}
            icon={<Clock className="w-7 h-7 text-white" />}
            iconBg="from-amber-500 to-orange-600"
          />
          <StatCard
            title="Approved Today"
            value={approvals.filter(a => a.status === 'Approved').length}
            subtitle={<span className="text-emerald-400 flex items-center gap-1"><TrendingUp className="w-3.5 h-3.5" />Processed</span>}
            icon={<CheckCircle className="w-7 h-7 text-white" />}
            iconBg="from-emerald-500 to-teal-600"
          />
          <StatCard
            title="Total Amount"
            value={`$${totalAmount.toFixed(2)}`}
            subtitle={<span className="text-blue-400">Pending value</span>}
            icon={<DollarSign className="w-7 h-7 text-white" />}
            iconBg="from-blue-500 to-indigo-600"
          />
        </div>

        {/* Approvals Table */}
        <div className="bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/10 bg-white/5">
                  <th className="px-6 py-4 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">Employee</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">Description</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">Category</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">Amount</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {approvals.map((approval) => (
                  <tr key={approval._id} className="hover:bg-white/5 transition-colors duration-150 group">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        <div className="w-11 h-11 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center text-white font-bold text-base shadow-md shadow-blue-500/20">
                          {approval.expense.employee.name.charAt(0)}
                        </div>
                        <span className="text-sm font-semibold text-white">
                          {approval.expense.employee.name}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <FileText className="w-4 h-4 text-slate-500 flex-shrink-0" />
                        <span className="text-sm font-medium text-slate-200">{approval.expense.description}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-3 py-1.5 text-xs font-bold rounded-lg border ${getCategoryColor(approval.expense.category)}`}>
                        {approval.expense.category}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-white">
                      {approval.expense.amount.toFixed(2)} {approval.expense.currency}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg border bg-amber-500/15 text-amber-300 border-amber-500/30">
                        <Clock className="w-3.5 h-3.5" />
                        {approval.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {approval.status === 'Pending' && (
                        <div className="flex gap-2">
                          <button
                            onClick={() => openApprovalModal(approval)}
                            className="group/btn flex items-center gap-1.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white px-3.5 py-2 rounded-lg font-bold text-sm transition-all duration-200 shadow-md shadow-emerald-500/20 hover:shadow-emerald-500/30 hover:scale-105"
                          >
                            <Check size={15} className="group-hover/btn:scale-110 transition-transform" />
                            Approve
                          </button>
                          <button
                            onClick={() => {
                              setSelectedApproval(approval);
                              setShowModal(true);
                            }}
                            className="group/btn flex items-center gap-1.5 bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white px-3.5 py-2 rounded-lg font-bold text-sm transition-all duration-200 shadow-md shadow-red-500/20 hover:shadow-red-500/30 hover:scale-105"
                          >
                            <X size={15} className="group-hover/btn:scale-110 transition-transform" />
                            Reject
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
                {approvals.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-6 py-16">
                      <div className="flex flex-col items-center gap-4 text-center">
                        <div className="p-5 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl">
                          <CheckCircle className="w-12 h-12 text-emerald-400" />
                        </div>
                        <div>
                          <p className="text-lg font-bold text-white mb-1">No pending approvals</p>
                          <p className="text-slate-400">All caught up! New requests will appear here.</p>
                        </div>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Approval Review Modal */}
      {showModal && selectedApproval && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-slate-900 border border-white/10 rounded-3xl max-w-lg w-full shadow-2xl shadow-black/50 max-h-[90vh] overflow-y-auto">
            <div className="p-8 border-b border-white/10">
              <h2 className="text-3xl font-bold text-white mb-1">Review Expense</h2>
              <p className="text-slate-400">Review the details and make your decision</p>
            </div>

            <div className="p-8">
              <div className="space-y-4 mb-6">
                {/* Employee info */}
                <div className="flex items-center gap-4 p-4 bg-white/5 rounded-xl border border-white/10">
                  <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center text-white font-bold text-lg shadow-md">
                    {selectedApproval.expense.employee.name.charAt(0)}
                  </div>
                  <div>
                    <p className="text-base font-bold text-white">{selectedApproval.expense.employee.name}</p>
                    <div className="flex items-center gap-1.5 text-sm text-slate-400">
                      <User className="w-3.5 h-3.5" />
                      <span>Employee</span>
                    </div>
                  </div>
                </div>

                {/* Details grid */}
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { icon: <FileText className="w-4 h-4 text-slate-400" />, label: 'Description', value: selectedApproval.expense.description },
                    { icon: <DollarSign className="w-4 h-4 text-slate-400" />, label: 'Amount', value: `$${selectedApproval.expense.amount.toFixed(2)} ${selectedApproval.expense.currency}`, bold: true },
                    { icon: <Calendar className="w-4 h-4 text-slate-400" />, label: 'Category', value: selectedApproval.expense.category },
                    { icon: <CreditCard className="w-4 h-4 text-slate-400" />, label: 'Paid By', value: selectedApproval.expense.paidBy },
                  ].map((item, i) => (
                    <div key={i} className="p-4 bg-white/5 rounded-xl border border-white/10">
                      <div className="flex items-center gap-2 mb-2">
                        {item.icon}
                        <span className="text-xs font-bold text-slate-400 uppercase tracking-wide">{item.label}</span>
                      </div>
                      <p className={`text-sm text-white ${item.bold ? 'font-bold' : 'font-semibold'}`}>{item.value}</p>
                    </div>
                  ))}
                </div>

                {/* Remarks */}
                {selectedApproval.expense.remarks && (
                  <div className="p-4 bg-blue-500/10 rounded-xl border border-blue-500/20">
                    <div className="flex items-center gap-2 mb-2">
                      <MessageSquare className="w-4 h-4 text-blue-400" />
                      <span className="text-xs font-bold text-blue-400 uppercase tracking-wide">Employee Remarks</span>
                    </div>
                    <p className="text-sm text-slate-200 font-medium">{selectedApproval.expense.remarks}</p>
                  </div>
                )}
              </div>

              {/* Comments */}
              <div className="mb-6">
                <label className="block text-sm font-bold text-slate-300 mb-2 flex items-center gap-2">
                  <MessageSquare className="w-4 h-4 text-slate-400" />
                  Comments (Optional)
                </label>
                <textarea
                  value={comments}
                  onChange={(e) => setComments(e.target.value)}
                  rows={3}
                  className="w-full px-4 py-3.5 bg-white/5 border border-white/15 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none font-medium text-white placeholder-slate-500"
                  placeholder="Add comments for the employee..."
                />
              </div>

              {/* Action buttons */}
              <div className="flex flex-col sm:flex-row gap-3 pt-6 border-t border-white/10">
                <button
                  onClick={() => handleApproval(selectedApproval._id, 'Approved')}
                  disabled={loading}
                  className="flex-1 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white py-3.5 px-6 rounded-xl font-bold transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/30 hover:scale-105 flex items-center justify-center gap-2"
                >
                  <Check size={18} />
                  {loading ? 'Processing...' : 'Approve'}
                </button>
                <button
                  onClick={() => handleApproval(selectedApproval._id, 'Rejected')}
                  disabled={loading}
                  className="flex-1 bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white py-3.5 px-6 rounded-xl font-bold transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-red-500/20 hover:shadow-red-500/30 hover:scale-105 flex items-center justify-center gap-2"
                >
                  <X size={18} />
                  {loading ? 'Processing...' : 'Reject'}
                </button>
                <button
                  onClick={() => { setShowModal(false); setSelectedApproval(null); setComments(''); }}
                  className="px-6 py-3.5 border border-white/20 text-slate-300 hover:text-white hover:border-white/40 hover:bg-white/5 rounded-xl font-bold transition-all"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManagerDashboard;