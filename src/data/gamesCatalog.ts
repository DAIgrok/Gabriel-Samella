import { QuizQuestion } from '../types';

export type GameCategory = 'quiz' | 'palavras' | 'logica' | 'acao';

export type GameId =
  | 'quiz'
  | 'memoria'
  | 'coracoes'
  | 'velha'
  | 'forca'
  | 'embaralhada'
  | 'verdadeiro'
  | 'letra'
  | 'emoji'
  | 'quemnós'
  | 'charadas'
  | 'cacapalavras'
  | 'ppt'
  | 'matematica'
  | 'genius'
  | 'flores2048'
  | 'codigosecreto'
  | 'campominado'
  | 'labirinto'
  | 'baloes'
  | 'torre'
  | 'cronometro'
  | 'reflexo'
  | 'anel'
  | 'maratona';

export interface GameCatalogItem {
  id: GameId;
  title: string;
  category: GameCategory;
  icon: string;
  description: string;
  rewardText: string;
}

export const GAMES_CATALOG: GameCatalogItem[] = [
  {
    id: 'quiz',
    title: 'Mega Quiz do Casal',
    category: 'quiz',
    icon: 'trophy',
    description: 'Perguntas sorteadas sobre Gabriel, Samella e amor',
    rewardText: '+2 a +6 diamantes',
  },
  {
    id: 'memoria',
    title: 'Memória Temática',
    category: 'logica',
    icon: 'grid',
    description: '8 temas ilustrados com cartas diferentes a cada partida',
    rewardText: '+3 a +5 diamantes',
  },
  {
    id: 'coracoes',
    title: 'Chuva de Corações',
    category: 'acao',
    icon: 'heart',
    description: 'Toque nos corações e cristais iluminados em movimento',
    rewardText: '+2 a +5 diamantes',
  },
  {
    id: 'velha',
    title: 'Jogo da Velha do Amor',
    category: 'logica',
    icon: 'target',
    description: 'Jogue contra o Cupido Bot ou 2 no mesmo celular',
    rewardText: '+3 diamantes',
  },
  {
    id: 'forca',
    title: 'Forca Romântica',
    category: 'palavras',
    icon: 'letter',
    description: 'Descubra palavras apaixonadas antes do fim',
    rewardText: '+4 diamantes',
  },
  {
    id: 'embaralhada',
    title: 'Palavra Embaralhada',
    category: 'palavras',
    icon: 'book',
    description: 'Ordene as letras para revelar 3 palavras',
    rewardText: '+4 diamantes',
  },
  {
    id: 'verdadeiro',
    title: 'Verdadeiro ou Falso',
    category: 'quiz',
    icon: 'award',
    description: 'Desafio rápido de 8 afirmações variadas',
    rewardText: '+2 a +5 diamantes',
  },
  {
    id: 'letra',
    title: 'Complete a Letra',
    category: 'quiz',
    icon: 'music',
    description: 'Acerte os versos de músicas e poesias',
    rewardText: '+4 diamantes',
  },
  {
    id: 'emoji',
    title: 'Enigma dos Símbolos',
    category: 'palavras',
    icon: 'sparkles',
    description: 'Decifre filmes, músicas e momentos pelos símbolos ilustrados',
    rewardText: '+4 diamantes',
  },
  {
    id: 'quemnós',
    title: 'Quem é Mais Provável?',
    category: 'quiz',
    icon: 'heart',
    description: 'Cartas divertidas para responder sobre o casal',
    rewardText: '+3 diamantes',
  },
  {
    id: 'charadas',
    title: 'Charadas do Coração',
    category: 'palavras',
    icon: 'moon',
    description: 'Enigmas doces e inteligentes com dicas',
    rewardText: '+4 diamantes',
  },
  {
    id: 'cacapalavras',
    title: 'Caça-Palavras Mágico',
    category: 'palavras',
    icon: 'compass',
    description: 'Tabuleiro gerado na hora com palavras escondidas',
    rewardText: '+5 diamantes',
  },
  {
    id: 'ppt',
    title: 'Pedra, Papel & Tesoura',
    category: 'acao',
    icon: 'zap',
    description: 'Melhor de 5 rodadas com efeito de placar',
    rewardText: '+3 diamantes',
  },
  {
    id: 'matematica',
    title: 'Matemática Relâmpago',
    category: 'logica',
    icon: 'target',
    description: 'Contas rápidas de 25s com pontuação dinâmica',
    rewardText: '+2 a +5 diamantes',
  },
  {
    id: 'genius',
    title: 'Sequência Genius',
    category: 'logica',
    icon: 'sparkles',
    description: 'Memorize a ordem das joias musicais iluminadas',
    rewardText: '+3 a +6 diamantes',
  },
  {
    id: 'flores2048',
    title: '2048 das Flores',
    category: 'logica',
    icon: 'flower',
    description: 'Una espécies iguais até formar a Coroa Real',
    rewardText: '+3 a +6 diamantes',
  },
  {
    id: 'codigosecreto',
    title: 'Cofre Secreto',
    category: 'logica',
    icon: 'crown',
    description: 'Descubra a combinação de 4 símbolos do amor',
    rewardText: '+6 diamantes',
  },
  {
    id: 'campominado',
    title: 'Jardim Sem Espinhos',
    category: 'logica',
    icon: 'seed',
    description: 'Abra as flores sem tocar nos espinhos ocultos',
    rewardText: '+5 diamantes',
  },
  {
    id: 'labirinto',
    title: 'Labirinto do Cupido',
    category: 'logica',
    icon: 'compass',
    description: 'Labirinto procedural novo em cada partida',
    rewardText: '+5 diamantes',
  },
  {
    id: 'baloes',
    title: 'Estoura Balões',
    category: 'acao',
    icon: 'gift',
    description: 'Estoure balões luminosos e evite as bombas por 25s',
    rewardText: '+2 a +5 diamantes',
  },
  {
    id: 'torre',
    title: 'Torre dos Sonhos',
    category: 'acao',
    icon: 'house',
    description: 'Alinhe e empilhe 10 blocos no momento exato',
    rewardText: '+3 a +6 diamantes',
  },
  {
    id: 'cronometro',
    title: 'Alvo 5.00 Segundos',
    category: 'acao',
    icon: 'sun',
    description: 'Pare o relógio o mais perto possível de 5.00s',
    rewardText: '+2 a +5 diamantes',
  },
  {
    id: 'reflexo',
    title: 'Reflexo Apaixonado',
    category: 'acao',
    icon: 'zap',
    description: 'Toque assim que a luz rosa acender',
    rewardText: '+2 a +5 diamantes',
  },
  {
    id: 'anel',
    title: 'Onde Está a Aliança?',
    category: 'acao',
    icon: 'diam',
    description: 'Acompanhe as taças embaralhadas com atenção',
    rewardText: '+3 a +5 diamantes',
  },
  {
    id: 'maratona',
    title: 'Maratona Mista Surpresa',
    category: 'quiz',
    icon: 'star',
    description: '5 rodadas surpresa misturando vários modos',
    rewardText: '+6 diamantes',
  },
];

export function pickRandomItems<T>(items: T[], count: number): T[] {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy.slice(0, Math.min(count, copy.length));
}

