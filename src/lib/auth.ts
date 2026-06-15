import { supabase } from './supabase';

export interface Profile {
  id: string;
  name: string;
  email: string;
  role: 'CEO' | 'Vendedor';
  commission_percent: number;
  created_at: string;
}

/**
 * 🔐 Apenas autentica
 * ❌ NÃO busca profile aqui
 */
export async function signIn(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) throw error;

  return { user: data.user };
}

/**
 * 🆕 Apenas cria o usuário no Auth
 * ❌ NÃO cria profile (o trigger cuida disso)
 */
export async function signUp(email: string, password: string) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
  });

  if (error) throw error;

  return data.user;
}

export async function signOut() {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}

/**
 * 👤 Busca profile de forma segura
 * ❌ NÃO quebra a sessão
 */
export async function getProfile(userId: string): Promise<Profile | null> {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .maybeSingle();

  if (error) {
    console.error('Erro ao buscar profile:', error);
    return null;
  }

  return data;
}
