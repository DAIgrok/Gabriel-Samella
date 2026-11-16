import React, { useState, useEffect, useRef } from 'react';
import { ArrowLeft, RotateCcw, ArrowUp, ArrowDown, ArrowRight } from 'lucide-react';
import { soundEngine } from '../../../utils/audioSynth';
import type { MiniGameProps } from './ArcadeGamesPackA';

const Bar: React.FC<{
  title: string;
  subtitle?: string;
  onRestart?: () => void;
  onExit: () => void;
}> = ({ title, subtitle, onRestart, onExit }) => (
  <div className="flex items-center justify-between gap-2 pb-3 border-b border-purple-500/20">
    <div className="min-w-0">
      <h3 className="text-base font-bold text-white truncate">{title}</h3>
      {subtitle && <p className="text-[11px] text-purple-200/75 truncate">{subtitle}</p>}
    </div>
    <div className="flex items-center gap-1.5 shrink-0">
      {onRestart && (
        <button
          type="button"
          onClick={onRestart}
          className="min-h-[40px] px-2.5 rounded-xl bg-pink-500/15 hover:bg-pink-500/25 text-xs text-pink-200 flex items-center gap-1 cursor-pointer"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Novo</span>
        </button>
      )}
      <button
        type="button"
        onClick={onExit}
        className="min-h-[40px] px-3 rounded-xl bg-white/5 hover:bg-white/10 text-xs text-purple-200 flex items-center gap-1 cursor-pointer"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        <span>Sair</span>
      </button>
    </div>
  </div>
);

// 10. PEDRA, PAPEL & TESOURA (Melhor de 5)
export const RpsGame: React.FC<MiniGameProps> = ({ onWin, onExit }) => {
  const choices = [
    { id: 'pedra', label: 'Pedra', icon: '🪨' },
    { id: 'papel', label: 'Papel', icon: '📄' },
    { id: 'tesoura', label: 'Tesoura', icon: '✂️' },
  ] as const;

  const [you, setYou] = useState(0);
  const [bot, setBot] = useState(0);
  const [roundLog, setRoundLog] = useState<string>('Escolha sua jogada!');
  const [matchOver, setMatchOver] = useState(false);

  const restart = () => {
    setYou(0);
    setBot(0);
    setRoundLog('Escolha sua jogada!');
    setMatchOver(false);
  };

  const play = (mine: 'pedra' | 'papel' | 'tesoura') => {
    if (matchOver) return;
    soundEngine.playHeartPop();
    const botPick = choices[Math.floor(Math.random() * 3)].id;
    let ny = you;
    let nb = bot;

    if (mine === botPick) {
      setRoundLog(`Empate! Ambos escolheram ${mine}.`);
    } else if (
      (mine === 'pedra' && botPick === 'tesoura') ||
      (mine === 'papel' && botPick === 'pedra') ||
      (mine === 'tesoura' && botPick === 'papel')
    ) {
      ny += 1;
      setYou(ny);
      setRoundLog(`Você venceu a rodada! (${mine} vence ${botPick})`);
    } else {
      nb += 1;
      setBot(nb);
      setRoundLog(`Cupido pontuou (${botPick} vence ${mine}).`);
    }

    if (ny >= 3 || nb >= 3) {
      setMatchOver(true);
      if (ny > nb) {
        soundEngine.playSparkle();
        onWin(7, 'Vitória no Pedra, Papel & Tesoura', ny);
      } else {
        onWin(4, 'Partida divertida no Pedra, Papel & Tesoura', ny);
      }
    }
  };

  return (
    <div className="glass-card-glow rounded-3xl p-4 sm:p-6 border border-rose-400/30 space-y-4">
      <Bar title="✂️ Pedra, Papel & Tesoura" subtitle={`Melhor de 5 · Você ${you} × ${bot} Cupido`} onRestart={restart} onExit={onExit} />
      <div className="p-4 rounded-2xl bg-purple-950/60 border border-purple-500/25 text-center">
        <p className="text-sm font-semibold text-pink-200">{roundLog}</p>
      </div>
      {!matchOver ? (
        <div className="grid grid-cols-3 gap-2.5">
          {choices.map((c) => (
            <button
              key={c.id}
              type="button"
              onClick={() => play(c.id)}
              className="min-h-[76px] rounded-2xl bg-purple-900/50 hover:bg-pink-600/25 border border-purple-400/30 flex flex-col items-center justify-center gap-1 cursor-pointer active:scale-95"
            >
              <span className="text-3xl">{c.icon}</span>
              <span className="text-xs font-bold text-white">{c.label}</span>
            </button>
          ))}
        </div>
      ) : (
        <div className="text-center py-3 space-y-3">
          <h4 className="text-lg font-bold text-white">{you > bot ? 'Você venceu o duelo! +7 💎' : 'Belo duelo! +4 💎'}</h4>
          <button type="button" onClick={restart} className="min-h-[44px] px-5 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 text-white text-xs font-bold cursor-pointer">
            Jogar de Novo
          </button>
        </div>
      )}
    </div>
  );
};

// 11. MATEMÁTICA RELÂMPAGO (30s)
function genMathQuestion() {
  const op = Math.random() > 0.35 ? (Math.random() > 0.5 ? '+' : '-') : '×';
  let a = Math.floor(Math.random() * 18) + 2;
  let b = Math.floor(Math.random() * 14) + 2;
  if (op === '×') {
    a = Math.floor(Math.random() * 9) + 2;
    b = Math.floor(Math.random() * 9) + 2;
  }
  if (op === '-' && b > a) [a, b] = [b, a];
  const ans = op === '+' ? a + b : op === '-' ? a - b : a * b;
  const set = new Set<number>([ans]);
  while (set.size < 4) {
    const delta = Math.floor(Math.random() * 9) - 4;
    if (ans + delta >= 0 && delta !== 0) set.add(ans + delta);
  }
  return {
    text: `${a} ${op} ${b} = ?`,
    ans,
    options: Array.from(set).sort(() => Math.random() - 0.5),
  };
}

