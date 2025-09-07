import { createContext, useContext, useState, useEffect } from 'react';
import supabase from '../supabaseClient.js';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const usingSupabase = Boolean(supabase);

  useEffect(() => {
  if (usingSupabase) {
      const normalizeProfile = (raw, fallbackRole='user') => {
        if (!raw) return null;
        return {
          ...raw,
            fullName: raw.fullName || raw.full_name || raw.full_name, // compat
            createdAt: raw.createdAt || raw.created_at,
            role: raw.role || fallbackRole
        };
      };

  // Enrich a freshly authenticated user with profile data (admins/users tables)
  // IMPORTANT: Must receive the ORIGINAL session.user object (with user_metadata) –
  // NOT the stripped provisional object. Passing a provisional (without user_metadata)
  // caused admin metadata detection to fail and downgraded admins to regular users.
  const fetchAndEnrichProfile = async (sessionUser, attempt = 1) => {
        try {
          console.log(`[Auth] Enriching profile for user: ${sessionUser.email}`);

          // SINGLE SOURCE OF TRUTH: Check only metadata for roles
          const hasAdminMetadata = sessionUser.user_metadata?.is_admin === true;
          const determinedRole = hasAdminMetadata ? 'admin' : 'user';

          console.log(`[Auth] User has admin metadata: ${hasAdminMetadata}, determined role: ${determinedRole}`);

          // Try to get profile data from appropriate table based on role
          if (hasAdminMetadata) {
            // Try admins table for admins
            const { data: adminProfile } = await supabase
              .from('admins')
              .select('*')
              .eq('id', sessionUser.id)
              .maybeSingle();

            if (adminProfile) {
              console.log(`[Auth] Found admin profile in admins table`);
              const enrichedProfile = {
                id: sessionUser.id,
                email: sessionUser.email,
                full_name: adminProfile.full_name || adminProfile.fullName || 'Administrator',
                fullName: adminProfile.full_name || adminProfile.fullName || 'Administrator',
                username: adminProfile.username || 'admin',
                phone: adminProfile.phone,
                address: adminProfile.address,
                created_at: adminProfile.created_at || sessionUser.created_at,
                role: 'admin'
              };
              return enrichedProfile;
            } else {
              console.log(`[Auth] No admin profile found, creating basic admin profile`);
              // Create basic admin profile if not found in table
              return normalizeProfile({
                ...sessionUser,
                full_name: sessionUser.user_metadata?.full_name || 'Administrator',
                username: sessionUser.user_metadata?.username || 'admin',
              }, 'admin');
            }
          } else {
            // Try users table for regular users
            const { data: userProfile } = await supabase
              .from('users')
              .select('*')
              .eq('id', sessionUser.id)
              .maybeSingle();

            if (userProfile) {
              console.log(`[Auth] Found user profile in users table`);
              return normalizeProfile({ ...sessionUser, ...userProfile }, 'user');
            } else {
              console.log(`[Auth] No user profile found, creating basic user profile`);
              return normalizeProfile({
                ...sessionUser,
                full_name: sessionUser.user_metadata?.full_name || 'User',
                username: sessionUser.user_metadata?.username || 'user',
              }, 'user');
            }
          }
        } catch (err) {
          console.warn('[Auth] Profile enrichment failed:', err.message);
          // Emergency fallback: use metadata only
          const hasAdminMetadata = sessionUser.user_metadata?.is_admin === true;
          console.log(`[Auth] Emergency fallback - metadata only, role: ${hasAdminMetadata ? 'admin' : 'user'}`);
          return normalizeProfile(sessionUser, hasAdminMetadata ? 'admin' : 'user');
        }
      };

      const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
        console.log('[Auth] onAuthStateChange event =', event, ' hasSession=', !!session);
        if (session?.user) {
          // Provisional user (quickly unblock UI) - check both metadata and default
          const hasAdminMetadata = session.user.user_metadata?.is_admin === true;
          console.log('[Auth] Provisional user has admin metadata:', hasAdminMetadata);

          const provisional = normalizeProfile({
            id: session.user.id,
            email: session.user.email,
            full_name: session.user.user_metadata?.full_name,
            username: session.user.user_metadata?.username,
            phone: session.user.user_metadata?.phone,
            address: session.user.user_metadata?.address,
            created_at: session.user.created_at,
            role: hasAdminMetadata ? 'admin' : 'user',
            // Preserve metadata snapshot so enrichment can reliably detect admin again
            user_metadata: session.user.user_metadata
          }, hasAdminMetadata ? 'admin' : 'user');

          console.log('[Auth] Setting provisional user:', { id: provisional.id, email: provisional.email, role: provisional.role });
          setUser(prev => prev || provisional);
          setLoading(false); // allow protected routes to proceed

          // Enrich in background
          // Use ORIGINAL session.user (contains full user_metadata) for enrichment.
          const enriched = await fetchAndEnrichProfile(session.user);
          setUser(enriched);
          localStorage.setItem('user', JSON.stringify(enriched));
        } else {
          console.log('[Auth] No session present -> clearing user');
          setUser(null);
          localStorage.removeItem('user');
          setLoading(false);
        }
      });
      return () => { subscription.unsubscribe(); };
  }
  }, [usingSupabase]);

  const login = async (identifier, password) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email: identifier, password });
      if (error) {
        console.error('Supabase login error:', error);
        return false;
      }
      return Boolean(data.session);
    } catch (e) {
      console.error('Login error:', e);
      return false;
    }
  };

  const signup = async (email, password, extra = {}) => {
    // The handle_new_user trigger in the database will automatically create the
    // user profile in the correct table (users or admins) using the metadata.
    // The client just needs to call signUp and pass the extra data.
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: extra, // Pass all extra data like username, full_name, etc.
      },
    });

    if (error) {
      console.error('Database error saving new user.', error);
    }

    return { data, error };
  };

  const logout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) console.warn('Supabase signOut reported error:', error.message);
      // Give onAuthStateChange listener a tick to run
      await new Promise(r => setTimeout(r, 80));
      // Double-check session cleared
      const { data: sessionCheck } = await supabase.auth.getSession();
      if (sessionCheck?.session) {
        console.warn('Session still present after signOut; forcing local storage token purge.');
        try {
          const ref = (supabase?.supabaseUrl || '').replace('https://','').split('.')[0];
          // Remove any sb-<ref>-auth-token* keys
            Object.keys(window.localStorage)
              .filter(k => k.startsWith('sb-') && k.includes('-auth-token'))
              .forEach(k => localStorage.removeItem(k));
        } catch (e) {
          console.warn('Forced token purge failed:', e);
        }
      }
    } catch (e) {
      console.warn('Sign out error (continuing local cleanup):', e);
    } finally {
      setUser(null);
      localStorage.removeItem('user');
      console.log('[Auth] logout complete (user cleared)');

      // Always clear Supabase auth tokens for safety
      try {
        Object.keys(localStorage)
          .filter(k => k.startsWith('sb-'))
          .forEach(k => localStorage.removeItem(k));
        console.log('[Auth] cleared all Supabase localStorage keys');
      } catch (e) {
        console.warn('Failed to clear Supabase keys:', e);
      }
    }
  };

  const updateSession = (partial) => {
    setUser(prev => {
      if (!prev) return prev;
      const updated = { ...prev, ...partial };
      localStorage.setItem('user', JSON.stringify(updated));
      return updated;
    });
  };

  const refreshProfile = async () => {
    if (!user) return null;
    try {
      // Try users first then admins
      const { data: userRow } = await supabase.from('users').select('*').eq('id', user.id).maybeSingle();
      const { data: adminRow } = userRow ? { data: null } : await supabase.from('admins').select('*').eq('id', user.id).maybeSingle();
      const raw = userRow || adminRow;
      if (!raw) return user; // nothing newer
      const normalized = {
        ...user,
        ...raw,
        fullName: raw.fullName || raw.full_name || user.fullName,
        createdAt: raw.createdAt || raw.created_at || user.createdAt
      };
      setUser(normalized);
      localStorage.setItem('user', JSON.stringify(normalized));
      return normalized;
    } catch (e) {
      console.warn('Failed to refresh profile', e);
      return user;
    }
  };

  const value = {
    user,
    login,
    signup,
    logout,
    loading,
    updateSession,
    refreshProfile,
    usingSupabase
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
