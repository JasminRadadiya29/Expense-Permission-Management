'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { CheckCircle2, XCircle, Loader2 } from 'lucide-react';
import AppLogo from '../components/AppLogo';
import { useAuth } from '../contexts/AuthContext';
import { getApiErrorMessage } from '../services/api';
import SelectField from '../components/SelectField.jsx';

export default function NextSignupPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [country, setCountry] = useState('');
  const [countries, setCountries] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { signup } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!error) return;
    const timer = setTimeout(() => setError(''), 3000);
    return () => clearTimeout(timer);
  }, [error]);

  useEffect(() => {
    fetch('https://restcountries.com/v3.1/all?fields=name')
      .then((res) => res.json())
      .then((data) => setCountries(data.map((c) => c.name.common).sort()))
      .catch(() => setError('Failed to load countries'));
  }, []);

  const passwordRequirements = [
    { label: 'At least 8 characters', met: password.length >= 8 },
    { label: 'Contains uppercase letter', met: /[A-Z]/.test(password) },
    { label: 'Contains lowercase letter', met: /[a-z]/.test(password) },
    { label: 'Contains number', met: /\d/.test(password) },
    { label: 'Contains special character', met: /[!@#$%^&*(),.?":{}|<>]/.test(password) }
  ];

  const allRequirementsMet = passwordRequirements.every((req) => req.met);
  const passwordsMatch = password && confirmPassword && password === confirmPassword;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

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
      await signup(name, email, password, confirmPassword, country);
      router.push('/dashboard');
    } catch (err) {
      setError(getApiErrorMessage(err, 'Signup failed. Please try again.'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12">
      <div className="max-w-md w-full">
        <div className="flex flex-col items-center mb-8">
          <AppLogo size="lg" showText={true} className="justify-center" />
          <h1 className="text-3xl font-bold text-white mt-6 mb-1">Create Account</h1>
          <p className="text-slate-400">Join us to start managing your expenses</p>
        </div>

        <div className="bg-white/5 backdrop-blur-md rounded-3xl shadow-2xl border border-white/10 p-8">
          {error && (
            <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-xl flex items-start gap-3">
              <XCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
              <p className="text-red-300 text-sm font-medium">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="w-full px-4 py-3.5 bg-white/5 border border-white/15 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-white"
              placeholder="Full Name"
            />

            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-4 py-3.5 bg-white/5 border border-white/15 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-white"
              placeholder="Email"
            />

            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full px-4 py-3.5 bg-white/5 border border-white/15 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-white"
              placeholder="Password"
            />

            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              className="w-full px-4 py-3.5 bg-white/5 border border-white/15 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-white"
              placeholder="Confirm Password"
            />

            <SelectField
              value={country}
              onChange={(e) => setCountry(e.target.value)}
              options={countries}
              placeholder="Select Country"
            />

            {password && (
              <div className="mt-3 p-4 bg-white/5 rounded-xl border border-white/10">
                <p className="text-xs font-bold text-slate-400 mb-2">Password Requirements:</p>
                <div className="space-y-1.5">
                  {passwordRequirements.map((req, index) => (
                    <div key={index} className="flex items-center gap-2 text-xs">
                      {req.met ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                      ) : (
                        <XCircle className="w-4 h-4 text-slate-600 flex-shrink-0" />
                      )}
                      <span className={req.met ? 'text-emerald-400 font-semibold' : 'text-slate-500 font-medium'}>
                        {req.label}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={loading || !allRequirementsMet || !passwordsMatch}
              className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-3.5 px-6 rounded-xl font-bold transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <><Loader2 className="w-5 h-5 animate-spin" />Creating Account...</>
              ) : (
                'Sign Up'
              )}
            </button>
          </form>

          <div className="mt-8 pt-6 border-t border-white/10 text-center">
            <p className="text-sm text-slate-400">
              Already have an account?{' '}
              <Link href="/login" className="font-bold text-blue-400 hover:text-blue-300 transition-colors hover:underline">
                Sign In
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
