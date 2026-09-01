import { Post, UserProfile, Comment, SystemStats } from './types';
import { supabase, isSupabaseConfigured } from './supabase/client';

// Local storage keys for session & fallback persistence
const LOCAL_POSTS_KEY = 'picpulse_posts_v3';
const LOCAL_USERS_KEY = 'picpulse_users_v3';
const LOCAL_COMMENTS_KEY = 'picpulse_comments_v3';
const LOCAL_AUTH_KEY = 'picpulse_auth_session_v3';

function getLocalData<T>(key: string, fallback: T): T {
  if (typeof window === 'undefined') return fallback;
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : fallback;
  } catch {
    return fallback;
  }
}

function setLocalData<T>(key: string, value: T): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (err) {
    console.error('Error writing to localStorage', err);
  }
}

// ----------------------------------------------------
// AUTHENTICATION STATE & HELPERS
// ----------------------------------------------------

export async function getCurrentUser(): Promise<UserProfile | null> {
  if (isSupabaseConfigured && supabase) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        let profile: UserProfile | null = null;
        try {
          const { data: profileData } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', user.id)
            .single();
          if (profileData) profile = profileData as UserProfile;
        } catch (err) {
          console.warn('Error fetching profile from Supabase', err);
        }

        const currentUser: UserProfile = profile || {
          id: user.id,
          username: user.user_metadata?.username || user.email?.split('@')[0] || 'user',
          full_name: user.user_metadata?.full_name || user.email?.split('@')[0] || 'User',
          avatar_url: user.user_metadata?.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.email}`,
          role: user.user_metadata?.role || 'user',
          created_at: user.created_at,
          is_banned: false,
        };

        setLocalAuthUser(currentUser);
        return currentUser;
      }
    } catch (e) {
      console.warn('Supabase getUser error, checking local session', e);
    }
  }

  // Local storage session
  return getLocalData<UserProfile | null>(LOCAL_AUTH_KEY, null);
}

export function setLocalAuthUser(user: UserProfile | null): void {
  setLocalData(LOCAL_AUTH_KEY, user);
  if (user) {
    // Add user to local users list for admin & store persistence
    const existingUsers = getLocalData<UserProfile[]>(LOCAL_USERS_KEY, []);
    if (!existingUsers.some((u) => u.id === user.id)) {
      const updated = [user, ...existingUsers];
      setLocalData(LOCAL_USERS_KEY, updated);
    }

    // Try background upsert to Supabase profiles table
    if (isSupabaseConfigured && supabase) {
      supabase
        .from('profiles')
        .upsert({
          id: user.id,
          username: user.username,
          full_name: user.full_name,
          avatar_url: user.avatar_url,
          role: user.role,
        })
        .then(({ error }) => {
          if (error) console.warn('Supabase profile upsert warning:', error.message);
        });
    }
  }
}

export async function logoutUser(): Promise<void> {
  if (isSupabaseConfigured && supabase) {
    try {
      await supabase.auth.signOut();
    } catch (e) {
      console.error('Supabase signout error', e);
    }
  }
  setLocalData(LOCAL_AUTH_KEY, null);
}

// ----------------------------------------------------
// STORE API FUNCTIONS
// ----------------------------------------------------

export async function fetchPosts(): Promise<Post[]> {
  let supabasePosts: Post[] = [];

  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase
        .from('posts')
        .select(`
          *,
          author:profiles(*)
        `)
        .order('created_at', { ascending: false });

      if (!error && data) {
        supabasePosts = data as Post[];
      }
    } catch (e) {
      console.warn('Supabase fetch failed, using fallback', e);
    }
  }

  // Local storage posts
  const localPosts = getLocalData<Post[]>(LOCAL_POSTS_KEY, []);

  // Merge posts without duplicates
  const map = new Map<string, Post>();
  supabasePosts.forEach((p) => map.set(p.id, p));
  localPosts.forEach((p) => {
    if (!map.has(p.id)) {
      map.set(p.id, p);
    }
  });

  const merged = Array.from(map.values()).sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );

  return merged;
}

export async function fetchPostById(id: string): Promise<Post | null> {
  const posts = await fetchPosts();
  return posts.find((p) => p.id === id) || null;
}

export async function createPost(
  newPost: Omit<Post, 'id' | 'created_at' | 'likes_count' | 'comments_count' | 'is_featured'>,
  imageFile?: File | null
): Promise<Post> {
  let finalImageUrl = newPost.image_url;
  let imagePath = '';

  // Handle Supabase Storage upload if configured
  if (isSupabaseConfigured && supabase && imageFile) {
    try {
      const fileExt = imageFile.name.split('.').pop();
      const fileName = `${Date.now()}_${Math.random().toString(36).substring(2, 9)}.${fileExt}`;
      imagePath = fileName;

      const { data: uploadData, error: uploadErr } = await supabase.storage
        .from('photos')
        .upload(fileName, imageFile);

      if (!uploadErr && uploadData) {
        const { data: publicUrlData } = supabase.storage
          .from('photos')
          .getPublicUrl(fileName);
        finalImageUrl = publicUrlData.publicUrl;
      }
    } catch (err) {
      console.error('Supabase storage upload error:', err);
    }
  }

  // Prepare author profile
  const users = await fetchUsers();
  const currentSessionUser = getLocalData<UserProfile | null>(LOCAL_AUTH_KEY, null);
  const author = users.find((u) => u.id === newPost.user_id) || currentSessionUser || {
    id: newPost.user_id,
    username: 'user',
    full_name: 'Pengguna',
    avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200',
    role: 'user',
    created_at: new Date().toISOString(),
  };

  const createdPost: Post = {
    id: `post_${Date.now()}`,
    user_id: newPost.user_id,
    title: newPost.title,
    description: newPost.description,
    category: newPost.category,
    image_url: finalImageUrl,
    likes_count: 0,
    comments_count: 0,
    is_featured: false,
    created_at: new Date().toISOString(),
    author,
    is_liked: false,
  };

  // Insert into Supabase database if configured
  if (isSupabaseConfigured && supabase) {
    try {
      // Guarantee author profile exists in profiles table before inserting post
      await supabase.from('profiles').upsert({
        id: author.id,
        username: author.username,
        full_name: author.full_name,
        avatar_url: author.avatar_url,
        role: author.role,
      });

      const payload = {
        user_id: newPost.user_id,
        title: newPost.title,
        description: newPost.description,
        category: newPost.category,
        image_url: finalImageUrl,
        image_path: imagePath,
        likes_count: 0,
        comments_count: 0,
        is_featured: false,
      };

      const { data, error } = await supabase
        .from('posts')
        .insert(payload)
        .select(`*, author:profiles(*)`)
        .single();

      if (!error && data) {
        const dbPost = data as Post;
        // Save to localStorage as backup
        const existingPosts = getLocalData<Post[]>(LOCAL_POSTS_KEY, []);
        setLocalData(LOCAL_POSTS_KEY, [dbPost, ...existingPosts]);
        return dbPost;
      }
    } catch (err) {
      console.error('Supabase post insert failed, saving locally:', err);
    }
  }

  // Local Storage Save (Guarantees post is NEVER lost)
  const existingPosts = getLocalData<Post[]>(LOCAL_POSTS_KEY, []);
  const updatedPosts = [createdPost, ...existingPosts];
  setLocalData(LOCAL_POSTS_KEY, updatedPosts);

  return createdPost;
}

export async function updatePost(
  postId: string,
  updates: Partial<Pick<Post, 'title' | 'description' | 'category' | 'is_featured'>>
): Promise<Post | null> {
  // Update local storage
  const posts = getLocalData<Post[]>(LOCAL_POSTS_KEY, []);
  let updatedPost: Post | null = null;
  const newPosts = posts.map((p) => {
    if (p.id === postId) {
      updatedPost = { ...p, ...updates, updated_at: new Date().toISOString() };
      return updatedPost;
    }
    return p;
  });
  setLocalData(LOCAL_POSTS_KEY, newPosts);

  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase
        .from('posts')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', postId)
        .select(`*, author:profiles(*)`)
        .single();

      if (!error && data) {
        return data as Post;
      }
    } catch (err) {
      console.error('Supabase update err:', err);
    }
  }

  return updatedPost;
}

export async function deletePost(postId: string): Promise<boolean> {
  // Remove from local storage
  const posts = getLocalData<Post[]>(LOCAL_POSTS_KEY, []);
  const filtered = posts.filter((p) => p.id !== postId);
  setLocalData(LOCAL_POSTS_KEY, filtered);

  if (isSupabaseConfigured && supabase) {
    try {
      await supabase.from('posts').delete().eq('id', postId);
    } catch (err) {
      console.error('Supabase delete err:', err);
    }
  }

  return true;
}

export async function toggleLikePost(postId: string, currentUserId: string): Promise<{ likesCount: number; isLiked: boolean }> {
  const posts = getLocalData<Post[]>(LOCAL_POSTS_KEY, []);
  let newLikes = 0;
  let isLiked = false;

  const newPosts = posts.map((p) => {
    if (p.id === postId) {
      isLiked = !p.is_liked;
      newLikes = isLiked ? p.likes_count + 1 : Math.max(0, p.likes_count - 1);
      return { ...p, likes_count: newLikes, is_liked: isLiked };
    }
    return p;
  });

  setLocalData(LOCAL_POSTS_KEY, newPosts);

  if (isSupabaseConfigured && supabase) {
    try {
      await supabase.from('posts').update({ likes_count: newLikes }).eq('id', postId);
    } catch (e) {
      console.error('Supabase like update error', e);
    }
  }

  return { likesCount: newLikes, isLiked };
}

export async function fetchComments(postId: string): Promise<Comment[]> {
  let supabaseComments: Comment[] = [];

  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase
        .from('comments')
        .select(`*, author:profiles(*)`)
        .eq('post_id', postId)
        .order('created_at', { ascending: true });

      if (!error && data) supabaseComments = data as Comment[];
    } catch (err) {
      console.warn('Comments fetch err:', err);
    }
  }

  const allLocalComments = getLocalData<Record<string, Comment[]>>(LOCAL_COMMENTS_KEY, {});
  const localComments = allLocalComments[postId] || [];

  const map = new Map<string, Comment>();
  supabaseComments.forEach((c) => map.set(c.id, c));
  localComments.forEach((c) => {
    if (!map.has(c.id)) map.set(c.id, c);
  });

  return Array.from(map.values());
}

export async function addComment(postId: string, userId: string, content: string): Promise<Comment> {
  const users = await fetchUsers();
  const currentSessionUser = getLocalData<UserProfile | null>(LOCAL_AUTH_KEY, null);
  const author = users.find((u) => u.id === userId) || currentSessionUser || {
    id: userId,
    username: 'user',
    full_name: 'Pengguna',
    avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200',
    role: 'user',
    created_at: new Date().toISOString(),
  };

  const newComment: Comment = {
    id: `c_${Date.now()}`,
    post_id: postId,
    user_id: userId,
    content,
    created_at: new Date().toISOString(),
    author,
  };

  if (isSupabaseConfigured && supabase) {
    try {
      // Ensure profile exists in profiles table
      await supabase.from('profiles').upsert({
        id: author.id,
        username: author.username,
        full_name: author.full_name,
        avatar_url: author.avatar_url,
        role: author.role,
      });

      await supabase.from('comments').insert({
        post_id: postId,
        user_id: userId,
        content,
      });
    } catch (e) {
      console.error('Supabase comment add error', e);
    }
  }

  const allComments = getLocalData<Record<string, Comment[]>>(LOCAL_COMMENTS_KEY, {});
  const postComments = [...(allComments[postId] || []), newComment];
  allComments[postId] = postComments;
  setLocalData(LOCAL_COMMENTS_KEY, allComments);

  // Update post comment count
  const posts = getLocalData<Post[]>(LOCAL_POSTS_KEY, []);
  const updatedPosts = posts.map((p) => {
    if (p.id === postId) {
      return { ...p, comments_count: p.comments_count + 1 };
    }
    return p;
  });
  setLocalData(LOCAL_POSTS_KEY, updatedPosts);

  return newComment;
}

export async function deleteComment(postId: string, commentId: string): Promise<boolean> {
  const allComments = getLocalData<Record<string, Comment[]>>(LOCAL_COMMENTS_KEY, {});
  if (allComments[postId]) {
    allComments[postId] = allComments[postId].filter((c) => c.id !== commentId);
    setLocalData(LOCAL_COMMENTS_KEY, allComments);
  }

  if (isSupabaseConfigured && supabase) {
    try {
      await supabase.from('comments').delete().eq('id', commentId);
    } catch (e) {
      console.error('Supabase comment delete error', e);
    }
  }

  return true;
}

export async function fetchUsers(): Promise<UserProfile[]> {
  let supabaseUsers: UserProfile[] = [];

  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (!error && data) {
        supabaseUsers = data as UserProfile[];
      }
    } catch (e) {
      console.warn('Profiles fetch error:', e);
    }
  }

  const localUsers = getLocalData<UserProfile[]>(LOCAL_USERS_KEY, []);

  // Merge users without duplicates
  const map = new Map<string, UserProfile>();
  supabaseUsers.forEach((u) => map.set(u.id, u));
  localUsers.forEach((u) => {
    if (!map.has(u.id)) map.set(u.id, u);
  });

  return Array.from(map.values());
}

export async function toggleUserRole(userId: string): Promise<UserProfile | null> {
  const users = await fetchUsers();
  let updatedUser: UserProfile | null = null;

  const newUsers = users.map((u) => {
    if (u.id === userId) {
      updatedUser = { ...u, role: (u.role === 'admin' ? 'user' : 'admin') as 'user' | 'admin' };
      return updatedUser;
    }
    return u;
  });

  setLocalData(LOCAL_USERS_KEY, newUsers);

  if (isSupabaseConfigured && supabase && updatedUser) {
    try {
      await supabase.from('profiles').update({ role: (updatedUser as UserProfile).role }).eq('id', userId);
    } catch (e) {
      console.error('Supabase role update error', e);
    }
  }

  return updatedUser;
}

export async function toggleBanUser(userId: string): Promise<UserProfile | null> {
  const users = await fetchUsers();
  let updatedUser: UserProfile | null = null;

  const newUsers = users.map((u) => {
    if (u.id === userId) {
      updatedUser = { ...u, is_banned: !u.is_banned };
      return updatedUser;
    }
    return u;
  });

  setLocalData(LOCAL_USERS_KEY, newUsers);
  return updatedUser;
}

export async function fetchSystemStats(): Promise<SystemStats> {
  const posts = await fetchPosts();
  const users = await fetchUsers();

  const totalLikes = posts.reduce((acc, p) => acc + p.likes_count, 0);
  const totalComments = posts.reduce((acc, p) => acc + p.comments_count, 0);

  return {
    totalPosts: posts.length,
    totalUsers: users.length,
    totalLikes,
    totalComments,
    storageUsedMb: Number((posts.length * 2.4).toFixed(1)),
    isSupabaseConnected: isSupabaseConfigured,
  };
}
