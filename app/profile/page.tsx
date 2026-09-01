'use client';

import React, { useState, useEffect } from 'react';
import Navbar from '../../components/Navbar';
import PhotoCard from '../../components/PhotoCard';
import UploadModal from '../../components/UploadModal';
import PhotoDetailModal from '../../components/PhotoDetailModal';
import SupabaseGuideModal from '../../components/SupabaseGuideModal';
import LoginModal from '../../components/LoginModal';
import { Post, UserProfile } from '../../lib/types';
import {
  fetchPosts,
  fetchUsers,
  createPost,
  updatePost,
  deletePost,
  toggleLikePost,
  DEMO_USERS,
} from '../../lib/store';
import { Camera, PlusCircle } from 'lucide-react';

export default function ProfilePage() {
  const [allUsers, setAllUsers] = useState<UserProfile[]>(DEMO_USERS);
  const [currentUser, setCurrentUser] = useState<UserProfile>(DEMO_USERS[1]);
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);

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

  const userPosts = posts.filter((p) => p.user_id === currentUser.id);
  const totalLikes = userPosts.reduce((acc, p) => acc + p.likes_count, 0);

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
        onOpenLoginModal={() => setIsLoginModalOpen(true)}
      />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-6 space-y-8">
        {/* Profile Card Header */}
        <section className="glass-card rounded-3xl overflow-hidden border border-slate-200/80 bg-white shadow-md relative">
          <div className="h-44 sm:h-56 bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-800 relative">
            <div className="absolute inset-0 bg-black/10" />
          </div>

          <div className="px-6 sm:px-8 pb-6 relative -mt-16 sm:-mt-20 flex flex-col sm:flex-row items-start sm:items-end justify-between gap-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-end gap-5">
              <img
                src={currentUser.avatar_url}
                alt={currentUser.username}
                className="w-28 h-28 sm:w-36 sm:h-36 rounded-3xl object-cover ring-4 ring-white shadow-xl"
              />

              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
                    {currentUser.full_name}
                  </h1>
                  <span
                    className={`text-xs font-extrabold px-2.5 py-0.5 rounded-full ${
                      currentUser.role === 'admin'
                        ? 'bg-purple-100 text-purple-800 border border-purple-300'
                        : 'bg-indigo-100 text-indigo-800 border border-indigo-300'
                    }`}
                  >
                    {currentUser.role.toUpperCase()}
                  </span>
                </div>
                <p className="text-sm text-slate-600 font-bold">@{currentUser.username}</p>
                <p className="text-xs text-slate-500 font-semibold">
                  Bergabung sejak {new Date(currentUser.created_at).toLocaleDateString('id-ID', { month: 'long', year: 'numeric' })}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-4 w-full sm:w-auto justify-between sm:justify-end">
              <div className="flex items-center gap-4 bg-slate-50 p-3 rounded-2xl border border-slate-200">
                <div className="text-center px-2">
                  <p className="text-base font-extrabold text-slate-900">{userPosts.length}</p>
                  <p className="text-[10px] text-slate-500 uppercase font-extrabold">Foto</p>
                </div>
                <div className="h-8 w-px bg-slate-200" />
                <div className="text-center px-2">
                  <p className="text-base font-extrabold text-rose-600">{totalLikes}</p>
                  <p className="text-[10px] text-slate-500 uppercase font-extrabold">Likes</p>
                </div>
              </div>

              <button
                onClick={() => {
                  setEditingPost(null);
                  setIsUploadOpen(true);
                }}
                className="px-5 py-3 rounded-2xl text-xs font-bold text-white btn-primary flex items-center gap-2 cursor-pointer"
              >
                <PlusCircle className="w-4 h-4" />
                <span>Upload</span>
              </button>
            </div>
          </div>
        </section>

        {/* User's Uploaded Photos */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-extrabold text-slate-900 flex items-center gap-2">
              <Camera className="w-5 h-5 text-indigo-600" />
              <span>Foto yang Diunggah ({userPosts.length})</span>
            </h2>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map((n) => (
                <div key={n} className="glass-card rounded-3xl h-72 animate-pulse bg-slate-100" />
              ))}
            </div>
          ) : userPosts.length === 0 ? (
            <div className="glass-card rounded-3xl p-12 text-center border border-slate-200 bg-white space-y-3 shadow-sm">
              <Camera className="w-12 h-12 text-slate-400 mx-auto" />
              <h3 className="text-base font-extrabold text-slate-900">Belum ada foto yang diunggah</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto font-medium">
                Unggah karya foto pertamamu sekarang untuk membagikannya dengan seluruh pengguna PicPulse.
              </p>
              <button
                onClick={() => {
                  setEditingPost(null);
                  setIsUploadOpen(true);
                }}
                className="mt-2 px-5 py-2 rounded-xl text-xs font-bold text-white btn-primary"
              >
                + Upload Foto Sekarang
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {userPosts.map((post) => (
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