export const MathSpeedGame: React.FC<MiniGameProps> = ({ onWin, onExit }) => {
  const [q, setQ] = useState(() => genMathQuestion());
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(25);
  const [done, setDone] = useState(false);
  const scoreRef = useRef(0);

  useEffect(() => {
    if (done) return;
    const t = window.setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          window.clearInterval(t);
          setDone(true);
          const s = scoreRef.current;
          onWin(s >= 10 ? 11 : s >= 5 ? 8 : 5, `Matemática Relâmpago (${s} acertos)`, s);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => window.clearInterval(t);
  }, [done]);

  const restart = () => {
    scoreRef.current = 0;
    setScore(0);
    setTimeLeft(25);
    setDone(false);
    setQ(genMathQuestion());
  };

  const answer = (val: number) => {
    if (done) return;
    if (val === q.ans) {
      soundEngine.playSparkle();
      scoreRef.current += 1;
      setScore(scoreRef.current);
    } else {
      soundEngine.playHeartPop();
    }
    setQ(genMathQuestion());
  };

  return (
    <div className="glass-card-glow rounded-3xl p-4 sm:p-6 border border-indigo-400/30 space-y-4">
      <Bar title="🧮 Matemática Relâmpago" subtitle={`Acertos: ${score} · ⏳ ${timeLeft}s`} onRestart={restart} onExit={onExit} />
      {!done ? (
        <div className="space-y-4">
          <div className="py-6 rounded-2xl bg-purple-950/60 border border-purple-500/30 text-center text-3xl font-bold text-white tabular-nums">
            {q.text}
          </div>
          <div className="grid grid-cols-2 gap-3">
            {q.options.map((opt) => (
              <button
                key={opt}
                type="button"
                onClick={() => answer(opt)}
                className="min-h-[54px] rounded-2xl bg-purple-900/50 hover:bg-pink-600/30 border border-purple-400/30 text-xl font-bold text-white cursor-pointer tabular-nums"
              >
                {opt}
              </button>
            ))}
          </div>
        </div>
      ) : (
        <div className="text-center py-4 space-y-3">
          <h4 className="text-lg font-bold text-white">Tempo Esgotado! {score} contas certas!</h4>
          <button type="button" onClick={restart} className="min-h-[44px] px-5 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 text-white text-xs font-bold cursor-pointer">
            Jogar Novamente
          </button>
        </div>
      )}
    </div>
  );
};

// 12. SEQUÊNCIA GENIUS
export const GeniusGame: React.FC<MiniGameProps> = ({ onWin, onExit }) => {
  const pads = [
    { id: 0, label: '💖', bg: 'bg-pink-600/40 border-pink-400', activeBg: 'bg-pink-400 scale-105 shadow-[0_0_25px_rgba(244,114,182,0.9)]' },
    { id: 1, label: '💜', bg: 'bg-purple-600/40 border-purple-400', activeBg: 'bg-purple-400 scale-105 shadow-[0_0_25px_rgba(192,132,252,0.9)]' },
    { id: 2, label: '🌟', bg: 'bg-amber-600/40 border-amber-400', activeBg: 'bg-amber-400 scale-105 shadow-[0_0_25px_rgba(251,191,36,0.9)]' },
    { id: 3, label: '💎', bg: 'bg-cyan-600/40 border-cyan-400', activeBg: 'bg-cyan-400 scale-105 shadow-[0_0_25px_rgba(34,211,238,0.9)]' },
  ];

  const [seq, setSeq] = useState<number[]>([]);
  const [userIdx, setUserIdx] = useState(0);
  const [lit, setLit] = useState<number | null>(null);
  const [phase, setPhase] = useState<'idle' | 'showing' | 'input' | 'gameover'>('idle');

  const playSequence = (targetSeq: number[]) => {
    setPhase('showing');
    targetSeq.forEach((padId, i) => {
      window.setTimeout(() => {
        setLit(padId);
        soundEngine.playHeartPop();
        window.setTimeout(() => setLit(null), 320);
      }, i * 560 + 250);
    });
    window.setTimeout(() => {
      setUserIdx(0);
      setPhase('input');
    }, targetSeq.length * 560 + 300);
  };

  const startGame = () => {
    const first = [Math.floor(Math.random() * 4)];
    setSeq(first);
    playSequence(first);
  };

  const tapPad = (padId: number) => {
    if (phase !== 'input') return;
    setLit(padId);
    window.setTimeout(() => setLit(null), 180);

    if (padId !== seq[userIdx]) {
      setPhase('gameover');
      const cleared = Math.max(0, seq.length - 1);
      if (cleared >= 2) {
        onWin(cleared >= 5 ? 11 : 6, `Sequência Genius (Rodada ${cleared})`, cleared);
      }
      return;
    }

    soundEngine.playSparkle();
    const nextIdx = userIdx + 1;
    if (nextIdx === seq.length) {
      if (seq.length >= 6) {
        setPhase('gameover');
        onWin(14, 'Mestra da Memória Genius (6 rodadas)!', 6);
      } else {
        const nextSeq = [...seq, Math.floor(Math.random() * 4)];
        setSeq(nextSeq);
        window.setTimeout(() => playSequence(nextSeq), 550);
      }
    } else {
      setUserIdx(nextIdx);
    }
  };

  return (
    <div className="glass-card-glow rounded-3xl p-4 sm:p-6 border border-purple-400/30 space-y-4">
      <Bar
        title="✨ Sequência Genius"
        subtitle={`Rodada: ${seq.length || 0}/6 · ${phase === 'showing' ? 'Observe...' : phase === 'input' ? 'Sua vez!' : ''}`}
        onRestart={startGame}
        onExit={onExit}
      />

      <div className="grid grid-cols-2 gap-3 max-w-[260px] mx-auto py-2">
        {pads.map((p) => (
          <button
            key={p.id}
            type="button"
            disabled={phase !== 'input'}
            onClick={() => tapPad(p.id)}
            className={`aspect-square rounded-2xl border-2 text-3xl flex items-center justify-center transition-all cursor-pointer ${
              lit === p.id ? p.activeBg : p.bg
            }`}
          >
            {p.label}
          </button>
        ))}
      </div>

      {(phase === 'idle' || phase === 'gameover') && (
        <div className="text-center space-y-2">
          {phase === 'gameover' && (
            <p className="text-sm font-bold text-pink-200">
              {seq.length >= 6 ? 'Sequência Máxima Vencida! +14 💎' : `Você chegou até a rodada ${seq.length}!`}
            </p>
          )}
          <button
            type="button"
            onClick={startGame}
            className="min-h-[44px] px-6 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 text-white text-xs font-bold cursor-pointer"
          >
            {phase === 'idle' ? 'Iniciar Sequência' : 'Jogar de Novo'}
          </button>
        </div>
      )}
    </div>
  );
};

