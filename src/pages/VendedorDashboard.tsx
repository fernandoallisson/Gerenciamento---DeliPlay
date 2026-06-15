import { useState, useEffect } from 'react';
import { Plus, TrendingUp, DollarSign, Target, Users } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Client, getClients } from '../lib/clients';
import { useAuth } from '../contexts/AuthContext';
import { ClientFormModal } from '../components/clients/ClientFormModal';

export function VendedorDashboard() {
  const { profile } = useAuth();
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);

  const loadClients = async () => {
    try {
      setClients(await getClients());
    } catch (error) {
      console.error('Error loading clients:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadClients();
  }, []);

  const myClients = clients.filter((c) => c.responsavel_id === profile?.id);
  const fechados = myClients.filter((c) => c.status === 'fechado');
  const totalFechado = fechados.reduce((sum, c) => sum + c.valor_pago, 0);
  const totalEstimado = myClients.reduce((sum, c) => sum + c.valor_estimado, 0);
  const perdidos = myClients.filter((c) => c.status === 'perdido');
  const totalPerdido = perdidos.reduce((sum, c) => sum + c.valor_estimado, 0);

  if (loading) return <div className="py-16 text-center text-sm text-slate-500">Carregando...</div>;

  const stats = [
    { label: 'Projetos fechados', value: fechados.length, helper: 'Negócios concluídos', icon: TrendingUp },
    { label: 'Total ganho', value: `R$ ${totalFechado.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`, helper: 'Receita confirmada', icon: DollarSign },
    { label: 'Pipeline', value: `R$ ${totalEstimado.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`, helper: 'Valor em negociação', icon: Target },
    { label: 'Perdidos', value: `R$ ${totalPerdido.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`, helper: 'Oportunidades não convertidas', icon: Users },
  ];

  return (
    <div className="space-y-5 sm:space-y-6">
      <section className="app-panel p-5 sm:p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <span className="eyebrow">Visão comercial</span>
            <h1 className="page-title mt-3">Dashboard</h1>
            <p className="page-subtitle mt-2">Bem-vindo, {profile?.name}. Aqui está um resumo rápido da sua operação.</p>
          </div>
          <Button onClick={() => setShowModal(true)} className="w-full justify-center sm:w-auto">
            <Plus size={18} />
            <span>Nova venda</span>
          </Button>
        </div>
      </section>

      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map(({ label, value, helper, icon: Icon }) => (
          <article key={label} className="app-card">
            <div className="stat-icon mb-4"><Icon size={22} /></div>
            <p className="text-sm text-slate-500">{label}</p>
            <p className="mt-2 text-2xl font-semibold text-slate-950">{value}</p>
            <p className="mt-2 text-xs uppercase tracking-[0.12em] text-slate-400">{helper}</p>
          </article>
        ))}
      </section>

      <ClientFormModal isOpen={showModal} onClose={() => setShowModal(false)} onSuccess={loadClients} />
    </div>
  );
}
