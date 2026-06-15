import { useEffect, useMemo, useState } from 'react';
import { Edit2, Plus, Search, Trash2 } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { ProductFormModal } from '../components/products/ProductFormModal';
import { Product, productsStore } from '../stores/productsStore';

export function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [search, setSearch] = useState('');

  const loadProducts = async () => {
    try {
      const data = await productsStore.fetchProducts();
      setProducts(data);
    } catch (error) {
      console.error('Error loading products:', error);
      alert('Erro ao carregar produtos');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProducts();
  }, []);

  const filteredProducts = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) return products;

    return products.filter((product) => product.name.toLowerCase().includes(query));
  }, [products, search]);

  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    setShowModal(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir este produto?')) return;

    try {
      await productsStore.deleteProduct(id);
      await loadProducts();
    } catch (error) {
      console.error('Error deleting product:', error);
      alert('Erro ao excluir produto');
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingProduct(null);
  };

  if (loading) {
    return <div className="flex items-center justify-center h-64"><p className="text-slate-500">Carregando...</p></div>;
  }

  return (
    <div className="space-y-5 sm:space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="page-title">Produtos</h1>
          <p className="page-subtitle">Gerenciar produtos digitais do ecossistema ALI</p>
        </div>
        <Button onClick={() => setShowModal(true)} className="flex items-center space-x-2 w-full sm:w-auto">
          <Plus size={18} />
          <span>Novo Produto</span>
        </Button>
      </div>

      <div className="table-shell p-4">
        <div className="relative w-full md:max-w-sm">
          <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
          <input
            className="w-full rounded-2xl border border-slate-200 bg-white py-2 pl-9 pr-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-cyan-300 focus:ring-4 focus:ring-cyan-100"
            placeholder="Buscar por nome"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {filteredProducts.length === 0 ? (
        <div className="table-shell p-10 text-center">
          <h3 className="text-lg font-semibold text-slate-900">Nenhum produto cadastrado</h3>
          <p className="mt-1 text-sm text-slate-500">Crie seu primeiro produto para começar.</p>
        </div>
      ) : (
        <>
          <div className="table-shell hidden md:block">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="table-head border-b border-slate-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Nome</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Domínio Principal</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Função</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">Ações</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-slate-200">
                  {filteredProducts.map((product) => (
                    <tr key={product.id} className="transition hover:bg-cyan-50/60">
                      <td className="px-6 py-4 text-sm font-medium text-slate-900">{product.name}</td>
                      <td className="px-6 py-4 text-sm text-slate-600">{product.main_domain || '-'}</td>
                      <td className="px-6 py-4 text-sm text-slate-600">{product.function || '-'}</td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end space-x-2">
                          <button
                            onClick={() => handleEdit(product)}
                            className="p-2 rounded-lg bg-cyan-50 text-cyan-700 hover:bg-cyan-100 transition-colors"
                          >
                            <Edit2 size={18} />
                          </button>
                          <button
                            onClick={() => handleDelete(product.id)}
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
          </div>

          <div className="space-y-3 md:hidden">
            {filteredProducts.map((product) => (
              <div key={product.id} className="mobile-card">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <h3 className="font-semibold text-slate-900">{product.name}</h3>
                    <p className="text-sm text-slate-500">{product.main_domain || 'Sem domínio principal'}</p>
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleEdit(product)}
                      className="p-2 rounded-lg bg-cyan-50 text-cyan-700"
                    >
                      <Edit2 size={16} />
                    </button>
                    <button
                      onClick={() => handleDelete(product.id)}
                      className="p-2 rounded-lg bg-rose-50 text-rose-700"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-slate-500">Função</span>
                    <span className="text-sm text-slate-700">{product.function || '-'}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      <ProductFormModal
        isOpen={showModal}
        onClose={handleCloseModal}
        onSuccess={() => {
          loadProducts();
          handleCloseModal();
        }}
        product={editingProduct}
      />
    </div>
  );
}
