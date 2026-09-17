import React, { useState } from 'react';
import {
  CheckCircle2,
  Circle,
  Plus,
  Calendar,
  Clock,
  BookOpen,
  Edit2,
  Trash2,
  AlertCircle,
  Sparkles,
  Filter,
  Check,
  X,
  User,
  ExternalLink
} from 'lucide-react';
import { Assignment, UserProfile } from '../types';

interface AssignmentManagerProps {
  assignments: Assignment[];
  onToggleStatus: (id: string) => void;
  onAddAssignment: (assignment: Omit<Assignment, 'id'>) => void;
  onUpdateAssignment: (id: string, updates: Partial<Assignment>) => void;
  onDeleteAssignment: (id: string) => void;
  currentUser: UserProfile | null;
  onOpenLogin: () => void;
}

export const AssignmentManager: React.FC<AssignmentManagerProps> = ({
  assignments,
  onToggleStatus,
  onAddAssignment,
  onUpdateAssignment,
  onDeleteAssignment,
  currentUser,
  onOpenLogin,
}) => {
  const [filter, setFilter] = useState<'all' | 'pending' | 'completed'>('all');
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Form states
  const [newTitle, setNewTitle] = useState('');
  const [newCourse, setNewCourse] = useState('');
  const [newDueDate, setNewDueDate] = useState('2026-10-12');
  const [newDueTime, setNewDueTime] = useState('11:59 PM');
  const [newPriority, setNewPriority] = useState<'low' | 'medium' | 'high'>('medium');
  const [newNotes, setNewNotes] = useState('');

  // Edit states
  const [editTitle, setEditTitle] = useState('');
  const [editDueDate, setEditDueDate] = useState('');
  const [editNotes, setEditNotes] = useState('');

  const completedCount = assignments.filter((a) => a.status === 'completed').length;
  const pendingCount = assignments.filter((a) => a.status !== 'completed').length;

  const filteredAssignments = assignments.filter((a) => {
    if (filter === 'pending') return a.status !== 'completed';
    if (filter === 'completed') return a.status === 'completed';
    return true;
  });

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    onAddAssignment({
      title: newTitle.trim(),
      courseOrOrg: newCourse.trim() || 'General Coursework',
      dueDate: newDueDate,
      dueTime: newDueTime.trim() || null,
      status: 'pending',
      priority: newPriority,
      notes: newNotes.trim() || undefined,
    });

    setNewTitle('');
    setNewCourse('');
    setNewNotes('');
    setShowAddForm(false);
  };

  const startEdit = (assignment: Assignment) => {
    setEditingId(assignment.id);
    setEditTitle(assignment.title);
    setEditDueDate(assignment.dueDate);
    setEditNotes(assignment.notes || '');
  };

  const saveEdit = (id: string) => {
    if (!editTitle.trim()) return;
    onUpdateAssignment(id, {
      title: editTitle.trim(),
      dueDate: editDueDate,
      notes: editNotes.trim() || undefined,
    });
    setEditingId(null);
  };

  return (
    <div
      id="assignment-tracker-section"
      className="bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden flex flex-col"
    >
      {/* Header bar */}
      <div className="p-4 sm:p-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-gradient-to-r from-slate-50 via-white to-indigo-50/30">
        <div>
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600">
              <BookOpen className="h-4 w-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-slate-900">Assignment & Task Tracker</h3>
                <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                  {completedCount} of {assignments.length} Done
                </span>
              </div>
              <p className="text-xs text-slate-500">
                Mark completed assignments, edit due dates, or add deadlines synced to Supabase.
              </p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          {currentUser ? (
            <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-indigo-50 border border-indigo-100 text-[11px] text-indigo-800">
              <User className="h-3 w-3 text-indigo-600" />
              <span className="font-semibold">{currentUser.name}</span>
            </div>
          ) : (
            <button
              type="button"
              onClick={onOpenLogin}
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold border border-slate-200 transition"
            >
              <User className="h-3.5 w-3.5 text-slate-500" />
              <span>Sign in to save</span>
            </button>
          )}

          <button
            type="button"
            onClick={() => setShowAddForm(!showAddForm)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-xs transition"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>Add Assignment</span>
          </button>
        </div>
      </div>

      {/* Filter Tabs & Quick Stats */}
      <div className="px-4 py-2.5 bg-slate-50/70 border-b border-slate-100 flex items-center justify-between text-xs">
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => setFilter('all')}
            className={`px-2.5 py-1 rounded-lg font-medium transition ${
              filter === 'all'
                ? 'bg-white text-indigo-600 shadow-2xs font-semibold border border-slate-200'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            All Tasks ({assignments.length})
          </button>
          <button
            type="button"
            onClick={() => setFilter('pending')}
            className={`px-2.5 py-1 rounded-lg font-medium transition ${
              filter === 'pending'
                ? 'bg-white text-indigo-600 shadow-2xs font-semibold border border-slate-200'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Pending ({pendingCount})
          </button>
          <button
            type="button"
            onClick={() => setFilter('completed')}
            className={`px-2.5 py-1 rounded-lg font-medium transition ${
              filter === 'completed'
                ? 'bg-white text-emerald-600 shadow-2xs font-semibold border border-slate-200'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Completed ({completedCount})
          </button>
        </div>

        {/* Progress Bar */}
        <div className="hidden md:flex items-center gap-2">
          <div className="w-28 bg-slate-200 h-2 rounded-full overflow-hidden">
            <div
              className="bg-emerald-500 h-full transition-all duration-300"
              style={{
                width: `${assignments.length ? (completedCount / assignments.length) * 100 : 0}%`,
              }}
            />
          </div>
          <span className="text-[11px] text-slate-500 font-medium">
            {assignments.length
              ? Math.round((completedCount / assignments.length) * 100)
              : 0}
            %
          </span>
        </div>
      </div>

      {/* Add Assignment Form Drawer */}
      {showAddForm && (
        <form
          onSubmit={handleCreateSubmit}
          className="p-4 bg-indigo-50/40 border-b border-indigo-100 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 text-xs animate-in fade-in duration-150"
        >
          <div className="sm:col-span-2">
            <label className="block text-slate-700 font-semibold mb-1">Assignment Title</label>
            <input
              type="text"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              placeholder="e.g. CS 380: Assignment 3 Transformer"
              required
              className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 text-xs"
            />
          </div>

          <div>
            <label className="block text-slate-700 font-semibold mb-1">Course / Dept</label>
            <input
              type="text"
              value={newCourse}
              onChange={(e) => setNewCourse(e.target.value)}
              placeholder="e.g. CS 380 / Machine Learning"
              className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 text-xs"
            />
          </div>

          <div>
            <label className="block text-slate-700 font-semibold mb-1">Due Date</label>
            <input
              type="date"
              value={newDueDate}
              onChange={(e) => setNewDueDate(e.target.value)}
              required
              className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 text-xs"
            />
          </div>

          <div>
            <label className="block text-slate-700 font-semibold mb-1">Due Time</label>
            <input
              type="text"
              value={newDueTime}
              onChange={(e) => setNewDueTime(e.target.value)}
              placeholder="11:59 PM"
              className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 text-xs"
            />
          </div>

          <div>
            <label className="block text-slate-700 font-semibold mb-1">Priority</label>
            <select
              value={newPriority}
              onChange={(e) => setNewPriority(e.target.value as any)}
              className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 text-xs"
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
          </div>

          <div className="sm:col-span-2">
            <label className="block text-slate-700 font-semibold mb-1">Notes / Instructions</label>
            <input
              type="text"
              value={newNotes}
              onChange={(e) => setNewNotes(e.target.value)}
              placeholder="e.g. Submit notebook on Gradescope and push code to GitHub"
              className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 text-xs"
            />
          </div>

          <div className="flex items-end gap-2">
            <button
              type="submit"
              className="flex-1 py-1.5 px-3 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg shadow-2xs transition"
            >
              Save Assignment
            </button>
            <button
              type="button"
              onClick={() => setShowAddForm(false)}
              className="py-1.5 px-2 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-lg transition"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      {/* Assignment Items List */}
      <div className="divide-y divide-slate-100 max-h-[420px] overflow-y-auto">
        {filteredAssignments.length === 0 ? (
          <div className="p-8 text-center text-slate-400 text-xs">
            No assignments match the selected filter.
          </div>
        ) : (
          filteredAssignments.map((assignment) => {
            const isCompleted = assignment.status === 'completed';
            const isEditing = editingId === assignment.id;

            return (
              <div
                key={assignment.id}
                className={`p-3.5 sm:px-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition ${
                  isCompleted ? 'bg-slate-50/60' : 'bg-white hover:bg-slate-50/80'
                }`}
              >
                {/* Left side: Checkbox + Title + Metadata */}
                <div className="flex items-start gap-3 flex-1 min-w-0">
                  <button
                    type="button"
                    onClick={() => onToggleStatus(assignment.id)}
                    className="mt-0.5 shrink-0 text-slate-400 hover:text-emerald-600 transition"
                    title={isCompleted ? 'Mark as Pending' : 'Mark as Completed'}
                  >
                    {isCompleted ? (
                      <CheckCircle2 className="h-5 w-5 text-emerald-600 fill-emerald-100" />
                    ) : (
                      <Circle className="h-5 w-5 hover:text-emerald-500" />
                    )}
                  </button>

                  <div className="flex-1 min-w-0">
                    {isEditing ? (
                      <div className="space-y-2 py-1">
                        <input
                          type="text"
                          value={editTitle}
                          onChange={(e) => setEditTitle(e.target.value)}
                          className="w-full px-2.5 py-1 text-xs border border-indigo-400 rounded bg-white text-slate-900"
                        />
                        <div className="flex gap-2">
                          <input
                            type="date"
                            value={editDueDate}
                            onChange={(e) => setEditDueDate(e.target.value)}
                            className="px-2 py-1 text-xs border border-slate-300 rounded bg-white"
                          />
                          <input
                            type="text"
                            value={editNotes}
                            onChange={(e) => setEditNotes(e.target.value)}
                            placeholder="Notes..."
                            className="flex-1 px-2 py-1 text-xs border border-slate-300 rounded bg-white"
                          />
                          <button
                            type="button"
                            onClick={() => saveEdit(assignment.id)}
                            className="px-2.5 py-1 bg-emerald-600 text-white rounded font-medium hover:bg-emerald-700 text-xs"
                          >
                            Save
                          </button>
                          <button
                            type="button"
                            onClick={() => setEditingId(null)}
                            className="px-2 py-1 bg-slate-200 text-slate-700 rounded text-xs"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <div className="flex items-center gap-2 flex-wrap">
                          <span
                            className={`text-xs font-semibold ${
                              isCompleted
                                ? 'line-through text-slate-400'
                                : 'text-slate-900'
                            }`}
                          >
                            {assignment.title}
                          </span>

                          <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200">
                            {assignment.courseOrOrg}
                          </span>

                          {assignment.priority === 'high' && (
                            <span className="text-[10px] font-semibold px-2 py-0.2 rounded-full bg-rose-50 text-rose-700 border border-rose-200">
                              High Priority
                            </span>
                          )}

                          {isCompleted && (
                            <span className="text-[10px] font-medium px-2 py-0.2 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                              Done
                            </span>
                          )}
                        </div>

                        <div className="flex items-center gap-3 text-[11px] text-slate-500 mt-1">
                          <span className="flex items-center gap-1 font-mono">
                            <Calendar className="h-3 w-3 text-slate-400" />
                            {assignment.dueDate}
                          </span>
                          {assignment.dueTime && (
                            <span className="flex items-center gap-1 font-mono">
                              <Clock className="h-3 w-3 text-slate-400" />
                              {assignment.dueTime}
                            </span>
                          )}
                          {assignment.notes && (
                            <span className="text-slate-600 truncate max-w-xs">
                              &bull; {assignment.notes}
                            </span>
                          )}
                        </div>
                      </>
                    )}
                  </div>
                </div>

                {/* Right side action controls */}
                {!isEditing && (
                  <div className="flex items-center gap-1.5 shrink-0 self-end sm:self-center">
                    <button
                      type="button"
                      onClick={() => onToggleStatus(assignment.id)}
                      className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition ${
                        isCompleted
                          ? 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                          : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200'
                      }`}
                    >
                      {isCompleted ? 'Mark Pending' : 'Mark as Done'}
                    </button>

                    <button
                      type="button"
                      onClick={() => startEdit(assignment)}
                      className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-slate-100 rounded-lg transition"
                      title="Edit Assignment"
                    >
                      <Edit2 className="h-3.5 w-3.5" />
                    </button>

                    <button
                      type="button"
                      onClick={() => onDeleteAssignment(assignment.id)}
                      className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-slate-100 rounded-lg transition"
                      title="Delete Assignment"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Card Footer notice */}
      <div className="px-4 py-2.5 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
        <span>
          Changes are synced with Supabase table <code>assignments</code>
        </span>
        <span className="text-emerald-700 font-medium">Real-time status tracking active</span>
      </div>
    </div>
  );
};
