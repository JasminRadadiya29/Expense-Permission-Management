import React from 'react';

// Centralized stat card — dark-themed glass variant
// Props:
// - title: string
// - value: ReactNode
// - subtitle: ReactNode
// - icon: ReactNode (rendered inside colored square)
// - iconBg: Tailwind classes for icon background gradient
export default function StatCard({ title, value, subtitle, icon, iconBg = 'from-blue-500 to-indigo-600' }) {
  return (
    <div className="group bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 p-6 transition-all duration-300 hover:-translate-y-1 hover:bg-white/8 hover:border-white/20 hover:shadow-xl hover:shadow-black/20">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">{title}</p>
          <p className="text-4xl font-bold text-white mb-3">{value}</p>
          <div className="text-sm font-semibold text-slate-400">{subtitle}</div>
        </div>
        <div className={`p-4 bg-gradient-to-br ${iconBg} rounded-xl shadow-lg shadow-black/20 group-hover:scale-110 transition-transform duration-300`}>
          {icon}
        </div>
      </div>
    </div>
  );
}
