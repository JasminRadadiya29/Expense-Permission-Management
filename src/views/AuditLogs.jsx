import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { ShieldCheck, RefreshCw, Search, Clock } from 'lucide-react';
import api, { getApiErrorMessage } from '../services/api';
import { useAuth } from '../contexts/AuthContext';

const formatTimestamp = (value) => {
  if (!value) return '-';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '-';
  return date.toLocaleString();
};

const stringifyDetails = (details) => {
  if (!details) return '';
  if (typeof details === 'string') return details;
  try {
    return JSON.stringify(details);
  } catch {
    return '';
  }
};

export default function AuditLogs() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [logs, setLogs] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');

  const companyId = useMemo(() => {
    if (!user?.company) return null;
    if (typeof user.company === 'string') return user.company;
    return user.company._id || null;
  }, [user]);

  const fetchAuditLogs = useCallback(async () => {
    if (!companyId) {
      setLogs([]);
      setError('Company context missing for this user.');
      setLoading(false);
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await api.post('/reports', {
        reportType: 'audit-trail',
        companyId,
        limit: 200,
        skip: 0,
      });

      setLogs(response.data?.data?.logs || []);
    } catch (requestError) {
      setError(getApiErrorMessage(requestError, 'Failed to load audit logs'));
      setLogs([]);
    } finally {
      setLoading(false);
    }
  }, [companyId]);

  useEffect(() => {
    fetchAuditLogs();
  }, [fetchAuditLogs]);

  const filteredLogs = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    if (!term) return logs;

    return logs.filter((log) => {
      const searchableValues = [
        log?.action,
        log?.resourceType,
        log?.user?.name,
        log?.user?.email,
        stringifyDetails(log?.details),
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();

      return searchableValues.includes(term);
    });
  }, [logs, searchTerm]);

  return (
    <div className="min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-4xl font-bold text-white mb-1">Audit Logs</h1>
            <p className="text-slate-400 text-lg">Track key actions across users and resources</p>
          </div>
          <button
            type="button"
            onClick={fetchAuditLogs}
            className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold transition-all"
          >
            <RefreshCw size={18} />
            Refresh
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 p-6">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Total Logs</p>
            <p className="text-4xl font-bold text-white">{logs.length}</p>
          </div>
          <div className="bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 p-6">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Filtered Logs</p>
            <p className="text-4xl font-bold text-white">{filteredLogs.length}</p>
          </div>
          <div className="bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 p-6">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Scope</p>
            <div className="flex items-center gap-2 text-white font-semibold text-lg">
              <ShieldCheck size={20} className="text-emerald-400" />
              Admin
            </div>
          </div>
        </div>

        <div className="bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 p-4 mb-6">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search by action, user, resource, or details..."
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-white placeholder-slate-500"
            />
          </div>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-xl text-red-300 text-sm font-medium">
            {error}
          </div>
        )}

        <div className="bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/10 bg-white/5">
                  <th className="px-6 py-4 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">Time</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">User</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">Action</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">Resource</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {!loading && filteredLogs.map((log) => (
                  <tr key={log._id} className="hover:bg-white/5 transition-colors duration-150">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-200">
                      <div className="inline-flex items-center gap-2">
                        <Clock size={14} className="text-slate-500" />
                        {formatTimestamp(log.createdAt)}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-200">
                      <p className="font-semibold text-white">{log.user?.name || 'Unknown User'}</p>
                      <p className="text-slate-400">{log.user?.email || '-'}</p>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-blue-300">
                      {log.action}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-200">
                      {log.resourceType}
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-300 max-w-md truncate" title={stringifyDetails(log.details)}>
                      {stringifyDetails(log.details) || '-'}
                    </td>
                  </tr>
                ))}
                {loading && (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-slate-400">Loading audit logs...</td>
                  </tr>
                )}
                {!loading && filteredLogs.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-slate-400">No audit logs found.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}