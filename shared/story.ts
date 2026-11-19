export type StoryChoice = {
  id: string;
  label: string;
  helper?: string;
  next: string;
  tone?: "safe" | "curious" | "risk";
};

export type StoryNode = {
  id: string;
  kind: "scene" | "final";
  sceneNo: string;
  eyebrow: string;
  title: string;
  text: string;
  quote?: string;
  location: string;
  characters: string[];
  choices: StoryChoice[];
  finalLabel?: string;
};

export const storyStart = "scene-05";

export const storyNodes: Record<string, StoryNode> = {
  "scene-05": {
    id: "scene-05",
    kind: "scene",
    sceneNo: "05",
    eyebrow: "REPORTAGEM",
    title: "Uma notícia ao vivo",
    text: "A televisão interrompe a manhã. Clara reconhece o antigo edifício do centro pela janela. O bairro parece prender a respiração — e Rafael é a primeira pessoa em quem ela pensa.",
    quote: "Atenção: equipes de emergência atendem a uma ocorrência no antigo edifício do centro. Ninguém deve se aproximar da área.",
    location: "Quarto de Clara · manhã",
    characters: ["Clara", "Televisão"],
    choices: [
      { id: "message", label: "Mandar mensagem para Rafael", helper: "Ela pega o celular antes que a notícia suma.", next: "scene-11", tone: "curious" },
      { id: "watch", label: "Rever a reportagem e observar a rua", helper: "Talvez a janela revele o que a câmera não mostrou.", next: "scene-04", tone: "safe" },
    ],
  },
  "scene-11": {
    id: "scene-11",
    kind: "scene",
    sceneNo: "11",
    eyebrow: "RAFAEL",
    title: "A chamada",
    text: "O celular vibra. Rafael atende por vídeo, preocupado. Os dois combinam de não se aproximar do prédio e de procurar um adulto se a situação piorar.",
    quote: "Vi a notícia. Você está bem? Não vai até lá, Clara. A rua está isolada.",
    location: "Chamada de vídeo · manhã",
    characters: ["Clara", "Rafael"],
    choices: [
      { id: "mother", label: "Pedir ajuda à mãe", helper: "Clara decide não carregar o medo sozinha.", next: "scene-07", tone: "safe" },
      { id: "observe", label: "Continuar observando de casa", helper: "A chamada fica aberta enquanto a cidade silencia.", next: "scene-12", tone: "curious" },
    ],
  },
  "scene-04": {
    id: "scene-04",
    kind: "scene",
    sceneNo: "04",
    eyebrow: "A DESCOBERTA",
    title: "O que a câmera não mostra",
    text: "Clara volta alguns segundos na reportagem. Não há imagem nítida de ninguém escalando; só luzes, sirenes ao longe e um repórter pedindo distância. Ela quer descobrir se Rafael também viu.",
    quote: "A situação ainda está sendo avaliada. Pedimos que as pessoas não se aproximem do local.",
    location: "Quarto de Clara · poucos minutos depois",
    characters: ["Clara", "Rafael"],
    choices: [
      { id: "call-rafael", label: "Ligar para Rafael", helper: "Uma voz conhecida pode organizar o que está acontecendo.", next: "scene-11", tone: "curious" },
      { id: "call-mother", label: "Chamar a mãe e contar o que viu", helper: "Clara escolhe dividir a dúvida com um adulto.", next: "scene-07", tone: "safe" },
    ],
  },
  "scene-07": {
    id: "scene-07",
    kind: "scene",
    sceneNo: "07",
    eyebrow: "MÃE",
    title: "Do outro lado da porta",
    text: "A mãe de Clara aparece à porta. Ela agradece por Clara contar o que viu e lembra que curiosidade não é motivo para atravessar um isolamento.",
    quote: "A gente pode acompanhar daqui. Se houver perigo, são os profissionais que cuidam disso.",
    location: "Quarto de Clara · fim da tarde",
    characters: ["Clara", "Mãe"],
    choices: [
      { id: "stay", label: "Ficar em casa e acompanhar a notícia", helper: "A tensão diminui sem que ninguém se exponha.", next: "scene-12", tone: "safe" },
      { id: "write", label: "Escrever para Rafael antes de anoitecer", helper: "Clara compartilha o plano de ficar em segurança.", next: "scene-12", tone: "curious" },
    ],
  },
  "scene-12": {
    id: "scene-12",
    kind: "scene",
    sceneNo: "12",
    eyebrow: "ESCOLHA SEGURA",
    title: "A distância também é uma decisão",
    text: "Clara fecha a cortina por um instante. Do celular, envia a Rafael: “Vamos ficar por aqui e avisar um adulto se soubermos de algo urgente.” Horas passam. O céu fica violeta; depois, azul-escuro. Mas a luz vermelha volta a piscar entre os prédios.",
    location: "Apartamento de Clara · transição para a noite",
    characters: ["Clara", "Rafael"],
    choices: [
      { id: "night-news", label: "Acompanhar a notícia até o fim", helper: "Clara mantém a televisão ligada e espera uma atualização oficial.", next: "scene-13", tone: "safe" },
      { id: "night-window", label: "Voltar à janela com Rafael na chamada", helper: "De longe, os dois tentam entender se aquela luz é um sinal ou só um reflexo.", next: "scene-13b", tone: "curious" },
    ],
  },
  "scene-13": {
    id: "scene-13",
    kind: "scene",
    sceneNo: "13",
    eyebrow: "NOITE",
    title: "Uma luz entre os prédios",
    text: "Uma luz vermelha atravessa os prédios muito ao longe. Pode ser um veículo de emergência, pode ser apenas um reflexo. Rafael manda uma última mensagem: “Você decide o que faz agora. Eu fico com você por chamada.”",
    quote: "O que importa mais?",
    location: "Janela de Clara · noite",
    characters: ["Clara", "Rafael"],
    choices: [
      { id: "final-1", label: "Chamar a mãe e seguir as orientações oficiais", helper: "Coragem também pode ser pedir ajuda.", next: "final-1", tone: "safe" },
      { id: "final-2", label: "Abrir a porta e tentar ir até a rua", helper: "O impulso de correr encontra a lembrança do isolamento.", next: "final-2", tone: "risk" },
      { id: "final-3", label: "Ficar na janela e conversar com Rafael", helper: "Nem toda resposta chega na hora — e tudo bem.", next: "final-3", tone: "curious" },
    ],
  },
  "scene-13b": {
    id: "scene-13b",
    kind: "scene",
    sceneNo: "13B",
    eyebrow: "O REFLEXO",
    title: "Uma luz que pede calma",
    text: "Rafael amplia a imagem pelo celular, mas o reflexo se desfaz antes de virar uma resposta. Clara percebe uma sombra se movendo no prédio vizinho — nada prova que seja o Homem-Aranha, mas a dúvida é suficiente para fazer o coração acelerar.",
    quote: "Não transforma uma pista em perigo. Primeiro, a gente pensa.",
    location: "Janela de Clara · noite",
    characters: ["Clara", "Rafael"],
    choices: [
      { id: "final-1b", label: "Chamar a mãe e seguir as orientações oficiais", helper: "Clara escolhe transformar a dúvida em cuidado.", next: "final-1", tone: "safe" },
      { id: "final-2b", label: "Abrir a porta e tentar ir até a rua", helper: "A curiosidade cresce, mesmo com o isolamento ainda ativo.", next: "final-2", tone: "risk" },
      { id: "final-3b", label: "Ficar na janela e conversar com Rafael", helper: "Os dois guardam a pergunta e permanecem juntos, à distância.", next: "final-3", tone: "curious" },
    ],
  },
  "final-1": {
    id: "final-1",
    kind: "final",
    sceneNo: "FINAL 1/3",
    eyebrow: "CORAGEM É PEDIR AJUDA",
    title: "Uma escolha responsável também pode ser heroica",
    text: "Clara chama a mãe antes de tocar na porta. Juntas, conferem a atualização oficial e ligam para o serviço de emergência apenas quando a reportagem pede informações de testemunhas — sem se aproximar do local. Rafael permanece na chamada.",
    location: "Apartamento de Clara · noite",
    characters: ["Clara", "Mãe", "Rafael"],
    choices: [],
    finalLabel: "FINAL 1",
  },
  "final-2": {
    id: "final-2",
    kind: "final",
    sceneNo: "FINAL 2/3",
    eyebrow: "A PORTA FICA FECHADA",
    title: "Às vezes, o ato mais difícil é não se precipitar",
    text: "Clara dá um passo até a porta — e para. Lembra do aviso: a área está isolada. Não sabe o que encontrará do lado de fora, e não quer colocar ninguém em risco. Ela volta e chama a mãe.",
    location: "Corredor do apartamento · noite",
    characters: ["Clara", "Mãe"],
    choices: [],
    finalLabel: "FINAL 2",
  },
  "final-3": {
    id: "final-3",
    kind: "final",
    sceneNo: "FINAL 3/3",
    eyebrow: "A CIDADE RESPIRA",
    title: "Talvez a esperança não precise de uma aparição",
    text: "Clara fica junto à janela, mas a uma distância segura. Rafael conta uma piada ruim para quebrar o silêncio. Ao longe, as luzes de emergência começam a se afastar. Ninguém sabe ao certo se o Homem-Aranha esteve ali — e tudo bem.",
    location: "Janela de Clara · noite",
    characters: ["Clara", "Rafael"],
    choices: [],
    finalLabel: "FINAL 3",
  },
};

export function getStoryNode(id: string): StoryNode {
  return storyNodes[id] ?? storyNodes[storyStart];
}
