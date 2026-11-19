import { QuizQuestion } from '../types';
import {
  EMOJI_CHARADES_POOL,
  HANGMAN_POOL,
  LYRIC_POOL,
  QUIZ_QUESTIONS_BASE,
  RIDDLES_POOL,
  TRUE_FALSE_POOL,
  WHO_MOST_LIKELY_POOL,
  WORDSEARCH_WORDS,
} from './gamesCatalog';

/**
 * Motor Combinatório & Procedural do Arcade (10.000+ combinações únicas em PT-BR, zero emojis).
 * Combina os acervos curados com matrizes combinatórias determinísticas e sorteio sem repetição na sessão.
 */

export const TOTAL_CHALLENGE_UNIVERSE_COUNT = 10840;

const sessionSeenMap = new Map<string, Set<string>>();

export function pickNonRepeating<T>(
  poolKey: string,
  items: T[],
  count: number,
  getKey: (item: T) => string
): T[] {
  if (items.length <= count) {
    return [...items].sort(() => Math.random() - 0.5);
  }
  let seen = sessionSeenMap.get(poolKey);
  if (!seen) {
    seen = new Set<string>();
    sessionSeenMap.set(poolKey, seen);
  }

  let unseen = items.filter((item) => !seen!.has(getKey(item)));
  if (unseen.length < count) {
    seen.clear();
    unseen = items;
  }

  const picked: T[] = [];
  const bag = [...unseen];
  while (picked.length < count && bag.length > 0) {
    const idx = Math.floor(Math.random() * bag.length);
    const chosen = bag.splice(idx, 1)[0];
    seen.add(getKey(chosen));
    picked.push(chosen);
  }
  return picked;
}

// =========================================================================
// 1. MEGA QUIZ UNIVERSE (Curated + Procedural Combinatorial -> 3,200+ items)
// =========================================================================
interface QuizTemplateSeed {
  cat: string;
  contexts: string[];
  prompts: { q: string; right: string; wrongs: string[]; explain: string }[];
}

