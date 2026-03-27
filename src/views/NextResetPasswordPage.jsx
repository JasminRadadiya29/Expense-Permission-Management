'use client';

import React, { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowRight, CheckCircle2, Loader2, Lock, XCircle } from 'lucide-react';
import api, { getApiErrorMessage } from '../services/api';
import AppLogo from '../components/AppLogo';

export default function NextResetPasswordPage({ token = '' }) {
  const router = useRouter();

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!error) return;
    const timer = setTimeout(() => setError(''), 3000);
    return () => clearTimeout(timer);
  }, [error]);

  const passwordRequirements = useMemo(() => ([
    { label: 'At least 8 characters', met: newPassword.length >= 8 },
    { label: 'Contains uppercase letter', met: /[A-Z]/.test(newPassword) },
    { label: 'Contains lowercase letter', met: /[a-z]/.test(newPassword) },
    { label: 'Contains number', met: /\d/.test(newPassword) },
    { label: 'Contains special character', met: /[!@#$%^&*(),.?":{}|<>]/.test(newPassword) },
  ]), [newPassword]);

  const allRequirementsMet = passwordRequirements.every((req) => req.met);
  const passwordsMatch = newPassword && confirmPassword && newPassword === confirmPassword;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!token) {
      setError('Reset link is invalid or missing token.');
      return;
    }

    if (!passwordsMatch) {
      setError('Passwords do not match');
      return;
    }

    if (!allRequirementsMet) {
      setError('Please meet all password requirements');
      return;
    }

    setLoading(true);
    try {
      await api.post('/auth/reset-password', {
        token,
        newPassword,
        confirmPassword,
      });

      setSuccess('Password reset successful. Redirecting to login...');
      setTimeout(() => {
        router.push('/login');
      }, 2000);
    } catch (err) {
      setError(getApiErrorMessage(err, 'Failed to reset password. Please request a new reset link.'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12">
      <div className="max-w-md w-full">
        <div className="flex flex-col items-center mb-8">
          <AppLogo size="lg" showText={true} className="justify-center" />
          <h1 className="text-3xl font-bold text-white mt-6 mb-1">Set New Password</h1>
          <p className="text-slate-400">Create a secure password for your account</p>
        </div>

        <div className="bg-white/5 backdrop-blur-md rounded-3xl shadow-2xl border border-white/10 p-8">
          {error && (
            <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-xl flex items-start gap-3">
              <XCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
              <p className="text-red-300 text-sm font-medium">{error}</p>
            </div>
          )}

          {success && (
            <div className="mb-6 p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-xl flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
              <p className="text-emerald-300 text-sm font-medium">{success}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-bold text-slate-300 mb-2">New Password</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                  className="w-full pl-10 pr-4 py-3.5 bg-white/5 border border-white/15 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-white"
                  placeholder="Enter new password"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-300 mb-2">Confirm Password</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  className="w-full pl-10 pr-4 py-3.5 bg-white/5 border border-white/15 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-white"
                  placeholder="Confirm new password"
                />
              </div>
            </div>

            {newPassword && (
              <div className="mt-2 p-4 bg-white/5 rounded-xl border border-white/10">
                <p className="text-xs font-bold text-slate-400 mb-2">Password Requirements:</p>
                <div className="space-y-1.5">
                  {passwordRequirements.map((req, index) => (
                    <div key={index} className="flex items-center gap-2 text-xs">
                      {req.met ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                      ) : (
                        <XCircle className="w-4 h-4 text-slate-600 flex-shrink-0" />
                      )}
                      <span className={req.met ? 'text-emerald-400 font-semibold' : 'text-slate-500 font-medium'}>{req.label}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={loading || !passwordsMatch || !allRequirementsMet || !token}
              className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-3.5 px-6 rounded-xl font-bold transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <><Loader2 className="w-5 h-5 animate-spin" />Resetting Password...</>
              ) : (
                <>Reset Password<ArrowRight className="w-5 h-5" /></>
              )}
            </button>
          </form>

          <div className="mt-8 pt-6 border-t border-white/10 text-center">
            <Link href="/login" className="text-sm font-bold text-blue-400 hover:text-blue-300 transition-colors hover:underline">
              Back to Login
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