// =========================================================================
// 1. MEGA QUIZ DO CASAL (64 Base Questions)
// =========================================================================
export const QUIZ_QUESTIONS_BASE: QuizQuestion[] = [
  { id: 'qb-1', category: 'Nós Dois', question: 'Em que data especial começou o namoro oficial de Gabriel e Samella?', options: ['12 de Junho de 2023', '10 de Julho de 2023', '14 de Fevereiro de 2023', '25 de Dezembro de 2022'], correctIndex: 0 },
  { id: 'qb-2', category: 'Nós Dois', question: 'O que o Gabriel mais ama na Samella?', options: ['O sorriso e a doçura do coração', 'A risada espontânea', 'O abraço que acalma o mundo', 'Absolutamente tudo nela ♡'], correctIndex: 3 },
  { id: 'qb-3', category: 'Músicas', question: 'Qual música de Luan Santana diz "Quando a luz dos olhos meus e a luz dos olhos teus resolvem se encontrar"?', options: ['Escreve Aí', 'Te Vivo', 'Acordando o Prédio', 'Tudo o Que Você Quiser'], correctIndex: 1 },
  { id: 'qb-4', category: 'Fé & Amor', question: 'Complete o versículo de Mateus 19:6: "Portanto, o que Deus uniu..."', options: ['o tempo fortalece sempre', 'ninguém separa!', 'é abençoado hoje', 'brilha para sempre'], correctIndex: 1 },
  { id: 'qb-5', category: 'Músicas', question: 'Quem canta a música "Leal" presente na playlist do casal?', options: ['Djonga', 'Luan Santana', 'Henrique & Juliano', 'Matuê'], correctIndex: 0 },
  { id: 'qb-6', category: 'Fé & Amor', question: 'Qual livro da Bíblia traz a famosa descrição "O amor é paciente, o amor é bondoso"?', options: ['Salmos 23', '1 Coríntios 13', 'Provérbios 31', 'Cânticos 8'], correctIndex: 1 },
  { id: 'qb-7', category: 'Nós Dois', question: 'Que tipo de celebração é comemorada no dia 12 de Junho no Brasil?', options: ['Dia dos Pais', 'Dia dos Namorados', 'Natal', 'Dia da Amizade'], correctIndex: 1 },
  { id: 'qb-8', category: 'Poesia', question: 'Quem escreveu "Que não seja imortal, posto que é chama / Mas que seja infinito enquanto dure"?', options: ['Machado de Assis', 'Carlos Drummond', 'Vinicius de Moraes', 'Castro Alves'], correctIndex: 2 },
  { id: 'qb-9', category: 'Músicas', question: 'Complete: "Amar não é pecado e se eu errar, que seja..."', options: ['no meu caminho', 'nos seus braços', 'na sua casa', 'em outro lugar'], correctIndex: 1 },
  { id: 'qb-10', category: 'Músicas', question: 'De qual dupla sertaneja é o sucesso "Cuida Bem Dela"?', options: ['Jorge & Mateus', 'Henrique & Juliano', 'Zé Neto & Cristiano', 'Matheus & Kauan'], correctIndex: 1 },
  { id: 'qb-11', category: 'Nosso Mundo', question: 'Qual é a moeda usada para comprar roupas de pets e vales na Loja do Amor?', options: ['Estrelas', 'Diamantes', 'Moedas de Ouro', 'Corações'], correctIndex: 1 },
  { id: 'qb-12', category: 'Nosso Mundo', question: 'Qual é o nível máximo que a Árvore do Amor pode alcançar?', options: ['Nível 5', 'Nível 8', 'Nível 10', 'Nível 20'], correctIndex: 2 },
  { id: 'qb-13', category: 'Fé & Amor', question: 'Complete Cânticos 8:7: "As muitas águas não podem apagar este amor..."', options: ['nem os mares podem vencer', 'nem os rios afogá-lo', 'nem o sol queimá-lo', 'nem o vento levar'], correctIndex: 1 },
  { id: 'qb-14', category: 'Romance', question: 'Qual pedra preciosa tradicionalmente simboliza o amor eterno nas alianças?', options: ['Esmeralda', 'Diamante', 'Safira', 'Ônix'], correctIndex: 1 },
  { id: 'qb-15', category: 'Nós Dois', question: 'Qual é a principal senha simbólica inspirada no dia de vocês?', options: ['1206', '2512', '0101', '1402'], correctIndex: 0 },
  { id: 'qb-16', category: 'Músicas', question: 'Em "Tudo o Que Você Quiser", o que o cantor promete dar?', options: ['O sol, o mar e o coração', 'Um carro novo', 'Uma casa na praia', 'Uma viagem espacial'], correctIndex: 0 },
  { id: 'qb-17', category: 'Romance', question: 'Qual flor é o símbolo mundial clássico da paixão e do romance?', options: ['Rosa Vermelha', 'Dente-de-Leão', 'Cacto', 'Samambaia'], correctIndex: 0 },
  { id: 'qb-18', category: 'Fé & Amor', question: 'Em Colossenses 3:14, o amor é descrito como:', options: ['O brilho da manhã', 'O elo perfeito', 'A chave da casa', 'A fonte das águas'], correctIndex: 1 },
  { id: 'qb-19', category: 'Músicas', question: 'Complete: "De Janeiro a Janeiro, até o mundo..."', options: ['parar de girar', 'acabar', 'dormir em paz', 'mudar de cor'], correctIndex: 1 },
  { id: 'qb-20', category: 'Nosso Mundo', question: 'Quais são os 4 cômodos do seu mascote virtual estilo Pou & Tom?', options: ['Sala, Cozinha, Banheiro e Quarto', 'Sala, Jardim, Garagem e Sótão', 'Cozinha, Quintal, Escritório e Varanda', 'Quarto, Praia, Floresta e Castelo'], correctIndex: 0 },
  { id: 'qb-21', category: 'Curiosidades', question: 'Por que usamos aliança de compromisso no dedo anelar da mão direita?', options: ['Por estética moderna', 'Pela tradição da veia que liga ao coração', 'Porque é o dedo maior', 'Por causa da astrologia'], correctIndex: 1 },
  { id: 'qb-22', category: 'Músicas', question: 'Qual cantor britânico canta "Photograph" e "Perfect"?', options: ['Justin Bieber', 'Ed Sheeran', 'Shawn Mendes', 'Bruno Mars'], correctIndex: 1 },
  { id: 'qb-23', category: 'Nós Dois', question: 'Para quando está programada a abertura da Cápsula do Tempo natalina?', options: ['25/12/2026', '25/12/2028', '12/06/2030', '01/01/2027'], correctIndex: 1 },
  { id: 'qb-24', category: 'Fé & Amor', question: 'Complete Rute 1:16: "Onde quer que fores, irei eu; e onde quer que pousares à noite..."', options: ['descansarei também', 'ali pousarei eu', 'verei as estrelas', 'esperarei o dia'], correctIndex: 1 },
  { id: 'qb-25', category: 'Romance', question: 'Qual cidade europeia ficou conhecida mundialmente como a Cidade Luz e do Amor?', options: ['Roma', 'Viena', 'Paris', 'Lisboa'], correctIndex: 2 },
  { id: 'qb-26', category: 'Músicas', question: 'Complete o verso de "A Thousand Years": "I have died everyday..."', options: ['loving you', 'waiting for you', 'missing you', 'thinking of you'], correctIndex: 1 },
  { id: 'qb-27', category: 'Nosso Mundo', question: 'Quantas cartas iniciais Gabriel preparou na aba Cartas do Amor?', options: ['5 cartas', '12 cartas', '30 cartas', '3 cartas'], correctIndex: 1 },
  { id: 'qb-28', category: 'Nós Dois', question: 'Em "Para quando você tiver um dia difícil", o que Gabriel lembra à Samella?', options: ['Que ela é capaz, forte e nunca está sozinha', 'Que ela precisa dormir cedo', 'Que o trabalho vai dobrar', 'Para fazer compras'], correctIndex: 0 },
  { id: 'qb-29', category: 'Curiosidades', question: 'Qual hormônio é conhecido como o "hormônio do amor e do abraço"?', options: ['Adrenalina', 'Ocitocina', 'Insulina', 'Cortisol'], correctIndex: 1 },
  { id: 'qb-30', category: 'Romance', question: 'Em média, quantos segundos de abraço ajudam o corpo a liberar ocitocina relaxante?', options: ['1 segundo', '20 segundos', '10 minutos', '2 horas'], correctIndex: 1 },
  { id: 'qb-31', category: 'Músicas', question: 'Qual música de Tiago Iorc diz "Troquei o mundo pelos seus olhos"?', options: ['Coisa Linda', 'Amei Te Ver', 'Tangerina', 'Milionário'], correctIndex: 1 },
  { id: 'qb-32', category: 'Fé & Amor', question: 'Segundo Cânticos 2:16: "O meu amado é meu..."', options: ['para sempre hoje', 'e eu sou dele', 'como o sol nasce', 'no jardim em flor'], correctIndex: 1 },
  { id: 'qb-33', category: 'Nosso Mundo', question: 'Que tipo de árvore mística cresce até o Nível 10 com fitas de promessa?', options: ['Pinheiro da Neve', 'Árvore do Amor', 'Baobá Dourado', 'Palmeira Real'], correctIndex: 1 },
  { id: 'qb-34', category: 'Curiosidades', question: 'Quantos corações um polvo tem no oceano?', options: ['1', '2', '3', '5'], correctIndex: 2 },
  { id: 'qb-35', category: 'Romance', question: 'Qual alimento doce ficou famoso por despertar alegria e ser um presente clássico entre casais?', options: ['Chocolate', 'Pepino', 'Limão', 'Salsinha'], correctIndex: 0 },
  { id: 'qb-36', category: 'Poesia', question: 'Complete: "Amar é ter um céu inteiro dentro de um..."', options: ['olhar', 'relógio', 'caderno', 'sapato'], correctIndex: 0 },
  { id: 'qb-37', category: 'Músicas', question: 'Complete "Eu Sei Que Vou Te Amar" (Tom Jobim): "Eu sei que vou te amar, por toda a..."', options: ['minha estrada', 'minha vida', 'noite estrelada', 'eternidade agora'], correctIndex: 1 },
  { id: 'qb-38', category: 'Nós Dois', question: 'Qual cor representa o brilho principal do universo de Gabriel e Samella?', options: ['Verde-limão e cinza', 'Roxo profundo, preto e rosa-magenta', 'Laranja e marrom', 'Azul-bebê e branco'], correctIndex: 1 },
  { id: 'qb-39', category: 'Nosso Mundo', question: 'Quantas espécies diferentes de bichinhos virtuais existem no catálogo de adoção?', options: ['3 espécies', '22 espécies', '8 espécies', '5 espécies'], correctIndex: 1 },
  { id: 'qb-40', category: 'Romance', question: 'Qual constelação parece desenhar um W e brilha no céu em histórias românticas?', options: ['Cassiopeia', 'Órion', 'Escorpião', 'Peixes'], correctIndex: 0 },
  { id: 'qb-41', category: 'Músicas', question: 'Qual dupla canta "Fica" com Anavitória?', options: ['Matheus & Kauan', 'Jorge & Mateus', 'Bruno & Marrone', 'Chitãozinho & Xororó'], correctIndex: 0 },
  { id: 'qb-42', category: 'Curiosidades', question: 'Qual animal marinho costuma dormir de mãos dadas para não se separar na correnteza?', options: ['Tubarão', 'Lontra-marinha', 'Água-viva', 'Lagosta'], correctIndex: 1 },
  { id: 'qb-43', category: 'Curiosidades', question: 'Quais aves são famosas por ficarem juntas com o mesmo parceiro por toda a vida?', options: ['Pardais', 'Cisnes e pinguins', 'Gaivotas', 'Avestruzes'], correctIndex: 1 },
  { id: 'qb-44', category: 'Fé & Amor', question: 'Em Provérbios 18:22: "Quem encontra uma esposa encontra algo excelente..."', options: ['recebeu uma bênção do Senhor', 'ganhou o mundo inteiro', 'descobriu um segredo', 'achou ouro puro'], correctIndex: 0 },
  { id: 'qb-45', category: 'Nosso Mundo', question: 'Como as cartas antigas são fechadas simbolicamente na aba Cartas?', options: ['Com fita adesiva', 'Com selo de cera vermelho', 'Com clipe de papel', 'Com cadeado digital'], correctIndex: 1 },
  { id: 'qb-46', category: 'Romance', question: 'Qual signo zodiacal rege tradicionalmente o dia 12 de Junho?', options: ['Gêmeos', 'Touro', 'Áries', 'Escorpião'], correctIndex: 0 },
  { id: 'qb-47', category: 'Músicas', question: 'Em "Perfect" (Ed Sheeran), com quem ele dança descalço na grama?', options: ['Ouvindo sua música favorita', 'Debaixo da chuva forte', 'Na areia do deserto', 'Em um teatro vazio'], correctIndex: 0 },
  { id: 'qb-48', category: 'Curiosidades', question: 'Qual flor significa "amor verdadeiro e carinho" na linguagem das flores (floriografia)?', options: ['Dente-de-leão', 'Rosa', 'Urtiga', 'Cardo'], correctIndex: 1 },
  { id: 'qb-49', category: 'Nós Dois', question: 'Qual a melhor resposta quando a Samella pergunta "Você me ama quanto?"', options: ['Mais que ontem e menos que amanhã ♡', 'Um pouquinho', 'Talvez amanhã', 'Só segunda-feira'], correctIndex: 0 },
  { id: 'qb-50', category: 'Nosso Mundo', question: 'O que acontece quando você toca 5 vezes na logo "Nosso Mundo"?', options: ['O site desliga', 'Desbloqueia um Easter Egg e diamantes!', 'Apaga as fotos', 'Muda o idioma para japonês'], correctIndex: 1 },
  { id: 'qb-51', category: 'Romance', question: 'Qual doce francês em formato de conchinha colorida virou símbolo de encontros fofos?', options: ['Macaron', 'Pão de queijo', 'Pastel', 'Coxinha'], correctIndex: 0 },
  { id: 'qb-52', category: 'Músicas', question: 'Complete "De Janeiro a Janeiro" (Roberta Campos & Nando Reis): "Não sei se o mundo é bom, mas ele está..."', options: ['muito longe', 'bem melhor desde que você chegou', 'girando rápido demais', 'cheio de mistérios'], correctIndex: 1 },
  { id: 'qb-53', category: 'Poesia', question: 'Complete o provérbio popular: "Quem ama cuida, e quem cuida..."', options: ['esquece depois', 'protege e valoriza todos os dias', 'fica longe', 'não sente saudade'], correctIndex: 1 },
  { id: 'qb-54', category: 'Nosso Mundo', question: 'Onde fica o Easter Egg do "Focinho do Mascote"?', options: ['Na tela de Login', 'Tocando no nariz do pet na aba Meu Pet', 'Na calculadora', 'Na aba de Músicas'], correctIndex: 1 },
  { id: 'qb-55', category: 'Curiosidades', question: 'Qual som acalma instantaneamente os gatinhos e humanos quando estão juntos?', options: ['Ronronar suave', 'Buzina de trânsito', 'Despertador alto', 'Trovão seco'], correctIndex: 0 },
  { id: 'qb-56', category: 'Romance', question: 'Que presente não custa nada, cabe em todo lugar e transforma um dia ruim?', options: ['Um abraço sincero', 'Uma pedra', 'Uma multa', 'Um boleto'], correctIndex: 0 },
  { id: 'qb-57', category: 'Músicas', question: 'Quem canta "Trevo (Tu)" junto com Tiago Iorc?', options: ['Anavitória', 'Sandy', 'Iza', 'Luísa Sonza'], correctIndex: 0 },
  { id: 'qb-58', category: 'Fé & Amor', question: 'Em 1 João 4:18: "No amor não há medo; antes, o perfeito amor..."', options: ['faz esperar anos', 'lança fora o medo', 'esconde a verdade', 'dorme cedo'], correctIndex: 1 },
  { id: 'qb-59', category: 'Nosso Mundo', question: 'Como abrir as Configurações de Criador para editar músicas e fotos?', options: ['Com a senha de criador protegida', 'Não existe senha', 'Apenas no PC', 'Pagando 1000 moedas'], correctIndex: 0 },
  { id: 'qb-60', category: 'Curiosidades', question: 'Qual mês tem o Dia dos Namorados no resto do mundo (Valentine’s Day)?', options: ['Abril', 'Fevereiro (14/02)', 'Agosto', 'Novembro'], correctIndex: 1 },
  { id: 'qb-61', category: 'Romance', question: 'Qual astro do céu noturno inspira incontáveis juras de amor desde a antiguidade?', options: ['A Lua', 'Marte', 'Netuno', 'Plutão'], correctIndex: 0 },
  { id: 'qb-62', category: 'Músicas', question: 'Em "Pela Luz dos Olhos Teus", de Vinicius de Moraes, quando o eu lírico se apaixona?', options: ['Quando a luz dos olhos dele encontra a dos olhos dela', 'Quando chove forte', 'No carnaval de manhã', 'Em um domingo frio'], correctIndex: 0 },
  { id: 'qb-63', category: 'Nós Dois', question: 'Qual é o segredo de um amor duradouro como o de Gabriel e Samella?', options: ['Respeito, diálogo, carinho e Deus no centro', 'Nunca discordar de nada', 'Ficar em silêncio', 'Competir todo dia'], correctIndex: 0 },
  { id: 'qb-64', category: 'Nosso Mundo', question: 'Quantos jogos diferentes existem no Arcade de Nosso Mundo agora?', options: ['4 jogos', '10 jogos', '25 jogos completos', '15 jogos'], correctIndex: 2 },
];

