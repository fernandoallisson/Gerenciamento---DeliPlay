import { useEffect, useMemo, useState } from 'react';
import { Check, Edit2, Plus, Trash2 } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Select } from '../components/ui/Select';
import { Badge } from '../components/ui/Badge';
import { Modal } from '../components/ui/Modal';
import { TaskFormModal } from '../components/tasks/TaskFormModal';
import { getClients, Client } from '../lib/clients';
import { supabase } from '../lib/supabase';
import { tasksStore } from '../stores/tasksStore';
import { Task, TaskPriority, TaskStatus } from '../types/tasks';

interface AssigneeOption {
  id: string;
  name: string;
  email: string;
}

const statusLabel: Record<TaskStatus, string> = {
  pending: 'Pendente',
  in_progress: 'Em andamento',
  completed: 'Concluída',
  cancelled: 'Cancelada',
};

const priorityLabel: Record<TaskPriority, string> = {
  low: 'Baixa',
  medium: 'Média',
  high: 'Alta',
};

export function TasksPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [assignees, setAssignees] = useState<AssigneeOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [taskToDelete, setTaskToDelete] = useState<Task | null>(null);
  const [filters, setFilters] = useState({
    status: '',
    priority: '',
    client: '',
    assignedTo: '',
  });

  const loadData = async () => {
    try {
      const [tasksData, clientsData, assigneesResponse] = await Promise.all([
        tasksStore.fetchTasks(),
        getClients(),
        supabase.from('profiles').select('id, name, email').order('name', { ascending: true }),
      ]);

      setTasks(tasksData);
      setClients(clientsData || []);
      if (assigneesResponse.error) throw assigneesResponse.error;
      setAssignees(assigneesResponse.data || []);
    } catch (error) {
      console.error('Error loading tasks page data:', error);
      alert('Erro ao carregar tarefas');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const sortedTasks = useMemo(() => {
    return [...tasks].sort((a, b) => {
      if (!a.due_date && !b.due_date) return 0;
      if (!a.due_date) return 1;
      if (!b.due_date) return -1;
      return new Date(a.due_date).getTime() - new Date(b.due_date).getTime();
    });
  }, [tasks]);

  const filteredTasks = useMemo(() => {
    return sortedTasks.filter((task) => {
      const statusMatch = !filters.status || task.status === filters.status;
      const priorityMatch = !filters.priority || task.priority === filters.priority;
      const clientMatch = !filters.client || task.client_id === filters.client;
      const assigneeMatch = !filters.assignedTo || task.assigned_to === filters.assignedTo;

      return statusMatch && priorityMatch && clientMatch && assigneeMatch;
    });
  }, [sortedTasks, filters]);

  const handleEdit = (task: Task) => {
    setEditingTask(task);
    setShowModal(true);
  };

  const handleDelete = async () => {
    if (!taskToDelete) return;

    try {
      await tasksStore.deleteTask(taskToDelete.id);
      setTaskToDelete(null);
      await loadData();
    } catch (error) {
      console.error('Error deleting task:', error);
      alert('Erro ao excluir tarefa');
    }
  };

  const handleQuickComplete = async (task: Task) => {
    try {
      await tasksStore.updateTask(task.id, { status: 'completed' });
      await loadData();
    } catch (error) {
      console.error('Error completing task:', error);
      alert('Erro ao concluir tarefa');
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingTask(null);
  };

  const isOverdue = (task: Task) => {
    if (!task.due_date || task.status === 'completed' || task.status === 'cancelled') return false;
    return new Date(task.due_date).getTime() < Date.now();
  };

  if (loading) {
    return <div className="flex items-center justify-center h-64"><p className="text-slate-500">Carregando...</p></div>;
  }

  return (
    <div className="space-y-5 sm:space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="page-title">Tarefas</h1>
          <p className="page-subtitle">Gerencie tarefas e acompanhamentos do CRM</p>
        </div>
        <Button onClick={() => setShowModal(true)} className="flex items-center space-x-2 w-full sm:w-auto">
          <Plus size={18} />
          <span>Nova Tarefa</span>
        </Button>
      </div>

      <div className="table-shell p-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          <Select
            value={filters.status}
            onChange={(e) => setFilters({ ...filters, status: e.target.value })}
            options={[
              { value: '', label: 'Todos os status' },
              { value: 'pending', label: 'Pendente' },
              { value: 'in_progress', label: 'Em andamento' },
              { value: 'completed', label: 'Concluída' },
              { value: 'cancelled', label: 'Cancelada' },
            ]}
          />
          <Select
            value={filters.priority}
            onChange={(e) => setFilters({ ...filters, priority: e.target.value })}
            options={[
              { value: '', label: 'Todas as prioridades' },
              { value: 'low', label: 'Baixa' },
              { value: 'medium', label: 'Média' },
              { value: 'high', label: 'Alta' },
            ]}
          />
          <Select
            value={filters.client}
            onChange={(e) => setFilters({ ...filters, client: e.target.value })}
            options={[
              { value: '', label: 'Todos os clientes' },
              ...clients.map((client) => ({ value: client.id, label: client.empresa })),
            ]}
          />
          <Select
            value={filters.assignedTo}
            onChange={(e) => setFilters({ ...filters, assignedTo: e.target.value })}
            options={[
              { value: '', label: 'Todos os responsáveis' },
              ...assignees.map((assignee) => ({
                value: assignee.id,
                label: assignee.name || assignee.email,
              })),
            ]}
          />
        </div>
      </div>

      {filteredTasks.length === 0 ? (
        <div className="table-shell p-10 text-center">
          <h3 className="text-lg font-semibold text-slate-900">No tasks yet</h3>
          <p className="mt-1 text-sm text-slate-500">Crie sua primeira tarefa para começar.</p>
        </div>
      ) : (
        <>
          <div className="table-shell hidden md:block">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="table-head border-b border-slate-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Título</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Prioridade</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Vencimento</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Cliente</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">Ações</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-slate-200">
                  {filteredTasks.map((task) => (
                    <tr key={task.id} className={`transition hover:bg-cyan-50/60 ${isOverdue(task) ? 'bg-rose-50/50' : ''}`}>
                      <td className="px-6 py-4 text-sm font-medium text-slate-900">{task.title}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Badge variant={task.status}>{statusLabel[task.status]}</Badge>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Badge variant={task.priority}>{priorityLabel[task.priority]}</Badge>
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-600">
                        {task.due_date ? new Date(task.due_date).toLocaleDateString('pt-BR') : '-'}
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-600">{task.clients?.empresa || '-'}</td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end space-x-2">
                          {task.status !== 'completed' && (
                            <button
                              onClick={() => handleQuickComplete(task)}
                              className="p-2 rounded-lg bg-emerald-50 text-emerald-700 hover:bg-emerald-100 transition-colors"
                              title="Marcar como concluída"
                            >
                              <Check size={18} />
                            </button>
                          )}
                          <button
                            onClick={() => handleEdit(task)}
                            className="p-2 rounded-lg bg-cyan-50 text-cyan-700 hover:bg-cyan-100 transition-colors"
                          >
                            <Edit2 size={18} />
                          </button>
                          <button
                            onClick={() => setTaskToDelete(task)}
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
            {filteredTasks.map((task) => (
              <div key={task.id} className={`mobile-card ${isOverdue(task) ? 'border border-rose-200' : ''}`}>
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <h3 className="font-semibold text-slate-900">{task.title}</h3>
                    <p className="text-sm text-slate-500">{task.clients?.empresa || 'Sem cliente'}</p>
                  </div>
                  <div className="flex space-x-2">
                    {task.status !== 'completed' && (
                      <button
                        onClick={() => handleQuickComplete(task)}
                        className="p-2 rounded-lg bg-emerald-50 text-emerald-700"
                        title="Marcar como concluída"
                      >
                        <Check size={16} />
                      </button>
                    )}
                    <button
                      onClick={() => handleEdit(task)}
                      className="p-2 rounded-lg bg-cyan-50 text-cyan-700"
                    >
                      <Edit2 size={16} />
                    </button>
                    <button
                      onClick={() => setTaskToDelete(task)}
                      className="p-2 rounded-lg bg-rose-50 text-rose-700"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-slate-500">Status</span>
                    <Badge variant={task.status}>{statusLabel[task.status]}</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-slate-500">Prioridade</span>
                    <Badge variant={task.priority}>{priorityLabel[task.priority]}</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-slate-500">Vencimento</span>
                    <span className={`text-sm font-medium ${isOverdue(task) ? 'text-rose-600' : 'text-slate-700'}`}>
                      {task.due_date ? new Date(task.due_date).toLocaleDateString('pt-BR') : '-'}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      <TaskFormModal
        isOpen={showModal}
        onClose={handleCloseModal}
        onSuccess={() => {
          loadData();
          handleCloseModal();
        }}
        clients={clients}
        assignees={assignees}
        task={editingTask}
      />

      <Modal
        isOpen={!!taskToDelete}
        onClose={() => setTaskToDelete(null)}
        title="Excluir Tarefa"
        size="sm"
      >
        <div className="space-y-4">
          <p className="text-sm text-slate-600">Tem certeza que deseja excluir esta tarefa? Esta ação não pode ser desfeita.</p>
          <div className="flex justify-end gap-3">
            <Button variant="ghost" onClick={() => setTaskToDelete(null)}>Cancelar</Button>
            <Button onClick={handleDelete}>Excluir</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
