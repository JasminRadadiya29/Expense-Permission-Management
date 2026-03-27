'use client';

import React from 'react';
import NextDashboardShell from '../components/NextDashboardShell';
import NextProtectedRoute from '../components/NextProtectedRoute';
import AuditLogs from './AuditLogs';

export default function NextAuditLogsPage() {
  return (
    <NextProtectedRoute allowedRoles={['Admin']}>
      <NextDashboardShell>
        <AuditLogs />
      </NextDashboardShell>
    </NextProtectedRoute>
  );
}