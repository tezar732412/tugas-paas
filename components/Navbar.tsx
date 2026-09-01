'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Camera, PlusCircle, Shield, User, Home, Database, Sparkles, CheckCircle2, AlertTriangle } from 'lucide-react';
import { UserProfile } from '../lib/types';
import { isSupabaseConfigured } from '../lib/supabase/client';

interface NavbarProps {
  currentUser: UserProfile;
  onSwitchUser: (user: UserProfile) => void;
  allUsers: UserProfile[];
  onOpenUpload: () => void;
  onOpenSupabaseModal: () => void;
}

export default function Navbar({
  currentUser,
  onSwitchUser,
  allUsers,
  onOpenUpload,
  onOpenSupabaseModal,
}: NavbarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [showUserDropdown, setShowUserDropdown] = useState(false);

  return (
    <header className="sticky top-0 z-40 w-full glass-panel border-b border-white/10 px-4 lg:px-8 py-3.5 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        {/* Brand Logo */}
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="p-2 rounded-xl bg-gradient-to-tr from-indigo-600 to-pink-500 text-white shadow-lg shadow-indigo-500/30 group-hover:scale-105 transition-transform duration-300">
            <Camera className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xl font-bold tracking-tight text-gradient">
              PicPulse
            </span>
            <span className="hidden sm:inline-block ml-2 text-[10px] uppercase font-semibold tracking-wider px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
              {currentUser.role === 'admin' ? 'Admin Mode' : 'Social'}
            </span>
          </div>
        </Link>

        {/* Center Navigation */}
        <nav className="hidden md:flex items-center gap-1.5 bg-slate-900/60 p-1.5 rounded-2xl border border-white/10">
          <Link
            href="/"
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
              pathname === '/'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                : 'text-slate-300 hover:text-white hover:bg-white/5'
            }`}
          >
            <Home className="w-4 h-4" />
            <span>Feed</span>
          </Link>

          <Link
            href="/profile"
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
              pathname === '/profile'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                : 'text-slate-300 hover:text-white hover:bg-white/5'
            }`}
          >
            <User className="w-4 h-4" />
            <span>Profil Saya</span>
          </Link>

          <Link
            href="/admin"
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
              pathname.startsWith('/admin')
                ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-md shadow-purple-600/30'
                : 'text-slate-300 hover:text-white hover:bg-white/5'
            }`}
          >
            <Shield className="w-4 h-4 text-purple-400" />
            <span>Admin Portal</span>
          </Link>
        </nav>

        {/* Right Action Items */}
        <div className="flex items-center gap-3">
          {/* Supabase Status Indicator */}
          <button
            onClick={onOpenSupabaseModal}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-medium border transition-all ${
              isSupabaseConfigured
                ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/20'
                : 'bg-amber-500/10 text-amber-300 border-amber-500/30 hover:bg-amber-500/20'
            }`}
            title="Klik untuk melihat status dan panduan koneksi Supabase"
          >
            <Database className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">
              {isSupabaseConfigured ? 'Supabase Live' : 'Demo Mode (Offline)'}
            </span>
            {isSupabaseConfigured ? (
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            ) : (
              <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
            )}
          </button>

          {/* Upload Button */}
          <button
            onClick={onOpenUpload}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-white btn-gradient cursor-pointer active:scale-95"
          >
            <PlusCircle className="w-4 h-4" />
            <span className="hidden sm:inline">Upload Foto</span>
          </button>

          {/* Role / User Switcher Dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowUserDropdown(!showUserDropdown)}
              className="flex items-center gap-2 p-1.5 rounded-xl bg-slate-800/80 border border-white/10 hover:border-indigo-500/50 transition-all"
            >
              <img
                src={currentUser.avatar_url}
                alt={currentUser.username}
                className="w-7 h-7 rounded-lg object-cover ring-2 ring-indigo-500/50"
              />
              <span className="hidden lg:inline text-xs font-medium text-slate-200">
                {currentUser.username}
              </span>
              <span
                className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                  currentUser.role === 'admin'
                    ? 'bg-purple-500/20 text-purple-300 border border-purple-500/40'
                    : 'bg-slate-700 text-slate-300'
                }`}
              >
                {currentUser.role.toUpperCase()}
              </span>
            </button>

            {showUserDropdown && (
              <div className="absolute right-0 mt-2 w-64 glass-panel rounded-2xl p-2 border border-white/15 shadow-2xl z-50 animate-slide-up">
                <div className="px-3 py-2 border-b border-white/10 mb-1">
                  <p className="text-xs font-semibold text-slate-400">Ganti User / Simulasi Role:</p>
                </div>
                {allUsers.map((u) => (
                  <button
                    key={u.id}
                    onClick={() => {
                      onSwitchUser(u);
                      setShowUserDropdown(false);
                    }}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-all ${
                      u.id === currentUser.id
                        ? 'bg-indigo-600/30 border border-indigo-500/40 text-white'
                        : 'hover:bg-white/5 text-slate-300'
                    }`}
                  >
                    <img
                      src={u.avatar_url}
                      alt={u.username}
                      className="w-8 h-8 rounded-lg object-cover"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold truncate text-slate-200">
                        {u.full_name}
                      </p>
                      <p className="text-[10px] text-slate-400 truncate">
                        @{u.username} • <span className="text-indigo-400 font-bold">{u.role}</span>
                      </p>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
