import { supabase } from './supabase';

export interface Client {
  id: string;
  empresa: string;
  contato_nome: string | null;
  email: string | null;
  telefone: string | null;
  website: string | null;
  responsavel_id: string;
  status: 'lead' | 'proposta' | 'negociacao' | 'perdido' | 'fechado' | 'standby';
  prioridade: 'alta' | 'media' | 'baixa';
  valor_estimado: number;
  valor_pago: number;
  parcelas: number;
  valor_restante: number;
  ultimo_contato: string | null;
  data_estimado_entrega: string | null;
  notas: string | null;
  cores_marca: any;
  links_referencia: any;
  setup_fee: number | null;
  recurring_fee: number | null;
  recurring_period: 'monthly' | 'yearly' | 'weekly' | null;
  next_billing_date: string | null;
  billing_status: 'active' | 'inactive' | 'overdue' | 'cancelled' | null;
  created_at: string;
  updated_at: string;
}

const ALLOWED_RECURRING_PERIODS = ['monthly', 'yearly', 'weekly'] as const;
const ALLOWED_BILLING_STATUS = ['active', 'inactive', 'overdue', 'cancelled'] as const;

function validateBillingFields(data: Partial<Client>) {
  if (data.setup_fee != null && data.setup_fee < 0) {
    throw new Error('A taxa de setup deve ser maior ou igual a 0');
  }

  if (data.recurring_fee != null && data.recurring_fee < 0) {
    throw new Error('A taxa recorrente deve ser maior ou igual a 0');
  }

  if (
    data.recurring_period != null &&
    !ALLOWED_RECURRING_PERIODS.includes(data.recurring_period)
  ) {
    throw new Error('Período recorrente inválido');
  }

  if (
    data.billing_status != null &&
    !ALLOWED_BILLING_STATUS.includes(data.billing_status)
  ) {
    throw new Error('Status de cobrança inválido');
  }
}

export async function getClients() {
  const { data, error } = await supabase
    .from('clients')
    .select('*, profiles!clients_responsavel_id_fkey(name, email)')
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data;
}

export async function getClientById(id: string) {
  const { data, error } = await supabase
    .from('clients')
    .select('*, profiles!clients_responsavel_id_fkey(name, email, role)')
    .eq('id', id)
    .maybeSingle();

  if (error) throw error;
  return data;
}

export async function createClient(client: Omit<Client, 'id' | 'created_at' | 'updated_at'>) {
  validateBillingFields(client);

  const { data, error } = await supabase
    .from('clients')
    .insert(client)
    .select()
    .single();

  if (error) throw error;

  await logActivity(data.id, client.responsavel_id, 'created', null, null, {
    empresa: client.empresa,
    status: client.status,
  });

  return data;
}

export async function updateClient(id: string, updates: Partial<Client>, userId: string) {
  validateBillingFields(updates);

  const oldClient = await getClientById(id);

  const { data, error } = await supabase
    .from('clients')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;

  if (oldClient && updates.status && oldClient.status !== updates.status) {
    await logActivity(id, userId, 'status_changed', oldClient.status, updates.status, updates);
  } else {
    await logActivity(id, userId, 'updated', null, null, updates);
  }

  return data;
}

export async function deleteClient(id: string) {
  const { error } = await supabase.from('clients').delete().eq('id', id);
  if (error) throw error;
}

async function logActivity(
  clientId: string,
  userId: string,
  action: string,
  fromStatus: string | null,
  toStatus: string | null,
  changes: any
) {
  const { error } = await supabase.from('activity_logs').insert({
    client_id: clientId,
    user_id: userId,
    action,
    from_status: fromStatus,
    to_status: toStatus,
    changes,
  });

  if (error) console.error('Error logging activity:', error);
}
