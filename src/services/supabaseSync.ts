import { supabase, isSupabaseConfigured } from './supabaseClient';
import { COUPLE_WORLD_ID, CloudWorldPayload, SaveCloudInput } from './cloudSync';
import { ChatMessage, MemoryPhoto, Song } from '../types';

export const SUPABASE_WORLD_TABLE = 'couple_worlds';
export const SUPABASE_MESSAGES_TABLE = 'couple_messages';
export const SUPABASE_PHOTOS_TABLE = 'couple_photos';
export const SUPABASE_SONGS_TABLE = 'couple_songs';

interface CoupleWorldRow {
  world_id: string;
  journey_started: boolean;
  coins: number;
  tree_level: number;
  tree_xp: number;
  tree_water_count: number;
  last_mystery_chest_at?: number;
  tree_state: Record<string, unknown>;
  pet_state: Record<string, unknown>;
  aquarium_state: Record<string, unknown>;
  dream_house_state: Record<string, unknown>;
  purchased_store_ids: string[];
  store_items_state: Record<
    string,
    { purchased: boolean; redeemed?: boolean; redeemedAt?: string; equipped?: boolean }
  >;
  full_state: Partial<CloudWorldPayload>;
  updated_at: string;
}

export interface CoupleMessageRow {
  id: string;
  world_id: string;
  sender_role: 'eu' | 'ela';
  sender_name: string;
  text: string;
  msg_type?: 'text' | 'audio' | 'image';
  media_url?: string | null;
  audio_duration?: string | null;
  has_heart: boolean;
  time_label: string;
  read_at?: string | null;
  created_at: string;
}

interface CouplePhotoRow {
  id: string;
  world_id: string;
  photo_index: number;
  title: string;
  subtitle: string;
  date_label: string;
  url: string;
  local_path?: string | null;
  aspect?: string | null;
  is_favorite?: boolean;
  in_home_loop?: boolean;
  caption?: string | null;
  added_by?: string | null;
  created_at?: string;
}

interface CoupleSongRow {
  id: string;
  world_id: string;
  title: string;
  artist: string;
  duration: number;
  duration_formatted: string;
  cover_url: string;
  audio_url?: string | null;
  source_type?: string | null;
  youtube_id?: string | null;
  lyrics?: string[] | null;
  is_favorite?: boolean;
  added_by?: string | null;
  created_at?: string;
}

