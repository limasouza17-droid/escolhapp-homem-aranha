# Escolhapp — plano de implementação e design

## Produto

Criar uma experiência web para apresentar o curta interativo “Esperando o Homem-Aranha” em sala de aula. O apresentador conduz a narrativa em um telão; estudantes entram sem conta por um código curto, votam anonimamente em seus celulares e o telão exibe a participação e a alternativa vencedora antes do avanço manual da história.

## Arquitetura

- **Frontend:** React + TypeScript + Tailwind, em uma única experiência responsiva com dois modos: Telão e Celular.
- **Narrativa:** roteiro ramificado em `shared/story.ts`, com cenas, textos, alternativas, transições e três finais baseados no PDF.
- **Estado de sala:** `server/roomStore.ts` mantém salas em memória por código, com token privado do apresentador, tokens anônimos de participantes, votos por rodada e progresso da história. O desenho permite trocar o armazenamento por Drizzle/Database sem alterar o contrato do cliente.
- **API:** tRPC público para criar sala, consultar estado, votar, encerrar votação, avançar para a escolha vencedora e reiniciar a sessão.
- **Atualização ao vivo:** polling leve no cliente, suficiente para uma sala de aula e compatível com Preview/publicação sem depender de WebSocket.
- **Compartilhamento:** código da sala, link de entrada e QR code gerado por URL pública de QR; nenhum cadastro ou nome de aluno é coletado.
- **Rotas:** `/` concentra o fluxo e `/manus-routes.json` declara a rota pública.

## Design

### Estilos considerados

- **Cinema noturno editorial — 0,06:** alto contraste, preto azulado, amarelo de lâmpada e vermelho de alerta, como um storyboard em uma sala escura.
- **Festival escolar colorido — 0,04:** cartões claros, cores vivas e energia mais lúdica.
- **Interface de controle de missão — 0,03:** painel denso, ciano e verde, com linguagem de operação ao vivo.

Escolha: **Cinema noturno editorial**.

### Movimento

Uma mistura de abertura de curta independente, créditos de fita e painel de votação ao vivo. A narrativa ocupa o foco; os controles aparecem como instrumentos discretos de apresentação.

### Princípios

1. **O telão precisa ser legível de longe:** tipografia grande, contraste alto, escolhas numeradas e placar visual.
2. **O celular precisa ser imediato:** uma ação principal por vez, poucos campos e feedback claro após votar.
3. **A tensão cresce por luz e cor:** amarelo para atenção e decisões seguras; vermelho só para alerta e escolhas de risco.
4. **A interface não compete com a história:** textura de papel, linhas de roteiro e sinais de transmissão criam atmosfera sem virar decoração gratuita.

### Paleta

Fundo quase preto azul-marinho para simular a sala de projeção; branco quente para texto; amarelo-luz como assinatura da narrativa; vermelho de sirene para a tensão; azul-petróleo para informação e estados neutros. A cor própria da marca é o **amarelo de janela acesa** (`#F2C66D`).

### Layout

Composição assimétrica com trilho lateral de estado e uma área central de cena. No telão, o conteúdo se organiza como uma página de roteiro com selo de transmissão, uma “janela” visual para a cena e cartões de escolha na base. No celular, a mesma linguagem vira uma pilha de cartões com CTA fixo e bastante área de toque.

### Elementos de assinatura

- Selo circular “AO VIVO / ESCOLHAS” no cabeçalho.
- Linha vertical de storyboard e marcadores de cena.
- Bloco “sinal da sala” com código, QR e total de participantes.

### Interação e animação

Entradas com fade e deslocamento curto; escolhas recebem uma linha amarela ao passar o mouse/toque; placares crescem suavemente quando novos votos chegam; ao encerrar, a vencedora recebe brilho amarelo e as demais perdem saturação. Sem animações longas que prejudiquem a apresentação.

### Tipografia

`Space Grotesk` para títulos, números de cena e dados; `IBM Plex Sans` para narrativa, controles e microcopy. Títulos em caixa alta com tracking levemente aberto; texto de história em corpo confortável.

### Essência da marca

**Uma história que a turma decide junto — feita para transformar o telão em conversa.** Personalidade: cinematográfica, acolhedora, participativa.

### Voz

Clara, curiosa e segura. Exemplos: “A sala está pronta para escolher.” / “A maioria decidiu. Vamos ver o que acontece.”

### Wordmark

“Escolhapp” em caixa baixa, com um pequeno ponto luminoso substituindo o “o”, lembrando uma luz distante entre prédios.
