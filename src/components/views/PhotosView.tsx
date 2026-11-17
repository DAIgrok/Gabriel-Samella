import React, { useState, useRef } from 'react';
import { createPortal } from 'react-dom';
import {
  Image as ImageIcon,
  Heart,
  Play,
  Plus,
  Cloud,
  Upload,
  Link as LinkIcon,
  X,
  Loader2,
  RefreshCw,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { motion, AnimatePresence } from 'motion/react';
import { MemoryPhoto } from '../../types';
import { soundEngine } from '../../utils/audioSynth';
import { SmartPhoto } from '../SmartPhoto';
import { compressImageToDataUrl } from '../../services/googleDrive';

export const PhotosView: React.FC = () => {
  const {
    config,
    photos,
    selectedPhoto,
    setSelectedPhoto,
    toggleFavoritePhoto,
    addPhoto,
    unlockAchievement,
    showToast,
    isDriveSyncing,
    driveSyncProgress,
    isGoogleConnected,
    syncDrivePhotos,
  } = useApp();

  const [filter, setFilter] = useState<'todas' | 'favoritas'>('todas');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [photoTitle, setPhotoTitle] = useState('');
  const [photoCaption, setPhotoCaption] = useState('');
  const [photoUrl, setPhotoUrl] = useState('');
  const [photoInLoop, setPhotoInLoop] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const filteredPhotos = photos.filter((p) => {
    if (filter === 'favoritas') return p.isFavorite;
    return true;
  });

  const handleOpenPhoto = (photo: MemoryPhoto) => {
    soundEngine.playHeartPop();
    setSelectedPhoto(photo);
    unlockAchievement('ach-first-memory');
  };

  const handleStartSlideshow = () => {
    soundEngine.playSparkle();
    if (!selectedPhoto && photos.length > 0) {
      setSelectedPhoto(photos[0]);
    }
    showToast('Modo Cinema Iniciado! ✨');
  };

  const handleDeviceUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files: File[] = e.target.files ? Array.from(e.target.files) : [];
    if (files.length === 0) return;

    setIsUploading(true);
    try {
      for (const file of files) {
        const { dataUrl, aspect } = await compressImageToDataUrl(file, 1100, 0.78);
        const cleanName = file.name.replace(/\.[^/.]+$/, '').replace(/[_-]+/g, ' ').trim();
        addPhoto({
          title: photoTitle.trim() || (cleanName.length <= 32 ? cleanName : 'Nosso Momento ♡'),
          subtitle: photoCaption.trim() || `${config.myName} & ${config.partnerName}`,
          date: new Date().toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' }),
          url: dataUrl,
          sourceType: 'upload',
          aspect,
          inHomeLoop: photoInLoop,
          caption: photoCaption.trim(),
        });
      }
      setPhotoTitle('');
      setPhotoCaption('');
      setIsAddModalOpen(false);
    } catch {
      showToast('Não foi possível preparar esta foto.', '⚠️');
    } finally {
      setIsUploading(false);
      e.target.value = '';
    }
  };

  const handleUrlSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!photoUrl.trim()) {
      showToast('Cole o link da imagem primeiro.', '⚠️');
      return;
    }
    addPhoto({
      title: photoTitle.trim() || 'Nosso Momento Especial ♡',
      subtitle: photoCaption.trim() || `${config.myName} & ${config.partnerName}`,
      date: new Date().toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' }),
      url: photoUrl.trim(),
      sourceType: 'url',
      inHomeLoop: photoInLoop,
      caption: photoCaption.trim(),
    });
    setPhotoTitle('');
    setPhotoCaption('');
    setPhotoUrl('');
    setIsAddModalOpen(false);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -12 }}
      transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
      className="space-y-6 pb-32 sm:pb-24 max-w-5xl mx-auto"
    >
      {/* Header */}
      <div className="text-center space-y-1">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-500/20 border border-purple-400/30 text-xs font-semibold text-purple-300 mb-1">
          <ImageIcon className="w-3.5 h-3.5" />
          <span>Álbum de Memórias do Casal</span>
        </div>
        <h2 className="text-2xl md:text-3xl font-bold text-white font-display">
          Nossa História em Imagens ♡
        </h2>
        <p className="text-xs md:text-sm text-purple-200/70">
          Fotos salvas na nuvem para Gabriel & Samella verem sempre ✨
        </p>
      </div>

      {/* Filter, Upload, Drive Sync and Cinema Mode Controls */}
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <div className="flex items-center gap-1.5 p-1 rounded-2xl glass-panel border border-purple-500/20">
          <button
            onClick={() => setFilter('todas')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-medium transition-all cursor-pointer ${
              filter === 'todas'
                ? 'bg-white text-purple-900 shadow-md'
                : 'text-purple-300/70 hover:text-white'
            }`}
          >
            Todas ({photos.length})
          </button>
          <button
            onClick={() => setFilter('favoritas')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-medium transition-all cursor-pointer ${
              filter === 'favoritas'
                ? 'bg-white text-purple-900 shadow-md'
                : 'text-purple-300/70 hover:text-white'
            }`}
          >
            Favoritas ⭐
          </button>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center gap-1.5 px-3.5 min-h-[40px] py-2 rounded-2xl bg-gradient-to-r from-pink-600 to-purple-600 text-white text-xs font-bold shadow-md hover:scale-105 active:scale-95 transition-all cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Adicionar Foto</span>
          </button>

          <button
            onClick={() => syncDrivePhotos()}
            disabled={isDriveSyncing}
            className="flex items-center gap-1.5 px-3.5 min-h-[40px] py-2 rounded-2xl glass-panel border border-teal-400/35 text-teal-200 text-xs font-bold hover:bg-teal-950/40 active:scale-95 transition-all cursor-pointer disabled:opacity-60"
            title="Sincronizar fotos da pasta compartilhada do Google Drive"
          >
            {isDriveSyncing ? (
              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Cloud className="w-3.5 h-3.5" />
            )}
            <span>
              {isDriveSyncing
                ? driveSyncProgress
                  ? `Drive ${driveSyncProgress.current}/${driveSyncProgress.total}`
                  : 'Sincronizando...'
                : isGoogleConnected
                ? 'Atualizar Drive'
                : 'Sincronizar Drive'}
            </span>
          </button>

          <button
            onClick={handleStartSlideshow}
            className="flex items-center gap-1.5 px-4 min-h-[40px] py-2 rounded-2xl bg-white text-purple-900 text-xs font-bold shadow-md hover:scale-105 active:scale-95 transition-all cursor-pointer"
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            <span>Slideshow</span>
          </button>
        </div>
      </div>

      {/* Photos Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-2.5 md:gap-3">
        {filteredPhotos.map((photo, i) => (
          <motion.div
            key={photo.id}
            layout
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: (i % 6) * 0.05 }}
            className="group relative overflow-hidden bg-slate-900/50 aspect-square cursor-pointer rounded-[24px] shadow-sm border border-white/5"
            onClick={() => handleOpenPhoto(photo)}
          >
            <SmartPhoto
              photo={photo}
              alt={photo.title}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            />

            {/* Favorite Button Overlay */}
            <div className="absolute top-3 right-3 z-10">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  toggleFavoritePhoto(photo.id);
                }}
                className="p-2 rounded-full bg-black/40 backdrop-blur-md text-white/90 hover:text-pink-400 transition-colors cursor-pointer"
                title="Favoritar"
              >
                <Heart
                  className={`w-4 h-4 ${
                    photo.isFavorite ? 'text-pink-400 fill-pink-400 drop-shadow-[0_0_8px_rgba(244,114,182,0.8)]' : ''
                  }`}
                />
              </button>
            </div>

            {/* Title Scrim */}
            <div className="absolute bottom-0 inset-x-0 p-3 bg-gradient-to-t from-black/80 via-black/40 to-transparent pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity">
              <p className="text-xs font-bold text-white truncate">{photo.title}</p>
              <p className="text-[10px] text-purple-200/80 truncate">{photo.date}</p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Add Photo Modal (Portaled for both Samella & Gabriel) */}
      {typeof document !== 'undefined' &&
        createPortal(
          <AnimatePresence>
            {isAddModalOpen && (
              <div
                className="fixed inset-0 z-[90] bg-black/85 backdrop-blur-md flex items-center justify-center p-4"
                onClick={() => setIsAddModalOpen(false)}
              >
                <motion.div
                  initial={{ scale: 0.94, opacity: 0, y: 12 }}
                  animate={{ scale: 1, opacity: 1, y: 0 }}
                  exit={{ scale: 0.94, opacity: 0, y: 12 }}
                  onClick={(e) => e.stopPropagation()}
                  className="w-full max-w-md bg-[#110526] border border-pink-400/40 rounded-3xl p-5 sm:p-6 shadow-2xl space-y-4"
                >
                  <div className="flex items-center justify-between pb-2 border-b border-purple-500/20">
                    <div className="flex items-center gap-2">
                      <ImageIcon className="w-5 h-5 text-pink-400" />
                      <h3 className="text-base font-bold text-white font-display">
                        Adicionar Foto ao Nosso Álbum ♡
                      </h3>
                    </div>
                    <button
                      type="button"
                      onClick={() => setIsAddModalOpen(false)}
                      className="p-1.5 rounded-full text-purple-300 hover:text-white cursor-pointer"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    multiple
                    className="hidden"
                    onChange={handleDeviceUpload}
                  />

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    <input
                      type="text"
                      value={photoTitle}
                      onChange={(e) => setPhotoTitle(e.target.value)}
                      placeholder="Título do momento (opcional)"
                      className="px-3 py-2 rounded-xl bg-purple-950/70 border border-purple-500/30 text-white text-xs focus:outline-none focus:border-pink-400"
                    />
                    <input
                      type="text"
                      value={photoCaption}
                      onChange={(e) => setPhotoCaption(e.target.value)}
                      placeholder="Legenda fofa (opcional)"
                      className="px-3 py-2 rounded-xl bg-purple-950/70 border border-purple-500/30 text-white text-xs focus:outline-none focus:border-pink-400"
                    />
                  </div>

                  <label className="flex items-center gap-2 text-xs text-purple-200 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={photoInLoop}
                      onChange={(e) => setPhotoInLoop(e.target.checked)}
                      className="accent-pink-500"
                    />
                    <span>Mostrar no quadro de fotos em loop da tela inicial</span>
                  </label>

                  {/* Upload from device gallery */}
                  <button
                    type="button"
                    disabled={isUploading}
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-pink-600 to-purple-600 text-white text-xs font-bold shadow-lg flex items-center justify-center gap-2 hover:brightness-110 active:scale-[0.99] transition-all cursor-pointer disabled:opacity-60"
                  >
                    {isUploading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Salvando e sincronizando na nuvem...</span>
                      </>
                    ) : (
                      <>
                        <Upload className="w-4 h-4" />
                        <span>Escolher Foto(s) da Galeria do Celular</span>
                      </>
                    )}
                  </button>

                  <div className="relative flex py-1 items-center">
                    <div className="flex-grow border-t border-purple-500/25" />
                    <span className="flex-shrink mx-3 text-[10px] uppercase tracking-wider text-purple-300/60">
                      ou por link direto
                    </span>
                    <div className="flex-grow border-t border-purple-500/25" />
                  </div>

                  <form onSubmit={handleUrlSubmit} className="flex gap-2">
                    <div className="relative flex-1">
                      <LinkIcon className="w-3.5 h-3.5 text-purple-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="url"
                        value={photoUrl}
                        onChange={(e) => setPhotoUrl(e.target.value)}
                        placeholder="https://..."
                        className="w-full pl-8 pr-3 py-2 rounded-xl bg-purple-950/70 border border-purple-500/30 text-white text-xs focus:outline-none focus:border-pink-400"
                      />
                    </div>
                    <button
                      type="submit"
                      className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold cursor-pointer"
                    >
                      Salvar
                    </button>
                  </form>
                </motion.div>
              </div>
            )}
          </AnimatePresence>,
          document.body
        )}
    </motion.div>
  );
};
