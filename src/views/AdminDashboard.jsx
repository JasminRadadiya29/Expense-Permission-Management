import React, { useState, useEffect } from 'react';
import { Users, Mail, Plus, TrendingUp, X, Search, UserCheck, Briefcase, Loader2 } from 'lucide-react';
import StatCard from '../components/StatCard.jsx';
import SelectField from '../components/SelectField.jsx';
import { useToast, ConfirmDialog } from '../components/Toast.jsx';
import api from '../services/api';
import { getApiErrorMessage } from '../services/api';
import { sendWelcomeEmail, sendPasswordResetEmail } from '../services/emailService';

const AdminDashboard = () => {
  const [users, setUsers] = useState([]);
  const [managers, setManagers] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [dataLoading, setDataLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [confirmReset, setConfirmReset] = useState(null); // holds userId to reset
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    role: 'Employee',
    managerId: '',
    currency: ''
  });
  const toast = useToast();

  useEffect(() => {
    const loadData = async () => {
      setDataLoading(true);
      try {
        await Promise.all([fetchUsers(), fetchManagers()]);
      } finally {
        setDataLoading(false);
      }
    };
    loadData();
  }, []);

  useEffect(() => {
    if (!error) return;
    const timer = setTimeout(() => setError(''), 3000);
    return () => clearTimeout(timer);
  }, [error]);

  const fetchUsers = async () => {
    try {
      const response = await api.get('/users');
      setUsers(response.data.users || []);
    } catch (err) {
      console.error('Error fetching users:', err);
      setError('Failed to fetch users');
      setUsers([]);
    }
  };

  const fetchManagers = async () => {
    try {
      const response = await api.get('/users/managers');
      setManagers(response.data.managers || []);
    } catch (err) {
      console.error('Error fetching managers:', err);
      setManagers([]);
    }
  };

  const handleCreateUser = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await api.post('/users', formData);

      const emailSent = await sendWelcomeEmail(
        response.data.email,
        response.data.userName,
        response.data.temporaryPassword
      );

      if (emailSent) {
        toast.success('User created and welcome email sent!');
      } else {
        toast.warning('User created but welcome email failed to send.');
      }

      setShowModal(false);
      setFormData({ name: '', email: '', role: 'Employee', managerId: '', currency: '' });
      fetchUsers();
      fetchManagers();
    } catch (err) {
      setError(getApiErrorMessage(err, 'Error creating user'));
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (userId) => {
    try {
      const response = await api.post(`/users/${userId}/reset-password`);

      const emailSent = await sendPasswordResetEmail(
        response.data.email,
        response.data.temporaryPassword
      );

      if (emailSent) {
        toast.success('Password reset email sent successfully!');
      } else {
        toast.error('Failed to send password reset email.');
      }
    } catch (err) {
      toast.error(getApiErrorMessage(err, 'Error sending reset email'));
    } finally {
      setConfirmReset(null);
    }
  };

  const handleRoleChange = async (userId, newRole) => {
    const user = users.find(u => u._id === userId);
    if (!user) return;

    // If trying to demote from Manager/Admin to Employee
    if ((user.role === 'Manager' || user.role === 'Admin') && newRole === 'Employee') {
      const directReports = users.filter(u => u.manager?._id === userId).length;
      if (directReports > 0) {
        toast.error(`Cannot demote user with ${directReports} active report${directReports > 1 ? 's' : ''}. Reassign reports first.`);
        return;
      }

      // Show confirmation dialog for role change
      if (!window.confirm(
        `Change role from ${user.role} to Employee?\n\nThis action is irreversible once saved.`
      )) {
        return;
      }
    }

    try {
      await api.put(`/users/${userId}`, { role: newRole });
      fetchUsers();
      fetchManagers();
      toast.success('Role updated successfully');
    } catch (err) {
      const errorMsg = err.response?.data?.error || 'Error updating role';
      toast.error(errorMsg);
      // Revert the select to the original value
      fetchUsers();
    }
  };

  const handleManagerChange = async (userId, managerId) => {
    try {
      await api.put(`/users/${userId}`, { managerId: managerId || null });
      fetchUsers();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Error updating manager');
    }
  };

  const filteredUsers = users.filter(user =>
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getRoleBadgeColor = (role) => {
    switch(role) {
      case 'Admin': return 'bg-purple-500/20 text-purple-300 border-purple-500/30';
      case 'Manager': return 'bg-blue-500/20 text-blue-300 border-blue-500/30';
      default: return 'bg-slate-500/20 text-slate-300 border-slate-500/30';
    }
  };

  return (
    <div className="min-h-screen">
      {/* Confirm dialog for password reset */}
      <ConfirmDialog
        open={!!confirmReset}
        title="Reset Password?"
        message="This will generate a new temporary password and send it to the user's email."
        confirmLabel="Send Reset Email"
        confirmClass="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
        onConfirm={() => handleResetPassword(confirmReset)}
        onCancel={() => setConfirmReset(null)}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <div>
            <h1 className="text-4xl font-bold text-white mb-1">User Management</h1>
            <p className="text-slate-400 text-lg">Manage team members and their roles</p>
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="group bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-6 py-3.5 rounded-xl font-semibold transition-all duration-300 shadow-lg shadow-blue-500/30 hover:shadow-xl flex items-center gap-2 hover:scale-105"
          >
            <Plus size={20} className="group-hover:rotate-90 transition-transform duration-300" />
            Create User
          </button>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-xl flex items-start gap-3">
            <div className="w-5 h-5 bg-red-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
              <span className="text-white text-xs font-bold">!</span>
            </div>
            <div>
              <p className="text-red-300 text-sm font-medium">{error}</p>
              <button
                onClick={() => { setError(''); fetchUsers(); fetchManagers(); }}
                className="text-red-400 text-xs underline hover:no-underline mt-1"
              >
                Retry
              </button>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <StatCard
            title="Total Users"
            value={dataLoading ? '...' : users.length}
            subtitle={<div className="flex items-center gap-1.5 text-emerald-400"><TrendingUp className="w-4 h-4" /><span>Active accounts</span></div>}
            icon={<Users className="w-7 h-7 text-white" />}
            iconBg="from-blue-500 to-indigo-600"
          />
          <StatCard
            title="Managers"
            value={dataLoading ? '...' : managers.length}
            subtitle={<span className="text-blue-400">Team leaders</span>}
            icon={<UserCheck className="w-7 h-7 text-white" />}
            iconBg="from-emerald-500 to-teal-600"
          />
          <StatCard
            title="Employees"
            value={dataLoading ? '...' : users.filter(u => u.role === 'Employee').length}
            subtitle={<span className="text-slate-400">Team members</span>}
            icon={<Briefcase className="w-7 h-7 text-white" />}
            iconBg="from-amber-500 to-orange-600"
          />
        </div>

        {/* Search */}
        <div className="bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 p-4 mb-6">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search users by name or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-white placeholder-slate-500"
            />
          </div>
        </div>

        {/* Users Table */}
        <div className="bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/10 bg-white/5">
                  <th className="px-6 py-4 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">User</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">Email</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">Role</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">Manager</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filteredUsers.map((user) => (
                  <tr key={user._id} className="hover:bg-white/5 transition-colors duration-150">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        <div className="w-11 h-11 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center text-white font-bold text-base shadow-md shadow-blue-500/20">
                          {user.name.charAt(0)}
                        </div>
                        <span className="text-sm font-semibold text-white">{user.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-slate-300">{user.email}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <SelectField
                        value={user.role}
                        onChange={(e) => handleRoleChange(user._id, e.target.value)}
                        options={[
                          { value: 'Employee', label: 'Employee' },
                          { value: 'Manager', label: 'Manager' },
                          { value: 'Admin', label: 'Admin' }
                        ]}
                        size="sm"
                        className={getRoleBadgeColor(user.role)}
                      />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <SelectField
                        value={user.manager?._id || ''}
                        onChange={(e) => handleManagerChange(user._id, e.target.value)}
                        options={[
                          { value: '', label: 'No Manager' },
                          ...managers.filter(m => m._id !== user._id).map((manager) => ({
                            value: manager._id,
                            label: manager.name
                          }))
                        ]}
                        size="sm"
                      />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <button
                        onClick={() => setConfirmReset(user._id)}
                        className="group text-blue-400 hover:text-blue-300 text-sm font-semibold flex items-center gap-2 transition-all hover:gap-3"
                      >
                        <Mail size={16} className="group-hover:scale-110 transition-transform" />
                        Reset Password
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredUsers.length === 0 && (
            <div className="text-center py-12">
              <Users className="w-12 h-12 text-slate-600 mx-auto mb-3" />
              <p className="text-slate-400 font-medium">No users found</p>
            </div>
          )}
        </div>
      </div>

      {/* Create User Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-slate-900 border border-white/10 rounded-3xl max-w-2xl w-full shadow-2xl shadow-black/50">
            <div className="flex items-center justify-between p-8 border-b border-white/10">
              <div>
                <h2 className="text-3xl font-bold text-white">Create New User</h2>
                <p className="text-slate-400 mt-1">Add a new team member to your organization</p>
              </div>
              <button
                onClick={() => { setShowModal(false); setFormData({ name: '', email: '', role: 'Employee', managerId: '', currency: '' }); setError(''); }}
                className="p-2 hover:bg-white/10 rounded-xl transition-colors"
              >
                <X size={24} className="text-slate-400" />
              </button>
            </div>

            <form onSubmit={handleCreateUser} className="p-8">
              {error && (
                <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-xl flex items-start gap-3">
                  <div className="w-5 h-5 bg-red-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-white text-xs font-bold">!</span>
                  </div>
                  <p className="text-red-300 text-sm font-medium">{error}</p>
                </div>
              )}

              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-bold text-slate-300 mb-2">
                    Full Name <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text" value={formData.name} required
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-3.5 bg-white/5 border border-white/15 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-white font-medium placeholder-slate-500"
                    placeholder="John Doe"
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-slate-300 mb-2">
                    Email Address <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="email" value={formData.email} required
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-4 py-3.5 bg-white/5 border border-white/15 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-white font-medium placeholder-slate-500"
                    placeholder="john@company.com"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-bold text-slate-300 mb-2">
                      Role <span className="text-red-400">*</span>
                    </label>
                    <SelectField
                      value={formData.role}
                      onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                      options={[{ value: 'Employee', label: 'Employee' }, { value: 'Manager', label: 'Manager' }]}
                      placeholder="Select role"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-slate-300 mb-2">Assign Manager</label>
                    <SelectField
                      value={formData.managerId}
                      onChange={(e) => setFormData({ ...formData, managerId: e.target.value })}
                      options={[{ value: '', label: 'No Manager' }, ...managers.map(m => ({ value: m._id, label: m.name }))]}
                      placeholder="Select manager"
                    />
                  </div>
                </div>
              </div>

              <div className="flex gap-4 mt-8 pt-6 border-t border-white/10">
                <button
                  type="submit" disabled={loading}
                  className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white py-3.5 px-6 rounded-xl font-bold transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-blue-500/30 hover:shadow-xl hover:scale-105 flex items-center justify-center gap-2"
                >
                  {loading ? <><Loader2 className="w-4 h-4 animate-spin" />Creating...</> : 'Create User'}
                </button>
                <button
                  type="button"
                  onClick={() => { setShowModal(false); setFormData({ name: '', email: '', role: 'Employee', managerId: '', currency: '' }); setError(''); }}
                  className="px-8 py-3.5 border border-white/20 text-slate-300 hover:text-white hover:border-white/40 hover:bg-white/5 rounded-xl font-bold transition-all"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;