'use client';

import React from 'react';
import ErrorBoundary from './ErrorBoundary';
import { ToastProvider } from './Toast.jsx';
import { AuthProvider } from '../contexts/AuthContext';
import { ShootingStarsBackground } from './ShootingStarsBackground.jsx';

export default function NextPageProviders({ children }) {
  return (
    <ErrorBoundary>
      <ToastProvider>
        <AuthProvider>
          <ShootingStarsBackground />
          {children}
        </AuthProvider>
      </ToastProvider>
    </ErrorBoundary>
  );
}