function rowToCloudPayload(row: CoupleWorldRow): CloudWorldPayload {
  const full = (row.full_state || {}) as Partial<CloudWorldPayload>;

  const mergedStoreState: CloudWorldPayload['storeItemsState'] = {
    ...(full.storeItemsState || {}),
    ...(row.store_items_state || {}),
  };

  if (Array.isArray(row.purchased_store_ids)) {
    row.purchased_store_ids.forEach((id) => {
      if (!mergedStoreState[id]) {
        mergedStoreState[id] = { purchased: true };
      } else {
        mergedStoreState[id] = { ...mergedStoreState[id], purchased: true };
      }
    });
  }

  return {
    worldId: row.world_id || COUPLE_WORLD_ID,
    journeyStarted: Boolean(row.journey_started),
    coins: typeof row.coins === 'number' ? row.coins : (full.coins ?? 0),
    treeWaterCount:
      typeof row.tree_water_count === 'number'
        ? row.tree_water_count
        : (full.treeWaterCount ?? 0),
    lastMysteryChestAt:
      typeof row.last_mystery_chest_at === 'number' && row.last_mystery_chest_at > 0
        ? row.last_mystery_chest_at
        : (full.lastMysteryChestAt ?? 0),
    currentDailyIndex: full.currentDailyIndex ?? 0,
    config: full.config!,
    treeState: (row.tree_state && Object.keys(row.tree_state).length > 0
      ? row.tree_state
      : full.treeState) as CloudWorldPayload['treeState'],
    kitten: (row.pet_state && Object.keys(row.pet_state).length > 0
      ? row.pet_state
      : full.kitten) as CloudWorldPayload['kitten'],
    lettersState: full.lettersState || {
      readIds: [],
      favoriteIds: [],
      unsealedMap: {},
      customLetters: [],
    },
    achievementsState: full.achievementsState || {},
    storeItemsState: mergedStoreState,
    easterEggsState: full.easterEggsState || {},
    phrasesState: full.phrasesState || {},
    chatMessages: full.chatMessages || [],
    gameRecords: full.gameRecords || {
      bestHearts: 0,
      bestMemoryMoves: 0,
      bestQuizScore: 0,
      ticTacToeWins: 0,
    },
    customPhotos: full.customPhotos || [],
    customSongs: full.customSongs || [],
    customQuizQuestions: full.customQuizQuestions,
    timeCapsules: full.timeCapsules,
    coupleGoals: full.coupleGoals,
    calendarEvents: full.calendarEvents,
    dailyWheelState: full.dailyWheelState,
    dreamHouseState: (row.dream_house_state && Object.keys(row.dream_house_state).length > 0
      ? row.dream_house_state
      : full.dreamHouseState) as CloudWorldPayload['dreamHouseState'],
    aquariumState: (row.aquarium_state && Object.keys(row.aquarium_state).length > 0
      ? row.aquarium_state
      : full.aquariumState) as CloudWorldPayload['aquariumState'],
    seasonalState: full.seasonalState,
    missionsState: full.missionsState,
    legacyResetBackup: full.legacyResetBackup,
  };
}

function buildCompactFullState(input: SaveCloudInput): Partial<CloudWorldPayload> {
  const lettersState = {
    readIds: input.letters.filter((l) => l.read).map((l) => l.id),
    favoriteIds: input.letters.filter((l) => l.isFavorite).map((l) => l.id),
    unsealedMap: input.letters.reduce<Record<string, string>>((acc, l) => {
      if (l.unsealedAt) acc[l.id] = l.unsealedAt;
      return acc;
    }, {}),
    customLetters: input.letters.slice(0, 120),
  };

  const achievementsState: CloudWorldPayload['achievementsState'] = {};
  input.achievements.forEach((a) => {
    if (a.unlocked || a.rewardClaimed || a.progress > 0) {
      achievementsState[a.id] = {
        unlocked: a.unlocked,
        progress: a.progress,
        ...(a.unlockedAt ? { unlockedAt: a.unlockedAt } : {}),
        ...(a.unlocked || a.rewardClaimed ? { rewardClaimed: true } : {}),
      };
    }
  });

  const easterEggsState: CloudWorldPayload['easterEggsState'] = {};
  input.easterEggs.forEach((e) => {
    if (e.discovered || e.rewardClaimed) {
      easterEggsState[e.id] = {
        discovered: true,
        rewardClaimed: true,
        ...(e.discoveredAt ? { discoveredAt: e.discoveredAt } : {}),
      };
    }
  });

  const phrasesState: Record<string, boolean> = {};
  input.phrases.forEach((p) => {
    if (p.isFavorite) phrasesState[p.id] = true;
  });

  const customPhotos = input.photos
    .filter((p) => !input.initialPhotoIds.has(p.id) && !p.url.startsWith('idb://') && p.url.length < 180000)
    .slice(0, 80);

  const customSongs = input.songs
    .filter(
      (s) =>
        !input.initialSongIds.has(s.id) &&
        !s.audioUrl?.startsWith('idb://') &&
        (!s.audioUrl?.startsWith('data:') || s.audioUrl.length < 120000)
    )
    .slice(0, 60);

  return {
    worldId: COUPLE_WORLD_ID,
    journeyStarted: Boolean(input.journeyStarted),
    coins: input.coins,
    treeWaterCount: input.treeWaterCount,
    lastMysteryChestAt: input.lastMysteryChestAt ?? 0,
    currentDailyIndex: input.currentDailyIndex,
    config: input.config,
    lettersState,
    achievementsState,
    easterEggsState,
    phrasesState,
    gameRecords: input.gameRecords,
    customPhotos,
    customSongs,
    customQuizQuestions: input.customQuizQuestions.slice(0, 80),
    timeCapsules: input.timeCapsules.slice(0, 30),
    coupleGoals: input.coupleGoals.slice(0, 90),
    calendarEvents: input.calendarEvents.slice(0, 140),
    dailyWheelState: input.dailyWheelState,
    seasonalState: input.seasonalState,
    missionsState: input.missionsState,
    ...(input.legacyResetBackup ? { legacyResetBackup: input.legacyResetBackup } : {}),
  };
}

