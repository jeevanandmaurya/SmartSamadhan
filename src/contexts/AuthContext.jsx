// NEW AUTH IMPLEMENTATION (Step 1)
// Goal: Clean slate, thinner context, service-based architecture.
// We keep the public API (user, login, signup, logout, loading, refreshProfile, updateSession)
// so the rest of the app keeps working while we rebuild under the hood.

import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import supabase from '../supabaseClient.js';

const AuthContext = createContext(null);

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
  return ctx;
}

function normalizeProfile(raw) {
  if (!raw) return null;
  return {
    id: raw.id,
    email: raw.email,
    username: raw.username || raw.user_metadata?.username || null,
    fullName: raw.fullName || raw.full_name || raw.user_metadata?.full_name || null,
    phone: raw.phone || raw.user_metadata?.phone || null,
    address: raw.address || raw.user_metadata?.address || null,
    permissionLevel: raw.permission_level || 'user',
    createdAt: raw.createdAt || raw.created_at,
    meta: raw.user_metadata || {},
  };
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const refreshProfile = useCallback(async () => {
    const { data: { session } } = await supabase.auth.getSession();
    const sessionUser = session?.user;

    if (!sessionUser) {
      console.log('[AuthContext] refreshProfile: No session user, clearing context.');
      setUser(null);
      return;
    }

    console.log(`[AuthContext] refreshProfile: Refreshing for user ID: ${sessionUser.id}`);

    // We need to probe both tables since we don't know if the session belongs to a user or admin yet.
    let refreshedProfile = null;
    let error = null;

    // 1. Check users table
    ({ data: refreshedProfile, error } = await supabase.from('users').select('*').eq('id', sessionUser.id).single());
    if (error && error.code !== 'PGRST116') {
      console.error('[AuthContext] refreshProfile: Error checking users table', error);
      // Don't return, fallback to checking admins
    }

    // 2. If not in users, check admins table
    if (!refreshedProfile) {
      ({ data: refreshedProfile, error } = await supabase.from('admins').select('*').eq('id', sessionUser.id).single());
      if (error && error.code !== 'PGRST116') {
        console.error('[AuthContext] refreshProfile: Error checking admins table', error);
      }
    }

    if (refreshedProfile) {
      const enriched = normalizeProfile({ ...sessionUser, ...refreshedProfile });
      console.log('[AuthContext] refreshProfile: Successfully refreshed profile.', enriched);
      setUser(enriched);
      localStorage.setItem('user', JSON.stringify(enriched));
    } else {
      console.warn(`[AuthContext] refreshProfile: Could not find a profile for user ${sessionUser.id}. Forcing logout.`);
      await logout();
    }
  }, []);

  // Session listener and initial load
  useEffect(() => {
    setLoading(true);
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log(`[AuthContext] Auth event: ${event}`);
      if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED' || event === 'INITIAL_SESSION') {
        if (session?.user) {
          // When a sign-in happens, the login function has already set the user.
          // We only need to refresh if the user context is missing.
          if (!user) {
            await refreshProfile();
          }
        }
      } else if (event === 'SIGNED_OUT') {
        setUser(null);
        localStorage.removeItem('user');
      }
      setLoading(false);
    });

    return () => {
      subscription?.unsubscribe();
    };
  }, [refreshProfile]);


  // API METHODS
  const loginUser = useCallback(async (email, password) => {
    if (!supabase) return { error: new Error('Supabase not configured') };
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({ email, password });
    if (authError) return { error: authError };

    const { data: userProfile, error: profileError } = await supabase
      .from('users')
      .select('*')
      .eq('id', authData.user.id)
      .single();

    if (profileError || !userProfile) {
      await supabase.auth.signOut(); // Sign out if profile doesn't exist in the right table
      return { error: new Error("User profile not found.") };
    }
    
    const enriched = normalizeProfile({ ...authData.user, ...userProfile });
    setUser(enriched);
    localStorage.setItem('user', JSON.stringify(enriched));
    return { data: enriched };
  }, []);

  const loginAdmin = useCallback(async (email, password) => {
    if (!supabase) return { error: new Error('Supabase not configured') };
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({ email, password });
    if (authError) return { error: authError };

    const { data: adminProfile, error: profileError } = await supabase
      .from('admins')
      .select('*')
      .eq('id', authData.user.id)
      .single();

    if (profileError || !adminProfile) {
      await supabase.auth.signOut(); // Sign out if profile doesn't exist in the right table
      return { error: new Error("Admin profile not found.") };
    }
    
    const enriched = normalizeProfile({ ...authData.user, ...adminProfile });
    setUser(enriched);
    localStorage.setItem('user', JSON.stringify(enriched));
    return { data: enriched };
  }, []);

  const signup = useCallback(async (email, password, metadata = {}) => {
    if (!supabase) return { error: new Error('Supabase not configured') };
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: metadata }
    });
    return { data, error };
  }, []);

  const logout = useCallback(async () => {
    if (!supabase) {
      setUser(null);
      return;
    }
    await supabase.auth.signOut();
    setUser(null);
    localStorage.removeItem('user');
  }, []);

  const value = {
    user,
    loading,
    loginUser,
    loginAdmin,
    signup,
    logout,
    refreshProfile,
    // updateSession is not implemented
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export default AuthContext;