// =========================================================================
// 2. MEMORY DECK THEMES (8 Themes × 12 Vector Art Tokens = 96 Card Variants)
// =========================================================================
export const MEMORY_THEMES: { name: string; icons: string[] }[] = [
  { name: 'Romance Clássico', icons: ['rose', 'heart', 'ring', 'letter', 'candle', 'chalice', 'gift', 'crown', 'star', 'music', 'sparkle', 'diamond'] },
  { name: 'Jardim Encantado', icons: ['blossom', 'tulip', 'rose', 'flower', 'seed', 'sprout', 'sun', 'heart', 'star', 'sparkle', 'gift', 'crown'] },
  { name: 'Docinhos & Café', icons: ['coffee', 'heart', 'star', 'gift', 'candle', 'chalice', 'blossom', 'rose', 'sparkle', 'crown', 'moon', 'diamond'] },
  { name: 'Céu & Galáxia', icons: ['moon', 'star', 'sun', 'sparkle', 'diamond', 'heart', 'crown', 'clock', 'travel', 'rose', 'candle', 'balloon'] },
  { name: 'Mascotes Fofinhos', icons: ['paw', 'cat', 'bear', 'heart', 'star', 'crown', 'gift', 'balloon', 'flower', 'sun', 'moon', 'diamond'] },
  { name: 'Música & Cinema', icons: ['music', 'film', 'camera', 'star', 'heart', 'candle', 'chalice', 'rose', 'sparkle', 'trophy', 'crown', 'diamond'] },
  { name: 'Viagem dos Sonhos', icons: ['travel', 'plane', 'camera', 'sun', 'moon', 'star', 'balloon', 'heart', 'gift', 'coffee', 'flower', 'ring'] },
  { name: 'Tesouros & Joias', icons: ['diamond', 'crown', 'ring', 'trophy', 'gift', 'star', 'sparkle', 'candle', 'heart', 'letter', 'chalice', 'rose'] },
];

// =========================================================================
// 3. HANGMAN WORDS POOL (150+ Romantic Words with Clues)
// =========================================================================
export interface WordClueItem {
  word: string;
  hint: string;
}

