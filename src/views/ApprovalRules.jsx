import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Settings, CheckSquare, Users, X, AlertCircle } from 'lucide-react';
import api from '../services/api';
import { useToast } from '../components/Toast.jsx';
import SelectField from '../components/SelectField.jsx';

const ApprovalRules = () => {
  const [rules, setRules] = useState([]);
  const [managers, setManagers] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const toast = useToast();
  const [formData, setFormData] = useState({
    name: '',
    steps: [{
      stepNumber: 1,
      approvers: [],
      approvalType: 'all',
      requiredPercentage: 100,
      specificApprovers: []
    }]
  });

  useEffect(() => {
    fetchRules();
    fetchManagers();
  }, []);

  const fetchRules = async () => {
    try {
      const response = await api.get('/approval-rules');
      setRules(response.data.rules);
    } catch (err) {
      console.error('Error fetching rules:', err);
    }
  };

  const fetchManagers = async () => {
    try {
      const response = await api.get('/users/managers');
      setManagers(response.data.managers);
    } catch (err) {
      console.error('Error fetching managers:', err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await api.post('/approval-rules', formData);
      setShowModal(false);
      setFormData({
        name: '',
        steps: [{
          stepNumber: 1,
          approvers: [],
          approvalType: 'all',
          requiredPercentage: 100,
          specificApprovers: []
        }]
      });
      fetchRules();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Error creating approval rule');
    } finally {
      setLoading(false);
    }
  };

  const addStep = () => {
    setFormData({
      ...formData,
      steps: [
        ...formData.steps,
        {
          stepNumber: formData.steps.length + 1,
          approvers: [],
          approvalType: 'all',
          requiredPercentage: 100,
          specificApprovers: []
        }
      ]
    });
  };

  const removeStep = (index) => {
    const newSteps = formData.steps.filter((_, i) => i !== index);
    setFormData({ ...formData, steps: newSteps });
  };

  const updateStep = (index, field, value) => {
    const newSteps = [...formData.steps];
    newSteps[index][field] = value;
    setFormData({ ...formData, steps: newSteps });
  };

  const deleteRule = async (ruleId) => {
    // Use a simple in-place confirmation via toast instead of browser confirm
    toast.warning('To confirm deletion, click Delete again within 5 seconds.');
    if (window._deleteConfirm === ruleId) {
      clearTimeout(window._deleteTimer);
      window._deleteConfirm = null;
      try {
        await api.delete(`/approval-rules/${ruleId}`);
        fetchRules();
        toast.success('Approval rule deleted.');
      } catch (err) {
        toast.error(err.response?.data?.error || 'Error deleting rule');
      }
      return;
    }
    window._deleteConfirm = ruleId;
    window._deleteTimer = setTimeout(() => { window._deleteConfirm = null; }, 5000);
  };

  const getApprovalTypeBadge = (type) => {
    const badges = {
      all: { bg: 'bg-blue-500/20', text: 'text-blue-300', border: 'border-blue-500/30', label: 'All Required' },
      percentage: { bg: 'bg-purple-500/20', text: 'text-purple-300', border: 'border-purple-500/30', label: 'Percentage' },
      specific: { bg: 'bg-emerald-500/20', text: 'text-emerald-300', border: 'border-emerald-500/30', label: 'Specific' },
      hybrid: { bg: 'bg-amber-500/20', text: 'text-amber-300', border: 'border-amber-500/30', label: 'Hybrid' }
    };
    return badges[type] || badges.all;
  };

  return (
    <div className="min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <div>
            <h1 className="text-4xl font-bold text-white mb-1">
              Approval Rules
            </h1>
            <p className="text-slate-400 text-lg">Configure multi-level and conditional approval workflows</p>
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="group bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-6 py-3.5 rounded-xl font-semibold transition-all duration-300 shadow-lg shadow-blue-500/30 hover:shadow-xl hover:shadow-blue-500/40 flex items-center gap-2 hover:scale-105"
          >
            <Plus size={20} className="group-hover:rotate-90 transition-transform duration-300" />
            Create Rule
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="group bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 p-6 transition-all duration-300 hover:-translate-y-1 hover:bg-white/8 hover:shadow-xl">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Total Rules</p>
                <p className="text-4xl font-bold text-white mb-3">{rules.length}</p>
                <div className="text-sm font-semibold text-slate-400">Configured workflows</div>
              </div>
              <div className="p-4 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl shadow-lg shadow-blue-500/20 group-hover:scale-110 transition-transform duration-300">
                <Settings className="w-7 h-7 text-white" />
              </div>
            </div>
          </div>

          <div className="group bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 p-6 transition-all duration-300 hover:-translate-y-1 hover:bg-white/8 hover:shadow-xl">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Active Rules</p>
                <p className="text-4xl font-bold text-white mb-3">{rules.filter(r => r.isActive).length}</p>
                <div className="text-sm font-semibold text-emerald-400">Currently in use</div>
              </div>
              <div className="p-4 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl shadow-lg shadow-emerald-500/20 group-hover:scale-110 transition-transform duration-300">
                <CheckSquare className="w-7 h-7 text-white" />
              </div>
            </div>
          </div>

          <div className="group bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 p-6 transition-all duration-300 hover:-translate-y-1 hover:bg-white/8 hover:shadow-xl">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Approvers</p>
                <p className="text-4xl font-bold text-white mb-3">{managers.length}</p>
                <div className="text-sm font-semibold text-blue-400">Available reviewers</div>
              </div>
              <div className="p-4 bg-gradient-to-br from-amber-500 to-orange-600 rounded-xl shadow-lg shadow-amber-500/20 group-hover:scale-110 transition-transform duration-300">
                <Users className="w-7 h-7 text-white" />
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-5">
          {rules.map((rule) => (
            <div key={rule._id} className="group bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 p-6 transition-all duration-300 hover:bg-white/8 hover:border-white/20">
              <div className="flex flex-col sm:flex-row justify-between items-start gap-4 mb-5">
                <div className="flex-1">
                  <h3 className="text-2xl font-bold text-white mb-3">{rule.name}</h3>
                  <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg border ${
                    rule.isActive
                      ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                      : 'bg-slate-500/20 text-slate-400 border-slate-500/30'
                  }`}>
                    <div className={`w-2 h-2 rounded-full ${rule.isActive ? 'bg-emerald-400' : 'bg-slate-500'}`}></div>
                    {rule.isActive ? 'Active' : 'Inactive'}
                  </span>
                </div>
                <button
                  onClick={() => deleteRule(rule._id)}
                  className="group/btn p-2.5 text-red-400 hover:bg-red-500/10 rounded-xl transition-all hover:scale-110 border border-transparent hover:border-red-500/30"
                  title="Delete rule"
                >
                  <Trash2 size={20} />
                </button>
              </div>

              <div className="space-y-4">
                {rule.steps.map((step) => {
                  const badge = getApprovalTypeBadge(step.approvalType);
                  return (
                    <div key={step.stepNumber} className="relative border-l-4 border-blue-500/50 pl-5 pr-4 py-4 bg-white/5 rounded-r-xl hover:border-blue-400 transition-colors">
                      <div className="absolute -left-4 top-4 w-7 h-7 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-md">
                        {step.stepNumber}
                      </div>
                      <div className="flex flex-wrap items-center gap-2 mb-3">
                        <span className="text-base font-bold text-white">Step {step.stepNumber}</span>
                        <span className={`px-3 py-1 text-xs font-bold rounded-lg border ${badge.bg} ${badge.text} ${badge.border}`}>
                          {badge.label}
                        </span>
                      </div>
                      {step.approvalType === 'percentage' && (
                        <div className="mb-2">
                          <span className="font-bold text-slate-300 text-sm">Required: </span>
                          <span className="px-2 py-0.5 bg-purple-500/20 text-purple-300 rounded-md font-bold text-xs border border-purple-500/30">{step.requiredPercentage}%</span>
                        </div>
                      )}
                      <div className="text-sm mb-2">
                        <span className="font-bold text-slate-300">Approvers: </span>
                        <span className="font-medium text-slate-400">{step.approvers.map((a) => a.name).join(', ')}</span>
                      </div>
                      {step.specificApprovers && step.specificApprovers.length > 0 && (
                        <div className="text-sm">
                          <span className="font-bold text-slate-300">Specific: </span>
                          <span className="font-medium text-slate-400">{step.specificApprovers.map((a) => a.name).join(', ')}</span>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}

          {rules.length === 0 && (
            <div className="bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 p-12 text-center">
              <Settings className="w-16 h-16 text-slate-600 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-white mb-2">No approval rules yet</h3>
              <p className="text-slate-400 mb-6">Create your first approval rule to get started</p>
              <button
                onClick={() => setShowModal(true)}
                className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-6 py-3 rounded-xl font-semibold transition-all shadow-lg shadow-blue-500/20 inline-flex items-center gap-2"
              >
                <Plus size={18} />
                Create Rule
              </button>
            </div>
          )}
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-slate-900 border border-white/10 rounded-3xl max-w-4xl w-full shadow-2xl shadow-black/50 my-8 max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-slate-900 border-b border-white/10 z-10 flex items-center justify-between p-8 rounded-t-3xl">
              <div>
                <h2 className="text-3xl font-bold text-white">Create Approval Rule</h2>
                <p className="text-slate-400 mt-1">Define multi-level approval workflow</p>
              </div>
              <button
                onClick={() => {
                  setShowModal(false);
                  setFormData({ name: '', steps: [{ stepNumber: 1, approvers: [], approvalType: 'all', requiredPercentage: 100, specificApprovers: [] }] });
                }}
                className="p-2 hover:bg-white/10 rounded-xl transition-colors"
              >
                <X size={24} className="text-slate-400" />
              </button>
            </div>

            <div className="p-8">
              <div className="space-y-6 mb-6">
                <div>
                  <label className="block text-sm font-bold text-slate-300 mb-2">
                    Rule Name <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text" value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                    className="w-full px-4 py-3.5 bg-white/5 border border-white/15 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-white font-medium placeholder-slate-500"
                    placeholder="e.g., Standard Expense Approval"
                  />
                </div>

                <div>
                  <div className="flex justify-between items-center mb-4">
                    <label className="block text-sm font-bold text-slate-300">Approval Steps</label>
                    <button type="button" onClick={addStep}
                      className="text-blue-400 hover:text-blue-300 text-sm font-bold flex items-center gap-2 transition-all px-3 py-1.5 hover:bg-blue-500/10 rounded-lg border border-transparent hover:border-blue-500/20"
                    >
                      <Plus size={16} /> Add Step
                    </button>
                  </div>

                  <div className="space-y-5">
                    {formData.steps.map((step, index) => (
                      <div key={index} className="border border-white/15 rounded-2xl p-6 bg-white/5 hover:border-white/25 transition-colors">
                        <div className="flex justify-between items-center mb-5">
                          <h4 className="font-bold text-white flex items-center gap-3">
                            <span className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 text-white rounded-xl flex items-center justify-center text-base font-bold shadow-md shadow-blue-500/20">
                              {step.stepNumber}
                            </span>
                            <span className="text-lg">Step {step.stepNumber}</span>
                          </h4>
                          {formData.steps.length > 1 && (
                            <button type="button" onClick={() => removeStep(index)}
                              className="p-2 text-red-400 hover:bg-red-500/10 rounded-xl transition-all hover:scale-110 border border-transparent hover:border-red-500/20"
                            >
                              <Trash2 size={18} />
                            </button>
                          )}
                        </div>

                        <div className="space-y-5">
                          <div>
                            <label className="block text-sm font-bold text-slate-300 mb-2">
                              Approvers <span className="text-red-400">*</span>
                            </label>
                            <SelectField 
                              value={step.approvers}
                              onChange={(values) => updateStep(index, 'approvers', Array.isArray(values) ? values : values.target?.value ? [values.target.value] : [])}
                              options={managers.map((manager) => ({ value: manager._id, label: `${manager.name} (${manager.role})` }))}
                              placeholder="Select approvers"
                              multiple={true}
                            />
                            <div className="flex items-start gap-2 mt-2">
                              <AlertCircle className="w-4 h-4 text-blue-400 flex-shrink-0 mt-0.5" />
                              <p className="text-xs text-blue-400 font-medium">Select multiple approvers to require their approval</p>
                            </div>
                          </div>

                          <div>
                            <label className="block text-sm font-bold text-slate-300 mb-2">
                              Approval Type <span className="text-red-400">*</span>
                            </label>
                            <SelectField 
                              value={step.approvalType}
                              onChange={(e) => updateStep(index, 'approvalType', e.target.value)}
                              options={[
                                { value: 'all', label: 'All must approve' },
                                { value: 'percentage', label: 'Percentage based' },
                                { value: 'specific', label: 'Specific approver' },
                                { value: 'hybrid', label: 'Hybrid (percentage OR specific)' }
                              ]}
                              placeholder="Select approval type"
                            />
                          </div>

                          {(step.approvalType === 'percentage' || step.approvalType === 'hybrid') && (
                            <div>
                              <label className="block text-sm font-bold text-slate-300 mb-2">
                                Required Percentage <span className="text-red-400">*</span>
                              </label>
                              <div className="relative">
                                <input type="number" min="1" max="100" value={step.requiredPercentage}
                                  onChange={(e) => updateStep(index, 'requiredPercentage', parseInt(e.target.value))}
                                  className="w-full px-4 py-3.5 bg-white/5 border border-white/15 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all font-bold text-white"
                                />
                                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold">%</span>
                              </div>
                            </div>
                          )}

                          {(step.approvalType === 'specific' || step.approvalType === 'hybrid') && (
                            <div>
                              <label className="block text-sm font-bold text-slate-300 mb-2">
                                Specific Approvers <span className="text-red-400">*</span>
                              </label>
                              <SelectField 
                                value={step.specificApprovers}
                                onChange={(values) => updateStep(index, 'specificApprovers', Array.isArray(values) ? values : values.target?.value ? [values.target.value] : [])}
                                options={managers.map((manager) => ({ value: manager._id, label: `${manager.name} (${manager.role})` }))}
                                placeholder="Select specific approvers"
                                multiple={true}
                              />
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex gap-4 pt-6 border-t border-white/10">
                <button onClick={handleSubmit} disabled={loading}
                  className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white py-3.5 px-6 rounded-xl font-bold transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-blue-500/20 hover:shadow-xl hover:scale-105"
                >
                  {loading ? 'Creating Rule...' : 'Create Rule'}
                </button>
                <button
                  onClick={() => {
                    setShowModal(false);
                    setFormData({ name: '', steps: [{ stepNumber: 1, approvers: [], approvalType: 'all', requiredPercentage: 100, specificApprovers: [] }] });
                  }}
                  className="px-8 py-3.5 border border-white/20 text-slate-300 hover:text-white hover:border-white/40 hover:bg-white/5 rounded-xl font-bold transition-all"
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

export default ApprovalRules;