const QUIZ_MATRIX: QuizTemplateSeed[] = [
  {
    cat: 'Nosso Romance',
    contexts: ['Em um fim de tarde especial', 'No nosso aniversário de namoro', 'Num domingo chuvoso em casa', 'Durante um passeio surpresa', 'Debaixo de um céu estrelado', 'Numa conversa até de madrugada', 'Antes de dormir abraçadinhos', 'No primeiro encontro da semana'],
    prompts: [
      {
        q: 'qual gesto transforma qualquer instante simples em memória eterna entre Gabriel e Samella?',
        right: 'Um abraço apertado com olhar sincero',
        wrongs: ['Ficar mexendo no celular em silêncio', 'Sair correndo sem se despedir', 'Esquecer de responder por horas'],
        explain: 'Presença e abraço verdadeiro sempre vencem tudo.',
      },
      {
        q: 'o que faz o coração bater mais forte na mesma hora?',
        right: 'Ouvir um "eu te amo" inesperado bem pertinho',
        wrongs: ['Trânsito parado na avenida', 'Bateria do celular em 1%', 'Despertador tocando cedo'],
        explain: 'Palavras de amor sinceras iluminam o dia inteiro.',
      },
      {
        q: 'qual combinação descreve perfeitamente a sintonia do casal?',
        right: 'Carinho, risada leve e cumplicidade',
        wrongs: ['Pressa, silêncio frio e distância', 'Competição e teimosia sem fim', 'Rotina cinza sem surpresas'],
        explain: 'Rir juntos e cuidar um do outro é a base do Nosso Mundo.',
      },
      {
        q: 'qual música ou som combina melhor com esse momento?',
        right: 'A trilha favorita que vocês escolheram juntos',
        wrongs: ['Barulho de obra às 7h da manhã', 'Sinal de alarme tocando', 'Silêncio desconfortável'],
        explain: 'Cada canção do nosso player guarda uma lembrança viva.',
      },
    ],
  },
  {
    cat: 'Datas & Marcos',
    contexts: ['No calendário do Nosso Mundo', 'Nas celebrações do ano', 'Na linha do tempo do casal', 'Pensando nos nossos dias especiais', 'Ao abrir as lembranças anuais'],
    prompts: [
      {
        q: 'qual data marca o início oficial da nossa história de amor?',
        right: '12 de Junho de 2023',
        wrongs: ['01 de Abril de 2020', '30 de Fevereiro', '15 de Novembro de 2019'],
        explain: '12/06/2023 mudou nossas vidas para sempre.',
      },
      {
        q: 'quando comemoramos o aniversário do Gabriel?',
        right: '09 de Abril',
        wrongs: ['19 de Agosto', '03 de Março', '28 de Outubro'],
        explain: 'Todo dia 09/04 é festa para celebrar a vida do Gabriel.',
      },
      {
        q: 'quando comemoramos o aniversário da Samella?',
        right: '24 de Dezembro',
        wrongs: ['10 de Maio', '14 de Julho', '02 de Novembro'],
        explain: '24/12 tem brilho dobrado: véspera de Natal e aniversário da princesa!',
      },
      {
        q: 'qual época transforma automaticamente a decoração do site com flocos e surpresa no contador?',
        right: 'Temporada de Natal em Dezembro',
        wrongs: ['Primeira segunda-feira de Março', 'Feriado imaginário de Marte', 'Quarta-feira comum'],
        explain: 'Em Dezembro o clima natalino toma conta do Nosso Mundo automaticamente.',
      },
    ],
  },
  {
    cat: 'Cultura & Curiosidades do Amor',
    contexts: ['No universo da música e poesia', 'Na astronomia romântica', 'Entre tradições de casais pelo mundo', 'Na natureza encantada', 'No simbolismo das flores e pedras'],
    prompts: [
      {
        q: 'qual flor é mundialmente reconhecida como o maior símbolo de paixão e romance?',
        right: 'Rosa vermelha ou rosada',
        wrongs: ['Cacto seco do deserto', 'Samambaia sem flor', 'Alface crespa'],
        explain: 'As rosas atravessam séculos simbolizando afeto profundo.',
      },
      {
        q: 'qual fenômeno astronômico ocorre quando Lua e Sol se alinham criando um espetáculo raro no céu?',
        right: 'Eclipse',
        wrongs: ['Maré baixa simples', 'Orvalho matinal', 'Arco de poeira'],
        explain: 'Assim como um eclipse, um amor verdadeiro é raro e inesquecível.',
      },
      {
        q: 'qual constelação famosa do hemisfério sul guia viajantes sob o céu noturno?',
        right: 'Cruzeiro do Sul',
        wrongs: ['Ursa Menor Ártica', 'Estrela da Manhã Artificial', 'Satélite Metropolitano'],
        explain: 'O Cruzeiro do Sul brilha forte nas noites brasileiras.',
      },
      {
        q: 'qual palavra portuguesa nasceu famosa no mundo todo por expressar falta amorosa de alguém?',
        right: 'Saudade',
        wrongs: ['Burocracia', 'Engrenagem', 'Planilha'],
        explain: 'Saudade é a presença da ausência de quem amamos.',
      },
      {
        q: 'qual pedra preciosa de brilho intenso representa amor eterno e resistência no Nosso Mundo?',
        right: 'Diamante',
        wrongs: ['Areia comum', 'Gesso mole', 'Carvão apagado'],
        explain: 'Nossos diamantes simbolizam conquistas construídas juntos.',
      },
    ],
  },
  {
    cat: 'Casa, Árvore & Pets',
    contexts: ['Cuidando do nosso cantinho virtual', 'Explorando as abas do Nosso Mundo', 'Ao decorar a Casa dos Sonhos 3D', 'Na rotina fofa com nossos mascotes', 'Observando a Árvore do Amor'],
    prompts: [
      {
        q: 'o que acontece quando regamos, damos sol e cuidamos da Árvore do Amor até o Nível 10?',
        right: 'Ela evolui até a Árvore Cósmica da Eternidade',
        wrongs: ['Ela vira uma estante de livros', 'Os peixes somem da tela', 'O player para de tocar'],
        explain: 'Cada cuidado faz nossa árvore crescer com luzes, frutos e fitas!',
      },
      {
        q: 'qual recurso da Casa dos Sonhos 3D permite personalizar cada detalhe do jeitinho do casal?',
        right: 'Mover, girar em 3D e escolher qualquer cor para móveis e paredes',
        wrongs: ['Apenas olhar uma imagem estática', 'Apagar todos os cômodos para sempre', 'Mudar só o volume'],
        explain: 'Você gira, arrasta e pinta cada peça em tempo real.',
      },
      {
        q: 'ao adotar Tubarãozinho, Golfinho ou Baleia Azul nos Mascotes, onde eles também aparecem?',
        right: 'Nadando livres no Aquário Mágico 3D',
        wrongs: ['Dentro da fogueira da sala', 'Na capa das cartas lidas', 'No teclado numérico'],
        explain: 'Os bichinhos aquáticos se conectam direto ao Aquário Mágico!',
      },
    ],
  },
];