export const HANGMAN_POOL: WordClueItem[] = [
  { word: 'SAMELLA', hint: 'A mulher mais linda do Nosso Mundo' },
  { word: 'GABRIEL', hint: 'O autor apaixonado deste universo' },
  { word: 'ETERNIDADE', hint: 'Quanto tempo queremos ficar juntos' },
  { word: 'CARINHO', hint: 'Gesto doce que aquece a alma' },
  { word: 'ABRACO', hint: 'O melhor refúgio contra dias difíceis' },
  { word: 'SORRISO', hint: 'O brilho mais lindo no seu rosto' },
  { word: 'ALIANCA', hint: 'Círculo sem fim no dedo' },
  { word: 'DIAMANTE', hint: 'Joia valiosa e moeda da Loja' },
  { word: 'CAFUNE', hint: 'Carinho nos cabelos até pegar no sono' },
  { word: 'SAUDADE', hint: 'O que aperta quando estamos longe' },
  { word: 'CUMPLICIDADE', hint: 'Entender um ao outro só pelo olhar' },
  { word: 'PROMESSA', hint: 'Juramento guardado nas fitas da árvore' },
  { word: 'NAMORADOS', hint: 'Nosso título especial desde 12 de junho' },
  { word: 'PRINCESA', hint: 'Apelido real da Samella' },
  { word: 'ORACAO', hint: 'Conversa com Deus agradecendo por nós' },
  { word: 'BEIJO', hint: 'Selo doce entre dois lábios' },
  { word: 'CEREJEIRA', hint: 'Árvore cor-de-rosa que floresce na primavera' },
  { word: 'CARTA', hint: 'Papel antigo cheio de sentimentos' },
  { word: 'MELODIA', hint: 'Som que embala nossas lembranças' },
  { word: 'CORACAO', hint: 'Bate mais forte quando você chega' },
  { word: 'PAIXAO', hint: 'Chama intensa que ilumina o olhar' },
  { word: 'TERNURA', hint: 'Delicadeza nos gestos e palavras' },
  { word: 'BENCAO', hint: 'Presente vindo dos céus para nós' },
  { word: 'FUTURO', hint: 'Todos os sonhos que vamos realizar juntos' },
  { word: 'CHOCOLATE', hint: 'Doce que combina com filme e cobertor' },
  { word: 'PIQUENIQUE', hint: 'Passeio no parque com cesta de frutas' },
  { word: 'ESTRELAS', hint: 'Pontinhos brilhantes no céu da noite' },
  { word: 'MARIPOSA', hint: 'Visitante noturna atraída pela luz' },
  { word: 'BORBOLETA', hint: 'Voa em volta da Árvore do Amor' },
  { word: 'MORANGO', hint: 'Fruta vermelha e doce em forma de coração' },
  { word: 'JARDIM', hint: 'Onde floresce nossa planta especial' },
  { word: 'ROMANCE', hint: 'História digna de cinema' },
  { word: 'LEALDADE', hint: 'Fidelidade em todas as estações' },
  { word: 'ALEGRIA', hint: 'Sentimento leve quando estamos rindo' },
  { word: 'CONFIANCA', hint: 'Base inabalável do relacionamento' },
  { word: 'RESPEITO', hint: 'Pilar essencial de todo casal feliz' },
  { word: 'GATINHO', hint: 'Mascote inicial que ronrona feliz' },
  { word: 'COELHINHA', hint: 'Mascote fofa de orelhas compridas' },
  { word: 'PANDA', hint: 'Ursinho branco e preto que ama bambu' },
  { word: 'GOLFINHO', hint: 'Mascote saltador dos mares' },
  { word: 'TUBARAO', hint: 'Mascote lendário do oceano profundo' },
  { word: 'PINGUIM', hint: 'Ave elegante que escolhe um par pra vida' },
  { word: 'RAPOSINHA', hint: 'Mascote esperta de cauda fofa' },
  { word: 'VIAGEM', hint: 'Aventura inesquecível com malas prontas' },
  { word: 'PRAIA', hint: 'Mar, areia e pôr do sol abraçados' },
  { word: 'CINEMA', hint: 'Filme, pipoca doce e mãos dadas no escuro' },
  { word: 'PIZZA', hint: 'Jantar clássico de fim de semana' },
  { word: 'DOMINGO', hint: 'Dia preguiçoso de café e descanso juntos' },
  { word: 'SONHO', hint: 'Meta que planejamos alcançar lado a lado' },
  { word: 'UNIVERSO', hint: 'Tudo que criamos aqui dentro' },
  { word: 'PERGAMINHO', hint: 'Papel envelhecido das cartas da antiguidade' },
  { word: 'ASSINATURA', hint: 'Marca manuscrita no final da carta' },
  { word: 'SELO', hint: 'Lacração vermelha de cera quente' },
  { word: 'CAPSULA', hint: 'Guarda mensagens para o futuro' },
  { word: 'MEMORIA', hint: 'Recordação guardada em fotografia' },
  { word: 'FOTOGRAFIA', hint: 'Instante congelado no tempo' },
  { word: 'GRATIDAO', hint: 'Agradecer por ter você comigo' },
  { word: 'CALMARIA', hint: 'Paz silenciosa dentro do seu abraço' },
  { word: 'ENCANTO', hint: 'Magia natural do seu jeitinho' },
  { word: 'INFINITO', hint: 'Sem fim, como meu amor por você' },
  { word: 'SINTONIA', hint: 'Estar na mesma frequência do coração' },
  { word: 'JUNHO', hint: 'Mês mágico do nosso início' },
  { word: 'NATAL', hint: 'Data da nossa cápsula de 2028' },
  { word: 'SOL', hint: 'Aquece as folhas da nossa árvore' },
  { word: 'LUA', hint: 'Ilumina nossas noites de conversa' },
  { word: 'VELAS', hint: 'Iluminação romântica de jantar especial' },
  { word: 'SERENATA', hint: 'Música cantada de amor à noite' },
  { word: 'POESIA', hint: 'Versos escritos com alma' },
  { word: 'AMOR', hint: 'A palavra mais forte de quatro letras' },
  { word: 'PAZ', hint: 'O que sinto ao ouvir sua voz' },
  { word: 'LAR', hint: 'Não é um endereço, é estar com você' },
  { word: 'DENGO', hint: 'Carinho manhoso e gostoso' },
  { word: 'CHAMEGO', hint: 'Aconchego bem apertadinho' },
  { word: 'MIMO', hint: 'Pequena surpresa carinhosa' },
  { word: 'DESEJO', hint: 'Pedido especial do coração' },
  { word: 'FELICIDADE', hint: 'Estado constante ao seu lado' },
  { word: 'ACOLHIMENTO', hint: 'Sentir-se seguro nos braços de alguém' },
  { word: 'DOÇURA', hint: 'Suavidade em cada frase sua' },
  { word: 'ESPERANCA', hint: 'Certeza luminosa nos dias por vir' },
  { word: 'FIDELIDADE', hint: 'Coração inteiro dedicado a uma pessoa' },
  { word: 'AMIZADE', hint: 'Ser melhor amigo além de namorado' },
  { word: 'RISADA', hint: 'Som que cura qualquer tristeza' },
  { word: 'PASSARO', hint: 'Canta nos galhos altos da nossa árvore' },
  { word: 'ORVALHO', hint: 'Gotinhas da manhã nas pétalas' },
  { word: 'SEMENTE', hint: 'Onde começa toda grande árvore' },
  { word: 'BROTO', hint: 'Primeiro sinal de vida verde' },
  { word: 'FRUTO', hint: 'Recompensa madura da árvore' },
  { word: 'RAIZ', hint: 'Mantém o amor firme na tempestade' },
  { word: 'FLORESCER', hint: 'Abrir pétalas e crescer com beleza' },
  { word: 'COROA', hint: 'Acessório real da loja de pets' },
  { word: 'GRAVATA', hint: 'Elegância charmosa para o mascote' },
  { word: 'OCULOS', hint: 'Deixa o bichinho cheio de estilo' },
  { word: 'CAPUZ', hint: 'Roupinha quentinha de inverno' },
  { word: 'PIJAMA', hint: 'Roupa ideal para o quarto na hora de dormir' },
  { word: 'BANHO', hint: 'Espuma e patinho no banheiro do pet' },
  { word: 'COZINHA', hint: 'Onde servimos deliciosas comidinhas' },
  { word: 'SALA', hint: 'Onde o pet dança e brinca feliz' },
  { word: 'QUARTO', hint: 'Cantinho do descanso com abajur' },
  { word: 'ROLETA', hint: 'Gira uma vez por dia com prêmios' },
  { word: 'CONQUISTA', hint: 'Troféu desbloqueado com carinho' },
  { word: 'TESOURO', hint: 'Algo raro e inestimável como você' },
  { word: 'AURORA', hint: 'Luzes coloridas mágicas no céu' },
  { word: 'METEORO', hint: 'Estrela cadente para fazer pedidos' },
  { word: 'VIOLETA', hint: 'Cor delicada do nosso tema' },
  { word: 'MAGENTA', hint: 'Rosa vibrante cheio de energia' },
  { word: 'CRISTAL', hint: 'Transparência brilhante e pura' },
  { word: 'PERFUME', hint: 'Cheiro que lembra alguém especial' },
  { word: 'COBERTA', hint: 'Companheira dos dias de chuva e filme' },
  { word: 'PIPOCA', hint: 'Estoura na panela antes do cinema' },
  { word: 'SORVETE', hint: 'Sobremesa gelada para dividir' },
  { word: 'PANQUECA', hint: 'Café da manhã especial na cama' },
  { word: 'CAFE', hint: 'Bebida quentinha das manhãs juntos' },
  { word: 'PUDIM', hint: 'Sobremesa irresistível de domingo' },
  { word: 'CUPIDO', hint: 'Arqueiro mítico dos corações' },
  { word: 'FLECHA', hint: 'Atinge quando menos esperamos' },
  { word: 'ANJO', hint: 'Protetor enviado para cuidar de você' },
  { word: 'SEGREDO', hint: 'Algo especial guardado só entre nós' },
  { word: 'SURPRESA', hint: 'Presente inesperado que alegra o dia' },
  { word: 'CONVITE', hint: 'Chamado para um encontro romântico' },
  { word: 'BILHETE', hint: 'Pequena nota deixada com carinho' },
  { word: 'CADERNO', hint: 'Páginas cheias de planos e metas' },
  { word: 'HORIZONTE', hint: 'Onde o céu e o mar se encontram' },
  { word: 'CREPUSCULO', hint: 'O colorido suave do fim da tarde' },
  { word: 'BRISA', hint: 'Vento calmo que balança as folhas' },
  { word: 'ROSA', hint: 'Rainha perfumada do jardim do amor' },
  { word: 'TULIPA', hint: 'Flor elegante símbolo de amor perfeito' },
  { word: 'GIRASSOL', hint: 'Sempre busca a luz mais brilhante' },
  { word: 'ORQUIDEA', hint: 'Flor delicada e rara' },
  { word: 'JASMIN', hint: 'Flor branca de aroma inesquecível' },
  { word: 'MAGIA', hint: 'O brilho invisível entre nós dois' },
  { word: 'DESTINO', hint: 'O fio que cruzou nossas vidas' },
  { word: 'ENCONTRO', hint: 'Momento marcado para matar a saudade' },
  { word: 'PACTO', hint: 'Acordo sagrado de ficar sempre juntos' },
  { word: 'UNIAO', hint: 'Duas metades caminhando como uma' },
  { word: 'HISTORIA', hint: 'Escrevemos um capítulo novo todo dia' },
  { word: 'CAPITULO', hint: 'Cada fase linda do nosso namoro' },
  { word: 'VINIL', hint: 'Disco clássico que gira na vitrola' },
  { word: 'VIOLAO', hint: 'Instrumento de serestas ao pôr do sol' },
  { word: 'PIANO', hint: 'Teclas brancas e pretas de melodia suave' },
  { word: 'REFLEXO', hint: 'Rapidez para capturar momentos' },
  { word: 'VITORIA', hint: 'Conquista celebrada com alegria' },
  { word: 'ESTILO', hint: 'Charme único do casal e dos pets' },
  { word: 'ACESSO', hint: 'Desbloqueado pelo QR Code do amor' },
  { word: 'UNIVERSAL', hint: 'Sem fronteiras nem limites' },
  { word: 'RADIANTE', hint: 'Como seus olhos quando está feliz' },
  { word: 'GENTILEZA', hint: 'Cuidado nos mínimos gestos' },
  { word: 'CARISMA', hint: 'Brilho natural que encanta a todos' },
  { word: 'PRECIOSA', hint: 'Como você é todos os dias' },
  { word: 'PARCERIA', hint: 'Time imbatível na vida a dois' },
];

