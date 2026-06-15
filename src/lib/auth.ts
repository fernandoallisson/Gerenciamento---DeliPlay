import { supabase } from './supabase';

export interface Profile {
  id: string;
  name: string;
  email: string;
  role: 'CEO' | 'Vendedor';
  commission_percent: number;
  created_at: string;
}

export async function signIn(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) throw error;

  return { user: data.user };
}

export async function signUp(email: string, password: string, name?: string, role?: string) {
  const API_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/manage-users`;

  const { data: sessionData } = await supabase.auth.getSession();
  const token = sessionData.session?.access_token;

  if (!token) throw new Error('Não autenticado');

  const response = await fetch(API_URL, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email, password, name: name || email, role: role || 'Vendedor' }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Erro ao criar usuário');
  }

  const result = await response.json();
  return result.user;
}

export async function signOut() {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}

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
