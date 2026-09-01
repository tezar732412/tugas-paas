'use client';

import React, { useState, useEffect } from 'react';
import { X, Heart, MessageCircle, Send, Trash2, Shield, Calendar, LogIn } from 'lucide-react';
import { Post, UserProfile, Comment } from '../lib/types';
import { fetchComments, addComment, deleteComment } from '../lib/store';

interface PhotoDetailModalProps {
  post: Post | null;
  onClose: () => void;
  currentUser: UserProfile | null;
  onOpenLoginModal?: () => void;
  onLikeToggle: (postId: string) => void;
  onDeletePost: (postId: string) => void;
}

export default function PhotoDetailModal({
  post,
  onClose,
  currentUser,
  onOpenLoginModal,
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

  const isOwner = currentUser?.id === post.user_id;
  const isAdmin = currentUser?.role === 'admin';

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    if (!currentUser) {
      onOpenLoginModal?.();
      return;
    }

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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md animate-fade-in">
      <div className="glass-card w-full max-w-5xl rounded-3xl border border-slate-200 shadow-2xl animate-slide-up flex flex-col md:flex-row max-h-[92vh] bg-white overflow-hidden">
        {/* Left Side: Photo View */}
        <div className="relative md:w-3/5 bg-slate-950 flex items-center justify-center min-h-[300px] md:min-h-[550px] group overflow-hidden">
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
        <div className="flex-1 flex flex-col justify-between p-6 bg-white overflow-hidden">
          {/* Top Bar */}
          <div>
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <img
                  src={post.author?.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100'}
                  alt={post.author?.username}
                  className="w-10 h-10 rounded-xl object-cover ring-2 ring-indigo-500/30"
                />
                <div>
                  <h4 className="text-sm font-extrabold text-slate-900 flex items-center gap-1.5">
                    {post.author?.full_name || 'User'}
                    {post.author?.role === 'admin' && (
                      <Shield className="w-3.5 h-3.5 text-purple-600" />
                    )}
                  </h4>
                  <p className="text-xs text-slate-500 font-semibold">@{post.author?.username || 'user'}</p>
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
                    className="p-2 rounded-xl text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                    title="Hapus Post"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
                <button
                  onClick={onClose}
                  className="hidden md:flex p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Post Information */}
            <div className="py-4 border-b border-slate-100 space-y-2">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200">
                  {post.category}
                </span>
                <span className="text-xs text-slate-500 flex items-center gap-1 font-semibold">
                  <Calendar className="w-3 h-3 text-slate-400" />
                  {new Date(post.created_at).toLocaleDateString('id-ID', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric',
                  })}
                </span>
              </div>
              <h2 className="text-lg font-extrabold text-slate-900">{post.title}</h2>
              {post.description && (
                <p className="text-xs text-slate-600 leading-relaxed font-medium">{post.description}</p>
              )}

              {/* Likes & Comments Summary */}
              <div className="flex items-center gap-4 pt-2">
                <button
                  onClick={() => onLikeToggle(post.id)}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                    post.is_liked
                      ? 'bg-rose-50 text-rose-600 border-rose-200'
                      : 'bg-slate-50 text-slate-600 border-slate-200 hover:text-rose-600'
                  }`}
                >
                  <Heart
                    className={`w-4 h-4 ${post.is_liked ? 'fill-rose-500 text-rose-500' : ''}`}
                  />
                  <span>{post.likes_count} Menyukai</span>
                </button>

                <span className="text-xs text-slate-500 font-bold flex items-center gap-1">
                  <MessageCircle className="w-4 h-4 text-indigo-600" />
                  <span>{comments.length} Komentar</span>
                </span>
              </div>
            </div>
          </div>

          {/* Comments List */}
          <div className="flex-1 overflow-y-auto py-3 space-y-3 pr-1 my-2">
            {loadingComments ? (
              <div className="text-center py-6 text-xs text-slate-500 font-semibold">
                Memuat komentar...
              </div>
            ) : comments.length === 0 ? (
              <div className="text-center py-6 text-xs text-slate-400 font-medium">
                Belum ada komentar. Jadilah yang pertama berkomentar!
              </div>
            ) : (
              comments.map((c) => {
                const canDelete = currentUser?.id === c.user_id || isAdmin;
                return (
                  <div
                    key={c.id}
                    className="flex items-start justify-between gap-3 p-2.5 rounded-2xl bg-slate-50 border border-slate-200/80 hover:border-slate-300 transition-colors"
                  >
                    <div className="flex items-start gap-2.5 min-w-0">
                      <img
                        src={c.author?.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100'}
                        alt={c.author?.username}
                        className="w-7 h-7 rounded-lg object-cover flex-shrink-0"
                      />
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-slate-900">
                            {c.author?.full_name || 'User'}
                          </span>
                          <span className="text-[10px] text-slate-400 font-semibold">
                            {new Date(c.created_at).toLocaleTimeString('id-ID', {
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </span>
                        </div>
                        <p className="text-xs text-slate-700 font-medium mt-0.5 break-words">{c.content}</p>
                      </div>
                    </div>
                    {canDelete && (
                      <button
                        onClick={() => handleDeleteComment(c.id)}
                        className="p-1 text-slate-400 hover:text-rose-600 transition-colors flex-shrink-0 cursor-pointer"
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
          {currentUser ? (
            <form onSubmit={handleAddComment} className="pt-3 border-t border-slate-100 flex gap-2">
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
                className="p-2.5 rounded-xl btn-primary text-white disabled:opacity-50 flex items-center justify-center cursor-pointer"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          ) : (
            <div className="pt-3 border-t border-slate-100 flex items-center justify-between p-2 rounded-xl bg-slate-50 border border-slate-200">
              <span className="text-xs text-slate-500 font-medium">Ingin menulis komentar?</span>
              <button
                onClick={onOpenLoginModal}
                className="px-3 py-1.5 rounded-lg text-xs font-bold text-white btn-primary flex items-center gap-1 cursor-pointer"
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>Masuk</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