// =========================================================================
// 4. TRUE OR FALSE POOL (95+ Items)
// =========================================================================
export interface TrueFalseItem {
  statement: string;
  isTrue: boolean;
  explanation: string;
}

export const TRUE_FALSE_POOL: TrueFalseItem[] = [
  { statement: 'O namoro oficial de Gabriel e Samella começou em 12 de Junho de 2023.', isTrue: true, explanation: 'Dia dos Namorados mais inesquecível de todos!' },
  { statement: 'Dar um abraço de 20 segundos libera ocitocina, o hormônio do bem-estar e amor.', isTrue: true, explanation: 'Abraços longos reduzem o estresse de verdade!' },
  { statement: 'Pinguins nunca permanecem com o mesmo parceiro por mais de um dia.', isTrue: false, explanation: 'Muitas espécies de pinguins formam casais fiéis por anos!' },
  { statement: 'Lontras marinhas costumam dormir de mãos dadas para não se separarem na água.', isTrue: true, explanation: 'Uma das cenas mais fofas da natureza!' },
  { statement: 'A letra de "Te Vivo" é cantada pelo artista Djonga.', isTrue: false, explanation: '"Te Vivo" é de Luan Santana! Djonga canta "Leal".' },
  { statement: 'Em Mateus 19:6 está escrito: "O que Deus uniu, o homem não separe".', isTrue: true, explanation: 'Um dos versículos favoritos de bênção conjugal!' },
  { statement: 'A Árvore do Amor cresce apenas se comprarmos diamantes com dinheiro real.', isTrue: false, explanation: 'Ela cresce com carinho gratuito: água, sol, poda e fitas de promessa!' },
  { statement: 'Cavalos-marinhos também costumam segurar a cauda um do outro enquanto nadam juntos.', isTrue: true, explanation: 'Um gesto natural para não se perderem na correnteza!' },
  { statement: 'A lua é maior do que o planeta Terra.', isTrue: false, explanation: 'A Lua tem cerca de 1/4 do diâmetro da Terra.' },
  { statement: 'A palavra "cafuné" tem origem africana e existe exclusivamente na língua portuguesa.', isTrue: true, explanation: 'Uma das palavras mais carinhosas e intraduzíveis do português!' },
  { statement: 'Cisnes quando formam casais costumam permanecer juntos por toda a vida.', isTrue: true, explanation: 'Por isso formam corações com os pescoços!' },
  { statement: 'O coração humano bate cerca de 100 mil vezes em um único dia pensando em quem amamos.', isTrue: true, explanation: 'E acelera ainda mais quando vemos o amor da nossa vida!' },
  { statement: 'Rosas amarelas sempre significam tristeza e despedida.', isTrue: false, explanation: 'Rosas amarelas representam alegria, amizade e luz!' },
  { statement: 'O chocolate amargo ajuda a liberar serotonina e melhora o humor.', isTrue: true, explanation: 'Por isso faz tanto sucesso em noites de filme!' },
  { statement: 'Na linguagem das flores, a tulipa vermelha simboliza declaração de amor perfeito.', isTrue: true, explanation: 'Clássica e cheia de elegância!' },
  { statement: 'O Dia dos Namorados nos EUA e Europa é comemorado em 12 de Junho.', isTrue: false, explanation: 'Lá fora é 14 de Fevereiro (Valentine’s Day).' },
  { statement: 'Rir juntos aumenta a conexão emocional e reduz a ansiedade do casal.', isTrue: true, explanation: 'O bom humor é um superpoder dos relacionamentos felizes!' },
  { statement: 'Os cães conseguem reconhecer emoções humanas pelas expressões faciais e voz.', isTrue: true, explanation: 'Nosso Cachorrinho virtual também sente seu carinho!' },
  { statement: 'Gatos ronronam apenas quando estão com dor, nunca quando estão felizes.', isTrue: false, explanation: 'Eles ronronam principalmente por conforto, carinho e alegria!' },
  { statement: 'O cheiro é o sentido mais ligado diretamente à memória afetiva do cérebro.', isTrue: true, explanation: 'Por isso o perfume de quem amamos fica guardado para sempre!' },
  { statement: 'Paris recebeu o apelido de Cidade Luz por causa da iluminação pública histórica.', isTrue: true, explanation: 'E hoje também é conhecida como capital do romance!' },
  { statement: 'Vinicius de Moraes foi o autor do famoso "Soneto de Fidelidade".', isTrue: true, explanation: '"Que não seja imortal, posto que é chama..."' },
  { statement: '1 Coríntios 13 afirma que o amor se alegra com a injustiça.', isTrue: false, explanation: 'Diz exatamente o oposto: o amor se alegra com a verdade!' },
  { statement: 'Araras-azuis formam pares fiéis e voam lado a lado por décadas.', isTrue: true, explanation: 'Beleza pura da fauna brasileira!' },
  { statement: 'O som da voz da pessoa amada ajuda a acalmar o ritmo cardíaco.', isTrue: true, explanation: 'Funciona como um abraço em forma de áudio!' },
  { statement: 'Selo de cera quente era usado na antiguidade para garantir que só o destinatário abrisse a carta.', isTrue: true, explanation: 'Igual às cartas antigas desta galeria!' },
  { statement: 'Abelhas nunca reconhecem flores coloridas, só voam no escuro.', isTrue: false, explanation: 'Elas enxergam ultravioleta e adoram jardins floridos!' },
  { statement: 'Escrever bilhetes à mão ou cartas longas fortalece memórias duradouras no casal.', isTrue: true, explanation: 'Palavras guardadas são tesouros para reler sempre!' },
  { statement: 'A constelação do Cruzeiro do Sul só pode ser vista no Hemisfério Norte.', isTrue: false, explanation: 'Ela é o símbolo brilhante do céu do Hemisfério Sul!' },
  { statement: 'A borboleta-monarca pode viajar milhares de quilômetros guiada pelo sol.', isTrue: true, explanation: 'Pequena, mas cheia de força e beleza!' },
  { statement: 'Ouvir música juntos sincroniza batimentos e gera memórias emocionais compartilhadas.', isTrue: true, explanation: 'Nossa playlist é trilha sonora viva de momentos!' },
  { statement: 'Polvos possuem apenas 1 coração pequeno.', isTrue: false, explanation: 'Polvos têm incríveis 3 corações!' },
  { statement: 'Diamantes naturais são formados sob altíssima pressão e temperatura ao longo de milhões de anos.', isTrue: true, explanation: 'Raros e fortes, como promessas verdadeiras!' },
  { statement: 'Os gatos comunicam confiança e "eu te amo" com piscadelas lentas nos olhos.', isTrue: true, explanation: 'O famoso "beijo felino" com os olhos!' },
  { statement: 'Baleias-jubarte criam canções complexas no fundo do oceano.', isTrue: true, explanation: 'Verdadeiras cantoras dos mares!' },
  { statement: 'O Sol é um planeta feito de gelo sólido.', isTrue: false, explanation: 'O Sol é uma estrela incandescente cheia de energia!' },
  { statement: 'Cuidar de uma planta juntos traz sensação de calma e propósito compartilhado.', isTrue: true, explanation: 'A Árvore do Amor simboliza exatamente esse cuidado mútuo!' },
  { statement: 'No xadrez, a Rainha pode se mover apenas uma casa para frente.', isTrue: false, explanation: 'A Rainha é a peça mais livre e poderosa do tabuleiro!' },
  { statement: 'Segurar a mão de quem você ama diminui fisicamente a percepção de estresse.', isTrue: true, explanation: 'Estudos neurocientíficos comprovam esse efeito lindo!' },
  { statement: 'Morangos pertencem à mesma família botânica das rosas.', isTrue: true, explanation: 'Rosaceae — doce por fora e romântico na raiz!' },
  { statement: 'Lobos uivam para reunir sua família e proteger a matilha.', isTrue: true, explanation: 'Símbolo forte de união e proteção!' },
  { statement: 'A letra de "Cuida Bem Dela" pede para cuidar bem do carro novo.', isTrue: false, explanation: 'Pede para cuidar da mulher mais especial do mundo!' },
  { statement: 'Sonhar juntos com viagens e metas fortalece o futuro do relacionamento.', isTrue: true, explanation: 'Nossa lista de Metas & Sonhos existe pra isso!' },
  { statement: 'Árvores cerejeiras no Japão têm flores que duram o ano inteiro sem cair.', isTrue: false, explanation: 'As sakuras duram poucas semanas, tornando cada momento precioso!' },
  { statement: 'Um sorriso genuíno ativa músculos ao redor dos olhos chamados de sorriso de Duchenne.', isTrue: true, explanation: 'É impossível fingir um sorriso apaixonado!' },
  { statement: 'Em Provérbios, quem encontra um grande amor encontra algo precioso e abençoado.', isTrue: true, explanation: 'Uma verdadeira bênção de Deus!' },
  { statement: 'Na Roleta Diária, você pode girar a cada 24 horas para ganhar prêmios.', isTrue: true, explanation: 'Sempre tem surpresa esperando na tela inicial!' },
  { statement: 'O beijo faz o cérebro liberar dopamina e reduz a tensão arterial.', isTrue: true, explanation: 'Saúde e romance andando de mãos dadas!' },
  { statement: 'Golfinhos dão nomes únicos uns aos outros através de assobios exclusivos.', isTrue: true, explanation: 'Cada golfinho tem sua assinatura sonora!' },
  { statement: 'O arco-íris aparece somente à meia-noite sem nuvens.', isTrue: false, explanation: 'Precisa de luz atravessando gotículas de água!' },
  { statement: 'A data 12/06 guarda o aniversário de namoro de Gabriel e Samella.', isTrue: true, explanation: 'Marcado em ouro no nosso calendário!' },
  { statement: 'Compartilhar pequenos elogios diários melhora a autoestima do casal.', isTrue: true, explanation: 'Uma frase doce pode iluminar a semana inteira!' },
  { statement: 'Pássaros papagaios não conseguem aprender palavras humanas.', isTrue: false, explanation: 'Papagaios imitam palavras com entusiasmo!' },
  { statement: 'A amizade dentro do namoro é um dos maiores segredos para durar para sempre.', isTrue: true, explanation: 'Rir como melhores amigos e amar como namorados!' },
  { statement: 'O pergaminho foi muito usado antes da invenção do papel moderno.', isTrue: true, explanation: 'Dá aquele ar histórico inesquecível às cartas!' },
  { statement: 'Tartarugas marinhas podem viajar milhares de quilômetros e sempre voltam para o mesmo lar.', isTrue: true, explanation: 'Assim como meu coração sempre volta para você!' },
  { statement: 'As auroras boreais são luzes artificiais criadas por drones.', isTrue: false, explanation: 'São fenômenos naturais magníficos no céu polar!' },
  { statement: 'Uma cápsula do tempo só funciona se for enterrada em cimento.', isTrue: false, explanation: 'Aqui no Nosso Mundo ela fica guardada com segurança até a data marcada!' },
  { statement: 'Cantar no carro com a playlist do casal transforma qualquer trânsito em show.', isTrue: true, explanation: 'Momentos simples que viram memórias gigantes!' },
  { statement: 'A gentileza diária vale mais do que grandes gestos raros uma vez por ano.', isTrue: true, explanation: 'Cuidado constante é a essência do amor!' },
];

