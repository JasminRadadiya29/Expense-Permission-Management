'use client';

import React from 'react';
import NextDashboardShell from '../components/NextDashboardShell';
import NextProtectedRoute from '../components/NextProtectedRoute';
import ManagerDashboard from './ManagerDashboard';

export default function NextApprovalsPage() {
  return (
    <NextProtectedRoute allowedRoles={['Admin', 'Manager']}>
      <NextDashboardShell>
        <ManagerDashboard />
      </NextDashboardShell>
    </NextProtectedRoute>
  );
}
