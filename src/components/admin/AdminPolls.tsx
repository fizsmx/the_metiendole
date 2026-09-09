'use client';

import React, { useState } from 'react';
import { useCommunityStore } from '@/stores/useCommunityStore';
import { Plus, Trash2 } from 'lucide-react';

export default function AdminPolls() {
  const { polls, createPoll, deletePoll, togglePollStatus } = useCommunityStore();

  const [question, setQuestion] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('STREAM');
  const [options, setOptions] = useState(['', '', '']);
  const [createdToast, setCreatedToast] = useState(false);

  const handleOptionChange = (index: number, val: string) => {
    const updated = [...options];
    updated[index] = val;
    setOptions(updated);
  };

  const addOptionField = () => {
    if (options.length < 6) {
      setOptions([...options, '']);
    }
  };

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    const validOptions = options.filter((o) => o.trim().length > 0);
    if (!question.trim() || validOptions.length < 2) return;

    createPoll({
      question,
      description,
      category,
      options: validOptions,
    });

    setQuestion('');
    setDescription('');
    setOptions(['', '', '']);
    setCreatedToast(true);
    setTimeout(() => setCreatedToast(false), 3000);
  };

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-black text-white">Votaciones & Encuestas del Podcast</h2>
        <p className="text-xs text-zinc-400 mt-1">
          Lanza preguntas para que el chat decida los temas, juegos o comidas del próximo directo.
        </p>
      </div>

      {/* Poll Creator */}
      <form
        onSubmit={handleCreate}
        className="bg-[#12121c] border border-white/[0.08] rounded-3xl p-6 shadow-xl space-y-4"
      >
        <h3 className="text-sm font-black text-white uppercase tracking-wider flex items-center gap-2">
          <Plus className="w-4 h-4 text-[#F5A623]" /> Lanzar Nueva Encuesta
        </h3>

        <div className="space-y-3">
          <div>
            <label className="text-xs font-bold text-zinc-300 block mb-1">Pregunta / Tema *</label>
            <input
              type="text"
              required
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder="Ej: ¿Qué invitado traemos este viernes al Podcast?"
              className="w-full bg-black/40 border border-white/[0.08] rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-[#F5A623]"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-zinc-300 block mb-1">Categoría</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full bg-black/40 border border-white/[0.08] rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-[#F5A623]"
            >
              <option value="STREAM">STREAM & PODCAST</option>
              <option value="COMUNIDAD">COMUNIDAD</option>
              <option value="JUEGOS">JUEGOS</option>
              <option value="ESPECIAL">ESPECIAL</option>
            </select>
          </div>

          <div>
            <label className="text-xs font-bold text-zinc-300 block mb-1">Opciones de Votación (Mínimo 2) *</label>
            <div className="space-y-2">
              {options.map((opt, idx) => (
                <input
                  key={idx}
                  type="text"
                  value={opt}
                  onChange={(e) => handleOptionChange(idx, e.target.value)}
                  placeholder={`Opción ${idx + 1}`}
                  className="w-full bg-black/40 border border-white/[0.08] rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-[#F5A623]"
                />
              ))}
            </div>
            {options.length < 6 && (
              <button
                type="button"
                onClick={addOptionField}
                className="mt-2 text-xs font-bold text-[#F5A623] hover:underline"
              >
                + Agregar otra opción
              </button>
            )}
          </div>
        </div>

        <div className="flex items-center justify-between pt-2">
          {createdToast && (
            <span className="text-xs font-black text-emerald-400">¡Encuesta creada con éxito! 🗳️</span>
          )}
          <button
            type="submit"
            className="ml-auto px-5 py-2.5 rounded-xl font-black text-xs text-white bg-gradient-to-r from-[#E91E8C] to-[#F5A623] hover:scale-105 transition-all shadow-lg"
          >
            Publicar Encuesta
          </button>
        </div>
      </form>

      {/* Existing Polls */}
      <div className="space-y-4">
        <h3 className="text-sm font-black text-white uppercase tracking-wider">
          Encuestas Activas ({polls.length})
        </h3>

        <div className="space-y-4">
          {polls.map((poll) => (
            <div
              key={poll.id}
              className="bg-[#12121c] border border-white/[0.08] rounded-2xl p-5 space-y-3"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-black px-2 py-0.5 rounded bg-white/[0.06] text-[#F5A623]">
                    {poll.category}
                  </span>
                  <span className="text-xs text-zinc-400 font-semibold">
                    {poll.totalVotes} votos registrados
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => togglePollStatus(poll.id)}
                    className={`text-xs font-bold px-2.5 py-1 rounded-lg border ${
                      poll.active
                        ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-400'
                        : 'border-zinc-700 bg-zinc-800 text-zinc-400'
                    }`}
                  >
                    {poll.active ? 'Activa' : 'Pausada'}
                  </button>
                  <button
                    onClick={() => deletePoll(poll.id)}
                    className="p-1.5 rounded-lg text-zinc-500 hover:text-red-400 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <h4 className="text-sm font-bold text-white">{poll.question}</h4>

              {/* Options breakdown */}
              <div className="space-y-1.5 pt-1">
                {poll.options.map((opt) => (
                  <div key={opt.id} className="text-xs flex items-center justify-between text-zinc-300">
                    <span>{opt.text}</span>
                    <span className="font-bold text-amber-400">{opt.percentage}% ({opt.votesCount})</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}