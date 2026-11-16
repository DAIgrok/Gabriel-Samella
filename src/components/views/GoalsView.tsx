import React, { useMemo, useState } from 'react';
import { Target, Plus, Check, Trash2 } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { motion, useReducedMotion } from 'motion/react';

const GOAL_ICONS = ['✈️', '🌅', '📸', '🍝', '🏡', '🎶', '💍', '🌌', '🎂', '🌴'];
const GOAL_CATEGORIES = ['Viagens', 'Momentos', 'Casa', 'Futuro', 'Encontros', 'Memórias'];

export const GoalsView: React.FC = () => {
  const { coupleGoals, addCoupleGoal, toggleCoupleGoal, removeCoupleGoal } = useApp();
  const prefersReducedMotion = useReducedMotion();

  const [filterCat, setFilterCat] = useState<string>('Todas');
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('Viagens');
  const [icon, setIcon] = useState('✈️');
  const [showForm, setShowForm] = useState(false);

  const completedCount = coupleGoals.filter((g) => g.completed).length;
  const totalCount = coupleGoals.length;
  const pct = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  const filtered = useMemo(() => {
    if (filterCat === 'Todas') return coupleGoals;
    return coupleGoals.filter((g) => g.category === filterCat);
  }, [coupleGoals, filterCat]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    addCoupleGoal({ title: title.trim(), category, icon });
    setTitle('');
    setShowForm(false);
  };

  return (
    <motion.div
      initial={prefersReducedMotion ? false : { opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.25 }}
      className="space-y-5 pb-32 sm:pb-24 max-w-2xl mx-auto"
    >
      {/* Header */}
      <div className="text-center space-y-1.5">
        <p className="text-xs text-pink-300/90 font-medium inline-flex items-center gap-1.5">
          <Target className="w-3.5 h-3.5" />
          <span>Planos & Sonhos de Gabriel & Samella</span>
        </p>
        <h2 className="text-2xl md:text-3xl font-bold text-white font-display">
          Nossas Metas & Sonhos ♡
        </h2>
        <p className="text-xs md:text-sm text-purple-200/75">
          Cada sonho realizado rende +5 💎 e entra para a nossa história.
        </p>
      </div>

      {/* Progress Summary Card */}
      <div className="rounded-3xl p-4 sm:p-5 bg-gradient-to-br from-[#190933]/90 to-[#0d031c]/95 border border-purple-500/25 space-y-3">
        <div className="flex items-center justify-between gap-2">
          <div>
            <span className="text-xs text-purple-300/80 block">Progresso dos Sonhos</span>
            <strong className="text-lg text-white tabular-nums">
              {completedCount} de {totalCount} realizados
            </strong>
          </div>
          <button
            type="button"
            onClick={() => setShowForm((s) => !s)}
            className="min-h-[44px] px-4 rounded-2xl bg-gradient-to-r from-purple-600 to-pink-600 text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-md"
          >
            <Plus className="w-4 h-4" />
            <span>Novo Sonho</span>
          </button>
        </div>

        <div className="space-y-1">
          <div className="w-full h-2.5 bg-purple-950 rounded-full overflow-hidden border border-purple-500/25">
            <div
              className="h-full bg-gradient-to-r from-purple-500 via-pink-500 to-rose-400 rounded-full transition-all duration-300"
              style={{ width: `${pct}%` }}
            />
          </div>
          <div className="text-right text-[11px] font-mono text-pink-200 tabular-nums">{pct}%</div>
        </div>
      </div>

      {/* Add Goal Form */}
      {showForm && (
        <form
          onSubmit={handleSubmit}
          className="rounded-3xl p-4 sm:p-5 bg-[#15072c] border border-pink-400/35 space-y-3"
        >
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Ex: Viajar para Gramado no inverno..."
            className="w-full min-h-[44px] px-4 rounded-xl bg-purple-950/70 border border-purple-500/30 text-sm text-white placeholder:text-purple-300/40 focus:outline-none focus:border-pink-400"
          />

          <div className="flex flex-wrap gap-1.5">
            {GOAL_ICONS.map((em) => (
              <button
                key={em}
                type="button"
                onClick={() => setIcon(em)}
                className={`w-9 h-9 rounded-xl border text-base cursor-pointer ${
                  icon === em ? 'bg-pink-500/30 border-pink-400' : 'bg-purple-950/60 border-purple-500/25'
                }`}
              >
                {em}
              </button>
            ))}
          </div>

          <div className="flex flex-wrap items-center justify-between gap-2">
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="min-h-[42px] px-3 rounded-xl bg-purple-950/70 border border-purple-500/30 text-xs text-white"
            >
              {GOAL_CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="min-h-[42px] px-4 rounded-xl bg-white/5 text-xs text-purple-200 cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="min-h-[42px] px-5 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 text-white text-xs font-bold cursor-pointer"
              >
                Salvar Sonho
              </button>
            </div>
          </div>
        </form>
      )}

      {/* Category Filter */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
        {['Todas', ...GOAL_CATEGORIES].map((cat) => (
          <button
            key={cat}
            type="button"
            onClick={() => setFilterCat(cat)}
            className={`min-h-[38px] px-3 rounded-xl text-xs font-semibold whitespace-nowrap shrink-0 border cursor-pointer ${
              filterCat === cat
                ? 'bg-pink-600/30 border-pink-400/60 text-white'
                : 'bg-purple-950/40 border-purple-500/20 text-purple-200/75'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Checklist */}
      <div className="space-y-2.5">
        {filtered.map((goal) => (
          <div
            key={goal.id}
            className={`rounded-2xl p-3.5 sm:p-4 border flex items-center justify-between gap-3 transition-colors ${
              goal.completed
                ? 'bg-emerald-950/25 border-emerald-400/35'
                : 'bg-purple-950/45 border-purple-500/25'
            }`}
          >
            <button
              type="button"
              onClick={() => toggleCoupleGoal(goal.id)}
              className="flex items-center gap-3 flex-1 min-w-0 text-left cursor-pointer"
            >
              <div
                className={`w-10 h-10 rounded-xl border flex items-center justify-center shrink-0 transition-colors ${
                  goal.completed
                    ? 'bg-emerald-500 border-emerald-300 text-white'
                    : 'bg-purple-900/50 border-purple-400/30 text-lg'
                }`}
              >
                {goal.completed ? <Check className="w-5 h-5" /> : goal.icon}
              </div>

              <div className="min-w-0 flex-1">
                <p
                  className={`text-sm font-semibold leading-snug ${
                    goal.completed ? 'line-through text-emerald-200/80' : 'text-white'
                  }`}
                >
                  {goal.title}
                </p>
                <span className="text-[11px] text-purple-300/75">
                  {goal.category}
                  {goal.completedAt ? ` · Realizado em ${goal.completedAt}` : ''}
                </span>
              </div>
            </button>

            <button
              type="button"
              onClick={() => removeCoupleGoal(goal.id)}
              aria-label="Remover meta"
              className="min-w-[40px] min-h-[40px] rounded-xl text-purple-300/50 hover:text-rose-300 hover:bg-rose-500/10 flex items-center justify-center cursor-pointer shrink-0"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>
    </motion.div>
  );
};
