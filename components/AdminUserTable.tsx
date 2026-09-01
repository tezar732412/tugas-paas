'use client';

import React, { useState } from 'react';
import { UserProfile } from '../lib/types';
import { Shield, UserCheck, UserX, Search } from 'lucide-react';

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
    <div className="glass-card rounded-3xl p-6 border border-slate-200/80 bg-white space-y-4 shadow-sm">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-base font-extrabold text-slate-900">Manajemen Pengguna & Akses Role</h3>
          <p className="text-xs text-slate-500 font-semibold">Total {users.length} pengguna terdaftar</p>
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

      <div className="overflow-x-auto rounded-2xl border border-slate-200">
        <table className="w-full text-left text-xs text-slate-700">
          <thead className="bg-slate-100 text-slate-800 font-extrabold border-b border-slate-200 uppercase tracking-wider">
            <tr>
              <th className="py-3.5 px-4">Pengguna</th>
              <th className="py-3.5 px-4">Username</th>
              <th className="py-3.5 px-4">Role Saat Ini</th>
              <th className="py-3.5 px-4">Status Akun</th>
              <th className="py-3.5 px-4 text-right">Kelola Akses</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 bg-white">
            {filteredUsers.map((u) => (
              <tr key={u.id} className="hover:bg-slate-50 transition-colors">
                <td className="py-3 px-4">
                  <div className="flex items-center gap-3">
                    <img
                      src={u.avatar_url}
                      alt={u.username}
                      className="w-9 h-9 rounded-xl object-cover ring-1 ring-slate-200"
                    />
                    <div>
                      <p className="font-extrabold text-slate-900">{u.full_name}</p>
                      <p className="text-[10px] text-slate-500 font-semibold">
                        Bergabung {new Date(u.created_at).toLocaleDateString('id-ID')}
                      </p>
                    </div>
                  </div>
                </td>

                <td className="py-3 px-4 text-slate-700 font-mono text-xs font-bold">@{u.username}</td>

                <td className="py-3 px-4">
                  <span
                    className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-extrabold ${
                      u.role === 'admin'
                        ? 'bg-purple-50 text-purple-700 border border-purple-200'
                        : 'bg-slate-100 text-slate-700 border border-slate-200'
                    }`}
                  >
                    <Shield className="w-3 h-3" />
                    {u.role.toUpperCase()}
                  </span>
                </td>

                <td className="py-3 px-4">
                  {u.is_banned ? (
                    <span className="inline-flex items-center gap-1 text-rose-600 text-xs font-bold">
                      <UserX className="w-3.5 h-3.5" /> Banned
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-emerald-600 text-xs font-bold">
                      <UserCheck className="w-3.5 h-3.5" /> Aktif
                    </span>
                  )}
                </td>

                <td className="py-3 px-4 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <button
                      onClick={() => onToggleRole(u.id)}
                      className="px-3 py-1.5 rounded-xl text-[11px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200 hover:bg-indigo-100 transition-colors cursor-pointer"
                    >
                      Ubah Role
                    </button>

                    <button
                      onClick={() => onToggleBan(u.id)}
                      className={`px-3 py-1.5 rounded-xl text-[11px] font-bold transition-colors cursor-pointer ${
                        u.is_banned
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100'
                          : 'bg-rose-50 text-rose-700 border border-rose-200 hover:bg-rose-100'
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
