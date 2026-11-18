import { useEffect, useMemo, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  ChevronRight,
  Clipboard,
  Copy,
  Film,
  LockKeyhole,
  Monitor,
  Play,
  QrCode,
  RotateCcw,
  Send,
  Smartphone,
  Sparkles,
  Users,
  Vote,
  Wifi,
} from "lucide-react";
import { trpc } from "@/lib/trpc";
import { storyNodes, storyStart, type StoryChoice, type StoryNode } from "@shared/story";

type Mode = "landing" | "presenter" | "participant";

type RoomState = {
  code: string;
  status: "voting" | "closed" | "ended";
  node: StoryNode;
  counts: { id: string; count: number }[];
  totalVotes: number;
  participants: number;
  votedByCurrent: boolean;
  winner: { id: string; count: number } | null;
};

const sceneOrder = ["scene-05", "scene-11", "scene-04", "scene-07", "scene-12", "scene-13"];

function getDeviceToken() {
  const key = "escolhapp-device-token";
  try {
    const current = localStorage.getItem(key);
    if (current) return current;
    const token = `${crypto.randomUUID?.() ?? Math.random().toString(36).slice(2)}-${Date.now()}`;
    localStorage.setItem(key, token);
    return token;
  } catch {
    return `device-${Math.random().toString(36).slice(2)}-${Date.now()}`;
  }
}

function Brand({ compact = false }: { compact?: boolean }) {
  return (
    <div className={`brand-lockup ${compact ? "brand-lockup--compact" : ""}`}>
      <span className="brand-mark"><span /></span>
      <span className="brand-name">escolhapp</span>
      {!compact && <span className="brand-kicker">curta interativo</span>}
    </div>
  );
}

function LivePill({ label = "AO VIVO" }: { label?: string }) {
  return <span className="live-pill"><span className="live-dot" />{label}</span>;
}

function StoryProgress({ currentId }: { currentId: string }) {
  const activeIndex = Math.max(0, sceneOrder.indexOf(currentId));
  return (
    <div className="story-progress" aria-label="Progresso da história">
      <div className="progress-caption"><span>ARCO DA HISTÓRIA</span><span>{Math.min(activeIndex + 1, sceneOrder.length)}/{sceneOrder.length}</span></div>
      <div className="progress-track">
        {sceneOrder.map((id, index) => (
          <span key={id} className={`progress-node ${index <= activeIndex ? "is-active" : ""} ${id === currentId ? "is-current" : ""}`} />
        ))}
      </div>
      <div className="progress-labels"><span>manhã</span><span>noite</span></div>
    </div>
  );
}

function SceneHeader({ node, mode }: { node: StoryNode; mode: "presenter" | "participant" }) {
  return (
    <div className="scene-header">
      <div className="scene-kicker-row">
        <span className="scene-number">{node.sceneNo}</span>
        <span className="scene-eyebrow">{node.eyebrow}</span>
        <span className="scene-location">{node.location}</span>
      </div>
      <h1>{node.title}</h1>
      <p className="scene-copy">{node.text}</p>
      {node.quote && <div className="scene-quote"><span className="quote-mark">“</span><span>{node.quote}</span></div>}
      <div className="character-row">
        <span className="character-label">EM CENA</span>
        {node.characters.map(character => <span className="character-chip" key={character}>{character}</span>)}
        {mode === "presenter" && <span className="character-chip character-chip--signal"><Wifi size={12} /> transmissão ativa</span>}
      </div>
    </div>
  );
}