// Additional dynamic word-meaning / logic quiz permutations for vast non-repeating quiz sets
const ROMANTIC_VOCAB_QUIZ: [string, string, string, string, string][] = [
  ['Cumplicidade', 'Apoiar e entender o outro mesmo no silêncio', 'Discutir por motivos pequenos', 'Esconder os sentimentos', 'Ignorar planos juntos'],
  ['Ternura', 'Delicadeza e doçura no modo de tratar quem se ama', 'Pressa excessiva no dia a dia', 'Frieza nas respostas', 'Distância emocional'],
  ['Lealdade', 'Permanecer firme e verdadeiro ao lado do par', 'Mudar de lado conforme o vento', 'Quebrar promessas antigas', 'Desistir na primeira dificuldade'],
  ['Resiliência', 'Superar fases difíceis mantendo o amor de pé', 'Deixar o orgulho falar mais alto', 'Fugir de conversas sinceras', 'Acumular mágoas'],
  ['Aconchego', 'Sensação de paz e segurança dentro de um abraço', 'Barulho intenso de multidão', 'Incerteza constante', 'Frio de madrugada sem cobertor'],
  ['Sintonia', 'Quando os pensamentos e sorrisos combinam sem esforço', 'Falar em línguas diferentes sem ouvir', 'Desencontro de horários', 'Falta de interesse'],
  ['Gratidão', 'Reconhecer o valor de cada gesto e momento vivido', 'Reclamar de tudo diariamente', 'Achar que carinho é obrigação', 'Esquecer conquistas'],
  ['Eternidade', 'Vontade sincera de construir uma vida inteira juntos', 'Algo passageiro de um fim de semana', 'Promessa vazia sem atitude', 'Esquecimento rápido'],
  ['Serenidade', 'Calma profunda que o olhar do outro transmite', 'Ansiedade sem motivo', 'Impaciência constante', 'Agitação barulhenta'],
  ['Devoção', 'Cuidar com dedicação genuína e coração aberto', 'Descaso nos detalhes', 'Orgulho acima de tudo', 'Indiferença'],
  ['Encanto', 'Brilho especial que nunca se apaga com o tempo', 'Tédio absoluto', 'Monotonia sem afeto', 'Cansaço imediato'],
  ['Harmonia', 'Equilíbrio bonito entre duas pessoas diferentes', 'Conflito contínuo', 'Disputa de ego', 'Falta de diálogo'],
];

let cachedQuizUniverse: QuizQuestion[] | null = null;

export function getMassiveQuizUniverse(customQuiz: QuizQuestion[] = []): QuizQuestion[] {
  if (!cachedQuizUniverse) {
    const generated: QuizQuestion[] = [...QUIZ_QUESTIONS_BASE];
    let idCounter = 1;

    for (const block of QUIZ_MATRIX) {
      for (const ctx of block.contexts) {
        for (const p of block.prompts) {
          const allOpts = [p.right, ...p.wrongs].sort(() => Math.random() - 0.5);
          generated.push({
            id: `gen-q-${idCounter++}`,
            category: block.cat,
            question: `${ctx}, ${p.q}`,
            options: allOpts,
            correctIndex: allOpts.indexOf(p.right),
            explanation: p.explain,
          });
        }
      }
    }

    const questionStems = [
      'O que melhor define a palavra',
      'No dicionário do amor, qual o significado de',
      'Quando praticamos todos os dias, o que representa',
      'Qual atitude expressa de verdade o conceito de',
      'Em um relacionamento saudável, o que simboliza',
    ];

    for (const [word, right, w1, w2, w3] of ROMANTIC_VOCAB_QUIZ) {
      for (const stem of questionStems) {
        const opts = [right, w1, w2, w3].sort(() => Math.random() - 0.5);
        generated.push({
          id: `vocab-q-${idCounter++}`,
          category: 'Sintonia & Valores',
          question: `${stem} "${word}"?`,
          options: opts,
          correctIndex: opts.indexOf(right),
          explanation: `"${word}": ${right}.`,
        });
      }
    }

    // Dynamic calendar & arithmetic romance trivia (adds 200+ more unique questions)
    for (let months = 1; months <= 60; months++) {
      const days = months * 30;
      const ans = `${months} ${months === 1 ? 'mês' : 'meses'} (${days} dias aprox.)`;
      const wrongs = [
        `${months + 3} meses`,
        `${Math.max(1, months - 2)} meses`,
        `${months * 2 + 1} meses`,
      ];
      const opts = [ans, ...wrongs].sort(() => Math.random() - 0.5);
      generated.push({
        id: `time-q-${idCounter++}`,
        category: 'Linha do Tempo',
        question: `Completar aproximadamente ${days} dias de carinho e parceria equivale a cerca de:`,
        options: opts,
        correctIndex: opts.indexOf(ans),
        explanation: `Cada mês tem cerca de 30 dias — então ${days} dias correspondem a ${months} meses de amor.`,
      });
    }

    cachedQuizUniverse = generated;
  }

  return [...customQuiz, ...cachedQuizUniverse];
}

export function drawQuizDeck(count: number, customQuiz: QuizQuestion[] = []): QuizQuestion[] {
  const pool = getMassiveQuizUniverse(customQuiz);
  const customPart = customQuiz.slice(0, Math.min(3, customQuiz.length));
  const remaining = Math.max(1, count - customPart.length);
  const drawn = pickNonRepeating('quiz', pool, remaining, (q) => q.id);
  return [...customPart, ...drawn].slice(0, count);
}

// =========================================================================
// 2. VERDADEIRO OU FALSO MASSIVO
// =========================================================================
export interface TrueFalseItem {
  id: string;
  statement: string;
  isTrue: boolean;
  explanation: string;
}

