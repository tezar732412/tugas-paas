'use client';

import React from 'react';
import { X, Database, CheckCircle2, AlertTriangle, ExternalLink, Code2, Server, Globe, Rocket } from 'lucide-react';
import { isSupabaseConfigured } from '../lib/supabase/client';

interface SupabaseGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function SupabaseGuideModal({ isOpen, onClose }: SupabaseGuideModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-fade-in">
      <div className="glass-panel w-full max-w-3xl rounded-3xl border border-white/15 overflow-hidden shadow-2xl animate-slide-up flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-slate-900/60">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              <Database className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-100 flex items-center gap-2">
                Integrasi Supabase & Production Vercel
                {isSupabaseConfigured ? (
                  <span className="px-2 py-0.5 rounded-full text-[10px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                    Terhubung (Live)
                  </span>
                ) : (
                  <span className="px-2 py-0.5 rounded-full text-[10px] bg-amber-500/20 text-amber-300 border border-amber-500/40">
                    Demo Mode (Fallback Local)
                  </span>
                )}
              </h2>
              <p className="text-xs text-slate-400">
                Panduan mudah untuk menghubungkan database Supabase dan deploy ke Vercel
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-6 text-xs text-slate-300">
          {/* Status Box */}
          <div className={`p-4 rounded-2xl border ${
            isSupabaseConfigured 
              ? 'bg-emerald-950/30 border-emerald-500/30 text-emerald-200' 
              : 'bg-amber-950/30 border-amber-500/30 text-amber-200'
          }`}>
            <div className="flex items-start gap-3">
              {isSupabaseConfigured ? (
                <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
              ) : (
                <AlertTriangle className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
              )}
              <div>
                <h4 className="font-bold text-sm">
                  {isSupabaseConfigured
                    ? 'Selamat! Kunci API Supabase Terdeteksi.'
                    : 'Aplikasi Berjalan dalam Demo Mode (Local Storage)'}
                </h4>
                <p className="mt-1 text-slate-300">
                  {isSupabaseConfigured
                    ? 'Aplikasi terintegrasi secara langsung dengan Supabase PostgreSQL & Storage API.'
                    : 'Aplikasi dapat diuji sepenuhnya secara interaktif tanpa Supabase! Untuk mengaktifkan Supabase live, ikuti 3 langkah sederhana di bawah.'}
                </p>
              </div>
            </div>
          </div>

          {/* Step 1: Schema */}
          <div className="glass-panel p-4 rounded-2xl border border-white/10 space-y-2">
            <div className="flex items-center gap-2 text-indigo-400 font-bold text-sm">
              <Code2 className="w-4 h-4" />
              <span>Langkah 1: Setup Database & Storage di Supabase</span>
            </div>
            <p className="text-slate-300">
              Buka <a href="https://supabase.com/dashboard" target="_blank" rel="noreferrer" className="text-indigo-400 underline font-semibold">Supabase Dashboard</a>, masuk ke menu <strong>SQL Editor</strong>, lalu salin dan jalankan skrip dari file:
            </p>
            <div className="p-2.5 rounded-xl bg-slate-950 font-mono text-[11px] text-emerald-400 border border-white/10">
              supabase/schema.sql
            </div>
            <p className="text-slate-400 text-[11px]">
              Skrip ini akan membuat tabel <code className="text-indigo-300">profiles</code>, <code className="text-indigo-300">posts</code>, <code className="text-indigo-300">comments</code>, <code className="text-indigo-300">likes</code>, trigger otomatis, RLS Security, dan Storage Bucket <code className="text-indigo-300">photos</code>.
            </p>
          </div>

          {/* Step 2: Environment Variables */}
          <div className="glass-panel p-4 rounded-2xl border border-white/10 space-y-2">
            <div className="flex items-center gap-2 text-purple-400 font-bold text-sm">
              <Server className="w-4 h-4" />
              <span>Langkah 2: Isikan Kunci `.env.local`</span>
            </div>
            <p className="text-slate-300">
              Ambil kunci dari <strong>Project Settings → API</strong> di Supabase, lalu masukkan ke dalam file <code className="text-purple-300">.env.local</code>:
            </p>
            <pre className="p-3 rounded-xl bg-slate-950 font-mono text-[11px] text-slate-200 border border-white/10 overflow-x-auto">
{`NEXT_PUBLIC_SUPABASE_URL=https://<project-id>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOi...`}
            </pre>
          </div>

          {/* Step 3: Vercel Deployment */}
          <div className="glass-panel p-4 rounded-2xl border border-white/10 space-y-2">
            <div className="flex items-center gap-2 text-pink-400 font-bold text-sm">
              <Rocket className="w-4 h-4" />
              <span>Langkah 3: Deploy ke Vercel (Real Production)</span>
            </div>
            <ol className="list-decimal list-inside space-y-1.5 text-slate-300 pl-1">
              <li>Push repository ini ke GitHub / GitLab / Bitbucket.</li>
              <li>Impor proyek ke Dashboard <a href="https://vercel.com/new" target="_blank" rel="noreferrer" className="text-pink-400 underline font-semibold">Vercel.com</a>.</li>
              <li>Di bagian <strong>Environment Variables</strong> di Vercel, tambahkan <code className="text-pink-300">NEXT_PUBLIC_SUPABASE_URL</code> dan <code className="text-pink-300">NEXT_PUBLIC_SUPABASE_ANON_KEY</code>.</li>
              <li>Klik <strong>Deploy</strong>. Proyek akan online dalam hitungan detik!</li>
            </ol>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-white/10 bg-slate-900/60 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl text-xs font-bold text-white btn-gradient"
          >
            Mengerti & Tutup
          </button>
        </div>
      </div>
    </div>
  );
}
