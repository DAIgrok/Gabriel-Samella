import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  Gamepad2,
  RotateCcw,
  Trophy,
  ArrowLeft,
  Shuffle,
  Search,
  Bot,
  Users,
  Clock,
  Eye,
  Sparkles,
  Award,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { motion, AnimatePresence, useReducedMotion } from 'motion/react';
import { soundEngine } from '../../utils/audioSynth';
import {
  GAMES_CATALOG,
  GameCategory,
  GameId,
  MEMORY_THEMES,
  pickRandomItems,
} from '../../data/gamesCatalog';
import {
  TOTAL_CHALLENGE_UNIVERSE_COUNT,
  drawQuizDeck,
} from '../../data/massiveQuestionEngine';
import {
  EmojiCharadeGame,
  HangmanGame,
  LyricGame,
  MarathonGame,
  RiddleGame,
  ScrambleGame,
  TrueFalseGame,
  WhoMostLikelyGame,
  WordSearchGame,
} from './games/ArcadeGamesPackA';
import {
  BalloonPopGame,
  CupidMazeGame,
  Floral2048Game,
  GeniusGame,
  MastermindGame,
  MathSpeedGame,
  MinesweeperLoveGame,
  ReflexGame,
  RpsGame,
  ShellRingGame,
  TargetChronoGame,
  TowerStackGame,
} from './games/ArcadeGamesPackB';
import { QuizQuestion } from '../../types';
import { DiamondGemIcon, VectorGlyphIcon } from '../icons/CustomIcons';
import { GameVectorArt } from './games/GameVectorArt';

