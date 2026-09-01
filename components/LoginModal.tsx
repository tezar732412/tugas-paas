'use client';

import React, { useState } from 'react';
import { X, Lock, Mail, User, Shield, ArrowRight, CheckCircle2, AlertCircle } from 'lucide-react';
import { UserProfile } from '../lib/types';
import { DEMO_USERS } from '../lib/store';
import { isSupabaseConfigured, supabase } from '../lib/supabase/client';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (user: UserProfile) => void;
}

export default function LoginModal({ isOpen, onClose, onLoginSuccess }: LoginModalProps) {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [username, setUsername] = useState('');
  const [role, setRole] = useState<'user' | 'admin'>('user');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  if (!isOpen) return null;

  const handleQuickDemoLogin = (demoUser: UserProfile) => {
    onLoginSuccess(demoUser);
    onClose();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (!email.trim() || !password.trim()) {
      setErrorMsg('Email dan Password wajib diisi');
      return;
    }

    try {
      setLoading(true);

      if (isSupabaseConfigured && supabase) {
        if (isSignUp) {
          const { data, error } = await supabase.auth.signUp({
            email,
            password,
            options: {
              data: {
                username: username || email.split('@')[0],
                full_name: fullName || 'User Baru',
              },
            },
          });
          if (error) throw error;
          setSuccessMsg('Pendaftaran berhasil! Silakan login.');
          setIsSignUp(false);
        } else {
          const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password,
          });
          if (error) throw error;

          // Fetch user profile
          if (data.user) {
            const { data: profile } = await supabase
              .from('profiles')
              .select('*')
              .eq('id', data.user.id)
              .single();

            const loggedInUser: UserProfile = profile || {
              id: data.user.id,
              username: data.user.email?.split('@')[0] || 'user',
              full_name: 'Pengguna Supabase',
              avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200',
              role: 'user',
              created_at: new Date().toISOString(),
            };
            onLoginSuccess(loggedInUser);
            onClose();
          }
        }
      } else {
        // Local Demo Auth
        if (isSignUp) {
          const newUser: UserProfile = {
            id: `usr_${Date.now()}`,
            username: username || email.split('@')[0],
            full_name: fullName || 'User Baru',
            avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200',
            role,
            created_at: new Date().toISOString(),
          };
          onLoginSuccess(newUser);
        } else {
          // Check if admin email or demo user
          const matched = DEMO_USERS.find(
            (u) => u.username.toLowerCase() === email.toLowerCase() || u.role === role
          ) || DEMO_USERS[role === 'admin' ? 0 : 1];
          onLoginSuccess(matched);
        }
        onClose();
      }
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err?.message || 'Gagal autentikasi. Silakan periksa data Anda.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md animate-fade-in">
      <div className="glass-card w-full max-w-md rounded-3xl border border-slate-200 shadow-2xl animate-slide-up bg-white overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/50">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-indigo-50 text-indigo-600 border border-indigo-200">
              <Lock className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-extrabold text-slate-900">
                {isSignUp ? 'Buat Akun PicPulse' : 'Masuk ke PicPulse'}
              </h2>
              <p className="text-xs text-slate-500 font-semibold">
                {isSignUp ? 'Daftar untuk upload foto' : 'Masuk sebagai User atau Admin'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-5">
          {/* Quick Demo Login Preset Buttons */}
          <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
            <p className="text-[11px] font-extrabold text-slate-500 uppercase tracking-wider">
              Akses Cepat (Demo Mode):
            </p>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => handleQuickDemoLogin(DEMO_USERS[1])}
                className="flex items-center justify-center gap-2 p-2 rounded-xl bg-white border border-slate-200 hover:border-indigo-400 text-xs font-extrabold text-slate-800 shadow-sm transition-all cursor-pointer"
              >
                <User className="w-4 h-4 text-indigo-600" />
                <span>Masuk User</span>
              </button>

              <button
                type="button"
                onClick={() => handleQuickDemoLogin(DEMO_USERS[0])}
                className="flex items-center justify-center gap-2 p-2 rounded-xl bg-white border border-slate-200 hover:border-purple-400 text-xs font-extrabold text-slate-800 shadow-sm transition-all cursor-pointer"
              >
                <Shield className="w-4 h-4 text-purple-600" />
                <span>Masuk Admin</span>
              </button>
            </div>
          </div>

          <div className="flex items-center my-2">
            <div className="flex-1 border-t border-slate-200" />
            <span className="px-3 text-[11px] font-bold text-slate-400 uppercase">Atau Form Login</span>
            <div className="flex-1 border-t border-slate-200" />
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {errorMsg && (
              <div className="flex items-center gap-2 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            {successMsg && (
              <div className="flex items-center gap-2 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-bold">
                <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
                <span>{successMsg}</span>
              </div>
            )}

            {isSignUp && (
              <>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Nama Lengkap</label>
                  <input
                    type="text"
                    placeholder="Contoh: Budi Santoso"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full px-3.5 py-2 text-xs rounded-xl glass-input"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Username</label>
                  <input
                    type="text"
                    placeholder="budi_sn"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full px-3.5 py-2 text-xs rounded-xl glass-input"
                    required
                  />
                </div>
              </>
            )}

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Email</label>
              <div className="relative">
                <input
                  type="email"
                  placeholder="email@domain.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-9 pr-3.5 py-2 text-xs rounded-xl glass-input"
                  required
                />
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Password</label>
              <div className="relative">
                <input
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-9 pr-3.5 py-2 text-xs rounded-xl glass-input"
                  required
                />
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              </div>
            </div>

            {!isSupabaseConfigured && (
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Pilih Role Akses</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setRole('user')}
                    className={`py-1.5 rounded-xl text-xs font-bold border transition-all ${
                      role === 'user'
                        ? 'bg-indigo-600 text-white border-indigo-600'
                        : 'bg-slate-50 text-slate-700 border-slate-200'
                    }`}
                  >
                    User biasa
                  </button>
                  <button
                    type="button"
                    onClick={() => setRole('admin')}
                    className={`py-1.5 rounded-xl text-xs font-bold border transition-all ${
                      role === 'admin'
                        ? 'bg-purple-600 text-white border-purple-600'
                        : 'bg-slate-50 text-slate-700 border-slate-200'
                    }`}
                  >
                    Admin
                  </button>
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 rounded-xl text-xs font-bold text-white btn-primary flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 mt-2"
            >
              {loading ? (
                <span>Memproses...</span>
              ) : (
                <>
                  <span>{isSignUp ? 'Daftar Sekarang' : 'Masuk'}</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Toggle Sign Up / Login */}
          <div className="text-center pt-2 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsSignUp(!isSignUp)}
              className="text-xs font-bold text-indigo-600 hover:underline cursor-pointer"
            >
              {isSignUp ? 'Sudah punya akun? Masuk di sini' : 'Belum punya akun? Daftar gratis'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
