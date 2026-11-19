import { getStoryNode, storyStart, type StoryNode } from "../shared/story";

export type RoomStatus = "voting" | "closed" | "ended";

type Room = {
  code: string;
  hostToken: string;
  nodeId: string;
  status: RoomStatus;
  votes: Record<string, number>;
  voterKeys: Set<string>;
  participants: Set<string>;
  createdAt: number;
};

const rooms = new Map<string, Room>();
const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

function randomToken(size = 18) {
  const bytes = new Uint8Array(size);
  if (typeof crypto !== "undefined" && "getRandomValues" in crypto) crypto.getRandomValues(bytes);
  return Array.from(bytes, byte => alphabet[byte % alphabet.length]).join("");
}

function makeCode() {
  let code = "";
  do code = randomToken(4); while (rooms.has(code));
  return code;
}

function getRoom(code: string) {
  const room = rooms.get(code.trim().toUpperCase());
  if (!room) throw new Error("Sala não encontrada. Confira o código e tente novamente.");
  return room;
}

function stateFor(room: Room, voterToken?: string) {
  const node = getStoryNode(room.nodeId);
  const counts = node.choices.map(choice => ({ id: choice.id, count: room.votes[choice.id] ?? 0 }));
  const totalVotes = counts.reduce((sum, choice) => sum + choice.count, 0);
  const winner = counts.reduce<{ id: string; count: number } | null>((best, choice) => {
    if (!best || choice.count > best.count) return choice;
    return best;
  }, null);
  return {
    code: room.code,
    status: room.status,
    node,
    counts,
    totalVotes,
    participants: room.participants.size,
    votedByCurrent: voterToken ? room.voterKeys.has(`${room.nodeId}:${voterToken}`) : false,
    winner: winner && winner.count > 0 ? winner : null,
    createdAt: room.createdAt,
  };
}

export function createRoom() {
  const room: Room = {
    code: makeCode(),
    hostToken: randomToken(),
    nodeId: storyStart,
    status: "voting",
    votes: {},
    voterKeys: new Set(),
    participants: new Set(),
    createdAt: Date.now(),
  };
  rooms.set(room.code, room);
  return { ...stateFor(room), hostToken: room.hostToken };
}

export function joinRoom(code: string, voterToken: string) {
  const room = getRoom(code);
  room.participants.add(voterToken);
  return stateFor(room, voterToken);
}

export function getRoomState(code: string, voterToken?: string) {
  return stateFor(getRoom(code), voterToken);
}

export function castVote(code: string, optionId: string, voterToken: string) {
  const room = getRoom(code);
  if (room.status !== "voting") throw new Error("A votação desta cena já foi encerrada.");
  const node = getStoryNode(room.nodeId);
  const choice = node.choices.find(item => item.id === optionId);
  if (!choice) throw new Error("Essa alternativa não está disponível nesta cena.");
  const voterKey = `${room.nodeId}:${voterToken}`;
  if (room.voterKeys.has(voterKey)) throw new Error("Este dispositivo já votou nesta rodada.");
  room.participants.add(voterToken);
  room.voterKeys.add(voterKey);
  room.votes[optionId] = (room.votes[optionId] ?? 0) + 1;
  return stateFor(room, voterToken);
}

function assertHost(room: Room, hostToken: string) {
  if (room.hostToken !== hostToken) throw new Error("Apenas o apresentador pode controlar esta sala.");
}

export function closeVoting(code: string, hostToken: string) {
  const room = getRoom(code);
  assertHost(room, hostToken);
  if (room.status !== "voting") return stateFor(room);
  room.status = "closed";
  return stateFor(room);
}

export function advanceRoom(code: string, hostToken: string) {
  const room = getRoom(code);
  assertHost(room, hostToken);
  if (room.status !== "closed") throw new Error("Encerre a votação antes de avançar.");
  const node = getStoryNode(room.nodeId);
  const counts = node.choices.map(choice => ({ choice, count: room.votes[choice.id] ?? 0 }));
  const winner = counts.reduce<{ choice: StoryNode["choices"][number]; count: number } | null>((best, item) => {
    if (!best || item.count > best.count) return item;
    return best;
  }, null);
  if (!winner || winner.count === 0) throw new Error("Ainda não há votos suficientes para escolher um caminho.");
  room.nodeId = winner.choice.next;
  room.votes = {};
  room.status = getStoryNode(room.nodeId).kind === "final" ? "ended" : "voting";
  return stateFor(room);
}

export function resetRoom(code: string, hostToken: string) {
  const room = getRoom(code);
  assertHost(room, hostToken);
  room.nodeId = storyStart;
  room.status = "voting";
  room.votes = {};
  room.voterKeys.clear();
  room.createdAt = Date.now();
  return stateFor(room);
}
