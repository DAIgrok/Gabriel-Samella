import React, { useState, useRef } from 'react';
import { createPortal } from 'react-dom';
import {
  Image as ImageIcon,
  Heart,
  Play,
  Plus,
  Upload,
  Link as LinkIcon,
  X,
  Loader2,
  FolderArchive,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { motion, AnimatePresence } from 'motion/react';
import { MemoryPhoto } from '../../types';
import { soundEngine } from '../../utils/audioSynth';
import { SmartPhoto } from '../SmartPhoto';
import { compressPhotoSafe, extractPhotosFromZipFile } from '../../utils/zipPhotoExtractor';
import { markFilePickerOpen } from '../../utils/privacySecurity';

export const PhotosView: React.FC = () => {
  const {
    photos,
    selectedPhoto,
    setSelectedPhoto,
    toggleFavoritePhoto,
    addPhoto,
    unlockAchievement,
    showToast,
  } = useApp();

  const [filter, setFilter] = useState<'todas' | 'favoritas'>('todas');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [photoUrl, setPhotoUrl] = useState('');
  const [photoInLoop, setPhotoInLoop] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<{ current: number; total: number } | null>(null);
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
    showToast('Modo Cinema Iniciado!');
  };

  const handleDeviceUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files: File[] = e.target.files ? Array.from(e.target.files) : [];
    if (files.length === 0) return;

    setIsUploading(true);
    setUploadProgress(null);
    let addedCount = 0;

    try {
      for (const file of files) {
        const lowerName = file.name.toLowerCase();
        const isZip =
          lowerName.endsWith('.zip') ||
          file.type === 'application/zip' ||
          file.type === 'application/x-zip-compressed';

        if (isZip) {
          const extracted = await extractPhotosFromZipFile(file, (cur, tot) => {
            setUploadProgress({ current: cur, total: tot });
          });
          for (const item of extracted) {
            addPhoto({
              title: '',
              subtitle: '',
              date: '',
              url: item.dataUrl,
              sourceType: 'upload',
              aspect: item.aspect,
              inHomeLoop: photoInLoop,
              caption: '',
            });
            addedCount++;
          }
        } else {
          const { dataUrl, aspect } = await compressPhotoSafe(file);
          addPhoto({
            title: '',
            subtitle: '',
            date: '',
            url: dataUrl,
            sourceType: 'upload',
            aspect,
            inHomeLoop: photoInLoop,
            caption: '',
          });
          addedCount++;
        }
      }

      if (addedCount > 0) {
        showToast(
          addedCount === 1
            ? 'Foto salva para sempre na galeria e no fundo ♡'
            : `${addedCount} fotos salvas para sempre na galeria e no fundo ♡`,
          'camera'
        );
        setIsAddModalOpen(false);
      } else {
        showToast('Nenhuma imagem válida encontrada no arquivo selecionado.', 'image');
      }
    } catch {
      showToast('Não foi possível preparar este arquivo ou .zip.');
    } finally {
      setIsUploading(false);
      setUploadProgress(null);
      e.target.value = '';
    }
  };

  const handleUrlSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!photoUrl.trim()) {
      showToast('Cole o link da imagem primeiro.');
      return;
    }
    addPhoto({
      title: '',
      subtitle: '',
      date: '',
      url: photoUrl.trim(),
      sourceType: 'url',
      inHomeLoop: photoInLoop,
      caption: '',
    });
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
      {/* Cabeçalho */}
      <div className="text-center space-y-1">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-500/20 border border-purple-400/30 text-xs font-semibold text-purple-300 mb-1">
          <ImageIcon className="w-3.5 h-3.5" />
          <span>Galeria do Casal</span>
        </div>
        <h2 className="text-2xl md:text-3xl font-bold text-white font-display">
          Nossas Fotos Reais ♡
        </h2>
        <p className="text-xs md:text-sm text-purple-200/70">
          Fotos salvas permanentemente na nuvem — também giram ao fundo do app ♡
        </p>
      </div>

      {/* Filtros & Ações */}
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
            Favoritas
          </button>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center gap-1.5 px-4 min-h-[42px] py-2 rounded-2xl bg-gradient-to-r from-pink-600 to-purple-600 text-white text-xs font-bold shadow-md hover:scale-105 active:scale-95 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Adicionar Foto / .ZIP</span>
          </button>

          {photos.length > 0 && (
            <button
              onClick={handleStartSlideshow}
              className="flex items-center gap-1.5 px-4 min-h-[42px] py-2 rounded-2xl bg-white text-purple-900 text-xs font-bold shadow-md hover:scale-105 active:scale-95 transition-all cursor-pointer"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>Slideshow</span>
            </button>
          )}
        </div>
      </div>

      {/* Grade de Fotos Limpa (Zero Descrições / Títulos / Datas) */}
      {filteredPhotos.length > 0 ? (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-2.5 md:gap-3">
          {filteredPhotos.map((photo, i) => (
            <motion.div
              key={photo.id}
              layout
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: (i % 6) * 0.04 }}
              className="group relative overflow-hidden bg-slate-900/50 aspect-square cursor-pointer rounded-[24px] shadow-sm border border-white/10"
              onClick={() => handleOpenPhoto(photo)}
            >
              <SmartPhoto
                photo={photo}
                alt="Foto do casal"
                hideDetails
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              />

              <div className="absolute top-3 right-3 z-10">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleFavoritePhoto(photo.id);
                  }}
                  className="p-2 rounded-full bg-black/45 backdrop-blur-md text-white/90 hover:text-pink-400 transition-colors cursor-pointer"
                  title="Favoritar"
                >
                  <Heart
                    className={`w-4 h-4 ${
                      photo.isFavorite ? 'text-pink-400 fill-pink-400 drop-shadow-[0_0_8px_rgba(244,114,182,0.8)]' : ''
                    }`}
                  />
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      ) : (
        <div className="rounded-3xl p-8 text-center glass-card-glow border border-purple-500/25 space-y-4">
          <div className="w-16 h-16 mx-auto rounded-2xl bg-pink-500/20 border border-pink-400/35 flex items-center justify-center text-pink-300">
            <ImageIcon className="w-8 h-8" />
          </div>
          <div className="space-y-1">
            <h3 className="text-base sm:text-lg font-bold text-white">
              {filter === 'favoritas' ? 'Nenhuma foto favoritada ainda' : 'Nenhuma foto adicionada ainda ♡'}
            </h3>
            <p className="text-xs text-purple-200/75 max-w-md mx-auto">
              Adicione suas fotos reais do celular ou envie um arquivo <span className="text-pink-300 font-semibold">.zip</span> com várias fotos de uma vez. Tudo fica salvo permanentemente mesmo após zerar o app para entrega.
            </p>
          </div>
          {filter === 'todas' && (
            <button
              type="button"
              onClick={() => setIsAddModalOpen(true)}
              className="inline-flex items-center gap-2 px-5 min-h-[44px] rounded-2xl bg-gradient-to-r from-pink-600 to-purple-600 text-white text-xs font-bold shadow-lg hover:scale-105 transition-transform cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Adicionar Foto ou .ZIP</span>
            </button>
          )}
        </div>
      )}

      {/* Modal Adicionar Foto / .ZIP (sem campos de descrição) */}
      {typeof document !== 'undefined' &&
        createPortal(
          <AnimatePresence>
            {isAddModalOpen && (
              <div
                className="fixed inset-0 z-[90] bg-black/85 backdrop-blur-md flex items-center justify-center p-4"
                onClick={() => !isUploading && setIsAddModalOpen(false)}
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
                        Adicionar Fotos ao Álbum ♡
                      </h3>
                    </div>
                    <button
                      type="button"
                      disabled={isUploading}
                      onClick={() => setIsAddModalOpen(false)}
                      className="p-1.5 rounded-full text-purple-300 hover:text-white cursor-pointer"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*,.zip,application/zip,application/x-zip-compressed"
                    multiple
                    className="hidden"
                    onChange={handleDeviceUpload}
                  />

                  <label className="flex items-center gap-2 text-xs text-purple-200 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={photoInLoop}
                      onChange={(e) => setPhotoInLoop(e.target.checked)}
                      className="accent-pink-500"
                    />
                    <span>Exibir também no fundo animado e no quadro da tela inicial</span>
                  </label>

                  <button
                    type="button"
                    disabled={isUploading}
                    onClick={() => {
                      markFilePickerOpen();
                      fileInputRef.current?.click();
                    }}
                    className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-pink-600 to-purple-600 text-white text-xs font-bold shadow-lg flex items-center justify-center gap-2 hover:brightness-110 active:scale-[0.99] transition-all cursor-pointer disabled:opacity-60"
                  >
                    {isUploading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>
                          {uploadProgress
                            ? `Extraindo e salvando ${uploadProgress.current} de ${uploadProgress.total} fotos...`
                            : 'Comprimindo e salvando na nuvem...'}
                        </span>
                      </>
                    ) : (
                      <>
                        <Upload className="w-4 h-4" />
                        <span>Escolher Foto(s) ou Arquivo .ZIP</span>
                      </>
                    )}
                  </button>

                  <div className="p-3 rounded-2xl bg-purple-950/50 border border-purple-500/20 flex items-start gap-2.5 text-[11px] text-purple-200/80">
                    <FolderArchive className="w-4 h-4 text-pink-300 shrink-0 mt-0.5" />
                    <span>
                      Suporte completo para múltiplas fotos ou pacotes <strong className="text-white">.zip</strong>. Todas as fotos ficam salvas permanentemente na nuvem mesmo se você zerar o progresso para entrega.
                    </span>
                  </div>

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
