import React from 'react';
import { googleLogout } from '@react-oauth/google';
import { readArray, readJSON, readRaw, removeKeys, writeJSON, writeRaw } from 'core/utils/storage';
import { isStrongPassword, isValidEmail, PASSWORD_REQUIREMENTS_MESSAGE } from 'core/utils/validation';

export const AuthContext = React.createContext();

const USER_KEY = 'user';
const SESSION_USER_KEY = 'auth:user';
const SESSION_TOKEN_KEY = 'auth:token';
const ACCOUNTS_KEY = 'auth:accounts';

// Helper function to get stored user
export const getStoredUser = () => readJSON(USER_KEY, null);

const createToken = (userId) =>
  `jwt.${btoa(`${userId}:${Date.now()}`)}.${Math.random().toString(36).slice(2)}`;

export function AuthProvider({ children }) {
  const [user, setUser] = React.useState(getStoredUser);
  const [token, setToken] = React.useState(
    () => readRaw(SESSION_TOKEN_KEY) || readRaw(SESSION_TOKEN_KEY, { session: true }) || null
  );

  const saveSession = (u, t, remember) => {
    setUser(u);
    setToken(t);
    const target = { session: !remember };
    writeJSON(SESSION_USER_KEY, u, target);
    writeRaw(SESSION_TOKEN_KEY, t, target);
    removeKeys([SESSION_USER_KEY, SESSION_TOKEN_KEY], { session: remember });
  };

  // Local account storage for demo (replace with API in prod)
  const readAccounts = () => readArray(ACCOUNTS_KEY);
  const writeAccounts = (arr) => writeJSON(ACCOUNTS_KEY, arr || []);

  const signup = async ({ name, email, password, avatar }) => {
    if (!isValidEmail(email)) throw new Error('Invalid email format');
    if (!isStrongPassword(password)) throw new Error(PASSWORD_REQUIREMENTS_MESSAGE);
    const accounts = readAccounts();
    if (accounts.some((a) => a.email.toLowerCase() === email.toLowerCase())) {
      throw new Error('An account with this email already exists');
    }
    const u = { id: `u_${Date.now()}`, name: name || email.split('@')[0], email, avatar: avatar || null };
    const record = { ...u, password };
    writeAccounts([record, ...accounts]);
    saveSession(u, createToken(u.id), true);
    return u;
  };

  const login = async ({ email, password, remember = true }) => {
    const accounts = readAccounts();
    const acc = accounts.find((a) => a.email.toLowerCase() === String(email).toLowerCase());
    if (!acc || acc.password !== password) throw new Error('Invalid email or password');
    const u = { id: acc.id, name: acc.name, email: acc.email, avatar: acc.avatar || null };
    saveSession(u, createToken(u.id), remember);
    return u;
  };

  // Social login simulation (legacy). Prefer oauthLogin for real provider profile
  const socialLogin = async (provider) => {
    const id = `oauth_${provider}_${Date.now()}`;
    const email = `${provider}_user@example.com`;
    const u = { id, email, name: provider === 'google' ? 'Google User' : 'Apple User', avatar: null, provider };
    saveSession(u, createToken(u.id), true);
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
        throw new Error('Failed to fetch user info');
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
      writeJSON(USER_KEY, user);
      
      setUser(user);
      return user;
    } catch (error) {
      console.error('OAuth login error:', error);
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
    removeKeys([USER_KEY, SESSION_USER_KEY, SESSION_TOKEN_KEY]);
    removeKeys([SESSION_USER_KEY, SESSION_TOKEN_KEY], { session: true });
  };

  const updateUser = (patch) => {
    setUser((prev) => {
      if (!prev) return prev;
      const next = { ...prev, ...patch };
      if (readRaw(SESSION_USER_KEY)) writeJSON(SESSION_USER_KEY, next);
      if (readRaw(SESSION_USER_KEY, { session: true })) writeJSON(SESSION_USER_KEY, next, { session: true });
      return next;
    });
  };

  const value = { user, token, login, signup, socialLogin, oauthLogin, logout, updateUser };
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return React.useContext(AuthContext);
}
