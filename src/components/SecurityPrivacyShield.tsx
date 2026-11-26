import React, { useEffect, useRef, useState } from 'react';
import { ShieldAlert, Lock } from 'lucide-react';
import { useApp } from '../context/AppContext';
import {
  clearSecurityGrace,
  isFilePickerGraceActive,
  isSecurityGraceActive,
} from '../utils/privacySecurity';

export const SecurityPrivacyShield: React.FC = () => {
  const { lockApp, isLocked, showToast } = useApp();
  const [isPrivacyCurtainOpen, setIsPrivacyCurtainOpen] = useState<boolean>(false);
  const [curtainReason, setCurtainReason] = useState<string>(
    'Conteúdo protegido — captura de tela e download bloqueados.'
  );

  const curtainTimerRef = useRef<number | null>(null);
  const blurLockTimerRef = useRef<number | null>(null);
  const hiddenWithGraceAtRef = useRef<number | null>(null);

  const lockAppRef = useRef(lockApp);
  lockAppRef.current = lockApp;
  const isLockedRef = useRef(isLocked);
  isLockedRef.current = isLocked;
  const showToastRef = useRef(showToast);
  showToastRef.current = showToast;

  const flashCurtain = (reason: string, durationMs = 2000) => {
    setCurtainReason(reason);
    setIsPrivacyCurtainOpen(true);
    if (curtainTimerRef.current) window.clearTimeout(curtainTimerRef.current);
    curtainTimerRef.current = window.setTimeout(() => {
      if (document.visibilityState === 'visible' && document.hasFocus()) {
        setIsPrivacyCurtainOpen(false);
      }
      curtainTimerRef.current = null;
    }, durationMs);
  };

  useEffect(() => {
    const isEditableTarget = (target: EventTarget | null) => {
      if (!(target instanceof HTMLElement)) return false;
      const tag = target.tagName;
      return tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT' || target.isContentEditable;
    };

    const handleContextMenu = (e: MouseEvent) => {
      if (isEditableTarget(e.target)) return;
      e.preventDefault();
      e.stopPropagation();
    };

    const handleDragStart = (e: DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
    };

    const handleCopy = (e: ClipboardEvent) => {
      if (isEditableTarget(e.target)) return;
      e.preventDefault();
    };

    const handleKeyGuard = (e: KeyboardEvent) => {
      const keyLower = (e.key || '').toLowerCase();
      const isCtrlOrMeta = e.ctrlKey || e.metaKey;

      const isPrintScreen =
        e.key === 'PrintScreen' || e.code === 'PrintScreen' || e.keyCode === 44;

      const isPrintOrSave =
        isCtrlOrMeta && (keyLower === 'p' || keyLower === 's' || keyLower === 'u');

      const isScreenGrabShortcut =
        isCtrlOrMeta &&
        e.shiftKey &&
        (keyLower === 's' || keyLower === '3' || keyLower === '4' || keyLower === '5');

      const isDevToolsShortcut =
        e.key === 'F12' ||
        (isCtrlOrMeta && e.shiftKey && (keyLower === 'i' || keyLower === 'j' || keyLower === 'c'));

      if (isPrintScreen || isPrintOrSave || isScreenGrabShortcut || isDevToolsShortcut) {
        e.preventDefault();
        e.stopPropagation();
        if (isPrintScreen && navigator.clipboard?.writeText) {
          navigator.clipboard.writeText('').catch(() => {});
        }
        flashCurtain('Print, impressão e salvamento de tela bloqueados por segurança.', 2200);
        if (!isLockedRef.current) {
          showToastRef.current('Ação bloqueada: print e download não permitidos.', 'lock');
        }
      }
    };

    const handleBeforePrint = (e: Event) => {
      e.preventDefault();
      flashCurtain('Impressão bloqueada por segurança.', 2500);
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden') {
        setCurtainReason('Aplicativo protegido enquanto em segundo plano.');
        setIsPrivacyCurtainOpen(true);

        if (isFilePickerGraceActive()) {
          hiddenWithGraceAtRef.current = Date.now();
          return;
        }

        hiddenWithGraceAtRef.current = null;
        if (!isLockedRef.current) {
          lockAppRef.current();
        }
      } else {
        const hadGraceTimestamp = hiddenWithGraceAtRef.current;
        hiddenWithGraceAtRef.current = null;

        if (hadGraceTimestamp !== null) {
          const awayMs = Date.now() - hadGraceTimestamp;
          if (awayMs > 45_000 && !isLockedRef.current) {
            lockAppRef.current();
          }
          window.setTimeout(() => clearSecurityGrace(), 500);
        }

        if (document.hasFocus()) {
          setIsPrivacyCurtainOpen(false);
        }
      }
    };

    const handlePageExit = () => {
      setCurtainReason('Sessão protegida com senha.');
      setIsPrivacyCurtainOpen(true);
      if (!isLockedRef.current) {
        lockAppRef.current();
      }
    };

    const handleWindowBlur = () => {
      setCurtainReason('Tela ocultada automaticamente ao sair da janela.');
      setIsPrivacyCurtainOpen(true);

      if (blurLockTimerRef.current) window.clearTimeout(blurLockTimerRef.current);
      if (isSecurityGraceActive() || isLockedRef.current) return;

      blurLockTimerRef.current = window.setTimeout(() => {
        blurLockTimerRef.current = null;
        if (!document.hasFocus() && !isSecurityGraceActive() && !isLockedRef.current) {
          lockAppRef.current();
        }
      }, 1100);
    };

    const handleWindowFocus = () => {
      if (blurLockTimerRef.current) {
        window.clearTimeout(blurLockTimerRef.current);
        blurLockTimerRef.current = null;
      }
      if (document.visibilityState === 'visible') {
        setIsPrivacyCurtainOpen(false);
      }
      if (isSecurityGraceActive()) {
        window.setTimeout(() => clearSecurityGrace(), 500);
      }
    };

    window.addEventListener('contextmenu', handleContextMenu, true);
    window.addEventListener('dragstart', handleDragStart, true);
    document.addEventListener('copy', handleCopy, true);
    window.addEventListener('keydown', handleKeyGuard, true);
    window.addEventListener('keyup', handleKeyGuard, true);
    window.addEventListener('beforeprint', handleBeforePrint, true);
    document.addEventListener('visibilitychange', handleVisibilityChange, true);
    window.addEventListener('pagehide', handlePageExit, true);
    window.addEventListener('beforeunload', handlePageExit, true);
    window.addEventListener('blur', handleWindowBlur, true);
    window.addEventListener('focus', handleWindowFocus, true);

    return () => {
      if (curtainTimerRef.current) window.clearTimeout(curtainTimerRef.current);
      if (blurLockTimerRef.current) window.clearTimeout(blurLockTimerRef.current);
      window.removeEventListener('contextmenu', handleContextMenu, true);
      window.removeEventListener('dragstart', handleDragStart, true);
      document.removeEventListener('copy', handleCopy, true);
      window.removeEventListener('keydown', handleKeyGuard, true);
      window.removeEventListener('keyup', handleKeyGuard, true);
      window.removeEventListener('beforeprint', handleBeforePrint, true);
      document.removeEventListener('visibilitychange', handleVisibilityChange, true);
      window.removeEventListener('pagehide', handlePageExit, true);
      window.removeEventListener('beforeunload', handlePageExit, true);
      window.removeEventListener('blur', handleWindowBlur, true);
      window.removeEventListener('focus', handleWindowFocus, true);
    };
  }, []);

  if (!isPrivacyCurtainOpen) return null;

  return (
    <div
      id="security-privacy-curtain"
      onContextMenu={(e) => e.preventDefault()}
      className="fixed inset-0 z-[9999] bg-[#04010a] flex flex-col items-center justify-center p-6 text-center select-none"
    >
      <div className="w-16 h-16 rounded-3xl bg-purple-950/80 border border-pink-500/40 flex items-center justify-center mb-4 shadow-[0_0_30px_rgba(236,72,153,0.3)]">
        {isLocked ? (
          <Lock className="w-8 h-8 text-pink-400" />
        ) : (
          <ShieldAlert className="w-8 h-8 text-pink-400" />
        )}
      </div>
      <h2 className="text-lg font-bold text-white font-display mb-1">
        Nosso Mundo ♡ Protegido
      </h2>
      <p className="text-xs text-purple-200/80 max-w-xs leading-relaxed">
        {curtainReason}
      </p>
    </div>
  );
};
