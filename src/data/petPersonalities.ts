import { PetType } from '../types';

export type PetReactionContext =
  | 'idle'
  | 'pet_head'
  | 'pet_belly'
  | 'pet_paw'
  | 'pet_nose'
  | 'feed'
  | 'water'
  | 'bath'
  | 'play'
  | 'dance'
  | 'sleep'
  | 'wake'
  | 'sound'
  | 'hungry'
  | 'dirty'
  | 'sleepy'
  | 'angry';

export interface PetPersonalityProfile {
  temperament: string;
  badgeLabel: string;
  idleLines: string[];
  headPetLines: string[];
  bellyPetLines: string[];
  pawPetLines: string[];
  noseLines: string[];
  feedLines: string[];
  waterLines: string[];
  bathLines: string[];
  playLines: string[];
  danceLines: string[];
  sleepLines: string[];
  wakeLines: string[];
  hungryLines: string[];
  dirtyLines: string[];
  sleepyLines: string[];
  angryLines: string[];
}

const DEFAULT_PROFILE: PetPersonalityProfile = {
  temperament: 'Carinhoso & Companheiro',
  badgeLabel: 'Mimoso',
  idleLines: [
    'Tô aqui esperando um cafuné especial de vocês ♡',
    'Hoje o dia pede abraço apertado e carinho!',
    'Olha pra mim! Estou fazendo pose fofa ♡',
  ],
  headPetLines: [
    'Mmm... bem aí na cabecinha! Não para não ♡',
    'Esse cafuné vale mais que mil diamantes ♡',
  ],
  bellyPetLines: [
    'Hihi, cosquinha na barriguinha! Faz mais!',
    'Barriguinha virada só porque eu confio em você ♡',
  ],
  pawPetLines: [
    'Toca aqui! Patinha fechada com você sempre ♡',
    'High-five oficial do nosso cantinho!',
  ],
  noseLines: [
    'Bip! Apertou o botão secreto da fofura!',
    'Ei, meu focinho é sensível! Mas eu gostei ♡',
  ],
  feedLines: [
    'Nham nham! Comidinha feita com amor tem outro sabor ♡',
    'Barriguinha cheia, coração quentinho!',
  ],
  waterLines: [
    'Glub glub... Águinha gelada, tudo o que eu precisava!',
    'Hidratado e pronto pra mais carinho ♡',
  ],
  bathLines: [
    'Tô brilhando de tão limpinho e cheiroso!',
    'Água morninha e espuma gostosa, delícia ♡',
  ],
  playLines: [
    'Uhuuul! Joga de novo que eu pego dessa vez!',
    'Brincar com você é a melhor parte do meu dia ♡',
  ],
  danceLines: [
    'Olha o meu passinho exclusivo pro casal ♡',
    'Ritmo perfeito! Agora dança comigo também!',
  ],
  sleepLines: [
    'Zzz... Apaga a luz que o soninho bateu forte...',
    'Vou nanar pensando em vocês dois ♡',
  ],
  wakeLines: [
    'Bom diaaa! Dormi feito anjinho, cadê o lanche?',
    'Acordei carregado de energia e carinho ♡',
  ],
  hungryLines: [
    'Ei! Minha barriga tá roncando alto, tô com fome!',
    'Sem petisco eu não faço nem mais uma pirueta, viu?',
  ],
  dirtyLines: [
    'Tô precisando de um banho urgente, olha essa poeirinha!',
    'Espuma e chuveiro agora, por favorzinho!',
  ],
  sleepyLines: [
    'Tô caindo de sono... Me leva pro quarto pra descansar.',
    'Bocejando muito aqui... Preciso de cochilo.',
  ],
  angryLines: [
    'Humpf! Ei, vai devagar comigo ou eu faço bico!',
    'Tô bravo hoje... Só um lanche bem caprichado me acalma!',
  ],
};

