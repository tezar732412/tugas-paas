-- =========================================================
-- SUPABASE SCHEMA SETUP UNTUK SOCIAL MEDIA PHOTO APP (PICPULSE)
-- Jalankan query ini di Supabase SQL Editor proyek Anda.
-- =========================================================

-- 1. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. ENUM FOR USER ROLES
CREATE TYPE user_role AS ENUM ('user', 'admin');

-- 3. PROFILES TABLE
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  username TEXT UNIQUE NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  role user_role DEFAULT 'user'::user_role NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. POSTS TABLE (CRUD Photos)
CREATE TABLE IF NOT EXISTS public.posts (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  category TEXT DEFAULT 'General' NOT NULL,
  image_url TEXT NOT NULL,
  image_path TEXT,
  likes_count INT DEFAULT 0 NOT NULL,
  comments_count INT DEFAULT 0 NOT NULL,
  is_featured BOOLEAN DEFAULT FALSE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 5. COMMENTS TABLE
CREATE TABLE IF NOT EXISTS public.comments (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  post_id UUID REFERENCES public.posts(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 6. LIKES TABLE
CREATE TABLE IF NOT EXISTS public.likes (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  post_id UUID REFERENCES public.posts(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  UNIQUE(post_id, user_id)
);

-- 7. ENABLE ROW LEVEL SECURITY (RLS)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.likes ENABLE ROW LEVEL SECURITY;

-- 8. RLS POLICIES FOR PROFILES
CREATE POLICY "Public profiles are viewable by everyone" 
  ON public.profiles FOR SELECT USING (true);

CREATE POLICY "Users can insert their own profile" 
  ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update their own profile" 
  ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- 9. RLS POLICIES FOR POSTS (CRUD)
-- Read: Siapa saja bisa melihat postingan
CREATE POLICY "Posts are viewable by everyone" 
  ON public.posts FOR SELECT USING (true);

-- Create: User yang terotentikasi bisa upload postingan baru
CREATE POLICY "Authenticated users can create posts" 
  ON public.posts FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Update: Pemilik post ATAU Admin bisa mengedit post
CREATE POLICY "Users can update own post or admin can update any" 
  ON public.posts FOR UPDATE USING (
    auth.uid() = user_id OR EXISTS (
      SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Delete: Pemilik post ATAU Admin bisa menghapus post
CREATE POLICY "Users can delete own post or admin can delete any" 
  ON public.posts FOR DELETE USING (
    auth.uid() = user_id OR EXISTS (
      SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- 10. RLS POLICIES FOR COMMENTS & LIKES
CREATE POLICY "Comments viewable by everyone" ON public.comments FOR SELECT USING (true);
CREATE POLICY "Authenticated users can comment" ON public.comments FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own comment or admin" ON public.comments FOR DELETE USING (
  auth.uid() = user_id OR EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);

CREATE POLICY "Likes viewable by everyone" ON public.likes FOR SELECT USING (true);
CREATE POLICY "Authenticated users can like" ON public.likes FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can unlike" ON public.likes FOR DELETE USING (auth.uid() = user_id);

-- 11. TRIGGER UNTUK AUTOMATIC PROFILE CREATION UPON SIGN UP
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, username, full_name, avatar_url, role)
  VALUES (
    new.id,
    COALESCE(new.raw_user_meta_data->>'username', split_part(new.email, '@', 1)),
    COALESCE(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name', 'User PicPulse'),
    COALESCE(new.raw_user_meta_data->>'avatar_url', 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80'),
    'user'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 12. STORAGE BUCKET CONFIGURATION FOR PHOTOS
-- Catatan: Buat Bucket bernama 'photos' di Supabase Storage Dashboard (Set Public: Yes)
INSERT INTO storage.buckets (id, name, public) 
VALUES ('photos', 'photos', true)
ON CONFLICT (id) DO NOTHING;

-- Storage Policies
CREATE POLICY "Public Read Access for Photos Bucket"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'photos');

CREATE POLICY "Authenticated Upload Access for Photos Bucket"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'photos' AND auth.role() = 'authenticated');

CREATE POLICY "Owner or Admin Delete Access for Photos Bucket"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'photos' AND (auth.uid() = owner OR EXISTS (
    SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'
  )));
