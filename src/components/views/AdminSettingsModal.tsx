import React, { useState } from 'react';
import { X, Save, RotateCcw, Sparkles, Cloud, Heart, Check, AlertTriangle } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { motion } from 'motion/react';

interface Props {
  onClose: () => void;
}

export const AdminSettingsModal: React.FC<Props> = ({ onClose }) => {
  const { config, updateConfig, showToast, resetAllData, isCloudSynced, journeyStarted } = useApp();

  const [partnerName, setPartnerName] = useState(config.partnerName);
  const [myName, setMyName] = useState(config.myName);
  const [anniversaryDate, setAnniversaryDate] = useState(config.anniversaryDate);
  const [passcode, setPasscode] = useState(config.passcode);
  const [isSaved, setIsSaved] = useState(false);
  const [confirmReset, setConfirmReset] = useState(false);
  const [isResetting, setIsResetting] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateConfig({
      partnerName: partnerName.trim() || 'Samella',
      myName: myName.trim() || 'Gabriel',
      anniversaryDate,
      passcode: passcode.trim() || '1206',
    });
    setIsSaved(true);
    showToast('Configurações atualizadas com sucesso! 💖');
    setTimeout(() => {
      setIsSaved(false);
      onClose();
    }, 1000);
  };

  const handlePreLaunchReset = async () => {
    if (!confirmReset) {
      setConfirmReset(true);
      return;
    }
    setIsResetting(true);
    await resetAllData();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-black/85 backdrop-blur-md"
      />

      <motion.div
        initial={{ scale: 0.9, y: 20, opacity: 0 }}
        animate={{ scale: 1, y: 0, opacity: 1 }}
        exit={{ scale: 0.9, y: 20, opacity: 0 }}
        className="relative z-10 w-full max-w-lg bg-[#110526] border border-purple-400/30 rounded-3xl p-5 sm:p-7 shadow-2xl overflow-y-auto max-h-[90vh]"
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-3 border-b border-purple-500/20 mb-4">
          <div className="flex items-center gap-2">
            <Heart className="w-5 h-5 text-pink-400 fill-pink-400" />
            <h3 className="text-base font-bold text-white">Configurações do Nosso Mundo</h3>
          </div>
          <button
            onClick={onClose}
            aria-label="Fechar configurações"
            className="min-w-[40px] min-h-[40px] rounded-full glass-panel flex items-center justify-center text-purple-300 hover:text-white cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Cloud & QR Status Banner */}
        <div className="mb-4 p-3 rounded-2xl bg-purple-950/60 border border-purple-500/25 flex items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 text-purple-200">
            <Cloud className="w-4 h-4 text-teal-300 shrink-0" />
            <div>
              <span className="font-semibold text-white block">Armazenamento na Nuvem + Local</span>
              <span className="text-[11px] text-purple-300/75">
                {journeyStarted
                  ? isCloudSynced
                    ? 'Sincronizado automaticamente sem login.'
                    : 'Salvando progresso no dispositivo e na nuvem...'
                  : 'Aguardando o primeiro desbloqueio pelo QR Code.'}
              </span>
            </div>
          </div>
        </div>

        <form onSubmit={handleSave} className="space-y-4">
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
              <label className="text-xs text-purple-300 block mb-1">Nome Dele (Você)</label>
              <input
                type="text"
                required
                value={myName}
                onChange={(e) => setMyName(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-purple-950/70 border border-purple-500/30 text-white text-sm focus:outline-none focus:border-pink-400"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-purple-300 block mb-1">Data de Início do Namoro</label>
              <input
                type="date"
                required
                value={anniversaryDate.slice(0, 10)}
                onChange={(e) => setAnniversaryDate(`${e.target.value}T00:00:00`)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-purple-950/70 border border-purple-500/30 text-white text-sm focus:outline-none focus:border-pink-400"
              />
            </div>

            <div>
              <label className="text-xs text-purple-300 block mb-1">Senha de Acesso (PIN)</label>
              <input
                type="text"
                maxLength={4}
                required
                value={passcode}
                onChange={(e) => setPasscode(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-purple-950/70 border border-purple-500/30 text-white text-sm font-mono focus:outline-none focus:border-pink-400"
              />
            </div>
          </div>

          {/* Guide for real couple photos and audio */}
          <div className="p-4 rounded-2xl glass-panel border border-purple-500/25 space-y-2 text-xs text-purple-200/80">
            <h4 className="font-bold text-pink-300 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Pastas para suas Fotos e Músicas Reais (GitHub):</span>
            </h4>
            <p>
              📸 <strong>Fotos:</strong> Substitua os arquivos em{' '}
              <code className="text-pink-300 font-mono">public/assets/img/1.jpg</code> até{' '}
              <code className="text-pink-300 font-mono">38.jpg</code> ou envie direto na aba Fotos.
            </p>
            <p>
              🎵 <strong>Músicas:</strong> Coloque os MP3 em{' '}
              <code className="text-pink-300 font-mono">public/assets/audio/</code> (ex:{' '}
              <code className="text-purple-200 font-mono">te-vivo.mp3</code>) ou envie na aba Música.
            </p>
          </div>

          {/* Pre-Launch Reset Zone for QR Code Delivery */}
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

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 min-h-[44px] rounded-xl glass-panel text-purple-300 text-xs font-semibold cursor-pointer"
            >
              Cancelar
            </button>

            <button
              type="submit"
              className="px-6 min-h-[44px] rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold text-xs shadow-md flex items-center gap-2 cursor-pointer"
            >
              {isSaved ? <Check className="w-4 h-4" /> : <Save className="w-4 h-4" />}
              <span>{isSaved ? 'Salvo!' : 'Salvar Alterações'}</span>
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};
