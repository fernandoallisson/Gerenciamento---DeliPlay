import { useEffect, useState } from 'react';
import { Modal } from '../ui/Modal';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';
import { Button } from '../ui/Button';
import { Client } from '../../lib/clients';
import { Task, TaskPayload } from '../../types/tasks';
import { tasksStore } from '../../stores/tasksStore';

interface AssigneeOption {
  id: string;
  name: string;
  email: string;
}

interface TaskFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  clients: Client[];
  assignees: AssigneeOption[];
  task?: Task | null;
}

const defaultFormData = {
  title: '',
  description: '',
  status: 'pending',
  priority: 'medium',
  due_date: '',
  client_id: '',
  assigned_to: '',
};

export function TaskFormModal({ isOpen, onClose, onSuccess, clients, assignees, task }: TaskFormModalProps) {
  const isEdit = !!task;
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState(defaultFormData);

  useEffect(() => {
    if (!task) {
      setFormData(defaultFormData);
      return;
    }

    setFormData({
      title: task.title || '',
      description: task.description || '',
      status: task.status || 'pending',
      priority: task.priority || 'medium',
      due_date: task.due_date ? new Date(task.due_date).toISOString().slice(0, 10) : '',
      client_id: task.client_id || '',
      assigned_to: task.assigned_to || '',
    });
  }, [task]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError('');
    setLoading(true);

    try {
      const payload: TaskPayload = {
        title: formData.title.trim(),
        description: formData.description.trim() || null,
        status: formData.status as TaskPayload['status'],
        priority: formData.priority as TaskPayload['priority'],
        due_date: formData.due_date ? new Date(`${formData.due_date}T00:00:00`).toISOString() : null,
        client_id: formData.client_id || null,
        assigned_to: formData.assigned_to || null,
      };

      if (isEdit && task) {
        await tasksStore.updateTask(task.id, payload);
      } else {
        await tasksStore.createTask(payload);
      }

      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.message || 'Erro ao salvar tarefa');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={isEdit ? 'Editar Tarefa' : 'Nova Tarefa'} size="lg">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="Título *"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            required
          />

          <Input
            label="Data de Entrega"
            type="date"
            value={formData.due_date}
            onChange={(e) => setFormData({ ...formData, due_date: e.target.value })}
          />

          <Select
            label="Status *"
            value={formData.status}
            onChange={(e) => setFormData({ ...formData, status: e.target.value })}
            options={[
              { value: 'pending', label: 'Pendente' },
              { value: 'in_progress', label: 'Em andamento' },
              { value: 'completed', label: 'Concluída' },
              { value: 'cancelled', label: 'Cancelada' },
            ]}
            required
          />

          <Select
            label="Prioridade *"
            value={formData.priority}
            onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
            options={[
              { value: 'low', label: 'Baixa' },
              { value: 'medium', label: 'Média' },
              { value: 'high', label: 'Alta' },
            ]}
            required
          />

          <Select
            label="Cliente"
            value={formData.client_id}
            onChange={(e) => setFormData({ ...formData, client_id: e.target.value })}
            options={[
              { value: '', label: 'Sem cliente' },
              ...clients.map((client) => ({ value: client.id, label: client.empresa })),
            ]}
          />

          <Select
            label="Responsável"
            value={formData.assigned_to}
            onChange={(e) => setFormData({ ...formData, assigned_to: e.target.value })}
            options={[
              { value: '', label: 'Não atribuído' },
              ...assignees.map((assignee) => ({
                value: assignee.id,
                label: assignee.name || assignee.email,
              })),
            ]}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Descrição
          </label>
          <textarea
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-cyan-300 focus:ring-4 focus:ring-cyan-100"
            rows={4}
            placeholder="Detalhes da tarefa..."
          />
        </div>

        {error && (
          <div className="rounded-2xl border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700">
            {error}
          </div>
        )}

        <div className="flex justify-end space-x-3 pt-4">
          <Button type="button" variant="ghost" onClick={onClose}>
            Cancelar
          </Button>
          <Button type="submit" disabled={loading}>
            {loading ? 'Salvando...' : isEdit ? 'Salvar Alterações' : 'Criar Tarefa'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
