import React, { useState, useEffect, useRef } from 'react';
import { Gamepad2, RotateCcw, Trophy, ArrowLeft } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { motion, AnimatePresence, useReducedMotion } from 'motion/react';
import { soundEngine } from '../../utils/audioSynth';

export const GamesView: React.FC = () => {
  const {
    addCoins,
    unlockAchievement,
    triggerHeartExplosion,
    gameRecords,
    updateGameRecord,
  } = useApp();

  const prefersReducedMotion = useReducedMotion();
  const [activeGame, setActiveGame] = useState<'menu' | 'quiz' | 'memoria' | 'coracoes' | 'velha'>('menu');

  // Quiz Game State
  const quizQuestions = [
    {
      question: 'Em que dia especial começou o nosso namoro oficial?',
      options: ['12 de Junho de 2023', '10 de Julho de 2023', '14 de Fevereiro de 2023', '25 de Dezembro de 2022'],
      correct: 0,
      reward: 15,
    },
    {
      question: 'O que o Gabriel mais ama na Samella?',
      options: [
        'O sorriso e a doçura do coração',
        'O jeito como ela ri das piadas bobas',
        'O abraço quentinho de acolhimento',
        'Absolutamente tudo nela! ♡',
      ],
      correct: 3,
      reward: 15,
    },
    {
      question: 'Qual é a nossa música romântica especial?',
      options: ['Te Vivo - Luan Santana', 'Photograph - Ed Sheeran', 'De Janeiro a Janeiro', 'Todas as que ouvimos juntos!'],
      correct: 3,
      reward: 15,
    },
    {
      question: 'O que Deus uniu...',
      options: ['O homem não separa! (Mateus 19:6)', 'É para todo o sempre', 'O amor fortalece diariamente', 'Todas as opções acima!'],
      correct: 3,
      reward: 15,
    },
  ];

  const [quizStep, setQuizStep] = useState(0);
  const [quizScore, setQuizScore] = useState(0);
  const [quizSelected, setQuizSelected] = useState<number | null>(null);
  const [quizFinished, setQuizFinished] = useState(false);

  const handleQuizAnswer = (optionIdx: number) => {
    if (quizSelected !== null) return;
    setQuizSelected(optionIdx);
    const isCorrect = optionIdx === quizQuestions[quizStep].correct;
    const updatedScore = isCorrect ? quizScore + 1 : quizScore;

    if (isCorrect) {
      soundEngine.playSparkle();
      setQuizScore(updatedScore);
    } else {
      soundEngine.playHeartPop();
    }

    setTimeout(() => {
      if (quizStep + 1 < quizQuestions.length) {
        setQuizStep((prev) => prev + 1);
        setQuizSelected(null);
      } else {
        setQuizFinished(true);
        if (updatedScore > (gameRecords.bestQuizScore || 0)) {
          updateGameRecord({ bestQuizScore: updatedScore });
        }
        addCoins(30, 'Quiz do Amor Concluído');
        unlockAchievement('ach-quiz-master');
        triggerHeartExplosion();
      }
    }, 1050);
  };

  // Memory Game State
  const memoryIcons = ['🌹', '💖', '💍', '💌', '🎵', '🐱'];
  const [memoryCards, setMemoryCards] = useState<{ id: number; icon: string; flipped: boolean; matched: boolean }[]>([]);
  const [flippedIndices, setFlippedIndices] = useState<number[]>([]);
  const [memoryMoves, setMemoryMoves] = useState(0);
  const [memoryCompleted, setMemoryCompleted] = useState(false);
  const memoryMovesRef = useRef(0);

  const initMemoryGame = () => {
    const deck = [...memoryIcons, ...memoryIcons]
      .sort(() => Math.random() - 0.5)
      .map((icon, idx) => ({ id: idx, icon, flipped: false, matched: false }));
    setMemoryCards(deck);
    setFlippedIndices([]);
    setMemoryMoves(0);
    memoryMovesRef.current = 0;
    setMemoryCompleted(false);
  };

  const handleFlipCard = (idx: number) => {
    if (flippedIndices.length === 2 || memoryCards[idx].flipped || memoryCards[idx].matched) return;
    soundEngine.playHeartPop();

    const newDeck = memoryCards.map((c, i) => (i === idx ? { ...c, flipped: true } : c));
    setMemoryCards(newDeck);

    const newFlipped = [...flippedIndices, idx];
    setFlippedIndices(newFlipped);

    if (newFlipped.length === 2) {
      const nextMoves = memoryMovesRef.current + 1;
      memoryMovesRef.current = nextMoves;
      setMemoryMoves(nextMoves);

      const [first, second] = newFlipped;
      if (newDeck[first].icon === newDeck[second].icon) {
        setTimeout(() => {
          soundEngine.playSparkle();
          setMemoryCards((prev) => {
            const updated = prev.map((c, i) =>
              i === first || i === second ? { ...c, matched: true } : c
            );
            if (updated.every((c) => c.matched)) {
              setMemoryCompleted(true);
              if (
                gameRecords.bestMemoryMoves === 0 ||
                nextMoves < gameRecords.bestMemoryMoves
              ) {
                updateGameRecord({ bestMemoryMoves: nextMoves });
              }
              addCoins(25, 'Jogo da Memória Vencido');
              unlockAchievement('ach-memory-game');
              triggerHeartExplosion();
            }
            return updated;
          });
          setFlippedIndices([]);
        }, 420);
      } else {
        setTimeout(() => {
          setMemoryCards((prev) =>
            prev.map((c, i) =>
              i === first || i === second ? { ...c, flipped: false } : c
            )
          );
          setFlippedIndices([]);
        }, 800);
      }
    }
  };

  // Catch Hearts Mini-Game State
  const [heartsCaught, setHeartsCaught] = useState(0);
  const [heartsTimeLeft, setHeartsTimeLeft] = useState(30);
  const [isCatchGameOver, setIsCatchGameOver] = useState(false);
  const [fallingHearts, setFallingHearts] = useState<
    { id: number; x: number; speed: number; icon: string }[]
  >([]);
  const heartsCaughtRef = useRef(0);

  const startCatchHeartsGame = () => {
    setHeartsCaught(0);
    heartsCaughtRef.current = 0;
    setHeartsTimeLeft(30);
    setIsCatchGameOver(false);
    setFallingHearts([]);
  };

  const commitCatchRecordIfNeeded = (score: number) => {
    if (score > (gameRecords.bestHearts || 0)) {
      updateGameRecord({ bestHearts: score });
    }
  };

  useEffect(() => {
    if (activeGame !== 'coracoes' || isCatchGameOver) return;
    const timerInterval = window.setInterval(() => {
      setHeartsTimeLeft((prev) => {
        if (prev <= 1) {
          window.clearInterval(timerInterval);
          setIsCatchGameOver(true);
          commitCatchRecordIfNeeded(heartsCaughtRef.current);
          soundEngine.playSparkle();
          triggerHeartExplosion();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => window.clearInterval(timerInterval);
  }, [activeGame, isCatchGameOver]);

  useEffect(() => {
    if (activeGame !== 'coracoes' || isCatchGameOver) return;
    const spawnInterval = window.setInterval(() => {
      setFallingHearts((prev) => {
        if (prev.length >= 8) return prev;
        return [
          ...prev,
          {
            id: Date.now() + Math.random(),
            x: Math.random() * 76 + 10,
            speed: Math.random() * 1.8 + 2.2,
            icon: ['💖', '💎', '🌹', '✨', '🍓'][Math.floor(Math.random() * 5)],
          },
        ];
      });
    }, 750);

    return () => window.clearInterval(spawnInterval);
  }, [activeGame, isCatchGameOver]);

  const handleCatchHeart = (id: number) => {
    if (isCatchGameOver) return;
    soundEngine.playSparkle();
    setFallingHearts((prev) => prev.filter((h) => h.id !== id));
    const next = heartsCaughtRef.current + 1;
    heartsCaughtRef.current = next;
    setHeartsCaught(next);
    if (next % 5 === 0) {
      addCoins(2, 'Corações coletados');
    }
  };

  // Tic Tac Toe State
  const [tictacBoard, setTictacBoard] = useState<(string | null)[]>(Array(9).fill(null));
  const [isGabrielTurn, setIsGabrielTurn] = useState(true);
  const [tictacWinner, setTictacWinner] = useState<string | null>(null);
  const [tictacMatchScore, setTictacMatchScore] = useState<{
    gabriel: number;
    samella: number;
    draws: number;
  }>({ gabriel: 0, samella: 0, draws: 0 });

  const checkTictacWinner = (squares: (string | null)[]) => {
    const lines = [
      [0, 1, 2],
      [3, 4, 5],
      [6, 7, 8],
      [0, 3, 6],
      [1, 4, 7],
      [2, 5, 8],
      [0, 4, 8],
      [2, 4, 6],
    ];
    for (let i = 0; i < lines.length; i++) {
      const [a, b, c] = lines[i];
      if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
        return squares[a];
      }
    }
    if (!squares.includes(null)) return 'draw';
    return null;
  };

  const handleTictacClick = (index: number) => {
    if (tictacBoard[index] || tictacWinner) return;

    soundEngine.playHeartPop();
    const newBoard = [...tictacBoard];
    const currentSymbol = isGabrielTurn ? '🌹' : '💖';
    newBoard[index] = currentSymbol;
    setTictacBoard(newBoard);
    setIsGabrielTurn(!isGabrielTurn);

    const winner = checkTictacWinner(newBoard);
    if (winner) {
      setTictacWinner(winner);
      setTictacMatchScore((prev) => ({
        gabriel: winner === '🌹' ? prev.gabriel + 1 : prev.gabriel,
        samella: winner === '💖' ? prev.samella + 1 : prev.samella,
        draws: winner === 'draw' ? prev.draws + 1 : prev.draws,
      }));

      if (winner !== 'draw') {
        soundEngine.playSparkle();
        updateGameRecord({ ticTacToeWins: (gameRecords.ticTacToeWins || 0) + 1 });
        addCoins(10, 'Vitória no Jogo da Velha do Amor');
        unlockAchievement('ach-tictac-win');
      }
    }
  };

  const resetTictac = () => {
    setTictacBoard(Array(9).fill(null));
    setTictacWinner(null);
    setIsGabrielTurn(true);
  };

  const liveBestHearts = Math.max(gameRecords.bestHearts || 0, heartsCaught);

  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
      className="space-y-5 pb-32 sm:pb-24 max-w-xl mx-auto"
    >
      {/* Header */}
      <div className="text-center space-y-1">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/20 border border-indigo-400/30 text-xs font-semibold text-indigo-300 mb-1">
          <Gamepad2 className="w-3.5 h-3.5" />
          <span>Jogos do Amor</span>
        </div>
        <h2 className="text-2xl md:text-3xl font-bold text-white font-display">
          Momentos de Diversão ♡
        </h2>
        <p className="text-xs md:text-sm text-purple-200/75">
          Jogue juntos, bata recordes e ganhe diamantes para a Loja.
        </p>
      </div>

      {/* Main Menu */}
      {activeGame === 'menu' && (
        <div className="grid grid-cols-1 gap-3.5">
          <motion.button
            type="button"
            whileHover={prefersReducedMotion ? undefined : { scale: 1.015 }}
            whileTap={{ scale: 0.985 }}
            onClick={() => {
              setQuizStep(0);
              setQuizScore(0);
              setQuizSelected(null);
              setQuizFinished(false);
              setActiveGame('quiz');
            }}
            className="w-full text-left glass-card-glow rounded-3xl p-4 sm:p-5 border border-pink-400/30 cursor-pointer flex items-center justify-between gap-3 shadow-lg"
          >
            <div className="flex items-center gap-3.5 min-w-0">
              <div className="w-12 h-12 rounded-2xl bg-pink-500/20 border border-pink-400/40 flex items-center justify-center text-2xl shrink-0">
                🏆
              </div>
              <div className="min-w-0">
                <h3 className="text-base font-bold text-white">Quiz do Casal</h3>
                <p className="text-xs text-purple-200/75">
                  Perguntas sobre nós dois • Recorde:{' '}
                  <strong className="text-pink-300">
                    {gameRecords.bestQuizScore || 0}/{quizQuestions.length}
                  </strong>
                </p>
              </div>
            </div>
            <span className="text-xs font-bold text-pink-300 shrink-0">+30 💎</span>
          </motion.button>

          <motion.button
            type="button"
            whileHover={prefersReducedMotion ? undefined : { scale: 1.015 }}
            whileTap={{ scale: 0.985 }}
            onClick={() => {
              initMemoryGame();
              setActiveGame('memoria');
            }}
            className="w-full text-left glass-card-glow rounded-3xl p-4 sm:p-5 border border-purple-400/30 cursor-pointer flex items-center justify-between gap-3 shadow-lg"
          >
            <div className="flex items-center gap-3.5 min-w-0">
              <div className="w-12 h-12 rounded-2xl bg-purple-500/20 border border-purple-400/40 flex items-center justify-center text-2xl shrink-0">
                🃏
              </div>
              <div className="min-w-0">
                <h3 className="text-base font-bold text-white">Jogo da Memória</h3>
                <p className="text-xs text-purple-200/75">
                  Encontre os pares • Melhor marca:{' '}
                  <strong className="text-purple-200">
                    {gameRecords.bestMemoryMoves > 0
                      ? `${gameRecords.bestMemoryMoves} jogadas`
                      : 'Sem recorde ainda'}
                  </strong>
                </p>
              </div>
            </div>
            <span className="text-xs font-bold text-pink-300 shrink-0">+25 💎</span>
          </motion.button>

          <motion.button
            type="button"
            whileHover={prefersReducedMotion ? undefined : { scale: 1.015 }}
            whileTap={{ scale: 0.985 }}
            onClick={() => {
              startCatchHeartsGame();
              setActiveGame('coracoes');
            }}
            className="w-full text-left glass-card-glow rounded-3xl p-4 sm:p-5 border border-teal-400/30 cursor-pointer flex items-center justify-between gap-3 shadow-lg"
          >
            <div className="flex items-center gap-3.5 min-w-0">
              <div className="w-12 h-12 rounded-2xl bg-teal-500/20 border border-teal-400/40 flex items-center justify-center text-2xl shrink-0">
                ✨
              </div>
              <div className="min-w-0">
                <h3 className="text-base font-bold text-white">Pegue os Corações</h3>
                <p className="text-xs text-purple-200/75">
                  Desafio 30s • Recorde:{' '}
                  <strong className="text-teal-300">{gameRecords.bestHearts || 0} corações</strong>
                </p>
              </div>
            </div>
            <span className="text-xs font-bold text-pink-300 shrink-0">Moedas 💎</span>
          </motion.button>

          <motion.button
            type="button"
            whileHover={prefersReducedMotion ? undefined : { scale: 1.015 }}
            whileTap={{ scale: 0.985 }}
            onClick={() => {
              resetTictac();
              setActiveGame('velha');
            }}
            className="w-full text-left glass-card-glow rounded-3xl p-4 sm:p-5 border border-rose-400/30 cursor-pointer flex items-center justify-between gap-3 shadow-lg"
          >
            <div className="flex items-center gap-3.5 min-w-0">
              <div className="w-12 h-12 rounded-2xl bg-rose-500/20 border border-rose-400/40 flex items-center justify-center text-2xl shrink-0">
                ⭕
              </div>
              <div className="min-w-0">
                <h3 className="text-base font-bold text-white">Jogo da Velha do Amor</h3>
                <p className="text-xs text-purple-200/75">
                  2 jogadores no mesmo celular • Vitórias:{' '}
                  <strong className="text-rose-300">{gameRecords.ticTacToeWins || 0}</strong>
                </p>
              </div>
            </div>
            <span className="text-xs font-bold text-pink-300 shrink-0">+10 💎</span>
          </motion.button>
        </div>
      )}

      {/* Quiz Game View */}
      {activeGame === 'quiz' && (
        <div className="glass-card-glow rounded-3xl p-5 sm:p-6 border border-pink-400/30 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-purple-500/20">
            <span className="text-xs text-pink-300 font-mono">
              Pergunta {quizStep + 1} de {quizQuestions.length}
            </span>
            <button
              onClick={() => setActiveGame('menu')}
              className="min-h-[40px] px-3 rounded-xl bg-white/5 text-xs text-purple-200 hover:text-white flex items-center gap-1 cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              Sair
            </button>
          </div>

          {!quizFinished ? (
            <div className="space-y-4 py-1">
              <h3 className="text-base md:text-lg font-bold text-white leading-snug">
                {quizQuestions[quizStep].question}
              </h3>

              <div className="space-y-2.5">
                {quizQuestions[quizStep].options.map((option, idx) => {
                  const isSelected = quizSelected === idx;
                  const isCorrect = idx === quizQuestions[quizStep].correct;

                  let btnStyle = 'border-purple-500/25 bg-purple-950/40 text-purple-100';
                  if (quizSelected !== null) {
                    if (isCorrect) btnStyle = 'border-emerald-400 bg-emerald-950/60 text-emerald-200';
                    else if (isSelected) btnStyle = 'border-rose-400 bg-rose-950/60 text-rose-200';
                  }

                  return (
                    <button
                      key={idx}
                      disabled={quizSelected !== null}
                      onClick={() => handleQuizAnswer(idx)}
                      className={`w-full min-h-[48px] p-3.5 rounded-2xl border text-left text-sm font-medium transition-all cursor-pointer ${btnStyle} hover:border-pink-400/40`}
                    >
                      {option}
                    </button>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="text-center py-6 space-y-3">
              <span className="text-4xl block">🎉</span>
              <h3 className="text-xl font-bold text-white">Parabéns, meu amor!</h3>
              <p className="text-xs text-purple-200">
                Você acertou {quizScore} de {quizQuestions.length} perguntas e ganhou +30 💎!
              </p>
              <div className="flex justify-center gap-2 pt-2">
                <button
                  onClick={() => {
                    setQuizStep(0);
                    setQuizScore(0);
                    setQuizSelected(null);
                    setQuizFinished(false);
                  }}
                  className="min-h-[44px] px-5 rounded-2xl border border-pink-400/40 text-pink-200 text-xs font-bold cursor-pointer"
                >
                  Jogar de Novo
                </button>
                <button
                  onClick={() => setActiveGame('menu')}
                  className="min-h-[44px] px-6 rounded-2xl bg-gradient-to-r from-purple-600 to-pink-600 text-white text-xs font-bold cursor-pointer"
                >
                  Voltar aos Jogos
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Memory Match Game View */}
      {activeGame === 'memoria' && (
        <div className="glass-card-glow rounded-3xl p-5 sm:p-6 border border-purple-400/30 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-purple-500/20">
            <div className="flex items-center gap-2.5 text-xs">
              <span className="text-purple-200 font-mono">
                Jogadas: <strong>{memoryMoves}</strong>
              </span>
              {gameRecords.bestMemoryMoves > 0 && (
                <span className="text-amber-300 font-mono flex items-center gap-1">
                  <Trophy className="w-3.5 h-3.5" />
                  {gameRecords.bestMemoryMoves}
                </span>
              )}
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={initMemoryGame}
                className="min-h-[40px] px-2.5 rounded-xl bg-pink-500/15 text-xs text-pink-300 flex items-center gap-1 cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reiniciar</span>
              </button>
              <button
                onClick={() => setActiveGame('menu')}
                className="min-h-[40px] px-3 rounded-xl bg-white/5 text-xs text-purple-200 hover:text-white cursor-pointer"
              >
                Sair
              </button>
            </div>
          </div>

          <div className="grid grid-cols-4 gap-2.5 max-w-xs mx-auto py-2">
            {memoryCards.map((card, idx) => (
              <motion.button
                key={card.id}
                whileTap={{ scale: 0.94 }}
                onClick={() => handleFlipCard(idx)}
                className={`aspect-square min-h-[56px] rounded-2xl flex items-center justify-center text-2xl border transition-all cursor-pointer ${
                  card.flipped || card.matched
                    ? 'bg-purple-900/60 border-pink-400/60 shadow-[0_0_15px_rgba(244,114,182,0.4)]'
                    : 'bg-purple-950/80 border-purple-500/30 text-purple-500'
                }`}
              >
                {card.flipped || card.matched ? card.icon : '♡'}
              </motion.button>
            ))}
          </div>

          {memoryCompleted && (
            <div className="text-center py-3 space-y-2">
              <h4 className="text-base font-bold text-pink-300">
                Vitória em {memoryMoves} jogadas! Parceria perfeita ♡
              </h4>
              <p className="text-xs text-purple-200">+25 Diamantes adicionados!</p>
              <div className="flex justify-center gap-2 pt-1">
                <button
                  onClick={initMemoryGame}
                  className="min-h-[44px] px-4 rounded-xl border border-purple-400/40 text-purple-200 text-xs font-semibold cursor-pointer"
                >
                  Jogar Novamente
                </button>
                <button
                  onClick={() => setActiveGame('menu')}
                  className="min-h-[44px] px-5 rounded-xl bg-pink-500/30 text-pink-100 text-xs font-semibold border border-pink-400/40 cursor-pointer"
                >
                  Voltar aos Jogos
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Catch Hearts View */}
      {activeGame === 'coracoes' && (
        <div className="glass-card-glow rounded-3xl p-5 sm:p-6 border border-teal-400/30 space-y-4 relative min-h-[390px] overflow-hidden">
          <div className="flex items-center justify-between pb-3 border-b border-purple-500/20">
            <div className="flex items-center gap-3 text-xs">
              <span className="text-teal-300 font-mono">
                Pontos: <strong>{heartsCaught}</strong>
              </span>
              <span className="text-pink-300 font-mono">
                Recorde: <strong>{liveBestHearts}</strong> 🏆
              </span>
            </div>

            <div className="flex items-center gap-2">
              <span
                className={`px-2.5 py-1 rounded-full text-xs font-mono font-bold ${
                  heartsTimeLeft <= 5
                    ? 'bg-rose-500 text-white animate-pulse'
                    : 'bg-purple-950 text-teal-300 border border-teal-500/40'
                }`}
              >
                ⏳ {heartsTimeLeft}s
              </span>
              <button
                onClick={() => {
                  commitCatchRecordIfNeeded(heartsCaughtRef.current);
                  setActiveGame('menu');
                }}
                className="min-h-[40px] px-3 rounded-xl bg-white/5 text-xs text-purple-200 hover:text-white cursor-pointer"
              >
                Sair
              </button>
            </div>
          </div>

          <p className="text-xs text-center text-purple-200/75">
            Toque rápido nos corações, diamantes e rosas antes que subam!
          </p>

          <div className="relative h-72 w-full">
            {fallingHearts.map((heart) => (
              <motion.button
                key={heart.id}
                initial={{ y: 240, opacity: 0 }}
                animate={{ y: 5, opacity: 1 }}
                transition={{ duration: heart.speed, ease: 'linear' }}
                onClick={() => handleCatchHeart(heart.id)}
                style={{ left: `${heart.x}%` }}
                className="absolute min-w-[48px] min-h-[48px] text-3xl p-2 cursor-pointer hover:scale-125 active:scale-90 transition-transform select-none"
              >
                {heart.icon}
              </motion.button>
            ))}

            {isCatchGameOver && (
              <div className="absolute inset-0 bg-black/85 backdrop-blur-sm rounded-2xl flex flex-col items-center justify-center p-4 text-center z-20 space-y-3">
                <span className="text-4xl">⏱️✨</span>
                <h3 className="text-lg font-bold text-white">Tempo Esgotado!</h3>
                <p className="text-xs text-purple-200">
                  Você coletou <strong>{heartsCaught}</strong> corações e itens mágicos!
                </p>
                {heartsCaught > 0 && heartsCaught >= (gameRecords.bestHearts || 0) && (
                  <span className="text-xs font-bold text-amber-300 bg-amber-500/20 px-3 py-1 rounded-full border border-amber-400/30">
                    🎉 Novo Recorde do Casal!
                  </span>
                )}
                <div className="flex gap-2 pt-2">
                  <button
                    onClick={startCatchHeartsGame}
                    className="min-h-[44px] px-4 rounded-xl bg-gradient-to-r from-teal-500 to-emerald-600 text-white text-xs font-bold cursor-pointer"
                  >
                    Jogar Novamente
                  </button>
                  <button
                    onClick={() => setActiveGame('menu')}
                    className="min-h-[44px] px-4 rounded-xl border border-purple-500/30 text-purple-200 text-xs font-semibold cursor-pointer"
                  >
                    Menu de Jogos
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tic Tac Toe Game */}
      {activeGame === 'velha' && (
        <div className="glass-card-glow rounded-3xl p-5 sm:p-6 border border-rose-400/30">
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm font-bold text-white flex items-center gap-1.5">
              <span className="text-xl">⭕</span> Jogo da Velha do Amor
            </span>
            <button
              onClick={() => setActiveGame('menu')}
              className="min-h-[40px] px-3 rounded-xl bg-white/5 text-xs text-purple-200 hover:text-white cursor-pointer"
            >
              Sair
            </button>
          </div>

          <div className="flex items-center justify-around p-2.5 rounded-2xl bg-purple-950/60 border border-purple-500/20 text-xs mb-4">
            <span className="text-rose-300 font-semibold">
              Gabriel 🌹: <strong>{tictacMatchScore.gabriel}</strong>
            </span>
            <span className="text-purple-400">|</span>
            <span className="text-pink-300 font-semibold">
              Samella 💖: <strong>{tictacMatchScore.samella}</strong>
            </span>
            <span className="text-purple-400">|</span>
            <span className="text-purple-300">
              Empates: <strong>{tictacMatchScore.draws}</strong>
            </span>
          </div>

          <div className="text-center mb-4">
            {tictacWinner ? (
              <h3 className="text-base sm:text-lg font-bold text-pink-300">
                {tictacWinner === 'draw'
                  ? 'Deu Velha! Almas gêmeas em sintonia 🤝'
                  : tictacWinner === '🌹'
                  ? 'Gabriel venceu! 🌹 “Samella, você é o amor da minha vida!”'
                  : 'Samella venceu! 💖 “Gabriel, meu coração é todinho seu!”'}
              </h3>
            ) : (
              <h3 className="text-sm font-bold text-white flex items-center justify-center gap-1.5">
                Vez de:{' '}
                <span className="text-base text-pink-300 font-extrabold">
                  {isGabrielTurn ? 'Gabriel 🌹' : 'Samella 💖'}
                </span>
              </h3>
            )}
          </div>

          <div className="grid grid-cols-3 gap-3 w-64 h-64 mx-auto mb-5">
            {tictacBoard.map((square, index) => (
              <motion.button
                key={index}
                whileTap={{ scale: 0.94 }}
                onClick={() => handleTictacClick(index)}
                className={`rounded-2xl border-2 shadow-lg flex items-center justify-center text-4xl transition-colors cursor-pointer ${
                  square
                    ? 'bg-purple-900/60 border-purple-500/50 cursor-default'
                    : 'glass-panel border-purple-400/30 hover:border-pink-400/50'
                }`}
              >
                <AnimatePresence>
                  {square && (
                    <motion.span
                      initial={{ scale: 0, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      className="drop-shadow-md"
                    >
                      {square}
                    </motion.span>
                  )}
                </AnimatePresence>
              </motion.button>
            ))}
          </div>

          {tictacWinner && (
            <button
              onClick={resetTictac}
              className="w-full min-h-[48px] py-3 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold text-sm shadow-md flex items-center justify-center gap-2 cursor-pointer active:scale-95 transition"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Jogar Nova Rodada</span>
            </button>
          )}
        </div>
      )}
    </motion.div>
  );
};