let lastSavedWorldSignature = '';

export function buildWorldSignature(input: SaveCloudInput): string {
  return JSON.stringify({
    journeyStarted: input.journeyStarted,
    coins: input.coins,
    treeWaterCount: input.treeWaterCount,
    lastMysteryChestAt: input.lastMysteryChestAt ?? 0,
    currentDailyIndex: input.currentDailyIndex,
    config: input.config,
    treeState: input.treeState,
    kitten: input.kitten,
    aquariumState: input.aquariumState,
    dreamHouseState: input.dreamHouseState,
    store: input.storeItems.map((s) => `${s.id}:${s.purchased ? 1 : 0}:${s.redeemed ? 1 : 0}:${s.equipped ? 1 : 0}`),
    achievements: input.achievements.filter((a) => a.unlocked || a.progress > 0).map((a) => `${a.id}:${a.progress}:${a.unlocked ? 1 : 0}`),
    easterEggs: input.easterEggs.filter((e) => e.discovered).map((e) => e.id),
    letters: input.letters.map((l) => `${l.id}:${l.read ? 1 : 0}:${l.isFavorite ? 1 : 0}`),
    goals: input.coupleGoals.map((g) => `${g.id}:${g.completed ? 1 : 0}:${g.title}`),
    calendar: input.calendarEvents.map((c) => `${c.id}:${c.date}:${c.title}`),
    wheel: input.dailyWheelState.lastSpinAt,
    seasonal: input.seasonalState,
    missions: input.missionsState,
    photosCount: input.photos.length,
    songsCount: input.songs.length,
    quizCount: input.customQuizQuestions.length,
    capsulesCount: input.timeCapsules.length,
    gameRecords: input.gameRecords,
  });
}

export async function loadSupabaseWorld(): Promise<CloudWorldPayload | null> {
  if (!supabase || !isSupabaseConfigured) return null;

  const { data, error } = await supabase
    .from(SUPABASE_WORLD_TABLE)
    .select('*')
    .eq('world_id', COUPLE_WORLD_ID)
    .maybeSingle();

  if (error) {
    console.warn('Supabase loadSupabaseWorld aviso:', error.message);
    return null;
  }

  if (!data) return null;
  return rowToCloudPayload(data as CoupleWorldRow);
}

