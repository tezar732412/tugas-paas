'use client';

import React, { useState } from 'react';
import { UserProfile } from '../lib/types';
import { Shield, ShieldAlert, UserCheck, UserX, Search } from 'lucide-react';

interface AdminUserTableProps {
  users: UserProfile[];
  onToggleRole: (userId: string) => void;
  onToggleBan: (userId: string) => void;
}

export default function AdminUserTable({
  users,
  onToggleRole,
  onToggleBan,
}: AdminUserTableProps) {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredUsers = users.filter(
    (u) =>
      u.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.username.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="glass-panel rounded-3xl p-6 border border-white/10 space-y-4">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-base font-bold text-slate-100">Manajemen Pengguna & Akses Role</h3>
          <p className="text-xs text-slate-400">Total {users.length} pengguna terdaftar</p>
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Cari pengguna..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs rounded-xl glass-input"
          />
        </div>
      </div>

      <div className="overflow-x-auto rounded-2xl border border-white/10">
        <table className="w-full text-left text-xs text-slate-300">
          <thead className="bg-slate-900/80 text-slate-400 font-semibold border-b border-white/10 uppercase tracking-wider">
            <tr>
              <th className="py-3.5 px-4">Pengguna</th>
              <th className="py-3.5 px-4">Username</th>
              <th className="py-3.5 px-4">Role Saat Ini</th>
              <th className="py-3.5 px-4">Status Akun</th>
              <th className="py-3.5 px-4 text-right">Kelola Akses</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5 bg-slate-950/40">
            {filteredUsers.map((u) => (
              <tr key={u.id} className="hover:bg-white/5 transition-colors">
                <td className="py-3 px-4">
                  <div className="flex items-center gap-3">
                    <img
                      src={u.avatar_url}
                      alt={u.username}
                      className="w-9 h-9 rounded-xl object-cover ring-1 ring-white/10"
                    />
                    <div>
                      <p className="font-bold text-slate-200">{u.full_name}</p>
                      <p className="text-[10px] text-slate-400">
                        Bergabung {new Date(u.created_at).toLocaleDateString('id-ID')}
                      </p>
                    </div>
                  </div>
                </td>

                <td className="py-3 px-4 text-slate-300 font-mono text-xs">@{u.username}</td>

                <td className="py-3 px-4">
                  <span
                    className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-bold ${
                      u.role === 'admin'
                        ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                        : 'bg-slate-800 text-slate-400'
                    }`}
                  >
                    <Shield className="w-3 h-3" />
                    {u.role.toUpperCase()}
                  </span>
                </td>

                <td className="py-3 px-4">
                  {u.is_banned ? (
                    <span className="inline-flex items-center gap-1 text-rose-400 text-xs font-semibold">
                      <UserX className="w-3.5 h-3.5" /> Banned
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-emerald-400 text-xs font-semibold">
                      <UserCheck className="w-3.5 h-3.5" /> Aktif
                    </span>
                  )}
                </td>

                <td className="py-3 px-4 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <button
                      onClick={() => onToggleRole(u.id)}
                      className="px-3 py-1.5 rounded-xl text-[11px] font-semibold bg-indigo-600/20 text-indigo-300 border border-indigo-500/30 hover:bg-indigo-600/40 transition-colors"
                    >
                      Ubah Role
                    </button>

                    <button
                      onClick={() => onToggleBan(u.id)}
                      className={`px-3 py-1.5 rounded-xl text-[11px] font-semibold transition-colors ${
                        u.is_banned
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 hover:bg-emerald-500/30'
                          : 'bg-rose-500/20 text-rose-300 border border-rose-500/30 hover:bg-rose-500/30'
                      }`}
                    >
                      {u.is_banned ? 'Buka Suspend' : 'Suspend Akun'}
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
