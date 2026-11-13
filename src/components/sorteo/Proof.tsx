'use client';

import React, { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle2, Fingerprint, Search, ShieldCheck, UserX, X } from 'lucide-react';
import { GroupProof, Participant, displayName, shownPhone, whoIs } from './lib';

type Props = {
  groups: GroupProof[];
  byId: Map<string, Participant>;
  total: number;
  hash: string | null;
  reveal: boolean;
  onClose: () => void;
};

const STATUS: Record<GroupProof['members'][number]['status'], { label: string; cls: string }> = {
  participa: { label: 'Participa', cls: 'bg-[#10B981]/15 text-[#34d399]' },
  admin: { label: 'Admin', cls: 'bg-zinc-500/15 text-zinc-400' },
  'sin-numero': { label: 'Sin número visible', cls: 'bg-zinc-500/15 text-zinc-400' },
  excluido: { label: 'Excluido', cls: 'bg-red-500/15 text-red-300' },
};

const fmtDate = (iso: string) =>
  new Date(iso).toLocaleString('es-BO', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });

export default function Proof({ groups, byId, total, hash, reveal, onClose }: Props) {
  const [tab, setTab] = useState(0);
  const [q, setQ] = useState('');

  const query = q.trim().toLowerCase();
  const digits = query.replace(/\D/g, '');

  // Búsqueda global: cualquiera puede comprobar que está dentro (por nombre o últimos dígitos)
  const results = useMemo(() => {
    if (query.length < 2) return [];
    return [...byId.values()]
      .filter(
        (p) =>
          (digits.length >= 3 && p.phone.endsWith(digits)) ||
          (p.name && p.name.toLowerCase().includes(query)) ||
          (p.about && p.about.toLowerCase().includes(query)),
      )
      .slice(0, 30);
  }, [byId, query, digits]);

  const group = groups[tab];
  const members = useMemo(() => {
    if (!group) return [];
    if (query.length < 2) return group.members;
    return group.members.filter(
      (m) => (digits.length >= 3 && m.id?.endsWith(digits)) || m.name.toLowerCase().includes(query),
    );
  }, [group, query, digits]);

  const takenAt = groups.map((g) => g.takenAt).sort().at(-1);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-40 overflow-y-auto bg-[#07070c]/95 backdrop-blur-sm"
    >
      <div className="mx-auto max-w-6xl px-4 py-6 sm:px-8">
        <div className="mb-6 flex items-start justify-between gap-4">
          <div>
            <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.3em] font-roca text-[#10B981]">
              <ShieldCheck className="h-4 w-4" /> Pruebas de participación
            </p>
            <h2 className="font-heading text-3xl font-black text-white sm:text-4xl">Todos los grupos de la comunidad están dentro</h2>
            {takenAt && <p className="mt-1 text-sm text-zinc-400">Listas tomadas de WhatsApp el {fmtDate(takenAt)}</p>}
          </div>
          <button
            onClick={onClose}
            aria-label="Cerrar"
            className="rounded-xl border border-[#2a2a3e] bg-white/5 p-2.5 text-zinc-300 hover:text-white"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Resumen por grupo */}
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
          {groups.map((g, i) => {
            const withPhone = g.total - g.sinNumero;
            const allIn = g.participa + g.admins + g.excluidos === withPhone;
            return (
              <button
                key={g.label}
                onClick={() => setTab(i)}
                className={`rounded-2xl border p-4 text-left transition ${
                  i === tab ? 'border-[#ef1b77] bg-[#ef1b77]/10' : 'border-[#2a2a3e] bg-white/[0.03] hover:bg-white/[0.06]'
                }`}
              >
                <div className="truncate text-sm font-black text-white">{g.label}</div>
                <div className="mt-2 flex items-baseline gap-1">
                  <span className="font-heading text-3xl font-black tabular-nums text-white">{g.participa.toLocaleString('es')}</span>
                  <span className="text-xs text-zinc-500">/ {g.total.toLocaleString('es')} miembros</span>
                </div>
                <div className="mt-1 text-[11px] text-zinc-500">
                  {g.admins > 0 && <>{g.admins} admins · </>}
                  {g.sinNumero > 0 && <>{g.sinNumero} sin número · </>}
                  {g.excluidos > 0 && <>{g.excluidos} excluidos · </>}
                  actualizado {fmtDate(g.takenAt)}
                </div>
                {allIn && (
                  <div className="mt-2 flex items-center gap-1 text-[11px] font-bold text-[#34d399]">
                    <CheckCircle2 className="h-3.5 w-3.5" /> Todos los miembros con número participan
                  </div>
                )}
              </button>
            );
          })}
        </div>

        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <div className="rounded-2xl border border-[#2a2a3e] bg-white/[0.03] p-4">
            <div className="text-[11px] font-bold uppercase tracking-wider text-zinc-500">Participantes únicos</div>
            <div className="font-heading text-3xl font-black text-white">{total.toLocaleString('es')}</div>
            <div className="text-xs text-zinc-500">Quien está en varios grupos cuenta una sola vez: misma chance para todos</div>
          </div>
          <div className="rounded-2xl border border-[#2a2a3e] bg-white/[0.03] p-4">
            <div className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-zinc-500">
              <Fingerprint className="h-3.5 w-3.5" /> Huella de la lista (SHA-256)
            </div>
            <div className="mt-1 break-all font-mono text-xs text-[#ff9343]">{hash ?? 'calculando…'}</div>
            <div className="mt-1 text-xs text-zinc-500">Se fija al comenzar el sorteo. Si la lista cambiara, la huella sería otra.</div>
          </div>
        </div>

        {/* Buscador */}
        <div className="relative mt-6">
          <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-zinc-500" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Busca tu número (últimos dígitos), tu nombre o tu descripción de WhatsApp"
            className="w-full rounded-2xl border border-[#2a2a3e] bg-black/40 py-4 pl-12 pr-4 text-base text-white outline-none placeholder:text-zinc-600 focus:border-[#ef1b77]"
          />
        </div>

        {query.length >= 2 && (
          <div className="mt-3 rounded-2xl border border-[#2a2a3e] bg-white/[0.03] p-3">
            {results.length === 0 ? (
              <p className="flex items-center gap-2 px-2 py-1 text-sm text-zinc-400">
                <UserX className="h-4 w-4" /> No hay participantes que coincidan
              </p>
            ) : (
              <div className="grid gap-2 sm:grid-cols-2">
                {results.map((p) => (
                  <div key={p.id} className="flex items-center justify-between gap-3 rounded-xl bg-[#10B981]/10 px-3 py-2">
                    <div className="min-w-0">
                      <div className="truncate text-sm font-bold text-white">{displayName(p)}</div>
                      <div className="font-mono text-[11px] text-zinc-400">{shownPhone(p, reveal)}</div>
                      {whoIs(p) && <div className="truncate text-[11px] text-zinc-300">{whoIs(p)}</div>}
                      <div className="mt-0.5 truncate text-[10px] text-zinc-500">{p.groups?.join(' · ')}</div>
                    </div>
                    <span className="flex shrink-0 items-center gap-1 text-xs font-bold text-[#34d399]">
                      <CheckCircle2 className="h-4 w-4" /> En el sorteo
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Lista completa del grupo seleccionado */}
        {group && (
          <div className="mt-6">
            <div className="mb-2 flex items-center justify-between">
              <h3 className="font-heading text-lg font-black text-white">{group.label}</h3>
              <span className="text-xs text-zinc-500">{members.length.toLocaleString('es')} mostrados</span>
            </div>
            <div className="grid gap-1.5 sm:grid-cols-2 lg:grid-cols-3">
              {members.map((m, i) => {
                const p = m.id ? byId.get(m.id) : undefined;
                const st = STATUS[m.status];
                return (
                  <div key={`${m.id ?? m.name}-${i}`} className="flex items-center justify-between gap-2 rounded-lg border border-[#2a2a3e] bg-white/[0.02] px-3 py-1.5">
                    <div className="min-w-0">
                      <div className="truncate text-xs font-bold text-white">{p ? displayName(p) : m.name || '—'}</div>
                      {m.id && <div className="font-mono text-[10px] text-zinc-500">{p ? shownPhone(p, reveal) : '—'}</div>}
                      {p && whoIs(p) && <div className="truncate text-[10px] text-zinc-400">{whoIs(p)}</div>}
                    </div>
                    <span className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold ${st.cls}`}>{st.label}</span>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
}
