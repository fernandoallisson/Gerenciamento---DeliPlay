import { ReactNode } from 'react';

interface BadgeProps {
  variant?: 'alta' | 'media' | 'baixa' | 'lead' | 'proposta' | 'negociacao' | 'fechado' | 'perdido' | 'standby' | 'pending' | 'in_progress' | 'completed' | 'cancelled' | 'low' | 'medium' | 'high' | 'active' | 'inactive' | 'overdue';
  children: ReactNode;
  className?: string;
}

export function Badge({ variant = 'media', children, className = '' }: BadgeProps) {
  const variantStyles = {
    alta: 'bg-rose-50 text-rose-700 border border-rose-200',
    media: 'bg-amber-50 text-amber-700 border border-amber-200',
    baixa: 'bg-emerald-50 text-emerald-700 border border-emerald-200',
    lead: 'bg-cyan-50 text-cyan-700 border border-cyan-200',
    proposta: 'bg-indigo-50 text-indigo-700 border border-indigo-200',
    negociacao: 'bg-orange-50 text-orange-700 border border-orange-200',
    fechado: 'bg-emerald-50 text-emerald-700 border border-emerald-200',
    perdido: 'bg-slate-100 text-slate-700 border border-slate-200',
    standby: 'bg-violet-50 text-violet-700 border border-violet-200',
    pending: 'bg-cyan-50 text-cyan-700 border border-cyan-200',
    in_progress: 'bg-amber-50 text-amber-700 border border-amber-200',
    completed: 'bg-emerald-50 text-emerald-700 border border-emerald-200',
    cancelled: 'bg-slate-100 text-slate-700 border border-slate-200',
    active: 'bg-emerald-50 text-emerald-700 border border-emerald-200',
    inactive: 'bg-slate-100 text-slate-700 border border-slate-200',
    overdue: 'bg-rose-50 text-rose-700 border border-rose-200',
    low: 'bg-emerald-50 text-emerald-700 border border-emerald-200',
    medium: 'bg-amber-50 text-amber-700 border border-amber-200',
    high: 'bg-rose-50 text-rose-700 border border-rose-200',
  };

  return <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold capitalize ${variantStyles[variant]} ${className}`}>{children}</span>;
}
