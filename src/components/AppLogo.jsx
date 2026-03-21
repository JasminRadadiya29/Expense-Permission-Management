import React from 'react';

// Reusable ExpenseFlow logo component
// size: 'sm' | 'md' | 'lg'
const AppLogo = ({ size = 'md', showText = true, className = '' }) => {
  const sizes = {
    sm: { box: 'w-8 h-8',   text: 'text-sm',  sub: false },
    md: { box: 'w-10 h-10', text: 'text-base', sub: false },
    lg: { box: 'w-16 h-16', text: 'text-2xl',  sub: true  },
  };
  const s = sizes[size] || sizes.md;

  return (
    <div className={`flex items-center gap-2.5 ${className}`}>

      {/* SVG Icon */}
      <div className={`${s.box} flex-shrink-0 drop-shadow-lg`}>
        <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
          <defs>
            <linearGradient id="al-bg" x1="0" y1="0" x2="64" y2="64" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#1e1b4b"/>
              <stop offset="50%" stopColor="#312e81"/>
              <stop offset="100%" stopColor="#1d4ed8"/>
            </linearGradient>
            <linearGradient id="al-wallet" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#6366f1"/>
              <stop offset="100%" stopColor="#4338ca"/>
            </linearGradient>
            <linearGradient id="al-gold" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#fbbf24"/>
              <stop offset="100%" stopColor="#f59e0b"/>
            </linearGradient>
            <linearGradient id="al-green" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#34d399"/>
              <stop offset="100%" stopColor="#059669"/>
            </linearGradient>
          </defs>

          {/* Background */}
          <rect width="64" height="64" rx="15" fill="url(#al-bg)"/>
          <rect width="64" height="64" rx="15" fill="white" fillOpacity="0.06"/>

          {/* Card behind (green) */}
          <rect x="24" y="12" width="22" height="14" rx="3.5" fill="url(#al-green)" transform="rotate(4 24 12)" opacity="0.85"/>
          {/* Card front (gold) */}
          <rect x="30" y="15" width="24" height="15" rx="3.5" fill="url(#al-gold)" transform="rotate(-8 30 15)"/>
          {/* Card chip */}
          <rect x="33" y="18" width="5" height="4" rx="1" fill="#b45309" transform="rotate(-8 33 18)" opacity="0.75"/>

          {/* Wallet body */}
          <rect x="8" y="22" width="40" height="28" rx="5" fill="url(#al-wallet)"/>
          {/* Wallet flap */}
          <rect x="8" y="22" width="40" height="9" rx="5" fill="#4f46e5"/>
          <rect x="8" y="27" width="40" height="4" fill="#4f46e5"/>

          {/* Dollar clasp */}
          <circle cx="48" cy="36" r="6" fill="white" fillOpacity="0.15"/>
          <text x="48" y="40" fontFamily="Arial, sans-serif" fontSize="9" fontWeight="900" fill="white" textAnchor="middle" opacity="0.95">$</text>

          {/* Cash lines */}
          <rect x="12" y="34" width="22" height="2.5" rx="1.25" fill="white" opacity="0.35"/>
          <rect x="12" y="39" width="16" height="2.5" rx="1.25" fill="white" opacity="0.25"/>
          <rect x="12" y="44" width="19" height="2.5" rx="1.25" fill="white" opacity="0.18"/>
        </svg>
      </div>

      {/* Text */}
      {showText && (
        <div className="flex flex-col leading-none">
          <span className={`${s.text} font-extrabold tracking-tight`}>
            <span className="bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent">Expense</span>
            <span className="text-white">Flow</span>
          </span>
          {s.sub && (
            <span className="text-xs text-slate-400 font-medium mt-1">Smart Expense Management</span>
          )}
        </div>
      )}
    </div>
  );
};

export default AppLogo;
