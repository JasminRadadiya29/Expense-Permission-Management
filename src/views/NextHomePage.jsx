'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../contexts/AuthContext';

export default function NextHomePage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;
    if (user) {
      router.replace('/dashboard');
    } else {
      router.replace('/login');
    }
  }, [user, loading, router]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <p className="text-slate-300">Loading...</p>
    </div>
  );
}
