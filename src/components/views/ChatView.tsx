import React, { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import {
  Bell,
  BellRing,
  Camera,
  Check,
  CheckCheck,
  Eye,
  EyeOff,
  Flame,
  Heart,
  Image as ImageIcon,
  Lock,
  Mic,
  Pause,
  Play,
  Send,
  Shield,
  Sparkles,
  Square,
  Trash2,
  X,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { AnimatePresence, motion } from 'motion/react';
import { soundEngine } from '../../utils/audioSynth';
import { getCouplePhotoUrl } from '../../data/mediaAssets';
import { ChatMessage } from '../../types';
import { ProtectedCanvasPhoto } from '../ProtectedCanvasPhoto';
import { markFilePickerOpen, markSystemPromptOpen } from '../../utils/privacySecurity';

const QUICK_REPLIES = [
  'Te amo demais ♡',
  'Tô com saudade de você!',
  'Pensei em você agora ♡',
  'Você é meu lugar favorito ♡',
];

async function compressChatImage(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.onload = () => {
        const maxDim = 820;
        let { width, height } = img;
        if (width > maxDim || height > maxDim) {
          if (width > height) {
            height = Math.round((height * maxDim) / width);
            width = maxDim;
          } else {
            width = Math.round((width * maxDim) / height);
            height = maxDim;
          }
        }
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(reader.result as string);
          return;
        }
        ctx.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL('image/jpeg', 0.78));
      };
      img.onerror = reject;
      img.src = reader.result as string;
    };
    reader.onerror = reject;
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
      el.play().catch(() => {});
      setPlaying(true);
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
    consumeViewOnceMessage,
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
  const [pendingPhotoDraft, setPendingPhotoDraft] = useState<{
    dataUrl: string;
    mode: 'view-once' | 'normal';
    caption: string;
  } | null>(null);
  const [activeViewOnceMsg, setActiveViewOnceMsg] = useState<ChatMessage | null>(null);

  // Voice recording state
  const [isRecording, setIsRecording] = useState(false);
  const [recordSeconds, setRecordSeconds] = useState(0);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const recordTimerRef = useRef<number | null>(null);
  const recordCancelledRef = useRef<boolean>(false);
  const activeViewOnceRef = useRef<ChatMessage | null>(null);
  activeViewOnceRef.current = activeViewOnceMsg;

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const bottomRef = useRef<HTMLDivElement | null>(null);

  const effectiveRole: 'eu' | 'ela' = isSpectator ? 'eu' : senderRole;
  const peerRoleKey: 'Gabriel' | 'Samella' = isSpectator ? 'Samella' : 'Gabriel';
  const isPeerOnline = Boolean(onlinePeers?.[peerRoleKey]);
  const peerDisplayName = isSpectator ? config.partnerName || 'Samella' : config.myName || 'Gabriel';
  const watermarkLabel = `${config.myName || 'Gabriel'} & ${config.partnerName || 'Samella'} ♡`;

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
      if (activeViewOnceRef.current) {
        consumeViewOnceMessage(activeViewOnceRef.current.id).catch(() => {});
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
    try {
      const compressedUrl = await compressChatImage(file);
      setPendingPhotoDraft({
        dataUrl: compressedUrl,
        mode: 'view-once',
        caption: '',
      });
    } catch {
      showToast('Não foi possível preparar esta foto.', 'camera');
    }
  };

  const handleConfirmSendPhoto = async () => {
    if (!pendingPhotoDraft || isSending) return;
    const draft = pendingPhotoDraft;
    setPendingPhotoDraft(null);
    setIsSending(true);
    try {
      await sendChatMessage({
        text: draft.caption.trim() || 'Fotografia',
        senderRole: effectiveRole,
        msgType: 'image',
        mediaUrl: draft.dataUrl,
        isViewOnce: draft.mode === 'view-once',
      });
      triggerHeartExplosion();
    } catch {
      showToast('Não foi possível enviar a foto.', 'camera');
    } finally {
      setIsSending(false);
    }
  };

  const handleCloseViewOnce = async () => {
    const current = activeViewOnceMsg;
    if (!current) return;
    setActiveViewOnceMsg(null);
    await consumeViewOnceMessage(current.id);
  };

  const startVoiceRecording = async () => {
    if (!navigator.mediaDevices?.getUserMedia) {
      showToast('Microfone não suportado neste navegador.', 'chat');
      return;
    }
    try {
      markSystemPromptOpen(15_000);
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mimeType = MediaRecorder.isTypeSupported('audio/webm;codecs=opus')
        ? 'audio/webm;codecs=opus'
        : MediaRecorder.isTypeSupported('audio/mp4')
        ? 'audio/mp4'
        : 'audio/webm';
      const recorder = new MediaRecorder(stream, { mimeType });
      mediaRecorderRef.current = recorder;
      audioChunksRef.current = [];
      recordCancelledRef.current = false;
      setRecordSeconds(0);
      setIsRecording(true);

      const startedAt = Date.now();
      recordTimerRef.current = window.setInterval(() => {
        setRecordSeconds(Math.floor((Date.now() - startedAt) / 1000));
      }, 400);

      recorder.ondataavailable = (ev) => {
        if (ev.data.size > 0) audioChunksRef.current.push(ev.data);
      };

      recorder.onstop = () => {
        stream.getTracks().forEach((t) => t.stop());
        if (recordTimerRef.current) {
          window.clearInterval(recordTimerRef.current);
          recordTimerRef.current = null;
        }
        setIsRecording(false);
        if (recordCancelledRef.current) return;

        const blob = new Blob(audioChunksRef.current, { type: mimeType });
        if (blob.size < 400) return;

        const durSec = Math.max(1, Math.round((Date.now() - startedAt) / 1000));
        const durLabel = `0:${durSec < 10 ? '0' : ''}${durSec}`;
        const reader = new FileReader();
        reader.onloadend = async () => {
          const base64Audio = reader.result as string;
          setIsSending(true);
          try {
            await sendChatMessage({
              text: 'Mensagem de voz',
              senderRole: effectiveRole,
              msgType: 'audio',
              mediaUrl: base64Audio,
              audioDuration: durLabel,
            });
          } finally {
            setIsSending(false);
          }
        };
        reader.readAsDataURL(blob);
      };

      recorder.start();
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
      <div className="rounded-t-3xl px-4 py-3 bg-[#15072b]/95 border border-purple-500/30 border-b-0 flex items-center justify-between gap-2 shadow-lg flex-shrink-0">
        <div className="flex items-center gap-3 min-w-0">
          <div className="relative flex-shrink-0">
            {getCouplePhotoUrl(photos, 0) ? (
              <img
                src={getCouplePhotoUrl(photos, 0)}
                alt={peerDisplayName}
                draggable={false}
                className="w-10 h-10 rounded-full object-cover border border-pink-400/50 pointer-events-none"
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
              <span className="text-purple-400/60">•</span>
              <span className="text-pink-300/80 inline-flex items-center gap-1">
                <Shield className="w-3 h-3" />
                Protegido
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

      {/* Blurred Stylized Sunset Beach Wallpaper + Messages Feed */}
      <div className="relative flex-1 overflow-hidden border-x border-purple-500/30 bg-[#0d051a]">
        <svg
          viewBox="0 0 400 700"
          preserveAspectRatio="xMidYMid slice"
          className="absolute inset-0 w-full h-full pointer-events-none select-none scale-105 blur-[5px] opacity-75"
          aria-hidden="true"
        >
          <defs>
            <linearGradient id="chatBeachSky" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#1e0b36" />
              <stop offset="32%" stopColor="#581c5c" />
              <stop offset="56%" stopColor="#be346b" />
              <stop offset="72%" stopColor="#f97352" />
              <stop offset="100%" stopColor="#fbbf77" />
            </linearGradient>
            <linearGradient id="chatBeachSea" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#431c53" />
              <stop offset="45%" stopColor="#271242" />
              <stop offset="100%" stopColor="#0f071f" />
            </linearGradient>
            <radialGradient id="chatBeachSun" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#fff3c4" />
              <stop offset="45%" stopColor="#fca55c" />
              <stop offset="100%" stopColor="#f43f7f" stopOpacity="0" />
            </radialGradient>
          </defs>

          <rect width="400" height="440" fill="url(#chatBeachSky)" />
          <circle cx="205" cy="370" r="105" fill="url(#chatBeachSun)" />
          <circle cx="205" cy="370" r="44" fill="#ffe6a7" opacity="0.92" />

          <rect y="395" width="400" height="190" fill="url(#chatBeachSea)" />
          <ellipse cx="205" cy="410" rx="55" ry="6" fill="#fbb67d" opacity="0.55" />
          <ellipse cx="205" cy="432" rx="42" ry="5" fill="#f98b78" opacity="0.45" />
          <ellipse cx="205" cy="456" rx="28" ry="4" fill="#e86f8c" opacity="0.35" />

          <path d="M0 570 Q180 545 400 585 L400 700 L0 700 Z" fill="#180a29" />
          <path d="M0 568 Q180 542 400 583" stroke="#d9778b" strokeWidth="2.5" fill="none" opacity="0.5" />

          <path d="M25 700 Q48 520 75 430" stroke="#11041d" strokeWidth="14" fill="none" strokeLinecap="round" />
          <path d="M75 430 Q15 415 -5 450" stroke="#11041d" strokeWidth="10" fill="none" strokeLinecap="round" />
          <path d="M75 430 Q35 380 8 395" stroke="#11041d" strokeWidth="9" fill="none" strokeLinecap="round" />
          <path d="M75 430 Q125 385 162 412" stroke="#11041d" strokeWidth="10" fill="none" strokeLinecap="round" />
          <path d="M75 430 Q140 425 168 462" stroke="#11041d" strokeWidth="9" fill="none" strokeLinecap="round" />
        </svg>

        <div className="absolute inset-0 bg-[#0c041a]/48 backdrop-blur-[2px] pointer-events-none" />

        {/* Scrollable Chat Thread */}
        <div className="relative z-10 h-full overflow-y-auto p-3.5 sm:p-4 space-y-2.5">
          {chatMessages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center text-purple-100/80 space-y-2 py-8">
              <Sparkles className="w-7 h-7 text-pink-300" />
              <p className="text-sm font-medium bg-black/35 px-4 py-2 rounded-2xl border border-white/10">
                Envie uma mensagem, áudio ou foto para inaugurar o chat ♡
              </p>
            </div>
          ) : (
            chatMessages.map((msg) => {
              const isFromMeOnScreen = msg.sender === mySenderMarker;
              const isGabriel = msg.sender === 'me';
              const displayName = msg.senderName || (isGabriel ? config.myName : config.partnerName);
              const isRead = msg.status === 'read' || Boolean(msg.readAt);
              const isViewOnce = Boolean(msg.msgType === 'image' && msg.isViewOnce);

              return (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, y: 6, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{ duration: 0.18 }}
                  className={`flex flex-col ${isFromMeOnScreen ? 'items-end' : 'items-start'}`}
                >
                  <div
                    className={`max-w-[82%] rounded-2xl px-3.5 py-2 shadow-lg backdrop-blur-md ${
                      isFromMeOnScreen
                        ? 'bg-gradient-to-tr from-[#6d28d9]/92 to-[#a21caf]/92 border border-pink-300/35 text-white rounded-tr-sm'
                        : 'bg-[#1a0b33]/92 border border-purple-400/30 text-white rounded-tl-sm'
                    }`}
                  >
                    <span className="block text-[10px] font-bold text-pink-200/90 mb-0.5">
                      {displayName}
                    </span>

                    {/* View-Once Photo States */}
                    {isViewOnce ? (
                      msg.viewOnceOpened || !msg.mediaUrl ? (
                        <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-black/25 border border-white/10 text-xs text-purple-200/75 italic my-0.5">
                          <EyeOff className="w-4 h-4 text-purple-300/70 shrink-0" />
                          <span>Foto de visualização única aberta</span>
                        </div>
                      ) : isFromMeOnScreen ? (
                        <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white/10 border border-pink-300/25 text-xs text-pink-100 my-0.5">
                          <div className="w-6 h-6 rounded-full bg-pink-500/30 border border-pink-300/40 flex items-center justify-center text-[10px] font-bold">
                            1
                          </div>
                          <span>Foto enviada (visualização única)</span>
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={() => {
                            soundEngine.playHeartPop();
                            setActiveViewOnceMsg(msg);
                          }}
                          className="flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl bg-gradient-to-r from-pink-600/40 to-purple-600/40 hover:from-pink-600/60 hover:to-purple-600/60 border border-pink-400/50 text-xs font-bold text-white my-0.5 cursor-pointer transition active:scale-[0.98]"
                        >
                          <div className="w-7 h-7 rounded-full bg-pink-500 text-white flex items-center justify-center text-[11px] font-extrabold shadow">
                            1
                          </div>
                          <div className="text-left">
                            <span className="block text-xs font-bold text-white">
                              Foto de visualização única
                            </span>
                            <span className="block text-[10px] text-pink-200/85 font-normal">
                              Toque para abrir uma vez
                            </span>
                          </div>
                          <Flame className="w-4 h-4 text-pink-300 shrink-0" />
                        </button>
                      )
                    ) : (
                      msg.msgType === 'image' &&
                      msg.mediaUrl && (
                        <button
                          type="button"
                          onContextMenu={(e) => e.preventDefault()}
                          onClick={() => setLightboxImage(msg.mediaUrl!)}
                          className="relative block rounded-xl overflow-hidden mb-1.5 border border-white/20 cursor-pointer max-w-[230px]"
                        >
                          <img
                            src={msg.mediaUrl}
                            alt="Foto no chat"
                            draggable={false}
                            className="w-full max-h-60 object-cover pointer-events-none select-none"
                          />
                        </button>
                      )
                    )}

                    {msg.msgType === 'audio' && msg.mediaUrl ? (
                      <AudioBubblePlayer src={msg.mediaUrl} duration={msg.audioDuration} />
                    ) : (
                      !isViewOnce &&
                      msg.text &&
                      !(msg.msgType === 'image' && msg.text === 'Fotografia') && (
                        <p className="text-xs sm:text-sm leading-relaxed break-words">{msg.text}</p>
                      )
                    )}

                    <div className="flex items-center justify-end gap-1 mt-1 text-[10px] text-white/70">
                      <span>{msg.time}</span>
                      {isFromMeOnScreen && (
                        isRead ? (
                          <CheckCheck className="w-3.5 h-3.5 text-cyan-300" aria-label="Visto" />
                        ) : msg.status === 'delivered' ? (
                          <CheckCheck className="w-3.5 h-3.5 text-white/60" aria-label="Entregue" />
                        ) : (
                          <Check className="w-3.5 h-3.5 text-white/60" aria-label="Enviada" />
                        )
                      )}
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
      <div className="rounded-b-3xl bg-[#15072b]/95 border border-purple-500/30 border-t-purple-500/20 p-2.5 space-y-2 flex-shrink-0">
        {/* Quick Presets */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
          {QUICK_REPLIES.map((preset) => (
            <button
              key={preset}
              type="button"
              onClick={() => handleQuickSend(preset)}
              className="px-3 py-1 rounded-full bg-purple-950/80 hover:bg-pink-500/25 border border-purple-400/25 text-[11px] font-medium text-purple-200 hover:text-white whitespace-nowrap transition cursor-pointer shrink-0"
            >
              {preset}
            </button>
          ))}
        </div>

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
              onClick={() => {
                markFilePickerOpen();
                fileInputRef.current?.click();
              }}
              disabled={isSending}
              aria-label="Enviar foto"
              className="w-11 h-11 rounded-2xl bg-purple-950/80 hover:bg-purple-900 border border-purple-400/30 flex items-center justify-center text-pink-300 flex-shrink-0 cursor-pointer transition"
            >
              <Camera className="w-5 h-5" />
            </button>

            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder={`Mensagem como ${effectiveRole === 'eu' ? config.myName : config.partnerName}...`}
              className="flex-1 min-h-[44px] px-3.5 py-2.5 rounded-2xl bg-purple-950/85 border border-purple-500/30 text-sm text-white placeholder-purple-400/50 focus:outline-none focus:border-pink-400"
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

      {/* Pre-Send Photo Mode Choice Modal (Visualização Única vs Normal) */}
      {typeof document !== 'undefined' &&
        createPortal(
          <AnimatePresence>
            {pendingPhotoDraft && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onContextMenu={(e) => e.preventDefault()}
                className="fixed inset-0 z-[95] bg-black/90 backdrop-blur-md flex items-center justify-center p-4"
                onClick={() => setPendingPhotoDraft(null)}
              >
                <motion.div
                  initial={{ scale: 0.94, opacity: 0, y: 12 }}
                  animate={{ scale: 1, opacity: 1, y: 0 }}
                  exit={{ scale: 0.94, opacity: 0, y: 12 }}
                  onClick={(e) => e.stopPropagation()}
                  className="w-full max-w-md rounded-3xl bg-[#130526] border border-pink-400/40 p-5 shadow-2xl space-y-4"
                >
                  <div className="flex items-center justify-between border-b border-purple-500/20 pb-2.5">
                    <div className="flex items-center gap-2">
                      <Camera className="w-4 h-4 text-pink-400" />
                      <h3 className="text-sm font-bold text-white">Escolher modo da foto ♡</h3>
                    </div>
                    <button
                      type="button"
                      onClick={() => setPendingPhotoDraft(null)}
                      className="p-1.5 rounded-full text-purple-300 hover:text-white cursor-pointer"
                      aria-label="Cancelar envio"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="rounded-2xl overflow-hidden bg-black/50 border border-purple-500/25 flex items-center justify-center h-52">
                    <ProtectedCanvasPhoto
                      src={pendingPhotoDraft.dataUrl}
                      alt="Prévia da foto"
                      watermarkText={watermarkLabel}
                      className="w-full h-full"
                    />
                  </div>

                  {/* Mode Selector */}
                  <div className="grid grid-cols-2 gap-2.5">
                    <button
                      type="button"
                      onClick={() =>
                        setPendingPhotoDraft((prev) =>
                          prev ? { ...prev, mode: 'view-once' } : null
                        )
                      }
                      className={`p-3 rounded-2xl border text-left transition cursor-pointer ${
                        pendingPhotoDraft.mode === 'view-once'
                          ? 'bg-gradient-to-br from-pink-600/35 to-purple-700/35 border-pink-400 shadow-[0_0_20px_rgba(236,72,153,0.3)]'
                          : 'bg-purple-950/50 border-purple-500/25 hover:border-purple-400/50'
                      }`}
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <span className="w-6 h-6 rounded-full bg-pink-500 text-white text-[11px] font-extrabold flex items-center justify-center">
                          1
                        </span>
                        <span className="text-xs font-bold text-white">Visualização única</span>
                      </div>
                      <p className="text-[11px] text-purple-200/80 leading-snug">
                        Só pode ser aberta uma vez e some ao fechar.
                      </p>
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        setPendingPhotoDraft((prev) =>
                          prev ? { ...prev, mode: 'normal' } : null
                        )
                      }
                      className={`p-3 rounded-2xl border text-left transition cursor-pointer ${
                        pendingPhotoDraft.mode === 'normal'
                          ? 'bg-gradient-to-br from-purple-600/35 to-indigo-700/35 border-purple-300 shadow-[0_0_20px_rgba(168,85,247,0.3)]'
                          : 'bg-purple-950/50 border-purple-500/25 hover:border-purple-400/50'
                      }`}
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <ImageIcon className="w-5 h-5 text-purple-300" />
                        <span className="text-xs font-bold text-white">Visualização normal</span>
                      </div>
                      <p className="text-[11px] text-purple-200/80 leading-snug">
                        Fica no chat (ainda sem download e sem print).
                      </p>
                    </button>
                  </div>

                  {pendingPhotoDraft.mode === 'normal' && (
                    <input
                      type="text"
                      value={pendingPhotoDraft.caption}
                      onChange={(e) =>
                        setPendingPhotoDraft((prev) =>
                          prev ? { ...prev, caption: e.target.value } : null
                        )
                      }
                      placeholder="Legenda opcional..."
                      className="w-full px-3.5 py-2.5 rounded-2xl bg-purple-950/80 border border-purple-500/30 text-xs text-white placeholder-purple-300/50 focus:outline-none focus:border-pink-400"
                    />
                  )}

                  <button
                    type="button"
                    onClick={handleConfirmSendPhoto}
                    disabled={isSending}
                    className="w-full py-3 rounded-2xl bg-gradient-to-r from-purple-600 via-pink-600 to-rose-500 text-white text-xs font-bold flex items-center justify-center gap-2 shadow-lg hover:brightness-110 active:scale-[0.99] transition cursor-pointer"
                  >
                    {pendingPhotoDraft.mode === 'view-once' ? (
                      <Eye className="w-4 h-4" />
                    ) : (
                      <Send className="w-4 h-4" />
                    )}
                    <span>
                      {pendingPhotoDraft.mode === 'view-once'
                        ? 'Enviar em Visualização Única'
                        : 'Enviar em Visualização Normal'}
                    </span>
                  </button>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>,
          document.body
        )}

      {/* Protected View-Once Fullscreen Reader */}
      {typeof document !== 'undefined' &&
        createPortal(
          <AnimatePresence>
            {activeViewOnceMsg && activeViewOnceMsg.mediaUrl && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onContextMenu={(e) => e.preventDefault()}
                onClick={handleCloseViewOnce}
                className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-2xl flex flex-col justify-between p-4 select-none"
              >
                <div
                  className="flex items-center justify-between gap-2 z-10"
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-pink-600/25 border border-pink-400/50 text-xs font-bold text-pink-200">
                    <Lock className="w-3.5 h-3.5" />
                    <span>Visualização única · Sem print ou download</span>
                  </div>
                  <button
                    type="button"
                    onClick={handleCloseViewOnce}
                    className="w-10 h-10 rounded-full bg-white/15 hover:bg-pink-600 text-white flex items-center justify-center cursor-pointer transition"
                    aria-label="Fechar foto única"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div
                  className="flex-1 flex flex-col items-center justify-center my-3 overflow-hidden"
                  onClick={(e) => e.stopPropagation()}
                >
                  <ProtectedCanvasPhoto
                    src={activeViewOnceMsg.mediaUrl}
                    alt="Foto de visualização única"
                    watermarkText={`${watermarkLabel} · 1x`}
                    className="max-w-[92vw] max-h-[74vh] w-full h-full"
                  />
                  {activeViewOnceMsg.text && activeViewOnceMsg.text !== 'Fotografia' && (
                    <p className="mt-3 text-sm text-white bg-black/60 px-4 py-2 rounded-2xl border border-white/15 max-w-md text-center">
                      {activeViewOnceMsg.text}
                    </p>
                  )}
                </div>

                <div className="text-center pb-2">
                  <button
                    type="button"
                    onClick={handleCloseViewOnce}
                    className="px-5 py-2.5 rounded-full bg-white/10 hover:bg-white/20 border border-white/15 text-xs font-semibold text-purple-100 cursor-pointer transition"
                  >
                    Fechar (esta foto desaparecerá ao sair)
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>,
          document.body
        )}

      {/* Normal Photo Protected Lightbox Modal */}
      {typeof document !== 'undefined' &&
        createPortal(
          <AnimatePresence>
            {lightboxImage && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onContextMenu={(e) => e.preventDefault()}
                onClick={() => setLightboxImage(null)}
                className="fixed inset-0 z-[95] bg-black/92 backdrop-blur-md flex items-center justify-center p-4 select-none"
              >
                <button
                  type="button"
                  onClick={() => setLightboxImage(null)}
                  className="absolute top-5 right-5 z-20 w-10 h-10 rounded-full bg-white/15 hover:bg-pink-600 text-white flex items-center justify-center cursor-pointer transition"
                  aria-label="Fechar imagem"
                >
                  <X className="w-5 h-5" />
                </button>
                <div
                  onClick={(e) => e.stopPropagation()}
                  className="max-w-[92vw] max-h-[85vh] flex items-center justify-center"
                >
                  <ProtectedCanvasPhoto
                    src={lightboxImage}
                    alt="Foto protegida do chat"
                    watermarkText={watermarkLabel}
                    className="max-w-[92vw] max-h-[85vh]"
                  />
                </div>
              </motion.div>
            )}
          </AnimatePresence>,
          document.body
        )}
    </motion.div>
  );
};
