import { LayoutDashboard, Users, DollarSign, TrendingUp, UserCog, FileText, Package, CheckSquare, X } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { BrandLogo } from '../branding/BrandLogo';

interface SidebarProps {
  activePage: string;
  onNavigate: (page: string) => void;
  isOpen: boolean;
  onClose: () => void;
}

export function Sidebar({ activePage, onNavigate, isOpen, onClose }: SidebarProps) {
  const { profile } = useAuth();
  const isCEO = profile?.role === 'CEO';

  const vendedorLinks = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'clientes', label: 'Clientes', icon: Users },
    { id: 'products', label: 'Produtos', icon: Package },
    { id: 'tasks', label: 'Tarefas', icon: CheckSquare },
  ];

  const ceoLinks = [
    { id: 'dashboard', label: 'Dashboard CEO', icon: TrendingUp },
    { id: 'clientes', label: 'Clientes', icon: Users },
    { id: 'contas-pagar', label: 'Contas a pagar', icon: DollarSign },
    { id: 'recebimentos', label: 'Recebimentos', icon: FileText },
    { id: 'vendedores', label: 'Vendedores', icon: UserCog },
    { id: 'products', label: 'Produtos', icon: Package },
    { id: 'tasks', label: 'Tarefas', icon: CheckSquare },
  ];

  const links = isCEO ? ceoLinks : vendedorLinks;

  return (
    <>
      {isOpen && <div className="fixed inset-0 z-40 bg-slate-950/50 backdrop-blur-sm lg:hidden" onClick={onClose} />}

      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-72 flex-col border-r border-white/10 bg-[var(--ali-navy)] text-white shadow-2xl transition-transform duration-300 lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex items-center justify-between border-b border-white/10 px-5 py-5">
          <BrandLogo dark />
          <button onClick={onClose} className="rounded-xl p-2 text-cyan-50 transition hover:bg-white/10 lg:hidden">
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 px-4 py-5">
          <div className="mb-4 px-3">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-cyan-100/70">Navegação</p>
          </div>
          <nav className="space-y-2">
            {links.map((link) => {
              const Icon = link.icon;
              const isActive = activePage === link.id;

              return (
                <button
                  key={link.id}
                  onClick={() => onNavigate(link.id)}
                  className={`flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-left text-sm font-medium transition ${
                    isActive
                      ? 'bg-white text-[var(--ali-navy)] shadow-lg shadow-cyan-950/20'
                      : 'text-slate-100 hover:bg-white/10 hover:text-white'
                  }`}
                >
                  <span className={`flex h-10 w-10 items-center justify-center rounded-xl ${isActive ? 'bg-cyan-100 text-[var(--ali-navy)]' : 'bg-white/10 text-cyan-100'}`}>
                    <Icon size={18} />
                  </span>
                  <span>{link.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        <div className="border-t border-white/10 px-5 py-4">
          <div className="rounded-2xl bg-white/5 p-4">
            <p className="text-sm font-medium text-white">Painel ALI Digital</p>
          </div>
        </div>
      </aside>
    </>
  );
}