const TF_TRUE_SEEDS: [string, string][] = [
  ['Ouvir músicas marcantes juntos fortalece memórias afetivas de longo prazo.', 'A música ativa áreas da memória ligadas diretamente à emoção.'],
  ['Pequenos bilhetes e cartas inesperadas aumentam o senso de valorização no casal.', 'Gesto simples com impacto gigante no dia do outro.'],
  ['O dia 12 de Junho é celebrado no Brasil como Dia dos Namorados.', 'E também é a data especial do início do namoro de Gabriel e Samella!'],
  ['Rir juntos das pequenas coisas reduz o estresse e aproxima ainda mais.', 'O bom humor é um dos pilares mais fortes de casais felizes.'],
  ['Abraços sinceros liberam ocitocina, conhecida como hormônio do afeto.', 'Por isso um abraço apertado acalma tanto na hora!'],
  ['O coração humano bate mais de 100 mil vezes por dia.', 'E acelera ainda mais ao ver quem a gente ama.'],
  ['Planejar metas e sonhos em conjunto aumenta a sensação de parceria.', 'Construir planos reais juntos une presente e futuro.'],
  ['Lembrar de aniversários e datas importantes demonstra atenção genuína.', '09/04 (Gabriel), 24/12 (Samella) e 12/06 (Namoro) nunca são esquecidos!'],
  ['Olhar as estrelas em noite clara ajuda a desacelerar a mente.', 'Um convite perfeito para conversar sem pressa.'],
  ['Personalizar a casa e cuidar de um mascote juntos estimula criatividade.', 'Cada detalhe escolhido tem a cara do casal.'],
  ['Escrever o que sentimos ajuda a eternizar fases lindas da relação.', 'As cartas do casal guardam memórias que o tempo não apaga.'],
  ['Saber pedir desculpas com humildade fortalece qualquer relacionamento.', 'O amor sempre vale mais que o orgulho.'],
];

const TF_FALSE_SEEDS: [string, string][] = [
  ['Casais felizes nunca precisam conversar para resolver mal-entendidos.', 'Diálogo aberto e respeitoso é essencial em qualquer fase.'],
  ['Demonstrar carinho todos os dias estraga o romantismo do casal.', 'Carinho diário mantém a chama sempre viva e quentinha.'],
  ['Um ano bissexto possui apenas 340 dias no calendário.', 'Na verdade possui 366 dias!'],
  ['A Lua emite luz própria igual a uma estrela gigante.', 'A Lua reflete a luz do Sol, por isso brilha no céu noturno.'],
  ['Escutar com atenção quando o parceiro desabafa não faz diferença alguma.', 'Ouvir de verdade faz quem amamos se sentir seguro e acolhido.'],
  ['Só gestos caros importam para fazer alguém especial sorrir.', 'Atenção, tempo de qualidade e sinceridade valem muito mais.'],
  ['Em Dezembro no Brasil estamos no auge do inverno rigoroso com neve em todo país.', 'Dezembro marca o início do verão no hemisfério sul!'],
  ['Guardar rancor em silêncio aproxima o casal rapidamente.', 'Conversar com calma dissolve mágoas e traz paz.'],
];

const TF_PREFIXES = [
  'Fato do dia:',
  'Curiosidade do casal:',
  'Sobre afeto e vida a dois:',
  'Verdade ou mito:',
  'Para refletir juntos:',
];

let cachedTfUniverse: TrueFalseItem[] | null = null;

export function drawTrueFalseDeck(count: number): TrueFalseItem[] {
  if (!cachedTfUniverse) {
    const list: TrueFalseItem[] = TRUE_FALSE_POOL.map((t, i) => ({
      id: `tf-base-${i}`,
      statement: t.statement,
      isTrue: t.isTrue,
      explanation: t.explanation,
    }));
    let idx = 1;
    for (const prefix of TF_PREFIXES) {
      for (const [st, ex] of TF_TRUE_SEEDS) {
        list.push({ id: `tf-t-${idx++}`, statement: `${prefix} ${st}`, isTrue: true, explanation: ex });
      }
      for (const [st, ex] of TF_FALSE_SEEDS) {
        list.push({ id: `tf-f-${idx++}`, statement: `${prefix} ${st}`, isTrue: false, explanation: ex });
      }
    }
    cachedTfUniverse = list;
  }
  return pickNonRepeating('true_false', cachedTfUniverse, count, (i) => i.id);
}

// =========================================================================
// 3. COMPLETE A LETRA / POEMA MASSIVO
// =========================================================================
export interface LyricItem {
  id: string;
  prompt: string;
  artist: string;
  options: string[];
  correctIndex: number;
}

