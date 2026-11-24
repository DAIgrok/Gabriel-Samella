import React, { useEffect, useRef, useState } from 'react';
import { Phone, PhoneOff, Video, Check, X, Mic } from 'lucide-react';
import { subscribeCoupleCalls, type CoupleCallSignal } from '../../services/supabaseSync';
import { useApp } from '../../context/AppContext';

type CallState = 'idle' | 'incoming' | 'calling' | 'connected';

export const CoupleCallPanel: React.FC<{ isSpectator: boolean; peerName: string }> = ({ isSpectator, peerName }) => {
  const { showToast } = useApp();
  const [status, setStatus] = useState<CallState>('idle');
  const [kind, setKind] = useState<'audio' | 'video'>('audio');
  const [incomingKind, setIncomingKind] = useState<'audio' | 'video'>('audio');
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);
  const [error, setError] = useState('');
  const channelRef = useRef<ReturnType<typeof subscribeCoupleCalls> | null>(null);
  const pcRef = useRef<RTCPeerConnection | null>(null);
  const localRef = useRef<MediaStream | null>(null);
  const offerRef = useRef<RTCSessionDescriptionInit | null>(null);
  const iceQueueRef = useRef<RTCIceCandidateInit[]>([]);
  const remoteAudioRef = useRef<HTMLAudioElement | null>(null);
  const remoteVideoRef = useRef<HTMLVideoElement | null>(null);
  const localVideoRef = useRef<HTMLVideoElement | null>(null);

  const closeLocal = () => {
    pcRef.current?.close();
    pcRef.current = null;
    localRef.current?.getTracks().forEach((track) => track.stop());
    localRef.current = null;
    setLocalStream(null);
    setRemoteStream(null);
    offerRef.current = null;
    iceQueueRef.current = [];
    setStatus('idle');
  };

  const makePeer = (stream: MediaStream) => {
    const pc = new RTCPeerConnection({
      iceServers: [
        { urls: 'stun:stun.l.google.com:19302' },
        { urls: 'stun:stun1.l.google.com:19302' },
      ],
    });
    stream.getTracks().forEach((track) => pc.addTrack(track, stream));
    pc.onicecandidate = (event) => {
      if (event.candidate) {
        channelRef.current?.send({ type: 'ice', candidate: event.candidate.toJSON() }).catch(() => {
          setError('A conexão de chamada caiu.');
        });
      }
    };
    pc.ontrack = (event) => {
      if (event.streams[0]) setRemoteStream(event.streams[0]);
    };
    pc.onconnectionstatechange = () => {
      if (pc.connectionState === 'connected') setStatus('connected');
      if (pc.connectionState === 'failed') setError('A rede não conseguiu completar a chamada.');
    };
    pcRef.current = pc;
    return pc;
  };

  useEffect(() => {
    const role = isSpectator ? 'Gabriel' : 'Samella';
    const channel = subscribeCoupleCalls(role, async (signal: CoupleCallSignal) => {
      if (signal.type === 'offer' && signal.sdp) {
        offerRef.current = signal.sdp;
        setIncomingKind(signal.callKind || 'audio');
        setKind(signal.callKind || 'audio');
        setError('');
        setStatus('incoming');
      } else if (signal.type === 'answer' && signal.sdp && pcRef.current) {
        await pcRef.current.setRemoteDescription(new RTCSessionDescription(signal.sdp));
        for (const candidate of iceQueueRef.current.splice(0)) {
          await pcRef.current.addIceCandidate(new RTCIceCandidate(candidate)).catch(() => {});
        }
        setStatus('connected');
      } else if (signal.type === 'ice' && signal.candidate) {
        if (pcRef.current?.remoteDescription) {
          await pcRef.current.addIceCandidate(new RTCIceCandidate(signal.candidate)).catch(() => {});
        } else {
          iceQueueRef.current.push(signal.candidate);
        }
      } else if (signal.type === 'hangup' || signal.type === 'reject') {
        closeLocal();
        showToast(signal.type === 'reject' ? 'A chamada não foi atendida.' : 'A chamada foi encerrada.', 'chat');
      }
    });
    channelRef.current = channel;
    channel.ready.catch(() => setError('Não foi possível conectar as chamadas neste aparelho.'));
    return () => {
      channel.close();
      channelRef.current = null;
      closeLocal();
    };
  }, [isSpectator]);

  useEffect(() => {
    if (remoteAudioRef.current) remoteAudioRef.current.srcObject = kind === 'audio' ? remoteStream : null;
    if (remoteVideoRef.current) remoteVideoRef.current.srcObject = kind === 'video' ? remoteStream : null;
  }, [remoteStream, kind]);

  useEffect(() => {
    if (localVideoRef.current) localVideoRef.current.srcObject = localStream;
  }, [localStream]);

  const getMedia = async (video: boolean) => {
    return navigator.mediaDevices.getUserMedia({
      audio: { echoCancellation: true, noiseSuppression: true, autoGainControl: true },
      video: video ? { facingMode: 'user' } : false,
    });
  };

  const start = async (nextKind: 'audio' | 'video') => {
    if (status !== 'idle') return;
    if (!navigator.mediaDevices?.getUserMedia) {
      setError('Este navegador não oferece câmera/microfone.');
      return;
    }
    setError('');
    try {
      await channelRef.current?.ready;
      const stream = await getMedia(nextKind === 'video');
      localRef.current = stream;
      setLocalStream(stream);
      setKind(nextKind);
      const pc = makePeer(stream);
      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);
      await channelRef.current?.send({ type: 'offer', callKind: nextKind, sdp: pc.localDescription || offer });
      setStatus('calling');
    } catch {
      closeLocal();
      setError('Não foi possível iniciar. Verifique as permissões de câmera e microfone.');
    }
  };

  const accept = async () => {
    if (!offerRef.current) return;
    try {
      await channelRef.current?.ready;
      const stream = await getMedia(incomingKind === 'video');
      localRef.current = stream;
      setLocalStream(stream);
      setKind(incomingKind);
      const pc = makePeer(stream);
      await pc.setRemoteDescription(new RTCSessionDescription(offerRef.current));
      for (const candidate of iceQueueRef.current.splice(0)) {
        await pc.addIceCandidate(new RTCIceCandidate(candidate)).catch(() => {});
      }
      const answer = await pc.createAnswer();
      await pc.setLocalDescription(answer);
      await channelRef.current?.send({ type: 'answer', callKind: incomingKind, sdp: pc.localDescription || answer });
      setStatus('connected');
    } catch {
      closeLocal();
      setError('Não foi possível atender. Confira as permissões de câmera e microfone.');
    }
  };

  const hangup = () => {
    channelRef.current?.send({ type: 'hangup' }).catch(() => {});
    closeLocal();
  };

  const decline = () => {
    channelRef.current?.send({ type: 'reject' }).catch(() => {});
    closeLocal();
  };

  return (
    <section className="rounded-xl border border-sky-300/15 bg-[#0b1730] p-2.5 flex flex-wrap items-center justify-between gap-2">
      <div className="min-w-0">
        <p className="text-xs font-semibold text-white">Ligações com {peerName}</p>
        <p className="text-[10px] text-slate-300/65">
          {status === 'idle' ? 'Áudio ou vídeo, direto pelo navegador' :
           status === 'incoming' ? 'Chamada recebida' :
           status === 'calling' ? 'Chamando…' : 'Conectado'}
        </p>
        {error && <p className="text-[10px] text-rose-200 mt-1">{error}</p>}
      </div>
      <audio ref={remoteAudioRef} autoPlay playsInline />
      {status === 'idle' ? (
        <div className="flex items-center gap-1.5">
          <button type="button" onClick={() => start('audio')} aria-label="Ligar por áudio" title="Ligar por áudio" className="w-9 h-9 rounded-xl bg-[#172747] border border-sky-300/20 text-sky-100 flex items-center justify-center">
            <Phone className="w-4 h-4" />
          </button>
          <button type="button" onClick={() => start('video')} aria-label="Fazer videochamada" title="Fazer videochamada" className="w-9 h-9 rounded-xl bg-[#172747] border border-violet-300/20 text-violet-100 flex items-center justify-center">
            <Video className="w-4 h-4" />
          </button>
        </div>
      ) : status === 'incoming' ? (
        <div className="flex items-center gap-1.5">
          <button type="button" onClick={accept} className="px-3 py-2 rounded-xl bg-emerald-600 text-white text-[11px] font-bold flex items-center gap-1"><Check className="w-3.5 h-3.5" /> Atender</button>
          <button type="button" onClick={decline} className="px-3 py-2 rounded-xl bg-rose-600 text-white text-[11px] font-bold flex items-center gap-1"><X className="w-3.5 h-3.5" /> Recusar</button>
        </div>
      ) : (
        <button type="button" onClick={hangup} className="px-3 py-2 rounded-xl bg-rose-600 text-white text-[11px] font-bold flex items-center gap-1">
          <PhoneOff className="w-3.5 h-3.5" /> Encerrar
        </button>
      )}
      {kind === 'video' && status !== 'idle' && (
        <div className="w-full grid grid-cols-2 gap-2">
          <video ref={remoteVideoRef} autoPlay playsInline className="w-full aspect-video rounded-lg bg-black object-cover" />
          <video ref={localVideoRef} autoPlay muted playsInline className="w-full aspect-video rounded-lg bg-black object-cover" />
        </div>
      )}
      {kind === 'audio' && status !== 'idle' && <span className="text-[10px] text-sky-100/70 flex items-center gap-1"><Mic className="w-3 h-3" /> Voz ativa</span>}
    </section>
  );
};
