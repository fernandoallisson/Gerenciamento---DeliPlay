export type TaskStatus = 'pending' | 'in_progress' | 'completed' | 'cancelled';
export type TaskPriority = 'low' | 'medium' | 'high';

export interface Task {
  id: string;
  title: string;
  description: string | null;
  status: TaskStatus;
  priority: TaskPriority;
  due_date: string | null;
  client_id: string | null;
  assigned_to: string | null;
  user_id: string;
  created_at: string;
  updated_at: string;
  clients?: {
    empresa: string;
  } | null;
}

export interface TaskPayload {
  title: string;
  description: string | null;
  status: TaskStatus;
  priority: TaskPriority;
  due_date: string | null;
  client_id: string | null;
  assigned_to: string | null;
}