export async function saveSupabaseWorld(input: SaveCloudInput): Promise<boolean> {
  if (!supabase || !isSupabaseConfigured) return false;

  const sig = buildWorldSignature(input);
  lastSavedWorldSignature = sig;

  const storeItemsState: CoupleWorldRow['store_items_state'] = {};
  const purchasedStoreIds: string[] = [];
  input.storeItems.forEach((item) => {
    if (item.purchased) purchasedStoreIds.push(item.id);
    if (item.purchased || item.redeemed || item.equipped) {
      storeItemsState[item.id] = {
        purchased: item.purchased,
        ...(item.redeemed !== undefined ? { redeemed: item.redeemed } : {}),
        ...(item.redeemedAt ? { redeemedAt: item.redeemedAt } : {}),
        ...(item.equipped !== undefined ? { equipped: item.equipped } : {}),
      };
    }
  });

  const payload = {
    world_id: COUPLE_WORLD_ID,
    journey_started: Boolean(input.journeyStarted),
    coins: Math.max(0, Math.min(500000, Math.round(Number.isFinite(input.coins) ? input.coins : 0))),
    tree_level: Math.max(1, Math.min(10, input.treeState.level || 1)),
    tree_xp: Math.max(0, Math.round(input.treeState.xp || 0)),
    tree_water_count: Math.max(0, Math.round(input.treeWaterCount || 0)),
    last_mystery_chest_at: Math.max(0, Math.round(input.lastMysteryChestAt || 0)),
    tree_state: input.treeState,
    pet_state: input.kitten,
    aquarium_state: input.aquariumState,
    dream_house_state: input.dreamHouseState,
    purchased_store_ids: purchasedStoreIds,
    store_items_state: storeItemsState,
    full_state: buildCompactFullState(input),
    updated_at: new Date().toISOString(),
  };

  const { error } = await supabase
    .from(SUPABASE_WORLD_TABLE)
    .upsert(payload, { onConflict: 'world_id' });

  if (error) {
    console.warn('Supabase saveSupabaseWorld aviso:', error.message);
    return false;
  }

  return true;
}

export function subscribeSupabaseWorld(
  onRemoteUpdate: (payload: CloudWorldPayload) => void
): () => void {
  if (!supabase || !isSupabaseConfigured) return () => {};

  const channel = supabase
    .channel(`world-sync-${COUPLE_WORLD_ID}`)
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: SUPABASE_WORLD_TABLE,
        filter: `world_id=eq.${COUPLE_WORLD_ID}`,
      },
      (payload) => {
        const nextRow = payload.new as CoupleWorldRow | undefined;
        if (!nextRow) return;
        const mapped = rowToCloudPayload(nextRow);
        onRemoteUpdate(mapped);
      }
    )
    .subscribe();

  return () => {
    supabase?.removeChannel(channel);
  };
}

export async function clearSupabaseWorld(): Promise<void> {
  if (!supabase || !isSupabaseConfigured) return;

  await supabase.from(SUPABASE_MESSAGES_TABLE).delete().eq('world_id', COUPLE_WORLD_ID);

  await supabase
    .from(SUPABASE_WORLD_TABLE)
    .upsert(
      {
        world_id: COUPLE_WORLD_ID,
        journey_started: false,
        coins: 0,
        tree_level: 1,
        tree_xp: 0,
        tree_water_count: 0,
        last_mystery_chest_at: 0,
        tree_state: {},
        pet_state: {},
        aquarium_state: {},
        dream_house_state: {},
        purchased_store_ids: [],
        store_items_state: {},
        full_state: {},
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'world_id' }
    );
}

// --- CHAT DO CASAL (WHATSAPP REALTIME + PRESENCE + ÁUDIO + FOTO + VISTO) ---
function rowToChatMessage(row: CoupleMessageRow): ChatMessage {
  const msgType = row.msg_type || 'text';
  return {
    id: row.id,
    sender: row.sender_role === 'ela' ? 'partner' : 'me',
    senderName: row.sender_name,
    text: row.text || '',
    msgType,
    mediaUrl: row.media_url || undefined,
    attachmentImg: msgType === 'image' ? row.media_url || undefined : undefined,
    isAudio: msgType === 'audio',
    audioDuration: row.audio_duration || undefined,
    time: row.time_label,
    createdAt: row.created_at,
    readAt: row.read_at || null,
    status: row.read_at ? 'read' : 'delivered',
    hasHeart: row.has_heart,
  };
}

