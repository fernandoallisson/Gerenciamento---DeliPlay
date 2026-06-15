import { useState, useEffect } from 'react';
import { Plus, CreditCard as Edit, Lock, Trash2 } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Modal } from '../components/ui/Modal';
import { Input } from '../components/ui/Input';
import { Select } from '../components/ui/Select';
import { supabase } from '../lib/supabase';
import { signUp } from '../lib/auth';
import { deleteUser } from '../lib/password';
import { ChangePasswordModal } from '../components/auth/ChangePasswordModal';

interface Profile {
  id: string;
  name: string;
  email: string;
  role: 'CEO' | 'Vendedor';
  commission_percent: number;
}

export function VendorsPage() {
  const [vendors, setVendors] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [selectedVendorId, setSelectedVendorId] = useState<string | null>(null);
  const [editingVendor, setEditingVendor] = useState<Profile | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'Vendedor' as 'CEO' | 'Vendedor',
    commission_percent: '0',
  });

  useEffect(() => {
    loadVendors();
  }, []);

  const loadVendors = async () => {
    try {
      const { data, error } = await supabase.from('profiles').select('*').order('created_at', { ascending: false });
      if (error) throw error;
      setVendors(data);
    } catch (error) {
      console.error('Error loading vendors:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (vendor: Profile) => {
    setEditingVendor(vendor);
    setFormData({
      name: vendor.name,
      email: vendor.email,
      password: '',
      role: vendor.role,
      commission_percent: vendor.commission_percent.toString(),
    });
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingVendor(null);
    setFormData({ name: '', email: '', password: '', role: 'Vendedor', commission_percent: '0' });
  };

  const handleOpenPasswordModal = (vendorId: string) => {
    setSelectedVendorId(vendorId);
    setShowPasswordModal(true);
  };

  const handleDeleteVendor = async (vendor: Profile) => {
    if (!confirm(`Tem certeza que deseja deletar ${vendor.name}? Esta ação não pode ser desfeita.`)) {
      return;
    }

    try {
      await deleteUser(vendor.id);
      loadVendors();
    } catch (error: any) {
      alert(error.message || 'Erro ao deletar vendedor');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingVendor) {
        const { error } = await supabase
          .from('profiles')
          .update({
            name: formData.name,
            role: formData.role,
            commission_percent: parseFloat(formData.commission_percent),
          })
          .eq('id', editingVendor.id);

        if (error) throw error;
      } else {
        await signUp(formData.email, formData.password, formData.name, formData.role);
      }

      handleCloseModal();
      loadVendors();
    } catch (error: any) {
      alert(error.message || 'Erro ao salvar vendedor');
    }
  };

  if (loading) return <div className="py-16 text-center text-sm text-slate-500">Carregando...</div>;

  return (
    <div className="space-y-5 sm:space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="page-title">Gestão de Vendedores</h1>
          <p className="page-subtitle">Gerenciar equipe de vendas</p>
        </div>
        <Button onClick={() => setShowModal(true)} className="flex items-center space-x-2 w-full sm:w-auto">
          <Plus size={18} />
          <span>Novo Vendedor</span>
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {vendors.map((vendor) => (
          <div key={vendor.id} className="app-card">
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <h3 className="text-lg font-bold text-slate-900">{vendor.name}</h3>
                <p className="text-sm text-slate-600">{vendor.email}</p>
                {vendor.commission_percent > 0 && (
                  <p className="text-sm text-slate-600 mt-1">Comissão: {vendor.commission_percent}%</p>
                )}
              </div>
              <div className="flex flex-col items-end space-y-2">
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                  vendor.role === 'CEO' ? 'bg-[var(--dp-navy)] text-white' : 'bg-cyan-50 text-[var(--dp-navy)]'
                }`}>
                  {vendor.role}
                </span>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleEdit(vendor)}
                    className="p-2 rounded-lg bg-cyan-50 text-cyan-700 hover:bg-cyan-100 transition-colors"
                    title="Editar informações"
                  >
                    <Edit size={16} />
                  </button>
                  <button
                    onClick={() => handleOpenPasswordModal(vendor.id)}
                    className="p-2 rounded-lg bg-amber-50 text-amber-700 hover:bg-amber-100 transition-colors"
                    title="Alterar senha"
                  >
                    <Lock size={16} />
                  </button>
                  <button
                    onClick={() => handleDeleteVendor(vendor)}
                    className="p-2 rounded-lg bg-red-50 text-red-700 hover:bg-red-100 transition-colors"
                    title="Deletar usuário"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <Modal isOpen={showModal} onClose={handleCloseModal} title={editingVendor ? 'Editar Vendedor' : 'Novo Vendedor'}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Nome"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
          />
          <Input
            label="Email"
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            required
            disabled={!!editingVendor}
          />
          {!editingVendor && (
            <Input
              label="Senha"
              type="password"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              required
            />
          )}
          <Select
            label="Função"
            value={formData.role}
            onChange={(e) => setFormData({ ...formData, role: e.target.value as 'CEO' | 'Vendedor' })}
            options={[
              { value: 'Vendedor', label: 'Vendedor' },
              { value: 'CEO', label: 'CEO' },
            ]}
          />
          <Input
            label="Comissão (%)"
            type="number"
            step="0.01"
            value={formData.commission_percent}
            onChange={(e) => setFormData({ ...formData, commission_percent: e.target.value })}
          />
          <div className="flex justify-end space-x-3">
            <Button type="button" variant="ghost" onClick={handleCloseModal}>Cancelar</Button>
            <Button type="submit">{editingVendor ? 'Salvar Alterações' : 'Criar'}</Button>
          </div>
        </form>
      </Modal>

      {selectedVendorId && (
        <ChangePasswordModal
          isOpen={showPasswordModal}
          onClose={() => {
            setShowPasswordModal(false);
            setSelectedVendorId(null);
          }}
          userId={selectedVendorId}
        />
      )}
    </div>
  );
}
