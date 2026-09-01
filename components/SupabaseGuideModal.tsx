'use client';

import React from 'react';
import { X, Database, CheckCircle2, AlertTriangle, Code2, Server, Rocket, ShieldAlert, Sparkles } from 'lucide-react';
import { isSupabaseConfigured } from '../lib/supabase/client';

interface SupabaseGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function SupabaseGuideModal({ isOpen, onClose }: SupabaseGuideModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md animate-fade-in">
      <div className="glass-card w-full max-w-3xl rounded-3xl border border-slate-200 shadow-2xl animate-slide-up flex flex-col max-h-[90vh] bg-white">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/50">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-200">
              <Database className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                Integrasi Supabase & Production Vercel
                {isSupabaseConfigured ? (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                    Terhubung (Live)
                  </span>
                ) : (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-300">
                    Demo Mode (Fallback Local)
                  </span>
                )}
              </h2>
              <p className="text-xs text-slate-500 font-semibold">
                Panduan mudah untuk menghubungkan database Supabase dan deploy ke Vercel
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-5 text-xs text-slate-700">
          {/* Important Tip: Email Rate Limit & Confirm Email */}
          <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 space-y-2">
            <div className="flex items-center gap-2 font-bold text-amber-800 text-sm">
              <ShieldAlert className="w-4 h-4 text-amber-600" />
              <span>PENTING: Mengatasi &quot;Email rate limit exceeded&quot;</span>
            </div>
            <p className="leading-relaxed font-medium">
              Supabase bawaan membatasi pengiriman email konfirmasi (hanya 3-4 email per jam pada paket gratis). Agar pendaftaran akun dapat langsung login seketika tanpa batasan rate limit:
            </p>
            <ol className="list-decimal list-inside space-y-1 font-semibold text-amber-950 pl-1">
              <li>Buka <a href="https://supabase.com/dashboard" target="_blank" rel="noreferrer" className="text-indigo-600 underline">Supabase Dashboard</a> proyek Anda.</li>
              <li>Pilih menu <strong>Authentication</strong> → <strong>Providers</strong> → klik <strong>Email</strong>.</li>
              <li>Hilangkan centang (Uncheck) pada opsi <strong>&quot;Confirm email&quot;</strong> lalu klik <strong>Save</strong>.</li>
            </ol>
          </div>

          {/* Step 1: Schema */}
          <div className="glass-card p-4 rounded-2xl border border-slate-200 space-y-2 bg-slate-50/50">
            <div className="flex items-center gap-2 text-indigo-700 font-extrabold text-sm">
              <Code2 className="w-4 h-4" />
              <span>Langkah 1: Setup Database & Storage di Supabase</span>
            </div>
            <p className="text-slate-700 font-medium">
              Buka <strong>SQL Editor</strong> di Supabase Dashboard, lalu jalankan seluruh isi file:
            </p>
            <div className="p-2.5 rounded-xl bg-slate-900 font-mono text-[11px] text-emerald-400 border border-slate-700 font-bold">
              supabase/schema.sql
            </div>
            <p className="text-slate-500 text-[11px] font-semibold">
              Skrip ini akan membuat tabel <code className="text-indigo-700 font-bold">profiles</code>, <code className="text-indigo-700 font-bold">posts</code>, <code className="text-indigo-700 font-bold">comments</code>, <code className="text-indigo-700 font-bold">likes</code>, trigger otomatis, RLS Security, dan Storage Bucket <code className="text-indigo-700 font-bold">photos</code>.
            </p>
          </div>

          {/* Step 2: Environment Variables */}
          <div className="glass-card p-4 rounded-2xl border border-slate-200 space-y-2 bg-slate-50/50">
            <div className="flex items-center gap-2 text-purple-700 font-extrabold text-sm">
              <Server className="w-4 h-4" />
              <span>Langkah 2: Isikan Kunci `.env.local`</span>
            </div>
            <p className="text-slate-700 font-medium">
              Ambil kunci dari <strong>Project Settings → API</strong> di Supabase, lalu masukkan ke dalam file <code className="text-purple-700 font-bold">.env.local</code>:
            </p>
            <pre className="p-3 rounded-xl bg-slate-900 font-mono text-[11px] text-slate-100 border border-slate-700 overflow-x-auto">
{`NEXT_PUBLIC_SUPABASE_URL=https://<project-id>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOi...`}
            </pre>
          </div>

          {/* Step 3: Vercel Deployment */}
          <div className="glass-card p-4 rounded-2xl border border-slate-200 space-y-2 bg-slate-50/50">
            <div className="flex items-center gap-2 text-rose-700 font-extrabold text-sm">
              <Rocket className="w-4 h-4" />
              <span>Langkah 3: Deploy ke Vercel (Real Production)</span>
            </div>
            <ol className="list-decimal list-inside space-y-1.5 text-slate-700 font-medium pl-1">
              <li>Push repository ini ke GitHub.</li>
              <li>Impor proyek ke Dashboard <a href="https://vercel.com/new" target="_blank" rel="noreferrer" className="text-rose-600 underline font-bold">Vercel.com</a>.</li>
              <li>Di bagian <strong>Environment Variables</strong> di Vercel, tambahkan <code className="text-rose-700 font-bold">NEXT_PUBLIC_SUPABASE_URL</code> dan <code className="text-rose-700 font-bold">NEXT_PUBLIC_SUPABASE_ANON_KEY</code>.</li>
              <li>Klik <strong>Deploy</strong>.</li>
            </ol>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-100 bg-slate-50/50 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl text-xs font-bold text-white btn-primary cursor-pointer"
          >
            Mengerti & Tutup
          </button>
        </div>
      </div>
    </div>
  );
}
