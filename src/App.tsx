import { useEffect, useState } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { Layout } from './components/layout/Layout';
import { Login } from './pages/Login';
import { VendedorDashboard } from './pages/VendedorDashboard';
import { CEODashboard } from './pages/CEODashboard';
import { ClientsPage } from './pages/ClientsPage';
import { AccountsPayablePage } from './pages/AccountsPayablePage';
import { ReceivablesPage } from './pages/ReceivablesPage';
import { VendorsPage } from './pages/VendorsPage';
import { ProductsPage } from './pages/ProductsPage';
import { TasksPage } from './pages/TasksPage';
import { BrandLogo } from './components/branding/BrandLogo';

const removeBoltElements = () => {
  const selectors = [
    'a[href*="bolt.new"]',
    'iframe[src*="bolt.new"]',
    '[data-bolt-badge]',
    '[data-bolt-floating-button]',
    '[aria-label*="bolt" i]',
    '[title*="bolt" i]',
  ];

  selectors.forEach((selector) => {
    document.querySelectorAll(selector).forEach((element) => {
      element.remove();
    });
  });
};

const pageByPath: Record<string, string> = {
  '/': 'dashboard',
  '/dashboard': 'dashboard',
  '/clientes': 'clientes',
  '/contas-pagar': 'contas-pagar',
  '/recebimentos': 'recebimentos',
  '/vendedores': 'vendedores',
  '/products': 'products',
  '/tasks': 'tasks',
};

const pathByPage: Record<string, string> = {
  dashboard: '/dashboard',
  clientes: '/clientes',
  'contas-pagar': '/contas-pagar',
  recebimentos: '/recebimentos',
  vendedores: '/vendedores',
  products: '/products',
  tasks: '/tasks',
};

const getPageFromPath = (pathname: string) => pageByPath[pathname] ?? 'dashboard';

function AppContent() {
  const { user, profile, loading } = useAuth();
  const [activePage, setActivePage] = useState(getPageFromPath(window.location.pathname));

  useEffect(() => {
    removeBoltElements();

    const observer = new MutationObserver(() => {
      removeBoltElements();
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true,
    });

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const handlePopState = () => {
      setActivePage(getPageFromPath(window.location.pathname));
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const handleNavigate = (page: string) => {
    setActivePage(page);

    const nextPath = pathByPage[page] ?? '/dashboard';
    if (window.location.pathname !== nextPath) {
      window.history.pushState({}, '', nextPath);
    }
  };

  if (loading || !profile && user) {
    return (
      <div className="flex min-h-screen items-center justify-center px-4">
        <div className="app-panel w-full max-w-sm p-6 text-center sm:p-8">
          <BrandLogo className="mb-6 justify-center" />
          <div className="mx-auto mb-4 h-2 w-24 overflow-hidden rounded-full bg-slate-200">
            <div className="h-full w-2/3 animate-pulse rounded-full bg-[var(--ali-cyan)]" />
          </div>
          <p className="text-sm text-slate-500">Carregando ambiente...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Login />;
  }

  if (!profile) {
    return null;
  }

  const isCEO = profile.role === 'CEO';

  const renderPage = () => {
    switch (activePage) {
      case 'dashboard':
        return isCEO ? <CEODashboard /> : <VendedorDashboard />;
      case 'clientes':
        return <ClientsPage />;
      case 'contas-pagar':
        return isCEO ? <AccountsPayablePage /> : <VendedorDashboard />;
      case 'recebimentos':
        return isCEO ? <ReceivablesPage /> : <VendedorDashboard />;
      case 'vendedores':
        return isCEO ? <VendorsPage /> : <VendedorDashboard />;
      case 'products':
        return <ProductsPage />;
      case 'tasks':
        return <TasksPage />;
      default:
        return isCEO ? <CEODashboard /> : <VendedorDashboard />;
    }
  };

  return (
    <Layout activePage={activePage} onNavigate={handleNavigate}>
      {renderPage()}
    </Layout>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
