import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import {
  Compass,
  CheckCircle2,
  Clock,
  Plus,
  Trash2,
  Calendar,
  AlertCircle
} from 'lucide-react';
import { api } from '../api/api';
import DashboardLayout from '../components/Layout/DashboardLayout';
import LoadingSpinner from '../components/common/LoadingSpinner';
import Badge from '../components/common/Badge';
import Toast from '../components/common/Toast';

export default function StartupRoadmap() {
  const { id } = useParams();
  const [ideas, setIdeas] = useState([]);
  const [selectedIdeaId, setSelectedIdeaId] = useState(id || '');
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(null);

  // New task modal / inline form state
  const [showAddModal, setShowAddModal] = useState(false);
  const [newTask, setNewTask] = useState({
    title: '',
    description: '',
    phase: 'Phase 1: Validate Problem',
    priority: 'HIGH',
    estimatedTimeframe: 'Weeks 1-2'
  });

  useEffect(() => {
    loadIdeas();
  }, []);

  useEffect(() => {
    if (selectedIdeaId) {
      loadRoadmap(selectedIdeaId);
    }
  }, [selectedIdeaId]);

  const loadIdeas = async () => {
    try {
      const data = await api.get('/ideas?page=0&size=20');
      const list = data.content || [];
      setIdeas(list);
      if (!selectedIdeaId && list.length > 0) {
        setSelectedIdeaId(list[0].id);
      }
    } catch (err) {
      setToast({ type: 'error', message: 'Failed to load ideas for roadmap.' });
    }
  };

  const loadRoadmap = async (ideaId) => {
    setLoading(true);
    try {
      const res = await api.get(`/ideas/${ideaId}/roadmap`);
      // Defensively handle both plain arrays and Spring Page<> wrappers
      const list = Array.isArray(res) ? res : (res && Array.isArray(res.content) ? res.content : []);
      setTasks(list);
    } catch (err) {
      setToast({ type: 'error', message: 'Failed to load roadmap tasks.' });
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (task, newStatus) => {
    try {
      const updated = await api.put(`/roadmap/tasks/${task.id}`, {
        ...task,
        status: newStatus
      });
      const updatedTask = updated && updated.id ? updated : { ...task, status: newStatus };
      setTasks(prev => prev.map(t => t.id === task.id ? updatedTask : t));
      setToast({ type: 'success', message: 'Task status updated.' });
    } catch (err) {
      setToast({ type: 'error', message: 'Failed to update task status.' });
    }
  };

  const handleAddTask = async (e) => {
    e.preventDefault();
    if (!newTask.title.trim()) {
      setToast({ type: 'warning', message: 'Task title is required.' });
      return;
    }

    try {
      const created = await api.post(`/ideas/${selectedIdeaId}/roadmap/tasks`, newTask);
      setTasks(prev => [...prev, created]);
      setShowAddModal(false);
      setNewTask({
        title: '',
        description: '',
        phase: 'Phase 1: Validate Problem',
        priority: 'HIGH',
        estimatedTimeframe: 'Weeks 1-2'
      });
      setToast({ type: 'success', message: 'New roadmap task added.' });
    } catch (err) {
      setToast({ type: 'error', message: 'Failed to create task.' });
    }
  };

  const handleDeleteTask = async (taskId) => {
    if (!window.confirm('Delete this task from the roadmap?')) return;
    try {
      await api.del(`/roadmap/tasks/${taskId}`);
      setTasks(prev => prev.filter(t => t.id !== taskId));
      setToast({ type: 'success', message: 'Task removed.' });
    } catch (err) {
      setToast({ type: 'error', message: 'Failed to delete task.' });
    }
  };

  // Group tasks by Phase
  const phases = [
    'Phase 1: Validate Problem',
    'Phase 2: Validate Solution',
    'Phase 3: Validate Business Model',
    'Phase 4: Build and Launch',
    'Phase 5: Measure and Improve'
  ];

  const groupedTasks = phases.reduce((acc, phase) => {
    acc[phase] = tasks.filter(t => t.phase === phase || (!phases.includes(t.phase) && phase === phases[0]));
    return acc;
  }, {});

  const completedCount = tasks.filter(t => t.status === 'COMPLETED').length;
  const progressPercent = tasks.length > 0 ? Math.round((completedCount / tasks.length) * 100) : 0;

  return (
    <DashboardLayout>
      {toast && <Toast type={toast.type} message={toast.message} onClose={() => setToast(null)} />}

      {/* Selector & Actions */}
      <div className="card" style={{ marginBottom: '28px' }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '16px'
        }}>
          <div style={{ flex: 1, minWidth: '280px' }}>
            <label className="form-label" style={{ marginBottom: '6px' }}>
              Select Startup Idea
            </label>
            <select
              className="form-select"
              value={selectedIdeaId}
              onChange={(e) => setSelectedIdeaId(e.target.value)}
            >
              {ideas.map(i => (
                <option key={i.id} value={i.id}>{i.title} ({i.industry})</option>
              ))}
            </select>
          </div>

          <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-end' }}>
            <button
              onClick={() => setShowAddModal(true)}
              className="btn btn-primary"
              disabled={!selectedIdeaId}
              style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
            >
              <Plus size={16} /> Add Task
            </button>
          </div>
        </div>

        {/* Overall Completion Progress */}
        <div style={{ marginTop: '20px', paddingTop: '16px', borderTop: '1px solid var(--color-border)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--color-text-secondary)' }}>
              Roadmap Progress: {completedCount} of {tasks.length} tasks completed
            </span>
            <span style={{ fontSize: '14px', fontWeight: 700, color: 'var(--color-primary)' }}>
              {progressPercent}%
            </span>
          </div>
          <div style={{ width: '100%', height: '8px', background: 'var(--color-bg-secondary)', borderRadius: '4px', overflow: 'hidden' }}>
            <div style={{
              width: `${progressPercent}%`,
              height: '100%',
              background: progressPercent === 100 ? 'var(--color-success)' : 'var(--color-primary)',
              transition: 'width 0.4s ease'
            }} />
          </div>
        </div>
      </div>

      {loading ? (
        <LoadingSpinner message="Loading roadmap execution plan..." />
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
          {phases.map((phase) => {
            const phaseTasks = groupedTasks[phase] || [];

            return (
              <div key={phase} className="card" style={{ padding: '24px' }}>
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  paddingBottom: '14px',
                  marginBottom: '16px',
                  borderBottom: '1px solid var(--color-border)'
                }}>
                  <h3 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--color-text-primary)' }}>
                    {phase}
                  </h3>
                  <span style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>
                    {phaseTasks.filter(t => t.status === 'COMPLETED').length} / {phaseTasks.length} Done
                  </span>
                </div>

                {phaseTasks.length === 0 ? (
                  <p style={{ fontSize: '13px', color: 'var(--color-text-muted)', fontStyle: 'italic' }}>
                    No tasks planned for this phase.
                  </p>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {phaseTasks.map((task) => {
                      const isDone = task.status === 'COMPLETED';

                      return (
                        <div key={task.id} style={{
                          background: isDone ? '#F8FAFC' : 'var(--color-bg-card)',
                          border: '1px solid var(--color-border)',
                          borderRadius: 'var(--radius-input)',
                          padding: '14px 16px',
                          display: 'flex',
                          alignItems: 'flex-start',
                          justifyContent: 'space-between',
                          gap: '16px',
                          opacity: isDone ? 0.75 : 1
                        }}>
                          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', flex: 1 }}>
                            <input
                              type="checkbox"
                              checked={isDone}
                              onChange={(e) => handleStatusChange(task, e.target.checked ? 'COMPLETED' : 'PENDING')}
                              style={{ width: '18px', height: '18px', cursor: 'pointer', marginTop: '3px' }}
                            />
                            <div>
                              <div style={{
                                fontSize: '14px',
                                fontWeight: 600,
                                color: 'var(--color-text-primary)',
                                textDecoration: isDone ? 'line-through' : 'none',
                                marginBottom: '4px'
                              }}>
                                {task.title}
                              </div>
                              {task.description && (
                                <p style={{ fontSize: '13px', color: 'var(--color-text-secondary)', lineHeight: 1.45 }}>
                                  {task.description}
                                </p>
                              )}
                              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '8px', fontSize: '12px', color: 'var(--color-text-muted)' }}>
                                <Badge variant={task.priority === 'HIGH' ? 'danger' : task.priority === 'MEDIUM' ? 'warning' : 'neutral'}>
                                  {task.priority || 'MEDIUM'}
                                </Badge>
                                {task.estimatedTimeframe && (
                                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                                    <Clock size={12} /> {task.estimatedTimeframe}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>

                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <select
                              className="form-select"
                              style={{ height: '32px', fontSize: '12px', padding: '0 8px', width: '130px' }}
                              value={task.status || 'PENDING'}
                              onChange={(e) => handleStatusChange(task, e.target.value)}
                            >
                              <option value="PENDING">Pending</option>
                              <option value="IN_PROGRESS">In Progress</option>
                              <option value="COMPLETED">Completed</option>
                            </select>

                            <button
                              onClick={() => handleDeleteTask(task.id)}
                              style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text-muted)', padding: '4px' }}
                              title="Delete Task"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Add Task Modal */}
      {showAddModal && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(15, 23, 42, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 50,
          padding: '16px'
        }}>
          <div className="card" style={{ maxWidth: '500px', width: '100%', padding: '28px' }}>
            <h3 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--color-text-primary)', marginBottom: '16px' }}>
              Add Actionable Roadmap Task
            </h3>

            <form onSubmit={handleAddTask}>
              <div className="form-group">
                <label className="form-label">Task Title <span className="required">*</span></label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. Interview 15 target buyers"
                  value={newTask.title}
                  onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Phase</label>
                <select
                  className="form-select"
                  value={newTask.phase}
                  onChange={(e) => setNewTask({ ...newTask, phase: e.target.value })}
                >
                  {phases.map(p => (
                    <option key={p} value={p}>{p}</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Description</label>
                <textarea
                  className="form-textarea"
                  rows={3}
                  placeholder="Details on what to accomplish..."
                  value={newTask.description}
                  onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div className="form-group">
                  <label className="form-label">Priority</label>
                  <select
                    className="form-select"
                    value={newTask.priority}
                    onChange={(e) => setNewTask({ ...newTask, priority: e.target.value })}
                  >
                    <option value="HIGH">High</option>
                    <option value="MEDIUM">Medium</option>
                    <option value="LOW">Low</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Estimated Timeframe</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g. Weeks 1-2"
                    value={newTask.estimatedTimeframe}
                    onChange={(e) => setNewTask({ ...newTask, estimatedTimeframe: e.target.value })}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '16px' }}>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setShowAddModal(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Save Task
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
