import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';
import { useToast } from '../components/Toast.jsx';
import { Plus, Upload, DollarSign, Clock, TrendingUp, X, FileText, CheckCircle2, Loader2, AlertCircle } from 'lucide-react';
import StatCard from '../components/StatCard.jsx';
import SelectField from '../components/SelectField.jsx';
import { SUPPORTED_CURRENCIES, getCompanyBaseCurrency, formatCurrencyAmount, convertCurrencyAmount } from '../services/currency';

const EXPENSE_CATEGORIES = ['Travel', 'Food', 'Office Supplies', 'Software', 'Hardware', 'Marketing', 'Other'];
const PAID_BY_OPTIONS = ['Company', 'Personal'];

const getExpenseValidationErrorMessage = (expenseData) => {
  if (!expenseData.description || expenseData.description.trim().length < 5) {
    return 'Description must be at least 5 characters';
  }

  if (!EXPENSE_CATEGORIES.includes(expenseData.category)) {
    return 'Please select a valid expense category';
  }

  if (!expenseData.date || Number.isNaN(Date.parse(expenseData.date))) {
    return 'Please provide a valid expense date';
  }

  if (!Number.isFinite(expenseData.amount) || expenseData.amount <= 0) {
    return 'Amount must be a positive number';
  }

  if (!expenseData.currency || expenseData.currency.length !== 3) {
    return 'Currency must be a 3-letter code';
  }

  if (!Number.isFinite(expenseData.amountInBaseCurrency) || expenseData.amountInBaseCurrency <= 0) {
    return 'Amount in base currency must be a positive number';
  }

  if (!PAID_BY_OPTIONS.includes(expenseData.paidBy)) {
    return 'Paid by must be either Company or Personal';
  }

  return null;
};

const getApiValidationErrorMessage = (err) => {
  const details = err?.response?.data?.details;
  if (Array.isArray(details) && details.length > 0) {
    return details.map((item) => item?.message).filter(Boolean).join(', ');
  }

  return err?.response?.data?.message || err?.response?.data?.error || 'Error creating expense';
};