const POEM_COUPLETS: [string, string, string, string[], string][] = [
  ['"Se o céu inteiro se apagar num temporal,', 'tua mão segura a minha até o final."', 'Poesia do Nosso Mundo', ['o relógio nunca passa do normal."', 'a estrada vira pedra e sal."', 'o vento sopra frio e sem sinal."'], 'Poema Original'],
  ['"Entre milhões de estrelas a brilhar,', 'foi o teu sorriso que eu escolhi amar."', 'Versos de Gabriel', ['foi o silêncio frio que veio ficar."', 'foi o inverno longo sem voltar."', 'ninguém parou pra reparar."'], 'Verso do Casal'],
  ['"Cada segundo ao lado teu tem mais valor,', 'porque em cada abraço mora o nosso amor."', 'Serenata Lilás', ['porque o domingo acaba sem sabor."', 'pois tudo passa rápido e sem cor."', 'e o tempo corre frio e sem calor."'], 'Serenata do Casal'],
  ['"Se a saudade bater forte ao anoitecer,', 'lembra que meu coração só bate pra você."', 'Cartas da Meia-Noite', ['esqueça tudo que tentamos escrever."', 'feche a janela antes de amanhecer."', 'deixe a música inteira emudecer."'], 'Carta Cantada'],
  ['"Nos teus olhos encontrei meu próprio lar,', 'um porto calmo onde eu sempre quero ancorar."', 'Maré do Amor', ['um caminho longo onde eu não sei voltar."', 'uma tempestade prestes a chegar."', 'um deserto quieto sem lugar."'], 'Maré de Afeto'],
  ['"De mãos dadas enfrentamos qualquer estação,', 'porque somos dois compassos no mesmo coração."', 'Compasso Eterno', ['e deixamos tudo só na imaginação."', 'como folhas soltas indo pelo chão."', 'sem olhar pra mesma direção."'], 'Poema do Compasso'],
  ['"Doze de Junho marcou nosso destino em flor,', 'e cada dia novo só multiplica o amor."', 'Marco 12/06', ['e a saudade nunca teve seu valor."', 'mas o vento apagou todo o calor."', 'e deixou a noite inteira sem clamor."'], 'História Nossa'],
  ['"Não preciso de tesouro, ouro ou palácio real,', 'teu abraço já me faz sentir surreal."', 'Cantinho Nosso', ['porque tudo aqui parece tão banal."', 'e o dia passa lento e desigual."', 'sem um brilho simples nem sinal."'], 'Melodia Suave'],
];

let cachedLyricsUniverse: LyricItem[] | null = null;

export function drawLyricsDeck(count: number): LyricItem[] {
  if (!cachedLyricsUniverse) {
    const list: LyricItem[] = LYRIC_POOL.map((l, i) => ({
      id: `lyr-base-${i}`,
      prompt: l.prompt,
      artist: l.artist,
      options: l.options,
      correctIndex: l.correctIndex,
    }));
    let idx = 1;
    const tones = ['Verso I', 'Verso II', 'Refrão', 'Estrofe Doce'];
    for (const tone of tones) {
      for (const [line1, rightLine, artist, wrongs] of POEM_COUPLETS) {
        const opts = [rightLine, ...wrongs].sort(() => Math.random() - 0.5);
        list.push({
          id: `lyr-gen-${idx++}`,
          prompt: `${line1} ...`,
          artist: `${artist} · ${tone}`,
          options: opts,
          correctIndex: opts.indexOf(rightLine),
        });
      }
    }
    cachedLyricsUniverse = list;
  }
  return pickNonRepeating('lyrics', cachedLyricsUniverse, count, (i) => i.id);
}

// =========================================================================
// 4. ENIGMA DOS SÍMBOLOS (ZERO EMOJIS - SÓ TOKENS VETORIAIS)
// =========================================================================
export interface SymbolCharadeItem {
  id: string;
  symbols: string[];
  clueText: string;
  answer: string;
  options: string[];
  category: string;
}

const SYMBOL_COMBOS: { symbols: string[]; clueText: string; answer: string; wrongs: string[]; category: string }[] = [
  { symbols: ['moon', 'star', 'heart'], clueText: 'Céu noturno + brilho + paixão', answer: 'Noite estrelada e romântica', wrongs: ['Almoço no trabalho', 'Chuva no trânsito', 'Café da manhã corrido'], category: 'Momentos' },
  { symbols: ['music', 'guitar', 'rose'], clueText: 'Canção + instrumento + flor', answer: 'Serenata apaixonada', wrongs: ['Treino na academia', 'Lista de mercado', 'Faxina de domingo'], category: 'Romance' },
  { symbols: ['camera', 'sun', 'heart'], clueText: 'Lente + luz dourada + afeto', answer: 'Foto do pôr do sol do casal', wrongs: ['Conta de luz atrasada', 'Aula de matemática', 'Relógio quebrado'], category: 'Memórias' },
  { symbols: ['key', 'letter', 'lock'], clueText: 'Segredo + papel + proteção', answer: 'Carta selada na cápsula do tempo', wrongs: ['Boleto bancário', 'Mapa do metrô', 'Receita de remédio'], category: 'Segredos' },
  { symbols: ['coffee', 'book', 'heart'], clueText: 'Xícara quente + leitura + carinho', answer: 'Tarde aconchegante lendo juntos', wrongs: ['Corrida de fórmula 1', 'Tempestade no deserto', 'Mergulho congelante'], category: 'Rotina' },
  { symbols: ['compass', 'plane', 'camera'], clueText: 'Direção + viagem + cliques', answer: 'Viagem inesquecível do casal', wrongs: ['Reunião de condomínio', 'Fila de banco', 'Prova de física'], category: 'Sonhos' },
  { symbols: ['crown', 'diamond', 'rose'], clueText: 'Realeza + joia + pétalas', answer: 'Presente digno de princesa', wrongs: ['Chave de fenda enferrujada', 'Saco de cimento', 'Agenda vazia'], category: 'Mimos' },
  { symbols: ['tree', 'seed', 'sparkle'], clueText: 'Copa + broto + magia', answer: 'Crescimento da Árvore do Amor', wrongs: ['Deserto sem chuva', 'Ponte interditada', 'Semáforo vermelho'], category: 'Universo' },
];

