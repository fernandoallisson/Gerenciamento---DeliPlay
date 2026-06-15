import { supabase } from '../lib/supabase';

export interface Product {
  id: string;
  name: string;
  main_domain: string | null;
  secondary_domain: string | null;
  function: string | null;
  notes: string | null;
  user_id: string;
  created_at: string;
  updated_at: string;
}

export interface ProductPayload {
  name: string;
  main_domain: string | null;
  secondary_domain: string | null;
  function: string | null;
  notes: string | null;
}

async function fetchProducts() {
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) throw error;
  return (data ?? []) as Product[];
}

async function createProduct(product: ProductPayload) {
  const { data, error } = await supabase
    .from('products')
    .insert(product)
    .select()
    .single();

  if (error) throw error;
  return data as Product;
}

async function updateProduct(id: string, updates: Partial<ProductPayload>) {
  const { data, error } = await supabase
    .from('products')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data as Product;
}

async function deleteProduct(id: string) {
  const { error } = await supabase
    .from('products')
    .delete()
    .eq('id', id);

  if (error) throw error;
}

export const productsStore = {
  fetchProducts,
  createProduct,
  updateProduct,
  deleteProduct,
};
