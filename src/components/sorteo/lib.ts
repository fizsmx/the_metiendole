/** name = nombre en WhatsApp (solo para identificar); en pantalla todos se llaman "Metedor + últimos 4 dígitos" */
export type Participant = { id: string; name: string; phone: string; groups?: string[]; about?: string };

export type GroupProof = {
  label: string;
  takenAt: string;
  total: number;
  participa: number;
  admins: number;
  sinNumero: number;
  excluidos: number;
  members: { name: string; id: string | null; status: 'participa' | 'admin' | 'sin-numero' | 'excluido' }[];
};

/** Huella SHA-256 de la lista de participantes (números ordenados). Si alguien cambia la lista, cambia la huella. */
export async function listFingerprint(ids: string[]): Promise<string> {
  const data = new TextEncoder().encode([...ids].sort().join('\n'));
  const hash = await crypto.subtle.digest('SHA-256', data);
  return [...new Uint8Array(hash)].map((b) => b.toString(16).padStart(2, '0')).join('');
}

export type Phase =
  | 'intro'
  | 'ronda1' // todos → 100
  | 'purga' // se eliminan los que no salieron
  | 'llaves' // 100 → 10 (10 llaves de 10)
  | 'final' // 10 → 2 (eliminación una por una)
  | 'votacion' // 2 finalistas, se espera el resultado de la votación
  | 'ganador';

export type LogEntry = { at: string; msg: string };

export type SorteoState = {
  phase: Phase;
  startedAt: string | null;
  poolSize: number;
  listHash: string | null;
  pollId: string | null; // votación web abierta para la final
  top100: string[]; // en el orden en que salieron
  revealed100: number;
  groups: string[][]; // 10 llaves de 10
  groupWinners: (string | null)[];
  finalists10: string[];
  eliminated: string[]; // orden de eliminación en la final (primero = puesto 10)
  finalists2: string[];
  votes: Record<string, string>;
  winner: string | null;
  log: LogEntry[];
};

export const TARGET_FIRST_ROUND = 100;
export const GROUPS = 10;
export const FINALISTS = 2;

export const initialState = (): SorteoState => ({
  phase: 'intro',
  startedAt: null,
  poolSize: 0,
  listHash: null,
  pollId: null,
  top100: [],
  revealed100: 0,
  groups: [],
  groupWinners: [],
  finalists10: [],
  eliminated: [],
  finalists2: [],
  votes: {},
  winner: null,
  log: [],
});

export const STORAGE_KEY = 'sorteo-metele-nomas-v1';

export function loadState(): SorteoState | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? { ...initialState(), ...JSON.parse(raw) } : null;
  } catch {
    return null;
  }
}

export function saveState(s: SorteoState) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(s));
  } catch {
    /* sin almacenamiento: el sorteo sigue funcionando en memoria */
  }
}

/* ---------- Azar justo: crypto.getRandomValues con rechazo (sin sesgo de módulo) ---------- */

export function randomInt(maxExclusive: number): number {
  if (maxExclusive <= 0) throw new Error('rango inválido');
  const limit = Math.floor(0x100000000 / maxExclusive) * maxExclusive;
  const buf = new Uint32Array(1);
  let x: number;
  do {
    crypto.getRandomValues(buf);
    x = buf[0];
  } while (x >= limit);
  return x % maxExclusive;
}

export function shuffle<T>(arr: readonly T[]): T[] {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = randomInt(i + 1);
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export function sample<T>(arr: readonly T[], k: number): T[] {
  return shuffle(arr).slice(0, k);
}

/* ---------- Presentación ---------- */

// Códigos de país presentes en la comunidad (el más largo primero)
const COUNTRY_CODES = ['591', '595', '593', '598', '502', '503', '506', '507', '971', '56', '55', '54', '34', '51', '52', '57', '58', '44', '49', '39', '33', '81', '82', '86', '61', '1', '7'];

function splitCountry(phone: string): [string, string] {
  const digits = phone.replace(/^\+/, '');
  const cc = COUNTRY_CODES.find((c) => digits.startsWith(c)) ?? digits.slice(0, 3);
  return [`+${cc}`, digits.slice(cc.length)];
}

export function maskPhone(phone: string): string {
  if (phone.length < 8) return phone;
  const [cc] = splitCountry(phone);
  return `${cc} •••• ${phone.slice(-4)}`;
}

export function formatPhone(phone: string): string {
  // +591 7xxxxxxx → +591 7xx xxx xx  (genérico para otros países)
  if (phone.startsWith('+591') && phone.length === 12) {
    return `+591 ${phone.slice(4, 7)} ${phone.slice(7, 10)} ${phone.slice(10)}`;
  }
  const [cc, rest] = splitCountry(phone);
  return `${cc} ${rest.replace(/(\d{3})(?=\d{3,})/g, '$1 ')}`;
}

export const aliasFor = (phone: string) => `Metedor ${phone.slice(-4)}`;

export function displayName(p: Participant | undefined): string {
  if (!p) return '—';
  return aliasFor(p.phone);
}

/** Datos para ubicar a la persona: nombre de WhatsApp y descripción */
export function whoIs(p: Participant | undefined): string {
  if (!p) return '';
  return [p.name, p.about && `“${p.about}”`].filter(Boolean).join(' · ');
}

export function shownPhone(p: Participant | undefined, reveal: boolean): string {
  if (!p) return '';
  return reveal ? formatPhone(p.phone) : maskPhone(p.phone);
}

export const WHEEL_COLORS = [
  '#ef1b77',
  '#ff9343',
  '#9333EA',
  '#10B981',
  '#3B82F6',
  '#EF4444',
  '#F97316',
  '#06B6D4',
  '#D6336C',
  '#F7C948',
];

export const nowIso = () => new Date().toISOString();

/* ---------- Sonido (Web Audio, sin archivos) ---------- */

let ctx: AudioContext | null = null;
let muted = false;

export function setMuted(m: boolean) {
  muted = m;
}

function audio(): AudioContext | null {
  if (muted || typeof window === 'undefined') return null;
  try {
    ctx ??= new AudioContext();
    if (ctx.state === 'suspended') void ctx.resume();
    return ctx;
  } catch {
    return null;
  }
}

function tone(freq: number, dur: number, type: OscillatorType = 'sine', gain = 0.08, delay = 0) {
  const a = audio();
  if (!a) return;
  const t = a.currentTime + delay;
  const osc = a.createOscillator();
  const g = a.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, t);
  g.gain.setValueAtTime(gain, t);
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  osc.connect(g).connect(a.destination);
  osc.start(t);
  osc.stop(t + dur + 0.02);
}

export const sfx = {
  tick: () => tone(1400, 0.03, 'square', 0.03),
  pick: () => {
    tone(660, 0.12, 'triangle', 0.1);
    tone(990, 0.18, 'triangle', 0.08, 0.08);
  },
  eliminate: () => {
    tone(220, 0.25, 'sawtooth', 0.06);
    tone(150, 0.35, 'sawtooth', 0.05, 0.12);
  },
  fanfare: () => {
    [523, 659, 784, 1047].forEach((f, i) => tone(f, 0.35, 'triangle', 0.1, i * 0.14));
    tone(1047, 0.9, 'triangle', 0.08, 0.6);
  },
};

export const easeOutQuart = (t: number) => 1 - Math.pow(1 - t, 4);
