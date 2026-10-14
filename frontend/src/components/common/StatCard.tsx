import React from 'react';
import { LucideIcon } from 'lucide-react';

interface StatCardProps {
  label: string;
  value: string | number;
  subtext?: string;
  icon: LucideIcon;
  accentColor?: 'blue' | 'emerald' | 'purple' | 'amber' | 'slate';
  onClick?: () => void;
}

export const StatCard: React.FC<StatCardProps> = ({
  label,
  value,
  subtext,
  icon: Icon,
  accentColor = 'blue',
  onClick
}) => {
  const accentIconStyles = {
    blue: 'bg-blue-50 text-blue-600 border-blue-100',
    emerald: 'bg-emerald-50 text-emerald-600 border-emerald-100',
    purple: 'bg-purple-50 text-purple-600 border-purple-100',
    amber: 'bg-amber-50 text-amber-600 border-amber-100',
    slate: 'bg-slate-100 text-slate-700 border-slate-200',
  }[accentColor];

  return (
    <div 
      onClick={onClick}
      className={`bg-white border border-slate-200/90 rounded-xl p-5 shadow-xs transition-all ${
        onClick ? 'cursor-pointer hover:border-slate-300 hover:shadow-sm' : ''
      }`}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-medium text-slate-500 tracking-wide uppercase">{label}</p>
          <p className="mt-2 text-2xl font-bold tracking-tight text-slate-900 font-mono tabular-nums">
            {value}
          </p>
          {subtext && (
            <p className="mt-1 text-xs text-slate-500 font-medium">
              {subtext}
            </p>
          )}
        </div>
        <div className={`p-2.5 rounded-lg border ${accentIconStyles} shrink-0`}>
          <Icon className="w-5 h-5" />
        </div>
      </div>
    </div>
  );
};
