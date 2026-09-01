'use client';

import React from 'react';
import { Heart, MessageCircle, Edit3, Trash2, Sparkles } from 'lucide-react';
import { Post, UserProfile } from '../lib/types';

interface PhotoCardProps {
  post: Post;
  currentUser: UserProfile | null;
  onLikeToggle: (postId: string) => void;
  onSelectPost: (post: Post) => void;
  onEditPost: (post: Post) => void;
  onDeletePost: (postId: string) => void;
}

export default function PhotoCard({
  post,
  currentUser,
  onLikeToggle,
  onSelectPost,
  onEditPost,
  onDeletePost,
}: PhotoCardProps) {
  const isOwner = currentUser?.id === post.user_id;
  const isAdmin = currentUser?.role === 'admin';
  const canModify = isOwner || isAdmin;

  return (
    <div className="group glass-card rounded-3xl overflow-hidden glass-card-interactive flex flex-col justify-between border border-slate-200/80 bg-white/90 relative">
      {/* Featured Badge */}
      {post.is_featured && (
        <div className="absolute top-3 left-3 z-10 flex items-center gap-1.5 px-3 py-1 rounded-full bg-gradient-to-r from-amber-500 to-rose-500 text-white text-[10px] font-bold shadow-md shadow-amber-500/20">
          <Sparkles className="w-3 h-3" />
          <span>Pilihan Admin</span>
        </div>
      )}

      {/* Image Preview */}
      <div
        className="relative w-full aspect-[4/3] overflow-hidden cursor-pointer bg-slate-100"
        onClick={() => onSelectPost(post)}
      >
        <img
          src={post.image_url}
          alt={post.title}
          className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-slate-900/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-4">
          <p className="text-xs text-white line-clamp-2 leading-relaxed">{post.description}</p>
        </div>
      </div>

      {/* Details */}
      <div className="p-4 flex flex-col gap-3">
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200">
              {post.category}
            </span>
            <span className="text-[11px] text-slate-500 font-semibold">
              {new Date(post.created_at).toLocaleDateString('id-ID', {
                month: 'short',
                day: 'numeric',
              })}
            </span>
          </div>

          <h3
            onClick={() => onSelectPost(post)}
            className="text-base font-extrabold text-slate-900 truncate hover:text-indigo-600 transition-colors cursor-pointer"
          >
            {post.title}
          </h3>
        </div>

        {/* Author & Action Strip */}
        <div className="flex items-center justify-between pt-2.5 border-t border-slate-100">
          <div className="flex items-center gap-2.5 min-w-0">
            <img
              src={post.author?.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100'}
              alt={post.author?.username || 'User'}
              className="w-7 h-7 rounded-full object-cover ring-1 ring-slate-200 flex-shrink-0"
            />
            <span className="text-xs text-slate-700 truncate font-bold">
              {post.author?.full_name || 'User'}
            </span>
          </div>

          <div className="flex items-center gap-2.5 flex-shrink-0">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onLikeToggle(post.id);
              }}
              className={`flex items-center gap-1.5 text-xs font-extrabold px-2.5 py-1 rounded-xl transition-all cursor-pointer ${
                post.is_liked
                  ? 'bg-rose-50 text-rose-600 border border-rose-200'
                  : 'text-slate-500 hover:text-rose-600 hover:bg-slate-50'
              }`}
            >
              <Heart
                className={`w-3.5 h-3.5 ${post.is_liked ? 'fill-rose-500 text-rose-500' : ''}`}
              />
              <span>{post.likes_count}</span>
            </button>

            <button
              onClick={(e) => {
                e.stopPropagation();
                onSelectPost(post);
              }}
              className="flex items-center gap-1.5 text-xs font-extrabold text-slate-500 hover:text-indigo-600 transition-colors cursor-pointer"
            >
              <MessageCircle className="w-3.5 h-3.5" />
              <span>{post.comments_count}</span>
            </button>

            {canModify && (
              <div className="flex items-center gap-1 border-l border-slate-200 pl-2">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onEditPost(post);
                  }}
                  className="p-1 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-slate-100 transition-colors"
                  title="Edit Post"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    if (confirm('Yakin ingin menghapus foto ini?')) {
                      onDeletePost(post.id);
                    }
                  }}
                  className="p-1 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-slate-100 transition-colors"
                  title="Hapus Post"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