// 13. 2048 DAS FLORES
const FLOWER_MAP: Record<number, { icon: string; bg: string }> = {
  2: { icon: '🌱', bg: 'bg-emerald-950/70 border-emerald-500/30' },
  4: { icon: '🌿', bg: 'bg-teal-900/60 border-teal-400/40' },
  8: { icon: '🌷', bg: 'bg-pink-900/60 border-pink-400/40' },
  16: { icon: '🌸', bg: 'bg-fuchsia-900/60 border-fuchsia-400/50' },
  32: { icon: '🌹', bg: 'bg-rose-800/70 border-rose-400/60' },
  64: { icon: '💐', bg: 'bg-purple-800/80 border-pink-300/70' },
  128: { icon: '💍', bg: 'bg-amber-700/70 border-amber-300/80' },
  256: { icon: '👑', bg: 'bg-gradient-to-br from-pink-600 to-amber-500 border-white/70' },
};

function spawn2048(board: number[]): number[] {
  const empty = board.map((v, i) => (v === 0 ? i : -1)).filter((i) => i >= 0);
  if (empty.length === 0) return board;
  const next = [...board];
  next[empty[Math.floor(Math.random() * empty.length)]] = Math.random() < 0.85 ? 2 : 4;
  return next;
}

export const Floral2048Game: React.FC<MiniGameProps> = ({ onWin, onExit }) => {
  const initBoard = () => spawn2048(spawn2048(Array(16).fill(0)));
  const [board, setBoard] = useState<number[]>(initBoard);
  const [score, setScore] = useState(0);
  const [won256, setWon256] = useState(false);
  const touchStart = useRef<{ x: number; y: number } | null>(null);

  const slideRow = (row: number[]): { row: number[]; gained: number } => {
    const nums = row.filter((n) => n !== 0);
    let gained = 0;
    for (let i = 0; i < nums.length - 1; i++) {
      if (nums[i] === nums[i + 1]) {
        nums[i] *= 2;
        gained += nums[i];
        nums.splice(i + 1, 1);
      }
    }
    while (nums.length < 4) nums.push(0);
    return { row: nums, gained };
  };

  const move = (dir: 'left' | 'right' | 'up' | 'down') => {
    const next = [...board];
    let totalGained = 0;

    for (let i = 0; i < 4; i++) {
      const line: number[] = [];
      for (let j = 0; j < 4; j++) {
        const idx =
          dir === 'left'
            ? i * 4 + j
            : dir === 'right'
            ? i * 4 + (3 - j)
            : dir === 'up'
            ? j * 4 + i
            : (3 - j) * 4 + i;
        line.push(board[idx]);
      }
      const res = slideRow(line);
      totalGained += res.gained;
      for (let j = 0; j < 4; j++) {
        const idx =
          dir === 'left'
            ? i * 4 + j
            : dir === 'right'
            ? i * 4 + (3 - j)
            : dir === 'up'
            ? j * 4 + i
            : (3 - j) * 4 + i;
        next[idx] = res.row[j];
      }
    }

    if (next.some((v, idx) => v !== board[idx])) {
      soundEngine.playHeartPop();
      const spawned = spawn2048(next);
      setBoard(spawned);
      const ns = score + totalGained;
      setScore(ns);
      if (!won256 && spawned.some((v) => v >= 128)) {
        setWon256(true);
        onWin(12, 'Alcançou a Aliança 💍 no 2048 das Flores!', ns);
      }
    }
  };

  const restart = () => {
    setBoard(initBoard());
    setScore(0);
    setWon256(false);
  };

  return (
    <div className="glass-card-glow rounded-3xl p-4 sm:p-6 border border-pink-400/30 space-y-3">
      <Bar title="🌸 2048 das Flores" subtitle={`Pontos: ${score} · Meta: 💍 (128)`} onRestart={restart} onExit={onExit} />

      <div
        onTouchStart={(e) => {
          touchStart.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
        }}
        onTouchEnd={(e) => {
          if (!touchStart.current) return;
          const dx = e.changedTouches[0].clientX - touchStart.current.x;
          const dy = e.changedTouches[0].clientY - touchStart.current.y;
          if (Math.abs(dx) < 20 && Math.abs(dy) < 20) return;
          if (Math.abs(dx) > Math.abs(dy)) move(dx > 0 ? 'right' : 'left');
          else move(dy > 0 ? 'down' : 'up');
          touchStart.current = null;
        }}
        className="grid grid-cols-4 gap-2 max-w-[270px] mx-auto p-2.5 rounded-2xl bg-purple-950/70 border border-purple-500/30 touch-none"
      >
        {board.map((val, i) => {
          const meta = FLOWER_MAP[val];
          return (
            <div
              key={i}
              className={`aspect-square rounded-xl border flex flex-col items-center justify-center ${
                meta ? meta.bg : 'bg-black/30 border-purple-500/15'
              }`}
            >
              {val > 0 && (
                <>
                  <span className="text-xl leading-none">{meta?.icon || '✨'}</span>
                  <span className="text-[10px] font-bold text-white/90 mt-0.5 tabular-nums">{val}</span>
                </>
              )}
            </div>
          );
        })}
      </div>

      <div className="flex justify-center gap-2">
        <button type="button" onClick={() => move('left')} aria-label="Esquerda" className="min-w-[46px] min-h-[44px] rounded-xl bg-purple-900/60 border border-purple-400/30 text-white flex items-center justify-center cursor-pointer">
          <ArrowLeft className="w-4 h-4" />
        </button>
        <button type="button" onClick={() => move('up')} aria-label="Cima" className="min-w-[46px] min-h-[44px] rounded-xl bg-purple-900/60 border border-purple-400/30 text-white flex items-center justify-center cursor-pointer">
          <ArrowUp className="w-4 h-4" />
        </button>
        <button type="button" onClick={() => move('down')} aria-label="Baixo" className="min-w-[46px] min-h-[44px] rounded-xl bg-purple-900/60 border border-purple-400/30 text-white flex items-center justify-center cursor-pointer">
          <ArrowDown className="w-4 h-4" />
        </button>
        <button type="button" onClick={() => move('right')} aria-label="Direita" className="min-w-[46px] min-h-[44px] rounded-xl bg-purple-900/60 border border-purple-400/30 text-white flex items-center justify-center cursor-pointer">
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>

      {score >= 160 && !won256 && (
        <button
          type="button"
          onClick={() => {
            setWon256(true);
            onWin(8, 'Pontuação 2048 das Flores!', score);
          }}
          className="w-full min-h-[42px] rounded-xl bg-emerald-600/30 border border-emerald-400/40 text-xs font-bold text-emerald-100 cursor-pointer"
        >
          Resgatar +8 💎 com {score} pts
        </button>
      )}
    </div>
  );
};

