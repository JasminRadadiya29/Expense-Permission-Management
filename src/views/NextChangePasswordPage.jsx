'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Shield, Eye, EyeOff, Lock, CheckCircle2, XCircle, ArrowRight } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import NextProtectedRoute from '../components/NextProtectedRoute';

export default function NextChangePasswordPage() {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const { user, changePassword } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!error) return;
    const timer = setTimeout(() => setError(''), 3000);
    return () => clearTimeout(timer);
  }, [error]);

  const passwordRequirements = [
    { label: 'At least 8 characters', met: newPassword.length >= 8 },
    { label: 'Contains uppercase letter', met: /[A-Z]/.test(newPassword) },
    { label: 'Contains lowercase letter', met: /[a-z]/.test(newPassword) },
    { label: 'Contains number', met: /\d/.test(newPassword) },
    { label: 'Contains special character', met: /[!@#$%^&*(),.?":{}|<>]/.test(newPassword) }
  ];

  const allRequirementsMet = passwordRequirements.every((req) => req.met);
  const passwordsMatch = newPassword && confirmPassword && newPassword === confirmPassword;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    if (newPassword !== confirmPassword) {
      setError('New passwords do not match');
      setLoading(false);
      return;
    }

    if (newPassword === currentPassword) {
      setError('New password must be different from current password');
      setLoading(false);
      return;
    }

    if (!allRequirementsMet) {
      setError('Please meet all password requirements');
      setLoading(false);
      return;
    }

    try {
      await changePassword(currentPassword, newPassword);
      setSuccess('Password changed successfully! Redirecting to dashboard...');
      setTimeout(() => {
        router.push('/dashboard');
      }, 2000);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to change password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <NextProtectedRoute>
      <div className="min-h-screen flex items-center justify-center px-4 py-12">
        <div className="max-w-md w-full">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl shadow-lg shadow-blue-500/30 mb-6 group hover:scale-110 transition-transform duration-300">
              <Shield className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-4xl font-bold text-white mb-1">Change Password</h1>
            <p className="text-slate-400 text-lg">
              Welcome <span className="font-bold text-white">{user?.name}</span>! Please change your temporary password to a secure one.
            </p>
          </div>

          <div className="bg-slate-900 border border-white/10 rounded-3xl shadow-2xl shadow-black/50 p-8">
            {error && (
              <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-xl flex items-start gap-3 animate-in fade-in duration-300">
                <div className="w-5 h-5 bg-red-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <XCircle className="w-4 h-4 text-white" />
                </div>
                <p className="text-red-300 text-sm font-medium">{error}</p>
              </div>
            )}

            {success && (
              <div className="mb-6 p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-xl flex items-start gap-3 animate-in fade-in duration-300">
                <div className="w-5 h-5 bg-emerald-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <CheckCircle2 className="w-4 h-4 text-white" />
                </div>
                <p className="text-emerald-300 text-sm font-medium">{success}</p>
              </div>
            )}

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-bold text-slate-300 mb-2 flex items-center gap-2">
                  <Lock className="w-4 h-4 text-slate-400" />
                  Current Password
                  <span className="text-red-400">*</span>
                </label>
                <div className="relative">
                  <input
                    type={showCurrentPassword ? 'text' : 'password'}
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    required
                    className="w-full px-4 py-3.5 pr-12 bg-white/5 border border-white/15 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-white font-medium placeholder-slate-500"
                    placeholder="Enter your current password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                  >
                    {showCurrentPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-300 mb-2 flex items-center gap-2">
                  <Lock className="w-4 h-4 text-slate-400" />
                  New Password
                  <span className="text-red-400">*</span>
                </label>
                <div className="relative">
                  <input
                    type={showNewPassword ? 'text' : 'password'}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                    className="w-full px-4 py-3.5 pr-12 bg-white/5 border border-white/15 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-white font-medium placeholder-slate-500"
                    placeholder="Enter your new password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                  >
                    {showNewPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>

                {newPassword && (
                  <div className="mt-3 p-4 bg-white/5 rounded-xl border border-white/15">
                    <p className="text-xs font-bold text-slate-300 mb-2">Password Requirements:</p>
                    <div className="space-y-1.5">
                      {passwordRequirements.map((req, index) => (
                        <div key={index} className="flex items-center gap-2 text-xs">
                          {req.met ? (
                            <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                          ) : (
                            <XCircle className="w-4 h-4 text-slate-600 flex-shrink-0" />
                          )}
                          <span className={req.met ? 'text-emerald-300 font-semibold' : 'text-slate-500 font-medium'}>
                            {req.label}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-300 mb-2 flex items-center gap-2">
                  <Lock className="w-4 h-4 text-slate-400" />
                  Confirm New Password
                  <span className="text-red-400">*</span>
                </label>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    className={`w-full px-4 py-3.5 pr-12 border rounded-xl focus:outline-none focus:ring-2 transition-all text-white font-medium placeholder-slate-500 ${
                      confirmPassword && passwordsMatch
                        ? 'border-emerald-500/50 bg-emerald-500/10 focus:ring-emerald-500'
                        : confirmPassword && !passwordsMatch
                          ? 'border-red-500/50 bg-red-500/10 focus:ring-red-500'
                          : 'bg-white/5 border-white/15 focus:ring-blue-500 focus:border-transparent'
                    }`}
                    placeholder="Confirm your new password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                  >
                    {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
                {confirmPassword && (
                  <div className="mt-2 flex items-center gap-2">
                    {passwordsMatch ? (
                      <>
                        <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                        <span className="text-xs text-emerald-300 font-semibold">Passwords match!</span>
                      </>
                    ) : (
                      <>
                        <XCircle className="w-4 h-4 text-red-400" />
                        <span className="text-xs text-red-300 font-semibold">Passwords do not match</span>
                      </>
                    )}
                  </div>
                )}
              </div>

              <button
                onClick={handleSubmit}
                disabled={loading || !allRequirementsMet || !passwordsMatch}
                className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white py-3.5 px-6 rounded-xl font-bold transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-blue-500/30 hover:shadow-xl hover:scale-105 flex items-center justify-center gap-2 group"
              >
                {loading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Changing Password...
                  </>
                ) : (
                  <>
                    Change Password
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </button>
            </div>

            <div className="mt-8 pt-6 border-t border-white/10 text-center">
              <button
                type="button"
                onClick={() => router.push('/dashboard')}
                className="text-sm text-slate-400 hover:text-white font-semibold transition-colors hover:underline"
              >
                Skip for now
              </button>
            </div>
          </div>

          <div className="mt-6 text-center">
            <p className="text-xs text-slate-500">Your password is encrypted and stored securely</p>
          </div>
        </div>
      </div>
    </NextProtectedRoute>
  );
}