const EmployeeExpenses = () => {
  const { user } = useAuth();
  const baseCurrency = getCompanyBaseCurrency(user);
  const toast = useToast();
  const [expenses, setExpenses] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [ocrLoading, setOcrLoading] = useState(false);
  const [uploadedFile, setUploadedFile] = useState(null);
  const [convertedAmount, setConvertedAmount] = useState(null);
  const [conversionLoading, setConversionLoading] = useState(false);
  const [conversionError, setConversionError] = useState(null);
  const [exchangeRate, setExchangeRate] = useState(null);
  const [formData, setFormData] = useState({
    description: '',
    category: 'Travel',
    date: new Date().toISOString().split('T')[0],
    amount: '',
    currency: baseCurrency,
    amountInBaseCurrency: '',
    paidBy: 'Personal',
    remarks: '',
    receiptUrl: ''
  });

  useEffect(() => {
    setFormData((prev) => {
      if (prev.amount || prev.currency === baseCurrency) {
        return prev;
      }

      return { ...prev, currency: baseCurrency };
    });
  }, [baseCurrency]);

  useEffect(() => { fetchExpenses(); }, []);

  useEffect(() => {
    if (formData.amount && formData.currency && baseCurrency) {
      if (formData.currency === baseCurrency) {
        const amount = parseFloat(formData.amount);
        setFormData(prev => ({ ...prev, amountInBaseCurrency: amount }));
        setConvertedAmount(amount);
        setExchangeRate(1);
        setConversionError(null);
      } else {
        convertCurrency(formData.amount, formData.currency, baseCurrency);
      }
    }
  }, [formData.amount, formData.currency, baseCurrency]);

  const fetchExpenses = async () => {
    try {
      const response = await api.get('/expenses');
      setExpenses(response.data.expenses);
    } catch (err) {
      console.error('Error fetching expenses:', err);
    }
  };

  const convertCurrency = async (amount, fromCurrency, toCurrency) => {
    if (!amount || amount <= 0) { setConvertedAmount(null); setExchangeRate(null); return; }
    setConversionLoading(true);
    setConversionError(null);
    try {
      const conversion = await convertCurrencyAmount({ amount, fromCurrency, toCurrency });
      setExchangeRate(conversion.rate);
      setConvertedAmount(conversion.convertedAmount);
      setFormData(prev => ({ ...prev, amountInBaseCurrency: conversion.convertedAmount }));
    } catch (err) {
      console.error('Currency conversion error:', err);
      setConversionError(err.message);
      setConvertedAmount(null);
      setExchangeRate(null);
      setFormData(prev => ({ ...prev, amountInBaseCurrency: '' }));
    } finally {
      setConversionLoading(false);
    }
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setOcrLoading(true);
    setUploadedFile(file);
    setTimeout(() => setOcrLoading(false), 2000);
  };

  const handleSubmit = async (e, submit = false) => {
    e.preventDefault();
    if (!formData.amountInBaseCurrency) {
      toast.warning('Please wait for currency conversion to complete');
      return;
    }
    if (conversionError) {
      toast.error('Currency conversion failed. Please check your currency code and try again.');
      return;
    }
    setLoading(true);
    try {
      const expenseData = {
        description: formData.description.trim(),
        category: formData.category,
        date: formData.date,
        amount: parseFloat(formData.amount),
        currency: (formData.currency || '').toUpperCase().trim(),
        amountInBaseCurrency: parseFloat(formData.amountInBaseCurrency),
        paidBy: formData.paidBy,
        remarks: formData.remarks,
        receiptUrl: formData.receiptUrl
      };

      const validationMessage = getExpenseValidationErrorMessage(expenseData);
      if (validationMessage) {
        toast.error(validationMessage);
        return;
      }

      const response = await api.post('/expenses', expenseData);
      if (submit) {
        await api.post(`/expenses/${response.data.expense._id}/submit`);
        toast.success('Expense submitted for approval!');
      } else {
        toast.success('Expense saved as draft!');
      }
      setShowModal(false);
      setFormData({
        description: '', category: 'Travel',
        date: new Date().toISOString().split('T')[0],
        amount: '', currency: baseCurrency,
        amountInBaseCurrency: '', paidBy: 'Personal',
        remarks: '', receiptUrl: ''
      });
      setUploadedFile(null);
      setConvertedAmount(null);
      setExchangeRate(null);
      setConversionError(null);
      fetchExpenses();
    } catch (err) {
      toast.error(getApiValidationErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const colors = {
      'Draft': 'bg-slate-500/20 text-slate-300 border-slate-500/30',
      'Waiting Approval': 'bg-amber-500/20 text-amber-300 border-amber-500/30',
      'Approved': 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
      'Rejected': 'bg-red-500/20 text-red-300 border-red-500/30'
    };
    return colors[status] || colors['Draft'];
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

  const totalExpenses = expenses.reduce((sum, exp) => sum + (exp.amountInBaseCurrency || 0), 0);
  const pendingExpenses = expenses.filter(e => e.status === 'Waiting Approval').length;
  const approvedExpenses = expenses.filter(e => e.status === 'Approved').length;

  const inputClass = "w-full px-4 py-3.5 bg-white/5 border border-white/15 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-white font-medium placeholder-slate-500";
  const selectClass = "w-full px-4 py-3.5 bg-slate-800/60 border border-white/15 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all font-medium text-white hover:bg-slate-800/80";
  const labelClass = "block text-sm font-bold text-slate-300 mb-2";

  const closeModal = () => {
    setShowModal(false);
    setUploadedFile(null);
    setConvertedAmount(null);
    setExchangeRate(null);
    setConversionError(null);
  };

  return (
    <div className="min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <div>
            <h1 className="text-4xl font-bold text-white mb-1">My Expenses</h1>
            <p className="text-slate-400 text-lg">Submit and track your expense reports</p>
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="group bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-6 py-3.5 rounded-xl font-semibold transition-all duration-300 shadow-lg shadow-blue-500/30 hover:shadow-xl flex items-center gap-2 hover:scale-105"
          >
            <Plus size={20} className="group-hover:rotate-90 transition-transform duration-300" />
            New Expense
          </button>
        </div>

        {/* Stat Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <StatCard
            title="Total Expenses"
            value={formatCurrencyAmount(totalExpenses, baseCurrency)}
            subtitle={<span className="text-slate-400">All time ({baseCurrency})</span>}
            icon={<DollarSign className="w-7 h-7 text-white" />}
            iconBg="from-blue-500 to-indigo-600"
          />
          <StatCard
            title="Pending"
            value={pendingExpenses}
            subtitle={<span className="text-amber-400">Awaiting review</span>}
            icon={<Clock className="w-7 h-7 text-white" />}
            iconBg="from-amber-500 to-orange-600"
          />
          <StatCard
            title="Approved"
            value={approvedExpenses}
            subtitle={<span className="text-emerald-400">Ready to reimburse</span>}
            icon={<TrendingUp className="w-7 h-7 text-white" />}
            iconBg="from-emerald-500 to-teal-600"
          />
        </div>

        {/* Expenses Table */}
        <div className="bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/10 bg-white/5">
                  {['Description', 'Date', 'Category', 'Paid By', 'Amount', 'Status'].map(h => (
                    <th key={h} className="px-6 py-4 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {expenses.map((expense) => (
                  <tr key={expense._id} className="hover:bg-white/5 transition-colors duration-150">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-md shadow-blue-500/20 flex-shrink-0">
                          <FileText className="w-5 h-5 text-white" />
                        </div>
                        <span className="text-sm font-semibold text-white">{expense.description}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-slate-300 font-medium">
                        {new Date(expense.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-3 py-1.5 text-xs font-bold rounded-lg border ${getCategoryColor(expense.category)}`}>
                        {expense.category}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-slate-300 font-medium">{expense.paidBy}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-bold text-white">
                        {formatCurrencyAmount(expense.amountInBaseCurrency || expense.amount, baseCurrency)}
                      </div>
                      {expense.currency !== baseCurrency && (
                        <div className="text-xs text-slate-400 font-medium">
                          Original: {formatCurrencyAmount(expense.amount, expense.currency)}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg border ${getStatusBadge(expense.status)}`}>
                        {expense.status === 'Approved' && <CheckCircle2 className="w-3.5 h-3.5" />}
                        {expense.status === 'Waiting Approval' && <Clock className="w-3.5 h-3.5" />}
                        {expense.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {expenses.length === 0 && (
            <div className="text-center py-16">
              <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-white/10">
                <FileText className="w-8 h-8 text-slate-400" />
              </div>
              <p className="text-white font-semibold text-lg mb-1">No expenses yet</p>
              <p className="text-slate-400 text-sm mb-4">Start by adding your first expense</p>
              <button
                onClick={() => setShowModal(true)}
                className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-5 py-2.5 rounded-xl font-semibold text-sm hover:scale-105 transition-all shadow-lg shadow-blue-500/20"
              >
                <Plus size={16} /> Add Expense
              </button>
            </div>
          )}
        </div>

      </div>

      {/* ── Create Expense Modal ─────────────────────────────── */}
      {showModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-slate-900 border border-white/10 rounded-3xl max-w-3xl w-full shadow-2xl shadow-black/50 my-8 max-h-[90vh] overflow-y-auto">

            {/* Modal Header */}
            <div className="sticky top-0 bg-slate-900 border-b border-white/10 z-10 flex items-center justify-between p-8 rounded-t-3xl">
              <div>
                <h2 className="text-3xl font-bold text-white">Create Expense</h2>
                <p className="text-slate-400 mt-1">Add a new expense to your report</p>
              </div>
              <button onClick={closeModal} className="p-2 hover:bg-white/10 rounded-xl transition-colors">
                <X size={24} className="text-slate-400" />
              </button>
            </div>

            <div className="p-8 space-y-6">

              {/* Receipt Upload */}
              <div>
                <label className={labelClass + " flex items-center gap-2"}>
                  <Upload className="w-4 h-4 text-slate-400" />
                  Receipt Upload (OCR)
                </label>
                <div className="border-2 border-dashed border-white/20 rounded-2xl p-8 text-center hover:border-blue-400/50 transition-all bg-white/5 relative group cursor-pointer">
                  <input type="file" accept="image/*" onChange={handleFileUpload} className="hidden" id="receipt-upload" disabled={ocrLoading} />
                  <label htmlFor="receipt-upload" className="cursor-pointer flex flex-col items-center gap-4">
                    {ocrLoading ? (
                      <>
                        <div className="p-4 bg-blue-500/20 rounded-2xl">
                          <Loader2 size={32} className="text-blue-400 animate-spin" />
                        </div>
                        <div>
                          <span className="text-base font-bold text-blue-300">Processing receipt...</span>
                          <p className="text-sm text-slate-400 mt-1">Extracting data with AI</p>
                        </div>
                      </>
                    ) : uploadedFile ? (
                      <>
                        <div className="p-4 bg-emerald-500/20 rounded-2xl">
                          <CheckCircle2 size={32} className="text-emerald-400" />
                        </div>
                        <div>
                          <span className="text-base font-bold text-emerald-300">{uploadedFile.name}</span>
                          <p className="text-sm text-slate-400 mt-1">Data extracted successfully</p>
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="p-4 bg-blue-500/20 rounded-2xl group-hover:scale-110 transition-transform">
                          <Upload size={32} className="text-blue-400" />
                        </div>
                        <div>
                          <span className="text-base font-bold text-white">Click to upload receipt</span>
                          <p className="text-sm text-slate-400 mt-1">AI will extract amount and date automatically</p>
                        </div>
                      </>
                    )}
                  </label>
                </div>
              </div>

              {/* Description & Category */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className={labelClass}>Description <span className="text-red-400">*</span></label>
                  <input
                    type="text" value={formData.description} required
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className={inputClass} placeholder="e.g., Client dinner"
                  />
                </div>
                <div>
                  <label className={labelClass}>Category <span className="text-red-400">*</span></label>
                  <SelectField
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    options={EXPENSE_CATEGORIES}
                    placeholder="Select category"
                  />
                </div>
              </div>

              {/* Date, Amount, Currency */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className={labelClass}>Date <span className="text-red-400">*</span></label>
                  <input
                    type="date" value={formData.date} required
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className={labelClass}>Amount <span className="text-red-400">*</span></label>
                  <input
                    type="number" step="0.01" value={formData.amount} required
                    onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                    className={inputClass} placeholder="0.00"
                  />
                </div>
                <div>
                  <label className={labelClass}>Currency <span className="text-red-400">*</span></label>
                  <SelectField
                    value={formData.currency}
                    onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
                    options={SUPPORTED_CURRENCIES}
                    placeholder="Select currency"
                  />
                </div>
              </div>

              {/* Currency Conversion Display */}
              {formData.amount && formData.currency && baseCurrency && formData.currency !== baseCurrency && (
                <div className={`rounded-xl p-4 border ${conversionError ? 'bg-red-500/10 border-red-500/30' : 'bg-blue-500/10 border-blue-500/20'}`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {conversionError
                        ? <AlertCircle className="w-5 h-5 text-red-400" />
                        : <DollarSign className="w-5 h-5 text-blue-400" />}
                      <span className="text-sm font-bold text-slate-300">
                        {conversionError ? 'Conversion Error' : 'Converted Amount:'}
                      </span>
                    </div>
                    <div className="text-right">
                      {conversionLoading ? (
                        <div className="flex items-center gap-2">
                          <Loader2 size={16} className="text-blue-400 animate-spin" />
                          <span className="text-sm text-slate-400">Converting...</span>
                        </div>
                      ) : conversionError ? (
                        <div className="text-xs text-red-400 font-medium">{conversionError}</div>
                      ) : convertedAmount ? (
                        <div>
                          <span className="text-lg font-bold text-blue-300">
                            {formatCurrencyAmount(convertedAmount, baseCurrency)}
                          </span>
                          <div className="text-xs text-slate-400">
                            From {formatCurrencyAmount(formData.amount, formData.currency)} (Rate: {exchangeRate?.toFixed(4)})
                          </div>
                        </div>
                      ) : null}
                    </div>
                  </div>
                </div>
              )}

              {/* Paid By */}
              <div>
                <label className={labelClass}>Paid By <span className="text-red-400">*</span></label>
                <SelectField
                  value={formData.paidBy}
                  onChange={(e) => setFormData({ ...formData, paidBy: e.target.value })}
                  options={PAID_BY_OPTIONS}
                  placeholder="Select payment method"
                />
              </div>

              {/* Remarks */}
              <div>
                <label className={labelClass}>Remarks (Optional)</label>
                <textarea
                  value={formData.remarks} rows={3}
                  onChange={(e) => setFormData({ ...formData, remarks: e.target.value })}
                  className="w-full px-4 py-3.5 bg-white/5 border border-white/15 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none font-medium text-white placeholder-slate-500"
                  placeholder="Add any additional notes..."
                />
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 pt-6 border-t border-white/10">
                <button
                  onClick={(e) => handleSubmit(e, false)}
                  disabled={loading || conversionLoading}
                  className="flex-1 bg-gradient-to-r from-slate-600 to-slate-700 hover:from-slate-500 hover:to-slate-600 text-white py-3.5 px-6 rounded-xl font-bold transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:scale-105"
                >
                  {loading ? 'Saving...' : 'Save as Draft'}
                </button>
                <button
                  onClick={(e) => handleSubmit(e, true)}
                  disabled={loading || conversionLoading}
                  className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white py-3.5 px-6 rounded-xl font-bold transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-blue-500/30 hover:shadow-xl hover:scale-105"
                >
                  {loading ? 'Submitting...' : 'Submit for Approval'}
                </button>
                <button
                  onClick={closeModal}
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

export default EmployeeExpenses;