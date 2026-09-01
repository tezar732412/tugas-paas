'use client';

import React from 'react';
import { Heart, MessageCircle, Edit3, Trash2, Shield, Sparkles } from 'lucide-react';
import { Post, UserProfile } from '../lib/types';

interface PhotoCardProps {
  post: Post;
  currentUser: UserProfile;
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
  const isOwner = currentUser.id === post.user_id;
  const isAdmin = currentUser.role === 'admin';
  const canModify = isOwner || isAdmin;

  return (
    <div className="group glass-panel rounded-3xl overflow-hidden glass-panel-hover flex flex-col justify-between border border-white/10 relative">
      {/* Featured Badge */}
      {post.is_featured && (
        <div className="absolute top-3 left-3 z-10 flex items-center gap-1.5 px-3 py-1 rounded-full bg-gradient-to-r from-amber-500 to-pink-500 text-white text-[11px] font-bold shadow-lg shadow-amber-500/30">
          <Sparkles className="w-3 h-3" />
          <span>Featured</span>
        </div>
      )}

      {/* Image Container */}
      <div
        className="relative w-full aspect-[4/3] sm:aspect-[16/11] overflow-hidden cursor-pointer bg-slate-900"
        onClick={() => onSelectPost(post)}
      >
        <img
          src={post.image_url}
          alt={post.title}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-4">
          <p className="text-xs text-slate-200 line-clamp-2">{post.description}</p>
        </div>
      </div>

      {/* Card Content */}
      <div className="p-4 flex flex-col gap-3">
        {/* Category & Title */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-indigo-500/15 text-indigo-300 border border-indigo-500/25">
              {post.category}
            </span>
            <span className="text-[11px] text-slate-400">
              {new Date(post.created_at).toLocaleDateString('id-ID', {
                month: 'short',
                day: 'numeric',
              })}
            </span>
          </div>
          <h3
            onClick={() => onSelectPost(post)}
            className="text-base font-bold text-slate-100 truncate hover:text-indigo-400 transition-colors cursor-pointer"
          >
            {post.title}
          </h3>
        </div>

        {/* Author info & Actions */}
        <div className="flex items-center justify-between pt-2 border-t border-white/10">
          <div className="flex items-center gap-2 min-w-0">
            <img
              src={post.author?.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100'}
              alt={post.author?.username || 'User'}
              className="w-7 h-7 rounded-full object-cover ring-1 ring-white/20 flex-shrink-0"
            />
            <span className="text-xs text-slate-300 truncate font-medium">
              {post.author?.full_name || 'User'}
            </span>
          </div>

          <div className="flex items-center gap-3 flex-shrink-0">
            {/* Like button */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                onLikeToggle(post.id);
              }}
              className={`flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-xl transition-all ${
                post.is_liked
                  ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                  : 'text-slate-400 hover:text-rose-400 hover:bg-white/5'
              }`}
            >
              <Heart
                className={`w-4 h-4 ${post.is_liked ? 'fill-rose-500 text-rose-500' : ''}`}
              />
              <span>{post.likes_count}</span>
            </button>

            {/* Comments button */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                onSelectPost(post);
              }}
              className="flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-indigo-400 transition-colors"
            >
              <MessageCircle className="w-4 h-4" />
              <span>{post.comments_count}</span>
            </button>

            {/* Edit / Delete for Owner / Admin */}
            {canModify && (
              <div className="flex items-center gap-1 ml-1 border-l border-white/10 pl-2">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onEditPost(post);
                  }}
                  className="p-1 rounded-lg text-slate-400 hover:text-indigo-400 hover:bg-white/10 transition-colors"
                  title="Edit Postingan"
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
                  className="p-1 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-white/10 transition-colors"
                  title={isAdmin && !isOwner ? 'Hapus sebagai Admin' : 'Hapus Postingan'}
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
