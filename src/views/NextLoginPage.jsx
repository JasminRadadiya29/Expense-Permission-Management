'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Mail, Lock, Eye, EyeOff, ArrowRight, CheckCircle2, XCircle, Loader2 } from 'lucide-react';
import AppLogo from '../components/AppLogo';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';
import { getApiErrorMessage } from '../services/api';
import { useToast } from '../components/Toast.jsx';

export default function NextLoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [resetMessage, setResetMessage] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const { login } = useAuth();
  const router = useRouter();
  const toast = useToast();

  useEffect(() => {
    if (!error) return;
    const timer = setTimeout(() => setError(''), 3000);
    return () => clearTimeout(timer);
  }, [error]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const user = await login(email, password);
      if (user.isTemporaryPassword) {
        router.push('/change-password');
      } else {
        router.push('/dashboard');
      }
    } catch (err) {
      setError(getApiErrorMessage(err, 'Invalid email or password. Please try again.'));
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    setError('');
    setResetMessage('');
    setLoading(true);

    try {
      await api.post('/auth/forgot-password', { email: resetEmail });

      setResetMessage('If your account exists, a reset link has been sent to your email.');
      toast.success('Password reset link sent.');

      setTimeout(() => {
        setShowForgotPassword(false);
        setResetEmail('');
        setResetMessage('');
      }, 3000);
    } catch (err) {
      setError(getApiErrorMessage(err, 'Failed to send reset link'));
    } finally {
      setLoading(false);
    }
  };

  if (showForgotPassword) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4 py-12">
        <div className="max-w-md w-full">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-white mb-2">Reset Password</h1>
            <p className="text-slate-400 text-lg">Enter your email to receive a secure reset link</p>
          </div>

          <div className="bg-white/5 backdrop-blur-md rounded-3xl shadow-2xl border border-white/10 p-8">
            {error && (
              <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-xl flex items-start gap-3">
                <XCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                <p className="text-red-300 text-sm font-medium">{error}</p>
              </div>
            )}

            {resetMessage && (
              <div className="mb-6 p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-xl flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
                <p className="text-emerald-300 text-sm font-medium">{resetMessage}</p>
              </div>
            )}

            <form onSubmit={handleForgotPassword} className="space-y-6">
              <div>
                <label className="block text-sm font-bold text-slate-300 mb-2">Email Address</label>
                <input
                  type="email"
                  value={resetEmail}
                  onChange={(e) => setResetEmail(e.target.value)}
                  required
                  className="w-full px-4 py-3.5 bg-white/5 border border-white/15 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-white font-medium placeholder-slate-500"
                  placeholder="you@company.com"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white py-3.5 px-6 rounded-xl font-bold transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {loading ? (
                  <><Loader2 className="w-5 h-5 animate-spin" />Sending Reset Email...</>
                ) : (
                  <>Send Reset Email<ArrowRight className="w-5 h-5" /></>
                )}
              </button>

              <button
                type="button"
                onClick={() => setShowForgotPassword(false)}
                className="w-full text-slate-400 hover:text-white text-sm font-semibold transition-colors hover:underline py-2"
              >
                ← Back to Login
              </button>
            </form>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12">
      <div className="max-w-md w-full">
        <div className="flex flex-col items-center mb-8">
          <AppLogo size="lg" showText={true} className="justify-center" />
          <h1 className="text-3xl font-bold text-white mt-6 mb-1">Welcome Back</h1>
          <p className="text-slate-400">Sign in to manage your expenses</p>
        </div>

        <div className="bg-white/5 backdrop-blur-md rounded-3xl shadow-2xl border border-white/10 p-8">
          {error && (
            <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-xl flex items-start gap-3">
              <XCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
              <p className="text-red-300 text-sm font-medium">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-bold text-slate-300 mb-2">Email Address</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-4 py-3.5 bg-white/5 border border-white/15 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-white font-medium placeholder-slate-500"
                placeholder="you@company.com"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-300 mb-2">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full px-4 py-3.5 pr-12 bg-white/5 border border-white/15 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-white font-medium placeholder-slate-500"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 transition-colors"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            <div className="flex justify-end">
              <button
                type="button"
                onClick={() => setShowForgotPassword(true)}
                className="text-sm font-bold text-blue-400 hover:text-blue-300 transition-colors hover:underline"
              >
                Forgot Password?
              </button>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white py-3.5 px-6 rounded-xl font-bold transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <><Loader2 className="w-5 h-5 animate-spin" />Signing In...</>
              ) : (
                <>Sign In<ArrowRight className="w-5 h-5" /></>
              )}
            </button>
          </form>

          <div className="mt-8 pt-6 border-t border-white/10 text-center">
            <p className="text-sm text-slate-400">
              Don't have an account?{' '}
              <Link href="/signup" className="font-bold text-blue-400 hover:text-blue-300 transition-colors hover:underline">
                Sign Up
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
