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
import { Shield, Database, Users, Image as ImageIcon, Heart, HardDrive, Layers, Settings } from 'lucide-react';

export default function AdminDashboardPage() {
  const [allUsers, setAllUsers] = useState<UserProfile[]>(DEMO_USERS);
  const [currentUser, setCurrentUser] = useState<UserProfile>(DEMO_USERS[0]);
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
        {/* Admin Banner - Day Theme */}
        <section className="glass-card rounded-3xl p-6 sm:p-8 border border-slate-200/80 bg-white shadow-md relative overflow-hidden">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-50 border border-purple-200 text-purple-800 text-xs font-extrabold">
                <Shield className="w-3.5 h-3.5 text-purple-600" />
                <span>Portal Administrator & Moderasi Konten</span>
              </div>
              <h1 className="text-2xl sm:text-4xl font-extrabold text-slate-900">
                Dashboard Control Center
              </h1>
              <p className="text-xs sm:text-sm text-slate-600 font-medium">
                Kelola postingan foto, pengguna, hak akses role, serta pantau status integrasi Supabase & Vercel.
              </p>
            </div>

            <button
              onClick={() => setIsSupabaseModalOpen(true)}
              className="px-5 py-3 rounded-2xl text-xs font-bold text-white btn-primary flex items-center justify-center gap-2 cursor-pointer"
            >
              <Database className="w-4 h-4" />
              <span>Cek Status Supabase</span>
            </button>
          </div>
        </section>

        {/* System Stats Overview Grid - Day Theme */}
        <section className="grid grid-cols-2 lg:grid-cols-5 gap-4">
          <div className="glass-card rounded-2xl p-4 border border-slate-200/80 bg-white shadow-sm flex items-center gap-3">
            <div className="p-3 rounded-xl bg-indigo-50 text-indigo-600 border border-indigo-200">
              <ImageIcon className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xl font-extrabold text-slate-900">{stats?.totalPosts || 0}</p>
              <p className="text-[11px] text-slate-500 font-bold">Total Postingan</p>
            </div>
          </div>

          <div className="glass-card rounded-2xl p-4 border border-slate-200/80 bg-white shadow-sm flex items-center gap-3">
            <div className="p-3 rounded-xl bg-purple-50 text-purple-600 border border-purple-200">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xl font-extrabold text-slate-900">{stats?.totalUsers || 0}</p>
              <p className="text-[11px] text-slate-500 font-bold">Total Pengguna</p>
            </div>
          </div>

          <div className="glass-card rounded-2xl p-4 border border-slate-200/80 bg-white shadow-sm flex items-center gap-3">
            <div className="p-3 rounded-xl bg-rose-50 text-rose-600 border border-rose-200">
              <Heart className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xl font-extrabold text-slate-900">{stats?.totalLikes || 0}</p>
              <p className="text-[11px] text-slate-500 font-bold">Total Suka</p>
            </div>
          </div>

          <div className="glass-card rounded-2xl p-4 border border-slate-200/80 bg-white shadow-sm flex items-center gap-3">
            <div className="p-3 rounded-xl bg-cyan-50 text-cyan-600 border border-cyan-200">
              <HardDrive className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xl font-extrabold text-slate-900">{stats?.storageUsedMb || 0} MB</p>
              <p className="text-[11px] text-slate-500 font-bold">Penggunaan Media</p>
            </div>
          </div>

          <div className="glass-card rounded-2xl p-4 border border-slate-200/80 bg-white shadow-sm flex items-center gap-3 col-span-2 lg:col-span-1">
            <div
              className={`p-3 rounded-xl border ${
                isSupabaseConfigured
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                  : 'bg-amber-50 text-amber-700 border-amber-200'
              }`}
            >
              <Database className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-extrabold text-slate-900">
                {isSupabaseConfigured ? 'Supabase Live' : 'Demo Fallback'}
              </p>
              <p className="text-[10px] text-slate-500 font-semibold">
                {isSupabaseConfigured ? 'Direct DB & Bucket' : 'Local Storage Sync'}
              </p>
            </div>
          </div>
        </section>

        {/* Tab Navigation - Day Theme */}
        <section className="space-y-6">
          <div className="flex items-center gap-2 border-b border-slate-200 pb-3">
            <button
              onClick={() => setActiveTab('content')}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-extrabold transition-all cursor-pointer ${
                activeTab === 'content'
                  ? 'bg-purple-600 text-white shadow-md shadow-purple-600/30'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Layers className="w-4 h-4" />
              <span>Moderasi Konten Foto ({posts.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('users')}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-extrabold transition-all cursor-pointer ${
                activeTab === 'users'
                  ? 'bg-purple-600 text-white shadow-md shadow-purple-600/30'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Users className="w-4 h-4" />
              <span>Manajemen Pengguna ({allUsers.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('system')}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-extrabold transition-all cursor-pointer ${
                activeTab === 'system'
                  ? 'bg-purple-600 text-white shadow-md shadow-purple-600/30'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
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
            <div className="glass-card rounded-3xl p-6 border border-slate-200/80 bg-white space-y-6 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-extrabold text-slate-900">Status & Konfigurasi Supabase Backend</h3>
                  <p className="text-xs text-slate-500 font-semibold">Informasi lingkungan runtime dan integrasi database</p>
                </div>
                <button
                  onClick={() => setIsSupabaseModalOpen(true)}
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-indigo-600 text-white cursor-pointer"
                >
                  Buka Instruksi Lengkap
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                  <p className="text-xs font-bold text-slate-700">NEXT_PUBLIC_SUPABASE_URL</p>
                  <p className="text-xs font-mono text-indigo-700 font-bold truncate">
                    {process.env.NEXT_PUBLIC_SUPABASE_URL || 'Belum dikonfigurasi (Menggunakan Fallback Local)'}
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                  <p className="text-xs font-bold text-slate-700">NEXT_PUBLIC_SUPABASE_ANON_KEY</p>
                  <p className="text-xs font-mono text-purple-700 font-bold truncate">
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
