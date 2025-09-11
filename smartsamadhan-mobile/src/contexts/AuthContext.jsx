import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
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

    const { data: userProfile, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', sessionUser.id)
      .single();

    if (error) {
      console.error(`[AuthContext] refreshProfile: Error fetching user profile for ${sessionUser.id}`, error);
      await logout();
      return;
    }

    if (userProfile) {
      const enriched = normalizeProfile({ ...sessionUser, ...userProfile });
      console.log('[AuthContext] refreshProfile: Successfully refreshed profile.', enriched);
      setUser(enriched);
      await AsyncStorage.setItem('user', JSON.stringify(enriched));
      await AsyncStorage.setItem('userType', 'user');
    } else {
      console.warn(`[AuthContext] refreshProfile: Could not find a profile for user ${sessionUser.id}. Forcing logout.`);
      await logout();
    }
  }, []);

  // Session listener and initial load
  useEffect(() => {
    const initializeAuth = async () => {
      setLoading(true);
      const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
        console.log(`[AuthContext] Auth event: ${event}`);

        if (event === 'INITIAL_SESSION') {
          if (session?.user) {
            await refreshProfile();
          }
        } else if (event === 'SIGNED_OUT') {
          setUser(null);
          await AsyncStorage.removeItem('user');
          await AsyncStorage.removeItem('userType');
        }

        setLoading(false);
      });
      return () => {
        subscription?.unsubscribe();
      };
    };

    initializeAuth();
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
      await supabase.auth.signOut();
      return { error: new Error("User profile not found.") };
    }

    const enriched = normalizeProfile({ ...authData.user, ...userProfile });
    setUser(enriched);
    await AsyncStorage.setItem('user', JSON.stringify(enriched));
    await AsyncStorage.setItem('userType', 'user');
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

  const logout = useCallback(async (navigation) => {
    if (!supabase) {
      setUser(null);
      if (navigation) {
        navigation.replace('Login');
      }
      return;
    }
    await supabase.auth.signOut();
    setUser(null);
    await AsyncStorage.removeItem('user');
    await AsyncStorage.removeItem('userType');
    if (navigation) {
      navigation.replace('Login');
    }
  }, []);

  const value = {
    user,
    loading,
    loginUser,
    signup,
    logout,
    refreshProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export default AuthContext;
