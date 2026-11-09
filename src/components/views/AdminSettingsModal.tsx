import React, { useState } from 'react';
import { X, Save, RotateCcw, Sparkles, Image, Music, Lock, Heart, Check } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { motion } from 'motion/react';

interface Props {
  onClose: () => void;
}

export const AdminSettingsModal: React.FC<Props> = ({ onClose }) => {
  const { config, updateConfig, showToast } = useApp();

  const [partnerName, setPartnerName] = useState(config.partnerName);
  const [myName, setMyName] = useState(config.myName);
  const [anniversaryDate, setAnniversaryDate] = useState(config.anniversaryDate);
  const [passcode, setPasscode] = useState(config.passcode);
  const [isSaved, setIsSaved] = useState(false);

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
    }, 1200);
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
        className="relative z-10 w-full max-w-lg bg-[#110526] border border-purple-400/30 rounded-3xl p-6 md:p-8 shadow-2xl overflow-y-auto max-h-[90vh]"
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-3 border-b border-purple-500/20 mb-4">
          <div className="flex items-center gap-2">
            <Heart className="w-5 h-5 text-pink-400 fill-pink-400" />
            <h3 className="text-base font-bold text-white">Configurações do Nosso Mundo</h3>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-full glass-panel flex items-center justify-center text-purple-300 hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSave} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
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

          <div>
            <label className="text-xs text-purple-300 block mb-1">Data de Início do Namoro</label>
            <input
              type="date"
              required
              value={anniversaryDate}
              onChange={(e) => setAnniversaryDate(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-purple-950/70 border border-purple-500/30 text-white text-sm focus:outline-none focus:border-pink-400"
            />
          </div>

          <div>
            <label className="text-xs text-purple-300 block mb-1">Senha de Acesso (PIN de 4 dígitos)</label>
            <input
              type="text"
              maxLength={4}
              required
              value={passcode}
              onChange={(e) => setPasscode(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-purple-950/70 border border-purple-500/30 text-white text-sm font-mono focus:outline-none focus:border-pink-400"
            />
          </div>

          {/* Quick instructions guide for replacing photos and audio */}
          <div className="p-4 rounded-2xl glass-panel border border-purple-500/25 space-y-2 text-xs text-purple-200/80">
            <h4 className="font-bold text-pink-300 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Como substituir fotos e músicas reais:</span>
            </h4>
            <p>
              📸 <strong>Fotos:</strong> Coloque suas fotos em <code className="text-pink-300 font-mono">assets/img/1.jpg</code> até <code className="text-pink-300 font-mono">38.jpg</code> ou edite os links em <code className="text-purple-300 font-mono">src/data/initialData.ts</code>.
            </p>
            <p>
              🎵 <strong>Músicas:</strong> Insira seus arquivos MP3 em <code className="text-pink-300 font-mono">assets/audio/te-vivo.mp3</code> para reprodução nativa offline.
            </p>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl glass-panel text-purple-300 text-xs"
            >
              Cancelar
            </button>

            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold text-xs shadow-md flex items-center gap-2"
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
