'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../contexts/AuthContext';
import NextDashboardShell from '../components/NextDashboardShell';
import AdminDashboard from './AdminDashboard';
import ManagerDashboard from './ManagerDashboard';
import EmployeeExpenses from './EmployeeExpenses';

export default function NextDashboardPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.replace('/login');
    }
  }, [loading, user, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-slate-300">Loading...</p>
      </div>
    );
  }

  if (!user) return null;

  let content = <EmployeeExpenses />;
  if (user.role === 'Admin') content = <AdminDashboard />;
  if (user.role === 'Manager') content = <ManagerDashboard />;

  return <NextDashboardShell>{content}</NextDashboardShell>;
}
