import { supabase } from '../lib/supabase';
import { Task, TaskPayload } from '../types/tasks';

async function fetchTasks() {
  const { data, error } = await supabase
    .from('tasks')
    .select('*, clients(empresa)')
    .order('due_date', { ascending: true });

  if (error) throw error;
  return (data ?? []) as Task[];
}

async function createTask(task: TaskPayload) {
  const { data, error } = await supabase
    .from('tasks')
    .insert(task)
    .select('*, clients(empresa)')
    .single();

  if (error) throw error;
  return data as Task;
}

async function updateTask(id: string, updates: Partial<TaskPayload>) {
  const { data, error } = await supabase
    .from('tasks')
    .update(updates)
    .eq('id', id)
    .select('*, clients(empresa)')
    .single();

  if (error) throw error;
  return data as Task;
}

async function deleteTask(id: string) {
  const { error } = await supabase
    .from('tasks')
    .delete()
    .eq('id', id);

  if (error) throw error;
}

export const tasksStore = {
  fetchTasks,
  createTask,
  updateTask,
  deleteTask,
};