// =========================================================================
// 5. COMPLETE THE LYRIC / POEM POOL (65+ Items)
// =========================================================================
export interface LyricItem {
  prompt: string;
  options: string[];
  correctIndex: number;
  artist: string;
}

export const LYRIC_POOL: LyricItem[] = [
  { prompt: '“Tudo o que você quiser eu dou / Te dou o sol, te dou o mar, te dou meu...”', options: ['coração', 'relógio', 'sorriso', 'violão'], correctIndex: 0, artist: 'Luan Santana' },
  { prompt: '“Quando a luz dos olhos meus e a luz dos olhos teus / Resolvem se...”', options: ['esconder', 'encontrar', 'despedir', 'apagar'], correctIndex: 1, artist: 'Luan Santana (Te Vivo)' },
  { prompt: '“Amar não é pecado e se eu errar, que seja nos seus...”', options: ['planos', 'braços', 'passos', 'sonhos'], correctIndex: 1, artist: 'Luan Santana' },
  { prompt: '“Cuida bem dela / Você não vai conhecer alguém...”', options: ['igual no mundo', 'melhor que ela!', 'tão distante assim', 'que dance igual'], correctIndex: 1, artist: 'Henrique & Juliano' },
  { prompt: '“Não é só sobre paixão passageira / É sobre lealdade pra...”', options: ['esta semana', 'vida inteira', 'o fim do mês', 'a madrugada'], correctIndex: 1, artist: 'Leal' },
  { prompt: '“Que não seja imortal, posto que é chama / Mas que seja infinito enquanto...”', options: ['brilhe', 'dure', 'queira', 'cante'], correctIndex: 1, artist: 'Vinicius de Moraes' },
  { prompt: '“Eu sei que vou te amar / Por toda a minha...”', options: ['casa', 'vida', 'viagem', 'tarde'], correctIndex: 1, artist: 'Tom Jobim & Vinicius' },
  { prompt: '“Não sei se o mundo é bom, mas ele está bem melhor desde que você...”', options: ['partiu', 'chegou', 'cantou', 'dormiu'], correctIndex: 1, artist: 'Nando Reis' },
  { prompt: '“Se você me pedir pra ficar, eu fico / Se me pedir pra voltar, eu...”', options: ['corro', 'volto', 'fico quieto', 'penso'], correctIndex: 1, artist: 'Luan Santana' },
  { prompt: '“A gente não precisa tá colado pra tá juntos / Nossos corpos se conversam por horas e...”', options: ['dias', 'horas', 'meses', 'noites'], correctIndex: 1, artist: 'Te Vivo' },
  { prompt: '“O meu amado é meu, e eu sou...”', options: ['feliz', 'dele', 'do céu', 'eterna'], correctIndex: 1, artist: 'Cânticos 2:16' },
  { prompt: '“As muitas águas não podem apagar este...”', options: ['sonho', 'amor', 'fogo', 'verão'], correctIndex: 1, artist: 'Cânticos 8:7' },
  { prompt: '“O amor é paciente, o amor é...”', options: ['bondoso', 'apressado', 'distante', 'tímido'], correctIndex: 0, artist: '1 Coríntios 13:4' },
  { prompt: '“Para o mundo você pode ser uma pessoa, mas para mim você é o...”', options: ['sol da manhã', 'mundo inteiro', 'meu segredo', 'último trem'], correctIndex: 1, artist: 'Frase Clássica' },
  { prompt: '“Eu não preciso te olhar pra te ter em meu mundo / Porque aonde quer que eu vá, você está em...”', options: ['casa', 'tudo', 'mim', 'paz'], correctIndex: 1, artist: 'Te Vivo' },
  { prompt: '“E no meio de tanta gente, foi no seu abraço que encontrei a...”', options: ['saída', 'paz que o mundo não me deu', 'música alta', 'chave de casa'], correctIndex: 1, artist: 'Nosso Mundo' },
  { prompt: '“Se eu pudesse escolher de novo, escolheria você em todas as...”', options: ['cidades', 'vidas possíveis', 'lojas', 'manhãs frias'], correctIndex: 1, artist: 'Gabriel para Samella' },
  { prompt: '“Ela gosta que repare no cabelo dela / Foi por um triz, mas você vai ser o que ela sempre...”', options: ['quis', 'viu', 'pediu', 'fez'], correctIndex: 0, artist: 'Henrique & Juliano' },
  { prompt: '“Darling, just hold my hand / Be my girl, I’ll be your...”', options: ['friend', 'man', 'star', 'king'], correctIndex: 1, artist: 'Ed Sheeran (Perfect)' },
  { prompt: '“Lovin’ can hurt sometimes / But it’s the only thing that I know...”', options: ['how to hide', 'makes us feel alive', 'makes me cry', 'goes away'], correctIndex: 1, artist: 'Ed Sheeran (Photograph)' },
  { prompt: '“Eu não sei de onde vem essa força que me leva pra você / Eu só sei que faz bem, me dá asas e me faz...”', options: ['correr', 'voar', 'sonhar', 'cantar'], correctIndex: 1, artist: 'Amar Não É Pecado' },
  { prompt: '“Onde quer que fores, irei eu; e onde quer que pousares à noite, ali...”', options: ['olharei eu', 'pousarei eu', 'cantarei eu', 'ficarei só'], correctIndex: 1, artist: 'Rute 1:16' },
  { prompt: '“Tu, que tem esse abraço casa / Se decidir bater asa, me leva...”', options: ['pra passear', 'contigo pra passear', 'lá no cinema', 'junto também'], correctIndex: 1, artist: 'Anavitória & Tiago Iorc' },
  { prompt: '“Amei te ver, amei te ver / Amei te...”', options: ['sentir', 'ver', 'esperar', 'ouvir'], correctIndex: 1, artist: 'Tiago Iorc' },
  { prompt: '“Fica, me queira e queiras ficar...”', options: ['comigo assim', 'sem ir embora', 'aqui do lado', 'para sempre'], correctIndex: 0, artist: 'Anavitória & Matheus e Kauan' },
  { prompt: '“Acima de tudo, porém, revistam-se do amor, que é o elo...”', options: ['bonito', 'perfeito', 'dourado', 'infinito'], correctIndex: 1, artist: 'Colossenses 3:14' },
  { prompt: '“Te amo ontem, te amo hoje e te amarei por todos os...”', options: ['meses', 'amanhãs que virão', 'sábados', 'dias úteis'], correctIndex: 1, artist: 'Nosso Mundo' },
  { prompt: '“Seja no caos ou na calmaria / Minha certeza é você todo...”', options: ['mês', 'dia', 'ano', 'domingo'], correctIndex: 1, artist: 'Leal' },
  { prompt: '“Em questão de segundos vou pra outro mundo / Outra...”', options: ['estrada', 'constelação', 'cidade', 'estação'], correctIndex: 1, artist: 'Te Vivo' },
  { prompt: '“Você é a resposta mais bonita das minhas...”', options: ['perguntas', 'orações', 'músicas', 'cartas'], correctIndex: 1, artist: 'Gabriel ♡ Samella' },
];

