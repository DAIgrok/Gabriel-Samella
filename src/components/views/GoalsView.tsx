import React, { useMemo, useState } from 'react';
import { Target, Plus, Check, Trash2, Pencil, Calendar, X, Sparkles } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { CoupleGoal, GoalPriority } from '../../types';
import { motion, useReducedMotion } from 'motion/react';
import { formatDateBR } from '../../utils/calendarHelpers';

const GOAL_ICONS = ['✈️', '🌅', '📸', '🍝', '🏡', '🎶', '💍', '🌌', '🎂', '🌴', '🧺', '☕'];
const GOAL_CATEGORIES = [
  'Viagens',
  'Momentos',
  'Casa',
  'Futuro',
  'Encontros',
  'Memórias',
  'Gastronomia',
  'Aventuras',
];

const PRIORITY_OPTIONS: { id: GoalPriority; label: string; dot: string; text: string }[] = [
  { id: 'alta', label: 'Alta prioridade', dot: 'bg-pink-400', text: 'text-pink-300' },
  { id: 'media', label: 'Plano do casal', dot: 'bg-purple-400', text: 'text-purple-200' },
  { id: 'suave', label: 'Quando der', dot: 'bg-sky-400', text: 'text-sky-200' },
];

export const GoalsView: React.FC = () => {
  const {
    coupleGoals,
    addCoupleGoal,
    updateCoupleGoal,
    toggleCoupleGoal,
    removeCoupleGoal,
    config,
  } = useApp();
  const prefersReducedMotion = useReducedMotion();

  const [statusFilter, setStatusFilter] = useState<'todos' | 'pendentes' | 'realizados'>('todos');
  const [filterCat, setFilterCat] = useState<string>('Todas');

  const [showForm, setShowForm] = useState(false);
  const [editingGoalId, setEditingGoalId] = useState<string | null>(null);
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('Viagens');
  const [icon, setIcon] = useState('✈️');
  const [priority, setPriority] = useState<GoalPriority>('alta');
  const [targetDate, setTargetDate] = useState('');
  const [notes, setNotes] = useState('');
  const [addedBy, setAddedBy] = useState<'Samella' | 'Gabriel'>('Samella');

  const completedCount = coupleGoals.filter((g) => g.completed).length;
  const totalCount = coupleGoals.length;
  const pendingCount = Math.max(0, totalCount - completedCount);
  const pct = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  const filtered = useMemo(() => {
    return coupleGoals.filter((g) => {
      if (statusFilter === 'pendentes' && g.completed) return false;
      if (statusFilter === 'realizados' && !g.completed) return false;
      if (filterCat !== 'Todas' && g.category !== filterCat) return false;
      return true;
    });
  }, [coupleGoals, statusFilter, filterCat]);

  const resetForm = () => {
    setEditingGoalId(null);
    setTitle('');
    setCategory('Viagens');
    setIcon('✈️');
    setPriority('alta');
    setTargetDate('');
    setNotes('');
    setAddedBy('Samella');
    setShowForm(false);
  };

  const openCreateForm = () => {
    resetForm();
    setShowForm(true);
  };

  const openEditForm = (goal: CoupleGoal) => {
    setEditingGoalId(goal.id);
    setTitle(goal.title);
    setCategory(GOAL_CATEGORIES.includes(goal.category) ? goal.category : 'Momentos');
    setIcon(goal.icon || '✈️');
    setPriority(goal.priority || 'media');
    setTargetDate(goal.targetDate || '');
    setNotes(goal.notes || '');
    setAddedBy(goal.addedBy || 'Gabriel');
    setShowForm(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const payload = {
      title: title.trim(),
      category,
      icon,
      priority,
      targetDate: targetDate || undefined,
      notes: notes.trim() || undefined,
      addedBy,
    };

    if (editingGoalId) {
      updateCoupleGoal(editingGoalId, payload);
    } else {
      addCoupleGoal(payload);
    }
    resetForm();
  };

  const getPriorityMeta = (p?: GoalPriority) =>
    PRIORITY_OPTIONS.find((opt) => opt.id === (p || 'media')) || PRIORITY_OPTIONS[1];

  return (
    <motion.div
      initial={prefersReducedMotion ? false : { opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.22 }}
      className="space-y-5 pb-32 sm:pb-24 max-w-2xl mx-auto"
    >
      {/* Header */}
      <div className="text-center space-y-1.5">
        <p className="text-xs text-pink-300/90 font-medium inline-flex items-center gap-1.5">
          <Target className="w-3.5 h-3.5" />
          <span>
            Lista de Desejos de {config.myName} & {config.partnerName}
          </span>
        </p>
        <h2 className="text-2xl md:text-3xl font-bold text-white font-display">
          Sonhos & Lista de Desejos ♡
        </h2>
        <p className="text-xs md:text-sm text-purple-200/75">
          Tudo o que queremos viver juntos. A 1ª conclusão de cada desejo rende +5 💎.
        </p>
      </div>

      {/* Progress Summary Card */}
      <div className="rounded-3xl p-4 sm:p-5 bg-gradient-to-br from-[#190933]/95 to-[#0d031c]/95 border border-purple-500/25 space-y-3.5 shadow-lg">
        <div className="flex items-center justify-between gap-3">
          <div>
            <span className="text-xs text-purple-300/80 block">Progresso Total da Lista</span>
            <strong className="text-lg sm:text-xl text-white tabular-nums">
              {completedCount} de {totalCount} realizados
            </strong>
            <p className="text-xs text-purple-200/70 tabular-nums mt-0.5">
              {pendingCount === 0 && totalCount > 0
                ? 'Todos os desejos desta lista já foram vividos! 🎉'
                : `${pendingCount} ${pendingCount === 1 ? 'desejo restante' : 'desejos restantes'}`}
            </p>
          </div>
          <button
            type="button"
            onClick={() => (showForm ? resetForm() : openCreateForm())}
            className="min-h-[44px] px-4 rounded-2xl bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-md whitespace-nowrap shrink-0 active:scale-[0.98] transition"
          >
            {showForm ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
            <span>{showForm ? 'Fechar' : 'Novo Desejo'}</span>
          </button>
        </div>

        <div className="space-y-1.5">
          <div className="w-full h-3 bg-purple-950 rounded-full overflow-hidden border border-purple-500/25">
            <div
              className="h-full bg-gradient-to-r from-purple-500 via-pink-500 to-rose-400 rounded-full transition-all duration-300"
              style={{ width: `${pct}%` }}
            />
          </div>
          <div className="flex items-center justify-between text-[11px] text-purple-300/80 tabular-nums">
            <span>{completedCount} concluídos</span>
            <span className="font-mono font-bold text-pink-200">{pct}% completo</span>
          </div>
        </div>
      </div>

      {/* Add / Edit Wish Form */}
      {showForm && (
        <form
          onSubmit={handleSubmit}
          className="rounded-3xl p-4 sm:p-5 bg-[#15072c] border border-pink-400/40 space-y-3.5 shadow-xl"
        >
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-pink-400" />
              <span>{editingGoalId ? 'Editar Desejo' : 'Adicionar à Lista de Desejos'}</span>
            </h3>
            <button
              type="button"
              onClick={resetForm}
              aria-label="Cancelar formulário"
              className="min-w-[40px] min-h-[40px] rounded-xl text-purple-300/70 hover:text-white flex items-center justify-center cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <input
            type="text"
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Ex: Viajar para Gramado no inverno..."
            className="w-full min-h-[44px] px-4 rounded-xl bg-purple-950/70 border border-purple-500/30 text-sm text-white placeholder:text-purple-300/40 focus:outline-none focus:border-pink-400"
          />

          <div className="space-y-1.5">
            <span className="text-xs text-purple-200/80 block">Ícone</span>
            <div className="flex flex-wrap gap-1.5">
              {GOAL_ICONS.map((em) => (
                <button
                  key={em}
                  type="button"
                  onClick={() => setIcon(em)}
                  className={`min-w-[44px] min-h-[44px] rounded-xl border text-base cursor-pointer flex items-center justify-center transition ${
                    icon === em
                      ? 'bg-pink-500/30 border-pink-400 scale-105'
                      : 'bg-purple-950/60 border-purple-500/25 hover:border-purple-400/50'
                  }`}
                >
                  {em}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs text-purple-200/80 block">Categoria</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full min-h-[44px] px-3 rounded-xl bg-purple-950/70 border border-purple-500/30 text-xs text-white focus:outline-none focus:border-pink-400"
              >
                {GOAL_CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-xs text-purple-200/80 block">Prioridade</label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as GoalPriority)}
                className="w-full min-h-[44px] px-3 rounded-xl bg-purple-950/70 border border-purple-500/30 text-xs text-white focus:outline-none focus:border-pink-400"
              >
                {PRIORITY_OPTIONS.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-xs text-purple-200/80 block">Data prevista (opcional)</label>
              <input
                type="date"
                value={targetDate}
                onChange={(e) => setTargetDate(e.target.value)}
                className="w-full min-h-[44px] px-3 rounded-xl bg-purple-950/70 border border-purple-500/30 text-xs text-white focus:outline-none focus:border-pink-400"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs text-purple-200/80 block">Adicionado por</label>
              <div className="grid grid-cols-2 gap-1.5">
                {(['Samella', 'Gabriel'] as const).map((person) => (
                  <button
                    key={person}
                    type="button"
                    onClick={() => setAddedBy(person)}
                    className={`min-h-[44px] rounded-xl border text-xs font-semibold cursor-pointer transition ${
                      addedBy === person
                        ? 'bg-pink-600/30 border-pink-400 text-white'
                        : 'bg-purple-950/60 border-purple-500/25 text-purple-200/75'
                    }`}
                  >
                    {person}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <textarea
            rows={2}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Anotação, lugar dos sonhos ou detalhe especial (opcional)..."
            className="w-full p-3 rounded-xl bg-purple-950/70 border border-purple-500/30 text-xs text-white placeholder:text-purple-300/40 focus:outline-none focus:border-pink-400 resize-none"
          />

          <div className="flex justify-end gap-2 pt-1">
            <button
              type="button"
              onClick={resetForm}
              className="min-h-[44px] px-4 rounded-xl bg-white/5 hover:bg-white/10 text-xs text-purple-200 cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="min-h-[44px] px-5 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 text-white text-xs font-bold cursor-pointer shadow-md"
            >
              {editingGoalId ? 'Salvar Alterações' : 'Salvar Desejo'}
            </button>
          </div>
        </form>
      )}

      {/* Status Segmented Filter */}
      <div className="grid grid-cols-3 gap-1.5 p-1 rounded-2xl bg-[#110424] border border-purple-500/20">
        {(
          [
            { id: 'todos', label: `Todos (${totalCount})` },
            { id: 'pendentes', label: `A realizar (${pendingCount})` },
            { id: 'realizados', label: `Feitos (${completedCount})` },
          ] as const
        ).map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setStatusFilter(tab.id)}
            className={`min-h-[40px] px-2 rounded-xl text-xs font-semibold whitespace-nowrap transition cursor-pointer tabular-nums ${
              statusFilter === tab.id
                ? 'bg-gradient-to-r from-purple-600/80 to-pink-600/80 text-white shadow'
                : 'text-purple-200/70 hover:text-white'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Category Filter */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
        {['Todas', ...GOAL_CATEGORIES].map((cat) => (
          <button
            key={cat}
            type="button"
            onClick={() => setFilterCat(cat)}
            className={`min-h-[40px] px-3.5 rounded-xl text-xs font-semibold whitespace-nowrap shrink-0 border cursor-pointer transition ${
              filterCat === cat
                ? 'bg-pink-600/30 border-pink-400/60 text-white'
                : 'bg-purple-950/40 border-purple-500/20 text-purple-200/75 hover:text-white'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Checklist */}
      {filtered.length === 0 ? (
        <div className="rounded-3xl p-8 bg-[#120524]/80 border border-purple-500/20 text-center space-y-2">
          <p className="text-sm font-semibold text-white">Nenhum desejo nesta visualização</p>
          <p className="text-xs text-purple-200/70">
            Mude os filtros ou adicione um novo plano especial para vocês dois.
          </p>
        </div>
      ) : (
        <div className="space-y-2.5">
          {filtered.map((goal) => {
            const pMeta = getPriorityMeta(goal.priority);
            return (
              <div
                key={goal.id}
                className={`rounded-2xl p-3.5 sm:p-4 border transition-colors ${
                  goal.completed
                    ? 'bg-emerald-950/25 border-emerald-400/35'
                    : 'bg-purple-950/45 border-purple-500/25'
                }`}
              >
                <div className="flex items-start justify-between gap-2.5">
                  <button
                    type="button"
                    onClick={() => toggleCoupleGoal(goal.id)}
                    className="flex items-start gap-3 flex-1 min-w-0 text-left cursor-pointer"
                  >
                    <div
                      className={`w-11 h-11 rounded-xl border flex items-center justify-center shrink-0 transition-colors mt-0.5 ${
                        goal.completed
                          ? 'bg-emerald-500 border-emerald-300 text-white'
                          : 'bg-purple-900/50 border-purple-400/30 text-lg'
                      }`}
                    >
                      {goal.completed ? <Check className="w-5 h-5" /> : goal.icon}
                    </div>

                    <div className="min-w-0 flex-1 space-y-1">
                      <p
                        className={`text-sm font-semibold leading-snug ${
                          goal.completed ? 'line-through text-emerald-200/80' : 'text-white'
                        }`}
                      >
                        {goal.title}
                      </p>

                      <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-[11px] text-purple-200/75">
                        <span>{goal.category}</span>
                        <span aria-hidden="true">·</span>
                        <span className={`inline-flex items-center gap-1 ${pMeta.text}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${pMeta.dot}`} />
                          {pMeta.label}
                        </span>
                        {goal.targetDate && (
                          <>
                            <span aria-hidden="true">·</span>
                            <span className="inline-flex items-center gap-1 tabular-nums">
                              <Calendar className="w-3 h-3" />
                              {formatDateBR(goal.targetDate)}
                            </span>
                          </>
                        )}
                        {goal.addedBy && (
                          <>
                            <span aria-hidden="true">·</span>
                            <span>por {goal.addedBy}</span>
                          </>
                        )}
                      </div>

                      {goal.notes && (
                        <p className="text-xs text-purple-200/80 leading-relaxed pt-0.5">
                          {goal.notes}
                        </p>
                      )}

                      <p className="text-[11px] text-purple-300/65 pt-0.5">
                        {goal.completed && goal.completedAt
                          ? `Realizado em ${goal.completedAt} · Recompensa resgatada`
                          : goal.rewardClaimed
                            ? 'Recompensa de +5 💎 já resgatada anteriormente'
                            : '+5 💎 ao concluir pela primeira vez'}
                      </p>
                    </div>
                  </button>

                  <div className="flex items-center shrink-0">
                    <button
                      type="button"
                      onClick={() => openEditForm(goal)}
                      aria-label="Editar desejo"
                      className="min-w-[44px] min-h-[44px] rounded-xl text-purple-300/60 hover:text-white hover:bg-white/10 flex items-center justify-center cursor-pointer"
                    >
                      <Pencil className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => removeCoupleGoal(goal.id)}
                      aria-label="Remover desejo"
                      className="min-w-[44px] min-h-[44px] rounded-xl text-purple-300/50 hover:text-rose-300 hover:bg-rose-500/10 flex items-center justify-center cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </motion.div>
  );
};
