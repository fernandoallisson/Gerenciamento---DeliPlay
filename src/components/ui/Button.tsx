import { ButtonHTMLAttributes, ReactNode } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  children: ReactNode;
}

export function Button({
  variant = 'primary',
  size = 'md',
  className = '',
  children,
  ...props
}: ButtonProps) {
  const baseStyles = 'inline-flex items-center gap-2 rounded-2xl font-semibold transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-cyan-200 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50';

  const variantStyles = {
    primary: 'bg-[var(--dp-navy)] text-white shadow-lg shadow-slate-900/10 hover:-translate-y-0.5 hover:bg-[#1a2942]',
    secondary: 'bg-[var(--dp-cyan)] text-[var(--dp-navy)] shadow-lg shadow-cyan-500/20 hover:-translate-y-0.5 hover:bg-[var(--dp-cyan-dark)]',
    danger: 'bg-[var(--dp-danger)] text-white shadow-lg shadow-rose-500/20 hover:-translate-y-0.5 hover:bg-rose-600',
    ghost: 'border border-slate-200 bg-white text-[var(--dp-navy)] hover:border-cyan-200 hover:bg-cyan-50',
  };

  const sizeStyles = {
    sm: 'px-3 py-2 text-sm',
    md: 'px-4 py-2.5 text-sm sm:text-base',
    lg: 'px-6 py-3 text-base',
  };

  return (
    <button className={`${baseStyles} ${variantStyles[variant]} ${sizeStyles[size]} ${className}`} {...props}>
      {children}
    </button>
  );
}
