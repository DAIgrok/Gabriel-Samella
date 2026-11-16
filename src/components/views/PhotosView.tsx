import React, { useState } from 'react';
import {
  Image as ImageIcon,
  Heart,
  Play,
  Plus,
  Trash2,
  X,
  Upload,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { motion, AnimatePresence } from 'motion/react';
import { MemoryPhoto } from '../../types';
import { soundEngine } from '../../utils/audioSynth';
import { SmartPhoto } from '../SmartPhoto';
import { PhotoVisualizerModal } from '../PhotoVisualizerModal';

export const PhotosView: React.FC = () => {
  const {
    photos,
    selectedPhoto,
    setSelectedPhoto,
    toggleFavoritePhoto,
    addPhoto,
    removePhoto,
    unlockAchievement,
    showToast,
  } = useApp();

  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const [filter, setFilter] = useState<'todas' | 'favoritas'>('todas');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newPhotoTitle, setNewPhotoTitle] = useState('');
  const [newPhotoCaption, setNewPhotoCaption] = useState('');
  const [newPhotoDate, setNewPhotoDate] = useState(new Date().toLocaleDateString('pt-BR'));
  const [newPhotoUrl, setNewPhotoUrl] = useState('');
  const [previewDataUrl, setPreviewDataUrl] = useState<string | null>(null);
  const [isProcessingFile, setIsProcessingFile] = useState(false);

  const compressImageFile = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onerror = () => reject(new Error('Falha ao ler imagem'));
      reader.onload = () => {
        const rawDataUrl = reader.result as string;
        const img = new Image();
        img.onerror = () => resolve(rawDataUrl);
        img.onload = () => {
          const maxDim = 1200;
          let { width, height } = img;
          if (width > maxDim || height > maxDim) {
            const ratio = Math.min(maxDim / width, maxDim / height);
            width = Math.round(width * ratio);
            height = Math.round(height * ratio);
          }
          const canvas = document.createElement('canvas');
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          if (!ctx) {
            resolve(rawDataUrl);
            return;
          }
          ctx.drawImage(img, 0, 0, width, height);
          resolve(canvas.toDataURL('image/jpeg', 0.82));
        };
        img.src = rawDataUrl;
      };
      reader.readAsDataURL(file);
    });
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    setIsProcessingFile(true);
    try {
      const file = files[0];
      const compressed = await compressImageFile(file);
      setPreviewDataUrl(compressed);
      setNewPhotoUrl(compressed);
      if (!newPhotoTitle) {
        const cleanName = file.name.replace(/\.[^/.]+$/, '').replace(/[_-]+/g, ' ').trim();
        if (cleanName && cleanName.length <= 36) {
          setNewPhotoTitle(cleanName);
        }
      }
      setIsAddModalOpen(true);
    } catch {
      showToast('Não foi possível carregar essa imagem. Tente outro arquivo.', '⚠️');
    } finally {
      setIsProcessingFile(false);
      e.target.value = '';
    }
  };

  const handleOpenDeviceMedia = () => {
    soundEngine.playHeartPop();
    fileInputRef.current?.click();
  };

  const handleSaveNewPhoto = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPhotoUrl && !previewDataUrl) {
      showToast('Por favor, selecione uma imagem da sua galeria ou informe a URL!');
      return;
    }

    addPhoto({
      title: newPhotoTitle.trim() || 'Nosso Momento Especial ♡',
      subtitle: newPhotoCaption.trim() || 'Amor de Gabriel & Samella',
      date: newPhotoDate || new Date().toLocaleDateString('pt-BR'),
      url: previewDataUrl || newPhotoUrl,
      caption: newPhotoCaption.trim(),
    });

    // Reset and close
    setNewPhotoTitle('');
    setNewPhotoCaption('');
    setNewPhotoUrl('');
    setPreviewDataUrl(null);
    setIsAddModalOpen(false);
  };

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

  return (
    <motion.div
      initial={{ opacity: 0, y: 16, filter: 'blur(4px)' }}
      animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
      exit={{ opacity: 0, y: -12, filter: 'blur(4px)' }}
      transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
      className="space-y-6 pb-32 sm:pb-24 max-w-5xl mx-auto"
    >
      {/* Hidden Direct Device Media Input (Galeria / Fotos / Arquivos) */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileUpload}
        className="hidden"
      />

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
          Gabriel & Samella • Fotos salvas na pasta <code className="text-pink-300 font-mono">public/assets/img/</code>
        </p>
      </div>

      {/* Filter and Cinema Mode Controls */}
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <div className="flex items-center gap-1.5 p-1 rounded-2xl glass-panel border border-purple-500/20">
          <button
            onClick={() => setFilter('todas')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-medium transition-all ${
              filter === 'todas'
                ? 'bg-white text-purple-900 shadow-md'
                : 'text-purple-300/70 hover:text-white'
            }`}
          >
            Todas ({photos.length})
          </button>
          <button
            onClick={() => setFilter('favoritas')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-medium transition-all ${
              filter === 'favoritas'
                ? 'bg-white text-purple-900 shadow-md'
                : 'text-purple-300/70 hover:text-white'
            }`}
          >
            Favoritas ⭐
          </button>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleOpenDeviceMedia}
            disabled={isProcessingFile}
            className="flex items-center gap-1.5 px-3.5 min-h-[40px] py-2 rounded-2xl bg-gradient-to-r from-pink-600 to-purple-600 text-white text-xs font-bold shadow-md hover:brightness-110 active:scale-95 transition-all cursor-pointer disabled:opacity-60"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>{isProcessingFile ? 'Carregando...' : 'Adicionar Foto'}</span>
          </button>

          <button
            type="button"
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center gap-1 px-3 min-h-[40px] py-2 rounded-2xl glass-panel border border-purple-500/30 text-purple-200 hover:text-white text-xs font-semibold active:scale-95 transition-all cursor-pointer"
            title="Adicionar por link ou galeria"
          >
            <Upload className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Link/Opções</span>
          </button>

          <button
            onClick={handleStartSlideshow}
            className="flex items-center gap-1.5 px-3.5 min-h-[40px] py-2 rounded-2xl bg-white text-purple-900 text-xs font-bold shadow-md hover:scale-105 active:scale-95 transition-all cursor-pointer"
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            <span>Slideshow</span>
          </button>
        </div>
      </div>

      {/* Photos Grid Premium iPhone Style */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-2 md:gap-3">
        {filteredPhotos.map((photo, i) => (
          <motion.div
            key={photo.id}
            layout
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: (i % 6) * 0.1 }}
            className="group relative overflow-hidden bg-slate-900/50 aspect-square cursor-pointer rounded-[24px] shadow-sm border border-white/5"
            onClick={() => handleOpenPhoto(photo)}
          >
            <SmartPhoto
              photo={photo}
              alt={photo.title}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            />

            {/* Favorite & Delete Buttons Overlay */}
            <div className="absolute top-3 right-3 flex items-center gap-1.5 z-10">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  toggleFavoritePhoto(photo.id);
                }}
                className="p-2 rounded-full bg-black/40 backdrop-blur-md text-white/90 hover:text-pink-400 transition-colors"
                title="Favoritar"
              >
                <Heart
                  className={`w-4 h-4 ${
                    photo.isFavorite ? 'text-pink-400 fill-pink-400 drop-shadow-[0_0_8px_rgba(244,114,182,0.8)]' : ''
                  }`}
                />
              </button>

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  if (confirm('Deseja remover esta foto do álbum?')) {
                    removePhoto(photo.id);
                  }
                }}
                className="p-2 rounded-full bg-black/40 backdrop-blur-md text-white/70 hover:text-rose-400 transition-colors opacity-0 group-hover:opacity-100"
                title="Remover foto"
              >
                <Trash2 className="w-3.5 h-3.5" />
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

      {/* Add Photo Modal */}
      <AnimatePresence>
        {isAddModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 15 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 15 }}
              className="w-full max-w-md rounded-3xl p-6 bg-gradient-to-b from-[#1c0b33] via-[#120622] to-[#080214] border border-pink-400/40 shadow-2xl space-y-4"
            >
              <div className="flex items-center justify-between pb-2 border-b border-purple-500/20">
                <div className="flex items-center gap-2">
                  <ImageIcon className="w-4 h-4 text-pink-400" />
                  <h3 className="text-base font-bold text-white">Adicionar Nova Foto ♡</h3>
                </div>
                <button
                  onClick={() => setIsAddModalOpen(false)}
                  className="p-1 rounded-lg text-purple-300 hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSaveNewPhoto} className="space-y-3.5">
                {/* File picker button */}
                <div>
                  <label className="text-xs text-pink-300 font-semibold block mb-1.5">
                    Escolha uma foto da galeria do celular ou computador:
                  </label>
                  <button
                    type="button"
                    onClick={handleOpenDeviceMedia}
                    className="w-full p-4 rounded-2xl border-2 border-dashed border-purple-500/40 hover:border-pink-400 flex flex-col items-center justify-center gap-2 cursor-pointer bg-purple-950/40 transition"
                  >
                    {previewDataUrl ? (
                      <div className="flex flex-col items-center gap-1.5">
                        <div className="w-24 h-24 rounded-xl overflow-hidden shadow-md border border-pink-400/50">
                          <img src={previewDataUrl} alt="Preview" className="w-full h-full object-cover" />
                        </div>
                        <span className="text-[11px] text-pink-300 font-semibold">Toque para trocar a imagem</span>
                      </div>
                    ) : (
                      <>
                        <Upload className="w-6 h-6 text-pink-400" />
                        <span className="text-xs text-purple-200">Toque para abrir a Galeria / Mídia</span>
                        <span className="text-[10px] text-purple-400">JPG, PNG, WebP do dispositivo</span>
                      </>
                    )}
                  </button>
                </div>

                {/* Or Direct URL Input */}
                <div>
                  <label className="text-xs text-purple-300 font-semibold block mb-1">
                    Ou cole o link direto da imagem:
                  </label>
                  <input
                    type="url"
                    value={newPhotoUrl}
                    onChange={(e) => {
                      setNewPhotoUrl(e.target.value);
                      setPreviewDataUrl(e.target.value);
                    }}
                    placeholder="https://exemplo.com/nossa-foto.jpg"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-purple-950/80 border border-purple-500/40 text-white text-xs placeholder-purple-400/50 focus:outline-none focus:border-pink-400"
                  />
                </div>

                <div>
                  <label className="text-xs text-purple-300 font-semibold block mb-1">
                    Título do momento:
                  </label>
                  <input
                    type="text"
                    value={newPhotoTitle}
                    onChange={(e) => setNewPhotoTitle(e.target.value)}
                    placeholder="Ex: Pôr do sol com você ♡"
                    className="w-full px-3.5 py-2 rounded-xl bg-purple-950/80 border border-purple-500/40 text-white text-xs placeholder-purple-400/50 focus:outline-none focus:border-pink-400"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2.5">
                  <div>
                    <label className="text-xs text-purple-300 font-semibold block mb-1">
                      Data:
                    </label>
                    <input
                      type="text"
                      value={newPhotoDate}
                      onChange={(e) => setNewPhotoDate(e.target.value)}
                      placeholder="DD/MM/AAAA"
                      className="w-full px-3.5 py-2 rounded-xl bg-purple-950/80 border border-purple-500/40 text-white text-xs placeholder-purple-400/50 focus:outline-none focus:border-pink-400"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-purple-300 font-semibold block mb-1">
                      Legenda carinhosa:
                    </label>
                    <input
                      type="text"
                      value={newPhotoCaption}
                      onChange={(e) => setNewPhotoCaption(e.target.value)}
                      placeholder="Ex: Dia inesquecível..."
                      className="w-full px-3.5 py-2 rounded-xl bg-purple-950/80 border border-purple-500/40 text-white text-xs placeholder-purple-400/50 focus:outline-none focus:border-pink-400"
                    />
                  </div>
                </div>

                <div className="flex gap-2.5 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsAddModalOpen(false)}
                    className="flex-1 py-2.5 rounded-xl border border-purple-500/30 text-purple-200 text-xs font-semibold hover:bg-purple-900/30 transition"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-pink-600 to-purple-600 text-white text-xs font-bold shadow-md hover:brightness-110 transition cursor-pointer"
                  >
                    Salvar Foto 📸
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Fullscreen Photo Visualizer Modal */}
      <PhotoVisualizerModal
        photo={selectedPhoto}
        photos={filteredPhotos}
        onClose={() => setSelectedPhoto(null)}
        onSelectPhoto={(p) => setSelectedPhoto(p)}
      />
    </motion.div>
  );
};
