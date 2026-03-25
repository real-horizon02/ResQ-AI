import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { supabase } from '../lib/supabase';

export type UserRole = 'citizen' | 'volunteer' | 'admin';

export interface UserProfile {
  id: string;
  full_name: string | null;
  email: string | null;
  role: UserRole;
  city: string | null;
  state: string | null;
  skills: string[] | null;
  admin_approved: boolean;
  admin_request: boolean;
  avatar_url: string | null;
}

interface AuthStore {
  user: any | null;
  profile: UserProfile | null;
  loading: boolean;
  initialized: boolean;
  // Computed
  isAdmin: boolean;
  isLoggedIn: boolean;
  // Actions
  initialize: () => Promise<void>;
  signInWithOAuth: (provider: 'google' | 'facebook' | 'twitter' | 'apple') => Promise<void>;
  signInWithEmail: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, fullName: string, role: UserRole) => Promise<void>;
  signOut: () => Promise<void>;
  fetchProfile: (userId: string) => Promise<void>;
  updateProfile: (updates: Partial<UserProfile>) => Promise<void>;
  requestAdminAccess: () => Promise<void>;
}

// 👑 Pre-defined super-admin email
export const SUPER_ADMIN_EMAIL = 'kshitijkumawat48@gmail.com';
export const SUPER_ADMIN_NAME = 'Kshitij';

export const useAuthStore = create<AuthStore>()((set, get) => ({
  user: null,
  profile: null,
  loading: false,
  initialized: false,
  get isAdmin() { return get().profile?.role === 'admin'; },
  get isLoggedIn() { return !!get().user; },

  initialize: async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (session?.user) {
      set({ user: session.user });
      await get().fetchProfile(session.user.id);
    }
    set({ initialized: true });

    // Listen for auth changes
    supabase.auth.onAuthStateChange(async (_event, session) => {
      if (session?.user) {
        set({ user: session.user });
        await get().fetchProfile(session.user.id);
      } else {
        set({ user: null, profile: null });
      }
    });
  },

  fetchProfile: async (userId: string) => {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (error || !data) {
      // Profile doesn't exist yet — create it
      const user = get().user;
      const email = user?.email || '';
      const isSuper = email === SUPER_ADMIN_EMAIL;
      const newProfile: Partial<UserProfile> = {
        id: userId,
        full_name: user?.user_metadata?.full_name || user?.user_metadata?.name || SUPER_ADMIN_NAME,
        email,
        role: isSuper ? 'admin' : 'citizen',
        admin_approved: isSuper,
        admin_request: false,
        skills: [],
      };
      await supabase.from('profiles').upsert(newProfile);
      set({ profile: newProfile as UserProfile });
    } else {
      set({ profile: data as UserProfile });
    }
  },

  signInWithOAuth: async (provider) => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
        scopes: provider === 'google' ? 'email profile' : undefined,
      },
    });
    if (error) throw error;
  },

  signInWithEmail: async (email, password) => {
    set({ loading: true });
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) { set({ loading: false }); throw error; }
    if (data.user) await get().fetchProfile(data.user.id);
    set({ user: data.user, loading: false });
  },

  signUp: async (email, password, fullName, role) => {
    set({ loading: true });
    const isSuper = email === SUPER_ADMIN_EMAIL;
    const { data, error } = await supabase.auth.signUp({
      email, password,
      options: { data: { full_name: fullName } },
    });
    if (error) { set({ loading: false }); throw error; }
    if (data.user) {
      const profile: Partial<UserProfile> = {
        id: data.user.id,
        full_name: fullName,
        email,
        role: isSuper ? 'admin' : role,
        admin_approved: isSuper,
        admin_request: false,
        skills: [],
      };
      await supabase.from('profiles').upsert(profile);
      set({ user: data.user, profile: profile as UserProfile, loading: false });
    }
  },

  signOut: async () => {
    await supabase.auth.signOut();
    set({ user: null, profile: null });
  },

  updateProfile: async (updates) => {
    const userId = get().user?.id;
    if (!userId) return;
    const { error } = await supabase.from('profiles').update(updates).eq('id', userId);
    if (!error) set((s) => ({ profile: s.profile ? { ...s.profile, ...updates } : null }));
  },

  requestAdminAccess: async () => {
    const userId = get().user?.id;
    if (!userId) return;
    await supabase.from('profiles').update({ admin_request: true }).eq('id', userId);
    await supabase.from('admin_requests').insert({ user_id: userId, status: 'pending' });
    set((s) => ({ profile: s.profile ? { ...s.profile, admin_request: true } : null }));
  },
}));
