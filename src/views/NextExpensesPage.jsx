'use client';

import React from 'react';
import NextDashboardShell from '../components/NextDashboardShell';
import NextProtectedRoute from '../components/NextProtectedRoute';
import EmployeeExpenses from './EmployeeExpenses';

export default function NextExpensesPage() {
  return (
    <NextProtectedRoute allowedRoles={['Admin', 'Manager', 'Employee']}>
      <NextDashboardShell>
        <EmployeeExpenses />
      </NextDashboardShell>
    </NextProtectedRoute>
  );
}