// =========================================================================
// 6. SYMBOL CHARADES POOL (Enigma dos Símbolos — Vector Art Combos)
// =========================================================================
export interface EmojiPuzzle {
  symbols: string[];
  clueText: string;
  answer: string;
  options: string[];
  category: string;
}

export const EMOJI_CHARADES_POOL: EmojiPuzzle[] = [
  { symbols: ['film', 'star', 'heart'], clueText: 'Tela + Estrelas + Coração', answer: 'Noite de Cinema do Casal', options: ['Noite de Cinema do Casal', 'Corrida de Carros', 'Acampamento na Floresta', 'Dia de Limpeza'], category: 'Encontro' },
  { symbols: ['coffee', 'letter', 'heart'], clueText: 'Café Quente + Carta + Carinho', answer: 'Café da Manhã na Cama', options: ['Almoço no Shopping', 'Café da Manhã na Cama', 'Piquenique no Mar', 'Churrasco na Laje'], category: 'Vale' },
  { symbols: ['candle', 'chalice', 'rose'], clueText: 'Vela Acesa + Taça + Rosa', answer: 'Jantar à Luz de Velas', options: ['Jantar à Luz de Velas', 'Café Rápido', 'Lanche da Tarde', 'Festa Junina'], category: 'Romance' },
  { symbols: ['plane', 'camera', 'heart'], clueText: 'Avião + Câmera + Coração', answer: 'Viagem Romântica a Paris', options: ['Viagem Romântica a Paris', 'Passeio no Zoológico', 'Subida na Montanha', 'Ida ao Mercado'], category: 'Sonho' },
  { symbols: ['paw', 'crown', 'sun'], clueText: 'Reino + Coroa + Nascer do Sol', answer: 'O Rei Leão', options: ['Madagascar', 'O Rei Leão', 'A Bela e a Fera', 'Procurando Nemo'], category: 'Filme' },
  { symbols: ['rose', 'candle', 'clock', 'crown'], clueText: 'Rosa + Vela + Relógio + Princesa', answer: 'A Bela e a Fera', options: ['A Bela e a Fera', 'Branca de Neve', 'Shrek', 'Enrolados'], category: 'Filme' },
  { symbols: ['balloon', 'gift', 'travel'], clueText: 'Balões Flutuantes + Casa + Aventura', answer: 'Up: Altas Aventuras', options: ['Up: Altas Aventuras', 'Divertida Mente', 'Toy Story', 'Wall-E'], category: 'Filme' },
  { symbols: ['diamond', 'moon', 'heart'], clueText: 'Joia no Oceano + Noite Fria', answer: 'Titanic', options: ['Piratas do Caribe', 'Titanic', 'Moana', 'Aquaman'], category: 'Filme' },
  { symbols: ['star', 'crown', 'music'], clueText: 'Gelo Brilhante + Rainha + Canção', answer: 'Frozen', options: ['Valente', 'Frozen', 'Cinderela', 'Mulan'], category: 'Filme' },
  { symbols: ['paw', 'candle', 'moon'], clueText: 'Dois Cachorrinhos + Vela + Lua', answer: 'A Dama e o Vagabundo', options: ['101 Dálmatas', 'A Dama e o Vagabundo', 'Bolt', 'Marley & Eu'], category: 'Filme' },
  { symbols: ['candle', 'blossom', 'star'], clueText: 'Luzes Flutuantes + Flor Mágica + Brilho', answer: 'Enrolados (Luzes Flutuantes)', options: ['Enrolados (Luzes Flutuantes)', 'Moana', 'Aladdin', 'Pocahontas'], category: 'Filme' },
  { symbols: ['sparkle', 'diamond', 'ring'], clueText: 'Magia + Tesouro + Aliança', answer: 'Aladdin', options: ['Aladdin', 'Hércules', 'Pinóquio', 'Tarzan'], category: 'Filme' },
  { symbols: ['sun', 'travel', 'heart'], clueText: 'Sol Dourado + Horizonte + Juntos', answer: 'Pôr do Sol na Praia', options: ['Pôr do Sol na Praia', 'Dia de Neve', 'Corrida na Pista', 'Aventura no Deserto'], category: 'Momento' },
  { symbols: ['film', 'coffee', 'moon'], clueText: 'Filme + Bebida Quente + Noite de Chuva', answer: 'Chuva, Série e Chocolate', options: ['Chuva, Série e Chocolate', 'Sol na Piscina', 'Escalada', 'Pescaria'], category: 'Domingo' },
  { symbols: ['tree', 'flower', 'sparkle'], clueText: 'Árvore Viva + Flores + Magia', answer: 'Árvore do Amor Florida', options: ['Árvore do Amor Florida', 'Deserto Seco', 'Cidade Grande', 'Fundo do Mar'], category: 'Nosso Mundo' },
  { symbols: ['paw', 'diamond', 'heart'], clueText: 'Gatinho + Espuma Limpa + Carinho', answer: 'Hora do Banho do Pet', options: ['Hora do Banho do Pet', 'Hora de Dormir', 'Passeio no Parque', 'Show de Rock'], category: 'Nosso Mundo' },
  { symbols: ['clock', 'letter', 'gift'], clueText: 'Tempo + Carta Selada + Futuro', answer: 'Cápsula do Tempo Selada', options: ['Cápsula do Tempo Selada', 'Lista de Compras', 'Conta de Luz', 'Manual de Carro'], category: 'Nosso Mundo' },
  { symbols: ['ring', 'bouquet', 'crown'], clueText: 'Aliança + Buquê + Promessa Real', answer: 'Nosso Casamento dos Sonhos', options: ['Nosso Casamento dos Sonhos', 'Dia de Mudança', 'Formatura', 'Festa à Fantasia'], category: 'Futuro' },
  { symbols: ['chalice', 'candle', 'heart'], clueText: 'Brinde + Jantar + Dois Corações', answer: 'Noite de Pizza e Sobremesa', options: ['Dieta Restrita', 'Noite de Pizza e Sobremesa', 'Café Amargo', 'Almoço Executivo'], category: 'Vale' },
  { symbols: ['music', 'moon', 'heart'], clueText: 'Melodia + Noite Estrelada + Sintonia', answer: 'Ouvindo Nossa Playlist à Noite', options: ['Ouvindo Nossa Playlist à Noite', 'Jogando Futebol', 'Arrumando o Armário', 'Estudando Física'], category: 'Música' },
  { symbols: ['flower', 'sun', 'coffee'], clueText: 'Jardim + Sol da Manhã + Cesta', answer: 'Piquenique no Parque', options: ['Piquenique no Parque', 'Viagem de Navio', 'Cinema 3D', 'Visita ao Dentista'], category: 'Encontro' },
  { symbols: ['camera', 'film', 'heart'], clueText: 'Câmera + Lembranças + Amor', answer: 'Álbum de Memórias do Casal', options: ['Álbum de Memórias do Casal', 'Jornal de Esportes', 'Mapa Rodoviário', 'Lista Telefônica'], category: 'Nosso Mundo' },
  { symbols: ['paw', 'moon', 'heart'], clueText: 'Aconchego + Descanso + Cafuné', answer: 'Cafuné e Abraço de 5 Minutos', options: ['Cafuné e Abraço de 5 Minutos', 'Maratona de Corrida', 'Mudança de Casa', 'Reunião Séria'], category: 'Vale' },
  { symbols: ['gift', 'diamond', 'star'], clueText: 'Prêmio Surpresa + Diamante + Estrela', answer: 'Roleta Diária de Prêmios', options: ['Roleta Diária de Prêmios', 'Caixa Eletrônico', 'Farol de Trânsito', 'Bússola Quebrada'], category: 'Nosso Mundo' },
  { symbols: ['letter', 'candle', 'rose'], clueText: 'Pergaminho + Vela + Selo de Rosa', answer: 'Carta Antiga em Pergaminho', options: ['Carta Antiga em Pergaminho', 'E-mail de Trabalho', 'Mensagem de SMS', 'Fatura Mensal'], category: 'Cartas' },
  { symbols: ['ring', 'heart', 'calendar'], clueText: 'Aliança + 12 de Junho + Amor', answer: 'Nosso Dia 12 de Junho', options: ['Nosso Dia 12 de Junho', 'Dia das Bruxas', 'Ano Novo', 'Carnaval'], category: 'Nós Dois' },
  { symbols: ['star', 'moon', 'ring'], clueText: 'Estrela Cadente + Lua + Desejo', answer: 'Pedido na Estrela Cadente', options: ['Pedido na Estrela Cadente', 'Dia Nublado', 'Corrida de Moto', 'Almoço Rápido'], category: 'Romance' },
];

