'use client';

import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import PhotoCard from '../components/PhotoCard';
import UploadModal from '../components/UploadModal';
import PhotoDetailModal from '../components/PhotoDetailModal';
import SupabaseGuideModal from '../components/SupabaseGuideModal';
import LoginModal from '../components/LoginModal';
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
import { Search, Sparkles, TrendingUp, Flame, Camera, Layers, ArrowUpRight, ShieldCheck } from 'lucide-react';

const CATEGORIES = ['All', 'Photography', 'Nature', 'Urban', 'Architecture', 'Art', 'Travel', 'Tech'];

export default function HomePage() {
  const [allUsers, setAllUsers] = useState<UserProfile[]>(DEMO_USERS);
  const [currentUser, setCurrentUser] = useState<UserProfile>(DEMO_USERS[1]);
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [sortBy, setSortBy] = useState<'latest' | 'popular'>('latest');

  // Modals
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [editingPost, setEditingPost] = useState<Post | null>(null);
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);
  const [isSupabaseModalOpen, setIsSupabaseModalOpen] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);

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
    } catch (err) {
      console.error(err);
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

  // Filter & Sort
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
      if (sortBy === 'popular') return b.likes_count - a.likes_count;
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    });

  const featuredPost = posts.find((p) => p.is_featured) || posts[0];

  return (
    <div className="min-h-screen flex flex-col pb-16">
      {/* Navigation Bar */}
      <Navbar
        currentUser={currentUser}
        onSwitchUser={setCurrentUser}
        allUsers={allUsers}
        onOpenUpload={() => {
          setEditingPost(null);
          setIsUploadOpen(true);
        }}
        onOpenSupabaseModal={() => setIsSupabaseModalOpen(true)}
        onOpenLoginModal={() => setIsLoginModalOpen(true)}
      />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-8 space-y-12">
        {/* Asymmetric Hero Showcase - Day Theme */}
        <section className="glass-card rounded-3xl p-6 sm:p-10 border border-slate-200/80 bg-white/90 relative overflow-hidden shadow-lg">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            {/* Left Content */}
            <div className="lg:col-span-7 space-y-5">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-200 text-indigo-700 text-xs font-bold">
                <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                <span>Next.js 15 + Supabase Realtime Storage</span>
              </div>

              <h1 className="text-3xl sm:text-5xl font-extrabold text-slate-900 tracking-tight leading-tight">
                Galeri Visual Presisi untuk <span className="text-gradient">Kreator Foto</span>
              </h1>

              <p className="text-sm text-slate-600 leading-relaxed max-w-[55ch] font-medium">
                Unggah karya fotografi resolusi tinggi, kelola postingan secara dinamis, dan atur hak akses admin secara instan.
              </p>

              <div className="flex flex-wrap items-center gap-3 pt-2">
                <button
                  onClick={() => {
                    setEditingPost(null);
                    setIsUploadOpen(true);
                  }}
                  className="px-6 py-3 rounded-xl text-xs font-bold text-white btn-primary cursor-pointer"
                >
                  + Upload Karya Foto
                </button>

                <button
                  onClick={() => setIsSupabaseModalOpen(true)}
                  className="px-5 py-3 rounded-xl text-xs font-bold text-slate-700 bg-slate-100 border border-slate-200 hover:bg-slate-200 transition-all cursor-pointer flex items-center gap-2"
                >
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <span>Panduan Supabase</span>
                </button>
              </div>
            </div>

            {/* Right Featured Hero Visual Card */}
            {featuredPost && (
              <div className="lg:col-span-5">
                <div
                  onClick={() => setSelectedPost(featuredPost)}
                  className="group relative rounded-2xl overflow-hidden cursor-pointer border border-slate-200 shadow-xl bg-slate-950 aspect-[4/3]"
                >
                  <img
                    src={featuredPost.image_url}
                    alt={featuredPost.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent opacity-85 p-5 flex flex-col justify-end">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                        {featuredPost.category}
                      </span>
                      <ArrowUpRight className="w-4 h-4 text-white group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                    </div>
                    <h3 className="text-base font-bold text-white truncate">{featuredPost.title}</h3>
                    <p className="text-xs text-slate-300 truncate">
                      Oleh @{featuredPost.author?.username} • ❤️ {featuredPost.likes_count} Likes
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </section>

        {/* Bento Grid Features - Day Theme */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="glass-card rounded-3xl p-6 border border-slate-200/80 bg-white space-y-2 hover:border-indigo-300 transition-colors shadow-sm">
            <div className="p-3 rounded-2xl bg-indigo-50 text-indigo-600 border border-indigo-200 w-fit">
              <Camera className="w-5 h-5" />
            </div>
            <h3 className="text-base font-extrabold text-slate-900">Upload Foto Dinamis</h3>
            <p className="text-xs text-slate-600 leading-relaxed font-medium">
              Integrasi penuh dengan Supabase Storage Bucket `photos` & database PostgreSQL `posts`.
            </p>
          </div>

          <div className="glass-card rounded-3xl p-6 border border-slate-200/80 bg-white space-y-2 hover:border-emerald-300 transition-colors shadow-sm">
            <div className="p-3 rounded-2xl bg-emerald-50 text-emerald-600 border border-emerald-200 w-fit">
              <Layers className="w-5 h-5" />
            </div>
            <h3 className="text-base font-extrabold text-slate-900">Full CRUD Operations</h3>
            <p className="text-xs text-slate-600 leading-relaxed font-medium">
              Create, Read detail modal, Update judul & deskripsi, serta Delete postingan foto secara mandiri.
            </p>
          </div>

          <div className="glass-card rounded-3xl p-6 border border-slate-200/80 bg-white space-y-2 hover:border-cyan-300 transition-colors shadow-sm">
            <div className="p-3 rounded-2xl bg-cyan-50 text-cyan-600 border border-cyan-200 w-fit">
              <Sparkles className="w-5 h-5" />
            </div>
            <h3 className="text-base font-extrabold text-slate-900">Admin Control Portal</h3>
            <p className="text-xs text-slate-600 leading-relaxed font-medium">
              Dashboard analitik khusus admin untuk moderasi postingan foto dan manajemen role pengguna.
            </p>
          </div>
        </section>

        {/* Filter Bar - Day Theme */}
        <section className="glass-card p-4 rounded-2xl border border-slate-200/80 bg-white flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 shadow-sm">
          <div className="flex items-center gap-1.5 overflow-x-auto pb-2 md:pb-0 scrollbar-none">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-extrabold whitespace-nowrap transition-all cursor-pointer ${
                  selectedCategory === cat
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-3">
            <div className="relative flex-1 md:w-60">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-2.5" />
              <input
                type="text"
                placeholder="Cari foto atau uploader..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 text-xs rounded-xl glass-input"
              />
            </div>

            <div className="flex items-center p-1 rounded-xl bg-slate-100 border border-slate-200">
              <button
                onClick={() => setSortBy('latest')}
                className={`p-1.5 rounded-lg text-xs font-extrabold flex items-center gap-1 transition-all cursor-pointer ${
                  sortBy === 'latest' ? 'bg-indigo-600 text-white' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <TrendingUp className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Terbaru</span>
              </button>
              <button
                onClick={() => setSortBy('popular')}
                className={`p-1.5 rounded-lg text-xs font-extrabold flex items-center gap-1 transition-all cursor-pointer ${
                  sortBy === 'popular' ? 'bg-indigo-600 text-white' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Flame className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Populer</span>
              </button>
            </div>
          </div>
        </section>

        {/* Dynamic Photo Feed Grid */}
        <section className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-extrabold text-slate-900">
              Galeri Foto {selectedCategory !== 'All' && `• ${selectedCategory}`}
            </h2>
            <span className="text-xs text-slate-500 font-semibold">
              {filteredPosts.length} Foto Ditampilkan
            </span>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map((n) => (
                <div key={n} className="glass-card rounded-3xl h-72 animate-pulse bg-slate-100" />
              ))}
            </div>
          ) : filteredPosts.length === 0 ? (
            <div className="glass-card rounded-3xl p-12 text-center border border-slate-200 bg-white space-y-3 shadow-sm">
              <Camera className="w-12 h-12 text-slate-400 mx-auto" />
              <h3 className="text-base font-extrabold text-slate-900">Tidak ada foto ditemukan</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto font-medium">
                Coba ubah kata kunci pencarian atau unggah foto baru ke platform.
              </p>
              <button
                onClick={() => {
                  setEditingPost(null);
                  setIsUploadOpen(true);
                }}
                className="px-5 py-2.5 rounded-xl text-xs font-bold text-white btn-primary"
              >
                + Upload Foto Sekarang
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

      {/* Modals */}
      <UploadModal
        isOpen={isUploadOpen}
        onClose={() => setIsUploadOpen(false)}
        currentUser={currentUser}
        editingPost={editingPost}
        onSubmitPost={handleSubmitPost}
      />

      <PhotoDetailModal
        post={selectedPost}
        onClose={() => setSelectedPost(null)}
        currentUser={currentUser}
        onLikeToggle={handleLikeToggle}
        onDeletePost={handleDeletePost}
      />

      <SupabaseGuideModal
        isOpen={isSupabaseModalOpen}
        onClose={() => setIsSupabaseModalOpen(false)}
      />

      <LoginModal
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
        onLoginSuccess={(u) => setCurrentUser(u)}
      />
    </div>
  );
}
