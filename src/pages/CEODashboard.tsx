import { useState, useEffect } from 'react';
import { DollarSign, Target, TrendingDown, Users } from 'lucide-react';
import { Client, getClients } from '../lib/clients';
import { getReceivables } from '../lib/finance';

export function CEODashboard() {
  const [clients, setClients] = useState<Client[]>([]);
  const [receivables, setReceivables] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [clientsData, receivablesData] = await Promise.all([getClients(), getReceivables()]);
        setClients(clientsData);
        setReceivables(receivablesData);
      } catch (error) {
        console.error('Error loading data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const totalGanho = receivables.reduce((sum, r) => sum + r.valor, 0);
  const totalPipeline = clients.filter((c) => ['lead', 'proposta', 'negociacao'].includes(c.status)).reduce((sum, c) => sum + c.valor_estimado, 0);
  const perdidos = clients.filter((c) => c.status === 'perdido');
  const totalPerdido = perdidos.reduce((sum, c) => sum + c.valor_estimado, 0);

  if (loading) return <div className="py-16 text-center text-sm text-slate-500">Carregando...</div>;

  const stats = [
    { label: 'Total ganho', value: `R$ ${totalGanho.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`, helper: `${receivables.length} recebimentos`, icon: DollarSign },
    { label: 'Pipeline ativo', value: `R$ ${totalPipeline.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`, helper: 'Oportunidades em aberto', icon: Target },
    { label: 'Perdas estimadas', value: `R$ ${totalPerdido.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`, helper: `${perdidos.length} oportunidades perdidas`, icon: TrendingDown },
    { label: 'Total de clientes', value: clients.length, helper: 'Base completa da operação', icon: Users },
  ];

  return (
    <div className="space-y-5 sm:space-y-6">
      <section className="app-panel p-5 sm:p-6">
        <span className="eyebrow">Visão executiva</span>
        <h1 className="page-title mt-3">Dashboard CEO</h1>
        <p className="page-subtitle mt-2">Resumo financeiro e comercial da ALI Digital</p>
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
    </div>
  );
}