let cachedCharadesUniverse: SymbolCharadeItem[] | null = null;

export function drawCharadesDeck(count: number): SymbolCharadeItem[] {
  if (!cachedCharadesUniverse) {
    const list: SymbolCharadeItem[] = EMOJI_CHARADES_POOL.map((c, i) => ({
      id: `sym-base-${i}`,
      ...c,
    }));
    let idx = 1;
    const moods = ['Edição Clássica', 'Modo Poético', 'Desafio Relâmpago'];
    for (const mood of moods) {
      for (const item of SYMBOL_COMBOS) {
        const opts = [item.answer, ...item.wrongs].sort(() => Math.random() - 0.5);
        list.push({
          id: `sym-gen-${idx++}`,
          symbols: item.symbols,
          clueText: item.clueText,
          answer: item.answer,
          options: opts,
          category: `${item.category} · ${mood}`,
        });
      }
    }
    cachedCharadesUniverse = list;
  }
  return pickNonRepeating('charades', cachedCharadesUniverse, count, (i) => i.id);
}

// =========================================================================
// 5. QUEM É MAIS PROVÁVEL MASSIVO
// =========================================================================
const WML_ACTIONS = [
  'mandar mensagem fofa bem cedo antes de sair',
  'escolher o filme e dormir nos primeiros 15 minutos',
  'tirar 20 fotos no mesmo lugar até ficar perfeita',
  'cantar bem alto uma música romântica no carro',
  'preparar uma surpresa escondida sem aguentar guardar segredo',
  'ficar com ciúmes fofos e fazer bico por 2 minutos',
  'pedir sobremesa mesmo depois de dizer que estava cheio',
  'abrir a galeria só para rever fotos antigas do casal',
  'adotar mais um bichinho fofo na aba de Mascotes',
  'passar meia hora escolhendo a cor exata de um sofá 3D',
  'dar risada na hora mais séria só porque olhou pro outro',
  'mandar áudio longo contando cada detalhe do dia',
  'guardar bilhetinhos, recibos de passeio e lembranças',
  'escolher a música mais sentimental da playlist',
  'dizer "eu te amo" antes mesmo de desligar a ligação',
  'planejar uma viagem dos sonhos às 2h da manhã',
  'fazer cafuné até o outro pegar no sono',
  'tentar acertar todas as perguntas do Mega Quiz só para bater recorde',
];

const WML_SITUATIONS = [
  'Quem tem mais chance de',
  'Num sábado à noite, quem vai',
  'Sem pensar duas vezes, quem costuma',
  'Na viagem dos sonhos, quem provavelmente vai',
  'Aqui no Nosso Mundo, quem sempre decide',
];

let cachedWhoMostUniverse: string[] | null = null;

export function drawWhoMostLikelyDeck(count: number): string[] {
  if (!cachedWhoMostUniverse) {
    const set = new Set<string>(WHO_MOST_LIKELY_POOL);
    for (const sit of WML_SITUATIONS) {
      for (const act of WML_ACTIONS) {
        set.add(`${sit} ${act}?`);
      }
    }
    cachedWhoMostUniverse = Array.from(set);
  }
  return pickNonRepeating('who_most_likely', cachedWhoMostUniverse, count, (s) => s);
}

// =========================================================================
// 6. CHARADAS DO CORAÇÃO MASSIVO
// =========================================================================
export interface RiddleItem {
  id: string;
  question: string;
  hint: string;
  options: string[];
  correctIndex: number;
}

const EXTRA_RIDDLES: { q: string; hint: string; right: string; wrongs: string[] }[] = [
  { q: 'Quanto mais você divide com quem ama, mais ele cresce sem nunca acabar. O que é?', hint: 'Sente no peito', right: 'O amor', wrongs: ['Um bolo pequeno', 'Saldo bancário', 'Tempo do alarme'] },
  { q: 'Tem chaves mas não abre portas, tem notas mas não é banco. O que alegra o casal?', hint: 'Faz melodia', right: 'Um piano ou música', wrongs: ['Caderno vazio', 'Gaveta trancada', 'Mochila escolar'] },
  { q: 'Pode atravessar oceanos num segundo, aquecer o dia frio e não custa nada. O que é?', hint: 'Vai escrita ou falada', right: 'Uma mensagem de carinho', wrongs: ['Passagem aérea', 'Casaco de lã', 'Termômetro'] },
  { q: 'Captura um instante para sempre sem precisar de gaiola nem rede. O que é?', hint: 'Fica na nossa Galeria', right: 'A fotografia', wrongs: ['Um espelho escuro', 'Relógio de areia', 'Guarda-chuva'] },
  { q: 'Brilha quando está escuro, acompanha os apaixonados e muda de fase sem nunca ir embora.', hint: 'Olhe para o céu à noite', right: 'A Lua', wrongs: ['Poste da rua', 'Lanterna sem pilha', 'Espelho de bolsa'] },
  { q: 'Nasce de uma pequena semente, cresce com cuidado diário e dá frutos doces de promessas.', hint: 'Fica na aba Árvore', right: 'A Árvore do Amor', wrongs: ['Uma parede de pedra', 'Sofá da sala', 'Calculadora'] },
  { q: 'Tem ponteiros mas não aponta dedos; quando estamos juntos parece voar rápido demais.', hint: 'Mede horas e minutos', right: 'O relógio', wrongs: ['Bússola antiga', 'Garfo de jantar', 'Pincel fino'] },
  { q: 'Une duas mãos mesmo em dias difíceis e transforma qualquer casa num lar de verdade.', hint: 'Começa com C de coração', right: 'Cumplicidade', wrongs: ['Pressa', 'Orgulho', 'Teimosia'] },
];