function ChoiceCard({
  choice,
  choiceIndex = 0,
  count,
  totalVotes,
  status,
  winner,
  disabled,
  onClick,
  mobile = false,
}: {
  choice: StoryChoice;
  choiceIndex?: number;
  count: number;
  totalVotes: number;
  status: RoomState["status"];
  winner: boolean;
  disabled?: boolean;
  onClick?: () => void;
  mobile?: boolean;
}) {
  const percent = totalVotes ? Math.round((count / totalVotes) * 100) : 0;
  const tone = choice.tone ?? "curious";
  return (
    <button
      type="button"
      className={`choice-card choice-card--${tone} ${winner ? "is-winner" : ""} ${disabled ? "is-disabled" : ""} ${mobile ? "choice-card--mobile" : ""}`}
      onClick={onClick}
      disabled={disabled}
    >
      <span className="choice-index">{String.fromCharCode(65 + choiceIndex)}</span>
      <span className="choice-main"><strong>{choice.label}</strong>{choice.helper && <small>{choice.helper}</small>}</span>
      {status !== "voting" || totalVotes > 0 ? (
        <span className="choice-votes"><span className="vote-number">{count}</span><span className="vote-percent">{percent}%</span></span>
      ) : <ChevronRight className="choice-arrow" size={20} />}
      {(status === "closed" || status === "ended") && <span className="choice-meter"><span style={{ width: `${percent}%` }} /></span>}
      {winner && <span className="winner-stamp"><Check size={13} /> mais votada</span>}
    </button>
  );
}

