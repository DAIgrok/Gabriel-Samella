# Plano de Evolução Profissional: Nosso Mundo ♡ Gabriel & Samella

Evolução arquitetural e visual de alto padrão para o aplicativo romântico do casal, estabelecendo responsividade impecável (Desktop, Android e iOS), estética 2.5D encantadora e leve para a Árvore do Amor e Mascotes, personalização completa de nomes, catálogo expandido de animais e itens, aprimoramento dos 4 minijogos com recordes e recompensas, e gestão interativa de fotos e músicas locais sem reconstrução do projeto.

---

## Decisões Críticas & Preferências Confirmadas

> [!IMPORTANT]
> As seguintes escolhas fundamentais foram alinhadas com o usuário durante a etapa de esclarecimento e orientam todas as fases da implementação:

- **Estilo Visual dos Mascotes e Árvore**: **Ilustrações 2.5D refinadas com animações fluidas**. Em vez de modelos 3D pesados ou genéricos que sobrecarregam aparelhos modestos, utilizaremos rigs vetoriais e SVG dinâmicos em camadas com iluminação atmosférica, física de movimento (squash & stretch, respiração, balanço de cauda e orelhas) e sombras suaves a 60 FPS.
- **Cálculo de Crescimento da Árvore do Amor**: **Tempo de relacionamento (dias desde 12/06/2023) + bônus de cuidados diários**. O tronco e os galhos principais expandem organicamente com os dias reais que o casal passa junto, enquanto regas, banhos de sol e podas concedem vitalidade extra, frutos doces e aceleram etapas específicas.
- **Gerenciamento de Fotos e Músicas**: **Galeria e reprodutor interativos com suporte a upload local (do celular ou computador) e URLs diretas**, persistidos em estado local (`localStorage` / IndexedDB) sem a necessidade de editar código ou reconstruir o aplicativo para adicionar lembranças.
- **Personalização de Nomes de Mascotes**: Cada animal adotado possui nome 100% personalizável pelo usuário (ex: Mimi, Pipoca, Thor, Floquinho, ou o nome que o casal escolher).

---

## 1. Visão Geral & Auditoria do Projeto

### Auditoria da Estrutura Atual
1. **Ponto Forte**: O projeto possui uma base sólida em React 19 + TypeScript + Tailwind CSS, com contexto unificado (`AppContext.tsx`), sistema de áudio sintetizado e arquivos locais (`realAudio.ts`), suporte a conquistas, economia de diamantes (`coins`), cartas secretas e linha do tempo de memórias.
2. **Gargalos Identificados**:
   - **Responsividade**: Alguns elementos de navegação e visualização foram concebidos inicialmente com largura fixa ou dependem de scroll vertical comprimido em telas grandes de desktop, enquanto no mobile alguns botões podiam ficar próximos das bordas.
   - **Pets e Árvore**: O 3D anterior com Three.js gerava sobrecarga em smartphones Android mais simples e não refletia o charme artístico delicado e expressivo desejado pelo usuário.
   - **Gestão de Mídia**: A adição de fotos e músicas novas dependia parcialmente de arquivos estáticos pré-declarados.
   - **Jogos**: Os minijogos existentes (Quiz, Memória, Caça aos Corações, Jogo da Velha) precisavam de salvamento persistente de recordes (*high scores*), níveis de dificuldade e conexão direta com conquistas.

### Proposta de Valor
Entregar uma experiência de aplicativo de alta fidelidade (*native-like web app*) onde Gabriel e Samella encontram seu refúgio romântico, com toque suave, transições elegantes, comemorações a cada marco alcançado e liberdade para alimentar o app com novas fotos e canções do casal ao longo dos anos.

---

## 2. Experiência do Usuário & Design Visual

### A. Ergonomia e Responsividade Multi-Dispositivo
- **Desktop (1024px a 1440px+)**:
  - Layout adaptativo que aproveita a amplitude da tela com visualização em 2 colunas equilibradas (ex.: Árvore/Pet de um lado, painel de cuidados e vitais do outro; Player de música com lista de reprodução e letra em painéis simultâneos).
  - Preservação da barra lateral de navegação ou cabeçalho superior espaçoso com zonas de marcação claras e sem quebras de linha indesejadas.
- **Mobile (Android & iOS - 375px a 430px)**:
  - Ergonomia de polegar (*thumb-zone*): barra de navegação inferior fixa com altura adequada (`h-16 pb-safe`), com ícones de 24px e legendas legíveis de 10px.
  - Alvos de toque com área mínima de **44 × 44px** em todos os botões e seletores.
  - Folhas de ação deslizantes (*bottom sheets*) para detalhes de itens da loja, personalização de mascote e edição de fotos.
  - Limite rigoroso de elementos fixos (inferior a 15% da altura da tela) para garantir rolagem fluida e confortável sem corte de conteúdo.