export async function loadSupabaseMessages(): Promise<ChatMessage[]> {
  if (!supabase || !isSupabaseConfigured) return [];

  const { data, error } = await supabase
    .from(SUPABASE_MESSAGES_TABLE)
    .select('*')
    .eq('world_id', COUPLE_WORLD_ID)
    .order('created_at', { ascending: true })
    .limit(250);

  if (error) {
    console.warn('Supabase loadSupabaseMessages aviso:', error.message);
    return [];
  }

  return ((data || []) as CoupleMessageRow[]).map(rowToChatMessage);
}

export async function sendSupabaseMessage(params: {
  id: string;
  senderRole: 'eu' | 'ela';
  senderName: string;
  text: string;
  msgType?: 'text' | 'audio' | 'image';
  mediaUrl?: string;
  audioDuration?: string;
  timeLabel: string;
}): Promise<ChatMessage | null> {
  if (!supabase || !isSupabaseConfigured) return null;

  const row = {
    id: params.id,
    world_id: COUPLE_WORLD_ID,
    sender_role: params.senderRole,
    sender_name: params.senderName,
    text: params.text,
    msg_type: params.msgType || 'text',
    media_url: params.mediaUrl || null,
    audio_duration: params.audioDuration || null,
    has_heart: true,
    time_label: params.timeLabel,
    read_at: null,
    created_at: new Date().toISOString(),
  };

  const { data, error } = await supabase
    .from(SUPABASE_MESSAGES_TABLE)
    .insert(row)
    .select()
    .single();

  if (error) {
    console.warn('Supabase sendSupabaseMessage erro:', error.message);
    return null;
  }

  return rowToChatMessage(data as CoupleMessageRow);
}

export async function markSupabaseMessagesRead(incomingSenderRole: 'eu' | 'ela'): Promise<void> {
  if (!supabase || !isSupabaseConfigured) return;

  const { error } = await supabase
    .from(SUPABASE_MESSAGES_TABLE)
    .update({ read_at: new Date().toISOString() })
    .eq('world_id', COUPLE_WORLD_ID)
    .eq('sender_role', incomingSenderRole)
    .is('read_at', null);

  if (error) {
    console.warn('Supabase markSupabaseMessagesRead aviso:', error.message);
  }
}

export function subscribeSupabaseMessages(
  onInsertMessage: (msg: ChatMessage) => void,
  onUpdateMessage?: (msg: ChatMessage) => void
): () => void {
  if (!supabase || !isSupabaseConfigured) return () => {};

  const channel = supabase
    .channel(`chat-realtime-${COUPLE_WORLD_ID}`)
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: SUPABASE_MESSAGES_TABLE,
        filter: `world_id=eq.${COUPLE_WORLD_ID}`,
      },
      (payload) => {
        const row = payload.new as CoupleMessageRow | undefined;
        if (!row || !row.id) return;
        onInsertMessage(rowToChatMessage(row));
      }
    )
    .on(
      'postgres_changes',
      {
        event: 'UPDATE',
        schema: 'public',
        table: SUPABASE_MESSAGES_TABLE,
        filter: `world_id=eq.${COUPLE_WORLD_ID}`,
      },
      (payload) => {
        const row = payload.new as CoupleMessageRow | undefined;
        if (!row || !row.id) return;
        onUpdateMessage?.(rowToChatMessage(row));
      }
    )
    .subscribe();

  return () => {
    supabase?.removeChannel(channel);
  };
}

export interface OnlinePeerPresence {
  role: 'Gabriel' | 'Samella';
  onlineAt: string;
}