// 14. COFRE SECRETO (Mastermind)
export const MastermindGame: React.FC<MiniGameProps> = ({ onWin, onExit }) => {
  const symbols = ['🌹', '💖', '💎', '🌸', '🌙', '⭐'];
  const makeSecret = () => [...symbols].sort(() => Math.random() - 0.5).slice(0, 4);

  const [secret, setSecret] = useState<string[]>(makeSecret);
  const [currentGuess, setCurrentGuess] = useState<string[]>([]);
  const [history, setHistory] = useState<{ guess: string[]; exact: number; close: number }[]>([]);
  const [status, setStatus] = useState<'playing' | 'won' | 'lost'>('playing');

  const restart = () => {
    setSecret(makeSecret());
    setCurrentGuess([]);
    setHistory([]);
    setStatus('playing');
  };

  const toggleSymbol = (sym: string) => {
    if (status !== 'playing') return;
    soundEngine.playHeartPop();
    if (currentGuess.includes(sym)) {
      setCurrentGuess((g) => g.filter((x) => x !== sym));
    } else if (currentGuess.length < 4) {
      setCurrentGuess((g) => [...g, sym]);
    }
  };

  const submitGuess = () => {
    if (currentGuess.length !== 4 || status !== 'playing') return;
    let exact = 0;
    let close = 0;
    currentGuess.forEach((sym, i) => {
      if (secret[i] === sym) exact += 1;
      else if (secret.includes(sym)) close += 1;
    });
    const nextHist = [{ guess: currentGuess, exact, close }, ...history];
    setHistory(nextHist);
    setCurrentGuess([]);

    if (exact === 4) {
      setStatus('won');
      soundEngine.playSparkle();
      onWin(12, 'Cofre Secreto Aberto!');
    } else if (nextHist.length >= 7) {
      setStatus('lost');
    }
  };

  return (
    <div className="glass-card-glow rounded-3xl p-4 sm:p-6 border border-purple-400/30 space-y-3.5">
      <Bar title="🔐 Cofre Secreto" subtitle={`Tentativas: ${history.length}/7 · 4 símbolos diferentes`} onRestart={restart} onExit={onExit} />

      <div className="flex justify-center gap-2 py-1">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="w-12 h-12 rounded-xl bg-purple-950/70 border border-pink-400/40 flex items-center justify-center text-2xl">
            {status !== 'playing' ? secret[i] : currentGuess[i] || '•'}
          </div>
        ))}
      </div>

      {status === 'playing' && (
        <>
          <div className="flex justify-center gap-2 flex-wrap">
            {symbols.map((sym) => (
              <button
                key={sym}
                type="button"
                onClick={() => toggleSymbol(sym)}
                className={`w-11 h-11 rounded-xl border text-xl cursor-pointer ${
                  currentGuess.includes(sym) ? 'bg-pink-500/30 border-pink-400' : 'bg-purple-900/50 border-purple-500/30'
                }`}
              >
                {sym}
              </button>
            ))}
          </div>
          <button
            type="button"
            disabled={currentGuess.length !== 4}
            onClick={submitGuess}
            className="w-full min-h-[44px] rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 text-white text-xs font-bold disabled:opacity-40 cursor-pointer"
          >
            Testar Combinação
          </button>
        </>
      )}

      {status !== 'playing' && (
        <div className="text-center space-y-2">
          <p className="text-sm font-bold text-white">
            {status === 'won' ? 'Senha Desvendada! +12 💎' : 'Cofre trancou! Tente outra combinação.'}
          </p>
          <button type="button" onClick={restart} className="min-h-[44px] px-5 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 text-white text-xs font-bold cursor-pointer">
            Jogar Novamente
          </button>
        </div>
      )}

      {history.length > 0 && (
        <div className="space-y-1.5 max-h-40 overflow-y-auto">
          {history.map((h, i) => (
            <div key={i} className="flex items-center justify-between px-3 py-1.5 rounded-xl bg-purple-950/50 border border-purple-500/20 text-xs">
              <span className="tracking-widest text-base">{h.guess.join(' ')}</span>
              <span className="text-purple-200 font-mono">
                {h.exact} certo · {h.close} fora do lugar
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// 15. JARDIM SEM ESPINHOS (Minesweeper 5x5)
export const MinesweeperLoveGame: React.FC<MiniGameProps> = ({ onWin, onExit }) => {
  const [thorns, setThorns] = useState<Set<number> | null>(null);
  const [revealed, setRevealed] = useState<Set<number>>(new Set());
  const [lost, setLost] = useState(false);

  const countAdjacent = (idx: number, tSet: Set<number>) => {
    const r = Math.floor(idx / 5);
    const c = idx % 5;
    let count = 0;
    for (let dr = -1; dr <= 1; dr++) {
      for (let dc = -1; dc <= 1; dc++) {
        const nr = r + dr;
        const nc = c + dc;
        if (nr >= 0 && nr < 5 && nc >= 0 && nc < 5 && tSet.has(nr * 5 + nc)) count++;
      }
    }
    return count;
  };

  const restart = () => {
    setThorns(null);
    setRevealed(new Set());
    setLost(false);
  };

  const tapCell = (idx: number) => {
    if (lost || revealed.has(idx)) return;
    let activeThorns = thorns;
    if (!activeThorns) {
      const created = new Set<number>();
      while (created.size < 5) {
        const rand = Math.floor(Math.random() * 25);
        if (rand !== idx) created.add(rand);
      }
      activeThorns = created;
      setThorns(created);
    }

    if (activeThorns.has(idx)) {
      soundEngine.playHeartPop();
      setLost(true);
      return;
    }

    soundEngine.playSparkle();
    const next = new Set(revealed);
    const queue = [idx];
    while (queue.length > 0) {
      const cur = queue.pop()!;
      if (next.has(cur) || activeThorns.has(cur)) continue;
      next.add(cur);
      if (countAdjacent(cur, activeThorns) === 0) {
        const r = Math.floor(cur / 5);
        const c = cur % 5;
        for (let dr = -1; dr <= 1; dr++) {
          for (let dc = -1; dc <= 1; dc++) {
            const nr = r + dr;
            const nc = c + dc;
            if (nr >= 0 && nr < 5 && nc >= 0 && nc < 5) queue.push(nr * 5 + nc);
          }
        }
      }
    }
    setRevealed(next);
    if (next.size >= 20) {
      onWin(10, 'Jardim Sem Espinhos Completo!');
    }
  };

  const won = revealed.size >= 20 && !lost;

  return (
    <div className="glass-card-glow rounded-3xl p-4 sm:p-6 border border-emerald-400/30 space-y-3.5">
      <Bar title="🌷 Jardim Sem Espinhos" subtitle={`Flores abertas: ${revealed.size}/20 · Espinhos: 5`} onRestart={restart} onExit={onExit} />
      <div className="grid grid-cols-5 gap-1.5 max-w-[270px] mx-auto">
        {Array.from({ length: 25 }, (_, i) => {
          const isOpen = revealed.has(i);
          const isThorn = lost && thorns?.has(i);
          const adj = thorns && isOpen ? countAdjacent(i, thorns) : 0;
          return (
            <button
              key={i}
              type="button"
              onClick={() => tapCell(i)}
              className={`aspect-square rounded-xl border text-sm font-bold flex items-center justify-center cursor-pointer ${
                isThorn
                  ? 'bg-rose-700/60 border-rose-400 text-white'
                  : isOpen
                  ? 'bg-emerald-950/60 border-emerald-400/40 text-emerald-200'
                  : 'bg-purple-950/70 border-purple-500/30 hover:border-pink-400/50 text-purple-300'
              }`}
            >
              {isThorn ? '🥀' : isOpen ? (adj === 0 ? '🌷' : adj) : '🌱'}
            </button>
          );
        })}
      </div>
      {(lost || won) && (
        <div className="text-center space-y-2">
          <p className="text-sm font-bold text-white">{won ? 'Jardim salvo com carinho! +10 💎' : 'Ops! Tocou em um espinho 🥀'}</p>
          <button type="button" onClick={restart} className="min-h-[44px] px-5 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 text-white text-xs font-bold cursor-pointer">
            Plantar Novo Jardim
          </button>
        </div>
      )}
    </div>
  );
};

// 16. LABIRINTO DO CUPIDO (Procedural 7x7 DFS Maze)
function buildMaze7x7() {
  const N = 7;
  // walls bitmask: 1=top, 2=right, 4=bottom, 8=left
  const walls = Array.from({ length: N }, () => Array(N).fill(15));
  const vis = Array.from({ length: N }, () => Array(N).fill(false));

  const carve = (r: number, c: number) => {
    vis[r][c] = true;
    const dirs = [
      { dr: -1, dc: 0, w: 1, opp: 4 },
      { dr: 0, dc: 1, w: 2, opp: 8 },
      { dr: 1, dc: 0, w: 4, opp: 1 },
      { dr: 0, dc: -1, w: 8, opp: 2 },
    ].sort(() => Math.random() - 0.5);

    for (const d of dirs) {
      const nr = r + d.dr;
      const nc = c + d.dc;
      if (nr >= 0 && nr < N && nc >= 0 && nc < N && !vis[nr][nc]) {
        walls[r][c] &= ~d.w;
        walls[nr][nc] &= ~d.opp;
        carve(nr, nc);
      }
    }
  };
  carve(0, 0);
  return walls;
}

export const CupidMazeGame: React.FC<MiniGameProps> = ({ onWin, onExit }) => {
  const [maze, setMaze] = useState(() => buildMaze7x7());
  const [pos, setPos] = useState<[number, number]>([0, 0]);
  const [won, setWon] = useState(false);

  const restart = () => {
    setMaze(buildMaze7x7());
    setPos([0, 0]);
    setWon(false);
  };

  const step = (dir: 'up' | 'right' | 'down' | 'left') => {
    if (won) return;
    const [r, c] = pos;
    const w = maze[r][c];
    if (dir === 'up' && (w & 1) === 0) setPos([r - 1, c]);
    else if (dir === 'right' && (w & 2) === 0) setPos([r, c + 1]);
    else if (dir === 'down' && (w & 4) === 0) setPos([r + 1, c]);
    else if (dir === 'left' && (w & 8) === 0) setPos([r, c - 1]);
    else return;

    soundEngine.playHeartPop();
    const nr = dir === 'up' ? r - 1 : dir === 'down' ? r + 1 : r;
    const nc = dir === 'left' ? c - 1 : dir === 'right' ? c + 1 : c;
    if (nr === 6 && nc === 6) {
      setWon(true);
      soundEngine.playSparkle();
      onWin(10, 'Cupido chegou ao Coração no Labirinto!');
    }
  };

  return (
    <div className="glass-card-glow rounded-3xl p-4 sm:p-6 border border-purple-400/30 space-y-3">
      <Bar title="🧭 Labirinto do Cupido" subtitle="Leve 💘 até o Coração 💖" onRestart={restart} onExit={onExit} />

      <div className="grid grid-cols-7 max-w-[266px] mx-auto bg-purple-950/70 p-1.5 rounded-xl border border-purple-500/30">
        {maze.map((row, r) =>
          row.map((w, c) => {
            const isPlayer = pos[0] === r && pos[1] === c;
            const isGoal = r === 6 && c === 6;
            return (
              <div
                key={`${r}-${c}`}
                style={{
                  borderTopWidth: w & 1 ? 2 : 0,
                  borderRightWidth: w & 2 ? 2 : 0,
                  borderBottomWidth: w & 4 ? 2 : 0,
                  borderLeftWidth: w & 8 ? 2 : 0,
                }}
                className="w-9 h-9 border-pink-400/60 flex items-center justify-center text-base"
              >
                {isPlayer ? '💘' : isGoal ? '💖' : ''}
              </div>
            );
          })
        )}
      </div>

      {!won ? (
        <div className="flex justify-center gap-2">
          <button type="button" onClick={() => step('left')} aria-label="Esquerda" className="min-w-[46px] min-h-[44px] rounded-xl bg-purple-900/60 border border-purple-400/30 text-white flex items-center justify-center cursor-pointer">
            <ArrowLeft className="w-4 h-4" />
          </button>
          <button type="button" onClick={() => step('up')} aria-label="Cima" className="min-w-[46px] min-h-[44px] rounded-xl bg-purple-900/60 border border-purple-400/30 text-white flex items-center justify-center cursor-pointer">
            <ArrowUp className="w-4 h-4" />
          </button>
          <button type="button" onClick={() => step('down')} aria-label="Baixo" className="min-w-[46px] min-h-[44px] rounded-xl bg-purple-900/60 border border-purple-400/30 text-white flex items-center justify-center cursor-pointer">
            <ArrowDown className="w-4 h-4" />
          </button>
          <button type="button" onClick={() => step('right')} aria-label="Direita" className="min-w-[46px] min-h-[44px] rounded-xl bg-purple-900/60 border border-purple-400/30 text-white flex items-center justify-center cursor-pointer">
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      ) : (
        <div className="text-center space-y-2">
          <p className="text-sm font-bold text-emerald-300">Caminho encontrado! +10 💎</p>
          <button type="button" onClick={restart} className="min-h-[44px] px-5 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 text-white text-xs font-bold cursor-pointer">
            Novo Labirinto
          </button>
        </div>
      )}
    </div>
  );
};

// 17. ESTOURA BALÕES (25s)
export const BalloonPopGame: React.FC<MiniGameProps> = ({ onWin, onExit }) => {
  const [items, setItems] = useState<{ id: number; x: number; y: number; icon: string; pts: number }[]>([]);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(25);
  const [done, setDone] = useState(false);
  const scoreRef = useRef(0);

  useEffect(() => {
    if (done) return;
    const sec = window.setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) {
          window.clearInterval(sec);
          setDone(true);
          const s = scoreRef.current;
          onWin(s >= 18 ? 11 : s >= 10 ? 8 : 5, `Estoura Balões (${s} pts)`, s);
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    const spawn = window.setInterval(() => {
      const bad = Math.random() < 0.18;
      setItems((prev) => [
        ...prev.slice(-7),
        {
          id: Date.now() + Math.random(),
          x: Math.random() * 75 + 10,
          y: Math.random() * 68 + 12,
          icon: bad ? '💣' : Math.random() < 0.3 ? '💖' : '🎈',
          pts: bad ? -3 : 2,
        },
      ]);
    }, 650);
    return () => {
      window.clearInterval(sec);
      window.clearInterval(spawn);
    };
  }, [done]);

  const restart = () => {
    scoreRef.current = 0;
    setScore(0);
    setTimeLeft(25);
    setDone(false);
    setItems([]);
  };

  const pop = (id: number, pts: number) => {
    if (done) return;
    setItems((prev) => prev.filter((i) => i.id !== id));
    if (pts > 0) soundEngine.playSparkle();
    else soundEngine.playHeartPop();
    scoreRef.current = Math.max(0, scoreRef.current + pts);
    setScore(scoreRef.current);
  };

  return (
    <div className="glass-card-glow rounded-3xl p-4 sm:p-6 border border-pink-400/30 space-y-3">
      <Bar title="🎈 Estoura Balões" subtitle={`Pontos: ${score} · ⏳ ${timeLeft}s (evite 💣)`} onRestart={restart} onExit={onExit} />
      <div className="relative h-64 rounded-2xl bg-purple-950/60 border border-purple-500/25 overflow-hidden">
        {!done ? (
          items.map((it) => (
            <button
              key={it.id}
              type="button"
              onClick={() => pop(it.id, it.pts)}
              style={{ left: `${it.x}%`, top: `${it.y}%` }}
              className="absolute -translate-x-1/2 -translate-y-1/2 min-w-[46px] min-h-[46px] text-3xl cursor-pointer active:scale-90 transition-transform"
            >
              {it.icon}
            </button>
          ))
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 p-4 text-center">
            <span className="text-4xl">🎈</span>
            <h4 className="text-lg font-bold text-white">Placar Final: {score} pontos!</h4>
            <button type="button" onClick={restart} className="min-h-[44px] px-5 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 text-white text-xs font-bold cursor-pointer">
              Jogar Novamente
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

// 18. TORRE DOS SONHOS (Stacker)
export const TowerStackGame: React.FC<MiniGameProps> = ({ onWin, onExit }) => {
  const [floors, setFloors] = useState(0);
  const [pos, setPos] = useState(50);
  const dirRef = useRef(1);
  const [over, setOver] = useState(false);

  useEffect(() => {
    if (over) return;
    const t = window.setInterval(() => {
      setPos((p) => {
        let next = p + dirRef.current * (2.6 + floors * 0.25);
        if (next >= 88) {
          next = 88;
          dirRef.current = -1;
        } else if (next <= 12) {
          next = 12;
          dirRef.current = 1;
        }
        return next;
      });
    }, 30);
    return () => window.clearInterval(t);
  }, [over, floors]);

  const restart = () => {
    setFloors(0);
    setPos(50);
    setOver(false);
  };

  const drop = () => {
    if (over) return;
    const dist = Math.abs(pos - 50);
    if (dist <= 20) {
      soundEngine.playSparkle();
      const nf = floors + 1;
      setFloors(nf);
      if (nf >= 10) {
        setOver(true);
        onWin(13, 'Torre dos Sonhos Completa (10 andares)!', 10);
      }
    } else {
      soundEngine.playHeartPop();
      setOver(true);
      if (floors >= 4) {
        onWin(floors >= 7 ? 9 : 6, `Torre dos Sonhos (${floors} andares)`, floors);
      }
    }
  };

  return (
    <div className="glass-card-glow rounded-3xl p-4 sm:p-6 border border-purple-400/30 space-y-4">
      <Bar title="🏰 Torre dos Sonhos" subtitle={`Andares alinhados: ${floors}/10`} onRestart={restart} onExit={onExit} />
      <div className="relative h-44 rounded-2xl bg-purple-950/70 border border-purple-500/25 overflow-hidden flex flex-col justify-between p-4">
        <div className="relative h-8 w-full bg-black/30 rounded-xl">
          <div className="absolute top-0 bottom-0 left-1/2 -translate-x-1/2 w-[36%] border-x border-pink-400/30 bg-pink-500/10" />
          <div
            style={{ left: `${pos}%` }}
            className="absolute top-1 bottom-1 w-14 -translate-x-1/2 rounded-lg bg-gradient-to-r from-pink-500 to-purple-500 shadow-lg"
          />
        </div>
        <div className="flex flex-col-reverse items-center gap-1 overflow-hidden max-h-24">
          {Array.from({ length: floors }, (_, i) => (
            <div key={i} className="w-24 h-2 rounded-full bg-gradient-to-r from-purple-400 to-pink-400" />
          ))}
        </div>
      </div>

      {!over ? (
        <button
          type="button"
          onClick={drop}
          className="w-full min-h-[50px] rounded-2xl bg-gradient-to-r from-purple-600 to-pink-600 text-white text-sm font-bold cursor-pointer active:scale-95"
        >
          Empilhar no Centro!
        </button>
      ) : (
        <div className="text-center space-y-2">
          <p className="text-sm font-bold text-white">
            {floors >= 10 ? 'Torre Máxima! +13 💎' : `Você empilhou ${floors} andares!`}
          </p>
          <button type="button" onClick={restart} className="min-h-[44px] px-5 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 text-white text-xs font-bold cursor-pointer">
            Recomeçar Torre
          </button>
        </div>
      )}
    </div>
  );
};

// 19. ALVO 5.00 SEGUNDOS
export const TargetChronoGame: React.FC<MiniGameProps> = ({ onWin, onExit }) => {
  const [running, setRunning] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [result, setResult] = useState<string | null>(null);
  const startRef = useRef(0);

  useEffect(() => {
    if (!running) return;
    const t = window.setInterval(() => {
      setElapsed((performance.now() - startRef.current) / 1000);
    }, 30);
    return () => window.clearInterval(t);
  }, [running]);

  const toggle = () => {
    if (!running) {
      startRef.current = performance.now();
      setElapsed(0);
      setResult(null);
      setRunning(true);
      soundEngine.playHeartPop();
    } else {
      const finalSec = (performance.now() - startRef.current) / 1000;
      setElapsed(finalSec);
      setRunning(false);
      const diff = Math.abs(finalSec - 5);
      if (diff <= 0.25) {
        soundEngine.playSparkle();
        setResult(`Incrível! Diferença de apenas ${diff.toFixed(2)}s (+12 💎)`);
        onWin(12, 'Mestra do Tempo no Alvo 5.00s!');
      } else if (diff <= 0.6) {
        soundEngine.playSparkle();
        setResult(`Muito bom! Diferença de ${diff.toFixed(2)}s (+8 💎)`);
        onWin(8, 'Alvo 5.00s próximo!');
      } else {
        setResult(`Você parou em ${finalSec.toFixed(2)}s (+4 💎 pela tentativa)`);
        onWin(4, 'Desafio Alvo 5.00s');
      }
    }
  };

  return (
    <div className="glass-card-glow rounded-3xl p-4 sm:p-6 border border-teal-400/30 space-y-4 text-center">
      <Bar title="⏱️ Alvo 5.00 Segundos" subtitle="Pare o cronômetro o mais perto de 5.00s" onExit={onExit} />
      <div className="py-6 rounded-2xl bg-purple-950/60 border border-purple-500/30">
        <span className="text-4xl font-mono font-bold text-pink-200 tabular-nums">{elapsed.toFixed(2)}s</span>
      </div>
      {result && <p className="text-xs font-bold text-emerald-300">{result}</p>}
      <button
        type="button"
        onClick={toggle}
        className="w-full min-h-[52px] rounded-2xl bg-gradient-to-r from-purple-600 to-pink-600 text-white text-sm font-bold cursor-pointer"
      >
        {running ? 'PARAR AGORA!' : 'Iniciar Cronômetro'}
      </button>
    </div>
  );
};

// 20. REFLEXO APAIXONADO
export const ReflexGame: React.FC<MiniGameProps> = ({ onWin, onExit }) => {
  const [stage, setStage] = useState<'idle' | 'waiting' | 'ready' | 'done'>('idle');
  const [times, setTimes] = useState<number[]>([]);
  const readyAtRef = useRef(0);
  const timerRef = useRef<number | null>(null);

  useEffect(() => () => {
    if (timerRef.current) window.clearTimeout(timerRef.current);
  }, []);

  const triggerNext = () => {
    setStage('waiting');
    const delay = 1200 + Math.random() * 2200;
    timerRef.current = window.setTimeout(() => {
      readyAtRef.current = performance.now();
      setStage('ready');
      soundEngine.playSparkle();
    }, delay);
  };

  const handlePad = () => {
    if (stage === 'idle') {
      setTimes([]);
      triggerNext();
    } else if (stage === 'waiting') {
      if (timerRef.current) window.clearTimeout(timerRef.current);
      soundEngine.playHeartPop();
      triggerNext();
    } else if (stage === 'ready') {
      const ms = Math.round(performance.now() - readyAtRef.current);
      const next = [...times, ms];
      setTimes(next);
      if (next.length >= 3) {
        setStage('done');
        const avg = Math.round(next.reduce((a, b) => a + b, 0) / next.length);
        onWin(avg < 420 ? 10 : 6, `Reflexo Apaixonado (${avg}ms)`, avg);
      } else {
        triggerNext();
      }
    }
  };

  const avg = times.length ? Math.round(times.reduce((a, b) => a + b, 0) / times.length) : 0;

  return (
    <div className="glass-card-glow rounded-3xl p-4 sm:p-6 border border-pink-400/30 space-y-4 text-center">
      <Bar title="⚡ Reflexo Apaixonado" subtitle={`Rodadas: ${times.length}/3`} onExit={onExit} />
      <button
        type="button"
        onClick={stage === 'done' ? () => { setTimes([]); triggerNext(); } : handlePad}
        className={`w-full min-h-[170px] rounded-3xl border-2 font-bold text-lg flex flex-col items-center justify-center gap-2 cursor-pointer transition-colors ${
          stage === 'ready'
            ? 'bg-pink-500 border-white text-white shadow-[0_0_30px_rgba(244,114,182,0.8)]'
            : stage === 'waiting'
            ? 'bg-purple-950/80 border-amber-400/40 text-amber-200'
            : 'bg-purple-900/50 border-purple-400/40 text-purple-100'
        }`}
      >
        {stage === 'idle' && 'Toque para Começar'}
        {stage === 'waiting' && 'Espere ficar ROSA...'}
        {stage === 'ready' && 'TOQUE AGORA! 💖'}
        {stage === 'done' && (
          <>
            <span>Média: {avg}ms! ✨</span>
            <span className="text-xs font-normal text-pink-200">Toque para testar de novo</span>
          </>
        )}
      </button>
    </div>
  );
};

// 21. ONDE ESTÁ A ALIANÇA? (3 Taças)
export const ShellRingGame: React.FC<MiniGameProps> = ({ onWin, onExit }) => {
  const [ringCup, setRingCup] = useState(() => Math.floor(Math.random() * 3));
  const [phase, setPhase] = useState<'peek' | 'shuffling' | 'guess' | 'result'>('peek');
  const [wins, setWins] = useState(0);
  const [picked, setPicked] = useState<number | null>(null);

  const startShuffle = () => {
    setPicked(null);
    setPhase('shuffling');
    let hops = 0;
    const t = window.setInterval(() => {
      setRingCup(Math.floor(Math.random() * 3));
      hops++;
      if (hops >= 6) {
        window.clearInterval(t);
        setPhase('guess');
      }
    }, 240);
  };

  const chooseCup = (idx: number) => {
    if (phase !== 'guess') return;
    setPicked(idx);
    setPhase('result');
    if (idx === ringCup) {
      soundEngine.playSparkle();
      const nw = wins + 1;
      setWins(nw);
      onWin(nw >= 3 ? 11 : 7, 'Encontrou a Aliança!');
    } else {
      soundEngine.playHeartPop();
    }
  };

  return (
    <div className="glass-card-glow rounded-3xl p-4 sm:p-6 border border-amber-400/30 space-y-4 text-center">
      <Bar title="💍 Onde Está a Aliança?" subtitle={`Acertos seguidos: ${wins}`} onExit={onExit} />
      <div className="grid grid-cols-3 gap-3 py-4">
        {[0, 1, 2].map((cup) => {
          const showRing = (phase === 'peek' || phase === 'result') && ringCup === cup;
          return (
            <button
              key={cup}
              type="button"
              disabled={phase !== 'guess'}
              onClick={() => chooseCup(cup)}
              className={`min-h-[96px] rounded-2xl border flex flex-col items-center justify-center gap-1 text-3xl cursor-pointer transition-all ${
                phase === 'shuffling' ? 'animate-pulse bg-purple-800/60 border-pink-400/40' : 'bg-purple-950/70 border-purple-500/30 hover:border-pink-400'
              } ${picked === cup && cup === ringCup ? 'border-emerald-400 bg-emerald-950/50' : ''}`}
            >
              <span>{showRing ? '💍' : '🍷'}</span>
              <span className="text-[11px] text-purple-200">Taça {cup + 1}</span>
            </button>
          );
        })}
      </div>

      {phase === 'peek' && (
        <button type="button" onClick={startShuffle} className="w-full min-h-[46px] rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 text-white text-xs font-bold cursor-pointer">
          Embaralhar Taças!
        </button>
      )}
      {phase === 'shuffling' && <p className="text-xs text-pink-200">Embaralhando as taças...</p>}
      {phase === 'guess' && <p className="text-xs text-purple-100 font-semibold">Toque na taça onde está a aliança 💍</p>}
      {phase === 'result' && (
        <div className="space-y-2">
          <p className="text-sm font-bold text-white">
            {picked === ringCup ? 'Olho clínico! Você achou a aliança! ✨' : `Estava na Taça ${ringCup + 1}!`}
          </p>
          <button
            type="button"
            onClick={() => {
              setRingCup(Math.floor(Math.random() * 3));
              setPicked(null);
              setPhase('peek');
            }}
            className="min-h-[44px] px-5 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 text-white text-xs font-bold cursor-pointer"
          >
            Nova Rodada
          </button>
        </div>
      )}
    </div>
  );
};
