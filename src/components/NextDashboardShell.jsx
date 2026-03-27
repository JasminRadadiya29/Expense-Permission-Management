'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { LayoutDashboard, Receipt, CheckSquare, Users, Settings, ShieldCheck, BarChart3, Key, LogOut, Menu, X } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import AppLogo from './AppLogo';

const navItemClass = (active) =>
  `flex items-center gap-2 rounded-lg px-3 py-2 text-xs sm:text-sm font-medium whitespace-nowrap transition-all duration-300 ${
    active
      ? 'bg-blue-500/20 text-blue-200 shadow-md border border-blue-400/30'
      : 'text-slate-300 hover:text-white hover:bg-white/10'
  }`;

export default function NextDashboardShell({ children }) {
  const { user, logout } = useAuth();
  const pathname = usePathname();
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  return (
    <div className="min-h-screen">
      <nav className="sticky top-3 z-50 bg-gradient-to-r from-slate-900/80 via-slate-800/80 to-slate-900/80 backdrop-blur-xl border border-white/10 shadow-2xl rounded-2xl max-w-7xl mx-auto px-4 sm:px-6 py-3 transition-all duration-300">
        <div className="flex justify-between items-center gap-2 sm:gap-4">
          {/* Logo */}
          <Link href="/dashboard" className="flex items-center flex-shrink-0">
            <AppLogo size="sm" showText={false} />
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center gap-2 flex-wrap justify-center flex-1">
            <Link href="/dashboard" className={navItemClass(pathname === '/dashboard')}>
              <LayoutDashboard size={16} />
              <span>Dashboard</span>
            </Link>

            <Link href="/expenses" className={navItemClass(pathname.startsWith('/expenses'))}>
              <Receipt size={16} />
              <span>Expenses</span>
            </Link>

            {(user?.role === 'Manager' || user?.role === 'Admin') && (
              <Link href="/approvals" className={navItemClass(pathname.startsWith('/approvals'))}>
                <CheckSquare size={16} />
                <span>Approvals</span>
              </Link>
            )}

            {user?.role === 'Admin' && (
              <>
                <Link href="/users" className={navItemClass(pathname.startsWith('/users'))}>
                  <Users size={16} />
                  <span>Users</span>
                </Link>
                <Link href="/approval-rules" className={navItemClass(pathname.startsWith('/approval-rules'))}>
                  <Settings size={16} />
                  <span>Rules</span>
                </Link>
                <Link href="/reports" className={navItemClass(pathname.startsWith('/reports'))}>
                  <BarChart3 size={16} />
                  <span>Reports</span>
                </Link>
                <Link href="/audit-logs" className={navItemClass(pathname.startsWith('/audit-logs'))}>
                  <ShieldCheck size={16} />
                  <span>Audit Logs</span>
                </Link>
              </>
            )}
          </div>

          {/* Right Section */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Desktop Controls */}
            <div className="hidden sm:flex items-center gap-2">
              <Link
                href="/change-password"
                className="flex items-center gap-2 px-2 sm:px-3 py-2 text-slate-300 hover:text-white hover:bg-white/10 rounded-lg transition-all duration-200 text-sm"
                title="Change Password"
              >
                <Key size={16} />
                <span className="hidden md:inline">Password</span>
              </Link>

              <button
                onClick={handleLogout}
                className="flex items-center gap-2 px-3 sm:px-4 py-2 bg-red-500/10 text-red-300 hover:bg-red-500/20 border border-red-400/30 rounded-lg font-medium transition-all duration-200 text-sm"
                title="Logout"
              >
                <LogOut size={16} />
                <span className="hidden md:inline">Logout</span>
              </button>
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 hover:bg-white/10 rounded-lg transition-all duration-200"
              title={mobileMenuOpen ? 'Close menu' : 'Open menu'}
            >
              {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Menu */}
        {mobileMenuOpen && (
          <div className="lg:hidden mt-4 pt-4 border-t border-white/10 flex flex-col gap-2">
            <Link href="/dashboard" className={navItemClass(pathname === '/dashboard')}>
              <LayoutDashboard size={16} />
              <span>Dashboard</span>
            </Link>

            <Link href="/expenses" className={navItemClass(pathname.startsWith('/expenses'))}>
              <Receipt size={16} />
              <span>Expenses</span>
            </Link>

            {(user?.role === 'Manager' || user?.role === 'Admin') && (
              <Link href="/approvals" className={navItemClass(pathname.startsWith('/approvals'))}>
                <CheckSquare size={16} />
                <span>Approvals</span>
              </Link>
            )}

            {user?.role === 'Admin' && (
              <>
                <Link href="/users" className={navItemClass(pathname.startsWith('/users'))}>
                  <Users size={16} />
                  <span>Users</span>
                </Link>
                <Link href="/approval-rules" className={navItemClass(pathname.startsWith('/approval-rules'))}>
                  <Settings size={16} />
                  <span>Rules</span>
                </Link>
                <Link href="/reports" className={navItemClass(pathname.startsWith('/reports'))}>
                  <BarChart3 size={16} />
                  <span>Reports</span>
                </Link>
                <Link href="/audit-logs" className={navItemClass(pathname.startsWith('/audit-logs'))}>
                  <ShieldCheck size={16} />
                  <span>Audit Logs</span>
                </Link>
              </>
            )}

            <div className="pt-4 border-t border-white/10 flex gap-2">
              <Link
                href="/change-password"
                className="flex items-center gap-2 flex-1 px-3 py-2 text-slate-300 hover:text-white hover:bg-white/10 rounded-lg transition-all duration-200 text-sm"
              >
                <Key size={16} />
                <span>Password</span>
              </Link>

              <button
                onClick={handleLogout}
                className="flex items-center gap-2 flex-1 px-3 py-2 bg-red-500/10 text-red-300 hover:bg-red-500/20 border border-red-400/30 rounded-lg font-medium transition-all duration-200 text-sm"
              >
                <LogOut size={16} />
                <span>Logout</span>
              </button>
            </div>
          </div>
        )}
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">{children}</main>
    </div>
  );
}
