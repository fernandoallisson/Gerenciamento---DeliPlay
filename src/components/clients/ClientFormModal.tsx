import { useState, useEffect } from 'react';
import { Modal } from '../ui/Modal';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';
import { Button } from '../ui/Button';
import { Client, createClient, updateClient } from '../../lib/clients';
import { useAuth } from '../../contexts/AuthContext';

interface ClientFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  client?: Client | null;
}

export function ClientFormModal({ isOpen, onClose, onSuccess, client }: ClientFormModalProps) {
  const { profile } = useAuth();
  const isEdit = !!client;

  const [formData, setFormData] = useState({
    empresa: '',
    contato_nome: '',
    email: '',
    telefone: '',
    website: '',
    status: 'lead',
    prioridade: 'media',
    valor_estimado: '0',
    valor_pago: '0',
    parcelas: '1',
    ultimo_contato: '',
    data_estimado_entrega: '',
    notas: '',
    setup_fee: '0',
    recurring_fee: '0',
    recurring_period: 'monthly',
    next_billing_date: '',
    billing_status: 'inactive',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (client) {
      setFormData({
        empresa: client.empresa || '',
        contato_nome: client.contato_nome || '',
        email: client.email || '',
        telefone: client.telefone || '',
        website: client.website || '',
        status: client.status || 'lead',
        prioridade: client.prioridade || 'media',
        valor_estimado: client.valor_estimado?.toString() || '0',
        valor_pago: client.valor_pago?.toString() || '0',
        parcelas: client.parcelas?.toString() || '1',
        ultimo_contato: client.ultimo_contato || '',
        data_estimado_entrega: client.data_estimado_entrega || '',
        notas: client.notas || '',
        setup_fee: client.setup_fee?.toString() || '0',
        recurring_fee: client.recurring_fee?.toString() || '0',
        recurring_period: client.recurring_period || 'monthly',
        next_billing_date: client.next_billing_date || '',
        billing_status: client.billing_status || 'inactive',
      });
    } else {
      setFormData({
        empresa: '',
        contato_nome: '',
        email: '',
        telefone: '',
        website: '',
        status: 'lead',
        prioridade: 'media',
        valor_estimado: '0',
        valor_pago: '0',
        parcelas: '1',
        ultimo_contato: '',
        data_estimado_entrega: '',
        notas: '',
        setup_fee: '0',
        recurring_fee: '0',
        recurring_period: 'monthly',
        next_billing_date: '',
        billing_status: 'inactive',
      });
    }
  }, [client]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const valorEstimado = parseFloat(formData.valor_estimado) || 0;
      const valorPago = parseFloat(formData.valor_pago) || 0;
      const parcelas = parseInt(formData.parcelas) || 1;
      const setupFee = parseFloat(formData.setup_fee) || 0;
      const recurringFee = parseFloat(formData.recurring_fee) || 0;

      if (setupFee < 0 || recurringFee < 0) {
        throw new Error('Os valores de cobrança devem ser maiores ou iguais a 0');
      }

      const clientData = {
        empresa: formData.empresa,
        contato_nome: formData.contato_nome || null,
        email: formData.email || null,
        telefone: formData.telefone || null,
        website: formData.website || null,
        responsavel_id: profile!.id,
        status: formData.status as any,
        prioridade: formData.prioridade as any,
        valor_estimado: valorEstimado,
        valor_pago: valorPago,
        parcelas,
        valor_restante: valorEstimado - valorPago,
        ultimo_contato: formData.ultimo_contato || null,
        data_estimado_entrega: formData.data_estimado_entrega || null,
        notas: formData.notas || null,
        cores_marca: null,
        links_referencia: null,
        setup_fee: setupFee,
        recurring_fee: recurringFee,
        recurring_period: formData.recurring_period as 'monthly' | 'yearly' | 'weekly',
        next_billing_date: formData.next_billing_date || null,
        billing_status: formData.billing_status as 'active' | 'inactive' | 'overdue' | 'cancelled',
      };

      if (isEdit && client) {
        const changedFields = Object.fromEntries(
          Object.entries(clientData).filter(([key, value]) => {
            const oldValue = (client as any)[key];
            return oldValue !== value;
          })
        );

        if (Object.keys(changedFields).length > 0) {
          await updateClient(client.id, changedFields, profile!.id);
        }
      } else {
        await createClient(clientData);
      }

      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.message || 'Erro ao salvar cliente');
    } finally {
      setLoading(false);
    }
  };

  const setToday = () => {
    const today = new Date().toISOString().split('T')[0];
    setFormData({ ...formData, ultimo_contato: today });
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={isEdit ? 'Editar Cliente' : 'Novo Cliente'} size="lg">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="Empresa *"
            value={formData.empresa}
            onChange={(e) => setFormData({ ...formData, empresa: e.target.value })}
            required
          />

          <Input
            label="Nome do Contato"
            value={formData.contato_nome}
            onChange={(e) => setFormData({ ...formData, contato_nome: e.target.value })}
          />

          <Input
            label="Email"
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          />

          <Input
            label="Telefone"
            type="tel"
            value={formData.telefone}
            onChange={(e) => setFormData({ ...formData, telefone: e.target.value })}
          />

          <Input
            label="Website"
            type="url"
            placeholder="https://exemplo.com"
            value={formData.website}
            onChange={(e) => setFormData({ ...formData, website: e.target.value })}
          />

          <Select
            label="Status *"
            value={formData.status}
            onChange={(e) => setFormData({ ...formData, status: e.target.value })}
            options={[
              { value: 'lead', label: 'Lead' },
              { value: 'proposta', label: 'Proposta' },
              { value: 'negociacao', label: 'Negociação' },
              { value: 'fechado', label: 'Fechado' },
              { value: 'perdido', label: 'Perdido' },
              { value: 'standby', label: 'Standby' },
            ]}
            required
          />

          <Select
            label="Prioridade *"
            value={formData.prioridade}
            onChange={(e) => setFormData({ ...formData, prioridade: e.target.value })}
            options={[
              { value: 'alta', label: 'Alta' },
              { value: 'media', label: 'Média' },
              { value: 'baixa', label: 'Baixa' },
            ]}
            required
          />

          <Input
            label="Valor Estimado (R$) *"
            type="number"
            step="0.01"
            min="0"
            value={formData.valor_estimado}
            onChange={(e) => setFormData({ ...formData, valor_estimado: e.target.value })}
            required
          />

          <Input
            label="Valor Pago (R$)"
            type="number"
            step="0.01"
            min="0"
            value={formData.valor_pago}
            onChange={(e) => setFormData({ ...formData, valor_pago: e.target.value })}
          />

          <Input
            label="Parcelas"
            type="number"
            min="1"
            value={formData.parcelas}
            onChange={(e) => setFormData({ ...formData, parcelas: e.target.value })}
          />

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Último Contato
            </label>
            <div className="flex space-x-2">
              <Input
                type="date"
                value={formData.ultimo_contato}
                onChange={(e) => setFormData({ ...formData, ultimo_contato: e.target.value })}
                className="flex-1"
              />
              <Button type="button" variant="secondary" size="sm" onClick={setToday}>
                Hoje
              </Button>
            </div>
          </div>

          <Input
            label="Data Estimada de Entrega"
            type="date"
            value={formData.data_estimado_entrega}
            onChange={(e) => setFormData({ ...formData, data_estimado_entrega: e.target.value })}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Notas
          </label>
          <textarea
            value={formData.notas}
            onChange={(e) => setFormData({ ...formData, notas: e.target.value })}
            className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-cyan-300 focus:ring-4 focus:ring-cyan-100"
            rows={3}
            placeholder="Observações sobre o cliente..."
          />
        </div>

        <div className="rounded-2xl border border-slate-200 p-4 space-y-4">
          <h3 className="text-sm font-semibold text-slate-900">Cobrança</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Taxa de Setup (R$)"
              type="number"
              step="0.01"
              min="0"
              value={formData.setup_fee}
              onChange={(e) => setFormData({ ...formData, setup_fee: e.target.value })}
            />

            <Input
              label="Taxa Recorrente (R$)"
              type="number"
              step="0.01"
              min="0"
              value={formData.recurring_fee}
              onChange={(e) => setFormData({ ...formData, recurring_fee: e.target.value })}
            />

            <Select
              label="Período Recorrente"
              value={formData.recurring_period}
              onChange={(e) => setFormData({ ...formData, recurring_period: e.target.value })}
              options={[
                { value: 'monthly', label: 'Mensal' },
                { value: 'yearly', label: 'Anual' },
                { value: 'weekly', label: 'Semanal' },
              ]}
            />

            <Input
              label="Próxima Cobrança"
              type="date"
              value={formData.next_billing_date}
              onChange={(e) => setFormData({ ...formData, next_billing_date: e.target.value })}
            />

            <Select
              label="Status de Cobrança"
              value={formData.billing_status}
              onChange={(e) => setFormData({ ...formData, billing_status: e.target.value })}
              options={[
                { value: 'active', label: 'Ativo' },
                { value: 'inactive', label: 'Inativo' },
                { value: 'overdue', label: 'Atrasado' },
                { value: 'cancelled', label: 'Cancelado' },
              ]}
            />
          </div>
        </div>

        {error && (
          <div className="rounded-2xl border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700">
            {error}
          </div>
        )}

        <div className="flex justify-end space-x-3 pt-4">
          <Button type="button" variant="ghost" onClick={onClose}>
            Cancelar
          </Button>
          <Button type="submit" disabled={loading}>
            {loading ? 'Salvando...' : isEdit ? 'Salvar Alterações' : 'Criar Cliente'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