export function subscribeChatPresence(
  myRole: 'Gabriel' | 'Samella',
  onPeersChange: (peers: Record<'Gabriel' | 'Samella', boolean>) => void
): () => void {
  if (!supabase || !isSupabaseConfigured) return () => {};

  const presenceChannel = supabase.channel(`presence-${COUPLE_WORLD_ID}`, {
    config: {
      presence: {
        key: `${myRole}-${Math.random().toString(36).slice(2, 6)}`,
      },
    },
  });

  const syncPeers = () => {
    const state = presenceChannel.presenceState<OnlinePeerPresence>();
    let gabrielOnline = false;
    let samellaOnline = false;
    Object.values(state).forEach((entries) => {
      entries.forEach((entry) => {
        if (entry.role === 'Gabriel') gabrielOnline = true;
        if (entry.role === 'Samella') samellaOnline = true;
      });
    });
    onPeersChange({ Gabriel: gabrielOnline, Samella: samellaOnline });
  };

  presenceChannel
    .on('presence', { event: 'sync' }, syncPeers)
    .on('presence', { event: 'join' }, syncPeers)
    .on('presence', { event: 'leave' }, syncPeers)
    .subscribe(async (status) => {
      if (status === 'SUBSCRIBED') {
        await presenceChannel.track({
          role: myRole,
          onlineAt: new Date().toISOString(),
        });
      }
    });

  return () => {
    supabase?.removeChannel(presenceChannel);
  };
}

// --- FOTOS COMPARTILHADAS NO SUPABASE ---
function rowToMemoryPhoto(row: CouplePhotoRow): MemoryPhoto {
  return {
    id: row.id,
    index: row.photo_index,
    title: row.title,
    subtitle: row.subtitle || '',
    date: row.date_label || '',
    url: row.url,
    localPath: row.local_path || undefined,
    sourceType: row.url.startsWith('data:') ? 'upload' : 'url',
    aspect: (row.aspect as MemoryPhoto['aspect']) || 'portrait',
    isFavorite: Boolean(row.is_favorite),
    inHomeLoop: Boolean(row.in_home_loop),
    caption: row.caption || undefined,
  };
}

export async function loadSupabasePhotos(): Promise<MemoryPhoto[]> {
  if (!supabase || !isSupabaseConfigured) return [];
  const { data, error } = await supabase
    .from(SUPABASE_PHOTOS_TABLE)
    .select('*')
    .eq('world_id', COUPLE_WORLD_ID)
    .order('photo_index', { ascending: true })
    .limit(200);

  if (error) {
    console.warn('Supabase loadSupabasePhotos aviso:', error.message);
    return [];
  }
  return ((data || []) as CouplePhotoRow[]).map(rowToMemoryPhoto);
}

export async function upsertSupabasePhoto(photo: MemoryPhoto, addedBy = 'Casal'): Promise<boolean> {
  if (!supabase || !isSupabaseConfigured || !photo.url || photo.url.startsWith('idb://')) {
    return false;
  }

  const row = {
    id: photo.id,
    world_id: COUPLE_WORLD_ID,
    photo_index: photo.index,
    title: photo.title || 'Memória ♡',
    subtitle: photo.subtitle || '',
    date_label: photo.date || '',
    url: photo.url,
    local_path: photo.localPath || null,
    aspect: photo.aspect || 'portrait',
    is_favorite: Boolean(photo.isFavorite),
    in_home_loop: Boolean(photo.inHomeLoop),
    caption: photo.caption || null,
    added_by: addedBy,
  };

  const { error } = await supabase
    .from(SUPABASE_PHOTOS_TABLE)
    .upsert(row, { onConflict: 'id' });

  if (error) {
    console.warn('Supabase upsertSupabasePhoto aviso:', error.message);
    return false;
  }
  return true;
}

export async function deleteSupabasePhoto(photoId: string): Promise<boolean> {
  if (!supabase || !isSupabaseConfigured) return false;
  const { error } = await supabase.from(SUPABASE_PHOTOS_TABLE).delete().eq('id', photoId);
  if (error) {
    console.warn('Supabase deleteSupabasePhoto aviso:', error.message);
    return false;
  }
  return true;
}