function RoomSignal({ roomCode, participants, totalVotes, onCopy }: { roomCode: string; participants: number; totalVotes: number; onCopy: () => void }) {
  const joinUrl = typeof window !== "undefined" ? `${window.location.origin}/?join=${roomCode}` : `/?join=${roomCode}`;
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=220x220&margin=8&data=${encodeURIComponent(joinUrl)}`;
  return (
    <aside className="room-signal">
      <div className="signal-heading"><span><QrCode size={15} /> SINAL DA SALA</span><span className="signal-live"><span /> online</span></div>
      <div className="room-code-label">CÓDIGO PARA ENTRAR</div>
      <button className="room-code" onClick={onCopy} title="Copiar código da sala"><span>{roomCode}</span><Copy size={18} /></button>
      <div className="qr-wrap"><img src={qrUrl} alt={`QR code para entrar na sala ${roomCode}`} /><div className="qr-corner qr-corner--tl" /><div className="qr-corner qr-corner--tr" /><div className="qr-corner qr-corner--bl" /></div>
      <p className="qr-hint">Aponte a câmera do celular<br />ou acesse o link da sala.</p>
      <div className="signal-stats"><div><Users size={16} /><strong>{participants}</strong><span>na sala</span></div><div><Vote size={16} /><strong>{totalVotes}</strong><span>votos</span></div></div>
    </aside>
  );
}

function Landing({ onPresenter, onParticipant }: { onPresenter: () => void; onParticipant: () => void }) {
  return (
    <main className="landing-shell">
      <header className="landing-nav"><Brand /><span className="nav-status"><span className="status-line" /> uma história para decidir junto</span></header>
      <section className="hero-grid">
        <div className="hero-copy">
          <div className="hero-eyebrow"><Film size={15} /> PROJETO ESCOLAR · CURTA INTERATIVO</div>
          <h1>Esperando o<br /><em>Homem-Aranha.</em></h1>
          <p className="hero-lede">Uma notícia estranha. Dois amigos. E uma sala inteira para decidir o que acontece depois.</p>
          <div className="hero-actions"><button className="primary-button" onClick={onPresenter}><Monitor size={18} /> abrir modo telão <ArrowRight size={17} /></button><button className="secondary-button" onClick={onParticipant}><Smartphone size={18} /> participar pelo celular</button></div>
          <div className="hero-note"><span className="note-line" /><span>sem cadastro · voto anônimo · decisão coletiva</span></div>
        </div>
        <div className="hero-art" aria-hidden="true">
          <div className="window-glow" />
          <div className="cityline cityline--back" /><div className="cityline cityline--front" />
          <div className="hero-window"><div className="window-cross window-cross--vertical" /><div className="window-cross window-cross--horizontal" /><div className="hero-reflection">?</div></div>
          <div className="hero-caption"><span>01</span><span>uma luz entre os prédios</span></div>
          <span className="art-sticker art-sticker--top">DECIDA<br /><strong>JUNTO</strong></span>
          <span className="art-sticker art-sticker--bottom">CLARA<br /><strong>RAFAEL</strong></span>
        </div>
      </section>
      <section className="how-it-works"><div className="section-label"><span>COMO FUNCIONA</span><span className="section-rule" /></div><div className="how-grid"><div><span className="step-no">01</span><h2>O telão conduz.</h2><p>O apresentador abre uma sala, lê a cena e controla quando a história avança.</p></div><div><span className="step-no">02</span><h2>A turma escolhe.</h2><p>Cada pessoa entra com um código e vota pelo próprio celular, sem nome e sem conta.</p></div><div><span className="step-no">03</span><h2>A história responde.</h2><p>A alternativa mais votada aparece no palco e muda a próxima cena.</p></div></div></section>
      <footer className="landing-footer"><span>baseado em “Esperando o Homem-Aranha”</span><span>Clara · Rafael · história com escolhas clicáveis</span></footer>
    </main>
  );
}

function JoinPanel({ initialCode = "", onJoined, onBack }: { initialCode?: string; onJoined: (code: string, token: string) => void; onBack: () => void }) {
  const [code, setCode] = useState(initialCode);
  const [error, setError] = useState("");
  const joinMutation = trpc.rooms.join.useMutation();
  const submit = (event: React.FormEvent) => {
    event.preventDefault();
    const normalized = code.trim().toUpperCase();
    if (normalized.length < 4) { setError("Digite o código de 4 letras da sala."); return; }
    const token = getDeviceToken();
    setError("");
    joinMutation.mutate({ code: normalized, voterToken: token }, {
      onSuccess: () => onJoined(normalized, token),
      onError: err => setError(err.message),
    });
  };
  return (
    <main className="join-shell"><button className="back-link" onClick={onBack}><ArrowLeft size={16} /> voltar</button><div className="join-card"><div className="join-icon"><Smartphone size={25} /></div><LivePill label="ENTRADA DA TURMA" /><h1>Qual é o código<br /><em>da sala?</em></h1><p>Peça ao apresentador o código que aparece no telão. Você não precisa criar uma conta.</p><form onSubmit={submit}><label htmlFor="room-code">código da sala</label><div className="code-input-wrap"><input id="room-code" autoFocus inputMode="text" maxLength={4} value={code} onChange={event => setCode(event.target.value.toUpperCase())} placeholder="EX: LUZ7" /><button type="submit" disabled={joinMutation.isPending}><ArrowRight size={21} /></button></div>{error && <div className="form-error">{error}</div>}</form><div className="anonymous-note"><LockKeyhole size={15} /><span>Seu voto é anônimo e fica ligado apenas a este dispositivo nesta rodada.</span></div></div></main>
  );
}

function PresenterView({ roomCode, hostToken, state, onReset, onBack, onRefresh }: { roomCode: string; hostToken: string; state: RoomState | undefined; onReset: () => void; onBack: () => void; onRefresh: () => void }) {
  const [copied, setCopied] = useState(false);
  const closeMutation = trpc.rooms.close.useMutation({ onSuccess: onRefresh });
  const advanceMutation = trpc.rooms.advance.useMutation({ onSuccess: onRefresh });
  const node = state?.node;
  const copyRoom = async () => {
    try { await navigator.clipboard.writeText(roomCode); setCopied(true); setTimeout(() => setCopied(false), 1800); } catch { /* clipboard is optional */ }
  };
  if (!state || !node) return <div className="loading-shell"><span className="loading-pulse" /> preparando a sala...</div>;
  const counts = new Map(state.counts.map(item => [item.id, item.count]));
  const canAdvance = state.status === "closed" && Boolean(state.winner);
  return (
      <main className="stage-shell">
      <header className="stage-topbar"><button className="stage-brand" onClick={onBack}><Brand compact /></button><div className="stage-context"><LivePill /><span className="context-divider" /><span>ESPERANDO O HOMEM-ARANHA</span></div><div className="stage-actions"><span className="host-label"><span className="host-dot" /> apresentação</span><button className="icon-button" onClick={onReset} title="Reiniciar história"><RotateCcw size={17} /></button></div></header>
      <div className="stage-layout"><aside className="stage-rail"><StoryProgress currentId={node.id} /><div className="rail-copy"><span className="rail-symbol">✦</span><p>A sala está pronta para escolher.</p><small>O telão mostra a cena. A turma decide o caminho.</small></div><button className="rail-home" onClick={onBack}><ArrowLeft size={14} /> sair da sala</button></aside>
        <section className="scene-stage"><div className="scene-stage-top"><span className="scene-program">CENA {node.sceneNo} <span>·</span> {node.eyebrow}</span><span className={`vote-status vote-status--${state.status}`}>{state.status === "voting" ? <><span className="status-dot" /> votação aberta</> : state.status === "closed" ? <><LockKeyhole size={12} /> votação encerrada</> : <><Sparkles size={12} /> final alcançado</>}</span></div><div className={`scene-card ${node.kind === "final" ? "scene-card--final" : ""}`}><SceneHeader node={node} mode="presenter" />{node.kind === "final" ? <div className="final-banner"><Sparkles size={18} /><span>{node.finalLabel} · a turma escreveu este desfecho junto</span></div> : <div className="choices-area"><div className="choices-heading"><span>O QUE CLARA FAZ?</span><span>{state.totalVotes > 0 ? `${state.totalVotes} voto${state.totalVotes === 1 ? "" : "s"} registrado${state.totalVotes === 1 ? "" : "s"}` : "aguardando escolhas da turma"}</span></div><div className="choices-grid">{node.choices.map((choice, choiceIndex) => <ChoiceCard key={choice.id} choice={choice} choiceIndex={choiceIndex} count={counts.get(choice.id) ?? 0} totalVotes={state.totalVotes} status={state.status} winner={state.winner?.id === choice.id} disabled={state.status !== "voting"} />)}</div></div>}</div><div className="presenter-controls">{node.kind === "final" ? <><div className="control-message"><Check size={17} /><span>Fim desta sessão. A história pode começar de novo.</span></div><button className="primary-button" onClick={onReset}><RotateCcw size={17} /> jogar de novo</button></> : state.status === "voting" ? <><div className="control-message"><Users size={17} /><span>{state.participants} participante{state.participants === 1 ? "" : "s"} conectado{state.participants === 1 ? "" : "s"}</span></div><button className="primary-button" onClick={() => closeMutation.mutate({ code: roomCode, hostToken })} disabled={state.totalVotes === 0 || closeMutation.isPending}><LockKeyhole size={16} /> encerrar votação</button></> : <><div className="control-message"><Check size={17} /><span>{state.winner ? "A maioria decidiu. O próximo capítulo está pronto." : "Sem votos nesta rodada."}</span></div><button className="primary-button" onClick={() => advanceMutation.mutate({ code: roomCode, hostToken })} disabled={!canAdvance || advanceMutation.isPending}><Play size={16} /> revelar próxima cena</button></>}</div></section>
        <RoomSignal roomCode={roomCode} participants={state.participants} totalVotes={state.totalVotes} onCopy={copyRoom} />
      </div>{copied && <div className="toast-message"><Check size={15} /> código copiado</div>}
    </main>
  );
}

function ParticipantView({ roomCode, voterToken, state, onBack }: { roomCode: string; voterToken: string; state: RoomState | undefined; onBack: () => void }) {
  const voteMutation = trpc.rooms.vote.useMutation();
  const node = state?.node;
  const counts = new Map(state?.counts.map(item => [item.id, item.count]) ?? []);
  if (!state || !node) return <div className="loading-shell loading-shell--mobile"><span className="loading-pulse" /> conectando à sala...</div>;
  const voted = state.votedByCurrent;
  return (
    <main className="participant-shell"><header className="participant-topbar"><button className="stage-brand" onClick={onBack}><Brand compact /></button><span className="participant-room"><span className="signal-live"><span /> sala {roomCode}</span></span></header><div className="participant-content"><div className="participant-intro"><LivePill label={state.status === "voting" ? "A TURMA ESTÁ DECIDINDO" : state.status === "closed" ? "VOTAÇÃO ENCERRADA" : "HISTÓRIA CONCLUÍDA"} /><div className="participant-scene-line"><span>CENA {node.sceneNo}</span><span>{node.eyebrow}</span></div><h1>{node.kind === "final" ? node.title : "O que Clara faz?"}</h1><p>{node.kind === "final" ? node.text : node.text}</p></div>{node.kind === "final" ? <div className="participant-final"><Sparkles size={25} /><strong>{node.finalLabel}</strong><span>Veja o desfecho no telão.</span><button className="secondary-button" onClick={onBack}><ArrowLeft size={16} /> sair</button></div> : voted ? <div className="voted-card"><div className="voted-check"><Check size={23} /></div><LivePill label={state.status === "voting" ? "VOTO RECEBIDO" : "RODADA ENCERRADA"} /><h2>{state.status === "voting" ? "Sua escolha está com a turma." : "A turma já decidiu."}</h2><p>Você pode acompanhar a contagem no telão. O resultado aparece quando o apresentador revelar a próxima cena.</p><div className="mini-stats"><span><strong>{state.participants}</strong> na sala</span><span><strong>{state.totalVotes}</strong> votos</span></div></div> : <div className="mobile-choices">{node.choices.map((choice, choiceIndex) => <ChoiceCard key={choice.id} choice={choice} choiceIndex={choiceIndex} count={counts.get(choice.id) ?? 0} totalVotes={state.totalVotes} status={state.status} winner={false} disabled={state.status !== "voting" || voteMutation.isPending} onClick={() => voteMutation.mutate({ code: roomCode, optionId: choice.id, voterToken })} mobile />)}{voteMutation.error && <div className="form-error">{voteMutation.error.message}</div>}</div>}<div className="participant-footer"><span><LockKeyhole size={13} /> voto anônimo</span><span><Users size={13} /> {state.participants} na sala</span></div></div></main>
  );
}

export default function Home() {
  const [mode, setMode] = useState<Mode>("landing");
  const [roomCode, setRoomCode] = useState<string | null>(null);
  const [hostToken, setHostToken] = useState<string | null>(null);
  const [voterToken, setVoterToken] = useState<string | null>(null);
  const [joinCode, setJoinCode] = useState("");
  const createMutation = trpc.rooms.create.useMutation();
  const roomQuery = trpc.rooms.state.useQuery({ code: roomCode ?? "", voterToken: voterToken ?? undefined }, { enabled: Boolean(roomCode), refetchInterval: roomCode ? 1200 : false, retry: false });
  const roomState = roomQuery.data as RoomState | undefined;

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const incomingCode = params.get("join");
    if (incomingCode) { setJoinCode(incomingCode.toUpperCase()); setMode("participant"); }
  }, []);

  const createRoom = () => createMutation.mutate(undefined, { onSuccess: result => { setRoomCode(result.code); setHostToken(result.hostToken); setVoterToken(null); setMode("presenter"); } });
  const startJoin = () => { setRoomCode(null); setVoterToken(null); setMode("participant"); };
  const onJoined = (code: string, token: string) => { setRoomCode(code); setVoterToken(token); };
  const onBack = () => { setMode("landing"); setRoomCode(null); setHostToken(null); setVoterToken(null); };
  const resetRoom = () => { if (roomCode && hostToken) { trpcClientReset(roomCode, hostToken); } };

  // A tiny local action wrapper keeps the view declarative while using the hook only once.
  const resetMutation = trpc.rooms.reset.useMutation({ onSuccess: () => roomQuery.refetch() });
  const trpcClientReset = (code: string, token: string) => resetMutation.mutate({ code, hostToken: token });

  const landingMode = useMemo(() => mode === "landing", [mode]);
  if (landingMode) return <Landing onPresenter={createRoom} onParticipant={startJoin} />;
  if (mode === "participant" && !roomCode) return <JoinPanel initialCode={joinCode} onJoined={onJoined} onBack={onBack} />;
  if (mode === "presenter" && roomCode && hostToken) return <PresenterView roomCode={roomCode} hostToken={hostToken} state={roomState} onReset={resetRoom} onBack={onBack} onRefresh={() => roomQuery.refetch()} />;
  if (mode === "participant" && roomCode && voterToken) return <ParticipantView roomCode={roomCode} voterToken={voterToken} state={roomState} onBack={onBack} />;
  return <div className="loading-shell"><span className="loading-pulse" /> preparando...</div>;
}
