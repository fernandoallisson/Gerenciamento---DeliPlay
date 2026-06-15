import { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2 } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Client, getClients, deleteClient } from '../lib/clients';
import { useAuth } from '../contexts/AuthContext';
import { ClientFormModal } from '../components/clients/ClientFormModal';

export function ClientsPage() {
  const { profile } = useAuth();
  const isCEO = profile?.role === 'CEO';
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  const today = new Date().toISOString().split('T')[0];

  const loadClients = async () => {
    try {
      const data = await getClients();
      setClients(data);
    } catch (error) {
      console.error('Error loading clients:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadClients();
  }, []);

  const handleEdit = (client: Client) => {
    setEditingClient(client);
    setShowModal(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir este cliente?')) return;

    try {
      await deleteClient(id);
      loadClients();
    } catch (error) {
      console.error('Error deleting client:', error);
      alert('Erro ao excluir cliente');
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingClient(null);
  };

  if (loading) {
    return <div className="flex items-center justify-center h-64"><p className="text-slate-500">Carregando...</p></div>;
  }

  return (
    <div className="space-y-5 sm:space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="page-title">Clientes</h1>
          <p className="page-subtitle">Gerenciar todos os clientes</p>
        </div>
        <Button onClick={() => setShowModal(true)} className="flex items-center space-x-2 w-full sm:w-auto">
          <Plus size={18} />
          <span>Novo Cliente</span>
        </Button>
      </div>

      <div className="table-shell hidden md:block">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="table-head border-b border-slate-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Empresa</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Prioridade</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Valor Estimado</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Valor Pago</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Recorrência</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Cobrança</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">Ações</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-slate-200">
              {clients.map((client) => {
                const isOverdueDate = !!client.next_billing_date && client.next_billing_date < today;
                const isOverdue = client.billing_status === 'overdue' || isOverdueDate;

                return (
                <tr key={client.id} className={`transition hover:bg-cyan-50/60 ${isOverdue ? 'bg-rose-50/40' : ''}`}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <div>
                        <div className="text-sm font-medium text-slate-900">{client.empresa}</div>
                        {client.contato_nome && <div className="text-sm text-slate-500">{client.contato_nome}</div>}
                      </div>
                      {client.website && (
                        <a
                          href={client.website}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:text-blue-800 transition-colors"
                          title="Visitar site"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
                            <polyline points="15 3 21 3 21 9"></polyline>
                            <line x1="10" y1="14" x2="21" y2="3"></line>
                          </svg>
                        </a>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <Badge variant={client.status}>{client.status}</Badge>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <Badge variant={client.prioridade}>{client.prioridade}</Badge>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900">
                    R$ {client.valor_estimado.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-emerald-600">
                    R$ {client.valor_pago.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900">
                    {client.recurring_fee != null
                      ? `R$ ${client.recurring_fee.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`
                      : '—'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {client.billing_status ? <Badge variant={client.billing_status}>{client.billing_status}</Badge> : '—'}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end space-x-2">
                      <button
                        onClick={() => handleEdit(client)}
                        className="p-2 rounded-lg bg-cyan-50 text-cyan-700 hover:bg-cyan-100 transition-colors"
                      >
                        <Edit2 size={18} />
                      </button>
                      {isCEO && (
                        <button
                          onClick={() => handleDelete(client.id)}
                          className="p-2 rounded-lg bg-rose-50 text-rose-700 hover:bg-rose-100 transition-colors"
                        >
                          <Trash2 size={18} />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              )})}
            </tbody>
          </table>
        </div>
      </div>

      <div className="space-y-3 md:hidden">
        {clients.map((client) => {
          const isOverdueDate = !!client.next_billing_date && client.next_billing_date < today;
          const isOverdue = client.billing_status === 'overdue' || isOverdueDate;

          return (
          <div key={client.id} className={`mobile-card ${isOverdue ? 'ring-1 ring-rose-200' : ''}`}>
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold text-slate-900">{client.empresa}</h3>
                  {client.website && (
                    <a
                      href={client.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-800 transition-colors"
                      title="Visitar site"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
                        <polyline points="15 3 21 3 21 9"></polyline>
                        <line x1="10" y1="14" x2="21" y2="3"></line>
                      </svg>
                    </a>
                  )}
                </div>
                {client.contato_nome && (
                  <p className="text-sm text-slate-500">{client.contato_nome}</p>
                )}
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => handleEdit(client)}
                  className="p-2 rounded-lg bg-cyan-50 text-cyan-700"
                >
                  <Edit2 size={16} />
                </button>
                {isCEO && (
                  <button
                    onClick={() => handleDelete(client.id)}
                    className="p-2 rounded-lg bg-rose-50 text-rose-700"
                  >
                    <Trash2 size={16} />
                  </button>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-500">Status</span>
                <Badge variant={client.status}>{client.status}</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-500">Prioridade</span>
                <Badge variant={client.prioridade}>{client.prioridade}</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-500">Valor Estimado</span>
                <span className="text-sm font-medium">R$ {client.valor_estimado.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-500">Valor Pago</span>
                <span className="text-sm font-medium text-emerald-600">R$ {client.valor_pago.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
              </div>
              {client.recurring_fee != null && (
                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-500">Recorrência</span>
                  <span className="text-sm font-medium">R$ {client.recurring_fee.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                </div>
              )}
              {client.billing_status && (
                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-500">Cobrança</span>
                  <Badge variant={client.billing_status}>{client.billing_status}</Badge>
                </div>
              )}
            </div>
          </div>
        )})}
      </div>

      <ClientFormModal
        isOpen={showModal}
        onClose={handleCloseModal}
        onSuccess={() => {
          loadClients();
          handleCloseModal();
        }}
        client={editingClient}
      />
    </div>
  );
}
