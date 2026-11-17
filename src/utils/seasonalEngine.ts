import { CalendarEvent, SeasonalEventId, SeasonalState } from '../types';

export interface SeasonalThemeMeta {
  id: SeasonalEventId;
  label: string;
  badge: string;
  subtitle: string;
  accentHex: string;
  glowRgba: string;
  borderClass: string;
  particleMode: 'snow' | 'ember-mist' | 'petals' | 'confetti' | 'fireflies';
  memoryNote: string;
}

export const SEASONAL_THEMES: Record<SeasonalEventId, SeasonalThemeMeta> = {
  normal: {
    id: 'normal',
    label: 'Céu de Veludo',
    badge: 'Atmosfera Padrão',
    subtitle: 'Noite romântica com vagalumes violeta e rosa-magenta.',
    accentHex: '#f472b6',
    glowRgba: 'rgba(244, 114, 182, 0.35)',
    borderClass: 'border-purple-500/25',
    particleMode: 'fireflies',
    memoryNote: 'Clima clássico estrelado do universo de Gabriel & Samella.',
  },
  halloween: {
    id: 'halloween',
    label: 'Noite de Halloween',
    badge: 'Evento Especial · Outubro',
    subtitle: 'Abóboras iluminadas, névoa violeta e brasas mágicas pelo universo.',
    accentHex: '#f97316',
    glowRgba: 'rgba(249, 115, 22, 0.4)',
    borderClass: 'border-orange-500/40',
    particleMode: 'ember-mist',
    memoryNote: 'Temporada mística com abóboras iluminadas interativas espalhadas pelo app.',
  },
  natal: {
    id: 'natal',
    label: 'Natal Encantado',
    badge: 'Evento Especial · Dezembro',
    subtitle: 'Neve realista caindo suavemente com o Papai Noel no contador do casal.',
    accentHex: '#fbbf24',
    glowRgba: 'rgba(251, 191, 36, 0.4)',
    borderClass: 'border-amber-400/40',
    particleMode: 'snow',
    memoryNote: 'Temporada natalina com partículas reais de neve e Papai Noel em cima do contador.',
  },
  namorados: {
    id: 'namorados',
    label: 'Dia dos Namorados',
    badge: 'Romance em Alta',
    subtitle: 'Pétalas de rosa flutuantes e brilho rosê celebrando o amor de vocês.',
    accentHex: '#fb7185',
    glowRgba: 'rgba(251, 113, 133, 0.45)',
    borderClass: 'border-rose-400/45',
    particleMode: 'petals',
    memoryNote: 'Pétalas românticas caindo em profundidade e mimos de rosas para o casal.',
  },
  aniversario: {
    id: 'aniversario',
    label: 'Dia de Aniversário',
    badge: 'Celebração Especial',
    subtitle: 'Chuva de faíscas douradas celebrando uma data inesquecível nossa!',
    accentHex: '#eab308',
    glowRgba: 'rgba(234, 179, 8, 0.45)',
    borderClass: 'border-amber-300/45',
    particleMode: 'confetti',
    memoryNote: 'Ativa automaticamente no aniversário do namoro (12/06) ou datas comemorativas do calendário.',
  },
};

export function detectAutoSeasonalEvent(
  now: Date,
  anniversaryIso: string,
  calendarEvents: CalendarEvent[]
): SeasonalEventId {
  const month = now.getMonth() + 1; // 1..12
  const day = now.getDate(); // 1..31
  const mmdd = `${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
  const yyyymmdd = `${now.getFullYear()}-${mmdd}`;

  // 1. Exact anniversary match or annual calendar birthday/anniversary match
  if (anniversaryIso) {
    const annivDate = new Date(anniversaryIso);
    if (!Number.isNaN(annivDate.getTime())) {
      const aMonth = annivDate.getMonth() + 1;
      const aDay = annivDate.getDate();
      if (aMonth === month && aDay === day) {
        return 'aniversario';
      }
    }
  }

  const hasBirthdayToday = calendarEvents.some((ev) => {
    if (ev.category !== 'aniversario' && ev.category !== 'especial') return false;
    if (ev.date === yyyymmdd) return true;
    return Boolean(ev.isAnnualRecurring && ev.date.slice(5) === mmdd);
  });
  if (hasBirthdayToday) {
    return 'aniversario';
  }

  // 2. Natal (01/12 to 26/12)
  if (month === 12 && day >= 1 && day <= 26) {
    return 'natal';
  }

  // 3. Halloween (24/10 to 02/11)
  if ((month === 10 && day >= 24) || (month === 11 && day <= 2)) {
    return 'halloween';
  }

  // 4. Dia dos Namorados (10/06 to 14/06 & 14/02)
  if ((month === 6 && day >= 10 && day <= 14) || (month === 2 && day === 14)) {
    return 'namorados';
  }

  return 'normal';
}

export function resolveActiveSeasonalEvent(
  seasonalState: SeasonalState | undefined,
  anniversaryIso: string,
  calendarEvents: CalendarEvent[],
  now: Date = new Date()
): { activeEvent: SeasonalEventId; isPreview: boolean; meta: SeasonalThemeMeta } {
  const autoEvent = detectAutoSeasonalEvent(now, anniversaryIso, calendarEvents);
  const isPreview = seasonalState?.mode === 'preview' && Boolean(seasonalState.previewEvent);
  const activeEvent: SeasonalEventId = isPreview ? seasonalState!.previewEvent : autoEvent;

  return {
    activeEvent,
    isPreview,
    meta: SEASONAL_THEMES[activeEvent] || SEASONAL_THEMES.normal,
  };
}
