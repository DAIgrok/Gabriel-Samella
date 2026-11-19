-- ============================================================================
-- NOSSO MUNDO ♡ — GABRIEL & SAMELLA
-- Script SQL completo para rodar no SQL Editor do Supabase
-- Cria/atualiza tabelas na nuvem, ativa RLS e habilita Realtime + Presence
-- ============================================================================

-- 1. Tabela principal do estado compartilhado do casal na nuvem
CREATE TABLE IF NOT EXISTS public.couple_worlds (
  world_id TEXT PRIMARY KEY DEFAULT 'gabriel-samella-1206',
  journey_started BOOLEAN NOT NULL DEFAULT FALSE,
  coins INTEGER NOT NULL DEFAULT 0,
  tree_level INTEGER NOT NULL DEFAULT 1,
  tree_xp INTEGER NOT NULL DEFAULT 0,
  tree_water_count INTEGER NOT NULL DEFAULT 0,
  last_mystery_chest_at BIGINT NOT NULL DEFAULT 0,
  tree_state JSONB NOT NULL DEFAULT '{}'::jsonb,
  pet_state JSONB NOT NULL DEFAULT '{}'::jsonb,
  aquarium_state JSONB NOT NULL DEFAULT '{}'::jsonb,
  dream_house_state JSONB NOT NULL DEFAULT '{}'::jsonb,
  purchased_store_ids JSONB NOT NULL DEFAULT '[]'::jsonb,
  store_items_state JSONB NOT NULL DEFAULT '{}'::jsonb,
  full_state JSONB NOT NULL DEFAULT '{}'::jsonb,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Caso a tabela já exista de versões anteriores, garante as novas colunas com segurança
ALTER TABLE public.couple_worlds
  ADD COLUMN IF NOT EXISTS last_mystery_chest_at BIGINT NOT NULL DEFAULT 0;

-- 2. Tabela de mensagens instantâneas do Chat do Casal (Áudio, Fotos, Texto & Visto)
CREATE TABLE IF NOT EXISTS public.couple_messages (
  id TEXT PRIMARY KEY,
  world_id TEXT NOT NULL DEFAULT 'gabriel-samella-1206',
  sender_role TEXT NOT NULL CHECK (sender_role IN ('eu', 'ela')),
  sender_name TEXT NOT NULL,
  text TEXT NOT NULL DEFAULT '',
  msg_type TEXT NOT NULL DEFAULT 'text',
  media_url TEXT,
  audio_duration TEXT,
  has_heart BOOLEAN NOT NULL DEFAULT TRUE,
  time_label TEXT NOT NULL,
  read_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.couple_messages
  ADD COLUMN IF NOT EXISTS msg_type TEXT NOT NULL DEFAULT 'text',
  ADD COLUMN IF NOT EXISTS media_url TEXT,
  ADD COLUMN IF NOT EXISTS audio_duration TEXT,
  ADD COLUMN IF NOT EXISTS read_at TIMESTAMPTZ;

CREATE INDEX IF NOT EXISTS idx_couple_messages_world_created
  ON public.couple_messages (world_id, created_at ASC);

-- 3. Tabela de Fotos reais compartilhadas do casal (sem depender do Drive!)
CREATE TABLE IF NOT EXISTS public.couple_photos (
  id TEXT PRIMARY KEY,
  world_id TEXT NOT NULL DEFAULT 'gabriel-samella-1206',
  photo_index INTEGER NOT NULL DEFAULT 100,
  title TEXT NOT NULL,
  subtitle TEXT NOT NULL DEFAULT '',
  date_label TEXT NOT NULL DEFAULT '',
  url TEXT NOT NULL,
  local_path TEXT,
  aspect TEXT DEFAULT 'portrait',
  is_favorite BOOLEAN NOT NULL DEFAULT FALSE,
  in_home_loop BOOLEAN NOT NULL DEFAULT FALSE,
  caption TEXT,
  added_by TEXT DEFAULT 'Casal',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_couple_photos_world_index
  ON public.couple_photos (world_id, photo_index ASC);

-- 4. Tabela de Músicas reais compartilhadas do casal (YouTube & MP3/áudio)
CREATE TABLE IF NOT EXISTS public.couple_songs (
  id TEXT PRIMARY KEY,
  world_id TEXT NOT NULL DEFAULT 'gabriel-samella-1206',
  title TEXT NOT NULL,
  artist TEXT NOT NULL DEFAULT 'Gabriel & Samella',
  duration INTEGER NOT NULL DEFAULT 200,
  duration_formatted TEXT NOT NULL DEFAULT '3:20',
  cover_url TEXT NOT NULL DEFAULT '/assets/img/1.jpg',
  audio_url TEXT,
  source_type TEXT DEFAULT 'youtube',
  youtube_id TEXT,
  lyrics JSONB DEFAULT '[]'::jsonb,
  is_favorite BOOLEAN NOT NULL DEFAULT FALSE,
  added_by TEXT DEFAULT 'Casal',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_couple_songs_world_created
  ON public.couple_songs (world_id, created_at ASC);

-- 5. Ativar REPLICA IDENTITY FULL para garantir payload completo no Realtime (inclusive UPDATE de visto/read_at)
ALTER TABLE public.couple_worlds REPLICA IDENTITY FULL;
ALTER TABLE public.couple_messages REPLICA IDENTITY FULL;
ALTER TABLE public.couple_photos REPLICA IDENTITY FULL;
ALTER TABLE public.couple_songs REPLICA IDENTITY FULL;

-- 6. Habilitar Row Level Security (RLS) com políticas liberadas para o casal
ALTER TABLE public.couple_worlds ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.couple_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.couple_photos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.couple_songs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Acesso publico couple_worlds" ON public.couple_worlds;
CREATE POLICY "Acesso publico couple_worlds"
  ON public.couple_worlds FOR ALL TO anon, authenticated
  USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Acesso publico couple_messages" ON public.couple_messages;
CREATE POLICY "Acesso publico couple_messages"
  ON public.couple_messages FOR ALL TO anon, authenticated
  USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Acesso publico couple_photos" ON public.couple_photos;
CREATE POLICY "Acesso publico couple_photos"
  ON public.couple_photos FOR ALL TO anon, authenticated
  USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Acesso publico couple_songs" ON public.couple_songs;
CREATE POLICY "Acesso publico couple_songs"
  ON public.couple_songs FOR ALL TO anon, authenticated
  USING (true) WITH CHECK (true);

-- 7. Garantir permissões explícitas para roles anon e authenticated
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON TABLE public.couple_worlds TO anon, authenticated;
GRANT ALL ON TABLE public.couple_messages TO anon, authenticated;
GRANT ALL ON TABLE public.couple_photos TO anon, authenticated;
GRANT ALL ON TABLE public.couple_songs TO anon, authenticated;

-- 8. Ativar Supabase Realtime em todas as tabelas (idempotente)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime' AND schemaname = 'public' AND tablename = 'couple_messages'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.couple_messages;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime' AND schemaname = 'public' AND tablename = 'couple_worlds'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.couple_worlds;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime' AND schemaname = 'public' AND tablename = 'couple_photos'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.couple_photos;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime' AND schemaname = 'public' AND tablename = 'couple_songs'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.couple_songs;
  END IF;
END $$;

-- 9. Registro inicial do universo do casal
INSERT INTO public.couple_worlds (world_id, journey_started, coins, tree_level, tree_xp, tree_water_count, last_mystery_chest_at)
VALUES ('gabriel-samella-1206', FALSE, 0, 1, 0, 0, 0)
ON CONFLICT (world_id) DO NOTHING;
