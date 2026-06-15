import { useState } from 'react';
import { ArrowRight, LogIn } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { signIn } from '../lib/auth';
import { BrandLogo } from '../components/branding/BrandLogo';

export function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await signIn(email, password);
    } catch (err: any) {
      setError(err.message || 'Erro ao fazer login');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden px-4 py-8 sm:px-6 lg:px-8">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(32,196,238,0.18),_transparent_38%),linear-gradient(160deg,_#233654_0%,_#1f314d_46%,_#eef5fb_100%)]" />
      <div className="relative grid w-full max-w-5xl overflow-hidden rounded-[2rem] border border-white/20 bg-white/10 shadow-2xl backdrop-blur-xl lg:grid-cols-[1.1fr_0.9fr]">
        <div className="hidden flex-col justify-between bg-[linear-gradient(180deg,rgba(35,54,84,0.92),rgba(35,54,84,0.82))] p-8 text-white lg:flex">
          <div>
            <span className="eyebrow bg-white/10 text-cyan-100">DeliPlay CRM</span>
            <h1 className="mt-6 text-4xl font-semibold leading-tight">DeliPlay CRM</h1>
            <p className="mt-4 max-w-md text-sm leading-6 text-cyan-50/80">
              Entre com suas credenciais para acessar o painel de gestão comercial.
            </p>
          </div>
          <div className="grid gap-3 text-sm text-cyan-50/80">
            <div className="flex items-center gap-3 rounded-2xl bg-white/10 p-4"><ArrowRight size={18} /> Visual consistente em dashboards, listas e formulários.</div>
          </div>
        </div>

        <div className="bg-white/95 p-6 sm:p-8 lg:p-10">
          <div className="mx-auto w-full max-w-md">
            <BrandLogo className="mb-8" />
            <div className="mb-6">
              <h2 className="text-2xl font-semibold text-slate-950 sm:text-3xl">Entrar no painel</h2>
              <p className="mt-2 text-sm leading-6 text-slate-600">Acesse sua conta para acompanhar clientes, recebimentos e a operação comercial.</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <Input
                type="email"
                label="Email"
                placeholder="seu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />

              <Input
                type="password"
                label="Senha"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />

              {error && <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</div>}

              <Button type="submit" variant="primary" className="w-full justify-center" disabled={loading}>
                <LogIn size={18} />
                <span>{loading ? 'Entrando...' : 'Entrar'}</span>
              </Button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
