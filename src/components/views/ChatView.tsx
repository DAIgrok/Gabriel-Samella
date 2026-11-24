import React, { useEffect, useRef, useState } from 'react';
import {
  Bell,
  BellRing,
  Camera,
  Check,
  CheckCheck,
  Heart,
  Mic,
  Phone,
  Video,
  Pause,
  Play,
  Send,
  Sparkles,
  Square,
  Trash2,
  X,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { AnimatePresence, motion } from 'motion/react';
import { soundEngine } from '../../utils/audioSynth';
import { getCouplePhotoUrl, REAL_PHOTO_SLOTS } from '../../data/mediaAssets';
import { uploadChatMedia } from '../../services/supabaseSync';

async function compressChatImage(file: File): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.onload = () => {
        const maxDim = 1280;
        const scale = Math.min(1, maxDim / Math.max(img.width, img.height));
        const width = Math.max(1, Math.round(img.width * scale));
        const height = Math.max(1, Math.round(img.height * scale));
        const canvas = document.createElement('canvas');
        canvas.width = width; canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) { resolve(file); return; }
        ctx.drawImage(img, 0, 0, width, height);
        canvas.toBlob((blob) => blob ? resolve(blob) : reject(new Error('Falha ao comprimir foto.')), 'image/jpeg', 0.84);
      };
      img.onerror = () => reject(new Error('Imagem inválida.'));
      img.src = reader.result as string;
    };
    reader.onerror = () => reject(new Error('Falha ao ler foto.'));
    reader.readAsDataURL(file);
  });
}

