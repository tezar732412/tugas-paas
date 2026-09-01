'use client';

import React, { useState } from 'react';
import { X, Lock, Mail, User, ArrowRight, CheckCircle2, AlertCircle } from 'lucide-react';
import { UserProfile } from '../lib/types';
import { setLocalAuthUser } from '../lib/store';
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
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  if (!isOpen) return null;

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
          const cleanUsername = username.trim() || email.split('@')[0];
          const cleanFullName = fullName.trim() || cleanUsername;

          const { data, error } = await supabase.auth.signUp({
            email: email.trim(),
            password: password.trim(),
            options: {
              data: {
                username: cleanUsername,
                full_name: cleanFullName,
                avatar_url: `https://api.dicebear.com/7.x/avataaars/svg?seed=${cleanUsername}`,
              },
            },
          });

          if (error) throw error;

          if (data.user) {
            setSuccessMsg('Akun berhasil dibuat! Silakan masuk dengan akun Anda.');
            setIsSignUp(false);
          }
        } else {
          const { data, error } = await supabase.auth.signInWithPassword({
            email: email.trim(),
            password: password.trim(),
          });

          if (error) throw error;

          if (data.user) {
            const { data: profile } = await supabase
              .from('profiles')
              .select('*')
              .eq('id', data.user.id)
              .single();

            const loggedInUser: UserProfile = profile || {
              id: data.user.id,
              username: data.user.user_metadata?.username || data.user.email?.split('@')[0] || 'user',
              full_name: data.user.user_metadata?.full_name || data.user.email?.split('@')[0] || 'User',
              avatar_url: data.user.user_metadata?.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${data.user.email}`,
              role: profile?.role || 'user',
              created_at: data.user.created_at,
              is_banned: false,
            };

            setLocalAuthUser(loggedInUser);
            onLoginSuccess(loggedInUser);
            onClose();
          }
        }
      } else {
        // Local Account Creation & Sign in
        const cleanUsername = username.trim() || email.split('@')[0];
        const cleanFullName = fullName.trim() || cleanUsername;

        const user: UserProfile = {
          id: `usr_${Date.now()}`,
          username: cleanUsername,
          full_name: cleanFullName,
          avatar_url: `https://api.dicebear.com/7.x/avataaars/svg?seed=${cleanUsername}`,
          role: email.toLowerCase().includes('admin') ? 'admin' : 'user',
          created_at: new Date().toISOString(),
          is_banned: false,
        };

        setLocalAuthUser(user);
        onLoginSuccess(user);
        onClose();
      }
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err?.message || 'Gagal masuk. Silakan periksa email dan password Anda.');
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
                {isSignUp ? 'Daftar Akun Baru' : 'Masuk ke PicPulse'}
              </h2>
              <p className="text-xs text-slate-500 font-semibold">
                {isSignUp ? 'Buat akun untuk upload foto Anda' : 'Masukkan email dan kata sandi Anda'}
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

        <div className="p-6 space-y-4">
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

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-3.5">
            {isSignUp && (
              <>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Nama Lengkap</label>
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Contoh: Alex Pratama"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="w-full pl-9 pr-3.5 py-2 text-xs rounded-xl glass-input"
                      required
                    />
                    <User className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Username</label>
                  <input
                    type="text"
                    placeholder="alex_pratama"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full px-3.5 py-2 text-xs rounded-xl glass-input"
                    required
                  />
                </div>
              </>
            )}

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Alamat Email</label>
              <div className="relative">
                <input
                  type="email"
                  placeholder="nama@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-9 pr-3.5 py-2 text-xs rounded-xl glass-input"
                  required
                />
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Kata Sandi (Password)</label>
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

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 rounded-xl text-xs font-bold text-white btn-primary flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 mt-3"
            >
              {loading ? (
                <span>Memproses...</span>
              ) : (
                <>
                  <span>{isSignUp ? 'Daftar Sekarang' : 'Masuk ke Akun'}</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Toggle Sign Up / Login */}
          <div className="text-center pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => {
                setIsSignUp(!isSignUp);
                setErrorMsg('');
                setSuccessMsg('');
              }}
              className="text-xs font-bold text-indigo-600 hover:underline cursor-pointer"
            >
              {isSignUp ? 'Sudah memiliki akun? Masuk di sini' : 'Belum punya akun? Daftar gratis'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