export const PET_PERSONALITY_PROFILES: Record<PetType, PetPersonalityProfile> = {
  cat: {
    temperament: 'Carinhoso, Manhoso & Meio Folgado',
    badgeLabel: 'Manhoso',
    idleLines: [
      'Miau... Tô te observando daqui, mas fingindo que nem ligo ♡',
      'Se não ganhar cafuné em 5 segundos, vou deitar no teclado!',
      'Ronrom... Você é minha humana favorita do mundo ♡',
    ],
    headPetLines: [
      'Ronronando no volume máximo... Continua na orelhinha ♡',
      'Hm, aprovado. Pode fazer mais 10 minutos de cafuné!',
    ],
    bellyPetLines: [
      'Cuidado! Barriga de gato é armadilha... brinks, faz mais ♡',
      'Ronrom... Que cosquinha boa na pança!',
    ],
    pawPetLines: [
      'Toca a patinha com classe! Miau ♡',
      'Patinha de veludo pronta pro cumprimento real!',
    ],
    noseLines: [
      'Boop no narizinho! Ganhou sorte no amor hoje ♡',
      'Miau! Meu focinho não é campainha, mas vou deixar passar!',
    ],
    feedLines: [
      'Sardinha VIP! Agora sim estamos conversando ♡',
      'Nham! Serviço de quarto nota dez, humana!',
    ],
    waterLines: [
      'Só bebo água fresquinha se for no copo bonito!',
      'Miau... Refrescante!',
    ],
    bathLines: [
      'Eu odeio água... tá, confesso que fiquei cheiroso demais ♡',
      'Pelo macio e perfumado igual algodão doce!',
    ],
    playLines: [
      'Cadê o pontinho vermelho?! Eu quase peguei ele!',
      'Miau! Ninguém vence minha velocidade com o novelo!',
    ],
    danceLines: [
      'Rebolado felino exclusivo para Gabriel & Samella ♡',
      'Olha o gingado das patinhas!',
    ],
    sleepLines: [
      'Zzz... Enroladinho igual um croissant no cobertor...',
      'Não me acorda antes do pôr do sol... Zzz...',
    ],
    wakeLines: [
      'Miau! Acordei exigindo atenção imediata e um petisco!',
      'Espreguiçando... Já pode voltar a me mimar ♡',
    ],
    hungryLines: [
      'Alô?! Meu potinho está vazio e eu vou miar até encher!',
      'Tô quase desmaiando de fome felina... Cadê meu peixe?',
    ],
    dirtyLines: [
      'Um gato da minha elegância não merece ficar empoeirado!',
      'Banho! Preciso lamber minhas patas e tomar espuma já!',
    ],
    sleepyLines: [
      'Meus olhinhos estão fechando... Quarto, por favor.',
      'Miau cansado... Preciso de 14 horas de soneca.',
    ],
    angryLines: [
      'Mrrrau! Se continuar me provocando, vou derrubar um copo imaginário!',
      'Bico armado! Só um carinho bem feito desarma essa fera ♡',
    ],
  },
  dog: {
    ...DEFAULT_PROFILE,
    temperament: 'Super Animado, Leal & Protetor',
    badgeLabel: 'Alegre',
    idleLines: [
      'Au au! Você voltou! Tô abanando o rabinho faz três horas!',
      'Você é a melhor coisa que já aconteceu na minha vida ♡',
      'Bolinha? Passeio? Petisco? Eu topo tudo agora!',
    ],
    headPetLines: [
      'AU AU! Sim, atrás da orelha é o paraíso ♡',
      'Minha patinha começou a bater sozinha de tanta felicidade!',
    ],
    bellyPetLines: [
      'Barriga pra cima! Pode coçar até amanhã ♡',
      'Hihi! Você é a melhor dona do universo!',
    ],
    feedLines: [
      'NHAM NHAM! Devorei em dois segundos, tem mais?!',
      'Melhor osso gourmet da história ♡',
    ],
    angryLines: [
      'Grrr... só tô bravinho porque tô morrendo de fome ou sem atenção!',
      'Au! Me dá um abraço logo pra eu voltar a abanar o rabo!',
    ],
  },
  bunny: {
    ...DEFAULT_PROFILE,
    temperament: 'Tímida, Fofa & Saltitante',
    badgeLabel: 'Doce',
    idleLines: [
      'Pula-pula! Olha minhas orelhinhas mexendo quando você chega ♡',
      'Tô quietinha no cantinho te esperando com carinho!',
    ],
    feedLines: [
      'Crec crec! Cenourinha crocante e doce ♡',
      'Morango fresquinho é meu ponto fraco!',
    ],
  },
  pig: {
    ...DEFAULT_PROFILE,
    temperament: 'Guloso, Folgado & Aconchegante',
    badgeLabel: 'Guloso',
    idleLines: [
      'Oinc oinc! Já tem hora pro próximo lanche?',
      'Sou fofinho, redondinho e especialista em sonecas ♡',
    ],
    angryLines: [
      'Oinc! Sem comida eu fico mal-humorado mesmo!',
      'Cadê minha maçã? Tô de greve até ganhar petisco!',
    ],
  },
  mouse: {
    ...DEFAULT_PROFILE,
    temperament: 'Curioso, Esperto & Ligado no 220v',
    badgeLabel: 'Curioso',
    idleLines: [
      'Squeak! Achei uma migalha brilhante aqui no canto!',
      'Minhas orelhinhas ouvem até o barulho do seu coração ♡',
    ],
  },
  snake: {
    ...DEFAULT_PROFILE,
    temperament: 'Sarcástica, Misteriosa & Protetora',
    badgeLabel: 'Sarcástica',
    idleLines: [
      'Sss... Não mordo ninguém da família, mas sigo de olho em tudo.',
      'Sss... Admito que gosto quando você me faz carinho ♡',
    ],
    angryLines: [
      'Ssshhh! Não testa minha paciência sem me dar atenção primeiro!',
      'Olha o bico da serpente... Me dá comida que eu fico mansa!',
    ],
  },
  bee: {
    ...DEFAULT_PROFILE,
    temperament: 'Trabalhadora, Doce & Zumbidora',
    badgeLabel: 'Doce',
    idleLines: [
      'Bzzz! Colhendo pólen de amor pra vocês dois ♡',
      'Nosso mel hoje tá mais doce que beijo apaixonado!',
    ],
  },
  fox: {
    ...DEFAULT_PROFILE,
    temperament: 'Esperta, Travessa & Charmosa',
    badgeLabel: 'Travessa',
    idleLines: [
      'Hehe, escondi um coração secreto por aí... duvida achar?',
      'Sou astuta, mas com vocês eu derreto todinha ♡',
    ],
    angryLines: [
      'Ei! Raposa irritada não faz truque! Traz frutinhas logo!',
      'Hum! Tô emburrada, tenta me conquistar com carinho!',
    ],
  },
  panda: {
    ...DEFAULT_PROFILE,
    temperament: 'Zen, Dorminhoco & Comilão',
    badgeLabel: 'Preguiçoso',
    idleLines: [
      'A vida é simples: bambu, rolar no chão e ganhar abraço ♡',
      'Tô com preguiça até de piscar... mas por você eu levanto!',
    ],
  },
  koala: {
    ...DEFAULT_PROFILE,
    temperament: 'Grudinho, Calmo & Sonolento',
    badgeLabel: 'Grudinho',
    idleLines: [
      'Posso ficar agarrado no seu braço igual um galho de eucalipto? ♡',
      'Modo economia de bateria: 90% carinho, 10% movimento.',
    ],
  },
  penguin: {
    ...DEFAULT_PROFILE,
    temperament: 'Elegante, Dramático & Trapalhão',
    badgeLabel: 'Elegante',
    idleLines: [
      'De smoking todo dia só pra impressionar o casal ♡',
      'Escorreguei de barriga tentando fazer pose chique!',
    ],
  },
  bear: {
    ...DEFAULT_PROFILE,
    temperament: 'Protetor, Quentinho & Abraçador',
    badgeLabel: 'Aconchego',
    idleLines: [
      'Abraço de urso liberado 24 horas por dia pra vocês ♡',
      'Se tiver frio, encosta aqui no meu pelo macio!',
    ],
  },
  hamster: {
    ...DEFAULT_PROFILE,
    temperament: 'Hiperativo, Bochechudo & Veloz',
    badgeLabel: 'Elétrico',
    idleLines: [
      'Bochecha cheia de sementes e energia pra correr 10 quilômetros!',
      'Zuuuum! Olha a velocidade na rodinha!',
    ],
  },
  shark: {
    ...DEFAULT_PROFILE,
    temperament: 'Durão por Fora, Bobão por Dentro',
    badgeLabel: 'Durão Fofo',
    idleLines: [
      'Eu finjo que sou o terror dos mares, mas derreto com cafuné ♡',
      'Nenhuma mordida aqui, só abraços subaquáticos!',
    ],
    angryLines: [
      'Tubarão com fome vira drama puro! Cadê meu peixe?',
      'Não testa o predador fofo sem carinho antes!',
    ],
  },
  dolphin: {
    ...DEFAULT_PROFILE,
    temperament: 'Alegre, Acrobata & Sociável',
    badgeLabel: 'Acrobata',
    idleLines: [
      'Click-click! Trouxe uma concha brilhante do fundo do mar pra você ♡',
      'Olha meu salto mortal duplo na onda!',
    ],
  },
  whale: {
    ...DEFAULT_PROFILE,
    temperament: 'Sábia, Gigante & Serena',
    badgeLabel: 'Guardiã',
    idleLines: [
      'Meu canto ecoa pelo oceano inteiro celebrando Gabriel & Samella ♡',
      'Amor profundo igual às águas onde eu nado.',
    ],
  },
  lion: {
    ...DEFAULT_PROFILE,
    temperament: 'Orgulhoso, Nobre & Protetor',
    badgeLabel: 'Nobre',
    idleLines: [
      'Rei da selva, mas quem manda aqui são vocês dois ♡',
      'Juba penteada e rugido macio de carinho!',
    ],
    angryLines: [
      'ROAR! Um rei com fome ou sujo não tem bom humor!',
      'Respeite a majestade da juba e traga um bife real!',
    ],
  },
  tiger: {
    ...DEFAULT_PROFILE,
    temperament: 'Ágil, Intenso & Ferozmente Doce',
    badgeLabel: 'Intenso',
    idleLines: [
      'Listras estilosas e olhar atento cuidando de vocês ♡',
      'Pronto pro bote... de carinho!',
    ],
  },
  frog: {
    ...DEFAULT_PROFILE,
    temperament: 'Zen, Saltitante & Engraçadinho',
    badgeLabel: 'Zen',
    idleLines: [
      'Coax! Tudo bem por aí? Só relaxando na minha vitória-régia ♡',
      'Um pulinho pra frente, dois sorrisos pro casal!',
    ],
  },
  hedgehog: {
    ...DEFAULT_PROFILE,
    temperament: 'Espinhoso por Fora, Manteiga por Dentro',
    badgeLabel: 'Tímido',
    idleLines: [
      'Prometo abaixar os espinhos quando você vier fazer cafuné ♡',
      'Tô me fazendo de durão, mas já tô sorrindo!',
    ],
  },
  parrot: {
    ...DEFAULT_PROFILE,
    temperament: 'Tagarela, Fofoqueiro & Colorido',
    badgeLabel: 'Tagarela',
    idleLines: [
      'Curupaco! Gabriel ama Samella! Gabriel ama Samella ♡',
      'Repito mil vezes: vocês são o casal mais lindo!',
    ],
    angryLines: [
      'Falta respeito e falta fruta no poleiro! Fiu-fiu bravo!',
      'Tô emburrado! Só volto a elogiar depois de um petisco!',
    ],
  },
  turtle: {
    ...DEFAULT_PROFILE,
    temperament: 'Calma, Filósofa & Paciente',
    badgeLabel: 'Sábia',
    idleLines: [
      'Sem pressa... o amor verdadeiro dura uma eternidade mesmo ♡',
      'Devagar se vai longe, sempre de mãos dadas!',
    ],
  },
};