const AudioBubblePlayer: React.FC<{ src: string; duration?: string }> = ({ src, duration }) => {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [playing, setPlaying] = useState(false);

  const toggle = () => {
    const el = audioRef.current;
    if (!el) return;
    if (playing) {
      el.pause();
      setPlaying(false);
    } else {
      el.play().then(() => setPlaying(true)).catch(() => setPlaying(false));
    }
  };

  return (
    <div className="flex items-center gap-2.5 min-w-[175px] py-0.5">
      <audio
        ref={audioRef}
        src={src}
        preload="metadata"
        onEnded={() => setPlaying(false)}
        onPause={() => setPlaying(false)}
      />
      <button
        type="button"
        onClick={toggle}
        className="w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center text-white flex-shrink-0 cursor-pointer"
        aria-label={playing ? 'Pausar áudio' : 'Ouvir áudio'}
      >
        {playing ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5 ml-0.5" />}
      </button>
      <div className="flex-1 flex flex-col gap-1">
        <div className="flex items-center gap-0.5 h-3.5">
          {[35, 65, 95, 50, 80, 100, 60, 45, 85, 70, 50, 90, 40].map((h, i) => (
            <span
              key={i}
              style={{ height: `${h}%` }}
              className={`w-1 rounded-full transition-all ${
                playing ? 'bg-pink-200 animate-pulse' : 'bg-white/60'
              }`}
            />
          ))}
        </div>
        <span className="text-[10px] text-white/75 font-mono">{duration || '0:05'}</span>
      </div>
    </div>
  );
};

export const ChatView: React.FC = () => {
  const {
    chatMessages,
    sendChatMessage,
    config,
    photos,
    triggerHeartExplosion,
    markChatRead,
    isSpectator,
    onlinePeers,
    notificationPermission,
    requestNotificationPermission,
    showToast,
  } = useApp();

  const [inputText, setInputText] = useState('');
  const [senderRole, setSenderRole] = useState<'eu' | 'ela'>(isSpectator ? 'eu' : 'ela');
  const [isSending, setIsSending] = useState(false);
  const [lightboxImage, setLightboxImage] = useState<string | null>(null);

  // Voice recording state
  const [isRecording, setIsRecording] = useState(false);
  const [recordSeconds, setRecordSeconds] = useState(0);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const recordTimerRef = useRef<number | null>(null);
  const recordCancelledRef = useRef<boolean>(false);

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const bottomRef = useRef<HTMLDivElement | null>(null);

  const effectiveRole: 'eu' | 'ela' = isSpectator ? 'eu' : senderRole;
  const peerRoleKey: 'Gabriel' | 'Samella' = isSpectator ? 'Samella' : 'Gabriel';
  const isPeerOnline = Boolean(onlinePeers?.[peerRoleKey]);
  const peerDisplayName = isSpectator ? config.partnerName || 'Samella' : config.myName || 'Gabriel';

  useEffect(() => {
    markChatRead();
  }, [chatMessages.length]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
  }, [chatMessages.length]);

  useEffect(() => {
    return () => {
      if (recordTimerRef.current) window.clearInterval(recordTimerRef.current);
      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
        mediaRecorderRef.current.stop();
      }
    };
  }, []);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    const clean = inputText.trim();
    if (!clean || isSending) return;

    setIsSending(true);
    setInputText('');
    soundEngine.playHeartPop();
    triggerHeartExplosion();
    try {
      await sendChatMessage({ text: clean, senderRole: effectiveRole, msgType: 'text' });
    } finally {
      setIsSending(false);
    }
  };

  const handleQuickSend = async (preset: string) => {
    if (isSending) return;
    setIsSending(true);
    soundEngine.playHeartPop();
    triggerHeartExplosion();
    try {
      await sendChatMessage({ text: preset, senderRole: effectiveRole, msgType: 'text' });
    } finally {
      setIsSending(false);
    }
  };

  const handleImagePick = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    setIsSending(true);
    try {
      const compressedBlob = await compressChatImage(file);
      const compressedUrl = await uploadChatMedia(compressedBlob, 'image');
      await sendChatMessage({
        text: 'Fotografia',
        senderRole: effectiveRole,
        msgType: 'image',
        mediaUrl: compressedUrl,
      });
      triggerHeartExplosion();
    } catch {
      showToast('Não foi possível processar esta foto.', 'camera');
    } finally {
      setIsSending(false);
    }
  };

  const startVoiceRecording = async () => {
    if (!navigator.mediaDevices?.getUserMedia || typeof MediaRecorder === 'undefined') {
      showToast('Gravação de voz não é compatível com este navegador.', 'chat');
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: { echoCancellation: true, noiseSuppression: true, autoGainControl: true, channelCount: 1, sampleRate: 48000 },
      });
      const preferredType = ['audio/webm;codecs=opus', 'audio/ogg;codecs=opus', 'audio/mp4'].find((type) => MediaRecorder.isTypeSupported(type));
      const recorder = new MediaRecorder(stream, preferredType ? { mimeType: preferredType, audioBitsPerSecond: 64000 } : { audioBitsPerSecond: 64000 });
      const mimeType = recorder.mimeType || preferredType || 'audio/webm';
      mediaRecorderRef.current = recorder;
      audioChunksRef.current = [];
      recordCancelledRef.current = false;
      setRecordSeconds(0);
      setIsRecording(true);
      const startedAt = Date.now();
      recordTimerRef.current = window.setInterval(() => setRecordSeconds(Math.floor((Date.now() - startedAt) / 1000)), 400);
      recorder.ondataavailable = (event) => { if (event.data.size > 0) audioChunksRef.current.push(event.data); };
      recorder.onstop = async () => {
        stream.getTracks().forEach((track) => track.stop());
        if (recordTimerRef.current) { window.clearInterval(recordTimerRef.current); recordTimerRef.current = null; }
        setIsRecording(false);
        if (recordCancelledRef.current) return;
        const blob = new Blob(audioChunksRef.current, { type: mimeType });
        if (blob.size < 900) { showToast('O áudio ficou muito curto. Grave novamente.', 'chat'); return; }
        const seconds = Math.max(1, Math.round((Date.now() - startedAt) / 1000));
        const duration = Math.floor(seconds / 60) + ':' + String(seconds % 60).padStart(2, '0');
        setIsSending(true);
        try {
          const mediaUrl = await uploadChatMedia(blob, 'audio');
          await sendChatMessage({ text: 'Mensagem de voz', senderRole: effectiveRole, msgType: 'audio', mediaUrl, audioDuration: duration });
        } catch {
          showToast('Não foi possível enviar o áudio. Tente novamente.', 'chat');
        } finally { setIsSending(false); }
      };
      recorder.start(250);
    } catch {
      showToast('Permita o acesso ao microfone para enviar áudio.', 'chat');
      setIsRecording(false);
    }
  };

  const stopAndSendVoice = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      recordCancelledRef.current = false;
      mediaRecorderRef.current.stop();
    }
  };

  const cancelVoice = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      recordCancelledRef.current = true;
      mediaRecorderRef.current.stop();
    }
    setIsRecording(false);
  };

  const mySenderMarker = isSpectator ? 'me' : 'partner';

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -12 }}
      transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
      className="pb-24 sm:pb-20 max-w-xl mx-auto flex flex-col h-[calc(100vh-118px)] min-h-[480px]"
    >
      {/* WhatsApp-style Top Header Bar */}
      <div className="rounded-t-2xl px-4 py-3 bg-[#0b1730] border border-sky-300/15 border-b-0 flex items-center justify-between gap-2 shadow-lg flex-shrink-0">
        <div className="flex items-center gap-3 min-w-0">
          <div className="relative flex-shrink-0">
            {getCouplePhotoUrl(photos, 0) ? (
              <img
                src={getCouplePhotoUrl(photos, 0)}
                alt={peerDisplayName}
                className="w-10 h-10 rounded-full object-cover border border-pink-400/50"
              />
            ) : (
              <div className="w-10 h-10 rounded-full border border-pink-400/50 bg-gradient-to-tr from-purple-700 to-pink-600 flex items-center justify-center">
                <Heart className="w-4 h-4 text-white fill-white" />
              </div>
            )}
            <span
              className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-[#15072b] ${
                isPeerOnline ? 'bg-emerald-400 shadow-[0_0_8px_#34d399]' : 'bg-slate-500'
              }`}
            />
          </div>

          <div className="min-w-0">
            <h2 className="text-sm font-bold text-white truncate flex items-center gap-1.5">
              <span>{peerDisplayName}</span>
              <Heart className="w-3.5 h-3.5 text-pink-400 fill-pink-400 flex-shrink-0" />
            </h2>
            <p className="text-[11px] font-medium flex items-center gap-1.5">
              <span className={isPeerOnline ? 'text-emerald-300' : 'text-purple-300/60'}>
                {isPeerOnline ? 'Online agora' : 'Offline no momento'}
              </span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-shrink-0">
          {/* Sender Switcher hidden automatically in Spectator Mode (locked to Gabriel) */}
          {!isSpectator && (
            <div className="flex items-center p-0.5 rounded-xl bg-purple-950/90 border border-purple-400/25">
              <button
                type="button"
                onClick={() => {
                  soundEngine.playHeartPop();
                  setSenderRole('ela');
                }}
                className={`px-2.5 py-1 rounded-lg text-[10px] font-bold cursor-pointer transition ${
                  senderRole === 'ela'
                    ? 'bg-gradient-to-r from-pink-600 to-rose-500 text-white'
                    : 'text-purple-300/75 hover:text-white'
                }`}
              >
                {config.partnerName}
              </button>
              <button
                type="button"
                onClick={() => {
                  soundEngine.playHeartPop();
                  setSenderRole('eu');
                }}
                className={`px-2.5 py-1 rounded-lg text-[10px] font-bold cursor-pointer transition ${
                  senderRole === 'eu'
                    ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white'
                    : 'text-purple-300/75 hover:text-white'
                }`}
              >
                {config.myName}
              </button>
            </div>
          )}

          {/* Browser Notification Permission Trigger */}
          {notificationPermission !== 'unsupported' && (
            <button
              type="button"
              onClick={() => requestNotificationPermission()}
              title={
                notificationPermission === 'granted'
                  ? 'Notificações ativadas'
                  : 'Ativar notificações no navegador'
              }
              className={`min-h-[36px] px-2.5 rounded-xl border text-[11px] font-semibold flex items-center gap-1.5 cursor-pointer transition ${
                notificationPermission === 'granted'
                  ? 'bg-emerald-500/20 border-emerald-400/40 text-emerald-200'
                  : 'bg-pink-500/20 hover:bg-pink-500/30 border-pink-400/45 text-pink-200'
              }`}
            >
              {notificationPermission === 'granted' ? (
                <BellRing className="w-3.5 h-3.5" />
              ) : (
                <Bell className="w-3.5 h-3.5" />
              )}
              <span className="hidden sm:inline">
                {notificationPermission === 'granted' ? 'Alertas Ativos' : 'Notificações'}
              </span>
            </button>
          )}
        </div>
      </div>

      {/* Histórico limpo: nenhuma mensagem é pré-carregada */}
      <div className="relative flex-1 min-h-0 overflow-hidden border border-sky-300/15 rounded-b-2xl bg-[#081329]">
        <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(ellipse_at_top,rgba(96,165,250,.10),transparent_55%)]" />
        <div className="relative z-10 h-full overflow-y-auto p-3 sm:p-4 space-y-3">
          {chatMessages.length === 0 ? (
            <div className="h-full min-h-[220px] flex flex-col items-center justify-center text-center text-slate-300/75 gap-2">
              <Heart className="w-8 h-8 text-amber-200/80" />
              <p className="text-sm font-medium text-slate-100">A conversa de vocês começa aqui.</p>
              <p className="text-xs max-w-[250px]">Nenhuma mensagem foi colocada antes. Envie a primeira quando quiser.</p>
            </div>
          ) : (
            chatMessages.map((msg) => {
              const isFromMeOnScreen = msg.sender === mySenderMarker;
              const isGabriel = msg.sender === 'me';
              const displayName = msg.senderName || (isGabriel ? config.myName : config.partnerName);
              const isRead = msg.status === 'read' || Boolean(msg.readAt);
              return (
                <motion.div key={msg.id} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.18 }} className={isFromMeOnScreen ? 'flex flex-col items-end' : 'flex flex-col items-start'}>
                  <div className={isFromMeOnScreen ? 'max-w-[84%] rounded-2xl rounded-tr-sm px-3.5 py-2.5 shadow-sm bg-gradient-to-br from-[#315b9d] to-[#574b99] border border-sky-200/15 text-white' : 'max-w-[84%] rounded-2xl rounded-tl-sm px-3.5 py-2.5 shadow-sm bg-[#15233d] border border-white/10 text-white'}>
                    <span className="block text-[10px] font-semibold text-sky-100/75 mb-1">{displayName}</span>
                    {msg.msgType === 'image' && msg.mediaUrl && (
                      <button type="button" onClick={() => setLightboxImage(msg.mediaUrl!)} className="block rounded-xl overflow-hidden mb-1.5 border border-white/15 cursor-pointer max-w-[250px]">
                        <img src={msg.mediaUrl} alt="Foto enviada no chat" className="w-full max-h-64 object-cover" />
                      </button>
                    )}
                    {msg.msgType === 'audio' && msg.mediaUrl ? (
                      <AudioBubblePlayer src={msg.mediaUrl} duration={msg.audioDuration} />
                    ) : (
                      msg.text && !(msg.msgType === 'image' && msg.text === 'Fotografia') && <p className="text-xs sm:text-sm leading-relaxed break-words">{msg.text}</p>
                    )}
                    <div className="flex items-center justify-end gap-1 mt-1 text-[10px] text-white/60">
                      <span>{msg.time}</span>
                      {isFromMeOnScreen && (isRead ? <CheckCheck className="w-3.5 h-3.5 text-sky-200" aria-label="Visto" /> : msg.status === 'delivered' ? <CheckCheck className="w-3.5 h-3.5 text-white/60" aria-label="Entregue" /> : <Check className="w-3.5 h-3.5 text-white/60" aria-label="Enviada" />)}
                    </div>
                  </div>
                </motion.div>
              );
            })
          )}
          <div ref={bottomRef} />
        </div>
      </div>

      {/* Bottom Input Dock */}
      <div className="rounded-b-2xl bg-[#0b1730] border border-sky-300/15 p-2.5 flex-shrink-0">
        {/* Hidden Image Input */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleImagePick}
          className="hidden"
        />

        {isRecording ? (
          <div className="flex items-center justify-between gap-2 px-3 py-2 rounded-2xl bg-rose-950/60 border border-rose-400/40">
            <div className="flex items-center gap-2 text-xs font-bold text-rose-200">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-ping" />
              <span>Gravando áudio... {recordSeconds}s</span>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={cancelVoice}
                className="p-2 rounded-xl bg-white/10 text-rose-200 hover:text-white cursor-pointer"
                aria-label="Cancelar áudio"
              >
                <Trash2 className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={stopAndSendVoice}
                className="px-3 py-2 rounded-xl bg-gradient-to-r from-pink-500 to-rose-500 text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer"
              >
                <Square className="w-3.5 h-3.5 fill-white" />
                <span>Enviar Áudio</span>
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSend} className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={isSending}
              aria-label="Enviar foto"
              className="w-11 h-11 rounded-xl bg-[#172747] hover:bg-[#20365d] border border-sky-300/20 flex items-center justify-center text-sky-200 flex-shrink-0 cursor-pointer transition"
            >
              <Camera className="w-5 h-5" />
            </button>

            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder={`Mensagem como ${effectiveRole === 'eu' ? config.myName : config.partnerName}...`}
              className="flex-1 min-h-[44px] px-3.5 py-2.5 rounded-xl bg-[#101e37] border border-sky-300/15 text-sm text-white placeholder-slate-400/60 focus:outline-none focus:border-amber-200/60"
            />

            {inputText.trim() ? (
              <button
                type="submit"
                disabled={isSending}
                aria-label="Enviar mensagem"
                className="w-11 h-11 rounded-2xl bg-gradient-to-r from-purple-600 to-pink-600 flex items-center justify-center text-white shadow-md active:scale-95 transition flex-shrink-0 cursor-pointer"
              >
                <Send className="w-4 h-4" />
              </button>
            ) : (
              <button
                type="button"
                onClick={startVoiceRecording}
                disabled={isSending}
                aria-label="Gravar mensagem de voz"
                className="w-11 h-11 rounded-2xl bg-gradient-to-r from-pink-600 to-rose-500 flex items-center justify-center text-white shadow-md active:scale-95 transition flex-shrink-0 cursor-pointer"
              >
                <Mic className="w-5 h-5" />
              </button>
            )}
          </form>
        )}
      </div>

      {/* Photo Lightbox Modal */}
      <AnimatePresence>
        {lightboxImage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setLightboxImage(null)}
            className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4"
          >
            <button
              type="button"
              onClick={() => setLightboxImage(null)}
              className="absolute top-5 right-5 w-10 h-10 rounded-full bg-white/10 text-white flex items-center justify-center cursor-pointer"
              aria-label="Fechar imagem"
            >
              <X className="w-5 h-5" />
            </button>
            <img
              src={lightboxImage}
              alt="Foto ampliada"
              className="max-w-full max-h-[85vh] rounded-2xl shadow-2xl object-contain"
              onClick={(e) => e.stopPropagation()}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};
