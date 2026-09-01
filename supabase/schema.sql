-- =========================================================
-- SUPABASE SCHEMA SETUP UNTUK SOCIAL MEDIA PHOTO APP (PICPULSE)
-- Jalankan query ini di Supabase SQL Editor proyek Anda.
-- =========================================================

-- 0. CLEANUP PREVIOUS INCOMPLETE TABLES (Sangat Penting jika skrip pernah gagal sebelumnya)
DROP TABLE IF EXISTS public.likes CASCADE;
DROP TABLE IF EXISTS public.comments CASCADE;
DROP TABLE IF EXISTS public.posts CASCADE;
DROP TABLE IF EXISTS public.profiles CASCADE;

-- 1. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. ENUM FOR USER ROLES
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_role') THEN
    CREATE TYPE user_role AS ENUM ('user', 'admin');
  END IF;
END $$;

-- 3. PROFILES TABLE (Linked to auth.users)
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username TEXT UNIQUE NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  role user_role DEFAULT 'user'::user_role NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. POSTS TABLE (CRUD Photos)
CREATE TABLE public.posts (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
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
CREATE TABLE public.comments (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  post_id UUID NOT NULL REFERENCES public.posts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 6. LIKES TABLE
CREATE TABLE public.likes (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  post_id UUID NOT NULL REFERENCES public.posts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  UNIQUE(post_id, user_id)
);

-- 7. ENABLE ROW LEVEL SECURITY (RLS)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.likes ENABLE ROW LEVEL SECURITY;

-- 8. RLS POLICIES FOR PROFILES
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON public.profiles;
CREATE POLICY "Public profiles are viewable by everyone" 
  ON public.profiles FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can insert profiles" ON public.profiles;
CREATE POLICY "Users can insert profiles" 
  ON public.profiles FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Users can update profiles" ON public.profiles;
CREATE POLICY "Users can update profiles" 
  ON public.profiles FOR UPDATE USING (true);

-- 9. RLS POLICIES FOR POSTS
DROP POLICY IF EXISTS "Posts are viewable by everyone" ON public.posts;
CREATE POLICY "Posts are viewable by everyone" 
  ON public.posts FOR SELECT USING (true);

DROP POLICY IF EXISTS "Posts insert policy" ON public.posts;
CREATE POLICY "Posts insert policy" 
  ON public.posts FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Posts update policy" ON public.posts;
CREATE POLICY "Posts update policy" 
  ON public.posts FOR UPDATE USING (true);

DROP POLICY IF EXISTS "Posts delete policy" ON public.posts;
CREATE POLICY "Posts delete policy" 
  ON public.posts FOR DELETE USING (true);

-- 10. RLS POLICIES FOR COMMENTS & LIKES
DROP POLICY IF EXISTS "Comments viewable by everyone" ON public.comments;
CREATE POLICY "Comments viewable by everyone" ON public.comments FOR SELECT USING (true);

DROP POLICY IF EXISTS "Comments insert policy" ON public.comments;
CREATE POLICY "Comments insert policy" ON public.comments FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Comments delete policy" ON public.comments;
CREATE POLICY "Comments delete policy" ON public.comments FOR DELETE USING (true);

DROP POLICY IF EXISTS "Likes viewable by everyone" ON public.likes;
CREATE POLICY "Likes viewable by everyone" ON public.likes FOR SELECT USING (true);

DROP POLICY IF EXISTS "Likes insert policy" ON public.likes;
CREATE POLICY "Likes insert policy" ON public.likes FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Likes delete policy" ON public.likes;
CREATE POLICY "Likes delete policy" ON public.likes FOR DELETE USING (true);

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
    CASE 
      WHEN (new.raw_user_meta_data->>'role') = 'admin' THEN 'admin'::user_role 
      ELSE 'user'::user_role 
    END
  )
  ON CONFLICT (id) DO UPDATE SET
    username = EXCLUDED.username,
    full_name = EXCLUDED.full_name,
    avatar_url = EXCLUDED.avatar_url,
    role = EXCLUDED.role;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 12. STORAGE BUCKET CONFIGURATION FOR PHOTOS
INSERT INTO storage.buckets (id, name, public) 
VALUES ('photos', 'photos', true)
ON CONFLICT (id) DO NOTHING;

-- Storage Policies
DROP POLICY IF EXISTS "Public Read Access for Photos Bucket" ON storage.objects;
CREATE POLICY "Public Read Access for Photos Bucket"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'photos');

DROP POLICY IF EXISTS "Public Upload Access for Photos Bucket" ON storage.objects;
CREATE POLICY "Public Upload Access for Photos Bucket"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'photos');

DROP POLICY IF EXISTS "Public Delete Access for Photos Bucket" ON storage.objects;
CREATE POLICY "Public Delete Access for Photos Bucket"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'photos');