function pickFrom(arr: string[], fallback: string[]): string {
  const pool = arr.length > 0 ? arr : fallback;
  return pool[Math.floor(Math.random() * pool.length)] || '';
}

export function getPetDialogue(
  petType: PetType,
  displayName: string,
  context: PetReactionContext,
  stats?: {
    hunger?: number;
    energy?: number;
    hygiene?: number;
    isSleeping?: boolean;
  }
): string {
  const profile = PET_PERSONALITY_PROFILES[petType] || DEFAULT_PROFILE;

  if (stats?.isSleeping && context !== 'wake' && context !== 'sleep') {
    return `Zzz... ${displayName} está dormindo tranquilo...`;
  }

  // Override idle/sound with moody state when needs are critically low
  if (context === 'idle' || context === 'angry') {
    if (context === 'angry') {
      return `${pickFrom(profile.angryLines, DEFAULT_PROFILE.angryLines)}`;
    }
    if ((stats?.hunger ?? 80) < 30) {
      return `${pickFrom(profile.hungryLines, DEFAULT_PROFILE.hungryLines)}`;
    }
    if ((stats?.hygiene ?? 80) < 30) {
      return `${pickFrom(profile.dirtyLines, DEFAULT_PROFILE.dirtyLines)}`;
    }
    if ((stats?.energy ?? 80) < 25) {
      return `${pickFrom(profile.sleepyLines, DEFAULT_PROFILE.sleepyLines)}`;
    }
    return pickFrom(profile.idleLines, DEFAULT_PROFILE.idleLines);
  }

  switch (context) {
    case 'pet_head':
      return pickFrom(profile.headPetLines, DEFAULT_PROFILE.headPetLines);
    case 'pet_belly':
      return pickFrom(profile.bellyPetLines, DEFAULT_PROFILE.bellyPetLines);
    case 'pet_paw':
      return pickFrom(profile.pawPetLines, DEFAULT_PROFILE.pawPetLines);
    case 'pet_nose':
      return pickFrom(profile.noseLines, DEFAULT_PROFILE.noseLines);
    case 'feed':
      return pickFrom(profile.feedLines, DEFAULT_PROFILE.feedLines);
    case 'water':
      return pickFrom(profile.waterLines, DEFAULT_PROFILE.waterLines);
    case 'bath':
      return pickFrom(profile.bathLines, DEFAULT_PROFILE.bathLines);
    case 'play':
      return pickFrom(profile.playLines, DEFAULT_PROFILE.playLines);
    case 'dance':
      return pickFrom(profile.danceLines, DEFAULT_PROFILE.danceLines);
    case 'sleep':
      return pickFrom(profile.sleepLines, DEFAULT_PROFILE.sleepLines);
    case 'wake':
      return pickFrom(profile.wakeLines, DEFAULT_PROFILE.wakeLines);
    case 'hungry':
      return pickFrom(profile.hungryLines, DEFAULT_PROFILE.hungryLines);
    case 'dirty':
      return pickFrom(profile.dirtyLines, DEFAULT_PROFILE.dirtyLines);
    case 'sleepy':
      return pickFrom(profile.sleepyLines, DEFAULT_PROFILE.sleepyLines);
    case 'sound':
    default:
      return `${displayName}: ${pickFrom(profile.idleLines, DEFAULT_PROFILE.idleLines)}`;
  }
}
