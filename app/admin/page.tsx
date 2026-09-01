'use client';

import React, { useState, useEffect } from 'react';
import Navbar from '../../components/Navbar';
import AdminContentTable from '../../components/AdminContentTable';
import AdminUserTable from '../../components/AdminUserTable';
import UploadModal from '../../components/UploadModal';
import PhotoDetailModal from '../../components/PhotoDetailModal';
import SupabaseGuideModal from '../../components/SupabaseGuideModal';
import { Post, UserProfile, SystemStats } from '../../lib/types';
import {
  fetchPosts,
  fetchUsers,
  fetchSystemStats,
  createPost,
  updatePost,
  deletePost,
  toggleUserRole,
  toggleBanUser,
  DEMO_USERS,
} from '../../lib/store';
import { isSupabaseConfigured } from '../../lib/supabase/client';
import { Shield, Database, Users, Image as ImageIcon, Heart, HardDrive, CheckCircle2, AlertTriangle, Layers, Settings } from 'lucide-react';

export default function AdminDashboardPage() {
  const [allUsers, setAllUsers] = useState<UserProfile[]>(DEMO_USERS);
  const [currentUser, setCurrentUser] = useState<UserProfile>(DEMO_USERS[0]); // Default to Alex (Admin)
  const [posts, setPosts] = useState<Post[]>([]);
  const [stats, setStats] = useState<SystemStats | null>(null);
  const [activeTab, setActiveTab] = useState<'content' | 'users' | 'system'>('content');
  const [loading, setLoading] = useState(true);

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
      const [fetchedPosts, fetchedUsers, sysStats] = await Promise.all([
        fetchPosts(),
        fetchUsers(),
        fetchSystemStats(),
      ]);
      setPosts(fetchedPosts);
      setAllUsers(fetchedUsers);
      setStats(sysStats);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeletePost = async (postId: string) => {
    await deletePost(postId);
    setPosts((prev) => prev.filter((p) => p.id !== postId));
    const sysStats = await fetchSystemStats();
    setStats(sysStats);
  };

  const handleToggleFeatured = async (postId: string) => {
    const target = posts.find((p) => p.id === postId);
    if (target) {
      const updated = await updatePost(postId, { is_featured: !target.is_featured });
      if (updated) {
        setPosts((prev) => prev.map((p) => (p.id === postId ? updated : p)));
      }
    }
  };

  const handleToggleRole = async (userId: string) => {
    const updated = await toggleUserRole(userId);
    if (updated) {
      setAllUsers((prev) => prev.map((u) => (u.id === userId ? updated : u)));
    }
  };

  const handleToggleBan = async (userId: string) => {
    const updated = await toggleBanUser(userId);
    if (updated) {
      setAllUsers((prev) => prev.map((u) => (u.id === userId ? updated : u)));
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

  return (
    <div className="min-h-screen flex flex-col pb-16">
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
        {/* Admin Banner */}
        <section className="glass-panel rounded-3xl p-6 sm:p-8 border border-white/15 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-80 h-80 bg-purple-600/15 rounded-full blur-3xl pointer-events-none" />

          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/15 border border-purple-500/30 text-purple-300 text-xs font-bold">
                <Shield className="w-3.5 h-3.5 text-purple-400" />
                <span>Portal Administrator & Moderasi Konten</span>
              </div>
              <h1 className="text-2xl sm:text-4xl font-extrabold text-slate-100">
                Dashboard Control Center
              </h1>
              <p className="text-xs sm:text-sm text-slate-300">
                Kelola postingan foto, pengguna, hak akses role, serta pantau status integrasi Supabase & Vercel.
              </p>
            </div>

            <button
              onClick={() => setIsSupabaseModalOpen(true)}
              className="px-5 py-3 rounded-2xl text-xs font-bold text-white btn-gradient flex items-center justify-center gap-2 shadow-lg shadow-purple-600/30 cursor-pointer"
            >
              <Database className="w-4 h-4" />
              <span>Cek Status Supabase</span>
            </button>
          </div>
        </section>

        {/* System Stats Overview Grid */}
        <section className="grid grid-cols-2 lg:grid-cols-5 gap-4">
          <div className="glass-panel rounded-2xl p-4 border border-white/10 flex items-center gap-3">
            <div className="p-3 rounded-xl bg-indigo-500/20 text-indigo-400">
              <ImageIcon className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xl font-extrabold text-slate-100">{stats?.totalPosts || 0}</p>
              <p className="text-[11px] text-slate-400 font-medium">Total Postingan</p>
            </div>
          </div>

          <div className="glass-panel rounded-2xl p-4 border border-white/10 flex items-center gap-3">
            <div className="p-3 rounded-xl bg-purple-500/20 text-purple-400">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xl font-extrabold text-slate-100">{stats?.totalUsers || 0}</p>
              <p className="text-[11px] text-slate-400 font-medium">Total Pengguna</p>
            </div>
          </div>

          <div className="glass-panel rounded-2xl p-4 border border-white/10 flex items-center gap-3">
            <div className="p-3 rounded-xl bg-rose-500/20 text-rose-400">
              <Heart className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xl font-extrabold text-slate-100">{stats?.totalLikes || 0}</p>
              <p className="text-[11px] text-slate-400 font-medium">Total Suka</p>
            </div>
          </div>

          <div className="glass-panel rounded-2xl p-4 border border-white/10 flex items-center gap-3">
            <div className="p-3 rounded-xl bg-cyan-500/20 text-cyan-400">
              <HardDrive className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xl font-extrabold text-slate-100">{stats?.storageUsedMb || 0} MB</p>
              <p className="text-[11px] text-slate-400 font-medium">Penggunaan Media</p>
            </div>
          </div>

          <div className="glass-panel rounded-2xl p-4 border border-white/10 flex items-center gap-3 col-span-2 lg:col-span-1">
            <div
              className={`p-3 rounded-xl ${
                isSupabaseConfigured
                  ? 'bg-emerald-500/20 text-emerald-400'
                  : 'bg-amber-500/20 text-amber-400'
              }`}
            >
              <Database className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-100">
                {isSupabaseConfigured ? 'Supabase Live' : 'Demo Fallback'}
              </p>
              <p className="text-[10px] text-slate-400 font-medium">
                {isSupabaseConfigured ? 'Direct DB & Bucket' : 'Local Storage Sync'}
              </p>
            </div>
          </div>
        </section>

        {/* Tab Navigation */}
        <section className="space-y-6">
          <div className="flex items-center gap-2 border-b border-white/10 pb-3">
            <button
              onClick={() => setActiveTab('content')}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'content'
                  ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/30'
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <Layers className="w-4 h-4" />
              <span>Moderasi Konten Foto ({posts.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('users')}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'users'
                  ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/30'
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <Users className="w-4 h-4" />
              <span>Manajemen Pengguna ({allUsers.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('system')}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'system'
                  ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/30'
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <Settings className="w-4 h-4" />
              <span>Status & Diagnostik Supabase</span>
            </button>
          </div>

          {/* Tab 1: Content Table */}
          {activeTab === 'content' && (
            <AdminContentTable
              posts={posts}
              onDeletePost={handleDeletePost}
              onToggleFeatured={handleToggleFeatured}
              onSelectPost={setSelectedPost}
              onEditPost={(p) => {
                setEditingPost(p);
                setIsUploadOpen(true);
              }}
            />
          )}

          {/* Tab 2: Users Table */}
          {activeTab === 'users' && (
            <AdminUserTable
              users={allUsers}
              onToggleRole={handleToggleRole}
              onToggleBan={handleToggleBan}
            />
          )}

          {/* Tab 3: System Diagnostics */}
          {activeTab === 'system' && (
            <div className="glass-panel rounded-3xl p-6 border border-white/10 space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-bold text-slate-100">Status & Konfigurasi Supabase Backend</h3>
                  <p className="text-xs text-slate-400">Informasi lingkungan runtime dan integrasi database</p>
                </div>
                <button
                  onClick={() => setIsSupabaseModalOpen(true)}
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-indigo-600 text-white"
                >
                  Buka Instruksi Lengkap
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 rounded-2xl bg-slate-950/60 border border-white/10 space-y-2">
                  <p className="text-xs font-bold text-slate-300">NEXT_PUBLIC_SUPABASE_URL</p>
                  <p className="text-xs font-mono text-indigo-300 truncate">
                    {process.env.NEXT_PUBLIC_SUPABASE_URL || 'Belum dikonfigurasi (Menggunakan Fallback Local)'}
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-slate-950/60 border border-white/10 space-y-2">
                  <p className="text-xs font-bold text-slate-300">NEXT_PUBLIC_SUPABASE_ANON_KEY</p>
                  <p className="text-xs font-mono text-purple-300 truncate">
                    {process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
                      ? '••••••••••••••••••••••••' + process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY.slice(-8)
                      : 'Belum dikonfigurasi'}
                  </p>
                </div>
              </div>
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
        onLikeToggle={async (postId) => {
          setPosts((prev) =>
            prev.map((p) =>
              p.id === postId
                ? { ...p, likes_count: p.likes_count + (p.is_liked ? -1 : 1), is_liked: !p.is_liked }
                : p
            )
          );
        }}
        onDeletePost={handleDeletePost}
      />

      <SupabaseGuideModal
        isOpen={isSupabaseModalOpen}
        onClose={() => setIsSupabaseModalOpen(false)}
      />
    </div>
  );
}
