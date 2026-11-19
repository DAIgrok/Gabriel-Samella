import React, { useState, useMemo, useRef } from 'react';
import {
  ArrowLeft,
  RotateCcw,
  Lightbulb,
  Sparkles,
  Check,
  X,
  Heart,
  Trophy,
  Award,
  Music,
} from 'lucide-react';
import { soundEngine } from '../../../utils/audioSynth';
import {
  EMOJI_CHARADES_POOL,
  HANGMAN_POOL,
  LYRIC_POOL,
  QUIZ_QUESTIONS_BASE,
  RIDDLES_POOL,
  TRUE_FALSE_POOL,
  WHO_MOST_LIKELY_POOL,
  WORDSEARCH_WORDS,
  pickRandomItems,
} from '../../../data/gamesCatalog';
import { DiamondGemIcon, VectorGlyphIcon } from '../../icons/CustomIcons';
import { GameVectorArt } from './GameVectorArt';

export interface MiniGameProps {
  onWin: (diamonds: number, reason: string, score?: number) => void;
  onExit: () => void;
  isSpectator?: boolean;
}

const GameTopBar: React.FC<{
  iconToken?: string;
  title: string;
  subtitle?: React.ReactNode;
  onRestart?: () => void;
  onExit: () => void;
}> = ({ iconToken = 'sparkles', title, subtitle, onRestart, onExit }) => (
  <div className="flex items-center justify-between gap-2 pb-3 border-b border-purple-500/20">
    <div className="flex items-center gap-2.5 min-w-0">
      <div className="w-9 h-9 rounded-xl bg-purple-900/60 border border-pink-400/30 flex items-center justify-center text-pink-200 shrink-0">
        <VectorGlyphIcon name={iconToken} className="w-4 h-4" />
      </div>
      <div className="min-w-0">
        <h3 className="text-base font-bold text-white truncate">{title}</h3>
        {subtitle && <div className="text-[11px] text-purple-200/75 truncate">{subtitle}</div>}
      </div>
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

const RewardCallout: React.FC<{ amount: number; isSpectator?: boolean }> = ({ amount, isSpectator }) => {
  if (isSpectator) return null;
  return (
    <span className="inline-flex items-center gap-1 text-pink-300 font-bold ml-1.5">
      +{amount}
      <DiamondGemIcon className="w-3.5 h-3.5" />
    </span>
  );
};

// 1. FORCA ROMÂNTICA
export const HangmanGame: React.FC<MiniGameProps> = ({ onWin, onExit, isSpectator }) => {
  const [entry, setEntry] = useState(() => pickRandomItems(HANGMAN_POOL, 1)[0]);
  const [guessed, setGuessed] = useState<string[]>([]);
  const [showHint, setShowHint] = useState(false);
  const awardedRef = useRef(false);

  const word = entry.word;
  const wrongLetters = guessed.filter((l) => !word.includes(l));
  const livesLeft = Math.max(0, 6 - wrongLetters.length);
  const won = word.split('').every((ch) => guessed.includes(ch));
  const lost = livesLeft === 0 && !won;

  const restart = () => {
    const candidates = HANGMAN_POOL.filter((w) => w.word !== word);
    setEntry(pickRandomItems(candidates.length ? candidates : HANGMAN_POOL, 1)[0]);
    setGuessed([]);
    setShowHint(false);
    awardedRef.current = false;
  };

  const handleGuess = (letter: string) => {
    if (won || lost || guessed.includes(letter)) return;
    const next = [...guessed, letter];
    setGuessed(next);
    if (word.includes(letter)) {
      soundEngine.playSparkle();
      const finished = word.split('').every((ch) => next.includes(ch));
      if (finished && !awardedRef.current) {
        awardedRef.current = true;
        onWin(4, `Forca resolvida: ${word}`, 6 - wrongLetters.length);
      }
    } else {
      soundEngine.playHeartPop();
    }
  };

  const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');

  return (
    <div className="glass-card-glow rounded-3xl p-4 sm:p-6 border border-pink-400/30 space-y-4">
      <GameTopBar
        iconToken="letter"
        title="Forca Romântica"
        subtitle={
          <span className="inline-flex items-center gap-1">
            <span>Vidas:</span>
            {Array.from({ length: 6 }, (_, idx) => (
              <Heart
                key={idx}
                className={`w-3 h-3 ${idx < livesLeft ? 'text-pink-400 fill-pink-400' : 'text-purple-700'}`}
              />
            ))}
          </span>
        }
        onRestart={restart}
        onExit={onExit}
      />

      <div className="text-center space-y-3 py-2">
        <div className="flex flex-wrap justify-center gap-1.5 sm:gap-2">
          {word.split('').map((ch, idx) => (
            <div
              key={idx}
              className={`w-8 h-10 sm:w-10 sm:h-12 rounded-xl border-b-2 flex items-center justify-center text-lg sm:text-xl font-bold ${
                guessed.includes(ch) || lost
                  ? guessed.includes(ch)
                    ? 'bg-pink-500/20 border-pink-400 text-white'
                    : 'bg-rose-950/60 border-rose-400 text-rose-300'
                  : 'bg-purple-950/60 border-purple-500/40 text-transparent'
              }`}
            >
              {guessed.includes(ch) || lost ? ch : '_'}
            </div>
          ))}
        </div>

        <button
          type="button"
          onClick={() => setShowHint(true)}
          className="inline-flex items-center gap-1.5 text-xs text-amber-200/90 hover:text-amber-100 bg-amber-500/10 border border-amber-400/30 px-3 py-1.5 rounded-full cursor-pointer"
        >
          <Lightbulb className="w-3.5 h-3.5" />
          <span>{showHint ? entry.hint : 'Ver Dica da Palavra'}</span>
        </button>
      </div>

      {!won && !lost ? (
        <div className="grid grid-cols-7 gap-1.5 max-w-sm mx-auto">
          {alphabet.map((letter) => {
            const isUsed = guessed.includes(letter);
            const isCorrect = isUsed && word.includes(letter);
            const isWrong = isUsed && !word.includes(letter);
            return (
              <button
                key={letter}
                type="button"
                disabled={isUsed}
                onClick={() => handleGuess(letter)}
                className={`min-h-[42px] rounded-xl text-xs sm:text-sm font-bold border transition-all cursor-pointer ${
                  isCorrect
                    ? 'bg-emerald-600/40 border-emerald-400 text-emerald-100'
                    : isWrong
                    ? 'bg-rose-950/50 border-rose-500/20 text-rose-400/40'
                    : 'bg-purple-950/70 border-purple-500/30 text-white hover:border-pink-400/60'
                }`}
              >
                {letter}
              </button>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-3 space-y-3 bg-purple-950/50 rounded-2xl p-4 border border-pink-400/25">
          <p className="text-base font-bold text-white flex items-center justify-center flex-wrap">
            <span>{won ? 'Você acertou com perfeição!' : `Quase! A palavra era ${word}`}</span>
            {won && <RewardCallout amount={4} isSpectator={isSpectator} />}
          </p>
          <div className="flex justify-center gap-2">
            <button
              type="button"
              onClick={restart}
              className="min-h-[44px] px-5 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 text-white text-xs font-bold cursor-pointer"
            >
              Próxima Palavra
            </button>
            <button
              type="button"
              onClick={onExit}
              className="min-h-[44px] px-4 rounded-xl bg-white/10 text-purple-200 text-xs font-semibold cursor-pointer"
            >
              Menu
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

// 2. PALAVRA EMBARALHADA (3 rodadas)
export const ScrambleGame: React.FC<MiniGameProps> = ({ onWin, onExit, isSpectator }) => {
  const shortPool = useMemo(() => HANGMAN_POOL.filter((i) => i.word.length >= 4 && i.word.length <= 9), []);

  const buildRound = (item: { word: string; hint: string }) => {
    const chars = item.word.split('').map((c, idx) => ({ id: `${idx}-${c}`, char: c }));
    let shuffled = [...chars].sort(() => Math.random() - 0.5);
    if (shuffled.map((x) => x.char).join('') === item.word && chars.length > 1) {
      shuffled = [...chars.slice(1), chars[0]];
    }
    return { item, shuffled };
  };

  const [rounds, setRounds] = useState(() => pickRandomItems(shortPool, 3).map(buildRound));
  const [step, setStep] = useState(0);
  const [pickedIds, setPickedIds] = useState<string[]>([]);
  const [feedback, setFeedback] = useState<'none' | 'ok' | 'err'>('none');
  const [finished, setFinished] = useState(false);

  const current = rounds[step];
  const currentGuess = pickedIds
    .map((id) => current.shuffled.find((c) => c.id === id)?.char || '')
    .join('');

  const restart = () => {
    setRounds(pickRandomItems(shortPool, 3).map(buildRound));
    setStep(0);
    setPickedIds([]);
    setFeedback('none');
    setFinished(false);
  };

  const handleTapTile = (id: string) => {
    if (feedback === 'ok' || finished) return;
    soundEngine.playHeartPop();
    const next = pickedIds.includes(id)
      ? pickedIds.filter((x) => x !== id)
      : [...pickedIds, id];
    setPickedIds(next);

    const wordNow = next.map((x) => current.shuffled.find((c) => c.id === x)?.char || '').join('');
    if (wordNow.length === current.item.word.length) {
      if (wordNow === current.item.word) {
        soundEngine.playSparkle();
        setFeedback('ok');
        setTimeout(() => {
          if (step + 1 < rounds.length) {
            setStep((s) => s + 1);
            setPickedIds([]);
            setFeedback('none');
          } else {
            setFinished(true);
            onWin(4, 'Palavras desembaralhadas com amor!', 3);
          }
        }, 700);
      } else {
        setFeedback('err');
      }
    } else {
      setFeedback('none');
    }
  };

  return (
    <div className="glass-card-glow rounded-3xl p-4 sm:p-6 border border-purple-400/30 space-y-4">
      <GameTopBar
        iconToken="book"
        title="Palavra Embaralhada"
        subtitle={`Rodada ${Math.min(step + 1, rounds.length)} de ${rounds.length}`}
        onRestart={restart}
        onExit={onExit}
      />

      {!finished ? (
        <div className="space-y-4 text-center py-2">
          <p className="text-xs text-pink-200/90 bg-pink-500/10 border border-pink-400/20 rounded-xl px-3 py-2 inline-flex items-center gap-1.5">
            <Lightbulb className="w-3.5 h-3.5 text-amber-300" />
            <span>Dica: {current.item.hint}</span>
          </p>

          <div className="min-h-[54px] flex items-center justify-center gap-1.5 flex-wrap bg-purple-950/60 border border-purple-500/30 rounded-2xl p-3">
            {currentGuess ? (
              pickedIds.map((id) => {
                const ch = current.shuffled.find((c) => c.id === id)?.char;
                return (
                  <button
                    key={id}
                    type="button"
                    onClick={() => handleTapTile(id)}
                    className={`w-9 h-10 rounded-xl font-bold text-base border cursor-pointer ${
                      feedback === 'ok'
                        ? 'bg-emerald-600/50 border-emerald-400 text-white'
                        : feedback === 'err'
                        ? 'bg-rose-600/40 border-rose-400 text-rose-100'
                        : 'bg-pink-600/40 border-pink-400 text-white'
                    }`}
                  >
                    {ch}
                  </button>
                );
              })
            ) : (
              <span className="text-xs text-purple-300/60">Toque nas letras abaixo na ordem certa</span>
            )}
          </div>

          <div className="flex flex-wrap justify-center gap-2">
            {current.shuffled.map((tile) => {
              const used = pickedIds.includes(tile.id);
              return (
                <button
                  key={tile.id}
                  type="button"
                  disabled={used}
                  onClick={() => handleTapTile(tile.id)}
                  className={`w-11 h-12 rounded-xl font-bold text-lg border transition-all cursor-pointer ${
                    used
                      ? 'opacity-25 bg-purple-950/40 border-purple-500/20 text-purple-400'
                      : 'bg-purple-900/60 border-purple-400/40 text-white hover:border-pink-400 active:scale-95'
                  }`}
                >
                  {tile.char}
                </button>
              );
            })}
          </div>

          {pickedIds.length > 0 && (
            <button
              type="button"
              onClick={() => {
                setPickedIds([]);
                setFeedback('none');
              }}
              className="min-h-[40px] px-4 rounded-xl bg-white/5 text-xs text-purple-200 cursor-pointer"
            >
              Limpar Letras
            </button>
          )}
        </div>
      ) : (
        <div className="text-center py-5 space-y-3">
          <div className="w-12 h-12 mx-auto rounded-2xl bg-pink-500/20 border border-pink-400/40 flex items-center justify-center text-pink-300">
            <Award className="w-6 h-6" />
          </div>
          <h4 className="text-lg font-bold text-white flex items-center justify-center">
            <span>Você decifrou todas as palavras!</span>
            <RewardCallout amount={4} isSpectator={isSpectator} />
          </h4>
          <button
            type="button"
            onClick={restart}
            className="min-h-[44px] px-5 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 text-white text-xs font-bold cursor-pointer"
          >
            Novo Desafio
          </button>
        </div>
      )}
    </div>
  );
};

// 3. VERDADEIRO OU FALSO
export const TrueFalseGame: React.FC<MiniGameProps> = ({ onWin, onExit }) => {
  const [deck, setDeck] = useState(() => pickRandomItems(TRUE_FALSE_POOL, 8));
  const [step, setStep] = useState(0);
  const [score, setScore] = useState(0);
  const [picked, setPicked] = useState<boolean | null>(null);
  const [finished, setFinished] = useState(false);

  const current = deck[step];

  const restart = () => {
    setDeck(pickRandomItems(TRUE_FALSE_POOL, 8));
    setStep(0);
    setScore(0);
    setPicked(null);
    setFinished(false);
  };

  const answer = (choice: boolean) => {
    if (picked !== null) return;
    setPicked(choice);
    const correct = choice === current.isTrue;
    const nextScore = correct ? score + 1 : score;
    if (correct) {
      soundEngine.playSparkle();
      setScore(nextScore);
    } else {
      soundEngine.playHeartPop();
    }

    setTimeout(() => {
      if (step + 1 < deck.length) {
        setStep((s) => s + 1);
        setPicked(null);
      } else {
        setFinished(true);
        const reward = nextScore === 8 ? 5 : nextScore >= 5 ? 3 : 2;
        onWin(reward, `Verdadeiro ou Falso (${nextScore}/8)`, nextScore);
      }
    }, 1150);
  };

  return (
    <div className="glass-card-glow rounded-3xl p-4 sm:p-6 border border-indigo-400/30 space-y-4">
      <GameTopBar
        iconToken="award"
        title="Verdadeiro ou Falso"
        subtitle={`Carta ${step + 1}/${deck.length} · Acertos: ${score}`}
        onRestart={restart}
        onExit={onExit}
      />

      {!finished ? (
        <div className="space-y-4 py-2">
          <div className="p-5 rounded-2xl bg-purple-950/60 border border-purple-500/30 text-center space-y-2 min-h-[120px] flex flex-col justify-center">
            <p className="text-sm sm:text-base font-bold text-white leading-relaxed">{current.statement}</p>
            {picked !== null && (
              <p className={`text-xs font-medium ${picked === current.isTrue ? 'text-emerald-300' : 'text-rose-300'}`}>
                {current.explanation}
              </p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              disabled={picked !== null}
              onClick={() => answer(true)}
              className="min-h-[52px] rounded-2xl bg-emerald-600/25 hover:bg-emerald-600/40 border border-emerald-400/40 text-emerald-100 font-bold text-sm flex items-center justify-center gap-2 cursor-pointer"
            >
              <Check className="w-4 h-4" />
              Verdadeiro
            </button>
            <button
              type="button"
              disabled={picked !== null}
              onClick={() => answer(false)}
              className="min-h-[52px] rounded-2xl bg-rose-600/25 hover:bg-rose-600/40 border border-rose-400/40 text-rose-100 font-bold text-sm flex items-center justify-center gap-2 cursor-pointer"
            >
              <X className="w-4 h-4" />
              Falso
            </button>
          </div>
        </div>
      ) : (
        <div className="text-center py-5 space-y-3">
          <div className="w-12 h-12 mx-auto rounded-2xl bg-amber-500/20 border border-amber-400/40 flex items-center justify-center text-amber-300">
            <Trophy className="w-6 h-6" />
          </div>
          <h4 className="text-lg font-bold text-white">Você acertou {score} de {deck.length}!</h4>
          <button
            type="button"
            onClick={restart}
            className="min-h-[44px] px-5 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 text-white text-xs font-bold cursor-pointer"
          >
            Sortear Novas Cartas
          </button>
        </div>
      )}
    </div>
  );
};

// 4. COMPLETE A LETRA / POEMA
export const LyricGame: React.FC<MiniGameProps> = ({ onWin, onExit }) => {
  const [deck, setDeck] = useState(() => pickRandomItems(LYRIC_POOL, 6));
  const [step, setStep] = useState(0);
  const [score, setScore] = useState(0);
  const [picked, setPicked] = useState<number | null>(null);
  const [finished, setFinished] = useState(false);

  const current = deck[step];

  const restart = () => {
    setDeck(pickRandomItems(LYRIC_POOL, 6));
    setStep(0);
    setScore(0);
    setPicked(null);
    setFinished(false);
  };

  const choose = (idx: number) => {
    if (picked !== null) return;
    setPicked(idx);
    const nextScore = idx === current.correctIndex ? score + 1 : score;
    if (idx === current.correctIndex) {
      soundEngine.playSparkle();
      setScore(nextScore);
    } else {
      soundEngine.playHeartPop();
    }

    setTimeout(() => {
      if (step + 1 < deck.length) {
        setStep((s) => s + 1);
        setPicked(null);
      } else {
        setFinished(true);
        onWin(nextScore >= 5 ? 4 : 2, `Complete a Letra (${nextScore}/${deck.length})`, nextScore);
      }
    }, 850);
  };

  return (
    <div className="glass-card-glow rounded-3xl p-4 sm:p-6 border border-pink-400/30 space-y-4">
      <GameTopBar
        iconToken="music"
        title="Complete a Letra"
        subtitle={`Verso ${step + 1}/${deck.length} · ${current?.artist || ''}`}
        onRestart={restart}
        onExit={onExit}
      />
      {!finished ? (
        <div className="space-y-3">
          <div className="p-4 rounded-2xl bg-purple-950/60 border border-purple-500/30 text-sm sm:text-base text-pink-100 font-medium italic leading-relaxed text-center">
            {current.prompt}
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {current.options.map((opt, idx) => {
              let cls = 'bg-purple-950/50 border-purple-500/30 text-purple-100';
              if (picked !== null) {
                if (idx === current.correctIndex) cls = 'bg-emerald-950/60 border-emerald-400 text-emerald-100';
                else if (idx === picked) cls = 'bg-rose-950/60 border-rose-400 text-rose-100';
              }
              return (
                <button
                  key={idx}
                  type="button"
                  disabled={picked !== null}
                  onClick={() => choose(idx)}
                  className={`min-h-[48px] px-4 py-2.5 rounded-2xl border text-sm font-semibold cursor-pointer transition-all ${cls}`}
                >
                  {opt}
                </button>
              );
            })}
          </div>
        </div>
      ) : (
        <div className="text-center py-5 space-y-3">
          <div className="w-12 h-12 mx-auto rounded-2xl bg-pink-500/20 border border-pink-400/40 flex items-center justify-center text-pink-300">
            <Music className="w-6 h-6" />
          </div>
          <h4 className="text-lg font-bold text-white">Sintonia Musical: {score}/{deck.length} acertos!</h4>
          <button
            type="button"
            onClick={restart}
            className="min-h-[44px] px-5 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 text-white text-xs font-bold cursor-pointer"
          >
            Tocar Mais Versos
          </button>
        </div>
      )}
    </div>
  );
};

// 5. ENIGMA DOS SÍMBOLOS (Vector Art Charades)
export const EmojiCharadeGame: React.FC<MiniGameProps> = ({ onWin, onExit }) => {
  const [deck, setDeck] = useState(() => pickRandomItems(EMOJI_CHARADES_POOL, 6));
  const [step, setStep] = useState(0);
  const [score, setScore] = useState(0);
  const [picked, setPicked] = useState<string | null>(null);
  const [finished, setFinished] = useState(false);

  const current = deck[step];

  const restart = () => {
    setDeck(pickRandomItems(EMOJI_CHARADES_POOL, 6));
    setStep(0);
    setScore(0);
    setPicked(null);
    setFinished(false);
  };

  const pickOption = (opt: string) => {
    if (picked !== null) return;
    setPicked(opt);
    const nextScore = opt === current.answer ? score + 1 : score;
    if (opt === current.answer) {
      soundEngine.playSparkle();
      setScore(nextScore);
    } else {
      soundEngine.playHeartPop();
    }
    setTimeout(() => {
      if (step + 1 < deck.length) {
        setStep((s) => s + 1);
        setPicked(null);
      } else {
        setFinished(true);
        onWin(nextScore >= 5 ? 4 : 2, `Enigma dos Símbolos (${nextScore}/${deck.length})`, nextScore);
      }
    }, 850);
  };

  return (
    <div className="glass-card-glow rounded-3xl p-4 sm:p-6 border border-amber-400/30 space-y-4">
      <GameTopBar
        iconToken="sparkles"
        title="Enigma dos Símbolos"
        subtitle={`Enigma ${step + 1}/${deck.length} · Categoria: ${current?.category || ''}`}
        onRestart={restart}
        onExit={onExit}
      />
      {!finished ? (
        <div className="space-y-4">
          <div className="py-5 px-4 rounded-2xl bg-purple-950/60 border border-purple-500/30 flex flex-col items-center gap-2.5">
            <div className="flex items-center justify-center gap-3 flex-wrap">
              {current.symbols.map((sym, idx) => (
                <div
                  key={idx}
                  className="w-12 h-12 rounded-2xl bg-purple-900/70 border border-pink-400/40 flex items-center justify-center shadow-inner"
                >
                  <GameVectorArt token={sym} className="w-8 h-8" />
                </div>
              ))}
            </div>
            <span className="text-[11px] text-purple-200/75 font-medium">{current.clueText}</span>
          </div>
          <div className="space-y-2">
            {current.options.map((opt) => {
              let cls = 'bg-purple-950/50 border-purple-500/30 text-purple-100';
              if (picked !== null) {
                if (opt === current.answer) cls = 'bg-emerald-950/60 border-emerald-400 text-emerald-100';
                else if (opt === picked) cls = 'bg-rose-950/60 border-rose-400 text-rose-100';
              }
              return (
                <button
                  key={opt}
                  type="button"
                  disabled={picked !== null}
                  onClick={() => pickOption(opt)}
                  className={`w-full min-h-[46px] px-4 py-2.5 rounded-2xl border text-left text-sm font-medium cursor-pointer ${cls}`}
                >
                  {opt}
                </button>
              );
            })}
          </div>
        </div>
      ) : (
        <div className="text-center py-5 space-y-3">
          <div className="w-12 h-12 mx-auto rounded-2xl bg-purple-500/20 border border-pink-400/40 flex items-center justify-center text-pink-300">
            <Sparkles className="w-6 h-6" />
          </div>
          <h4 className="text-lg font-bold text-white">Você decifrou {score}/{deck.length} enigmas!</h4>
          <button
            type="button"
            onClick={restart}
            className="min-h-[44px] px-5 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 text-white text-xs font-bold cursor-pointer"
          >
            Mais Enigmas
          </button>
        </div>
      )}
    </div>
  );
};

// 6. QUEM É MAIS PROVÁVEL?
export const WhoMostLikelyGame: React.FC<MiniGameProps> = ({ onWin, onExit, isSpectator }) => {
  const [cards, setCards] = useState(() => pickRandomItems(WHO_MOST_LIKELY_POOL, 6));
  const [step, setStep] = useState(0);
  const [votes, setVotes] = useState<{ q: string; pick: string }[]>([]);

  const restart = () => {
    setCards(pickRandomItems(WHO_MOST_LIKELY_POOL, 6));
    setStep(0);
    setVotes([]);
  };

  const vote = (pick: string) => {
    soundEngine.playHeartPop();
    const next = [...votes, { q: cards[step], pick }];
    setVotes(next);
    if (step + 1 < cards.length) {
      setStep((s) => s + 1);
    } else {
      onWin(3, 'Cartas de Sintonia do Casal');
    }
  };

  const done = votes.length >= cards.length;

  return (
    <div className="glass-card-glow rounded-3xl p-4 sm:p-6 border border-rose-400/30 space-y-4">
      <GameTopBar
        iconToken="heart"
        title="Quem é Mais Provável?"
        subtitle={`Carta ${Math.min(step + 1, cards.length)} de ${cards.length}`}
        onRestart={restart}
        onExit={onExit}
      />

      {!done ? (
        <div className="space-y-4 py-2">
          <div className="p-6 rounded-2xl bg-gradient-to-br from-purple-950/80 to-pink-950/40 border border-pink-400/30 text-center min-h-[120px] flex items-center justify-center">
            <p className="text-base sm:text-lg font-bold text-white leading-snug">{cards[step]}</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
            {['Gabriel', 'Samella', 'Os dois juntos ♡'].map((who) => (
              <button
                key={who}
                type="button"
                onClick={() => vote(who)}
                className="min-h-[48px] rounded-2xl bg-purple-900/50 hover:bg-pink-600/30 border border-purple-400/30 hover:border-pink-400 text-sm font-bold text-white cursor-pointer transition-all"
              >
                {who}
              </button>
            ))}
          </div>
        </div>
      ) : (
        <div className="space-y-3 py-2">
          <div className="text-center">
            <h4 className="text-base font-bold text-pink-200 flex items-center justify-center">
              <span>Resumo das Respostas</span>
              <RewardCallout amount={3} isSpectator={isSpectator} />
            </h4>
          </div>
          <div className="space-y-1.5 max-h-56 overflow-y-auto pr-1">
            {votes.map((v, i) => (
              <div key={i} className="p-2.5 rounded-xl bg-purple-950/50 border border-purple-500/20 text-xs flex justify-between gap-2">
                <span className="text-purple-100">{v.q}</span>
                <span className="text-pink-300 font-bold shrink-0">{v.pick}</span>
              </div>
            ))}
          </div>
          <button
            type="button"
            onClick={restart}
            className="w-full min-h-[44px] rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 text-white text-xs font-bold cursor-pointer"
          >
            Sortear Outras 6 Cartas
          </button>
        </div>
      )}
    </div>
  );
};

// 7. CHARADAS DO CORAÇÃO
export const RiddleGame: React.FC<MiniGameProps> = ({ onWin, onExit }) => {
  const [deck, setDeck] = useState(() => pickRandomItems(RIDDLES_POOL, 5));
  const [step, setStep] = useState(0);
  const [score, setScore] = useState(0);
  const [showHint, setShowHint] = useState(false);
  const [picked, setPicked] = useState<number | null>(null);
  const [finished, setFinished] = useState(false);

  const current = deck[step];

  const restart = () => {
    setDeck(pickRandomItems(RIDDLES_POOL, 5));
    setStep(0);
    setScore(0);
    setShowHint(false);
    setPicked(null);
    setFinished(false);
  };

  const choose = (idx: number) => {
    if (picked !== null) return;
    setPicked(idx);
    const nextScore = idx === current.correctIndex ? score + 1 : score;
    if (idx === current.correctIndex) {
      soundEngine.playSparkle();
      setScore(nextScore);
    } else {
      soundEngine.playHeartPop();
    }
    setTimeout(() => {
      if (step + 1 < deck.length) {
        setStep((s) => s + 1);
        setPicked(null);
        setShowHint(false);
      } else {
        setFinished(true);
        onWin(nextScore >= 4 ? 4 : 2, `Charadas do Coração (${nextScore}/${deck.length})`, nextScore);
      }
    }, 850);
  };

  return (
    <div className="glass-card-glow rounded-3xl p-4 sm:p-6 border border-purple-400/30 space-y-4">
      <GameTopBar
        iconToken="moon"
        title="Charadas do Coração"
        subtitle={`Charada ${step + 1}/${deck.length}`}
        onRestart={restart}
        onExit={onExit}
      />
      {!finished ? (
        <div className="space-y-3">
          <div className="p-4 rounded-2xl bg-purple-950/60 border border-purple-500/30 text-center space-y-2">
            <p className="text-sm sm:text-base font-bold text-white leading-relaxed">{current.question}</p>
            <button
              type="button"
              onClick={() => setShowHint(true)}
              className="text-[11px] text-amber-200 underline cursor-pointer inline-flex items-center gap-1"
            >
              <Lightbulb className="w-3 h-3" />
              <span>{showHint ? current.hint : 'Preciso de uma dica'}</span>
            </button>
          </div>
          <div className="grid grid-cols-2 gap-2.5">
            {current.options.map((opt, idx) => {
              let cls = 'bg-purple-950/50 border-purple-500/30 text-purple-100';
              if (picked !== null) {
                if (idx === current.correctIndex) cls = 'bg-emerald-950/60 border-emerald-400 text-emerald-100';
                else if (idx === picked) cls = 'bg-rose-950/60 border-rose-400 text-rose-100';
              }
              return (
                <button
                  key={idx}
                  type="button"
                  disabled={picked !== null}
                  onClick={() => choose(idx)}
                  className={`min-h-[48px] px-3 rounded-2xl border text-xs sm:text-sm font-semibold cursor-pointer ${cls}`}
                >
                  {opt}
                </button>
              );
            })}
          </div>
        </div>
      ) : (
        <div className="text-center py-5 space-y-3">
          <div className="w-12 h-12 mx-auto rounded-2xl bg-purple-500/20 border border-purple-400/40 flex items-center justify-center">
            <GameVectorArt token="moon" className="w-7 h-7" />
          </div>
          <h4 className="text-lg font-bold text-white">Você acertou {score} de {deck.length} charadas!</h4>
          <button
            type="button"
            onClick={restart}
            className="min-h-[44px] px-5 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 text-white text-xs font-bold cursor-pointer"
          >
            Mais Charadas
          </button>
        </div>
      )}
    </div>
  );
};

// 8. CAÇA-PALAVRAS MÁGICO (Procedural 7x7 Grid)
function generateWordSearch() {
  const size = 7;
  const grid: string[][] = Array.from({ length: size }, () => Array(size).fill(''));
  const candidates = pickRandomItems(WORDSEARCH_WORDS.filter((w) => w.length >= 3 && w.length <= 6), 12);
  const placed: { word: string; cells: string[] }[] = [];

  for (const w of candidates) {
    if (placed.length >= 4) break;
    for (let attempt = 0; attempt < 30; attempt++) {
      const horiz = Math.random() > 0.5;
      const r = Math.floor(Math.random() * (horiz ? size : size - w.length + 1));
      const c = Math.floor(Math.random() * (horiz ? size - w.length + 1 : size));
      let ok = true;
      for (let i = 0; i < w.length; i++) {
        const rr = horiz ? r : r + i;
        const cc = horiz ? c + i : c;
        if (grid[rr][cc] !== '' && grid[rr][cc] !== w[i]) {
          ok = false;
          break;
        }
      }
      if (ok) {
        const cells: string[] = [];
        for (let i = 0; i < w.length; i++) {
          const rr = horiz ? r : r + i;
          const cc = horiz ? c + i : c;
          grid[rr][cc] = w[i];
          cells.push(`${rr}-${cc}`);
        }
        placed.push({ word: w, cells });
        break;
      }
    }
  }

  const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      if (!grid[r][c]) {
        grid[r][c] = letters[Math.floor(Math.random() * letters.length)];
      }
    }
  }

  return { grid, placed };
}

export const WordSearchGame: React.FC<MiniGameProps> = ({ onWin, onExit, isSpectator }) => {
  const [puzzle, setPuzzle] = useState(() => generateWordSearch());
  const [foundWords, setFoundWords] = useState<string[]>([]);
  const [anchor, setAnchor] = useState<[number, number] | null>(null);

  const foundCellSet = useMemo(() => {
    const set = new Set<string>();
    puzzle.placed.forEach((p) => {
      if (foundWords.includes(p.word)) {
        p.cells.forEach((k) => set.add(k));
      }
    });
    return set;
  }, [puzzle, foundWords]);

  const restart = () => {
    setPuzzle(generateWordSearch());
    setFoundWords([]);
    setAnchor(null);
  };

  const handleCellTap = (r: number, c: number) => {
    if (foundWords.length === puzzle.placed.length) return;
    soundEngine.playHeartPop();

    if (!anchor) {
      setAnchor([r, c]);
      return;
    }

    const [r0, c0] = anchor;
    if (r0 === r && c0 === c) {
      setAnchor(null);
      return;
    }

    const selectedKeys: string[] = [];
    if (r0 === r) {
      const step = c >= c0 ? 1 : -1;
      for (let cc = c0; step > 0 ? cc <= c : cc >= c; cc += step) {
        selectedKeys.push(`${r}-${cc}`);
      }
    } else if (c0 === c) {
      const step = r >= r0 ? 1 : -1;
      for (let rr = r0; step > 0 ? rr <= r : rr >= r; rr += step) {
        selectedKeys.push(`${rr}-${c}`);
      }
    }

    const str = selectedKeys
      .map((k) => {
        const [rr, cc] = k.split('-').map(Number);
        return puzzle.grid[rr][cc];
      })
      .join('');
    const rev = str.split('').reverse().join('');

    const matched = puzzle.placed.find(
      (p) => !foundWords.includes(p.word) && (p.word === str || p.word === rev)
    );

    if (matched) {
      soundEngine.playSparkle();
      const next = [...foundWords, matched.word];
      setFoundWords(next);
      if (next.length === puzzle.placed.length) {
        onWin(5, 'Caça-Palavras Mágico concluído!');
      }
    }
    setAnchor(null);
  };

  const finished = foundWords.length === puzzle.placed.length;

  return (
    <div className="glass-card-glow rounded-3xl p-4 sm:p-6 border border-purple-400/30 space-y-3.5">
      <GameTopBar
        iconToken="compass"
        title="Caça-Palavras Mágico"
        subtitle="Toque na 1ª letra e depois na última letra da palavra"
        onRestart={restart}
        onExit={onExit}
      />

      <div className="flex flex-wrap justify-center gap-2">
        {puzzle.placed.map((p) => {
          const isFound = foundWords.includes(p.word);
          return (
            <span
              key={p.word}
              className={`px-2.5 py-1 rounded-full text-xs font-bold border ${
                isFound
                  ? 'bg-emerald-500/25 border-emerald-400 text-emerald-200 line-through'
                  : 'bg-purple-950/60 border-purple-500/30 text-pink-200'
              }`}
            >
              {p.word}
            </span>
          );
        })}
      </div>

      <div className="grid grid-cols-7 gap-1 max-w-[300px] mx-auto">
        {puzzle.grid.map((row, r) =>
          row.map((letter, c) => {
            const key = `${r}-${c}`;
            const isAnchor = anchor?.[0] === r && anchor?.[1] === c;
            const isFound = foundCellSet.has(key);
            return (
              <button
                key={key}
                type="button"
                onClick={() => handleCellTap(r, c)}
                className={`aspect-square min-h-[38px] rounded-lg text-sm font-bold border transition-all cursor-pointer ${
                  isAnchor
                    ? 'bg-pink-500 text-white border-pink-200 scale-105'
                    : isFound
                    ? 'bg-emerald-600/40 text-emerald-100 border-emerald-400/60'
                    : 'bg-purple-950/70 text-purple-100 border-purple-500/25 hover:border-pink-400/50'
                }`}
              >
                {letter}
              </button>
            );
          })
        )}
      </div>

      {finished && (
        <div className="text-center py-2 space-y-2">
          <p className="text-sm font-bold text-emerald-300 flex items-center justify-center">
            <span>Todas as palavras encontradas!</span>
            <RewardCallout amount={5} isSpectator={isSpectator} />
          </p>
          <button
            type="button"
            onClick={restart}
            className="min-h-[44px] px-5 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 text-white text-xs font-bold cursor-pointer"
          >
            Gerar Novo Tabuleiro
          </button>
        </div>
      )}
    </div>
  );
};

// 9. MARATONA MISTA SURPRESA (5 rodadas aleatórias mistas)
interface MixedQuestion {
  badge: string;
  prompt: string;
  symbols?: string[];
  options: string[];
  correctIndex: number;
}

function buildMarathonDeck(): MixedQuestion[] {
  const q1 = pickRandomItems(QUIZ_QUESTIONS_BASE, 1)[0];
  const q2 = pickRandomItems(TRUE_FALSE_POOL, 1)[0];
  const q3 = pickRandomItems(EMOJI_CHARADES_POOL, 1)[0];
  const q4 = pickRandomItems(LYRIC_POOL, 1)[0];
  const q5 = pickRandomItems(RIDDLES_POOL, 1)[0];

  return [
    { badge: 'Quiz do Casal', prompt: q1.question, options: q1.options, correctIndex: q1.correctIndex },
    { badge: 'Verdadeiro ou Falso', prompt: q2.statement, options: ['Verdadeiro', 'Falso'], correctIndex: q2.isTrue ? 0 : 1 },
    {
      badge: 'Enigma dos Símbolos',
      prompt: `Decifre a combinação: ${q3.clueText}`,
      symbols: q3.symbols,
      options: q3.options,
      correctIndex: q3.options.indexOf(q3.answer),
    },
    { badge: 'Complete a Letra', prompt: q4.prompt, options: q4.options, correctIndex: q4.correctIndex },
    { badge: 'Charada Surpresa', prompt: q5.question, options: q5.options, correctIndex: q5.correctIndex },
  ];
}

export const MarathonGame: React.FC<MiniGameProps> = ({ onWin, onExit }) => {
  const [deck, setDeck] = useState<MixedQuestion[]>(() => buildMarathonDeck());
  const [step, setStep] = useState(0);
  const [score, setScore] = useState(0);
  const [picked, setPicked] = useState<number | null>(null);
  const [finished, setFinished] = useState(false);

  const current = deck[step];

  const restart = () => {
    setDeck(buildMarathonDeck());
    setStep(0);
    setScore(0);
    setPicked(null);
    setFinished(false);
  };

  const answer = (idx: number) => {
    if (picked !== null) return;
    setPicked(idx);
    const nextScore = idx === current.correctIndex ? score + 1 : score;
    if (idx === current.correctIndex) {
      soundEngine.playSparkle();
      setScore(nextScore);
    } else {
      soundEngine.playHeartPop();
    }
    setTimeout(() => {
      if (step + 1 < deck.length) {
        setStep((s) => s + 1);
        setPicked(null);
      } else {
        setFinished(true);
        const reward = nextScore === 5 ? 6 : nextScore >= 3 ? 4 : 2;
        onWin(reward, `Maratona Surpresa (${nextScore}/5)`, nextScore);
      }
    }, 850);
  };

  return (
    <div className="glass-card-glow rounded-3xl p-4 sm:p-6 border border-pink-400/35 space-y-4">
      <GameTopBar
        iconToken="star"
        title="Maratona Mista Surpresa"
        subtitle={`Etapa ${step + 1}/5 · ${current?.badge || ''}`}
        onRestart={restart}
        onExit={onExit}
      />

      {!finished ? (
        <div className="space-y-3">
          <div className="p-4 rounded-2xl bg-purple-950/60 border border-pink-400/25 text-center space-y-2">
            <span className="text-[11px] font-semibold text-pink-300 flex items-center justify-center gap-1">
              <Sparkles className="w-3 h-3" /> {current.badge}
            </span>
            {current.symbols && (
              <div className="flex items-center justify-center gap-2 py-1">
                {current.symbols.map((sym, idx) => (
                  <div key={idx} className="w-10 h-10 rounded-xl bg-purple-900/70 border border-pink-400/35 flex items-center justify-center">
                    <GameVectorArt token={sym} className="w-6 h-6" />
                  </div>
                ))}
              </div>
            )}
            <p className="text-sm sm:text-base font-bold text-white leading-snug">{current.prompt}</p>
          </div>
          <div className="space-y-2">
            {current.options.map((opt, idx) => {
              let cls = 'bg-purple-950/50 border-purple-500/30 text-purple-100';
              if (picked !== null) {
                if (idx === current.correctIndex) cls = 'bg-emerald-950/60 border-emerald-400 text-emerald-100';
                else if (idx === picked) cls = 'bg-rose-950/60 border-rose-400 text-rose-100';
              }
              return (
                <button
                  key={idx}
                  type="button"
                  disabled={picked !== null}
                  onClick={() => answer(idx)}
                  className={`w-full min-h-[46px] px-4 py-2 rounded-2xl border text-left text-sm font-semibold cursor-pointer ${cls}`}
                >
                  {opt}
                </button>
              );
            })}
          </div>
        </div>
      ) : (
        <div className="text-center py-5 space-y-3">
          <div className="w-12 h-12 mx-auto rounded-2xl bg-amber-500/20 border border-amber-400/40 flex items-center justify-center text-amber-300">
            <Trophy className="w-6 h-6" />
          </div>
          <h4 className="text-lg font-bold text-white">Maratona Concluída: {score}/5 acertos!</h4>
          <button
            type="button"
            onClick={restart}
            className="min-h-[44px] px-5 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 text-white text-xs font-bold cursor-pointer"
          >
            Nova Maratona Aleatória
          </button>
        </div>
      )}
    </div>
  );
};
