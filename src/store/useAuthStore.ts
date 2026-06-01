import { create } from 'zustand';
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
  age?: number | null;
  phone_number?: string | null;
  is_volunteer?: boolean;
  onboarded?: boolean;
  location?: any;
}

interface AuthStore {
  user: any | null;
  profile: UserProfile | null;
  loading: boolean;
  initialized: boolean;
  isAdmin: boolean;
  isLoggedIn: boolean;
  _authSubscription: { unsubscribe: () => void } | null;
  initialize: () => Promise<void>;
  signInWithOAuth: (provider: 'google' | 'facebook' | 'twitter' | 'apple') => Promise<void>;
  signInWithEmail: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, fullName: string, role: string) => Promise<string>;
  signOut: () => Promise<void>;
  fetchProfile: (userId: string, userEmail?: string, userMeta?: any) => Promise<void>;
  updateProfile: (updates: Partial<UserProfile>, userIdOverride?: string) => Promise<void>;
  requestAdminAccess: () => Promise<void>;
}

export const SUPER_ADMIN_EMAIL = 'kshitijkumawat48@gmail.com';
export const SUPER_ADMIN_NAME = 'Kshitij';

export const useAuthStore = create<AuthStore>()((set, get) => ({
  user: null,
  profile: null,
  loading: false,
  initialized: false,
  isAdmin: false,
  isLoggedIn: false,
  _authSubscription: null,

  initialize: async () => {
    // Prevent duplicate subscriptions
    const existing = get()._authSubscription;
    if (existing) existing.unsubscribe();

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        set({ user: session.user, isLoggedIn: true });
        await get().fetchProfile(session.user.id, session.user.email, session.user.user_metadata);
      }
    } catch (e) {
      console.warn('Auth init error:', e);
    }
    set({ initialized: true });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (session?.user) {
        set({ user: session.user, isLoggedIn: true });
        await get().fetchProfile(session.user.id, session.user.email, session.user.user_metadata);
      } else {
        set({ user: null, profile: null, isAdmin: false, isLoggedIn: false });
      }
    });
    set({ _authSubscription: subscription });
  },

  fetchProfile: async (userId, userEmail, userMeta) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (!error && data) {
        set({
          profile: data as UserProfile,
          isAdmin: data.role === 'admin',
        });
        return;
      }

      // Profile doesn't exist yet — create it
      const email = userEmail || get().user?.email || '';
      const isSuper = email === SUPER_ADMIN_EMAIL;
      
      const pendingRole = localStorage.getItem('pending_signup_role');
      if (pendingRole) localStorage.removeItem('pending_signup_role');
      
      const newProfile: Partial<UserProfile> = {
        id: userId,
        full_name: userMeta?.full_name || userMeta?.name || (isSuper ? SUPER_ADMIN_NAME : email.split('@')[0]),
        email,
        role: (isSuper ? 'admin' : (pendingRole || 'citizen')) as UserRole,
        admin_approved: isSuper,
        admin_request: false,
        skills: [],
        avatar_url: userMeta?.avatar_url || null,
      };

      const { error: insertErr } = await supabase.from('profiles').upsert(newProfile);
      if (insertErr) console.warn('Profile upsert error:', insertErr.message);

      set({ profile: newProfile as UserProfile, isAdmin: isSuper });
    } catch (e) {
      console.warn('fetchProfile error:', e);
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
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      if (data.user) {
        set({ user: data.user, isLoggedIn: true });
        await get().fetchProfile(data.user.id, data.user.email, data.user.user_metadata);
      }
    } finally {
      set({ loading: false });
    }
  },

  signUp: async (email, password, fullName, role) => {
    set({ loading: true });
    const isSuper = email === SUPER_ADMIN_EMAIL;
    try {
      const { data, error } = await supabase.auth.signUp({
        email, password,
        options: { data: { full_name: fullName } },
      });
      if (error) throw error;
      if (data.user) {
        const profile: Partial<UserProfile> = {
          id: data.user.id,
          full_name: fullName,
          email,
          role: (isSuper ? 'admin' : role) as UserRole,
          admin_approved: isSuper,
          admin_request: false,
          skills: [],
        };
        // Only set local store — the real DB upsert happens in the onboarding
        // form submit with the full profile data. Doing it here fails with 401
        // when Supabase email confirmation is enabled (no session yet).
        set({ user: data.user, profile: profile as UserProfile, isAdmin: isSuper, isLoggedIn: true });
        return data.user.id;
      }
      return '';
    } finally {
      set({ loading: false });
    }
  },

  signOut: async () => {
    // Clear state immediately (optimistic) so the UI responds right away
    set({ user: null, profile: null, isAdmin: false, isLoggedIn: false });
    try {
      const { error } = await supabase.auth.signOut();
      if (error) console.warn('Supabase signOut error:', error.message);
    } catch (e) {
      console.warn('signOut exception:', e);
    }
  },

  updateProfile: async (updates, userIdOverride) => {
    const userId = userIdOverride || get().user?.id;
    if (!userId) {
      console.error('updateProfile: no userId available');
      throw new Error('User is not authenticated. Please try again.');
    }
    // Use upsert so it works whether the row exists or not,
    // and works even when email confirmation hasn't settled yet.
    const payload = { ...updates, id: userId };
    const { error } = await supabase.from('profiles').upsert(payload);
    if (error) {
      console.error('updateProfile upsert error:', error.message, error.details);
      throw new Error(error.message);
    }
    set((s) => {
      const newProfile = s.profile ? { ...s.profile, ...updates } : null;
      return { profile: newProfile, isAdmin: newProfile?.role === 'admin' };
    });
  },

  requestAdminAccess: async () => {
    const userId = get().user?.id;
    if (!userId) return;
    await supabase.from('profiles').update({ admin_request: true }).eq('id', userId);
    await supabase.from('admin_requests').insert({ user_id: userId, status: 'pending' });
    set((s) => ({ profile: s.profile ? { ...s.profile, admin_request: true } : null }));
  },
}));
