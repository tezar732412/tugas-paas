'use client';

import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import PhotoCard from '../components/PhotoCard';
import UploadModal from '../components/UploadModal';
import PhotoDetailModal from '../components/PhotoDetailModal';
import SupabaseGuideModal from '../components/SupabaseGuideModal';
import { Post, UserProfile } from '../lib/types';
import {
  fetchPosts,
  fetchUsers,
  createPost,
  updatePost,
  deletePost,
  toggleLikePost,
  DEMO_USERS,
} from '../lib/store';
import { Search, Sparkles, SlidersHorizontal, Image as ImageIcon, Flame, TrendingUp } from 'lucide-react';

const CATEGORIES = ['All', 'Photography', 'Nature', 'Urban', 'Architecture', 'Art', 'Travel', 'Tech'];

export default function HomePage() {
  const [allUsers, setAllUsers] = useState<UserProfile[]>(DEMO_USERS);
  const [currentUser, setCurrentUser] = useState<UserProfile>(DEMO_USERS[1]); // Default to Sarah (User)
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters & Search
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [sortBy, setSortBy] = useState<'latest' | 'popular'>('latest');

  // Modals
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [editingPost, setEditingPost] = useState<Post | null>(null);
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);
  const [isSupabaseModalOpen, setIsSupabaseModalOpen] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [fetchedPosts, fetchedUsers] = await Promise.all([
        fetchPosts(),
        fetchUsers(),
      ]);
      setPosts(fetchedPosts);
      setAllUsers(fetchedUsers);
      if (fetchedUsers.length > 0 && !allUsers.some(u => u.id === currentUser.id)) {
        setCurrentUser(fetchedUsers[0]);
      }
    } catch (err) {
      console.error('Data load error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleLikeToggle = async (postId: string) => {
    const res = await toggleLikePost(postId, currentUser.id);
    setPosts((prev) =>
      prev.map((p) =>
        p.id === postId
          ? { ...p, likes_count: res.likesCount, is_liked: res.isLiked }
          : p
      )
    );

    if (selectedPost && selectedPost.id === postId) {
      setSelectedPost((prev) =>
        prev ? { ...prev, likes_count: res.likesCount, is_liked: res.isLiked } : null
      );
    }
  };

  const handleSubmitPost = async (
    postData: { title: string; description: string; category: string; image_url: string },
    imageFile?: File | null
  ) => {
    if (editingPost) {
      const updated = await updatePost(editingPost.id, postData);
      if (updated) {
        setPosts((prev) => prev.map((p) => (p.id === updated.id ? updated : p)));
      }
      setEditingPost(null);
    } else {
      const created = await createPost(
        {
          ...postData,
          user_id: currentUser.id,
        },
        imageFile
      );
      setPosts((prev) => [created, ...prev]);
    }
  };

  const handleDeletePost = async (postId: string) => {
    await deletePost(postId);
    setPosts((prev) => prev.filter((p) => p.id !== postId));
  };

  // Filter & Sorting Logic
  const filteredPosts = posts
    .filter((post) => {
      const matchesCategory =
        selectedCategory === 'All' || post.category === selectedCategory;
      const matchesSearch =
        post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        post.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        post.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
        post.author?.username.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    })
    .sort((a, b) => {
      if (sortBy === 'popular') {
        return b.likes_count - a.likes_count;
      }
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    });

  return (
    <div className="min-h-screen flex flex-col pb-16">
      {/* Navigation */}
      <Navbar
        currentUser={currentUser}
        onSwitchUser={setCurrentUser}
        allUsers={allUsers}
        onOpenUpload={() => {
          setEditingPost(null);
          setIsUploadOpen(true);
        }}
        onOpenSupabaseModal={() => setIsSupabaseModalOpen(true)}
      />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-6 space-y-8">
        {/* Hero Banner */}
        <section className="relative overflow-hidden glass-panel rounded-3xl p-6 sm:p-10 border border-white/15 shadow-2xl">
          <div className="absolute top-0 right-0 -mt-12 -mr-12 w-96 h-96 bg-indigo-600/20 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-1/3 -mb-12 w-80 h-80 bg-pink-600/15 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 max-w-3xl space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 text-xs font-semibold">
              <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
              <span>Next.js 15 & Supabase Production-Ready</span>
            </div>

            <h1 className="text-3xl sm:text-5xl font-extrabold text-slate-100 tracking-tight leading-tight">
              Bagikan Karya Visual <span className="text-gradient">Tanpa Batas</span>
            </h1>

            <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
              Jelajahi galeri foto resolusi tinggi, unggah momen berharga kamu secara dinamis dengan Supabase Storage & Database, dan nikmati fitur sosial interaktif.
            </p>

            <div className="flex flex-wrap items-center gap-4 pt-2">
              <button
                onClick={() => {
                  setEditingPost(null);
                  setIsUploadOpen(true);
                }}
                className="px-6 py-3 rounded-2xl text-xs sm:text-sm font-bold text-white btn-gradient shadow-lg shadow-indigo-600/30 cursor-pointer"
              >
                + Unggah Foto Sekarang
              </button>

              <button
                onClick={() => setIsSupabaseModalOpen(true)}
                className="px-5 py-3 rounded-2xl text-xs sm:text-sm font-semibold text-slate-200 bg-slate-800/80 border border-white/10 hover:bg-slate-700/80 transition-all cursor-pointer"
              >
                ⚙️ Panduan Supabase & Vercel
              </button>
            </div>
          </div>
        </section>

        {/* Search & Filter Bar */}
        <section className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 glass-panel p-4 rounded-2xl border border-white/10">
          {/* Category Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-2 md:pb-0 scrollbar-none">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                  selectedCategory === cat
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Search & Sort Controls */}
          <div className="flex items-center gap-3">
            {/* Search Input */}
            <div className="relative flex-1 md:w-64">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-2.5" />
              <input
                type="text"
                placeholder="Cari foto, tag, atau uploader..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 text-xs rounded-xl glass-input"
              />
            </div>

            {/* Sort Toggle */}
            <div className="flex items-center p-1 rounded-xl bg-slate-900/80 border border-white/10">
              <button
                onClick={() => setSortBy('latest')}
                className={`p-1.5 rounded-lg text-xs font-medium flex items-center gap-1 transition-all ${
                  sortBy === 'latest'
                    ? 'bg-indigo-600 text-white'
                    : 'text-slate-400 hover:text-white'
                }`}
                title="Terbaru"
              >
                <TrendingUp className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Terbaru</span>
              </button>

              <button
                onClick={() => setSortBy('popular')}
                className={`p-1.5 rounded-lg text-xs font-medium flex items-center gap-1 transition-all ${
                  sortBy === 'popular'
                    ? 'bg-indigo-600 text-white'
                    : 'text-slate-400 hover:text-white'
                }`}
                title="Populer"
              >
                <Flame className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Populer</span>
              </button>
            </div>
          </div>
        </section>

        {/* Dynamic Photo Feed Grid */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2">
              <ImageIcon className="w-5 h-5 text-indigo-400" />
              <span>Galeri Foto {selectedCategory !== 'All' && `• ${selectedCategory}`}</span>
            </h2>
            <span className="text-xs text-slate-400">
              Menampilkan {filteredPosts.length} postingan
            </span>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map((n) => (
                <div
                  key={n}
                  className="glass-panel rounded-3xl h-72 animate-pulse bg-slate-900/50"
                />
              ))}
            </div>
          ) : filteredPosts.length === 0 ? (
            <div className="glass-panel rounded-3xl p-12 text-center border border-white/10 space-y-3">
              <ImageIcon className="w-12 h-12 text-slate-500 mx-auto animate-bounce" />
              <h3 className="text-base font-bold text-slate-200">Tidak ada foto ditemukan</h3>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                Coba ubah kata kunci pencarian atau pilih kategori lain. Kamu juga bisa mengunggah foto baru!
              </p>
              <button
                onClick={() => {
                  setEditingPost(null);
                  setIsUploadOpen(true);
                }}
                className="mt-2 px-5 py-2 rounded-xl text-xs font-bold text-white btn-gradient"
              >
                + Upload Foto Pertamamu
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredPosts.map((post) => (
                <PhotoCard
                  key={post.id}
                  post={post}
                  currentUser={currentUser}
                  onLikeToggle={handleLikeToggle}
                  onSelectPost={setSelectedPost}
                  onEditPost={(p) => {
                    setEditingPost(p);
                    setIsUploadOpen(true);
                  }}
                  onDeletePost={handleDeletePost}
                />
              ))}
            </div>
          )}
        </section>
      </main>

      {/* Upload & Edit Modal */}
      <UploadModal
        isOpen={isUploadOpen}
        onClose={() => setIsUploadOpen(false)}
        currentUser={currentUser}
        editingPost={editingPost}
        onSubmitPost={handleSubmitPost}
      />

      {/* Photo Detail Modal */}
      <PhotoDetailModal
        post={selectedPost}
        onClose={() => setSelectedPost(null)}
        currentUser={currentUser}
        onLikeToggle={handleLikeToggle}
        onDeletePost={handleDeletePost}
      />

      {/* Supabase & Vercel Setup Guide Modal */}
      <SupabaseGuideModal
        isOpen={isSupabaseModalOpen}
        onClose={() => setIsSupabaseModalOpen(false)}
      />
    </div>
  );
}