export function subscribeSupabasePhotos(
  onPhotoChange: (photos: MemoryPhoto[]) => void
): () => void {
  if (!supabase || !isSupabaseConfigured) return () => {};
  const channel = supabase
    .channel(`photos-sync-${COUPLE_WORLD_ID}`)
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: SUPABASE_PHOTOS_TABLE, filter: `world_id=eq.${COUPLE_WORLD_ID}` },
      async () => {
        const latest = await loadSupabasePhotos();
        onPhotoChange(latest);
      }
    )
    .subscribe();
  return () => {
    supabase?.removeChannel(channel);
  };
}

// --- MÚSICAS COMPARTILHADAS NO SUPABASE ---
function rowToSong(row: CoupleSongRow): Song {
  return {
    id: row.id,
    title: row.title,
    artist: row.artist || 'Gabriel & Samella',
    duration: row.duration || 200,
    durationFormatted: row.duration_formatted || '3:20',
    coverUrl: row.cover_url || '',
    audioUrl: row.audio_url || undefined,
    sourceType: (row.source_type as Song['sourceType']) || 'youtube',
    youtubeId: row.youtube_id || undefined,
    lyrics: Array.isArray(row.lyrics) ? row.lyrics : undefined,
    isFavorite: Boolean(row.is_favorite),
    isLocalAvailable: true,
  };
}

export async function loadSupabaseSongs(): Promise<Song[]> {
  if (!supabase || !isSupabaseConfigured) return [];
  const { data, error } = await supabase
    .from(SUPABASE_SONGS_TABLE)
    .select('*')
    .eq('world_id', COUPLE_WORLD_ID)
    .order('created_at', { ascending: true })
    .limit(120);

  if (error) {
    console.warn('Supabase loadSupabaseSongs aviso:', error.message);
    return [];
  }
  return ((data || []) as CoupleSongRow[]).map(rowToSong);
}

export async function upsertSupabaseSong(song: Song, addedBy = 'Casal'): Promise<boolean> {
  if (!supabase || !isSupabaseConfigured) return false;

  const row = {
    id: song.id,
    world_id: COUPLE_WORLD_ID,
    title: song.title,
    artist: song.artist || 'Gabriel & Samella',
    duration: song.duration || 200,
    duration_formatted: song.durationFormatted || '3:20',
    cover_url: song.coverUrl || '',
    audio_url: song.audioUrl || null,
    source_type: song.sourceType || 'youtube',
    youtube_id: song.youtubeId || null,
    lyrics: song.lyrics || [],
    is_favorite: Boolean(song.isFavorite),
    added_by: addedBy,
  };

  const { error } = await supabase
    .from(SUPABASE_SONGS_TABLE)
    .upsert(row, { onConflict: 'id' });

  if (error) {
    console.warn('Supabase upsertSupabaseSong aviso:', error.message);
    return false;
  }
  return true;
}

export async function deleteSupabaseSong(songId: string): Promise<boolean> {
  if (!supabase || !isSupabaseConfigured) return false;
  const { error } = await supabase.from(SUPABASE_SONGS_TABLE).delete().eq('id', songId);
  if (error) {
    console.warn('Supabase deleteSupabaseSong aviso:', error.message);
    return false;
  }
  return true;
}

export function subscribeSupabaseSongs(
  onSongsChange: (songs: Song[]) => void
): () => void {
  if (!supabase || !isSupabaseConfigured) return () => {};
  const channel = supabase
    .channel(`songs-sync-${COUPLE_WORLD_ID}`)
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: SUPABASE_SONGS_TABLE, filter: `world_id=eq.${COUPLE_WORLD_ID}` },
      async () => {
        const latest = await loadSupabaseSongs();
        onSongsChange(latest);
      }
    )
    .subscribe();
  return () => {
    supabase?.removeChannel(channel);
  };
}

export function getLastSavedWorldSignature(): string {
  return lastSavedWorldSignature;
}


