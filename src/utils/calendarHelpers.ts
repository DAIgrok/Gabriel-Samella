import { CalendarEvent, CalendarEventCategory, CalendarEventColor } from '../types';

export const CALENDAR_CATEGORIES: { id: CalendarEventCategory; label: string; emoji: string }[] = [
  { id: 'encontro', label: 'Encontro', emoji: '💘' },
  { id: 'especial', label: 'Data Especial', emoji: '✨' },
  { id: 'lembrete', label: 'Lembrete', emoji: '🔔' },
  { id: 'viagem', label: 'Viagem', emoji: '✈️' },
  { id: 'aniversario', label: 'Aniversário', emoji: '🎂' },
  { id: 'outro', label: 'Outro', emoji: '💜' },
];

export const CALENDAR_COLORS: {
  id: CalendarEventColor;
  label: string;
  dot: string;
  bg: string;
  border: string;
  text: string;
}[] = [
  {
    id: 'pink',
    label: 'Rosa',
    dot: 'bg-pink-400',
    bg: 'bg-pink-500/15',
    border: 'border-pink-400/40',
    text: 'text-pink-200',
  },
  {
    id: 'purple',
    label: 'Roxo',
    dot: 'bg-purple-400',
    bg: 'bg-purple-500/15',
    border: 'border-purple-400/40',
    text: 'text-purple-200',
  },
  {
    id: 'amber',
    label: 'Dourado',
    dot: 'bg-amber-400',
    bg: 'bg-amber-500/15',
    border: 'border-amber-400/40',
    text: 'text-amber-200',
  },
  {
    id: 'emerald',
    label: 'Esmeralda',
    dot: 'bg-emerald-400',
    bg: 'bg-emerald-500/15',
    border: 'border-emerald-400/40',
    text: 'text-emerald-200',
  },
  {
    id: 'sky',
    label: 'Celeste',
    dot: 'bg-sky-400',
    bg: 'bg-sky-500/15',
    border: 'border-sky-400/40',
    text: 'text-sky-200',
  },
  {
    id: 'rose',
    label: 'Rubi',
    dot: 'bg-rose-400',
    bg: 'bg-rose-500/15',
    border: 'border-rose-400/40',
    text: 'text-rose-200',
  },
];

export function getCalendarColorStyle(color?: CalendarEventColor) {
  return CALENDAR_COLORS.find((c) => c.id === color) || CALENDAR_COLORS[0];
}

export function getCalendarCategoryMeta(category?: CalendarEventCategory) {
  return CALENDAR_CATEGORIES.find((c) => c.id === category) || CALENDAR_CATEGORIES[0];
}

export function toDateKey(year: number, monthIndexZeroBased: number, day: number): string {
  const m = String(monthIndexZeroBased + 1).padStart(2, '0');
  const d = String(day).padStart(2, '0');
  return `${year}-${m}-${d}`;
}

export function getTodayDateKey(): string {
  const now = new Date();
  return toDateKey(now.getFullYear(), now.getMonth(), now.getDate());
}

export function parseLocalDate(dateKey: string): Date | null {
  if (!dateKey || !/^\d{4}-\d{2}-\d{2}$/.test(dateKey)) return null;
  const [y, m, d] = dateKey.split('-').map(Number);
  if (!y || !m || !d) return null;
  return new Date(y, m - 1, d, 0, 0, 0, 0);
}

export function formatDateBR(dateKey: string): string {
  const dt = parseLocalDate(dateKey);
  if (!dt) return dateKey;
  return dt.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

export function getEventsForDateKey(events: CalendarEvent[], dateKey: string): CalendarEvent[] {
  const targetMmDd = dateKey.slice(5); // MM-DD
  return events
    .filter((ev) => {
      if (ev.date === dateKey) return true;
      if (ev.isAnnualRecurring && ev.date.slice(5) === targetMmDd) {
        return true;
      }
      return false;
    })
    .sort((a, b) => (a.time || '99:99').localeCompare(b.time || '99:99'));
}

export interface UpcomingCalendarOccurrence {
  event: CalendarEvent;
  occurrenceDateKey: string;
  daysUntil: number;
}

export function getNextOccurrenceDateKey(ev: CalendarEvent, referenceNow = new Date()): string | null {
  const parsed = parseLocalDate(ev.date);
  if (!parsed) return null;

  const today = new Date(
    referenceNow.getFullYear(),
    referenceNow.getMonth(),
    referenceNow.getDate(),
    0,
    0,
    0,
    0
  );

  if (!ev.isAnnualRecurring) {
    return ev.date;
  }

  const m = parsed.getMonth();
  const d = parsed.getDate();
  let candidate = new Date(today.getFullYear(), m, d, 0, 0, 0, 0);
  if (candidate.getTime() < today.getTime()) {
    candidate = new Date(today.getFullYear() + 1, m, d, 0, 0, 0, 0);
  }
  return toDateKey(candidate.getFullYear(), candidate.getMonth(), candidate.getDate());
}

export function getDaysUntilDateKey(dateKey: string, referenceNow = new Date()): number {
  const target = parseLocalDate(dateKey);
  if (!target) return 0;
  const today = new Date(
    referenceNow.getFullYear(),
    referenceNow.getMonth(),
    referenceNow.getDate(),
    0,
    0,
    0,
    0
  );
  return Math.round((target.getTime() - today.getTime()) / 86400000);
}

export function formatCountdownDays(daysUntil: number): string {
  if (daysUntil === 0) return 'Hoje!';
  if (daysUntil === 1) return 'Amanhã!';
  if (daysUntil < 0) {
    const abs = Math.abs(daysUntil);
    return abs === 1 ? 'Há 1 dia' : `Há ${abs} dias`;
  }
  if (daysUntil >= 30) {
    const months = Math.floor(daysUntil / 30);
    const remDays = daysUntil % 30;
    if (remDays === 0) return `Faltam ${months} ${months === 1 ? 'mês' : 'meses'}`;
    return `Faltam ${daysUntil} dias`;
  }
  return `Faltam ${daysUntil} dias`;
}

export function getUpcomingCalendarEvents(
  events: CalendarEvent[],
  referenceNow = new Date()
): UpcomingCalendarOccurrence[] {
  const list: UpcomingCalendarOccurrence[] = [];
  for (const ev of events) {
    const occKey = getNextOccurrenceDateKey(ev, referenceNow);
    if (!occKey) continue;
    const daysUntil = getDaysUntilDateKey(occKey, referenceNow);
    if (daysUntil >= 0) {
      list.push({ event: ev, occurrenceDateKey: occKey, daysUntil });
    }
  }
  return list.sort((a, b) => {
    if (a.daysUntil !== b.daysUntil) return a.daysUntil - b.daysUntil;
    return (a.event.time || '99:99').localeCompare(b.event.time || '99:99');
  });
}
