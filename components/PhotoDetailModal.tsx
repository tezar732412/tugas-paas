'use client';

import React, { useState, useEffect } from 'react';
import { X, Heart, MessageCircle, Send, Trash2, Shield, Calendar, Tag, User } from 'lucide-react';
import { Post, UserProfile, Comment } from '../lib/types';
import { fetchComments, addComment, deleteComment } from '../lib/store';

interface PhotoDetailModalProps {
  post: Post | null;
  onClose: () => void;
  currentUser: UserProfile;
  onLikeToggle: (postId: string) => void;
  onDeletePost: (postId: string) => void;
}

export default function PhotoDetailModal({
  post,
  onClose,
  currentUser,
  onLikeToggle,
  onDeletePost,
}: PhotoDetailModalProps) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [loadingComments, setLoadingComments] = useState(false);
  const [submittingComment, setSubmittingComment] = useState(false);

  useEffect(() => {
    if (post) {
      loadComments(post.id);
    }
  }, [post]);

  const loadComments = async (postId: string) => {
    setLoadingComments(true);
    const data = await fetchComments(postId);
    setComments(data);
    setLoadingComments(false);
  };

  if (!post) return null;

  const isOwner = currentUser.id === post.user_id;
  const isAdmin = currentUser.role === 'admin';

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    try {
      setSubmittingComment(true);
      const created = await addComment(post.id, currentUser.id, newComment.trim());
      setComments((prev) => [...prev, created]);
      setNewComment('');
    } catch (e) {
      console.error(e);
    } finally {
      setSubmittingComment(false);
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    await deleteComment(post.id, commentId);
    setComments((prev) => prev.filter((c) => c.id !== commentId));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-lg animate-fade-in">
      <div className="glass-panel w-full max-w-5xl rounded-3xl border border-white/15 overflow-hidden shadow-2xl animate-slide-up flex flex-col md:flex-row max-h-[92vh]">
        {/* Left Side: Photo View */}
        <div className="relative md:w-3/5 bg-black flex items-center justify-center min-h-[300px] md:min-h-[550px] group overflow-hidden">
          <img
            src={post.image_url}
            alt={post.title}
            className="w-full h-full object-contain max-h-[85vh]"
          />
          <button
            onClick={onClose}
            className="md:hidden absolute top-4 right-4 p-2 rounded-full bg-slate-900/80 text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Right Side: Details & Comments */}
        <div className="flex-1 flex flex-col justify-between p-6 bg-slate-900/80 backdrop-blur-md overflow-hidden">
          {/* Top Bar */}
          <div>
            <div className="flex items-center justify-between pb-4 border-b border-white/10">
              <div className="flex items-center gap-3">
                <img
                  src={post.author?.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100'}
                  alt={post.author?.username}
                  className="w-10 h-10 rounded-xl object-cover ring-2 ring-indigo-500/40"
                />
                <div>
                  <h4 className="text-sm font-bold text-slate-100 flex items-center gap-1.5">
                    {post.author?.full_name || 'User'}
                    {post.author?.role === 'admin' && (
                      <Shield className="w-3.5 h-3.5 text-purple-400" />
                    )}
                  </h4>
                  <p className="text-xs text-slate-400">@{post.author?.username || 'user'}</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {(isOwner || isAdmin) && (
                  <button
                    onClick={() => {
                      if (confirm('Hapus foto ini?')) {
                        onDeletePost(post.id);
                        onClose();
                      }
                    }}
                    className="p-2 rounded-xl text-rose-400 hover:bg-rose-500/10 transition-colors"
                    title="Hapus Post"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
                <button
                  onClick={onClose}
                  className="hidden md:flex p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Post Information */}
            <div className="py-4 border-b border-white/10 space-y-2">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                  {post.category}
                </span>
                <span className="text-xs text-slate-400 flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  {new Date(post.created_at).toLocaleDateString('id-ID', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric',
                  })}
                </span>
              </div>
              <h2 className="text-lg font-bold text-slate-100">{post.title}</h2>
              {post.description && (
                <p className="text-xs text-slate-300 leading-relaxed">{post.description}</p>
              )}

              {/* Likes & Comments Quick Summary */}
              <div className="flex items-center gap-4 pt-2">
                <button
                  onClick={() => onLikeToggle(post.id)}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
                    post.is_liked
                      ? 'bg-rose-500/20 text-rose-400 border-rose-500/30'
                      : 'bg-slate-800/80 text-slate-400 border-white/10 hover:text-rose-400'
                  }`}
                >
                  <Heart
                    className={`w-4 h-4 ${post.is_liked ? 'fill-rose-500 text-rose-500' : ''}`}
                  />
                  <span>{post.likes_count} Menyukai</span>
                </button>

                <span className="text-xs text-slate-400 flex items-center gap-1">
                  <MessageCircle className="w-4 h-4 text-indigo-400" />
                  <span>{comments.length} Komentar</span>
                </span>
              </div>
            </div>
          </div>

          {/* Comments List */}
          <div className="flex-1 overflow-y-auto py-3 space-y-3 pr-1 my-2">
            {loadingComments ? (
              <div className="text-center py-6 text-xs text-slate-400">
                Memuat komentar...
              </div>
            ) : comments.length === 0 ? (
              <div className="text-center py-6 text-xs text-slate-500">
                Belum ada komentar. Jadilah yang pertama berkomentar!
              </div>
            ) : (
              comments.map((c) => {
                const canDelete = currentUser.id === c.user_id || isAdmin;
                return (
                  <div
                    key={c.id}
                    className="flex items-start justify-between gap-3 p-2.5 rounded-2xl bg-slate-950/40 border border-white/5 hover:border-white/10 transition-colors"
                  >
                    <div className="flex items-start gap-2.5 min-w-0">
                      <img
                        src={c.author?.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100'}
                        alt={c.author?.username}
                        className="w-7 h-7 rounded-lg object-cover flex-shrink-0"
                      />
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-semibold text-slate-200">
                            {c.author?.full_name || 'User'}
                          </span>
                          <span className="text-[10px] text-slate-500">
                            {new Date(c.created_at).toLocaleTimeString('id-ID', {
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </span>
                        </div>
                        <p className="text-xs text-slate-300 mt-0.5 break-words">{c.content}</p>
                      </div>
                    </div>
                    {canDelete && (
                      <button
                        onClick={() => handleDeleteComment(c.id)}
                        className="p-1 text-slate-500 hover:text-rose-400 transition-colors flex-shrink-0"
                        title="Hapus Komentar"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                );
              })
            )}
          </div>

          {/* Comment Form */}
          <form onSubmit={handleAddComment} className="pt-3 border-t border-white/10 flex gap-2">
            <input
              type="text"
              placeholder="Tulis komentar kamu..."
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              className="flex-1 px-4 py-2.5 text-xs rounded-xl glass-input"
            />
            <button
              type="submit"
              disabled={submittingComment || !newComment.trim()}
              className="p-2.5 rounded-xl btn-gradient text-white disabled:opacity-50 flex items-center justify-center cursor-pointer"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