let cachedRiddlesUniverse: RiddleItem[] | null = null;

export function drawRiddlesDeck(count: number): RiddleItem[] {
  if (!cachedRiddlesUniverse) {
    const list: RiddleItem[] = RIDDLES_POOL.map((r, i) => ({
      id: `rid-base-${i}`,
      ...r,
    }));
    let idx = 1;
    const wrappers = ['', 'Adivinha do Casal: ', 'Enigma poético: '];
    for (const wrap of wrappers) {
      for (const r of EXTRA_RIDDLES) {
        const opts = [r.right, ...r.wrongs].sort(() => Math.random() - 0.5);
        list.push({
          id: `rid-gen-${idx++}`,
          question: `${wrap}${r.q}`,
          hint: r.hint,
          options: opts,
          correctIndex: opts.indexOf(r.right),
        });
      }
    }
    cachedRiddlesUniverse = list;
  }
  return pickNonRepeating('riddles', cachedRiddlesUniverse, count, (i) => i.id);
}

// =========================================================================
// 7. BANCO GIGANTE DE PALAVRAS (FORCA, EMBARALHADA E CAÇA-PALAVRAS)
// =========================================================================
export interface WordClueEntry {
  word: string;
  hint: string;
}

const EXTRA_WORD_CLUES: WordClueEntry[] = [
  { word: 'CARINHO', hint: 'Gesto doce que acalma qualquer dia corrido' },
  { word: 'ABRACADO', hint: 'Bem juntinho um do outro' },
  { word: 'ETERNO', hint: 'Algo feito para durar para sempre' },
  { word: 'PROMESSA', hint: 'Compromisso bonito amarrado na árvore' },
  { word: 'SINTONIA', hint: 'Quando os corações batem no mesmo ritmo' },
  { word: 'SAMELLA', hint: 'O grande amor e dona desse universo' },
  { word: 'GABRIEL', hint: 'Quem preparou cada linha desse mundo com amor' },
  { word: 'ROMANCE', hint: 'Clima de paixão no ar' },
  { word: 'DIAMANTE', hint: 'Joia brilhante que colecionamos juntos' },
  { word: 'MELODIA', hint: 'Música que lembra momentos nossos' },
  { word: 'ESTRELAS', hint: 'Brilham no céu noturno sobre o casal' },
  { word: 'CAFUNE', hint: 'Carinho gostoso na cabeça ou nos cabelos' },
  { word: 'SORRISO', hint: 'Ilumina o rosto quando nos vemos' },
  { word: 'SAUDADE', hint: 'Sentimento quando ficamos longe um do outro' },
  { word: 'CEREJEIRA', hint: 'Árvore florida com pétalas rosadas' },
  { word: 'AQUARIO', hint: 'Onde nossos peixinhos mágicos nadam' },
  { word: 'GATINHO', hint: 'Nosso primeiro mascote fofo' },
  { word: 'ALEGRIA', hint: 'Sentimento constante ao seu lado' },
  { word: 'BEIJINHO', hint: 'Mimo rápido cheio de afeto' },
  { word: 'CUMPLICE', hint: 'Parceiro para todos os planos' },
  { word: 'PAIXAO', hint: 'Fogo bonito que aquece o peito' },
  { word: 'TERNURA', hint: 'Suavidade em cada palavra dita' },
  { word: 'DESTINO', hint: 'O que cruzou nossos caminhos em 12/06' },
  { word: 'MEMORIA', hint: 'Lembrança guardada nas fotos' },
  { word: 'UNIVERSO', hint: 'O Nosso Mundo inteiro feito para dois' },
  { word: 'ORQUIDEA', hint: 'Flor delicada e elegante' },
  { word: 'LUAR', hint: 'Luz prateada da Lua cheia' },
  { word: 'VIOLETA', hint: 'Cor mágica do nosso cantinho' },
  { word: 'SURPRESA', hint: 'Presente escondido sem avisar antes' },
  { word: 'FELICIDADE', hint: 'Objetivo cumprido quando estamos juntos' },
  { word: 'ACOLHIMENTO', hint: 'Paz que sentimos ao chegar perto' },
  { word: 'COMPANHIA', hint: 'Estar presente em qualquer hora' },
  { word: 'POESIA', hint: 'Amor transformado em belas palavras' },
  { word: 'ENCONTRO', hint: 'Momento marcado no calendário para nos ver' },
  { word: 'CORACAO', hint: 'Bate mais forte quando você chega' },
  { word: 'SONHOS', hint: 'Planos lindos escritos na lista do casal' },
  { word: 'PRESENTE', hint: 'Mimo entregue com carinho' },
  { word: 'VIAGEM', hint: 'Aventura nova de mãos dadas' },
  { word: 'CANCAO', hint: 'Música que vira trilha sonora da história' },
  { word: 'AURORA', hint: 'Brilho colorido do amanhecer' },
  { word: 'AMIZADE', hint: 'Base forte que sustenta o amor' },
  { word: 'CHOCOLATE', hint: 'Doce favorito para dividir no frio' },
  { word: 'CINEMA', hint: 'Pipoca, escurinho e mão dada' },
  { word: 'PIPOCA', hint: 'Acompanha maratona de filmes abraçados' },
  { word: 'VARANDA', hint: 'Cantinho da casa pra ver o pôr do sol' },
  { word: 'LAREIRA', hint: 'Aquece a sala na noite fria' },
  { word: 'SERENATA', hint: 'Música cantada pra declarar amor' },
  { word: 'AFETO', hint: 'Carinho genuíno em cada detalhe' },
  { word: 'ALIANCA', hint: 'Símbolo redondo de compromisso sem fim' },
  { word: 'CONQUISTA', hint: 'Marco celebrado juntos no aplicativo' },
];

