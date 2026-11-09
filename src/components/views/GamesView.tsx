import React, { useState, useEffect } from 'react';
import { Gamepad2, Heart, RotateCcw, Award, Sparkles, Check, X } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { motion, AnimatePresence } from 'motion/react';
import { soundEngine } from '../../utils/audioSynth';

export const GamesView: React.FC = () => {
  const { addCoins, unlockAchievement, triggerHeartExplosion, config } = useApp();
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
      options: ['O sorriso e a doçura do coração', 'O jeito como ela ri das piadas bobas', 'O abraço quentinho de acolhimento', 'Absolutamente tudo nela! ♡'],
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
    setQuizSelected(optionIdx);
    const isCorrect = optionIdx === quizQuestions[quizStep].correct;
    if (isCorrect) {
      soundEngine.playSparkle();
      setQuizScore((prev) => prev + 1);
    } else {
      soundEngine.playHeartPop();
    }

    setTimeout(() => {
      if (quizStep + 1 < quizQuestions.length) {
        setQuizStep((prev) => prev + 1);
        setQuizSelected(null);
      } else {
        setQuizFinished(true);
        addCoins(30, 'Quiz do Amor Concluído');
        unlockAchievement('ach-quiz-master');
        triggerHeartExplosion();
      }
    }, 1200);
  };

  // Memory Game State
  const memoryIcons = ['🌹', '💖', '💍', '💌', '🎵', '🐱'];
  const [memoryCards, setMemoryCards] = useState<{ id: number; icon: string; flipped: boolean; matched: boolean }[]>([]);
  const [flippedIndices, setFlippedIndices] = useState<number[]>([]);
  const [memoryCompleted, setMemoryCompleted] = useState(false);

  const initMemoryGame = () => {
    const deck = [...memoryIcons, ...memoryIcons]
      .sort(() => Math.random() - 0.5)
      .map((icon, idx) => ({ id: idx, icon, flipped: false, matched: false }));
    setMemoryCards(deck);
    setFlippedIndices([]);
    setMemoryCompleted(false);
  };

  const handleFlipCard = (idx: number) => {
    if (flippedIndices.length === 2 || memoryCards[idx].flipped || memoryCards[idx].matched) return;
    soundEngine.playHeartPop();

    const newDeck = [...memoryCards];
    newDeck[idx].flipped = true;
    setMemoryCards(newDeck);

    const newFlipped = [...flippedIndices, idx];
    setFlippedIndices(newFlipped);

    if (newFlipped.length === 2) {
      const [first, second] = newFlipped;
      if (newDeck[first].icon === newDeck[second].icon) {
        // Matched
        setTimeout(() => {
          soundEngine.playSparkle();
          newDeck[first].matched = true;
          newDeck[second].matched = true;
          setMemoryCards([...newDeck]);
          setFlippedIndices([]);

          if (newDeck.every((c) => c.matched)) {
            setMemoryCompleted(true);
            addCoins(25, 'Jogo da Memória Vencido');
            unlockAchievement('ach-memory-game');
            triggerHeartExplosion();
          }
        }, 500);
      } else {
        // Not matched
        setTimeout(() => {
          newDeck[first].flipped = false;
          newDeck[second].flipped = false;
          setMemoryCards([...newDeck]);
          setFlippedIndices([]);
        }, 900);
      }
    }
  };

  // Catch Hearts Mini-Game State
  const [heartsCaught, setHeartsCaught] = useState(0);
  const [fallingHearts, setFallingHearts] = useState<{ id: number; x: number; y: number; speed: number; icon: string }[]>([]);

  const startCatchHeartsGame = () => {
    setHeartsCaught(0);
    setFallingHearts([]);
  };

  useEffect(() => {
    if (activeGame !== 'coracoes') return;
    const interval = setInterval(() => {
      if (fallingHearts.length < 6) {
        setFallingHearts((prev) => [
          ...prev,
          {
            id: Date.now() + Math.random(),
            x: Math.random() * 80 + 10,
            y: -10,
            speed: Math.random() * 2 + 2,
            icon: ['💖', '💎', '🌹', '✨'][Math.floor(Math.random() * 4)],
          },
        ]);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [activeGame, fallingHearts.length]);

  const handleCatchHeart = (id: number) => {
    soundEngine.playSparkle();
    setFallingHearts((prev) => prev.filter((h) => h.id !== id));
    setHeartsCaught((prev) => {
      const next = prev + 1;
      if (next % 5 === 0) {
        addCoins(5, 'Corações coletados');
      }
      return next;
    });
  };

  // Tic Tac Toe State
  const [tictacBoard, setTictacBoard] = useState<(string | null)[]>(Array(9).fill(null));
  const [isXNext, setIsXNext] = useState(true);
  const [tictacWinner, setTictacWinner] = useState<string | null>(null);

  const checkTictacWinner = (squares: (string | null)[]) => {
    const lines = [
      [0, 1, 2], [3, 4, 5], [6, 7, 8],
      [0, 3, 6], [1, 4, 7], [2, 5, 8],
      [0, 4, 8], [2, 4, 6],
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
    newBoard[index] = isXNext ? '💖' : '🌟';
    setTictacBoard(newBoard);
    setIsXNext(!isXNext);
    
    const winner = checkTictacWinner(newBoard);
    if (winner) {
      setTictacWinner(winner);
      if (winner !== 'draw') {
        soundEngine.playSparkle();
        addCoins(10, 'Vitória no Jogo da Velha');
      }
    }
  };

  const resetTictac = () => {
    setTictacBoard(Array(9).fill(null));
    setTictacWinner(null);
    setIsXNext(true);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 16, filter: 'blur(4px)' }}
      animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
      exit={{ opacity: 0, y: -12, filter: 'blur(4px)' }}
      transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
      className="space-y-6 pb-32 sm:pb-24 max-w-xl mx-auto"
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
        <p className="text-xs md:text-sm text-purple-200/70">
          Jogue juntos e ganhe diamantes para usar na Loja do Amor.
        </p>
      </div>

      {/* Main Menu */}
      {activeGame === 'menu' && (
        <div className="grid grid-cols-1 gap-4">
          <motion.div
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => {
              setQuizStep(0);
              setQuizScore(0);
              setQuizSelected(null);
              setQuizFinished(false);
              setActiveGame('quiz');
            }}
            className="glass-card-glow rounded-3xl p-5 border border-pink-400/30 cursor-pointer flex items-center justify-between shadow-lg"
          >
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-2xl bg-pink-500/20 border border-pink-400/40 flex items-center justify-center text-2xl">
                🏆
              </div>
              <div>
                <h3 className="text-base font-bold text-white">Quiz do Casal</h3>
                <p className="text-xs text-purple-200/70">Perguntas sobre nós dois e nossa história.</p>
              </div>
            </div>
            <span className="text-xs font-bold text-pink-300">+30 💎</span>
          </motion.div>

          <motion.div
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => {
              initMemoryGame();
              setActiveGame('memoria');
            }}
            className="glass-card-glow rounded-3xl p-5 border border-purple-400/30 cursor-pointer flex items-center justify-between shadow-lg"
          >
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-2xl bg-purple-500/20 border border-purple-400/40 flex items-center justify-center text-2xl">
                🃏
              </div>
              <div>
                <h3 className="text-base font-bold text-white">Jogo da Memória</h3>
                <p className="text-xs text-purple-200/70">Encontre os pares dos símbolos do nosso amor.</p>
              </div>
            </div>
            <span className="text-xs font-bold text-pink-300">+25 💎</span>
          </motion.div>

          <motion.div
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => {
              startCatchHeartsGame();
              setActiveGame('coracoes');
            }}
            className="glass-card-glow rounded-3xl p-5 border border-teal-400/30 cursor-pointer flex items-center justify-between shadow-lg"
          >
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-2xl bg-teal-500/20 border border-teal-400/40 flex items-center justify-center text-2xl">
                ✨
              </div>
              <div>
                <h3 className="text-base font-bold text-white">Pegue os Corações</h3>
                <p className="text-xs text-purple-200/70">Toque nos corações mágicos antes que subam!</p>
              </div>
            </div>
            <span className="text-xs font-bold text-pink-300">Moedas 💎</span>
          </motion.div>

          <motion.div
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => {
              resetTictac();
              setActiveGame('velha');
            }}
            className="glass-card-glow rounded-3xl p-5 border border-rose-400/30 cursor-pointer flex items-center justify-between shadow-lg"
          >
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-2xl bg-rose-500/20 border border-rose-400/40 flex items-center justify-center text-2xl">
                ⭕
              </div>
              <div>
                <h3 className="text-base font-bold text-white">Jogo da Velha do Amor</h3>
                <p className="text-xs text-purple-200/70">Jogue contra o amor da sua vida! (💖 vs 🌟)</p>
              </div>
            </div>
            <span className="text-xs font-bold text-pink-300">+10 💎</span>
          </motion.div>
        </div>
      )}

      {/* Quiz Game View */}
      {activeGame === 'quiz' && (
        <div className="glass-card-glow rounded-3xl p-6 border border-pink-400/30 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-purple-500/20">
            <span className="text-xs text-pink-300 font-mono">
              Pergunta {quizStep + 1} de {quizQuestions.length}
            </span>
            <button
              onClick={() => setActiveGame('menu')}
              className="text-xs text-purple-300 hover:text-white"
            >
              Sair
            </button>
          </div>

          {!quizFinished ? (
            <div className="space-y-4 py-2">
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
                      className={`w-full p-3.5 rounded-2xl border text-left text-sm font-medium transition-all ${btnStyle} hover:border-pink-400/40`}
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
              <button
                onClick={() => setActiveGame('menu')}
                className="mt-4 px-6 py-2.5 rounded-2xl bg-gradient-to-r from-purple-600 to-pink-600 text-white text-xs font-bold"
              >
                Voltar aos Jogos
              </button>
            </div>
          )}
        </div>
      )}

      {/* Memory Match Game View */}
      {activeGame === 'memoria' && (
        <div className="glass-card-glow rounded-3xl p-6 border border-purple-400/30 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-purple-500/20">
            <span className="text-xs text-purple-300 font-mono">Encontre os pares</span>
            <div className="flex items-center gap-3">
              <button
                onClick={initMemoryGame}
                className="text-xs text-pink-300 hover:underline flex items-center gap-1"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reiniciar</span>
              </button>
              <button
                onClick={() => setActiveGame('menu')}
                className="text-xs text-purple-300 hover:text-white"
              >
                Sair
              </button>
            </div>
          </div>

          <div className="grid grid-cols-4 gap-2.5 max-w-xs mx-auto py-2">
            {memoryCards.map((card, idx) => (
              <motion.button
                key={card.id}
                whileTap={{ scale: 0.95 }}
                onClick={() => handleFlipCard(idx)}
                className={`aspect-square rounded-2xl flex items-center justify-center text-2xl border transition-all ${
                  card.flipped || card.matched
                    ? 'bg-purple-900/60 border-pink-400/60 shadow-[0_0_15px_rgba(244,114,182,0.4)]'
                    : 'bg-purple-950/80 border-purple-500/30 text-purple-600'
                }`}
              >
                {card.flipped || card.matched ? card.icon : '♡'}
              </motion.button>
            ))}
          </div>

          {memoryCompleted && (
            <div className="text-center py-4 space-y-2">
              <h4 className="text-base font-bold text-pink-300">Vitória! Parceria perfeita ♡</h4>
              <p className="text-xs text-purple-200">+25 Diamantes adicionados!</p>
              <button
                onClick={() => setActiveGame('menu')}
                className="px-5 py-2 rounded-xl bg-pink-500/30 text-pink-200 text-xs font-semibold border border-pink-400/40"
              >
                Voltar aos Jogos
              </button>
            </div>
          )}
        </div>
      )}

      {/* Catch Hearts View */}
      {activeGame === 'coracoes' && (
        <div className="glass-card-glow rounded-3xl p-6 border border-teal-400/30 space-y-4 relative min-h-[320px] overflow-hidden">
          <div className="flex items-center justify-between pb-3 border-b border-purple-500/20">
            <span className="text-xs text-teal-300 font-mono">
              Corações Coletados: <strong>{heartsCaught}</strong>
            </span>
            <button
              onClick={() => setActiveGame('menu')}
              className="text-xs text-purple-300 hover:text-white"
            >
              Sair
            </button>
          </div>

          <p className="text-xs text-center text-purple-200/70">
            Toque nos corações e diamantes para coletá-los!
          </p>

          <div className="relative h-64 w-full">
            {fallingHearts.map((heart) => (
              <motion.button
                key={heart.id}
                initial={{ y: 220, opacity: 0, x: `${heart.x}%` }}
                animate={{ y: 10, opacity: 1 }}
                transition={{ duration: heart.speed, ease: 'linear' }}
                onClick={() => handleCatchHeart(heart.id)}
                className="absolute text-3xl p-2 cursor-pointer hover:scale-125 active:scale-90 transition-transform select-none"
              >
                {heart.icon}
              </motion.button>
            ))}
          </div>
        </div>
      )}

      {/* Tic Tac Toe Game */}
      {activeGame === 'velha' && (
        <div className="glass-card-glow rounded-3xl p-6 border border-rose-400/30">
          <div className="flex items-center justify-between mb-6">
            <span className="text-sm font-bold text-white flex items-center gap-1.5">
              <span className="text-xl">⭕</span> Jogo da Velha
            </span>
            <button
              onClick={() => setActiveGame('menu')}
              className="text-xs text-purple-300 hover:text-white"
            >
              Sair
            </button>
          </div>

          <div className="text-center mb-6">
            {tictacWinner ? (
              <h3 className="text-xl font-bold text-pink-300 animate-pulse">
                {tictacWinner === 'draw' ? 'Deu Velha! Empate 🤝' : `${tictacWinner} Venceu o Jogo!`}
              </h3>
            ) : (
              <h3 className="text-lg font-bold text-white">
                Vez de: <span className="text-2xl">{isXNext ? '💖' : '🌟'}</span>
              </h3>
            )}
          </div>

          <div className="grid grid-cols-3 gap-3 w-64 h-64 mx-auto mb-6">
            {tictacBoard.map((square, index) => (
              <motion.button
                key={index}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => handleTictacClick(index)}
                className={`rounded-2xl border-2 shadow-lg flex items-center justify-center text-4xl transition-colors ${
                  square ? 'bg-purple-900/60 border-purple-500/50 cursor-default' : 'glass-panel border-purple-400/30 hover:border-pink-400/50'
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
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={resetTictac}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold text-sm shadow-md flex items-center justify-center gap-2"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Jogar Novamente</span>
            </motion.button>
          )}
        </div>
      )}
    </motion.div>
  );
};
