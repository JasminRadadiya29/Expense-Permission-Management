'use client';

import React from 'react';
import NextDashboardShell from '../components/NextDashboardShell';
import NextProtectedRoute from '../components/NextProtectedRoute';
import AdminDashboard from './AdminDashboard';

export default function NextUsersPage() {
  return (
    <NextProtectedRoute allowedRoles={['Admin']}>
      <NextDashboardShell>
        <AdminDashboard />
      </NextDashboardShell>
    </NextProtectedRoute>
  );
}
