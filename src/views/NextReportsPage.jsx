'use client';

import React from 'react';
import NextDashboardShell from '../components/NextDashboardShell';
import NextProtectedRoute from '../components/NextProtectedRoute';
import Reports from './Reports';

export default function NextReportsPage() {
  return (
    <NextProtectedRoute allowedRoles={['Admin']}>
      <NextDashboardShell>
        <Reports />
      </NextDashboardShell>
    </NextProtectedRoute>
  );
}
