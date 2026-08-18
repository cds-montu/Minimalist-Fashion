import React from 'react';
import { googleLogout } from '@react-oauth/google';
import { getStorage, logError, logWarning, readJSON, writeJSON } from 'core/utils/storage';

export const AuthContext = React.createContext();

// Helper function to get stored user
export const getStoredUser = () => readJSON('user', null);

export function AuthProvider({ children }) {
  const [user, setUser] = React.useState(getStoredUser);
  const [token, setToken] = React.useState(() => {
    const local = getStorage('local');
    const session = getStorage('session');
    try {
      return local?.getItem('auth:token') || session?.getItem('auth:token') || null;
    } catch (error) {
      logWarning('AuthContext:readToken', error);
      return null;
    }
  });

  const saveSession = (u, t, remember) => {
    setUser(u);
    setToken(t);
    const store = getStorage(remember ? 'local' : 'session');
    const other = getStorage(remember ? 'session' : 'local');
    try {
      store?.setItem('auth:user', JSON.stringify(u));
      store?.setItem('auth:token', t);
      other?.removeItem('auth:user');
      other?.removeItem('auth:token');
    } catch (error) {
      // The session stays valid for this tab; warn that it will not survive a reload.
      logWarning('AuthContext:saveSession', error);
    }
  };

  // Local account storage for demo (replace with API in prod)
  const readAccounts = () => {
    const arr = readJSON('auth:accounts', []);
    return Array.isArray(arr) ? arr : [];
  };
  // Propagates: a signup whose credentials are not stored must not look successful.
  const writeAccounts = (arr) => writeJSON('auth:accounts', arr || []);

  const strongPassword = (pwd) => /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^\w\s]).{8,}$/.test(pwd);
  const validEmail = (e) => /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(e);

  const signup = async ({ name, email, password, avatar }) => {
    if (!validEmail(email)) throw new Error('Invalid email format');
    if (!strongPassword(password)) throw new Error('Password must be 8+ chars incl. upper, lower, number, symbol');
    const accounts = readAccounts();
    if (accounts.some((a) => a.email.toLowerCase() === email.toLowerCase())) {
      throw new Error('An account with this email already exists');
    }
    const u = { id: `u_${Date.now()}`, name: name || email.split('@')[0], email, avatar: avatar || null };
    const record = { ...u, password };
    writeAccounts([record, ...accounts]);
    const t = `jwt.${btoa(`${u.id}:${Date.now()}`)}.${Math.random().toString(36).slice(2)}`;
    saveSession(u, t, true);
    return u;
  };

  const login = async ({ email, password, remember = true }) => {
    const accounts = readAccounts();
    const acc = accounts.find((a) => a.email.toLowerCase() === String(email).toLowerCase());
    if (!acc || acc.password !== password) throw new Error('Invalid email or password');
    const u = { id: acc.id, name: acc.name, email: acc.email, avatar: acc.avatar || null };
    const t = `jwt.${btoa(`${u.id}:${Date.now()}`)}.${Math.random().toString(36).slice(2)}`;
    saveSession(u, t, remember);
    return u;
  };

  // Social login simulation (legacy). Prefer oauthLogin for real provider profile
  const socialLogin = async (provider) => {
    const id = `oauth_${provider}_${Date.now()}`;
    const email = `${provider}_user@example.com`;
    const u = { id, email, name: provider === 'google' ? 'Google User' : 'Apple User', avatar: null, provider };
    const t = `jwt.${btoa(`${u.id}:${Date.now()}`)}.${Math.random().toString(36).slice(2)}`;
    saveSession(u, t, true);
    return u;
  };

  // Real OAuth profile/token persister
  const oauthLogin = async (provider, tokenResponse) => {
    try {
      // Fetch user info from Google's API
      const res = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
        headers: {
          Authorization: `Bearer ${tokenResponse.access_token}`,
        },
      });
      
      if (!res.ok) {
        const error = new Error(`Failed to fetch user info (${res.status} ${res.statusText})`);
        error.status = res.status;
        throw error;
      }
      
      const userData = await res.json();
      const user = {
        id: userData.sub,
        name: userData.name,
        email: userData.email,
        avatar: userData.picture,
        provider,
        accessToken: tokenResponse.access_token
      };
      
      // Save user data to localStorage
      try {
        writeJSON('user', user);
      } catch (storageError) {
        logWarning('AuthContext:oauthLogin:persist', storageError);
      }

      setUser(user);
      return user;
    } catch (error) {
      logError('AuthContext:oauthLogin', error);
      throw error;
    }
  };

  const logout = () => {
    // If user was logged in with Google, sign out from Google
    if (user?.provider === 'google') {
      googleLogout();
    }
    
    // Clear all auth data
    setUser(null);
    setToken(null);
    try {
      const local = getStorage('local');
      const session = getStorage('session');
      ['user', 'auth:user', 'auth:token'].forEach((key) => {
        local?.removeItem(key);
        session?.removeItem(key);
      });
    } catch (error) {
      logError('AuthContext:logout', error);
    }
  };

  const updateUser = (patch) => {
    setUser((prev) => {
      if (!prev) return prev;
      const next = { ...prev, ...patch };
      try {
        const pay = JSON.stringify(next);
        const local = getStorage('local');
        const session = getStorage('session');
        if (local?.getItem('auth:user')) local.setItem('auth:user', pay);
        if (session?.getItem('auth:user')) session.setItem('auth:user', pay);
      } catch (error) {
        logWarning('AuthContext:updateUser', error);
      }
      return next;
    });
  };

  const value = { user, token, login, signup, socialLogin, oauthLogin, logout, updateUser };
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = React.useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
}
