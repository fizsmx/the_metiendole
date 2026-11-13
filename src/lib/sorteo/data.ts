// Carga de participantes del sorteo desde /data (solo servidor). Lo usan /api/sorteo y /api/votar.
import { readFile, readdir, stat } from 'node:fs/promises';
import path from 'node:path';

// Los archivos viven en /data (excluido de git). Nunca se sirven como estáticos.
const DATA_DIR = path.join(process.cwd(), 'data');
const GROUPS_DIR = path.join(DATA_DIR, 'grupos');
const COMMUNITY_FILE = 'participantes_comunidad_metele_nomas.csv';
// Opcional: un número por línea para excluir a mano
const EXCLUDE_FILE = 'excluidos.txt';
const INCLUDE_FILE = 'incluidos.csv';
// Descripción ("info") de WhatsApp de cada miembro: telefono,nombre_whatsapp,descripcion
const ABOUT_FILE = 'descripciones.csv';

const COMMUNITY_LABEL = 'Comunidad (Avisos)';
const GROUP_NAMES: Record<string, string> = {
  'secta-metedores': 'Secta Metedores',
  'secta-metedores-2': 'Secta Metedores 2',
  jugalenomas: 'JugaleNomas',
  'stickers-de-la-comunidad': 'Stickers de la comunidad',
};

type Row = Record<string, string>;
type Status = 'participa' | 'admin' | 'sin-numero' | 'excluido';

function parseCsv(text: string): Row[] {
  const clean = text.replace(/^﻿/, '');
  const records: string[][] = [];
  let field = '';
  let record: string[] = [];
  let quoted = false;

  for (let i = 0; i < clean.length; i++) {
    const c = clean[i];
    if (quoted) {
      if (c === '"' && clean[i + 1] === '"') {
        field += '"';
        i++;
      } else if (c === '"') {
        quoted = false;
      } else {
        field += c;
      }
    } else if (c === '"') {
      quoted = true;
    } else if (c === ',') {
      record.push(field);
      field = '';
    } else if (c === '\n' || c === '\r') {
      if (c === '\r' && clean[i + 1] === '\n') i++;
      record.push(field);
      records.push(record);
      record = [];
      field = '';
    } else {
      field += c;
    }
  }
  if (field || record.length) {
    record.push(field);
    records.push(record);
  }

  const [header, ...rows] = records.filter((r) => r.some((f) => f.trim()));
  if (!header) return [];
  return rows.map((r) => Object.fromEntries(header.map((h, i) => [h.trim(), (r[i] ?? '').trim()])));
}

async function readOptional(file: string): Promise<string | null> {
  try {
    return await readFile(file, 'utf8');
  } catch {
    return null;
  }
}

const normalizePhone = (p: string) => p.replace(/[^\d+]/g, '');

// Nombres como ".", "...", "~" no sirven para mostrar en pantalla
function cleanName(name: string): string {
  const n = name.replace(/^~\s?/, '').replace(/\s+/g, ' ').trim();
  const meaningful = n.replace(/[^\p{L}\p{N}]/gu, '');
  return meaningful.length >= 2 ? n.slice(0, 40) : '';
}

type Member = { name: string; phone: string; admin: boolean };
type Source = { label: string; members: Member[]; takenAt: string };

async function loadSources(): Promise<Source[]> {
  const sources: Source[] = [];
  const communityPath = path.join(DATA_DIR, COMMUNITY_FILE);
  const community = await readOptional(communityPath);
  if (community) {
    sources.push({
      label: COMMUNITY_LABEL,
      takenAt: (await stat(communityPath)).mtime.toISOString(),
      members: parseCsv(community).map((r) => ({
        name: r.nombre || '',
        phone: normalizePhone(r.telefono || ''),
        admin: !!r.rol,
      })),
    });
  }

  let files: string[] = [];
  try {
    files = (await readdir(GROUPS_DIR)).filter((f) => f.endsWith('.csv')).sort();
  } catch {
    /* sin carpeta de grupos */
  }
  for (const f of files) {
    const p = path.join(GROUPS_DIR, f);
    const text = await readOptional(p);
    if (!text) continue;
    const slug = f.replace(/\.csv$/, '');
    sources.push({
      label: GROUP_NAMES[slug] ?? slug,
      takenAt: (await stat(p)).mtime.toISOString(),
      members: parseCsv(text).map((r) => ({
        name: r.nombre || '',
        phone: normalizePhone(r.telefono || ''),
        admin: !!r.admin,
      })),
    });
  }
  return sources;
}

export const MISSING_DATA_ERROR = `No se encontró data/${COMMUNITY_FILE} ni data/grupos/*.csv`;

export { normalizePhone };

// En el stream llegan muchos votos a la vez: las listas se leen del disco como mucho una vez por minuto
let cache: { at: number; data: Promise<Awaited<ReturnType<typeof computeSorteoData>>> } | null = null;
const CACHE_MS = 60_000;