### B. Identidade Visual Noturna & Mágica
- **Paleta de Cores**:
  - Fundo Canvas (60%): Preto meia-noite com tonalidades violeta profundas (`#080214`, `#0d041a`, `#120622`).
  - Superfícies Estruturais (30%): Cartões em vidro fosco (*frosted glass*) com bordas sutis (`border-purple-500/20`), sombras profundas e gradientes suaves.
  - Acentos de Ação (10%): Rosa neon suave (`#ec4899`, `#f43f5e`), lavanda luminoso (`#c084fc`) e ouro cintilante (`#fbbf24`) para marcos e diamantes.
- **Tipografia**:
  - Títulos e Destaques: *Outfit* e *Playfair Display* para toques românticos e refinados.
  - Corpo e Informações: *Plus Jakarta Sans* para clareza e alta legibilidade em qualquer resolução.
  - Números e Estatísticas: *Tabular figures* (`tabular-nums`) para contadores de amor e vitais dos pets.

---

## 3. Módulos & Especificação das Melhorias

### Módulo 1: Árvore do Amor 2.5D com Evolução Temporal & Cuidados
```
┌────────────────────────────────────────────────────────┐
│                   ÁRVORE DO AMOR 2.5D                  │
├──────────────────────────┬─────────────────────────────┤
│   Cenário Vivo & Céu     │   Progresso & Estatísticas  │
│   • Ilha mística em flor │   • Dias de Amor: X dias    │
│   • Tronco & Galhos 2.5D │   • Nível Atual: 1 a 10     │
│   • Frutos Sagrados      │   • Vitalidade / Cuidados   │
│   • Pirilampos & Fitas   │   • Próximo Desbloqueio     │
├──────────────────────────┴─────────────────────────────┤
│   Ações: [ 💧 Regar (+XP) ]  [ ☀️ Sol ]  [ ✂️ Podar ]   │
└────────────────────────────────────────────────────────┘
```
- **Cálculo da Idade do Amor**:
  - Data inicial: `12 de Junho de 2023`.
  - Cada dia completado de relacionamento contribui diretamente para a experiência e maturação do tronco e da folhagem da árvore.
- **Cuidados Diários Interativos**:
  - *Regar*: hidrata as raízes e gera partículas azuis/teal cintilantes.
  - *Banho de Sol*: ilumina a copa com raios dourados e gera botões de flores.
  - *Podar*: retira folhas secas e abre espaço para o nascimento de frutos dourados.
- **Frutos e Conquistas**:
  - Frutos sagrados que nascem conforme a árvore atinge marcos de dias e cuidados, concedendo mensagens românticas secretas e diamantes.
  - Conquistas desbloqueadas a cada transição de fase (Brotinho 🌱 -> Cerejeira 🌸 -> Frutos Dourados 🍎 -> Fitas de Promessa 🎀 -> Árvore Cósmica 🌌).

### Módulo 2: Sistema Profissional de Mascotes 2.5D com Nomes Livres
- **Catálogo de Espécies com Animações Dedicadas**:
  - Gatinho, Cachorrinho, Coelhinho, Tubarãozinho, Porquinho, Ratinho, Cobrinha e Abelhinha.
  - Cada animal com paleta de cores própria, reações de piscar, respiração calma, alegria ao brincar e soninho com zzz... no modo escuro.
- **Batismo e Renomeação**:
  - O usuário define o nome do animal no momento da adoção ou quando quiser através do botão de edição com validação e persistência individual.