// =========================================================================
// 7. WHO IS MOST LIKELY POOL (80+ Couple Cards)
// =========================================================================
export const WHO_MOST_LIKELY_POOL: string[] = [
  'Quem demora mais para escolher o filme na sexta-feira?',
  'Quem manda mensagens de carinho primeiro ao acordar?',
  'Quem chora mais fácil em filmes românticos?',
  'Quem pede "só mais 5 minutinhos" na cama de manhã?',
  'Quem tira mais fotos escondidas do outro?',
  'Quem tem mais ciúme fofo quando o outro demora pra responder?',
  'Quem começa a rir primeiro em momentos sérios?',
  'Quem rouba a coberta inteira durante a noite?',
  'Quem inventa apelidos carinhosos mais engraçados?',
  'Quem fica com mais saudade depois de apenas 1 hora longe?',
  'Quem planeja as melhores surpresas de datas especiais?',
  'Quem canta mais alto quando toca nossa música favorita?',
  'Quem dá o abraço mais apertado quando o outro está cansado?',
  'Quem escolhe sempre a sobremesa antes mesmo do prato principal?',
  'Quem conversa mais animadamente contando cada detalhe do dia?',
  'Quem cai no sono primeiro durante uma maratona de série?',
  'Quem lembra de datas e pequenos detalhes com mais facilidade?',
  'Quem faz mais cafuné sem precisar pedir?',
  'Quem se arruma mais rápido para sair num encontro?',
  'Quem fica mais empolgado planejando a próxima viagem juntos?',
  'Quem diz "Eu te amo" mais vezes ao longo do dia?',
  'Quem tem mais ideias criativas para presentes feitos à mão?',
  'Quem fica mais bravo se estiver com fome?',
  'Quem mima mais o nosso pet virtual aqui no site?',
  'Quem gasta mais diamantes na Loja de roupas e vales?',
  'Quem manda mais figurinhas fofas no meio da conversa?',
  'Quem olha nos olhos do outro e já sabe que algo aconteceu?',
  'Quem faz piada boba só para arrancar um sorriso em dias difíceis?',
  'Quem guarda cartinhas, ingressos e lembranças físicas?',
  'Quem vai ficar acordado até tarde escolhendo móveis para nossa casa?',
  'Quem quer adotar metade dos bichinhos do mundo?',
  'Quem lembra dos versículos de amor na hora da oração?',
  'Quem pede "dá uma mordidinha no meu lanche" depois de dizer que não queria?',
  'Quem se emociona primeiro ao ler as cartas antigas?',
  'Quem topa qualquer rolê só pela companhia do outro?',
  'Quem acorda mais animado num domingo de manhã?',
  'Quem passa mais tempo olhando as fotos antigas na galeria?',
  'Quem ganha mais vezes nos mini-jogos de competição?',
  'Quem escreve as declarações mais poéticas e profundas?',
  'Quem faz o outro se sentir a pessoa mais amada do planeta inteiro?',
  'Quem fica mais ansioso para o Natal de 2028 para abrir a cápsula?',
  'Quem ama mais beijinhos na testa de surpresa?',
  'Quem sempre segura a mão do outro automaticamente ao caminhar?',
  'Quem se derrete todo por um elogio inesperado?',
  'Quem promete "só mais um episódio" e assiste mais cinco?',
  'Quem faz mais carinho no cabelo no sofá?',
  'Quem sonha mais alto com o futuro dos dois?',
  'Quem agradece a Deus todos os dias por ter encontrado o amor da sua vida?',
];

// =========================================================================
// 8. RIDDLES POOL (60+ Charadas Românticas)
// =========================================================================
export interface RiddleItem {
  question: string;
  options: string[];
  correctIndex: number;
  hint: string;
}

export const RIDDLES_POOL: RiddleItem[] = [
  { question: 'Quanto mais eu divido com você, maior ele fica. O que é?', options: ['O amor', 'Um bolo', 'Um relógio', 'Um segredo'], correctIndex: 0, hint: 'Não diminui ao ser compartilhado!' },
  { question: 'Não tem voz, mas guarda declarações eternas assinadas à mão. O que é?', options: ['Uma carta', 'Uma nuvem', 'Um sino', 'Um espelho'], correctIndex: 0, hint: 'Vem lacrada com selo vermelho!' },
  { question: 'Tem duas pontas, nasce pequenina e precisa de água e sol para florescer. O que é?', options: ['Uma árvore', 'Uma chave', 'Uma moeda', 'Uma vela'], correctIndex: 0, hint: 'Cresce até o Nível 10 no Nosso Mundo.' },
  { question: 'Fica no dedo anelar, não tem começo nem fim, e representa aliança eterna. O que é?', options: ['Um anel', 'Um lápis', 'Um chapéu', 'Uma estrela'], correctIndex: 0, hint: 'Símbolo de compromisso!' },
  { question: 'Aparece mesmo com os olhos fechados quando você está longe e meu peito aperta. O que é?', options: ['A saudade', 'A chuva', 'O vento', 'A lua cheia'], correctIndex: 0, hint: 'Só passa com seu abraço.' },
  { question: 'Você pode me dar sem perder nada, e quando devolve faz o outro brilhar. O que sou?', options: ['Um sorriso', 'Um ingresso', 'Um sapato', 'Um telefone'], correctIndex: 0, hint: 'Ilumina o rosto imediatamente!' },
  { question: 'Aquece mais que cobertor no inverno e não precisa de tomada. O que é?', options: ['Um abraço apertado', 'Uma geladeira', 'Um vento frio', 'Um mapa'], correctIndex: 0, hint: 'Seus braços envolvem quem você ama.' },
  { question: 'Congela o segundo perfeito sem parar o relógio do mundo. O que é?', options: ['Uma fotografia', 'Uma caneca', 'Um cadeado', 'Um livro'], correctIndex: 0, hint: 'Temos dezenas delas na galeria!' },
  { question: 'Tem notas sem ser dinheiro e toca o coração sem precisar tocar a pele. O que é?', options: ['Uma música', 'Uma pedra', 'Uma receita', 'Uma folha'], correctIndex: 0, hint: 'Está no nosso player de MP3.' },
  { question: 'Só se abre no dia marcado no calendário, guardando recados para o futuro. O que é?', options: ['Cápsula do Tempo', 'Janela de Vidro', 'Caixa de Leite', 'Escada'], correctIndex: 0, hint: 'Fica bloqueada por data na tela inicial.' },
  { question: 'Ronrona feliz quando recebe carinho e adora dormir no quarto aconchegante. Quem é?', options: ['O Gatinho virtual', 'Um relógio', 'Um violão', 'Um guarda-chuva'], correctIndex: 0, hint: 'Mora nos 4 cenários de pets!' },
  { question: 'Nasce na terra, sobe rumo ao céu e guarda nossas fitas vermelhas de promessa. O que é?', options: ['A Árvore do Amor', 'Uma ponte', 'Um carro', 'Uma montanha'], correctIndex: 0, hint: 'Você pode colher frutos nela.' },
  { question: 'Não tem endereço físico, mas é o lugar mais seguro onde descanso. O que é?', options: ['Seu colo / seu abraço', 'Uma estação', 'Um mercado', 'Uma estrada'], correctIndex: 0, hint: 'Meu refúgio favorito.' },
  { question: 'Atravessa qualquer distância sem avião quando fecho os olhos para Deus. O que é?', options: ['Uma oração por nós', 'Um ônibus', 'Uma carta postal', 'Um trem'], correctIndex: 0, hint: 'Conversa espiritual de gratidão.' },
  { question: 'Qual número de 4 dígitos guarda o dia e o mês em que tudo começou?', options: ['1206', '0101', '2512', '3110'], correctIndex: 0, hint: '12 de Junho!' },
  { question: 'Sou vermelha ou rosa, tenho perfume doce e pétalas macias. Quem sou?', options: ['A rosa', 'A pedra', 'O relógio', 'O copo'], correctIndex: 0, hint: 'Rainha do jardim romântico.' },
  { question: 'Dura menos que um segundo para acontecer, mas marca a vida inteira no olhar. O que é?', options: ['Amor à primeira vista', 'Um cochilo longo', 'Um inverno', 'Um século'], correctIndex: 0, hint: 'Encontro mágico de dois olhares.' },
  { question: 'Quanto mais tempo ficamos juntos, mais brilhante e valioso fica, assim como o ouro. O que é?', options: ['Nosso vínculo', 'Um sorvete no sol', 'Uma vela acesa', 'Um giz'], correctIndex: 0, hint: 'Cresce em dias, meses e anos.' },
  { question: 'Vira todas as noites o ponto brilhante para quem olha para o alto pensando no amor. O que é?', options: ['Uma estrela', 'Uma moeda', 'Uma porta', 'Uma bota'], correctIndex: 0, hint: 'Brilha no céu escuro.' },
  { question: 'Gira em círculos e entrega diamantes surpresa a cada 24 horas. O que é?', options: ['A Roleta Diária', 'O ventilador', 'A bicicleta', 'O relógio de parede'], correctIndex: 0, hint: 'Fica na tela inicial esperando seu giro!' },
];

// =========================================================================
// 9. WORD SEARCH POOL (70+ Clean 5–7 Letter Words for Procedural Grid)
// =========================================================================
export const WORDSEARCH_WORDS: string[] = [
  'AMOR', 'VIDA', 'BEIJO', 'ABRACO', 'PAZ', 'SOL', 'LUA', 'FLOR', 'ROSA', 'MEL',
  'GATO', 'PANDA', 'SONHO', 'FELIZ', 'LAR', 'DENGO', 'CARTA', 'SELO', 'ANEL', 'OURO',
  'PRATA', 'LUZ', 'CEU', 'MAR', 'PRAIA', 'BRISA', 'NOITE', 'TARDE', 'MANHA', 'RISOS',
  'CHUVA', 'DOCE', 'FESTA', 'MIMO', 'CHAVE', 'PONTE', 'FOGO', 'CHAMA', 'SORTE', 'DONO',
  'LINDA', 'DOCURA', 'COROA', 'PEIXE', 'URSO', 'LOBO', 'LEAO', 'SAPO', 'ABELHA', 'TREVO',
  'JUNHO', 'NATAL', 'JARDIM', 'FRUTO', 'RAMO', 'FOLHA', 'BROTO', 'RAIZ', 'SEIVA', 'VENTO',
  'VERSO', 'POEMA', 'CANTO', 'RITMO', 'PIANO', 'VINIL', 'PLANO', 'META', 'PAR', 'DUPLA',
];
