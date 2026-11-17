import React, { useState, useRef } from 'react';
import { createPortal } from 'react-dom';
import {
  X,
  Save,
  RotateCcw,
  Sparkles,
  Cloud,
  Check,
  AlertTriangle,
  Lock,
  Music,
  Image as ImageIcon,
  HelpCircle,
  QrCode,
  Sliders,
  Upload,
  Plus,
  Trash2,
  Repeat,
  Clock,
  Edit3,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { motion } from 'motion/react';
import { saveMediaBlob } from '../../services/localMediaStore';
import { extractYouTubeId, fetchYouTubeMetadata, getYouTubeThumbnailUrl } from '../../services/realAudio';
import { compressImageToDataUrl } from '../../services/googleDrive';
import { REAL_PHOTO_SLOTS } from '../../data/mediaAssets';
import { SmartPhoto } from '../SmartPhoto';

interface Props {
  onClose: () => void;
}

type AdminTab = 'geral' | 'musicas' | 'fotos' | 'quiz' | 'qr';

export const AdminSettingsModal: React.FC<Props> = ({ onClose }) => {
  const {
    config,
    updateConfig,
    showToast,
    resetAllData,
    isCloudSynced,
    journeyStarted,
    songs,
    addSong,
    editSong,
    removeSong,
    playSong,
    photos,
    addPhoto,
    editPhoto,
    togglePhotoInLoop,
    removePhoto,
    customQuizQuestions,
    addQuizQuestion,
    removeQuizQuestion,
    timeCapsules,
    addTimeCapsule,
    removeTimeCapsule,
    syncDrivePhotos,
    isDriveSyncing,
    driveSyncProgress,
  } = useApp();

  const expectedCreatorPin = config.creatorPasscode || '2023';
  const [isCreatorUnlocked, setIsCreatorUnlocked] = useState(false);
  const [pinAttempt, setPinAttempt] = useState('');
  const [pinError, setPinError] = useState(false);

  const [activeTab, setActiveTab] = useState<AdminTab>('geral');

  // Geral & Senhas state
  const [partnerName, setPartnerName] = useState(config.partnerName);
  const [myName, setMyName] = useState(config.myName);
  const [anniversaryDate, setAnniversaryDate] = useState(config.anniversaryDate);
  const [passcode, setPasscode] = useState(config.passcode);
  const [creatorPasscode, setCreatorPasscode] = useState(config.creatorPasscode || '2023');
  const [isSaved, setIsSaved] = useState(false);

  // Music Manager state
  const audioInputRef = useRef<HTMLInputElement>(null);
  const [songTitle, setSongTitle] = useState('');
  const [songArtist, setSongArtist] = useState(`${config.myName} & ${config.partnerName}`);
  const [songUrl, setSongUrl] = useState('');
  const [songLyrics, setSongLyrics] = useState('');
  const [isUploadingSong, setIsUploadingSong] = useState(false);
  const [editingSongId, setEditingSongId] = useState<string | null>(null);
  const [editSongTitle, setEditSongTitle] = useState('');
  const [editSongArtist, setEditSongArtist] = useState('');

  // Photo Manager state
  const photoInputRef = useRef<HTMLInputElement>(null);
  const [photoTitle, setPhotoTitle] = useState('');
  const [photoCaption, setPhotoCaption] = useState('');
  const [photoDate, setPhotoDate] = useState(new Date().toLocaleDateString('pt-BR'));
  const [photoUrl, setPhotoUrl] = useState('');
  const [photoLoop, setPhotoLoop] = useState(true);
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);

  // Quiz & Capsule Manager state
  const [qText, setQText] = useState('');
  const [qOpt0, setQOpt0] = useState('');
  const [qOpt1, setQOpt1] = useState('');
  const [qOpt2, setQOpt2] = useState('');
  const [qOpt3, setQOpt3] = useState('');
  const [qCorrect, setQCorrect] = useState(0);
  const [qExplain, setQExplain] = useState('');

  const [capTitle, setCapTitle] = useState('');
  const [capDate, setCapDate] = useState('2027-06-12');
  const [capMessage, setCapMessage] = useState('');

  // Reset state
  const [confirmReset, setConfirmReset] = useState(false);
  const [isResetting, setIsResetting] = useState(false);

  const handleUnlockSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (pinAttempt.trim() === expectedCreatorPin) {
      setIsCreatorUnlocked(true);
      setPinError(false);
    } else {
      setPinError(true);
      setPinAttempt('');
    }
  };

  const handleSaveGeneral = (e: React.FormEvent) => {
    e.preventDefault();
    updateConfig({
      partnerName: partnerName.trim() || 'Samella',
      myName: myName.trim() || 'Gabriel',
      anniversaryDate,
      passcode: passcode.trim() || '1206',
      creatorPasscode: creatorPasscode.trim() || '2023',
    });
    setIsSaved(true);
    showToast('Configurações e senhas salvas! 💖');
    setTimeout(() => setIsSaved(false), 1200);
  };

  const handleMp3FileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploadingSong(true);
    try {
      const cleanName = file.name.replace(/\.[^/.]+$/, '').replace(/[_-]+/g, ' ').trim();
      const idbKey = await saveMediaBlob(`song-${Date.now()}`, file);
      const objectUrl = URL.createObjectURL(file);

      const dur = await new Promise<number>((resolve) => {
        const audio = new Audio(objectUrl);
        audio.addEventListener('loadedmetadata', () => {
          const val = Math.round(audio.duration) || 210;
          URL.revokeObjectURL(objectUrl);
          resolve(val);
        });
        audio.addEventListener('error', () => {
          URL.revokeObjectURL(objectUrl);
          resolve(210);
        });
      });

      const mins = Math.floor(dur / 60);
      const secs = dur % 60;
      const durFormatted = `${mins}:${secs < 10 ? '0' : ''}${secs}`;

      const newSong = {
        title: songTitle.trim() || cleanName || 'Nossa Canção',
        artist: songArtist.trim() || `${config.myName} & ${config.partnerName}`,
        duration: dur,
        durationFormatted: durFormatted,
        audioUrl: idbKey,
        coverUrl: REAL_PHOTO_SLOTS.musicCovers[0],
        lyrics: songLyrics.trim()
          ? songLyrics.split('\n').map((l) => l.trim())
          : ['Trilha especial adicionada para o Nosso Mundo ♡'],
      };
      addSong(newSong);
      setSongTitle('');
      setSongLyrics('');
      playSong({ ...newSong, id: `song-${Date.now()}` });
    } catch {
      showToast('Não foi possível salvar esse áudio MP3.', '⚠️');
    } finally {
      setIsUploadingSong(false);
      e.target.value = '';
    }
  };

  const handleAddSongByUrl = async (e: React.FormEvent) => {
    e.preventDefault();
    const rawUrl = songUrl.trim();
    if (!rawUrl) {
      showToast('Cole o link do YouTube ou link direto de áudio.', '⚠️');
      return;
    }

    const ytId = extractYouTubeId(rawUrl);
    let resolvedTitle = songTitle.trim();
    let resolvedArtist = songArtist.trim();
    let resolvedCover = REAL_PHOTO_SLOTS.musicCovers[0];

    if (ytId) {
      resolvedCover = getYouTubeThumbnailUrl(ytId);
      if (!resolvedTitle) {
        const meta = await fetchYouTubeMetadata(rawUrl);
        if (meta) {
          resolvedTitle = meta.title;
          if (!resolvedArtist || resolvedArtist === `${config.myName} & ${config.partnerName}`) {
            resolvedArtist = meta.artist;
          }
          resolvedCover = meta.coverUrl;
        }
      }
    }

    addSong({
      title: resolvedTitle || (ytId ? 'Música do YouTube' : 'Nossa Canção ♡'),
      artist: resolvedArtist || `${config.myName} & ${config.partnerName}`,
      duration: 210,
      durationFormatted: '3:30',
      audioUrl: rawUrl,
      youtubeId: ytId || undefined,
      sourceType: ytId ? 'youtube' : 'audio',
      coverUrl: resolvedCover,
      lyrics: songLyrics.trim()
        ? songLyrics.split('\n').map((l) => l.trim())
        : ['Melodia romântica do casal ♡'],
    });
    setSongTitle('');
    setSongUrl('');
    setSongLyrics('');
  };

  const handlePhotoFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files: File[] = e.target.files ? Array.from(e.target.files) : [];
    if (files.length === 0) return;
    setIsUploadingPhoto(true);
    try {
      for (const file of files) {
        const { dataUrl, aspect } = await compressImageToDataUrl(file, 1100, 0.78);
        const cleanName = file.name.replace(/\.[^/.]+$/, '').replace(/[_-]+/g, ' ').trim();
        addPhoto({
          title: photoTitle.trim() || (cleanName.length <= 36 ? cleanName : 'Nosso Momento ♡'),
          subtitle: photoCaption.trim() || `${config.myName} & ${config.partnerName}`,
          date: photoDate || new Date().toLocaleDateString('pt-BR'),
          url: dataUrl,
          sourceType: 'upload',
          aspect,
          inHomeLoop: photoLoop,
          caption: photoCaption.trim(),
        });
      }
      setPhotoTitle('');
      setPhotoCaption('');
    } catch {
      showToast('Erro ao processar imagem selecionada.', '⚠️');
    } finally {
      setIsUploadingPhoto(false);
      e.target.value = '';
    }
  };

  const handleAddPhotoByUrl = (e: React.FormEvent) => {
    e.preventDefault();
    if (!photoUrl.trim()) {
      showToast('Cole a URL da imagem primeiro.', '⚠️');
      return;
    }
    addPhoto({
      title: photoTitle.trim() || 'Nosso Momento Especial ♡',
      subtitle: photoCaption.trim() || `${config.myName} & ${config.partnerName}`,
      date: photoDate || new Date().toLocaleDateString('pt-BR'),
      url: photoUrl.trim(),
      inHomeLoop: photoLoop,
      caption: photoCaption.trim(),
    });
    setPhotoTitle('');
    setPhotoUrl('');
    setPhotoCaption('');
  };

  const handleAddQuizQuestion = (e: React.FormEvent) => {
    e.preventDefault();
    if (!qText.trim() || !qOpt0.trim() || !qOpt1.trim()) {
      showToast('Preencha a pergunta e pelo menos 2 alternativas.', '⚠️');
      return;
    }
    const opts = [qOpt0.trim(), qOpt1.trim(), qOpt2.trim(), qOpt3.trim()].filter(Boolean);
    addQuizQuestion({
      question: qText.trim(),
      options: opts,
      correctIndex: Math.min(qCorrect, opts.length - 1),
      explanation: qExplain.trim() || 'Memória especial do casal ♡',
      category: 'Personalizada',
    });
    setQText('');
    setQOpt0('');
    setQOpt1('');
    setQOpt2('');
    setQOpt3('');
    setQExplain('');
  };

  const handleAddCapsule = (e: React.FormEvent) => {
    e.preventDefault();
    if (!capTitle.trim() || !capMessage.trim() || !capDate) {
      showToast('Preencha título, data de abertura e mensagem da cápsula.', '⚠️');
      return;
    }
    addTimeCapsule({
      title: capTitle.trim(),
      unlockDate: capDate,
      message: capMessage.trim(),
      author: config.myName,
    });
    setCapTitle('');
    setCapMessage('');
  };

  const handlePreLaunchReset = async () => {
    if (!confirmReset) {
      setConfirmReset(true);
      return;
    }
    setIsResetting(true);
    await resetAllData();
  };

  const modalContent = (
    <div className="fixed inset-0 z-[90] flex items-center justify-center p-3 sm:p-4">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-black/85 backdrop-blur-md"
      />

      <motion.div
        initial={{ scale: 0.94, y: 16, opacity: 0 }}
        animate={{ scale: 1, y: 0, opacity: 1 }}
        exit={{ scale: 0.94, y: 16, opacity: 0 }}
        className="relative z-10 w-full max-w-2xl bg-[#110526] border border-purple-400/35 rounded-3xl p-4 sm:p-6 shadow-2xl overflow-y-auto max-h-[90vh]"
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-3 border-b border-purple-500/20 mb-4">
          <div className="flex items-center gap-2">
            <Lock className="w-4 h-4 text-pink-400" />
            <h3 className="text-base font-bold text-white">
              {isCreatorUnlocked ? 'Estúdio do Criador • Nosso Mundo' : 'Área Protegida do Criador'}
            </h3>
          </div>
          <button
            onClick={onClose}
            aria-label="Fechar configurações"
            className="min-w-[40px] min-h-[40px] rounded-full glass-panel flex items-center justify-center text-purple-300 hover:text-white cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Creator Password Gate */}
        {!isCreatorUnlocked ? (
          <form onSubmit={handleUnlockSubmit} className="py-6 max-w-xs mx-auto text-center space-y-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-purple-700/40 to-pink-600/40 border border-pink-400/40 flex items-center justify-center mx-auto shadow-lg">
              <Lock className="w-7 h-7 text-pink-300" />
            </div>
            <div>
              <h4 className="text-base font-bold text-white">Digite a Senha de Criador</h4>
              <p className="text-xs text-purple-300/75 mt-1">
                Somente quem possui a senha administrativa pode adicionar fotos, músicas, perguntas do quiz ou alterar senhas.
              </p>
            </div>

            <input
              type="password"
              inputMode="numeric"
              autoFocus
              maxLength={12}
              value={pinAttempt}
              onChange={(e) => {
                setPinAttempt(e.target.value);
                setPinError(false);
              }}
              placeholder="••••"
              className="w-full px-4 py-3 rounded-2xl bg-purple-950/80 border border-purple-500/40 text-center text-xl tracking-[0.4em] text-white font-mono focus:outline-none focus:border-pink-400"
            />

            {pinError && (
              <p className="text-xs text-rose-400 font-semibold">
                Senha incorreta. Tente novamente.
              </p>
            )}

            {expectedCreatorPin === '2023' && (
              <p className="text-[11px] text-purple-300/60">
                Senha padrão inicial do criador: <span className="font-mono text-pink-300">2023</span> (altere na aba Geral)
              </p>
            )}

            <button
              type="submit"
              className="w-full min-h-[46px] rounded-2xl bg-gradient-to-r from-purple-600 to-pink-600 text-white text-sm font-bold shadow-lg cursor-pointer hover:brightness-110"
            >
              Desbloquear Estúdio
            </button>
          </form>
        ) : (
          <div className="space-y-4">
            {/* Tabs Navigation */}
            <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1">
              {[
                { id: 'geral', label: 'Geral & Senhas', icon: Sliders },
                { id: 'musicas', label: `Músicas (${songs.length})`, icon: Music },
                { id: 'fotos', label: `Fotos (${photos.length})`, icon: ImageIcon },
                { id: 'quiz', label: 'Quiz & Cápsulas', icon: HelpCircle },
                { id: 'qr', label: 'QR & Lançamento', icon: QrCode },
              ].map((t) => {
                const Icon = t.icon;
                const active = activeTab === t.id;
                return (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => setActiveTab(t.id as AdminTab)}
                    className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                      active
                        ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-md'
                        : 'glass-panel text-purple-300 hover:text-white border border-purple-500/20'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    <span>{t.label}</span>
                  </button>
                );
              })}
            </div>

            {/* TAB 1: GERAL & SENHAS */}
            {activeTab === 'geral' && (
              <form onSubmit={handleSaveGeneral} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs text-purple-300 block mb-1">Nome Dela (Amada)</label>
                    <input
                      type="text"
                      required
                      value={partnerName}
                      onChange={(e) => setPartnerName(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-purple-950/70 border border-purple-500/30 text-white text-sm focus:outline-none focus:border-pink-400"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-purple-300 block mb-1">Nome Dele (Criador)</label>
                    <input
                      type="text"
                      required
                      value={myName}
                      onChange={(e) => setMyName(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-purple-950/70 border border-purple-500/30 text-white text-sm focus:outline-none focus:border-pink-400"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="text-xs text-purple-300 block mb-1">Início do Namoro</label>
                    <input
                      type="date"
                      required
                      value={anniversaryDate.slice(0, 10)}
                      onChange={(e) => setAnniversaryDate(`${e.target.value}T00:00:00`)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-purple-950/70 border border-purple-500/30 text-white text-sm focus:outline-none focus:border-pink-400"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-purple-300 block mb-1">PIN de Entrada (Dela)</label>
                    <input
                      type="text"
                      maxLength={4}
                      required
                      value={passcode}
                      onChange={(e) => setPasscode(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-purple-950/70 border border-purple-500/30 text-white text-sm font-mono focus:outline-none focus:border-pink-400"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-purple-300 block mb-1">Senha do Criador (Config)</label>
                    <input
                      type="text"
                      maxLength={12}
                      required
                      value={creatorPasscode}
                      onChange={(e) => setCreatorPasscode(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-purple-950/70 border border-purple-500/30 text-white text-sm font-mono focus:outline-none focus:border-pink-400"
                    />
                  </div>
                </div>

                <div className="flex justify-end">
                  <button
                    type="submit"
                    className="px-6 min-h-[44px] rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold text-xs shadow-md flex items-center gap-2 cursor-pointer"
                  >
                    {isSaved ? <Check className="w-4 h-4" /> : <Save className="w-4 h-4" />}
                    <span>{isSaved ? 'Salvo!' : 'Salvar Configurações'}</span>
                  </button>
                </div>
              </form>
            )}

            {/* TAB 2: MÚSICAS */}
            {activeTab === 'musicas' && (
              <div className="space-y-4">
                <input
                  ref={audioInputRef}
                  type="file"
                  accept="audio/*"
                  className="hidden"
                  onChange={handleMp3FileSelect}
                />

                <div className="p-4 rounded-2xl glass-panel border border-purple-500/25 space-y-3">
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <h4 className="text-xs font-bold text-pink-300 uppercase tracking-wider">
                      Adicionar Nova Música ao Player
                    </h4>
                    <button
                      type="button"
                      disabled={isUploadingSong}
                      onClick={() => audioInputRef.current?.click()}
                      className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-pink-600 hover:bg-pink-500 text-white text-xs font-bold shadow cursor-pointer disabled:opacity-60"
                    >
                      <Upload className="w-3.5 h-3.5" />
                      <span>{isUploadingSong ? 'Salvando MP3...' : 'Enviar MP3 do Celular'}</span>
                    </button>
                  </div>

                  <form onSubmit={handleAddSongByUrl} className="space-y-2.5">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      <input
                        type="text"
                        placeholder="Título da música *"
                        value={songTitle}
                        onChange={(e) => setSongTitle(e.target.value)}
                        className="px-3 py-2 rounded-xl bg-purple-950/70 border border-purple-500/30 text-white text-xs focus:outline-none focus:border-pink-400"
                      />
                      <input
                        type="text"
                        placeholder="Artista"
                        value={songArtist}
                        onChange={(e) => setSongArtist(e.target.value)}
                        className="px-3 py-2 rounded-xl bg-purple-950/70 border border-purple-500/30 text-white text-xs focus:outline-none focus:border-pink-400"
                      />
                    </div>
                    <input
                      type="text"
                      placeholder="Link do YouTube (youtube.com / youtu.be) ou link direto MP3"
                      value={songUrl}
                      onChange={(e) => setSongUrl(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-purple-950/70 border border-purple-500/30 text-white text-xs font-mono focus:outline-none focus:border-pink-400"
                    />
                    <textarea
                      rows={2}
                      placeholder="Letra da música (opcional, uma linha por verso)"
                      value={songLyrics}
                      onChange={(e) => setSongLyrics(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-purple-950/70 border border-purple-500/30 text-white text-xs focus:outline-none focus:border-pink-400"
                    />
                    <div className="flex justify-end">
                      <button
                        type="submit"
                        className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Adicionar por Link</span>
                      </button>
                    </div>
                  </form>
                </div>

                {/* Songs List */}
                <div className="space-y-2 max-h-[260px] overflow-y-auto pr-1">
                  {songs.map((song) => (
                    <div
                      key={song.id}
                      className="p-3 rounded-2xl bg-purple-950/50 border border-purple-500/20 flex items-center justify-between gap-2"
                    >
                      {editingSongId === song.id ? (
                        <div className="flex-1 flex flex-col sm:flex-row gap-2">
                          <input
                            type="text"
                            value={editSongTitle}
                            onChange={(e) => setEditSongTitle(e.target.value)}
                            className="flex-1 px-2.5 py-1.5 rounded-lg bg-black/50 border border-pink-400/50 text-xs text-white"
                          />
                          <input
                            type="text"
                            value={editSongArtist}
                            onChange={(e) => setEditSongArtist(e.target.value)}
                            className="flex-1 px-2.5 py-1.5 rounded-lg bg-black/50 border border-pink-400/50 text-xs text-white"
                          />
                          <button
                            type="button"
                            onClick={() => {
                              editSong(song.id, {
                                title: editSongTitle.trim() || song.title,
                                artist: editSongArtist.trim() || song.artist,
                              });
                              setEditingSongId(null);
                            }}
                            className="px-3 py-1.5 rounded-lg bg-emerald-600 text-white text-xs font-bold cursor-pointer"
                          >
                            Salvar
                          </button>
                        </div>
                      ) : (
                        <>
                          <div className="min-w-0 flex-1">
                            <p className="text-xs font-bold text-white truncate">{song.title}</p>
                            <p className="text-[11px] text-purple-300/70 truncate">
                              {song.artist} • {song.durationFormatted}
                            </p>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <button
                              type="button"
                              onClick={() => {
                                setEditingSongId(song.id);
                                setEditSongTitle(song.title);
                                setEditSongArtist(song.artist);
                              }}
                              className="p-2 rounded-lg glass-panel text-purple-300 hover:text-white cursor-pointer"
                              title="Editar música"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => removeSong(song.id)}
                              className="p-2 rounded-lg glass-panel text-rose-400/80 hover:text-rose-300 cursor-pointer"
                              title="Remover música"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* TAB 3: FOTOS & LOOP */}
            {activeTab === 'fotos' && (
              <div className="space-y-4">
                <input
                  ref={photoInputRef}
                  type="file"
                  accept="image/*"
                  multiple
                  className="hidden"
                  onChange={handlePhotoFileSelect}
                />

                <div className="p-4 rounded-2xl glass-panel border border-purple-500/25 space-y-3">
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <h4 className="text-xs font-bold text-pink-300 uppercase tracking-wider">
                      Adicionar Fotos na Galeria e Loop Inicial
                    </h4>
                    <div className="flex items-center gap-2 flex-wrap">
                      <button
                        type="button"
                        disabled={isDriveSyncing}
                        onClick={() => syncDrivePhotos()}
                        className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-teal-600/80 hover:bg-teal-500 text-white text-xs font-bold shadow cursor-pointer disabled:opacity-60"
                      >
                        <Cloud className="w-3.5 h-3.5" />
                        <span>
                          {isDriveSyncing
                            ? driveSyncProgress
                              ? `${driveSyncProgress.current}/${driveSyncProgress.total}`
                              : 'Drive...'
                            : 'Google Drive'}
                        </span>
                      </button>
                      <button
                        type="button"
                        disabled={isUploadingPhoto}
                        onClick={() => photoInputRef.current?.click()}
                        className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-gradient-to-r from-pink-600 to-purple-600 text-white text-xs font-bold shadow cursor-pointer disabled:opacity-60"
                      >
                        <Upload className="w-3.5 h-3.5" />
                        <span>{isUploadingPhoto ? 'Enviando...' : 'Escolher da Galeria'}</span>
                      </button>
                    </div>
                  </div>

                  <form onSubmit={handleAddPhotoByUrl} className="space-y-2.5">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                      <input
                        type="text"
                        placeholder="Título do momento"
                        value={photoTitle}
                        onChange={(e) => setPhotoTitle(e.target.value)}
                        className="px-3 py-2 rounded-xl bg-purple-950/70 border border-purple-500/30 text-white text-xs"
                      />
                      <input
                        type="text"
                        placeholder="Legenda carinhosa"
                        value={photoCaption}
                        onChange={(e) => setPhotoCaption(e.target.value)}
                        className="px-3 py-2 rounded-xl bg-purple-950/70 border border-purple-500/30 text-white text-xs"
                      />
                      <input
                        type="text"
                        placeholder="Data"
                        value={photoDate}
                        onChange={(e) => setPhotoDate(e.target.value)}
                        className="px-3 py-2 rounded-xl bg-purple-950/70 border border-purple-500/30 text-white text-xs"
                      />
                    </div>
                    <div className="flex flex-col sm:flex-row gap-2">
                      <input
                        type="url"
                        placeholder="Ou cole o link direto da foto (https://...)"
                        value={photoUrl}
                        onChange={(e) => setPhotoUrl(e.target.value)}
                        className="flex-1 px-3 py-2 rounded-xl bg-purple-950/70 border border-purple-500/30 text-white text-xs"
                      />
                      <label className="flex items-center gap-1.5 text-xs text-purple-200 px-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={photoLoop}
                          onChange={(e) => setPhotoLoop(e.target.checked)}
                          className="accent-pink-500"
                        />
                        <span>Mostrar no Loop Inicial</span>
                      </label>
                      <button
                        type="submit"
                        className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold cursor-pointer"
                      >
                        Salvar Link
                      </button>
                    </div>
                  </form>
                </div>

                {/* Photos list */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-[260px] overflow-y-auto pr-1">
                  {photos.map((photo) => (
                    <div
                      key={photo.id}
                      className="p-2.5 rounded-2xl bg-purple-950/50 border border-purple-500/20 flex items-center gap-2.5"
                    >
                      <div className="w-12 h-12 rounded-xl overflow-hidden flex-shrink-0 bg-black/40">
                        <SmartPhoto photo={photo} hideDetails className="w-full h-full rounded-none" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-bold text-white truncate">{photo.title}</p>
                        <p className="text-[10px] text-purple-300/70 truncate">{photo.date}</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => togglePhotoInLoop(photo.id)}
                        title="Ativar/Desativar no Loop da Tela Inicial"
                        className={`p-2 rounded-xl text-[10px] font-bold flex items-center gap-1 cursor-pointer transition-colors ${
                          photo.inHomeLoop
                            ? 'bg-pink-500/30 text-pink-200 border border-pink-400/40'
                            : 'glass-panel text-purple-400 hover:text-white'
                        }`}
                      >
                        <Repeat className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => removePhoto(photo.id)}
                        title="Remover foto"
                        className="p-2 rounded-xl glass-panel text-rose-400/80 hover:text-rose-300 cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* TAB 4: QUIZ & CÁPSULAS */}
            {activeTab === 'quiz' && (
              <div className="space-y-5 max-h-[420px] overflow-y-auto pr-1">
                {/* Quiz builder */}
                <form onSubmit={handleAddQuizQuestion} className="p-4 rounded-2xl glass-panel border border-purple-500/25 space-y-2.5">
                  <h4 className="text-xs font-bold text-pink-300 uppercase tracking-wider">
                    Nova Pergunta Personalizada para o Mega Quiz ({customQuizQuestions.length})
                  </h4>
                  <input
                    type="text"
                    placeholder="Pergunta sobre vocês dois *"
                    value={qText}
                    onChange={(e) => setQText(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-purple-950/70 border border-purple-500/30 text-white text-xs"
                  />
                  <div className="grid grid-cols-2 gap-2">
                    <input type="text" placeholder="Opção A *" value={qOpt0} onChange={(e) => setQOpt0(e.target.value)} className="px-3 py-1.5 rounded-xl bg-purple-950/70 border border-purple-500/30 text-white text-xs" />
                    <input type="text" placeholder="Opção B *" value={qOpt1} onChange={(e) => setQOpt1(e.target.value)} className="px-3 py-1.5 rounded-xl bg-purple-950/70 border border-purple-500/30 text-white text-xs" />
                    <input type="text" placeholder="Opção C" value={qOpt2} onChange={(e) => setQOpt2(e.target.value)} className="px-3 py-1.5 rounded-xl bg-purple-950/70 border border-purple-500/30 text-white text-xs" />
                    <input type="text" placeholder="Opção D" value={qOpt3} onChange={(e) => setQOpt3(e.target.value)} className="px-3 py-1.5 rounded-xl bg-purple-950/70 border border-purple-500/30 text-white text-xs" />
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <select
                      value={qCorrect}
                      onChange={(e) => setQCorrect(Number(e.target.value))}
                      className="px-3 py-2 rounded-xl bg-purple-950/80 border border-purple-500/30 text-white text-xs"
                    >
                      <option value={0}>Correta: Opção A</option>
                      <option value={1}>Correta: Opção B</option>
                      <option value={2}>Correta: Opção C</option>
                      <option value={3}>Correta: Opção D</option>
                    </select>
                    <input
                      type="text"
                      placeholder="Explicação fofa (opcional)"
                      value={qExplain}
                      onChange={(e) => setQExplain(e.target.value)}
                      className="flex-1 px-3 py-2 rounded-xl bg-purple-950/70 border border-purple-500/30 text-white text-xs"
                    />
                    <button type="submit" className="px-4 py-2 rounded-xl bg-pink-600 text-white text-xs font-bold cursor-pointer">
                      Adicionar Pergunta
                    </button>
                  </div>

                  {customQuizQuestions.length > 0 && (
                    <div className="space-y-1.5 pt-2">
                      {customQuizQuestions.map((q) => (
                        <div key={q.id} className="flex items-center justify-between gap-2 px-3 py-1.5 rounded-xl bg-black/30 text-xs">
                          <span className="text-purple-100 truncate">{q.question}</span>
                          <button type="button" onClick={() => removeQuizQuestion(q.id)} className="text-rose-400 hover:text-rose-300 cursor-pointer">
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </form>

                {/* Time Capsule Builder */}
                <form onSubmit={handleAddCapsule} className="p-4 rounded-2xl glass-panel border border-amber-500/25 space-y-2.5">
                  <h4 className="text-xs font-bold text-amber-300 uppercase tracking-wider flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5" />
                    <span>Cápsula do Tempo Futura ({timeCapsules.length})</span>
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <input
                      type="text"
                      placeholder="Título da cápsula *"
                      value={capTitle}
                      onChange={(e) => setCapTitle(e.target.value)}
                      className="px-3 py-2 rounded-xl bg-purple-950/70 border border-purple-500/30 text-white text-xs"
                    />
                    <input
                      type="date"
                      value={capDate}
                      onChange={(e) => setCapDate(e.target.value)}
                      className="px-3 py-2 rounded-xl bg-purple-950/70 border border-purple-500/30 text-white text-xs"
                    />
                  </div>
                  <textarea
                    rows={2}
                    placeholder="Escreva a mensagem que só abrirá nesta data futura..."
                    value={capMessage}
                    onChange={(e) => setCapMessage(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-purple-950/70 border border-purple-500/30 text-white text-xs"
                  />
                  <div className="flex justify-end">
                    <button type="submit" className="px-4 py-2 rounded-xl bg-amber-600 text-white text-xs font-bold cursor-pointer">
                      Selar Cápsula Futura
                    </button>
                  </div>

                  {timeCapsules.length > 0 && (
                    <div className="space-y-1.5 pt-1">
                      {timeCapsules.map((cap) => (
                        <div key={cap.id} className="flex items-center justify-between gap-2 px-3 py-1.5 rounded-xl bg-black/30 text-xs">
                          <span className="text-amber-100 truncate">
                            {cap.title} • {new Date(`${cap.unlockDate}T00:00:00`).toLocaleDateString('pt-BR')}
                          </span>
                          <button type="button" onClick={() => removeTimeCapsule(cap.id)} className="text-rose-400 hover:text-rose-300 cursor-pointer">
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </form>
              </div>
            )}

            {/* TAB 5: QR & LANÇAMENTO */}
            {activeTab === 'qr' && (
              <div className="space-y-4">
                <div className="p-3.5 rounded-2xl bg-purple-950/60 border border-purple-500/25 flex items-center gap-2.5 text-xs">
                  <Cloud className="w-4 h-4 text-teal-300 shrink-0" />
                  <div>
                    <span className="font-semibold text-white block">Armazenamento na Nuvem + Local</span>
                    <span className="text-[11px] text-purple-300/75">
                      {journeyStarted
                        ? isCloudSynced
                          ? 'Sincronizado automaticamente sem necessidade de login.'
                          : 'Salvando progresso no dispositivo e na nuvem...'
                        : 'Zerado e aguardando o primeiro desbloqueio via QR Code.'}
                    </span>
                  </div>
                </div>

                <div className="p-4 rounded-2xl glass-panel border border-purple-500/25 space-y-2 text-xs text-purple-200/80">
                  <h4 className="font-bold text-pink-300 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Arquivos Estáticos para GitHub (Opcional):</span>
                  </h4>
                  <p>
                    📸 Fotos estáticas: <code className="text-pink-300 font-mono">public/assets/img/1.jpg ... 38.jpg</code>
                  </p>
                  <p>
                    🎵 Músicas estáticas: <code className="text-pink-300 font-mono">public/assets/audio/nome.mp3</code>
                  </p>
                  <p className="text-[11px] text-purple-300/70">
                    Você também pode enviar fotos e MP3 diretamente pelas abas acima sem tocar em código.
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-rose-950/30 border border-rose-500/30 space-y-2.5">
                  <div className="flex items-start gap-2 text-xs text-rose-200">
                    <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold text-white block">Preparar para Entrega (QR Code)</span>
                      <span className="text-[11px] text-rose-200/80">
                        Zera diamantes, árvore, pets, cartas lidas e conquistas na nuvem e no aparelho para ela começar tudo do zero ao escanear.
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      disabled={isResetting}
                      onClick={handlePreLaunchReset}
                      className={`px-4 min-h-[40px] rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                        confirmReset
                          ? 'bg-rose-600 hover:bg-rose-500 text-white shadow-lg'
                          : 'bg-rose-950/80 hover:bg-rose-900 text-rose-200 border border-rose-400/40'
                      }`}
                    >
                      <RotateCcw className={`w-3.5 h-3.5 ${isResetting ? 'animate-spin' : ''}`} />
                      <span>
                        {isResetting
                          ? 'Zerando...'
                          : confirmReset
                          ? 'Confirmar: Zerar Tudo Agora'
                          : 'Zerar Progresso para Lançamento'}
                      </span>
                    </button>

                    {confirmReset && !isResetting && (
                      <button
                        type="button"
                        onClick={() => setConfirmReset(false)}
                        className="px-3 min-h-[40px] rounded-xl text-xs text-purple-300 hover:text-white cursor-pointer"
                      >
                        Cancelar
                      </button>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </motion.div>
    </div>
  );

  return typeof document !== 'undefined' ? createPortal(modalContent, document.body) : modalContent;
};
