import React, { useState } from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { LogOut, LayoutDashboard, Receipt, CheckSquare, Users, Settings, Key, Menu, X } from 'lucide-react';
import { NavLink as RouterNavLink } from "react-router-dom";
import AppLogo from './AppLogo';


const Layout = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isActive = (path) => {
    return location.pathname === path || location.pathname.startsWith(path + '/');
  };

  const NavLink = ({ to, icon: Icon, children, onClick }) => {
    const active = isActive(to);
    return (
      <Link
        to={to}
        onClick={onClick}
        className={`flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-all duration-300 ${active
          ? 'bg-white/20 text-white shadow-md border border-white/30 font-semibold'
          : 'text-slate-300 hover:text-white hover:bg-white/10'
          }`}
      >
        <Icon size={18} />
        <span>{children}</span>
      </Link>
    );
  };

  return (
    <div className="min-h-screen">
      {/* Navigation Bar */}
      <nav
        className="sticky top-4 z-50 bg-gradient-to-r from-white/10 via-white/5 to-white/10 backdrop-blur-2xl border border-white/20 shadow-lg rounded-2xl max-w-6xl mx-auto px-6 py-3 transition-all duration-300"
      >
        <div className="flex justify-between items-center">
          {/* Logo */}
          <Link to="/dashboard" className="flex items-center group">
            <AppLogo size="sm" showText={true} />          
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center gap-3">
            <NavLink to="/dashboard" icon={LayoutDashboard}>
              Dashboard
            </NavLink>

            {(user?.role === 'Employee' || user?.role === 'Manager' || user?.role === 'Admin') && (
              <NavLink to="/expenses" icon={Receipt}>
                Expenses
              </NavLink>
            )}

            {user?.role === 'Admin' && (
              <>
                <NavLink to="/approvals" icon={CheckSquare}>
                  Approvals
                </NavLink>
                <NavLink to="/approval-rules" icon={Settings}>
                  Rules
                </NavLink>
              </>
            )}
          </div>

          {/* User Menu */}
          <div className="flex items-center gap-4">
            {/* User Info */}
            <div className="hidden md:block text-right">
              <div className="text-sm font-semibold text-white">{user?.name}</div>
              <div className="text-xs text-slate-500 font-medium mt-0.5">
                <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
                  {user?.role}
                </span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="hidden sm:flex items-center gap-3">
              <Link
                to="/change-password"
                className="flex items-center gap-2 px-3 py-2 text-slate-300 hover:text-white hover:bg-white/10 rounded-xl transition-all duration-200"
                title="Change Password"
              >
                <Key size={18} />
              </Link>

              <button
                onClick={handleLogout}
                className="flex items-center gap-2 px-4 py-2 bg-white/10 text-slate-200 hover:bg-red-500/20 hover:text-red-300 border border-white/10 rounded-xl font-medium transition-all duration-200"
                title="Logout"
              >
                <LogOut size={18} />
                <span className="hidden xl:inline">Logout</span>
              </button>
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 text-slate-300 hover:text-white hover:bg-white/10 rounded-xl transition-all duration-200"
            >
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="lg:hidden mt-3 py-3 border-t border-white/20">
            {/* User Info - Mobile */}
            <div className="px-4 py-3 mb-3 bg-white/5 rounded-xl border border-white/10">
              <div className="text-sm font-semibold text-white">{user?.name}</div>
              <div className="text-xs text-slate-400 mt-1">
                <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-white/10 text-slate-200">
                  {user?.role}
                </span>
              </div>
            </div>

            <div className="space-y-1">
              <NavLink to="/dashboard" icon={LayoutDashboard} onClick={() => setMobileMenuOpen(false)}>
                Dashboard
              </NavLink>

              {(user?.role === 'Employee' || user?.role === 'Manager' || user?.role === 'Admin') && (
                <NavLink to="/expenses" icon={Receipt} onClick={() => setMobileMenuOpen(false)}>
                  Expenses
                </NavLink>
              )}

              {(user?.role === 'Manager' || user?.role === 'Admin') && (
                <NavLink to="/approvals" icon={CheckSquare} onClick={() => setMobileMenuOpen(false)}>
                  Approvals
                </NavLink>
              )}

              {user?.role === 'Admin' && (
                <>
                  <NavLink to="/users" icon={Users} onClick={() => setMobileMenuOpen(false)}>
                    Users
                  </NavLink>
                  <NavLink to="/approval-rules" icon={Settings} onClick={() => setMobileMenuOpen(false)}>
                    Rules
                  </NavLink>
                </>
              )}

              <div className="pt-3 mt-3 border-t border-white/10 space-y-1">
                <Link
                  to="/change-password"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-2 px-4 py-2.5 text-slate-300 hover:text-white hover:bg-white/10 rounded-xl font-medium transition-all duration-200"
                >
                  <Key size={18} />
                  <span>Change Password</span>
                </Link>

                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    handleLogout();
                  }}
                  className="w-full flex items-center gap-2 px-4 py-2.5 bg-red-500/10 text-red-400 hover:bg-red-500/20 hover:text-red-300 rounded-xl font-medium transition-all duration-200"
                >
                  <LogOut size={18} />
                  <span>Logout</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </nav>


      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <Outlet />
      </main>
    </div>
  );
};

export default Layout;