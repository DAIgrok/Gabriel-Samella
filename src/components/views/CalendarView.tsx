import React, { useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import {
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Clock,
  MapPin,
  Pencil,
  Plus,
  Repeat,
  Trash2,
  X,
  Lock,
} from 'lucide-react';
import { motion, useReducedMotion } from 'motion/react';
import { useApp } from '../../context/AppContext';
import { CalendarEvent, CalendarEventCategory, CalendarEventColor } from '../../types';
import {
  CALENDAR_CATEGORIES,
  CALENDAR_COLORS,
  formatCountdownDays,
  formatDateBR,
  getCalendarCategoryMeta,
  getCalendarColorStyle,
  getEventsForDateKey,
  getTodayDateKey,
  getUpcomingCalendarEvents,
  parseLocalDate,
  toDateKey,
} from '../../utils/calendarHelpers';
import { VectorGlyphIcon } from '../icons/CustomIcons';

const WEEKDAYS = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

const MONTH_NAMES = [
  'Janeiro',
  'Fevereiro',
  'Março',
  'Abril',
  'Maio',
  'Junho',
  'Julho',
  'Agosto',
  'Setembro',
  'Outubro',
  'Novembro',
  'Dezembro',
];

export const CalendarView: React.FC = () => {
  const {
    calendarEvents,
    addCalendarEvent,
    updateCalendarEvent,
    removeCalendarEvent,
    config,
    isSpectator,
  } = useApp();
  const prefersReducedMotion = useReducedMotion();

  const todayKey = getTodayDateKey();
  const todayObj = useMemo(() => new Date(), []);

  const [viewYear, setViewYear] = useState(todayObj.getFullYear());
  const [viewMonth, setViewMonth] = useState(todayObj.getMonth()); // 0-11
  const [selectedDateKey, setSelectedDateKey] = useState<string>(todayKey);

  // Modal state for create / edit
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formTitle, setFormTitle] = useState('');
  const [formDate, setFormDate] = useState(todayKey);
  const [formTime, setFormTime] = useState('');
  const [formCategory, setFormCategory] = useState<CalendarEventCategory>('encontro');
  const [formColor, setFormColor] = useState<CalendarEventColor>('pink');
  const [formLocation, setFormLocation] = useState('');
  const [formNotes, setFormNotes] = useState('');
  const [formAnnual, setFormAnnual] = useState(false);
  const [formAuthor, setFormAuthor] = useState<'Samella' | 'Gabriel'>('Samella');

  const daysInMonth = useMemo(
    () => new Date(viewYear, viewMonth + 1, 0).getDate(),
    [viewYear, viewMonth]
  );
  const firstDayOffset = useMemo(
    () => new Date(viewYear, viewMonth, 1).getDay(),
    [viewYear, viewMonth]
  );

  const selectedDayEvents = useMemo(
    () => getEventsForDateKey(calendarEvents, selectedDateKey),
    [calendarEvents, selectedDateKey]
  );

  const upcomingEvents = useMemo(
    () => getUpcomingCalendarEvents(calendarEvents),
    [calendarEvents]
  );

  const goPrevMonth = () => {
    if (viewMonth === 0) {
      setViewYear((y) => y - 1);
      setViewMonth(11);
    } else {
      setViewMonth((m) => m - 1);
    }
  };

  const goNextMonth = () => {
    if (viewMonth === 11) {
      setViewYear((y) => y + 1);
      setViewMonth(0);
    } else {
      setViewMonth((m) => m + 1);
    }
  };

  const goToday = () => {
    const now = new Date();
    setViewYear(now.getFullYear());
    setViewMonth(now.getMonth());
    setSelectedDateKey(toDateKey(now.getFullYear(), now.getMonth(), now.getDate()));
  };

  const openCreateModal = (presetDateKey?: string) => {
    setEditingId(null);
    setFormTitle('');
    setFormDate(presetDateKey || selectedDateKey || todayKey);
    setFormTime('');
    setFormCategory('encontro');
    setFormColor('pink');
    setFormLocation('');
    setFormNotes('');
    setFormAnnual(false);
    setFormAuthor('Samella');
    setIsModalOpen(true);
  };

  const openEditModal = (ev: CalendarEvent) => {
    setEditingId(ev.id);
    setFormTitle(ev.title);
    setFormDate(ev.date);
    setFormTime(ev.time || '');
    setFormCategory(ev.category);
    setFormColor(ev.color);
    setFormLocation(ev.location || '');
    setFormNotes(ev.notes || '');
    setFormAnnual(Boolean(ev.isAnnualRecurring));
    setFormAuthor(ev.createdBy || 'Samella');
    setIsModalOpen(true);
  };

  const handleSaveEvent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle.trim() || !formDate) return;

    const payload = {
      title: formTitle.trim(),
      date: formDate,
      time: formTime.trim() || undefined,
      category: formCategory,
      color: formColor,
      location: formLocation.trim() || undefined,
      notes: formNotes.trim() || undefined,
      isAnnualRecurring: formAnnual,
      createdBy: formAuthor,
    };

    if (editingId) {
      updateCalendarEvent(editingId, payload);
    } else {
      addCalendarEvent(payload);
    }

    const parsed = parseLocalDate(formDate);
    if (parsed) {
      setViewYear(parsed.getFullYear());
      setViewMonth(parsed.getMonth());
      setSelectedDateKey(formDate);
    }
    setIsModalOpen(false);
  };

  const jumpToDateKey = (dateKey: string) => {
    const dt = parseLocalDate(dateKey);
    if (!dt) return;
    setViewYear(dt.getFullYear());
    setViewMonth(dt.getMonth());
    setSelectedDateKey(dateKey);
  };

  return (
    <motion.div
      initial={prefersReducedMotion ? false : { opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.22 }}
      className="space-y-5 pb-32 sm:pb-24 max-w-2xl mx-auto"
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
        <div>
          <p className="text-xs text-pink-300/90 font-medium inline-flex items-center gap-1.5">
            <CalendarDays className="w-3.5 h-3.5" />
            <span>
              Agenda Compartilhada · {config.partnerName} & {config.myName}
            </span>
          </p>
          <h2 className="text-2xl md:text-3xl font-bold text-white font-display mt-0.5">
            Calendário do Casal ♡
          </h2>
          <p className="text-xs text-purple-200/75 mt-0.5">
            Marque encontros, datas especiais, lembretes ou qualquer momento nosso.
          </p>
        </div>

        {!isSpectator ? (
          <button
            type="button"
            onClick={() => openCreateModal(selectedDateKey)}
            className="min-h-[44px] px-4 rounded-2xl bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer shadow-lg whitespace-nowrap shrink-0 active:scale-[0.98] transition"
          >
            <Plus className="w-4 h-4" />
            <span>Marcar Evento</span>
          </button>
        ) : (
          <div className="min-h-[40px] px-3 rounded-2xl bg-purple-950/70 border border-purple-500/30 text-[11px] font-semibold text-purple-200 flex items-center gap-1.5 shrink-0">
            <Lock className="w-3.5 h-3.5 text-pink-300" />
            <span>Somente leitura</span>
          </div>
        )}
      </div>

      {/* Monthly Calendar Card */}
      <section className="rounded-3xl p-4 sm:p-5 bg-gradient-to-br from-[#17082f]/95 to-[#0c021a]/95 border border-purple-500/25 shadow-xl space-y-4">
        {/* Month Navigation */}
        <div className="flex items-center justify-between gap-2">
          <button
            type="button"
            onClick={goPrevMonth}
            aria-label="Mês anterior"
            className="min-w-[44px] min-h-[44px] rounded-2xl bg-purple-950/70 hover:bg-purple-900/80 border border-purple-500/25 text-purple-200 hover:text-white flex items-center justify-center cursor-pointer"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-2.5">
            <h3 className="text-base sm:text-lg font-bold text-white tabular-nums">
              {MONTH_NAMES[viewMonth]} {viewYear}
            </h3>
            <button
              type="button"
              onClick={goToday}
              className="min-h-[32px] px-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-purple-400/25 text-[11px] font-semibold text-pink-200 cursor-pointer whitespace-nowrap"
            >
              Hoje
            </button>
          </div>

          <button
            type="button"
            onClick={goNextMonth}
            aria-label="Próximo mês"
            className="min-w-[44px] min-h-[44px] rounded-2xl bg-purple-950/70 hover:bg-purple-900/80 border border-purple-500/25 text-purple-200 hover:text-white flex items-center justify-center cursor-pointer"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>

        {/* Weekday Headers */}
        <div className="grid grid-cols-7 gap-1 text-center">
          {WEEKDAYS.map((wd) => (
            <div key={wd} className="text-[11px] font-semibold text-purple-300/70 py-1">
              {wd}
            </div>
          ))}
        </div>

        {/* Days Grid */}
        <div className="grid grid-cols-7 gap-1.5">
          {Array.from({ length: firstDayOffset }).map((_, i) => (
            <div key={`empty-${i}`} className="min-h-[46px]" />
          ))}

          {Array.from({ length: daysInMonth }).map((_, idx) => {
            const dayNum = idx + 1;
            const cellKey = toDateKey(viewYear, viewMonth, dayNum);
            const dayEvents = getEventsForDateKey(calendarEvents, cellKey);
            const isToday = cellKey === todayKey;
            const isSelected = cellKey === selectedDateKey;

            return (
              <button
                key={cellKey}
                type="button"
                onClick={() => setSelectedDateKey(cellKey)}
                className={`min-h-[46px] sm:min-h-[52px] rounded-2xl flex flex-col items-center justify-center gap-1 p-1 border transition cursor-pointer relative ${
                  isSelected
                    ? 'bg-gradient-to-b from-purple-600/55 to-pink-600/45 border-pink-400 text-white shadow-[0_0_14px_rgba(236,72,153,0.35)]'
                    : isToday
                      ? 'bg-purple-900/45 border-pink-400/50 text-pink-200'
                      : dayEvents.length > 0
                        ? 'bg-purple-950/60 border-purple-400/25 text-white hover:border-pink-400/40'
                        : 'bg-[#100422]/60 border-purple-500/15 text-purple-200/80 hover:bg-purple-950/60'
                }`}
              >
                <span className="text-xs sm:text-sm font-semibold tabular-nums leading-none">
                  {dayNum}
                </span>

                <div className="flex items-center justify-center gap-0.5 h-1.5">
                  {dayEvents.slice(0, 3).map((ev) => {
                    const cStyle = getCalendarColorStyle(ev.color);
                    return (
                      <span
                        key={ev.id}
                        className={`w-1.5 h-1.5 rounded-full ${cStyle.dot}`}
                      />
                    );
                  })}
                </div>
              </button>
            );
          })}
        </div>
      </section>

      {/* Selected Day Agenda */}
      <section className="rounded-3xl p-4 sm:p-5 bg-[#120524]/90 border border-purple-500/25 space-y-3.5">
        <div className="flex items-center justify-between gap-2">
          <div>
            <span className="text-[11px] text-purple-300/75 block">Dia selecionado</span>
            <h3 className="text-base font-bold text-white tabular-nums">
              {formatDateBR(selectedDateKey)}
            </h3>
          </div>

          {!isSpectator && (
            <button
              type="button"
              onClick={() => openCreateModal(selectedDateKey)}
              className="min-h-[44px] px-3.5 rounded-2xl bg-purple-900/60 hover:bg-purple-800/70 border border-pink-400/35 text-xs font-semibold text-pink-200 flex items-center gap-1.5 cursor-pointer whitespace-nowrap shrink-0"
            >
              <Plus className="w-4 h-4" />
              <span>Marcar neste dia</span>
            </button>
          )}
        </div>

        {selectedDayEvents.length === 0 ? (
          <div className="p-4 rounded-2xl bg-purple-950/40 border border-purple-500/20 text-center space-y-1">
            <p className="text-xs text-purple-200/80">
              Nenhum compromisso marcado neste dia ainda.
            </p>
            <p className="text-[11px] text-purple-300/60">
              Toque em "Marcar neste dia" para salvar um encontro, lembrança ou aviso!
            </p>
          </div>
        ) : (
          <div className="space-y-2.5">
            {selectedDayEvents.map((ev) => {
              const colorStyle = getCalendarColorStyle(ev.color);
              const catMeta = getCalendarCategoryMeta(ev.category);
              return (
                <div
                  key={ev.id}
                  className={`rounded-2xl p-3.5 border ${colorStyle.bg} ${colorStyle.border} space-y-2`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-start gap-2.5 min-w-0 flex-1">
                      <span
                        className={`w-3 h-3 rounded-full mt-1.5 shrink-0 ${colorStyle.dot}`}
                      />
                      <div className="min-w-0 flex-1 space-y-1">
                        <h4 className="text-sm font-bold text-white leading-snug flex items-center gap-1.5">
                          <VectorGlyphIcon name={catMeta.emoji} className="w-4 h-4 text-pink-300 shrink-0" />
                          <span>{ev.title}</span>
                        </h4>

                        <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-[11px] text-purple-100/80">
                          <span>{catMeta.label}</span>
                          {ev.time && (
                            <>
                              <span aria-hidden="true">·</span>
                              <span className="inline-flex items-center gap-1 tabular-nums">
                                <Clock className="w-3 h-3" />
                                {ev.time}
                              </span>
                            </>
                          )}
                          {ev.location && (
                            <>
                              <span aria-hidden="true">·</span>
                              <span className="inline-flex items-center gap-1">
                                <MapPin className="w-3 h-3" />
                                {ev.location}
                              </span>
                            </>
                          )}
                          {ev.isAnnualRecurring && (
                            <>
                              <span aria-hidden="true">·</span>
                              <span className="inline-flex items-center gap-1 text-pink-200">
                                <Repeat className="w-3 h-3" />
                                Todo ano
                              </span>
                            </>
                          )}
                          {ev.createdBy && (
                            <>
                              <span aria-hidden="true">·</span>
                              <span>por {ev.createdBy}</span>
                            </>
                          )}
                        </div>

                        {ev.notes && (
                          <p className="text-xs text-purple-100/85 leading-relaxed pt-0.5">
                            {ev.notes}
                          </p>
                        )}
                      </div>
                    </div>

                    {!isSpectator && (
                      <div className="flex items-center shrink-0">
                        <button
                          type="button"
                          onClick={() => openEditModal(ev)}
                          aria-label="Editar evento"
                          className="min-w-[44px] min-h-[44px] rounded-xl text-purple-200/70 hover:text-white hover:bg-white/10 flex items-center justify-center cursor-pointer"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => removeCalendarEvent(ev.id)}
                          aria-label="Excluir evento"
                          className="min-w-[44px] min-h-[44px] rounded-xl text-purple-200/60 hover:text-rose-300 hover:bg-rose-500/15 flex items-center justify-center cursor-pointer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* Upcoming Events Timeline */}
      <section className="rounded-3xl p-4 sm:p-5 bg-[#120524]/85 border border-purple-500/20 space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-white">
            Próximos Momentos & Contagem Regressiva
          </h3>
          <span className="text-xs text-purple-300/75 tabular-nums">
            {upcomingEvents.length} {upcomingEvents.length === 1 ? 'evento' : 'eventos'}
          </span>
        </div>

        {upcomingEvents.length === 0 ? (
          <p className="text-xs text-purple-200/70">
            Nenhum evento futuro cadastrado ainda. Que tal marcar o próximo encontro?
          </p>
        ) : (
          <div className="space-y-2">
            {upcomingEvents.map(({ event, occurrenceDateKey, daysUntil }) => {
              const colorStyle = getCalendarColorStyle(event.color);
              const catMeta = getCalendarCategoryMeta(event.category);

              return (
                <button
                  key={`${event.id}-${occurrenceDateKey}`}
                  type="button"
                  onClick={() => jumpToDateKey(occurrenceDateKey)}
                  className="w-full text-left rounded-2xl p-3 bg-purple-950/45 hover:bg-purple-900/50 border border-purple-500/20 hover:border-pink-400/40 flex items-center justify-between gap-3 cursor-pointer transition min-h-[56px]"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <span className={`w-2.5 h-2.5 rounded-full shrink-0 ${colorStyle.dot}`} />
                    <div className="min-w-0">
                      <p className="text-xs sm:text-sm font-semibold text-white truncate flex items-center gap-1.5">
                        <VectorGlyphIcon name={catMeta.emoji} className="w-3.5 h-3.5 text-pink-300 shrink-0" />
                        <span className="truncate">{event.title}</span>
                      </p>
                      <p className="text-[11px] text-purple-200/75 truncate tabular-nums">
                        {formatDateBR(occurrenceDateKey)}
                        {event.time ? ` · ${event.time}` : ''}
                        {event.location ? ` · ${event.location}` : ''}
                      </p>
                    </div>
                  </div>

                  <span
                    className={`text-xs font-bold tabular-nums whitespace-nowrap shrink-0 ${
                      daysUntil === 0 ? 'text-pink-300' : 'text-purple-200'
                    }`}
                  >
                    {formatCountdownDays(daysUntil)}
                  </span>
                </button>
              );
            })}
          </div>
        )}
      </section>

      {/* Create / Edit Event Modal */}
      {isModalOpen &&
        createPortal(
          <div
            className="fixed inset-0 z-[95] flex items-end sm:items-center justify-center sm:p-4 bg-black/80 backdrop-blur-md"
            onClick={() => setIsModalOpen(false)}
          >
            <form
              onSubmit={handleSaveEvent}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-md max-h-[90vh] overflow-y-auto rounded-t-3xl sm:rounded-3xl p-5 sm:p-6 bg-gradient-to-br from-[#1b0933] via-[#110424] to-[#080214] border border-pink-400/35 shadow-2xl space-y-4"
            >
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold text-white font-display">
                  {editingId ? 'Editar Evento' : 'Marcar no Calendário ♡'}
                </h3>
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  aria-label="Fechar janela"
                  className="min-w-[44px] min-h-[44px] rounded-full bg-white/10 hover:bg-white/20 text-purple-200 hover:text-white flex items-center justify-center cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-1">
                <label className="text-xs text-purple-200/80 block">Nome do evento</label>
                <input
                  type="text"
                  required
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  placeholder="Ex: Jantar romântico, Cinema, Passeio..."
                  className="w-full min-h-[44px] px-4 rounded-xl bg-purple-950/75 border border-purple-500/30 text-sm text-white placeholder:text-purple-300/40 focus:outline-none focus:border-pink-400"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs text-purple-200/80 block">Data</label>
                  <input
                    type="date"
                    required
                    value={formDate}
                    onChange={(e) => setFormDate(e.target.value)}
                    className="w-full min-h-[44px] px-3 rounded-xl bg-purple-950/75 border border-purple-500/30 text-xs text-white focus:outline-none focus:border-pink-400"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs text-purple-200/80 block">Horário (opcional)</label>
                  <input
                    type="time"
                    value={formTime}
                    onChange={(e) => setFormTime(e.target.value)}
                    className="w-full min-h-[44px] px-3 rounded-xl bg-purple-950/75 border border-purple-500/30 text-xs text-white focus:outline-none focus:border-pink-400"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs text-purple-200/80 block">Tipo de momento</label>
                <div className="grid grid-cols-3 gap-1.5">
                  {CALENDAR_CATEGORIES.map((cat) => (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => setFormCategory(cat.id)}
                      className={`min-h-[42px] px-2 rounded-xl border text-xs font-medium cursor-pointer flex items-center justify-center gap-1 whitespace-nowrap ${
                        formCategory === cat.id
                          ? 'bg-pink-600/30 border-pink-400 text-white'
                          : 'bg-purple-950/60 border-purple-500/25 text-purple-200/75'
                      }`}
                    >
                      <VectorGlyphIcon name={cat.emoji} className="w-3.5 h-3.5" />
                      <span>{cat.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs text-purple-200/80 block">Cor no calendário</label>
                <div className="flex items-center justify-between gap-2">
                  {CALENDAR_COLORS.map((c) => (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => setFormColor(c.id)}
                      aria-label={c.label}
                      className={`min-w-[44px] min-h-[44px] rounded-2xl border flex items-center justify-center cursor-pointer transition ${
                        formColor === c.id
                          ? 'bg-white/15 border-white scale-105'
                          : 'bg-purple-950/60 border-purple-500/25'
                      }`}
                    >
                      <span className={`w-5 h-5 rounded-full ${c.dot}`} />
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs text-purple-200/80 block">Local (opcional)</label>
                <input
                  type="text"
                  value={formLocation}
                  onChange={(e) => setFormLocation(e.target.value)}
                  placeholder="Ex: Shopping, Praia, Nossa casa..."
                  className="w-full min-h-[44px] px-4 rounded-xl bg-purple-950/75 border border-purple-500/30 text-xs text-white placeholder:text-purple-300/40 focus:outline-none focus:border-pink-400"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs text-purple-200/80 block">Anotação (opcional)</label>
                <textarea
                  rows={2}
                  value={formNotes}
                  onChange={(e) => setFormNotes(e.target.value)}
                  placeholder="Detalhes, surpresa ou recado especial..."
                  className="w-full p-3 rounded-xl bg-purple-950/75 border border-purple-500/30 text-xs text-white placeholder:text-purple-300/40 focus:outline-none focus:border-pink-400 resize-none"
                />
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
                <label className="flex items-center gap-2.5 text-xs text-purple-100 cursor-pointer min-h-[44px]">
                  <input
                    type="checkbox"
                    checked={formAnnual}
                    onChange={(e) => setFormAnnual(e.target.checked)}
                    className="w-5 h-5 accent-pink-500 rounded cursor-pointer"
                  />
                  <span>Repetir todo ano nesta data</span>
                </label>

                <div className="flex items-center gap-1.5">
                  {(['Samella', 'Gabriel'] as const).map((person) => (
                    <button
                      key={person}
                      type="button"
                      onClick={() => setFormAuthor(person)}
                      className={`min-h-[40px] px-3 rounded-xl border text-xs font-semibold cursor-pointer ${
                        formAuthor === person
                          ? 'bg-pink-600/30 border-pink-400 text-white'
                          : 'bg-purple-950/60 border-purple-500/25 text-purple-200/75'
                      }`}
                    >
                      {person}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 min-h-[48px] rounded-2xl bg-white/5 hover:bg-white/10 text-xs font-semibold text-purple-200 cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-[2] min-h-[48px] rounded-2xl bg-gradient-to-r from-purple-600 to-pink-600 text-white text-xs font-bold shadow-lg cursor-pointer"
                >
                  {editingId ? 'Salvar Alterações' : 'Salvar no Calendário'}
                </button>
              </div>
            </form>
          </div>,
          document.body
        )}
    </motion.div>
  );
};
