import { useState, useEffect } from 'react';
import { Plus, Edit, Trash2 } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Modal } from '../components/ui/Modal';
import { Input } from '../components/ui/Input';
import { Select } from '../components/ui/Select';
import { AccountPayable, getAccountsPayable, createAccountPayable, updateAccountPayable, deleteAccountPayable } from '../lib/finance';

export function AccountsPayablePage() {
  const [accounts, setAccounts] = useState<AccountPayable[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingAccount, setEditingAccount] = useState<AccountPayable | null>(null);
  const [formData, setFormData] = useState({
    descricao: '',
    data_vencimento: '',
    valor: '',
    recorrencia: 'unica' as 'mensal' | 'unica',
    categoria: '',
  });

  useEffect(() => {
    loadAccounts();
  }, []);

  const loadAccounts = async () => {
    try {
      const data = await getAccountsPayable();
      setAccounts(data);
    } catch (error) {
      console.error('Error loading accounts:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (account: AccountPayable) => {
    setEditingAccount(account);
    setFormData({
      descricao: account.descricao,
      data_vencimento: account.data_vencimento,
      valor: account.valor.toString(),
      recorrencia: account.recorrencia,
      categoria: account.categoria || '',
    });
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingAccount(null);
    setFormData({ descricao: '', data_vencimento: '', valor: '', recorrencia: 'unica', categoria: '' });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const accountData = {
        descricao: formData.descricao,
        data_vencimento: formData.data_vencimento,
        valor: parseFloat(formData.valor),
        recorrencia: formData.recorrencia,
        categoria: formData.categoria || null,
      };

      if (editingAccount) {
        await updateAccountPayable(editingAccount.id, accountData);
      } else {
        await createAccountPayable(accountData);
      }

      handleCloseModal();
      loadAccounts();
    } catch (error) {
      console.error('Error saving account:', error);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir esta conta?')) return;
    try {
      await deleteAccountPayable(id);
      loadAccounts();
    } catch (error) {
      console.error('Error deleting account:', error);
    }
  };

  const totalValue = accounts.reduce((sum, acc) => sum + acc.valor, 0);

  if (loading) return <div className="py-16 text-center text-sm text-slate-500">Carregando...</div>;

  return (
    <div className="space-y-5 sm:space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="page-title">Contas a Pagar</h1>
          <p className="page-subtitle">Total: R$ {totalValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
        </div>
        <Button onClick={() => setShowModal(true)} className="flex items-center space-x-2 w-full sm:w-auto">
          <Plus size={18} />
          <span>Nova Conta</span>
        </Button>
      </div>

      <div className="table-shell hidden md:block">
        <table className="w-full">
          <thead className="table-head border-b border-slate-200">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Descrição</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Vencimento</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Valor</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Recorrência</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Categoria</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {accounts.map((account) => (
              <tr key={account.id} className="transition hover:bg-cyan-50/60">
                <td className="px-6 py-4 text-sm text-slate-900">{account.descricao}</td>
                <td className="px-6 py-4 text-sm text-slate-600">
                  {new Date(account.data_vencimento).toLocaleDateString('pt-BR')}
                </td>
                <td className="px-6 py-4 text-sm font-medium text-slate-900">
                  R$ {account.valor.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </td>
                <td className="px-6 py-4 text-sm text-slate-600">{account.recorrencia}</td>
                <td className="px-6 py-4 text-sm text-slate-600">{account.categoria || '-'}</td>
                <td className="px-6 py-4 text-right">
                  <div className="flex justify-end space-x-2">
                    <button
                      onClick={() => handleEdit(account)}
                      className="p-2 rounded-lg bg-cyan-50 text-cyan-700 hover:bg-cyan-100 transition-colors"
                    >
                      <Edit size={18} />
                    </button>
                    <button
                      onClick={() => handleDelete(account.id)}
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
        {accounts.map((account) => (
          <div key={account.id} className="mobile-card">
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1">
                <h3 className="font-semibold text-slate-900">{account.descricao}</h3>
                <p className="text-sm text-slate-500 mt-1">
                  {new Date(account.data_vencimento).toLocaleDateString('pt-BR')}
                </p>
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => handleEdit(account)}
                  className="p-2 rounded-lg bg-cyan-50 text-cyan-700"
                >
                  <Edit size={16} />
                </button>
                <button
                  onClick={() => handleDelete(account.id)}
                  className="p-2 rounded-lg bg-rose-50 text-rose-700"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-500">Valor</span>
                <span className="text-sm font-medium">R$ {account.valor.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-500">Recorrência</span>
                <span className="text-sm">{account.recorrencia}</span>
              </div>
              {account.categoria && (
                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-500">Categoria</span>
                  <span className="text-sm">{account.categoria}</span>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      <Modal isOpen={showModal} onClose={handleCloseModal} title={editingAccount ? 'Editar Conta a Pagar' : 'Nova Conta a Pagar'}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Descrição"
            value={formData.descricao}
            onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
            required
          />
          <Input
            label="Data de Vencimento"
            type="date"
            value={formData.data_vencimento}
            onChange={(e) => setFormData({ ...formData, data_vencimento: e.target.value })}
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
            label="Recorrência"
            value={formData.recorrencia}
            onChange={(e) => setFormData({ ...formData, recorrencia: e.target.value as 'mensal' | 'unica' })}
            options={[
              { value: 'unica', label: 'Única' },
              { value: 'mensal', label: 'Mensal' },
            ]}
          />
          <Input
            label="Categoria"
            value={formData.categoria}
            onChange={(e) => setFormData({ ...formData, categoria: e.target.value })}
          />
          <div className="flex justify-end space-x-3">
            <Button type="button" variant="ghost" onClick={handleCloseModal}>Cancelar</Button>
            <Button type="submit">{editingAccount ? 'Salvar Alterações' : 'Criar'}</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