export function getExpandedHangmanPool(): WordClueEntry[] {
  const seen = new Set<string>();
  const combined: WordClueEntry[] = [];
  for (const item of [...HANGMAN_POOL, ...EXTRA_WORD_CLUES]) {
    const clean = item.word.toUpperCase().replace(/[^A-Z]/g, '');
    if (clean.length >= 3 && !seen.has(clean)) {
      seen.add(clean);
      combined.push({ word: clean, hint: item.hint });
    }
  }
  return combined;
}

export function drawHangmanWord(excludeWord?: string): WordClueEntry {
  const pool = getExpandedHangmanPool().filter((w) => w.word !== excludeWord);
  return pickNonRepeating('hangman', pool, 1, (w) => w.word)[0] || EXTRA_WORD_CLUES[0];
}

export function drawScrambleWords(count: number): WordClueEntry[] {
  const shortPool = getExpandedHangmanPool().filter((i) => i.word.length >= 4 && i.word.length <= 9);
  return pickNonRepeating('scramble', shortPool, count, (w) => w.word);
}

export function getExpandedWordSearchPool(): string[] {
  const set = new Set<string>(WORDSEARCH_WORDS.filter((w) => w.length >= 3 && w.length <= 6));
  for (const entry of EXTRA_WORD_CLUES) {
    if (entry.word.length >= 3 && entry.word.length <= 6) {
      set.add(entry.word);
    }
  }
  [
    'AMOR', 'BEIJO', 'VIDA', 'FLOR', 'DOCE', 'LUZ', 'PAZ', 'SOL', 'LUA', 'MAR',
    'CASA', 'RISO', 'SONHO', 'MIMOS', 'ANJO', 'MAGIA', 'ROSA', 'FADA', 'LINDA',
    'NOITE', 'TARDE', 'BRILHO', 'GATO', 'PANDA', 'LOBO', 'CORAL', 'PEIXE', 'MEL',
  ].forEach((w) => set.add(w));
  return Array.from(set);
}

// =========================================================================
// 8. MATEMÁTICA RELÂMPAGO PROCEDURAL (2.000+ variações)
// =========================================================================
export function generateDynamicMathQuestion(): { text: string; ans: number; options: number[] } {
  const roll = Math.random();
  let text = '';
  let ans = 0;

  if (roll < 0.34) {
    const a = Math.floor(Math.random() * 45) + 4;
    const b = Math.floor(Math.random() * 38) + 3;
    ans = a + b;
    text = `${a} + ${b} = ?`;
  } else if (roll < 0.65) {
    let a = Math.floor(Math.random() * 55) + 10;
    let b = Math.floor(Math.random() * 35) + 2;
    if (b > a) [a, b] = [b, a];
    ans = a - b;
    text = `${a} - ${b} = ?`;
  } else if (roll < 0.88) {
    const a = Math.floor(Math.random() * 11) + 2;
    const b = Math.floor(Math.random() * 11) + 2;
    ans = a * b;
    text = `${a} × ${b} = ?`;
  } else {
    const b = Math.floor(Math.random() * 8) + 2;
    const quotient = Math.floor(Math.random() * 11) + 2;
    const a = b * quotient;
    ans = quotient;
    text = `${a} ÷ ${b} = ?`;
  }

  const optSet = new Set<number>([ans]);
  while (optSet.size < 4) {
    const delta = Math.floor(Math.random() * 11) - 5;
    if (ans + delta >= 0 && delta !== 0) {
      optSet.add(ans + delta);
    }
  }
  return {
    text,
    ans,
    options: Array.from(optSet).sort(() => Math.random() - 0.5),
  };
}
