'use client';

import React, { useState, useEffect } from 'react';
import { X, UploadCloud, Image as ImageIcon, Sparkles, AlertCircle, Check } from 'lucide-react';
import { Post, UserProfile } from '../lib/types';
import { isSupabaseConfigured } from '../lib/supabase/client';

interface UploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: UserProfile;
  editingPost?: Post | null;
  onSubmitPost: (
    postData: {
      title: string;
      description: string;
      category: string;
      image_url: string;
    },
    imageFile?: File | null
  ) => Promise<void>;
}

const CATEGORIES = ['Photography', 'Nature', 'Urban', 'Architecture', 'Art', 'Travel', 'Tech'];

export default function UploadModal({
  isOpen,
  onClose,
  currentUser,
  editingPost,
  onSubmitPost,
}: UploadModalProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('Photography');
  const [imageUrl, setImageUrl] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    if (editingPost) {
      setTitle(editingPost.title);
      setDescription(editingPost.description);
      setCategory(editingPost.category);
      setImageUrl(editingPost.image_url);
      setPreviewUrl(editingPost.image_url);
      setSelectedFile(null);
    } else {
      setTitle('');
      setDescription('');
      setCategory('Photography');
      setImageUrl('');
      setSelectedFile(null);
      setPreviewUrl('');
    }
    setErrorMsg('');
  }, [editingPost, isOpen]);

  if (!isOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        setErrorMsg('Ukuran file terlalu besar (Maksimal 10MB)');
        return;
      }
      setSelectedFile(file);
      const objectUrl = URL.createObjectURL(file);
      setPreviewUrl(objectUrl);
      setErrorMsg('');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setErrorMsg('Judul foto wajib diisi');
      return;
    }

    if (!editingPost && !selectedFile && !imageUrl.trim()) {
      setErrorMsg('Silakan pilih file gambar atau sertakan URL gambar');
      return;
    }

    try {
      setIsSubmitting(true);
      setErrorMsg('');

      let finalUrl = imageUrl;
      if (selectedFile && !isSupabaseConfigured) {
        finalUrl = await new Promise<string>((resolve) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result as string);
          reader.readAsDataURL(selectedFile);
        });
      }

      await onSubmitPost(
        {
          title,
          description,
          category,
          image_url: finalUrl,
        },
        selectedFile
      );

      setIsSubmitting(false);
      onClose();
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err?.message || 'Gagal menyimpan foto. Silakan coba lagi.');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md animate-fade-in">
      <div className="glass-card w-full max-w-2xl rounded-3xl border border-slate-200 shadow-2xl animate-slide-up flex flex-col max-h-[90vh] bg-white">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/50">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-indigo-50 text-indigo-600 border border-indigo-200">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-extrabold text-slate-900">
                {editingPost ? 'Edit Informasi Foto' : 'Upload Foto Baru'}
              </h2>
              <p className="text-xs text-slate-500">
                {isSupabaseConfigured
                  ? 'Foto akan tersimpan langsung di Supabase Storage & Database'
                  : 'Berjalan di Demo Mode. Foto disimpan di Local State'}
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

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-5">
          {errorMsg && (
            <div className="flex items-center gap-2 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Image Upload Area */}
          {!editingPost && (
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-2">
                Pilih Foto
              </label>
              <div className="relative border-2 border-dashed border-slate-300 hover:border-indigo-500 rounded-2xl p-6 text-center transition-colors bg-slate-50">
                {previewUrl ? (
                  <div className="relative aspect-video w-full max-h-56 rounded-xl overflow-hidden mx-auto bg-slate-900">
                    <img
                      src={previewUrl}
                      alt="Preview"
                      className="w-full h-full object-contain"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedFile(null);
                        setPreviewUrl('');
                        setImageUrl('');
                      }}
                      className="absolute top-2 right-2 p-1.5 rounded-full bg-slate-900/80 text-white hover:bg-rose-600 transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <label className="flex flex-col items-center justify-center cursor-pointer">
                    <UploadCloud className="w-10 h-10 text-indigo-600 mb-2 animate-bounce" />
                    <span className="text-sm font-bold text-slate-900">
                      Klik untuk memilih file foto
                    </span>
                    <span className="text-xs text-slate-500 mt-1">
                      Format PNG, JPG, WEBP hingga 10MB
                    </span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileChange}
                      className="hidden"
                    />
                  </label>
                )}
              </div>

              {/* Alternative Image URL Input */}
              <div className="mt-3">
                <p className="text-[11px] font-semibold text-slate-500 mb-1">
                  Atau gunakan URL Gambar eksternal (Unsplash, Imgur, dsb):
                </p>
                <div className="relative">
                  <input
                    type="url"
                    placeholder="https://images.unsplash.com/photo-..."
                    value={imageUrl}
                    onChange={(e) => {
                      setImageUrl(e.target.value);
                      setPreviewUrl(e.target.value);
                      setSelectedFile(null);
                    }}
                    className="w-full px-3 py-2 text-xs rounded-xl glass-input pl-9"
                  />
                  <ImageIcon className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                </div>
              </div>
            </div>
          )}

          {/* Title Input */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Judul Foto <span className="text-indigo-600">*</span>
            </label>
            <input
              type="text"
              placeholder="Contoh: Senja di Pantai Kuta"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-4 py-2.5 text-sm rounded-xl glass-input"
              required
            />
          </div>

          {/* Category Dropdown */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Kategori
            </label>
            <div className="flex flex-wrap gap-2">
              {CATEGORIES.map((cat) => (
                <button
                  type="button"
                  key={cat}
                  onClick={() => setCategory(cat)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    category === cat
                      ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                      : 'bg-slate-100 text-slate-700 border border-slate-200 hover:bg-slate-200'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Description Input */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Deskripsi / Cerita Foto
            </label>
            <textarea
              rows={3}
              placeholder="Tuliskan cerita singkat atau teknik fotografi di balik foto ini..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-4 py-2.5 text-sm rounded-xl glass-input resize-none"
            />
          </div>

          {/* Submit Button */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition-colors"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-bold text-white btn-primary disabled:opacity-50 cursor-pointer"
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Menyimpan...</span>
                </>
              ) : (
                <>
                  <Check className="w-4 h-4" />
                  <span>{editingPost ? 'Simpan Perubahan' : 'Upload Sekarang'}</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
