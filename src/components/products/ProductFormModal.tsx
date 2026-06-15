import { useEffect, useState } from 'react';
import { Modal } from '../ui/Modal';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';
import { Product, ProductPayload, productsStore } from '../../stores/productsStore';

interface ProductFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  product?: Product | null;
}

const defaultFormData = {
  name: '',
  main_domain: '',
  secondary_domain: '',
  function: '',
  notes: '',
};

export function ProductFormModal({ isOpen, onClose, onSuccess, product }: ProductFormModalProps) {
  const isEdit = !!product;
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState(defaultFormData);

  useEffect(() => {
    if (!product) {
      setFormData(defaultFormData);
      return;
    }

    setFormData({
      name: product.name || '',
      main_domain: product.main_domain || '',
      secondary_domain: product.secondary_domain || '',
      function: product.function || '',
      notes: product.notes || '',
    });
  }, [product]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError('');
    setLoading(true);

    try {
      const payload: ProductPayload = {
        name: formData.name.trim(),
        main_domain: formData.main_domain.trim() || null,
        secondary_domain: formData.secondary_domain.trim() || null,
        function: formData.function.trim() || null,
        notes: formData.notes.trim() || null,
      };

      if (isEdit && product) {
        await productsStore.updateProduct(product.id, payload);
      } else {
        await productsStore.createProduct(payload);
      }

      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.message || 'Erro ao salvar produto');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={isEdit ? 'Editar Produto' : 'Novo Produto'} size="lg">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="Nome *"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
          />

          <Input
            label="Domínio Principal"
            value={formData.main_domain}
            onChange={(e) => setFormData({ ...formData, main_domain: e.target.value })}
            placeholder="ex: ali.digital"
          />

          <Input
            label="Domínio Secundário"
            value={formData.secondary_domain}
            onChange={(e) => setFormData({ ...formData, secondary_domain: e.target.value })}
            placeholder="ex: app.ali.digital"
          />

          <Input
            label="Função"
            value={formData.function}
            onChange={(e) => setFormData({ ...formData, function: e.target.value })}
            placeholder="ex: CRM e automação"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Notas
          </label>
          <textarea
            value={formData.notes}
            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-cyan-300 focus:ring-4 focus:ring-cyan-100"
            rows={4}
            placeholder="Observações sobre o produto..."
          />
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
            {loading ? 'Salvando...' : isEdit ? 'Salvar Alterações' : 'Criar Produto'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
