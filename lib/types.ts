export type UserRole = 'user' | 'admin';

export interface UserProfile {
  id: string;
  username: string;
  full_name: string;
  avatar_url: string;
  role: UserRole;
  created_at: string;
  is_banned?: boolean;
}

export interface Post {
  id: string;
  user_id: string;
  title: string;
  description: string;
  category: string;
  image_url: string;
  image_path?: string;
  likes_count: number;
  comments_count: number;
  is_featured: boolean;
  created_at: string;
  updated_at?: string;
  author?: UserProfile;
  is_liked?: boolean;
}

export interface Comment {
  id: string;
  post_id: string;
  user_id: string;
  content: string;
  created_at: string;
  author?: UserProfile;
}

export interface Category {
  id: string;
  name: string;
  icon?: string;
}

export interface SystemStats {
  totalPosts: number;
  totalUsers: number;
  totalLikes: number;
  totalComments: number;
  storageUsedMb: number;
  isSupabaseConnected: boolean;
}
