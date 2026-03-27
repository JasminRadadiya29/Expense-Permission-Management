'use client';

import React from 'react';
import NextDashboardShell from '../components/NextDashboardShell';
import NextProtectedRoute from '../components/NextProtectedRoute';
import ApprovalRules from './ApprovalRules';

export default function NextApprovalRulesPage() {
  return (
    <NextProtectedRoute allowedRoles={['Admin']}>
      <NextDashboardShell>
        <ApprovalRules />
      </NextDashboardShell>
    </NextProtectedRoute>
  );
}
