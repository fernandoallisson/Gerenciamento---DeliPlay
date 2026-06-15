import { useState } from 'react';
import { LogOut, User, Menu, Lock } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { Button } from '../ui/Button';
import { BrandLogo } from '../branding/BrandLogo';
import { ChangePasswordModal } from '../auth/ChangePasswordModal';

interface HeaderProps {
  onMenuClick: () => void;
}

export function Header({ onMenuClick }: HeaderProps) {
  const { user, profile, signOut } = useAuth();
  const [showPasswordModal, setShowPasswordModal] = useState(false);

  return (
    <header className="sticky top-0 z-30 border-b border-white/60 bg-white/75 backdrop-blur-xl">
      <div className="mx-auto flex w-full max-w-7xl items-center justify-between gap-3 px-4 py-3 sm:px-6 lg:px-8">
        <div className="flex min-w-0 items-center gap-3">
          <button
            onClick={onMenuClick}
            className="rounded-2xl border border-slate-200 bg-white p-2.5 text-slate-700 shadow-sm transition hover:border-cyan-200 hover:text-[var(--dp-navy)] lg:hidden"
          >
            <Menu size={22} />
          </button>
          <div className="lg:hidden">
            <BrandLogo compact />
          </div>
          <div className="hidden lg:block">
            <span className="eyebrow">DeliPlay CRM</span>
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-4">
          <div className="hidden items-center gap-3 rounded-2xl border border-slate-200 bg-white px-3 py-2 shadow-sm sm:flex">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[var(--dp-surface-soft)] text-[var(--dp-navy)]">
              <User size={18} />
            </div>
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-slate-900">{profile?.name}</p>
              <p className="text-xs uppercase tracking-[0.12em] text-slate-500">{profile?.role}</p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowPasswordModal(true)}
            title="Alterar senha"
            className="!rounded-2xl"
          >
            <Lock size={16} />
            <span className="hidden sm:inline">Senha</span>
          </Button>
          <Button variant="ghost" size="sm" onClick={signOut} className="!rounded-2xl">
            <LogOut size={16} />
            <span className="hidden sm:inline">Sair</span>
          </Button>
        </div>

        {user && (
          <ChangePasswordModal
            isOpen={showPasswordModal}
            onClose={() => setShowPasswordModal(false)}
            userId={user.id}
          />
        )}
      </div>
    </header>
  );
}