export function loadSorteoData() {
  if (!cache || Date.now() - cache.at > CACHE_MS) cache = { at: Date.now(), data: computeSorteoData() };
  return cache.data;
}

async function computeSorteoData() {
  const sources = await loadSources();
  if (!sources.length) return null;

  // Inclusiones manuales (data/incluidos.csv: nombre,telefono): participan aunque sean admins
  // o WhatsApp no muestre su número en la lista del grupo (contactos guardados).
  const includedByName = new Map<string, string>();
  const includedPhones = new Set<string>();
  const includedText = await readOptional(path.join(DATA_DIR, INCLUDE_FILE));
  for (const r of includedText ? parseCsv(includedText) : []) {
    const phone = normalizePhone(r.telefono || '');
    if (phone.length < 8) continue;
    includedPhones.add(phone);
    if (r.nombre) includedByName.set(r.nombre.trim(), phone);
  }
  for (const s of sources)
    for (const m of s.members) {
      if (!m.phone && includedByName.has(m.name.trim())) m.phone = includedByName.get(m.name.trim())!;
    }

  // Admins de cualquier grupo y exclusiones manuales quedan fuera
  const adminPhones = new Set<string>();
  // Los admins guardados como contacto no muestran número: se reconocen por su nombre en otros grupos
  const adminNames = new Set<string>();
  for (const s of sources)
    for (const m of s.members) {
      if (!m.admin) continue;
      if (m.phone) adminPhones.add(m.phone);
      else adminNames.add(m.name.trim());
    }
  const manual = new Set<string>();
  const manualText = await readOptional(path.join(DATA_DIR, EXCLUDE_FILE));
  for (const line of manualText?.split(/\r?\n/) ?? []) {
    const p = normalizePhone(line.split('#')[0]);
    if (p.length >= 7) manual.add(p.startsWith('+') ? p : `+${p}`);
  }

  const statusOf = (m: Member): Status => {
    if (m.phone && includedPhones.has(m.phone)) return 'participa';
    if (!m.phone) return m.admin || adminNames.has(m.name.trim()) ? 'admin' : 'sin-numero';
    if (m.admin || adminPhones.has(m.phone)) return 'admin';
    if (manual.has(m.phone)) return 'excluido';
    return 'participa';
  };

  // Participantes = unión de todas las listas (cada número cuenta una sola vez)
  const byPhone = new Map<string, { id: string; name: string; phone: string; groups: string[] }>();
  for (const s of sources) {
    for (const m of s.members) {
      if (statusOf(m) !== 'participa') continue;
      const existing = byPhone.get(m.phone);
      if (existing) {
        if (!existing.groups.includes(s.label)) existing.groups.push(s.label);
        if (!existing.name) existing.name = cleanName(m.name);
      } else {
        byPhone.set(m.phone, { id: m.phone, name: cleanName(m.name), phone: m.phone, groups: [s.label] });
      }
    }
  }
  const aboutText = await readOptional(path.join(DATA_DIR, ABOUT_FILE));
  const about = new Map<string, string>();
  for (const r of aboutText ? parseCsv(aboutText) : []) {
    const p = normalizePhone(r.telefono || '');
    const d = (r.descripcion || '').replace(/\s+/g, ' ').trim().slice(0, 80);
    if (p && d) about.set(p, d);
  }
  const participants = [...byPhone.values()].map((p) => (about.has(p.id) ? { ...p, about: about.get(p.id) } : p));

  // Prueba por grupo: cada miembro con su estado (los que no tienen número van solo con nombre)
  const groups = sources.map((s) => {
    const members = s.members.map((m) => ({
      name: cleanName(m.name) || m.name.replace(/^~\s?/, '').trim(),
      id: m.phone || null,
      status: statusOf(m),
    }));
    const count = (st: Status) => members.filter((m) => m.status === st).length;
    return {
      label: s.label,
      takenAt: s.takenAt,
      total: members.length,
      participa: count('participa'),
      admins: count('admin'),
      sinNumero: count('sin-numero'),
      excluidos: count('excluido'),
      members,
    };
  });

  const excluded = groups
    .flatMap((g) => g.members.filter((m) => m.status !== 'participa').map((m) => ({ name: m.name, status: m.status })))
    .filter((m, i, a) => a.findIndex((x) => x.name === m.name && x.status === m.status) === i);

  // Pueden votar todos los miembros con número (aunque no participen del sorteo, p. ej. admins)
  const memberPhones = new Set<string>(includedPhones);
  for (const s of sources) for (const m of s.members) if (m.phone) memberPhones.add(m.phone);

  return {
    participants,
    groups,
    excluded,
    memberPhones,
    stats: {
      total: participants.length,
      withoutPhone: excluded.filter((e) => e.status === 'sin-numero').length,
      excluded: excluded.filter((e) => e.status !== 'sin-numero').length,
    },
  };
}
