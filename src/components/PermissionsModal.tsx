import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'motion/react';
import { Bell, Camera, CheckCircle2, Mic, ShieldCheck, X } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { soundEngine } from '../utils/audioSynth';

type PermStatus = 'granted' | 'denied' | 'prompt' | 'unsupported';

export const PermissionsModal: React.FC = () => {
  const {
    isPermissionsModalOpen,
    setIsPermissionsModalOpen,
    dismissPermissionsPrompt,
    notificationPermission,
    requestNotificationPermission,
    showToast,
  } = useApp();

  const [micStatus, setMicStatus] = useState<PermStatus>('prompt');
  const [camStatus, setCamStatus] = useState<PermStatus>('prompt');
  const [busyKey, setBusyKey] = useState<'mic' | 'cam' | 'notif' | 'all' | null>(null);

  useEffect(() => {
    if (!isPermissionsModalOpen) return;

    const queryBrowserPerm = async (name: 'microphone' | 'camera', setter: (s: PermStatus) => void) => {
      if (typeof navigator === 'undefined' || !navigator.mediaDevices?.getUserMedia) {
        setter('unsupported');
        return;
      }
      try {
        if ('permissions' in navigator && typeof navigator.permissions.query === 'function') {
          const res = await navigator.permissions.query({ name: name as PermissionName });
          if (res.state === 'granted' || res.state === 'denied' || res.state === 'prompt') {
            setter(res.state);
          }
        }
      } catch {
        // Ignore on browsers that do not support permissions.query for camera/mic
      }
    };

    queryBrowserPerm('microphone', setMicStatus);
    queryBrowserPerm('camera', setCamStatus);
  }, [isPermissionsModalOpen]);

  const requestMicrophone = async (): Promise<boolean> => {
    if (typeof navigator === 'undefined' || !navigator.mediaDevices?.getUserMedia) {
      setMicStatus('unsupported');
      showToast('Microfone indisponível neste navegador.', 'mic');
      return false;
    }
    setBusyKey('mic');
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      stream.getTracks().forEach((t) => t.stop());
      setMicStatus('granted');
      soundEngine.playSparkle();
      showToast('Microfone ativado! Áudios no chat liberados ♡', 'sparkles');
      return true;
    } catch {
      setMicStatus('denied');
      showToast('Permissão de microfone recusada no navegador.', 'mic');
      return false;
    } finally {
      setBusyKey(null);
    }
  };

  const requestCamera = async (): Promise<boolean> => {
    if (typeof navigator === 'undefined' || !navigator.mediaDevices?.getUserMedia) {
      setCamStatus('unsupported');
      showToast('Câmera indisponível neste navegador.', 'camera');
      return false;
    }
    setBusyKey('cam');
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      stream.getTracks().forEach((t) => t.stop());
      setCamStatus('granted');
      soundEngine.playSparkle();
      showToast('Câmera ativada para registrar momentos ♡', 'camera');
      return true;
    } catch {
      setCamStatus('denied');
      showToast('Permissão de câmera recusada no navegador.', 'camera');
      return false;
    } finally {
      setBusyKey(null);
    }
  };

  const requestNotifs = async () => {
    setBusyKey('notif');
    try {
      await requestNotificationPermission();
    } finally {
      setBusyKey(null);
    }
  };

  const activateAll = async () => {
    setBusyKey('all');
    try {
      if (micStatus !== 'granted') await requestMicrophone();
      if (camStatus !== 'granted') await requestCamera();
      if (notificationPermission !== 'granted') await requestNotificationPermission();
    } finally {
      setBusyKey(null);
    }
  };

  const renderStatusPill = (status: PermStatus | NotificationPermission | 'default') => {
    if (status === 'granted') {
      return (
        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-400/35 inline-flex items-center gap-1">
          <CheckCircle2 className="w-3 h-3" />
          Ativado
        </span>
      );
    }
    if (status === 'denied') {
      return (
        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-500/20 text-rose-300 border border-rose-400/35">
          Bloqueado no navegador
        </span>
      );
    }
    if (status === 'unsupported') {
      return (
        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-white/10 text-purple-300/70 border border-white/10">
          Indisponível
        </span>
      );
    }
    return (
      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-200 border border-amber-400/35">
        Pendente
      </span>
    );
  };

  if (typeof document === 'undefined') return null;

  return createPortal(
    <AnimatePresence>
      {isPermissionsModalOpen && (
        <div
          className="fixed inset-0 z-[95] bg-black/85 backdrop-blur-md flex items-center justify-center p-4"
          onClick={() => dismissPermissionsPrompt()}
        >
          <motion.div
            initial={{ scale: 0.93, opacity: 0, y: 14 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.93, opacity: 0, y: 14 }}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-md rounded-3xl p-5 sm:p-6 bg-gradient-to-b from-[#1e0939] via-[#120424] to-[#080214] border border-pink-400/45 shadow-[0_20px_60px_rgba(236,72,153,0.3)] space-y-4 text-white"
          >
            {/* Header */}
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-pink-600 to-purple-600 flex items-center justify-center shadow-lg shrink-0">
                  <ShieldCheck className="w-5 h-5 text-white" />
                </div>
                <div>
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-pink-300 block">
                    Aviso Importante do Casal ♡
                  </span>
                  <h3 className="text-base sm:text-lg font-extrabold text-white leading-tight mt-0.5">
                    GABRIEL MANDOU AVISAR QUE É PRA ATIVAR
                  </h3>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsPermissionsModalOpen(false)}
                className="min-w-[38px] min-h-[38px] rounded-xl bg-white/10 text-purple-200 hover:text-white flex items-center justify-center cursor-pointer shrink-0"
                aria-label="Fechar avisos de permissões"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-purple-200/80 leading-relaxed">
              Para o aplicativo funcionar 100% no seu celular com recados de voz, fotos instantâneas e alertas quando o Gabriel responder no chat, ative estas permissões:
            </p>

            {/* Permission rows */}
            <div className="space-y-2.5">
              {/* Microphone */}
              <div className="p-3 rounded-2xl bg-purple-950/60 border border-purple-500/25 flex items-center justify-between gap-3">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-9 h-9 rounded-xl bg-pink-500/20 border border-pink-400/35 flex items-center justify-center text-pink-300 shrink-0">
                    <Mic className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="text-xs font-bold text-white">Microfone</span>
                      {renderStatusPill(micStatus)}
                    </div>
                    <p className="text-[11px] text-purple-200/70 truncate">
                      Mensagens de voz no Chat do Casal
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  disabled={busyKey !== null || micStatus === 'granted'}
                  onClick={requestMicrophone}
                  className="min-h-[40px] px-3 rounded-xl bg-pink-600 hover:bg-pink-500 text-white text-xs font-bold shrink-0 cursor-pointer disabled:opacity-50"
                >
                  {micStatus === 'granted' ? 'OK' : 'Ativar'}
                </button>
              </div>

              {/* Camera */}
              <div className="p-3 rounded-2xl bg-purple-950/60 border border-purple-500/25 flex items-center justify-between gap-3">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-9 h-9 rounded-xl bg-purple-500/20 border border-purple-400/35 flex items-center justify-center text-purple-200 shrink-0">
                    <Camera className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="text-xs font-bold text-white">Câmera</span>
                      {renderStatusPill(camStatus)}
                    </div>
                    <p className="text-[11px] text-purple-200/70 truncate">
                      Registrar e enviar fotos dos nossos momentos
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  disabled={busyKey !== null || camStatus === 'granted'}
                  onClick={requestCamera}
                  className="min-h-[40px] px-3 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold shrink-0 cursor-pointer disabled:opacity-50"
                >
                  {camStatus === 'granted' ? 'OK' : 'Ativar'}
                </button>
              </div>

              {/* Notifications */}
              <div className="p-3 rounded-2xl bg-purple-950/60 border border-purple-500/25 flex items-center justify-between gap-3">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-9 h-9 rounded-xl bg-amber-500/20 border border-amber-400/35 flex items-center justify-center text-amber-300 shrink-0">
                    <Bell className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="text-xs font-bold text-white">Notificações</span>
                      {renderStatusPill(notificationPermission)}
                    </div>
                    <p className="text-[11px] text-purple-200/70 truncate">
                      Avisos instantâneos das mensagens do Gabriel
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  disabled={busyKey !== null || notificationPermission === 'granted'}
                  onClick={requestNotifs}
                  className="min-h-[40px] px-3 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold shrink-0 cursor-pointer disabled:opacity-50"
                >
                  {notificationPermission === 'granted' ? 'OK' : 'Ativar'}
                </button>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-2 pt-1">
              <button
                type="button"
                disabled={busyKey !== null}
                onClick={activateAll}
                className="flex-1 min-h-[44px] rounded-2xl bg-gradient-to-r from-pink-600 to-purple-600 text-white text-xs font-bold shadow-lg cursor-pointer hover:brightness-110 active:scale-[0.99] disabled:opacity-60"
              >
                Ativar Tudo Agora ♡
              </button>
              <button
                type="button"
                onClick={dismissPermissionsPrompt}
                className="min-h-[44px] px-4 rounded-2xl bg-white/10 hover:bg-white/15 text-purple-100 text-xs font-semibold cursor-pointer"
              >
                Já ativei / Fechar
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body
  );
};
