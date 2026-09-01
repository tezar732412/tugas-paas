'use client';

import React, { useState } from 'react';
import { Post } from '../lib/types';
import { Search, Sparkles, Trash2, Edit3, Eye, ShieldAlert, Filter } from 'lucide-react';

interface AdminContentTableProps {
  posts: Post[];
  onDeletePost: (postId: string) => void;
  onToggleFeatured: (postId: string) => void;
  onSelectPost: (post: Post) => void;
  onEditPost: (post: Post) => void;
}

export default function AdminContentTable({
  posts,
  onDeletePost,
  onToggleFeatured,
  onSelectPost,
  onEditPost,
}: AdminContentTableProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  const categories = ['All', ...Array.from(new Set(posts.map((p) => p.category)))];

  const filteredPosts = posts.filter((p) => {
    const matchesSearch =
      p.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.author?.username.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCat = selectedCategory === 'All' || p.category === selectedCategory;
    return matchesSearch && matchesCat;
  });

  return (
    <div className="glass-panel rounded-3xl p-6 border border-white/10 space-y-4">
      {/* Table Header & Controls */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-base font-bold text-slate-100">Manajemen Konten & Moderasi Foto</h3>
          <p className="text-xs text-slate-400">Total {posts.length} foto terpublikasi di platform</p>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          {/* Search Input */}
          <div className="relative flex-1 sm:w-64">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Cari judul / penulis..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-xs rounded-xl glass-input"
            />
          </div>

          {/* Category Filter */}
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-3 py-2 text-xs rounded-xl glass-input bg-slate-900 text-slate-200 cursor-pointer"
          >
            {categories.map((c) => (
              <option key={c} value={c} className="bg-slate-900 text-slate-200">
                {c}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Table View */}
      <div className="overflow-x-auto rounded-2xl border border-white/10">
        <table className="w-full text-left text-xs text-slate-300">
          <thead className="bg-slate-900/80 text-slate-400 font-semibold border-b border-white/10 uppercase tracking-wider">
            <tr>
              <th className="py-3.5 px-4">Foto</th>
              <th className="py-3.5 px-4">Judul & Kategori</th>
              <th className="py-3.5 px-4">Penulis</th>
              <th className="py-3.5 px-4">Suka / Komen</th>
              <th className="py-3.5 px-4">Status</th>
              <th className="py-3.5 px-4 text-right">Aksi Moderasi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5 bg-slate-950/40">
            {filteredPosts.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-8 text-center text-slate-500">
                  Tidak ada data foto yang cocok.
                </td>
              </tr>
            ) : (
              filteredPosts.map((post) => (
                <tr key={post.id} className="hover:bg-white/5 transition-colors">
                  {/* Thumbnail */}
                  <td className="py-3 px-4">
                    <img
                      src={post.image_url}
                      alt={post.title}
                      className="w-12 h-12 rounded-xl object-cover ring-1 ring-white/10"
                    />
                  </td>

                  {/* Title & Category */}
                  <td className="py-3 px-4 max-w-xs">
                    <p className="font-bold text-slate-200 truncate">{post.title}</p>
                    <span className="inline-block mt-0.5 text-[10px] px-2 py-0.5 rounded-full bg-indigo-500/15 text-indigo-300 border border-indigo-500/20">
                      {post.category}
                    </span>
                  </td>

                  {/* Author */}
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2">
                      <img
                        src={post.author?.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100'}
                        alt={post.author?.username}
                        className="w-6 h-6 rounded-full object-cover"
                      />
                      <span className="font-medium text-slate-300 truncate">
                        {post.author?.full_name || 'User'}
                      </span>
                    </div>
                  </td>

                  {/* Likes / Comments */}
                  <td className="py-3 px-4">
                    <span className="text-slate-400">
                      ❤️ {post.likes_count} • 💬 {post.comments_count}
                    </span>
                  </td>

                  {/* Featured Status */}
                  <td className="py-3 px-4">
                    <button
                      onClick={() => onToggleFeatured(post.id)}
                      className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-all ${
                        post.is_featured
                          ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                          : 'bg-slate-800 text-slate-400 hover:text-white'
                      }`}
                    >
                      <Sparkles className="w-3 h-3" />
                      <span>{post.is_featured ? 'Featured' : 'Standard'}</span>
                    </button>
                  </td>

                  {/* Actions */}
                  <td className="py-3 px-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => onSelectPost(post)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-400 hover:bg-white/10"
                        title="Lihat Detail"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => onEditPost(post)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-amber-400 hover:bg-white/10"
                        title="Edit Post"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => {
                          if (confirm(`Yakin ingin menghapus foto "${post.title}"?`)) {
                            onDeletePost(post.id);
                          }
                        }}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-white/10"
                        title="Hapus Post"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
