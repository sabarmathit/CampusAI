import React from 'react';
import { 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  XCircle, 
  HelpCircle,
  Calendar,
  Sparkles
} from 'lucide-react';

interface StatusBadgeProps {
  status: string;
  className?: string;
  size?: 'sm' | 'md';
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, className = '', size = 'md' }) => {
  const s = status.toLowerCase();

  let colorClasses = 'text-slate-600 bg-slate-100 border-slate-200';
  let Icon = HelpCircle;

  if (s === 'selected' || s === 'present' || s === 'completed' || s === 'safe' || s === 'graded') {
    colorClasses = 'text-emerald-700 bg-emerald-50 border-emerald-200';
    Icon = CheckCircle2;
  } else if (s === 'scheduled' || s === 'interview scheduled' || s === 'in progress' || s === 'interviewing' || s === 'submitted') {
    colorClasses = 'text-blue-700 bg-blue-50 border-blue-200';
    Icon = Clock;
  } else if (s === 'shortlisted' || s === 'warning' || s === 'review ready') {
    colorClasses = 'text-amber-700 bg-amber-50 border-amber-200';
    Icon = Sparkles;
  } else if (s === 'applied' || s === 'under review') {
    colorClasses = 'text-indigo-700 bg-indigo-50 border-indigo-200';
    Icon = Calendar;
  } else if (s === 'rejected' || s === 'absent' || s === 'critical') {
    colorClasses = 'text-rose-700 bg-rose-50 border-rose-200';
    Icon = XCircle;
  } else if (s === 'on hold' || s === 'rescheduled') {
    colorClasses = 'text-purple-700 bg-purple-50 border-purple-200';
    Icon = AlertCircle;
  }

  const sizeClasses = size === 'sm' 
    ? 'text-xs px-2 py-0.5 gap-1' 
    : 'text-xs px-2.5 py-1 gap-1.5 font-medium';

  return (
    <span className={`inline-flex items-center rounded-md border whitespace-nowrap ${colorClasses} ${sizeClasses} ${className}`}>
      <Icon className={size === 'sm' ? 'w-3 h-3' : 'w-3.5 h-3.5'} />
      <span>{status}</span>
    </span>
  );
};