- **5 Indicadores Vitais Reais**:
  - Fome (alimentos específicos para cada espécie: peixinho, bife, cenoura, etc.).
  - Sede (tigelinha d'água fresca).
  - Diversão (brinquedos interativos com sons de estalo e boing).
  - Higiene (banho interativo com estouro de bolhas de sabão).
  - Energia (abajur noturno com transição para quarto aconchegante).
- **Guarda-Roupa**:
  - Coroas, laços de cetim, óculos escuros, gravatas e asinhas de anjo com ajuste proporcional e renderização vetorial suave.

### Módulo 3: Boutique e Loja dos Apaixonados
- **Catálogo Expandido**:
  - Aba de Adoção de Mascotes (todas as espécies com informações de personalidade, comida preferida e som característico).
  - Aba de Roupas & Acessórios para pets.
  - Aba de Vales do Amor (resgatáveis na vida real com código copiável para WhatsApp).
  - Aba de Temas e Enfeites para a Árvore (luzes de fadas, borboletas, pássaros cantores).
- **Economia Equilibrada**:
  - Preservação integral do saldo atual de diamantes (`coins`).
  - Recompensas consistentes através de cuidados com a árvore e pets, leitura de cartas, desafios nos jogos e marcos da relação.

### Módulo 4: Central de Minijogos com Recordes e Desafios
- **Quiz do Amor**: Banco de perguntas sobre a história do casal, pontuação por acertos e medalha de mestre do romance.
- **Jogo da Memória**: Três níveis de dificuldade (4x3, 4x4, 4x5), contador de movimentos, cronômetro e registro de recorde de tempo.
- **Caça aos Corações**: Minijogo arcade de reflexos com corações flutuantes, bônus de combo e multiplicador de diamantes com salvamento de maior pontuação.
- **Jogo da Velha Romântico**: Modo para jogar a dois na mesma tela (Gabriel com 🌹 e Samella com 💖), placar de vitórias e frases de celebração para o vencedor.

### Módulo 5: Galeria de Memórias e Player de Música Interativos
- **Galeria de Fotos Inteligente**:
  - Preservação de todas as fotos reais já incluídas.
  - Novo botão "Adicionar Memória" com opção de selecionar arquivo de imagem do dispositivo (convertido em data URL local segura) ou inserir link de imagem.
  - Edição de legendas, data e marcação de favoritos.
  - Visualizador de cinema em tela cheia com navegação por toque (swipe) ou setas do teclado.
- **Player de Música com Gestão de Faixas**:
  - Preservação da lista oficial com reprodução de áudio real (`realAudio.ts`).
  - Suporte à inclusão de novas músicas locais (arquivos `.mp3` selecionados pelo casal no navegador) ou links diretos.
  - Letras sincronizadas, barra de progresso interativa, controle de volume, mudo e visualizador espectral de áudio.

---

## 4. Arquitetura Técnica & Estratégia de Dados

```
┌────────────────────────────────────────────────────────────────────────┐
│                        ESTRUTURA DA APLICAÇÃO                          │
├────────────────────────────────────────────────────────────────────────┤
│                                                                        │
│  ┌──────────────────── AppContext (Single Source of Truth) ─────────┐  │
│  │                                                                  │  │
│  │  • Relationship State (Início: 12/06/2023, Contador, Nomes)      │  │
│  │  • LoveTreeState (XP, Nível baseado em dias + cuidados, Frutos)  │  │
│  │  • KittenState & PetRegistry (Espécies, Nomes escolhidos, Vitais)│  │
│  │  • Store & Inventory (Vales, Roupas, Decorações, Diamantes 💎)   │  │
│  │  • Media Hub (Fotos reais + Uploads locais, Músicas + Playlists) │  │
│  │  • Game Records (Recordes de Memória, Caça aos Corações, Placar) │  │
│  │  • Achievements Engine (Conquistas desbloqueadas com progresso)   │  │
│  │                                                                  │  │
│  └─────────────────────────────────┬────────────────────────────────┘  │
│                                    │                                   │
│              ┌─────────────────────┼─────────────────────┐             │
│              ▼                     ▼                     ▼             │
│       [ Visualizações ]      [ Rigs 2.5D ]        [ Mídia & Som ]      │
│       • HomeView             • PetCharacter 2.5D  • realAudio Engine   │
│       • LoveTreeView         • LoveTreeCanvas 2.5D• audioSynth FX      │
│       • KittenView           • Interactive SVGs   • PhotoVisualizer    │
│       • GamesView                                                      │
│       • StoreView & Photos                                             │
│                                                                        │
│              └─────────────────────┬─────────────────────┘             │
│                                    ▼                                   │
│                       [ LocalStorage Persistence ]                     │
│                       • Estado seguro mantido no cache                 │
│                       • Zero perda em recarregamentos                  │
│                                                                        │
└────────────────────────────────────────────────────────────────────────┘
```

---

## 5. Fases de Execução & Verificação

1. **Fase 1: Motor da Árvore do Amor 2.5D**:
   - Conectar o cálculo de experiência aos dias reais desde 12/06/2023.
   - Refinar o componente visual da árvore com arte 2.5D em camadas (cenário místico, flora, frutos sagrados colhíveis e animação orgânica de vento).
   - Vincular os desbloqueios de nível a conquistas do casal.
2. **Fase 2: Mascotes 2.5D com Nomes Livres & Cuidados**:
   - Implementar o fluxo de nomeação personalizada para cada pet.
   - Polir as ilustrações e rigs vetoriais de todas as 8 espécies para máxima expressividade sem peso de WebGL.
   - Aperfeiçoar o guarda-roupa com pré-visualização instantânea.
3. **Fase 3: Expansão da Loja e Conexão de Economia**:
   - Inserir todas as espécies de animais com detalhes de personalidade na loja.
   - Garantir que cada item comprado fique ativo ou equipado conforme o slot.
4. **Fase 4: Desafios e Recordes nos Jogos**:
   - Salvar as melhores pontuações no Caça aos Corações e Jogo da Memória.
   - Adicionar novas perguntas íntimas e românticas ao Quiz do Amor.
5. **Fase 5: Gestor Interativo de Fotos & Músicas**:
   - Permitir adição/remoção de fotos com leitor local `FileReader` gravando em cache.
   - Permitir adicionar músicas personalizadas mantendo a biblioteca atual intacta.
6. **Fase 6: Otimização de Responsividade Mobile/Desktop & Verificação Final**:
   - Garantir alvos de toque de 44px, barra de abas suave para celular e visualização elegante em telas de computador.
   - Executar `tsc --noEmit` e `npm run build` para garantir integridade absoluta.
