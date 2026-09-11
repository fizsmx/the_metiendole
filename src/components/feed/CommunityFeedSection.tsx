'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { useSession } from 'next-auth/react';
import { useCommunityStore } from '@/stores/useCommunityStore';
import {
  MessageSquare,
  Send,
  Pin,
  MessageCircle,
} from 'lucide-react';

export default function CommunityFeedSection() {
  const { data: session } = useSession();
  const { posts, createPost, addComment, toggleReaction, setIsAuthModalOpen } = useCommunityStore();
  const [newPostContent, setNewPostContent] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<'GENERAL' | 'MEMES' | 'CLIPS' | 'DEBATE'>('GENERAL');
  const [activeCommentPostId, setActiveCommentPostId] = useState<string | null>(null);
  const [commentText, setCommentText] = useState('');

  const handleCreatePost = (e: React.FormEvent) => {
    e.preventDefault();
    if (!session) {
      setIsAuthModalOpen(true);
      return;
    }
    if (!newPostContent.trim()) return;
    createPost(newPostContent, selectedCategory);
    setNewPostContent('');
  };

  const handleAddComment = (postId: string) => {
    if (!session) {
      setIsAuthModalOpen(true);
      return;
    }
    if (!commentText.trim()) return;
    addComment(postId, commentText);
    setCommentText('');
  };

  return (
    <section className="py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        <div className="mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-[#E91E8C]/15 border border-[#E91E8C]/30 text-[#E91E8C] text-xs font-extrabold uppercase tracking-wider mb-2">
            <MessageSquare className="w-4 h-4" /> Muro Comunitario
          </div>
          <h2 className="text-3xl font-black text-white">
            El Feed de la Banda
          </h2>
          <p className="text-sm text-zinc-400 mt-1">
            Comparte tus memes, debates y teorías para el próximo episodio.
          </p>
        </div>

        {/* Create Post Box */}
        <form
          onSubmit={handleCreatePost}
          className="bg-[#12121c] border border-white/[0.08] rounded-3xl p-5 mb-8 shadow-xl space-y-4"
        >
          <textarea
            value={newPostContent}
            onChange={(e) => setNewPostContent(e.target.value)}
            placeholder="¿Qué estás pensando para el próximo directo? Escribe aquí..."
            className="w-full bg-black/40 border border-white/[0.08] rounded-2xl p-4 text-sm text-white placeholder:text-zinc-500 focus:outline-none focus:border-[#E91E8C] transition-colors resize-none h-24"
          />

          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-1.5">
              {(['GENERAL', 'MEMES', 'CLIPS', 'DEBATE'] as const).map((cat) => (
                <button
                  type="button"
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                    selectedCategory === cat
                      ? 'bg-gradient-to-r from-[#E91E8C] to-[#F5A623] text-white'
                      : 'bg-white/[0.04] text-zinc-400 hover:text-white'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            <button
              type="submit"
              disabled={!newPostContent.trim()}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-xs text-white bg-gradient-to-r from-[#E91E8C] to-[#F5A623] hover:scale-105 transition-all disabled:opacity-40 disabled:hover:scale-100"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Publicar (+15 Pts)</span>
            </button>
          </div>
        </form>

        {/* Posts List */}
        <div className="space-y-6">
          {posts.map((post) => (
            <div
              key={post.id}
              className={`bg-[#12121c] border rounded-3xl p-6 shadow-xl space-y-4 transition-all ${
                post.pinned
                  ? 'border-[#E91E8C]/40 bg-gradient-to-b from-[#1a1420] to-[#12121c]'
                  : 'border-white/[0.08]'
              }`}
            >
              {post.pinned && (
                <div className="flex items-center gap-1.5 text-xs font-black text-[#E91E8C] uppercase tracking-wider">
                  <Pin className="w-3.5 h-3.5 fill-[#E91E8C]" /> Publicación Fijada por el Host
                </div>
              )}

              {/* Author Header */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="relative w-10 h-10 rounded-xl overflow-hidden border border-white/[0.1]">
                    <Image src={post.userAvatar} alt={post.userName} fill sizes="40px" className="object-cover" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm text-white">{post.userName}</span>
                      <span className="text-[10px] font-extrabold px-1.5 py-0.2 rounded bg-white/[0.06] text-zinc-400">
                        {post.userRole}
                      </span>
                    </div>
                    <span className="text-xs text-zinc-500">@{post.userNickname} • {post.createdAt}</span>
                  </div>
                </div>

                <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-white/[0.04] text-[#F5A623]">
                  #{post.category}
                </span>
              </div>

              {/* Post Content */}
              <p className="text-sm text-zinc-200 leading-relaxed whitespace-pre-line">
                {post.content}
              </p>

              {/* Reaction Buttons */}
              <div className="flex items-center gap-2 pt-2 border-t border-white/[0.06]">
                {post.reactions.map((r) => (
                  <button
                    key={r.type}
                    onClick={() => toggleReaction(post.id, r.type)}
                    className={`flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-bold border transition-all ${
                      r.userReacted
                        ? 'border-[#E91E8C]/50 bg-[#E91E8C]/15 text-[#E91E8C]'
                        : 'border-white/[0.06] bg-white/[0.02] text-zinc-400 hover:text-white'
                    }`}
                  >
                    <span>
                      {r.type === 'FIRE' ? '🔥' : r.type === 'HEART' ? '❤️' : r.type === 'ROCKET' ? '🚀' : '💀'}
                    </span>
                    <span>{r.count}</span>
                  </button>
                ))}

                <button
                  onClick={() =>
                    setActiveCommentPostId(activeCommentPostId === post.id ? null : post.id)
                  }
                  className="ml-auto flex items-center gap-1.5 text-xs text-zinc-400 hover:text-white transition-colors"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>{post.comments.length} comentarios</span>
                </button>
              </div>

              {/* Comments Section */}
              {post.comments.length > 0 && (
                <div className="space-y-3 pt-3 border-t border-white/[0.06]">
                  {post.comments.map((comment) => (
                    <div key={comment.id} className="flex items-start gap-2.5 text-xs">
                      <div className="relative w-7 h-7 rounded-lg overflow-hidden shrink-0 border border-white/[0.1]">
                        <Image src={comment.userAvatar} alt={comment.userName} fill sizes="28px" className="object-cover" />
                      </div>
                      <div className="bg-white/[0.03] p-3 rounded-2xl flex-1 border border-white/[0.04]">
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-bold text-white">{comment.userName}</span>
                          <span className="text-[10px] text-zinc-500">{comment.createdAt}</span>
                        </div>
                        <p className="text-zinc-300">{comment.content}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Add Comment Input */}
              {activeCommentPostId === post.id && (
                <div className="flex items-center gap-2 pt-2">
                  <input
                    type="text"
                    value={commentText}
                    onChange={(e) => setCommentText(e.target.value)}
                    placeholder="Escribe una respuesta..."
                    className="flex-1 bg-black/40 border border-white/[0.08] rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#E91E8C]"
                  />
                  <button
                    onClick={() => handleAddComment(post.id)}
                    className="px-3 py-2 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-[#E91E8C] to-[#F5A623]"
                  >
                    Enviar
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}