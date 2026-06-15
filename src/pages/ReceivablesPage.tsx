import { useState, useEffect } from 'react';
import { Plus, Edit, Trash2 } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Modal } from '../components/ui/Modal';
import { Input } from '../components/ui/Input';
import { Select } from '../components/ui/Select';
import { getReceivables, createReceivable, updateReceivable, deleteReceivable } from '../lib/finance';
import { getClients } from '../lib/clients';

export function ReceivablesPage() {
  const [receivables, setReceivables] = useState<any[]>([]);
  const [clients, setClients] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingReceivable, setEditingReceivable] = useState<any | null>(null);
  const [formData, setFormData] = useState({
    client_id: '',
    descricao: '',
    data_prevista: '',
    valor: '',
    periodicidade: 'unica' as 'mensal' | 'unica',
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [receivablesData, clientsData] = await Promise.all([
        getReceivables(),
        getClients(),
      ]);
      setReceivables(receivablesData);
      setClients(clientsData);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (receivable: any) => {
    setEditingReceivable(receivable);
    setFormData({
      client_id: receivable.client_id,
      descricao: receivable.descricao || '',
      data_prevista: receivable.data_prevista,
      valor: receivable.valor.toString(),
      periodicidade: receivable.periodicidade,
    });
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingReceivable(null);
    setFormData({ client_id: '', descricao: '', data_prevista: '', valor: '', periodicidade: 'unica' });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const receivableData = {
        client_id: formData.client_id,
        descricao: formData.descricao || null,
        data_prevista: formData.data_prevista,
        valor: parseFloat(formData.valor),
        periodicidade: formData.periodicidade,
      };

      if (editingReceivable) {
        await updateReceivable(editingReceivable.id, receivableData);
      } else {
        await createReceivable(receivableData);
      }

      handleCloseModal();
      loadData();
    } catch (error) {
      console.error('Error saving receivable:', error);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir este recebimento?')) return;
    try {
      await deleteReceivable(id);
      loadData();
    } catch (error) {
      console.error('Error deleting receivable:', error);
    }
  };

  const totalValue = receivables.reduce((sum, rec) => sum + rec.valor, 0);

  if (loading) return <div className="py-16 text-center text-sm text-slate-500">Carregando...</div>;

  return (
    <div className="space-y-5 sm:space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="page-title">Recebimentos</h1>
          <p className="page-subtitle">Total: R$ {totalValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
        </div>
        <Button onClick={() => setShowModal(true)} className="flex items-center space-x-2 w-full sm:w-auto">
          <Plus size={18} />
          <span>Novo Recebimento</span>
        </Button>
      </div>

      <div className="table-shell hidden md:block">
        <table className="w-full">
          <thead className="table-head border-b border-slate-200">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Cliente</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Descrição</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Data Prevista</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Valor</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Periodicidade</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {receivables.map((receivable) => (
              <tr key={receivable.id} className="transition hover:bg-cyan-50/60">
                <td className="px-6 py-4 text-sm font-medium text-slate-900">
                  {receivable.clients?.empresa || 'N/A'}
                </td>
                <td className="px-6 py-4 text-sm text-slate-600">{receivable.descricao || '-'}</td>
                <td className="px-6 py-4 text-sm text-slate-600">
                  {new Date(receivable.data_prevista).toLocaleDateString('pt-BR')}
                </td>
                <td className="px-6 py-4 text-sm font-medium text-emerald-600">
                  R$ {receivable.valor.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </td>
                <td className="px-6 py-4 text-sm text-slate-600">{receivable.periodicidade}</td>
                <td className="px-6 py-4 text-right">
                  <div className="flex justify-end space-x-2">
                    <button
                      onClick={() => handleEdit(receivable)}
                      className="p-2 rounded-lg bg-cyan-50 text-cyan-700 hover:bg-cyan-100 transition-colors"
                    >
                      <Edit size={18} />
                    </button>
                    <button
                      onClick={() => handleDelete(receivable.id)}
                      className="p-2 rounded-lg bg-rose-50 text-rose-700 hover:bg-rose-100 transition-colors"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="space-y-3 md:hidden">
        {receivables.map((receivable) => (
          <div key={receivable.id} className="mobile-card">
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1">
                <h3 className="font-semibold text-slate-900">{receivable.clients?.empresa || 'N/A'}</h3>
                {receivable.descricao && (
                  <p className="text-sm text-slate-500">{receivable.descricao}</p>
                )}
                <p className="text-sm text-slate-500 mt-1">
                  {new Date(receivable.data_prevista).toLocaleDateString('pt-BR')}
                </p>
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => handleEdit(receivable)}
                  className="p-2 rounded-lg bg-cyan-50 text-cyan-700"
                >
                  <Edit size={16} />
                </button>
                <button
                  onClick={() => handleDelete(receivable.id)}
                  className="p-2 rounded-lg bg-rose-50 text-rose-700"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-500">Valor</span>
                <span className="text-sm font-medium text-emerald-600">R$ {receivable.valor.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-500">Periodicidade</span>
                <span className="text-sm">{receivable.periodicidade}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      <Modal isOpen={showModal} onClose={handleCloseModal} title={editingReceivable ? 'Editar Recebimento' : 'Novo Recebimento'}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Select
            label="Cliente"
            value={formData.client_id}
            onChange={(e) => setFormData({ ...formData, client_id: e.target.value })}
            options={[
              { value: '', label: 'Selecione um cliente' },
              ...clients.map((c) => ({ value: c.id, label: c.empresa })),
            ]}
            required
          />
          <Input
            label="Descrição"
            value={formData.descricao}
            onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
          />
          <Input
            label="Data Prevista"
            type="date"
            value={formData.data_prevista}
            onChange={(e) => setFormData({ ...formData, data_prevista: e.target.value })}
            required
          />
          <Input
            label="Valor"
            type="number"
            step="0.01"
            value={formData.valor}
            onChange={(e) => setFormData({ ...formData, valor: e.target.value })}
            required
          />
          <Select
            label="Periodicidade"
            value={formData.periodicidade}
            onChange={(e) => setFormData({ ...formData, periodicidade: e.target.value as 'mensal' | 'unica' })}
            options={[
              { value: 'unica', label: 'Única' },
              { value: 'mensal', label: 'Mensal' },
            ]}
          />
          <div className="flex justify-end space-x-3">
            <Button type="button" variant="ghost" onClick={handleCloseModal}>Cancelar</Button>
            <Button type="submit">{editingReceivable ? 'Salvar Alterações' : 'Criar'}</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
