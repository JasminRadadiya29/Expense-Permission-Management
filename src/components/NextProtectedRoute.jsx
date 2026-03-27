'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../contexts/AuthContext';

export default function NextProtectedRoute({ children, allowedRoles = null }) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;

    if (!user) {
      router.replace('/login');
      return;
    }

    if (allowedRoles && !allowedRoles.includes(user.role)) {
      router.replace('/dashboard');
    }
  }, [loading, user, allowedRoles, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-slate-300">Loading...</p>
      </div>
    );
  }

  if (!user) return null;

  if (allowedRoles && !allowedRoles.includes(user.role)) return null;

  return children;
}