// --- CHAT MEDIA STORAGE + SINALIZAÇÃO DE CHAMADAS P2P ---
export async function uploadChatMedia(blob: Blob, kind: 'image' | 'audio'): Promise<string> {
  if (!supabase || !isSupabaseConfigured) {
    throw new Error('Armazenamento do chat indisponível.');
  }

  const mime = blob.type || (kind === 'image' ? 'image/jpeg' : 'audio/webm');
  const extension =
    mime.includes('png') ? 'png' :
    mime.includes('webp') ? 'webp' :
    mime.includes('mp4') ? 'm4a' :
    mime.includes('ogg') ? 'ogg' :
    mime.includes('mpeg') ? 'mp3' :
    kind === 'image' ? 'jpg' : 'webm';
  const filePath = `${COUPLE_WORLD_ID}/${kind}/${Date.now()}-${crypto.randomUUID()}.${extension}`;
  const { error } = await supabase.storage.from('chat-media').upload(filePath, blob, {
    contentType: mime,
    cacheControl: '3600',
    upsert: false,
  });
  if (error) throw error;

  return supabase.storage.from('chat-media').getPublicUrl(filePath).data.publicUrl;
}

export type CoupleCallRole = 'Gabriel' | 'Samella';
export interface CoupleCallSignal {
  type: 'offer' | 'answer' | 'ice' | 'hangup' | 'reject';
  from: CoupleCallRole;
  callKind?: 'audio' | 'video';
  sdp?: RTCSessionDescriptionInit;
  candidate?: RTCIceCandidateInit;
}

export function subscribeCoupleCalls(
  myRole: CoupleCallRole,
  onSignal: (signal: CoupleCallSignal) => void,
  onPeerChange?: (online: boolean) => void
) {
  if (!supabase || !isSupabaseConfigured) {
    return {
      ready: Promise.reject(new Error('Sinalização de chamadas indisponível.')),
      send: async (_signal: Omit<CoupleCallSignal, 'from'>) => {},
      close: () => {},
    };
  }

  const channel = supabase.channel(`couple-calls-${COUPLE_WORLD_ID}`, {
    config: {
      broadcast: { ack: true },
      presence: { key: myRole },
    },
  });

  channel
    .on('broadcast', { event: 'signal' }, ({ payload }) => {
      const signal = payload as CoupleCallSignal;
      if (signal?.from && signal.from !== myRole) onSignal(signal);
    })
    .on('presence', { event: 'sync' }, () => {
      const state = channel.presenceState<{ role?: CoupleCallRole }>();
      const peerRole: CoupleCallRole = myRole === 'Gabriel' ? 'Samella' : 'Gabriel';
      onPeerChange?.(Boolean(state[peerRole]?.length));
    });

  const ready = new Promise<void>((resolve, reject) => {
    channel.subscribe(async (status) => {
      if (status === 'SUBSCRIBED') {
        await channel.track({ role: myRole, onlineAt: new Date().toISOString() });
        resolve();
      } else if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT') {
        reject(new Error('Não foi possível conectar a sinalização da chamada.'));
      }
    });
  });

  return {
    ready,
    send: async (signal: Omit<CoupleCallSignal, 'from'>) => {
      await ready;
      await channel.send({
        type: 'broadcast',
        event: 'signal',
        payload: { ...signal, from: myRole },
      });
    },
    close: () => {
      supabase?.removeChannel(channel);
    },
  };
}

export async function uploadPetModel(file: File): Promise<string> {
  if (!supabase || !isSupabaseConfigured) throw new Error('Armazenamento do mascote indisponível.');
  if (!file.name.toLowerCase().endsWith('.glb') || file.size > 5 * 1024 * 1024) {
    throw new Error('Escolha um arquivo GLB de até 5 MB.');
  }
  const path = 'pets/cat__toon_animated.glb';
  const { error } = await supabase.storage.from('pet-assets').upload(path, file, {
    contentType: 'model/gltf-binary',
    cacheControl: '31536000',
    upsert: false,
  });
  if (error) throw error;
  return supabase.storage.from('pet-assets').getPublicUrl(path).data.publicUrl;
}
