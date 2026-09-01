'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Camera, Plus, Shield, User, Compass, Database, CheckCircle, AlertCircle, ChevronDown } from 'lucide-react';
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
  const [showUserDropdown, setShowUserDropdown] = useState(false);

  return (
    <header className="sticky top-0 z-40 w-full glass-card border-b border-slate-200/80 px-4 lg:px-8 py-3 backdrop-blur-2xl bg-white/80">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4 h-11">
        {/* Brand Logo */}
        <Link href="/" className="flex items-center gap-3 group">
          <div className="p-2 rounded-xl bg-indigo-600 text-white shadow-md shadow-indigo-600/25 group-hover:scale-105 transition-transform duration-300">
            <Camera className="w-5 h-5" />
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xl font-extrabold tracking-tight text-gradient">
              PicPulse
            </span>
            <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-slate-100 text-slate-700 border border-slate-200">
              {currentUser.role === 'admin' ? 'Admin Portal' : 'Community'}
            </span>
          </div>
        </Link>

        {/* Navigation Tabs */}
        <nav className="hidden md:flex items-center gap-1 bg-slate-100/80 p-1 rounded-2xl border border-slate-200">
          <Link
            href="/"
            className={`flex items-center gap-2 px-4 py-1.5 rounded-xl text-xs font-bold transition-all ${
              pathname === '/'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
            }`}
          >
            <Compass className="w-4 h-4" />
            <span>Feed Utama</span>
          </Link>

          <Link
            href="/profile"
            className={`flex items-center gap-2 px-4 py-1.5 rounded-xl text-xs font-bold transition-all ${
              pathname === '/profile'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
            }`}
          >
            <User className="w-4 h-4" />
            <span>Profil Saya</span>
          </Link>

          <Link
            href="/admin"
            className={`flex items-center gap-2 px-4 py-1.5 rounded-xl text-xs font-bold transition-all ${
              pathname.startsWith('/admin')
                ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/30'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
            }`}
          >
            <Shield className="w-4 h-4 text-emerald-100" />
            <span>Admin</span>
          </Link>
        </nav>

        {/* Actions */}
        <div className="flex items-center gap-3">
          {/* Supabase Status Pill */}
          <button
            onClick={onOpenSupabaseModal}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold border transition-all ${
              isSupabaseConfigured
                ? 'bg-emerald-50 text-emerald-700 border-emerald-300 hover:bg-emerald-100'
                : 'bg-amber-50 text-amber-700 border-amber-300 hover:bg-amber-100'
            }`}
            title="Status Integrasi Supabase"
          >
            <Database className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">
              {isSupabaseConfigured ? 'Supabase Live' : 'Demo Local'}
            </span>
            {isSupabaseConfigured ? (
              <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
            ) : (
              <AlertCircle className="w-3.5 h-3.5 text-amber-600" />
            )}
          </button>

          {/* Upload Button */}
          <button
            onClick={onOpenUpload}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-white btn-primary cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">Upload Foto</span>
          </button>

          {/* Role Switcher */}
          <div className="relative">
            <button
              onClick={() => setShowUserDropdown(!showUserDropdown)}
              className="flex items-center gap-2 p-1.5 rounded-xl bg-slate-100 border border-slate-200 hover:border-indigo-400 transition-all cursor-pointer"
            >
              <img
                src={currentUser.avatar_url}
                alt={currentUser.username}
                className="w-7 h-7 rounded-lg object-cover ring-2 ring-indigo-500/50"
              />
              <span className="hidden lg:inline text-xs font-bold text-slate-800">
                {currentUser.username}
              </span>
              <ChevronDown className="w-3.5 h-3.5 text-slate-500" />
            </button>

            {showUserDropdown && (
              <div className="absolute right-0 mt-2 w-64 glass-card rounded-2xl p-2 border border-slate-200 shadow-xl z-50 animate-slide-up bg-white">
                <div className="px-3 py-2 border-b border-slate-100 mb-1">
                  <p className="text-[11px] font-extrabold text-slate-400 uppercase tracking-wider">
                    Simulasi Pengguna / Role:
                  </p>
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
                        ? 'bg-indigo-50 border border-indigo-200 text-indigo-900 font-bold'
                        : 'hover:bg-slate-50 text-slate-700'
                    }`}
                  >
                    <img
                      src={u.avatar_url}
                      alt={u.username}
                      className="w-8 h-8 rounded-lg object-cover"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold truncate text-slate-900">{u.full_name}</p>
                      <p className="text-[10px] text-slate-500 truncate">
                        @{u.username} • <span className="text-indigo-600 font-bold">{u.role}</span>
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
