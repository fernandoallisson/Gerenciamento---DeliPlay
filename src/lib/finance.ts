import { supabase } from './supabase';

export interface AccountPayable {
  id: string;
  descricao: string;
  data_vencimento: string;
  valor: number;
  recorrencia: 'mensal' | 'unica';
  categoria: string | null;
  created_at: string;
}

export interface Receivable {
  id: string;
  client_id: string;
  descricao: string | null;
  data_prevista: string;
  valor: number;
  periodicidade: 'mensal' | 'unica';
  created_at: string;
}

export async function getAccountsPayable() {
  const { data, error } = await supabase
    .from('accounts_payable')
    .select('*')
    .order('data_vencimento', { ascending: true });

  if (error) throw error;
  return data;
}

export async function createAccountPayable(account: Omit<AccountPayable, 'id' | 'created_at'>) {
  const { data, error } = await supabase
    .from('accounts_payable')
    .insert(account)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function updateAccountPayable(id: string, updates: Partial<Omit<AccountPayable, 'id' | 'created_at'>>) {
  const { data, error } = await supabase
    .from('accounts_payable')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function deleteAccountPayable(id: string) {
  const { error } = await supabase.from('accounts_payable').delete().eq('id', id);
  if (error) throw error;
}

export async function getReceivables() {
  const { data, error } = await supabase
    .from('receivables')
    .select('*, clients(empresa)')
    .order('data_prevista', { ascending: true });

  if (error) throw error;
  return data;
}

export async function createReceivable(receivable: Omit<Receivable, 'id' | 'created_at'>) {
  const { data, error } = await supabase
    .from('receivables')
    .insert(receivable)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function updateReceivable(id: string, updates: Partial<Omit<Receivable, 'id' | 'created_at'>>) {
  const { data, error } = await supabase
    .from('receivables')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function deleteReceivable(id: string) {
  const { error} = await supabase.from('receivables').delete().eq('id', id);
  if (error) throw error;
}
