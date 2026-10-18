import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import {
  AuthError,
  AuthSession,
  AuthUser,
  UNAUTHORIZED_EVENT,
  clearSession,
  fetchMe,
  getToken,
  loadSession,
  saveSession,
  signOut,
} from '../services/authService';

type Status = 'checking' | 'authenticated' | 'anonymous';

interface AuthContextValue {
  status: Status;
  user: AuthUser | null;
  /** A message to show on the sign-in page, such as "Your session expired." */
  notice: string | null;
  /** Called by the sign-in page once the server has accepted the credentials. */
  establish: (session: AuthSession, remember: boolean) => void;
  logout: () => Promise<void>;
  dismissNotice: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

const EXPIRED_NOTICE = 'Your session has expired. Sign in again to continue.';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // With nothing stored there is nothing to verify, so skip the loading screen.
  const [status, setStatus] = useState<Status>(() => (loadSession() ? 'checking' : 'anonymous'));
  const [user, setUser] = useState<AuthUser | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  // On page load, confirm a stored session is still valid on the server.
  useEffect(() => {
    const stored = loadSession();
    if (!stored) return;

    let cancelled = false;
    fetchMe(stored.token)
      .then((me) => {
        if (cancelled) return;
        setUser(me);
        setStatus('authenticated');
      })
      .catch((err) => {
        if (cancelled) return;
        if (err instanceof AuthError && err.status === 401) {
          clearSession();
          setNotice(EXPIRED_NOTICE);
        }
        // If the server is just unreachable, keep the stored session for the next load.
        setStatus('anonymous');
      });

    return () => {
      cancelled = true;
    };
  }, []);

  // Any API call that comes back 401 sends the user to the sign-in page.
  useEffect(() => {
    const onUnauthorized = () => {
      setUser(null);
      setStatus('anonymous');
      setNotice(EXPIRED_NOTICE);
    };
    window.addEventListener(UNAUTHORIZED_EVENT, onUnauthorized);
    return () => window.removeEventListener(UNAUTHORIZED_EVENT, onUnauthorized);
  }, []);

  const establish = useCallback((session: AuthSession, remember: boolean) => {
    saveSession(session, remember);
    setUser(session.user);
    setNotice(null);
    setStatus('authenticated');
  }, []);

  const logout = useCallback(async () => {
    const token = getToken();
    clearSession();
    setUser(null);
    setNotice(null);
    setStatus('anonymous');
    if (token) {
      try {
        await signOut(token);
      } catch {
        // The local session is already gone; the server copy expires on its own.
      }
    }
  }, []);

  const dismissNotice = useCallback(() => setNotice(null), []);

  const value = useMemo<AuthContextValue>(
    () => ({ status, user, notice, establish, logout, dismissNotice }),
    [status, user, notice, establish, logout, dismissNotice],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>');
  return ctx;
}