export const GamesView: React.FC = () => {
  const {
    claimGameReward,
    unlockAchievement,
    triggerHeartExplosion,
    gameRecords,
    updateGameRecord,
    customQuizQuestions,
    isSpectator,
  } = useApp();

  const prefersReducedMotion = useReducedMotion();
  const [activeGame, setActiveGame] = useState<'menu' | GameId>('menu');
  const [filterCat, setFilterCat] = useState<'all' | GameCategory>('all');
  const [searchTerm, setSearchTerm] = useState('');

  const handlePackWin = (diamonds: number, reason: string, score?: number) => {
    if (isSpectator) {
      soundEngine.playSparkle();
      triggerHeartExplosion();
      return;
    }
    const gameId = activeGame === 'menu' ? 'arcade' : activeGame;
    claimGameReward(gameId, diamonds, reason, score);
    triggerHeartExplosion();
  };

  // =========================================================================
  // 1. MEGA QUIZ STATE (Massive Combinatorial + Custom Creator Questions, 10 per Round)
  // =========================================================================
  const [quizDeck, setQuizDeck] = useState<QuizQuestion[]>(() =>
    drawQuizDeck(10, customQuizQuestions)
  );
  const [quizStep, setQuizStep] = useState(0);
  const [quizScore, setQuizScore] = useState(0);
  const [quizSelected, setQuizSelected] = useState<number | null>(null);
  const [quizFinished, setQuizFinished] = useState(false);

  const startQuiz = () => {
    setQuizDeck(drawQuizDeck(10, customQuizQuestions));
    setQuizStep(0);
    setQuizScore(0);
    setQuizSelected(null);
    setQuizFinished(false);
    setActiveGame('quiz');
  };

  const handleQuizAnswer = (optionIdx: number) => {
    if (quizSelected !== null) return;
    setQuizSelected(optionIdx);
    const currentQ = quizDeck[quizStep];
    const isCorrect = optionIdx === currentQ.correctIndex;
    const updatedScore = isCorrect ? quizScore + 1 : quizScore;

    if (isCorrect) {
      soundEngine.playSparkle();
      setQuizScore(updatedScore);
    } else {
      soundEngine.playHeartPop();
    }

    window.setTimeout(() => {
      if (quizStep + 1 < quizDeck.length) {
        setQuizStep((prev) => prev + 1);
        setQuizSelected(null);
      } else {
        setQuizFinished(true);
        const reward = updatedScore >= 9 ? 6 : updatedScore >= 6 ? 4 : 2;
        if (!isSpectator) {
          updateGameRecord({
            bestQuizScore: Math.max(updatedScore, gameRecords.bestQuizScore || 0),
            gamesPlayed: gameRecords.gamesPlayed || 0,
          });
          claimGameReward(
            'quiz',
            reward,
            `Mega Quiz (${updatedScore}/${quizDeck.length})`,
            updatedScore
          );
          unlockAchievement('ach-quiz-master');
          if (updatedScore >= 8) {
            unlockAchievement('ach-quiz-perfect');
          }
        }
        triggerHeartExplosion();
      }
    }, 950);
  };

  // =========================================================================
  // 2. DYNAMIC THEME MEMORY GAME (8 Vector Themes, Never Repeats)
  // =========================================================================
  const [memoryThemeName, setMemoryThemeName] = useState('Romance Clássico');
  const [memoryPairsCount, setMemoryPairsCount] = useState<6 | 8>(6);
  const [memoryCards, setMemoryCards] = useState<
    { id: number; icon: string; flipped: boolean; matched: boolean }[]
  >([]);
  const [flippedIndices, setFlippedIndices] = useState<number[]>([]);
  const [memoryMoves, setMemoryMoves] = useState(0);
  const [memoryCompleted, setMemoryCompleted] = useState(false);
  const memoryMovesRef = useRef(0);

  const initMemoryGame = (pairs: 6 | 8 = memoryPairsCount) => {
    const theme = MEMORY_THEMES[Math.floor(Math.random() * MEMORY_THEMES.length)];
    const chosenIcons = pickRandomItems(theme.icons, pairs);
    const deck = [...chosenIcons, ...chosenIcons]
      .sort(() => Math.random() - 0.5)
      .map((icon, idx) => ({ id: idx, icon, flipped: false, matched: false }));
    setMemoryThemeName(theme.name);
    setMemoryPairsCount(pairs);
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
        window.setTimeout(() => {
          soundEngine.playSparkle();
          setMemoryCards((prev) => {
            const updated = prev.map((c, i) =>
              i === first || i === second ? { ...c, matched: true } : c
            );
            if (updated.every((c) => c.matched)) {
              setMemoryCompleted(true);
              if (!isSpectator) {
                const bestNow = gameRecords.bestMemoryMoves || 0;
                updateGameRecord({
                  bestMemoryMoves: bestNow === 0 || nextMoves < bestNow ? nextMoves : bestNow,
                  gamesPlayed: gameRecords.gamesPlayed || 0,
                });
                claimGameReward(
                  'memoria',
                  memoryPairsCount === 8 ? 5 : 3,
                  `Memória (${memoryThemeName})`,
                  nextMoves
                );
              }
              triggerHeartExplosion();
            }
            return updated;
          });
          setFlippedIndices([]);
        }, 380);
      } else {
        window.setTimeout(() => {
          setMemoryCards((prev) =>
            prev.map((c, i) =>
              i === first || i === second ? { ...c, flipped: false } : c
            )
          );
          setFlippedIndices([]);
        }, 720);
      }
    }
  };

  // =========================================================================
  // 3. CATCH HEARTS MINI-GAME (Vector Art Targets)
  // =========================================================================
  const [heartsCaught, setHeartsCaught] = useState(0);
  const [heartsTimeLeft, setHeartsTimeLeft] = useState(25);
  const [isCatchGameOver, setIsCatchGameOver] = useState(false);
  const [fallingHearts, setFallingHearts] = useState<
    { id: number; x: number; speed: number; icon: string }[]
  >([]);
  const heartsCaughtRef = useRef(0);

  const startCatchHeartsGame = () => {
    setHeartsCaught(0);
    heartsCaughtRef.current = 0;
    setHeartsTimeLeft(25);
    setIsCatchGameOver(false);
    setFallingHearts([]);
  };

  useEffect(() => {
    if (activeGame !== 'coracoes' || isCatchGameOver) return;
    const timerInterval = window.setInterval(() => {
      setHeartsTimeLeft((prev) => {
        if (prev <= 1) {
          window.clearInterval(timerInterval);
          setIsCatchGameOver(true);
          const finalScore = heartsCaughtRef.current;
          const reward = Math.min(5, Math.max(2, Math.floor(finalScore / 5) + 2));
          if (!isSpectator) {
            updateGameRecord({
              bestHearts: Math.max(finalScore, gameRecords.bestHearts || 0),
              gamesPlayed: gameRecords.gamesPlayed || 0,
            });
            claimGameReward(
              'coracoes',
              reward,
              `Chuva de Corações (${finalScore} coletados)`,
              finalScore
            );
          }
          soundEngine.playSparkle();
          triggerHeartExplosion();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => window.clearInterval(timerInterval);
  }, [activeGame, isCatchGameOver, isSpectator]);

  useEffect(() => {
    if (activeGame !== 'coracoes' || isCatchGameOver) return;
    const tokens = ['heart', 'diamond', 'rose', 'sparkle', 'crown'];
    const spawnInterval = window.setInterval(() => {
      setFallingHearts((prev) => {
        if (prev.length >= 8) return prev;
        return [
          ...prev,
          {
            id: Date.now() + Math.random(),
            x: Math.random() * 76 + 10,
            speed: Math.random() * 1.4 + 1.9,
            icon: tokens[Math.floor(Math.random() * tokens.length)],
          },
        ];
      });
    }, 650);

    return () => window.clearInterval(spawnInterval);
  }, [activeGame, isCatchGameOver]);

  const handleCatchHeart = (id: number) => {
    if (isCatchGameOver) return;
    soundEngine.playSparkle();
    setFallingHearts((prev) => prev.filter((h) => h.id !== id));
    const next = heartsCaughtRef.current + 1;
    heartsCaughtRef.current = next;
    setHeartsCaught(next);
  };

  // =========================================================================
  // 4. TIC TAC TOE (1P vs Bot OR 2P — Vector Emblems: 'rose' | 'heart')
  // =========================================================================
  const [tictacMode, setTictacMode] = useState<'bot' | '2p'>('bot');
  const [tictacBoard, setTictacBoard] = useState<('rose' | 'heart' | null)[]>(Array(9).fill(null));
  const [isGabrielTurn, setIsGabrielTurn] = useState(true);
  const [tictacWinner, setTictacWinner] = useState<'rose' | 'heart' | 'draw' | null>(null);
  const [tictacMatchScore, setTictacMatchScore] = useState({
    gabriel: 0,
    samella: 0,
    draws: 0,
  });

  const checkTictacWinner = (squares: ('rose' | 'heart' | null)[]): 'rose' | 'heart' | 'draw' | null => {
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
    for (const [a, b, c] of lines) {
      if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
        return squares[a];
      }
    }
    if (!squares.includes(null)) return 'draw';
    return null;
  };

  const finalizeTictac = (winner: 'rose' | 'heart' | 'draw') => {
    setTictacWinner(winner);
    setTictacMatchScore((prev) => ({
      gabriel: winner === 'rose' ? prev.gabriel + 1 : prev.gabriel,
      samella: winner === 'heart' ? prev.samella + 1 : prev.samella,
      draws: winner === 'draw' ? prev.draws + 1 : prev.draws,
    }));
    const playerWon = winner === 'rose' || (tictacMode === '2p' && winner !== 'draw');
    if (winner !== 'draw') {
      soundEngine.playSparkle();
      if (!isSpectator && playerWon) {
        const nextWins = (gameRecords.ticTacToeWins || 0) + 1;
        updateGameRecord({
          ticTacToeWins: nextWins,
          gamesPlayed: gameRecords.gamesPlayed || 0,
        });
        claimGameReward('velha', 3, 'Vitória no Jogo da Velha do Amor', nextWins);
        unlockAchievement('ach-tictac-win');
      }
    }
  };

  const handleTictacClick = (index: number) => {
    if (tictacBoard[index] || tictacWinner) return;
    if (tictacMode === 'bot' && !isGabrielTurn) return;

    soundEngine.playHeartPop();
    const newBoard = [...tictacBoard];
    newBoard[index] = isGabrielTurn ? 'rose' : 'heart';
    setTictacBoard(newBoard);

    const winner = checkTictacWinner(newBoard);
    if (winner) {
      finalizeTictac(winner);
      return;
    }

    if (tictacMode === '2p') {
      setIsGabrielTurn(!isGabrielTurn);
      return;
    }

    setIsGabrielTurn(false);
    window.setTimeout(() => {
      const emptyIdx = newBoard.map((v, i) => (v === null ? i : -1)).filter((i) => i >= 0);
      if (emptyIdx.length === 0) return;

      let chosen: number | null = null;
      for (const sym of ['heart', 'rose'] as const) {
        for (const i of emptyIdx) {
          const test = [...newBoard];
          test[i] = sym;
          if (checkTictacWinner(test) === sym) {
            chosen = i;
            break;
          }
        }
        if (chosen !== null) break;
      }
      if (chosen === null) {
        chosen = newBoard[4] === null ? 4 : emptyIdx[Math.floor(Math.random() * emptyIdx.length)];
      }

      const afterBot = [...newBoard];
      afterBot[chosen] = 'heart';
      setTictacBoard(afterBot);
      const botWin = checkTictacWinner(afterBot);
      if (botWin) {
        finalizeTictac(botWin);
      } else {
        setIsGabrielTurn(true);
      }
    }, 420);
  };

  const resetTictac = () => {
    setTictacBoard(Array(9).fill(null));
    setTictacWinner(null);
    setIsGabrielTurn(true);
  };

  const launchGame = (id: GameId) => {
    soundEngine.playHeartPop();
    if (id === 'quiz') {
      startQuiz();
    } else if (id === 'memoria') {
      initMemoryGame(memoryPairsCount);
      setActiveGame('memoria');
    } else if (id === 'coracoes') {
      startCatchHeartsGame();
      setActiveGame('coracoes');
    } else if (id === 'velha') {
      resetTictac();
      setActiveGame('velha');
    } else {
      setActiveGame(id);
    }
  };

  const launchRandomGame = () => {
    const picked = GAMES_CATALOG[Math.floor(Math.random() * GAMES_CATALOG.length)];
    launchGame(picked.id);
  };

  const filteredGames = useMemo(() => {
    return GAMES_CATALOG.filter((g) => {
      const catOk = filterCat === 'all' || g.category === filterCat;
      const q = searchTerm.trim().toLowerCase();
      const textOk =
        !q ||
        g.title.toLowerCase().includes(q) ||
        g.description.toLowerCase().includes(q);
      return catOk && textOk;
    });
  }, [filterCat, searchTerm]);

  const liveBestHearts = Math.max(gameRecords.bestHearts || 0, heartsCaught);

  return (
    <motion.div
      initial={prefersReducedMotion ? false : { opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.25 }}
      className="space-y-5 pb-32 sm:pb-24 max-w-3xl mx-auto"
    >
      {/* Header */}
      <div className="text-center space-y-1.5">
        <p className="text-xs text-pink-300/90 font-medium inline-flex items-center gap-1.5">
          <Gamepad2 className="w-3.5 h-3.5" />
          <span>
            Arcade do Casal · 25 Jogos & {TOTAL_CHALLENGE_UNIVERSE_COUNT.toLocaleString('pt-BR')}+ Desafios
          </span>
        </p>
        <h2 className="text-2xl md:text-3xl font-bold text-white font-display">
          Momentos de Diversão ♡
        </h2>
        <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1 text-xs text-purple-200/75 tabular-nums">
          <span>Partidas: <strong className="text-white">{gameRecords.gamesPlayed || 0}</strong></span>
          <span>·</span>
          <span>Quiz: <strong className="text-pink-300">{gameRecords.bestQuizScore || 0}/10</strong></span>
          <span>·</span>
          <span>Memória: <strong className="text-purple-200">{gameRecords.bestMemoryMoves || 0}</strong></span>
          <span>·</span>
          <span>Velha: <strong className="text-rose-300">{gameRecords.ticTacToeWins || 0}</strong></span>
        </div>
      </div>

      {isSpectator && (
        <div className="rounded-2xl bg-purple-950/65 border border-purple-400/35 px-4 py-2.5 flex items-center justify-center gap-2 text-xs text-purple-200">
          <Eye className="w-4 h-4 text-pink-300 shrink-0" />
          <span>Modo Espectador: todos os 25 jogos estão liberados para diversão, sem somar diamantes na carteira da Samella.</span>
        </div>
      )}

      {/* Main Hub Menu */}
      {activeGame === 'menu' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-2.5">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-purple-300/60 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Buscar entre os 25 jogos..."
                className="w-full min-h-[44px] pl-10 pr-4 rounded-2xl bg-purple-950/60 border border-purple-500/30 text-sm text-white placeholder:text-purple-300/40 focus:outline-none focus:border-pink-400"
              />
            </div>
            <button
              type="button"
              onClick={launchRandomGame}
              className="min-h-[44px] px-4 rounded-2xl bg-gradient-to-r from-purple-600 to-pink-600 text-white text-xs font-bold flex items-center justify-center gap-2 shadow-md cursor-pointer shrink-0 active:scale-95 transition"
            >
              <Shuffle className="w-4 h-4" />
              <span>Jogo Aleatório</span>
            </button>
          </div>

          {/* Category Segmented Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
            {[
              { id: 'all', label: 'Todos (25)' },
              { id: 'quiz', label: 'Quiz & Casal' },
              { id: 'palavras', label: 'Palavras' },
              { id: 'logica', label: 'Lógica' },
              { id: 'acao', label: 'Ação & Sorte' },
            ].map((cat) => (
              <button
                key={cat.id}
                type="button"
                onClick={() => setFilterCat(cat.id as 'all' | GameCategory)}
                className={`min-h-[40px] px-3.5 rounded-xl text-xs font-semibold whitespace-nowrap shrink-0 cursor-pointer transition-colors border ${
                  filterCat === cat.id
                    ? 'bg-pink-600/30 border-pink-400/60 text-white'
                    : 'bg-purple-950/40 border-purple-500/20 text-purple-200/75 hover:text-white'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {/* 25-Game Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {filteredGames.map((game) => (
              <motion.button
                key={game.id}
                type="button"
                whileHover={prefersReducedMotion ? undefined : { scale: 1.01 }}
                whileTap={{ scale: 0.985 }}
                onClick={() => launchGame(game.id)}
                className="w-full text-left rounded-2xl p-4 bg-gradient-to-br from-[#190933]/90 to-[#0d031b]/95 border border-purple-500/25 hover:border-pink-400/50 cursor-pointer flex items-center justify-between gap-3 shadow-md transition-colors"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-purple-800/60 to-pink-900/40 border border-purple-400/35 flex items-center justify-center text-pink-200 shrink-0">
                    <VectorGlyphIcon name={game.icon} className="w-6 h-6" />
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-sm font-bold text-white truncate">{game.title}</h3>
                    <p className="text-xs text-purple-200/75 line-clamp-1">{game.description}</p>
                    <span className="text-[11px] font-semibold text-pink-300 mt-0.5 inline-flex items-center gap-1">
                      <DiamondGemIcon className="w-3.5 h-3.5" />
                      <span>{game.rewardText}</span>
                    </span>
                  </div>
                </div>
              </motion.button>
            ))}
          </div>
        </div>
      )}

      {/* QUIZ GAME VIEW */}
      {activeGame === 'quiz' && (
        <div className="glass-card-glow rounded-3xl p-5 sm:p-6 border border-pink-400/30 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-purple-500/20">
            <div>
              <span className="text-xs text-pink-300 font-mono">
                Pergunta {quizStep + 1} de {quizDeck.length}
              </span>
              {quizDeck[quizStep]?.category && (
                <span className="text-xs text-purple-300/75 ml-2">· {quizDeck[quizStep].category}</span>
              )}
            </div>
            <button
              type="button"
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
                {quizDeck[quizStep]?.question}
              </h3>

              <div className="space-y-2.5">
                {quizDeck[quizStep]?.options.map((option, idx) => {
                  const isSelected = quizSelected === idx;
                  const isCorrect = idx === quizDeck[quizStep].correctIndex;

                  let btnStyle = 'border-purple-500/25 bg-purple-950/40 text-purple-100';
                  if (quizSelected !== null) {
                    if (isCorrect) btnStyle = 'border-emerald-400 bg-emerald-950/60 text-emerald-200';
                    else if (isSelected) btnStyle = 'border-rose-400 bg-rose-950/60 text-rose-200';
                  }

                  return (
                    <button
                      key={idx}
                      type="button"
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
              <div className="w-14 h-14 mx-auto rounded-2xl bg-pink-500/20 border border-pink-400/40 flex items-center justify-center text-amber-300">
                <Award className="w-7 h-7" />
              </div>
              <h3 className="text-xl font-bold text-white">Parabéns, meu amor!</h3>
              <p className="text-xs text-purple-200">
                Você acertou {quizScore} de {quizDeck.length} perguntas sorteadas!
              </p>
              <div className="flex justify-center gap-2 pt-2">
                <button
                  type="button"
                  onClick={startQuiz}
                  className="min-h-[44px] px-5 rounded-2xl border border-pink-400/40 text-pink-200 text-xs font-bold cursor-pointer"
                >
                  Novas Perguntas
                </button>
                <button
                  type="button"
                  onClick={() => setActiveGame('menu')}
                  className="min-h-[44px] px-6 rounded-2xl bg-gradient-to-r from-purple-600 to-pink-600 text-white text-xs font-bold cursor-pointer"
                >
                  Voltar ao Arcade
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* MEMORY GAME VIEW */}
      {activeGame === 'memoria' && (
        <div className="glass-card-glow rounded-3xl p-5 sm:p-6 border border-purple-400/30 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-purple-500/20">
            <div className="text-xs space-y-0.5">
              <div className="text-pink-200 font-bold">Tema: {memoryThemeName}</div>
              <div className="flex items-center gap-2.5 text-purple-200 font-mono">
                <span>Jogadas: <strong>{memoryMoves}</strong></span>
                {gameRecords.bestMemoryMoves > 0 && (
                  <span className="text-amber-300 flex items-center gap-1">
                    <Trophy className="w-3.5 h-3.5" />
                    {gameRecords.bestMemoryMoves}
                  </span>
                )}
              </div>
            </div>
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => initMemoryGame(memoryPairsCount === 6 ? 8 : 6)}
                className="min-h-[40px] px-2.5 rounded-xl bg-purple-900/50 text-xs text-purple-200 cursor-pointer"
              >
                {memoryPairsCount === 6 ? '8 Pares' : '6 Pares'}
              </button>
              <button
                type="button"
                onClick={() => initMemoryGame(memoryPairsCount)}
                className="min-h-[40px] px-2.5 rounded-xl bg-pink-500/15 text-xs text-pink-300 flex items-center gap-1 cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Novo Tema</span>
              </button>
              <button
                type="button"
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
                type="button"
                whileTap={{ scale: 0.94 }}
                onClick={() => handleFlipCard(idx)}
                className={`aspect-square min-h-[56px] rounded-2xl flex items-center justify-center border transition-all cursor-pointer ${
                  card.flipped || card.matched
                    ? 'bg-purple-900/65 border-pink-400/60 shadow-[0_0_15px_rgba(244,114,182,0.4)]'
                    : 'bg-purple-950/80 border-purple-500/30 text-purple-400 text-xl font-bold'
                }`}
              >
                {card.flipped || card.matched ? (
                  <GameVectorArt token={card.icon} className="w-8 h-8" />
                ) : (
                  '♡'
                )}
              </motion.button>
            ))}
          </div>

          {memoryCompleted && (
            <div className="text-center py-3 space-y-2">
              <h4 className="text-base font-bold text-pink-300">
                Vitória em {memoryMoves} jogadas!
              </h4>
              <div className="flex justify-center gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => initMemoryGame(memoryPairsCount)}
                  className="min-h-[44px] px-4 rounded-xl border border-purple-400/40 text-purple-200 text-xs font-semibold cursor-pointer"
                >
                  Sortear Outro Tema
                </button>
                <button
                  type="button"
                  onClick={() => setActiveGame('menu')}
                  className="min-h-[44px] px-5 rounded-xl bg-pink-500/30 text-pink-100 text-xs font-semibold border border-pink-400/40 cursor-pointer"
                >
                  Voltar ao Arcade
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* CATCH HEARTS VIEW */}
      {activeGame === 'coracoes' && (
        <div className="glass-card-glow rounded-3xl p-5 sm:p-6 border border-teal-400/30 space-y-4 relative min-h-[390px] overflow-hidden">
          <div className="flex items-center justify-between pb-3 border-b border-purple-500/20">
            <div className="flex items-center gap-3 text-xs">
              <span className="text-teal-300 font-mono">
                Pontos: <strong>{heartsCaught}</strong>
              </span>
              <span className="text-pink-300 font-mono inline-flex items-center gap-1">
                <Trophy className="w-3.5 h-3.5 text-amber-300" />
                <span>Recorde: <strong>{liveBestHearts}</strong></span>
              </span>
            </div>

            <div className="flex items-center gap-2">
              <span
                className={`px-2.5 py-1 rounded-full text-xs font-mono font-bold inline-flex items-center gap-1 ${
                  heartsTimeLeft <= 5
                    ? 'bg-rose-500 text-white'
                    : 'bg-purple-950 text-teal-300 border border-teal-500/40'
                }`}
              >
                <Clock className="w-3.5 h-3.5" />
                <span>{heartsTimeLeft}s</span>
              </span>
              <button
                type="button"
                onClick={() => setActiveGame('menu')}
                className="min-h-[40px] px-3 rounded-xl bg-white/5 text-xs text-purple-200 hover:text-white cursor-pointer"
              >
                Sair
              </button>
            </div>
          </div>

          <p className="text-xs text-center text-purple-200/75">
            Toque rápido nos corações, cristais e rosas antes que subam!
          </p>

          <div className="relative h-72 w-full">
            {fallingHearts.map((heart) => (
              <motion.button
                key={heart.id}
                type="button"
                initial={{ y: 240, opacity: 0 }}
                animate={{ y: 5, opacity: 1 }}
                transition={{ duration: heart.speed, ease: 'linear' }}
                onClick={() => handleCatchHeart(heart.id)}
                style={{ left: `${heart.x}%` }}
                className="absolute min-w-[48px] min-h-[48px] p-2 cursor-pointer active:scale-90 transition-transform select-none flex items-center justify-center"
              >
                <GameVectorArt token={heart.icon} className="w-9 h-9 drop-shadow-[0_0_8px_rgba(244,114,182,0.55)]" />
              </motion.button>
            ))}

            {isCatchGameOver && (
              <div className="absolute inset-0 bg-black/85 backdrop-blur-sm rounded-2xl flex flex-col items-center justify-center p-4 text-center z-20 space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-teal-500/20 border border-teal-400/40 flex items-center justify-center text-teal-300">
                  <Sparkles className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-white">Tempo Esgotado!</h3>
                <p className="text-xs text-purple-200">
                  Você coletou <strong>{heartsCaught}</strong> emblemas mágicos!
                </p>
                <div className="flex gap-2 pt-2">
                  <button
                    type="button"
                    onClick={startCatchHeartsGame}
                    className="min-h-[44px] px-4 rounded-xl bg-gradient-to-r from-teal-500 to-emerald-600 text-white text-xs font-bold cursor-pointer"
                  >
                    Jogar Novamente
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveGame('menu')}
                    className="min-h-[44px] px-4 rounded-xl border border-purple-500/30 text-purple-200 text-xs font-semibold cursor-pointer"
                  >
                    Arcade
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TIC TAC TOE VIEW */}
      {activeGame === 'velha' && (
        <div className="glass-card-glow rounded-3xl p-5 sm:p-6 border border-rose-400/30 space-y-4">
          <div className="flex items-center justify-between gap-2">
            <span className="text-sm font-bold text-white flex items-center gap-2">
              <GameVectorArt token="heart" className="w-5 h-5" />
              <span>Jogo da Velha do Amor</span>
            </span>
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => {
                  setTictacMode((m) => (m === 'bot' ? '2p' : 'bot'));
                  resetTictac();
                }}
                className="min-h-[40px] px-3 rounded-xl bg-purple-900/60 border border-purple-400/30 text-xs text-pink-200 flex items-center gap-1 cursor-pointer"
              >
                {tictacMode === 'bot' ? <Bot className="w-3.5 h-3.5" /> : <Users className="w-3.5 h-3.5" />}
                <span>{tictacMode === 'bot' ? 'Vs Bot' : '2 Jogadores'}</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveGame('menu')}
                className="min-h-[40px] px-3 rounded-xl bg-white/5 text-xs text-purple-200 hover:text-white cursor-pointer"
              >
                Sair
              </button>
            </div>
          </div>

          <div className="flex items-center justify-around p-2.5 rounded-2xl bg-purple-950/60 border border-purple-500/20 text-xs">
            <span className="text-rose-300 font-semibold inline-flex items-center gap-1.5">
              <GameVectorArt token="rose" className="w-4 h-4" />
              <span>{tictacMode === 'bot' ? 'Você' : 'Gabriel'}: <strong>{tictacMatchScore.gabriel}</strong></span>
            </span>
            <span className="text-purple-400">|</span>
            <span className="text-pink-300 font-semibold inline-flex items-center gap-1.5">
              <GameVectorArt token="heart" className="w-4 h-4" />
              <span>{tictacMode === 'bot' ? 'Cupido' : 'Samella'}: <strong>{tictacMatchScore.samella}</strong></span>
            </span>
            <span className="text-purple-400">|</span>
            <span className="text-purple-300">
              Empates: <strong>{tictacMatchScore.draws}</strong>
            </span>
          </div>

          <div className="text-center">
            {tictacWinner ? (
              <h3 className="text-base font-bold text-pink-300">
                {tictacWinner === 'draw'
                  ? 'Deu Velha! Empate equilibrado'
                  : tictacWinner === 'rose'
                  ? 'Vitória das Rosas!'
                  : 'Vitória dos Corações!'}
              </h3>
            ) : (
              <h3 className="text-sm font-bold text-white">
                Vez de:{' '}
                <span className="text-pink-300">
                  {isGabrielTurn
                    ? tictacMode === 'bot'
                      ? 'Você (Rosa)'
                      : 'Gabriel (Rosa)'
                    : tictacMode === 'bot'
                    ? 'Cupido Bot (Coração)'
                    : 'Samella (Coração)'}
                </span>
              </h3>
            )}
          </div>

          <div className="grid grid-cols-3 gap-3 w-64 h-64 mx-auto">
            {tictacBoard.map((square, index) => (
              <motion.button
                key={index}
                type="button"
                whileTap={{ scale: 0.94 }}
                onClick={() => handleTictacClick(index)}
                className={`rounded-2xl border-2 shadow-lg flex items-center justify-center transition-colors cursor-pointer ${
                  square
                    ? 'bg-purple-900/60 border-purple-500/50 cursor-default'
                    : 'glass-panel border-purple-400/30 hover:border-pink-400/50'
                }`}
              >
                <AnimatePresence>
                  {square && (
                    <motion.div
                      initial={{ scale: 0, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                    >
                      <GameVectorArt token={square} className="w-11 h-11" />
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.button>
            ))}
          </div>

          {tictacWinner && (
            <button
              type="button"
              onClick={resetTictac}
              className="w-full min-h-[48px] py-3 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold text-sm shadow-md flex items-center justify-center gap-2 cursor-pointer"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Jogar Nova Rodada</span>
            </button>
          )}
        </div>
      )}

      {/* PACK A GAMES */}
      {activeGame === 'forca' && <HangmanGame onWin={handlePackWin} onExit={() => setActiveGame('menu')} isSpectator={isSpectator} />}
      {activeGame === 'embaralhada' && <ScrambleGame onWin={handlePackWin} onExit={() => setActiveGame('menu')} isSpectator={isSpectator} />}
      {activeGame === 'verdadeiro' && <TrueFalseGame onWin={handlePackWin} onExit={() => setActiveGame('menu')} isSpectator={isSpectator} />}
      {activeGame === 'letra' && <LyricGame onWin={handlePackWin} onExit={() => setActiveGame('menu')} isSpectator={isSpectator} />}
      {activeGame === 'emoji' && <EmojiCharadeGame onWin={handlePackWin} onExit={() => setActiveGame('menu')} isSpectator={isSpectator} />}
      {activeGame === 'quemnós' && <WhoMostLikelyGame onWin={handlePackWin} onExit={() => setActiveGame('menu')} isSpectator={isSpectator} />}
      {activeGame === 'charadas' && <RiddleGame onWin={handlePackWin} onExit={() => setActiveGame('menu')} isSpectator={isSpectator} />}
      {activeGame === 'cacapalavras' && <WordSearchGame onWin={handlePackWin} onExit={() => setActiveGame('menu')} isSpectator={isSpectator} />}
      {activeGame === 'maratona' && <MarathonGame onWin={handlePackWin} onExit={() => setActiveGame('menu')} isSpectator={isSpectator} />}

      {/* PACK B GAMES */}
      {activeGame === 'ppt' && <RpsGame onWin={handlePackWin} onExit={() => setActiveGame('menu')} isSpectator={isSpectator} />}
      {activeGame === 'matematica' && <MathSpeedGame onWin={handlePackWin} onExit={() => setActiveGame('menu')} isSpectator={isSpectator} />}
      {activeGame === 'genius' && <GeniusGame onWin={handlePackWin} onExit={() => setActiveGame('menu')} isSpectator={isSpectator} />}
      {activeGame === 'flores2048' && <Floral2048Game onWin={handlePackWin} onExit={() => setActiveGame('menu')} isSpectator={isSpectator} />}
      {activeGame === 'codigosecreto' && <MastermindGame onWin={handlePackWin} onExit={() => setActiveGame('menu')} isSpectator={isSpectator} />}
      {activeGame === 'campominado' && <MinesweeperLoveGame onWin={handlePackWin} onExit={() => setActiveGame('menu')} isSpectator={isSpectator} />}
      {activeGame === 'labirinto' && <CupidMazeGame onWin={handlePackWin} onExit={() => setActiveGame('menu')} isSpectator={isSpectator} />}
      {activeGame === 'baloes' && <BalloonPopGame onWin={handlePackWin} onExit={() => setActiveGame('menu')} isSpectator={isSpectator} />}
      {activeGame === 'torre' && <TowerStackGame onWin={handlePackWin} onExit={() => setActiveGame('menu')} isSpectator={isSpectator} />}
      {activeGame === 'cronometro' && <TargetChronoGame onWin={handlePackWin} onExit={() => setActiveGame('menu')} isSpectator={isSpectator} />}
      {activeGame === 'reflexo' && <ReflexGame onWin={handlePackWin} onExit={() => setActiveGame('menu')} isSpectator={isSpectator} />}
      {activeGame === 'anel' && <ShellRingGame onWin={handlePackWin} onExit={() => setActiveGame('menu')} isSpectator={isSpectator} />}
    </motion.div>
  );
};
