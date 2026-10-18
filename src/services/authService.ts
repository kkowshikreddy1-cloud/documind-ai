import { API_BASE } from './config';

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  is_demo: boolean;
  created_at: number;
  last_login_at: number | null;
}

export interface AuthSession {
  token: string;
  expires_at: number; // unix seconds
  user: AuthUser;
}

export interface ServerHealth {
  status: string;
  version: string;
  demo_login: boolean;
}

/** Fired by the API layer when the server rejects the stored token. */
export const UNAUTHORIZED_EVENT = 'documind:unauthorized';

const STORAGE_KEY = 'documind.session';

export class AuthError extends Error {
  status: number;
  retryAfter?: number;

  constructor(message: string, status: number, retryAfter?: number) {
    super(message);
    this.name = 'AuthError';
    this.status = status;
    this.retryAfter = retryAfter;
  }

  /** True when the server could not be reached at all. */
  get isNetwork(): boolean {
    return this.status === 0;
  }
}

// ---------------------------------------------------------------------------
// Session storage. "Keep me signed in" uses localStorage (survives closing the
// browser); otherwise sessionStorage (cleared when the tab closes).
// ---------------------------------------------------------------------------

function readFrom(store: Storage): AuthSession | null {
  try {
    const raw = store.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as AuthSession;
    if (!parsed?.token || !parsed.user || parsed.expires_at * 1000 <= Date.now()) {
      store.removeItem(STORAGE_KEY);
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}

export function loadSession(): AuthSession | null {
  try {
    return readFrom(window.localStorage) ?? readFrom(window.sessionStorage);
  } catch {
    return null;
  }
}

export function saveSession(session: AuthSession, remember: boolean): void {
  clearSession();
  try {
    (remember ? window.localStorage : window.sessionStorage).setItem(STORAGE_KEY, JSON.stringify(session));
  } catch {
    // Storage can be blocked (private mode). The user stays signed in until the page reloads.
  }
}

export function clearSession(): void {
  try {
    window.localStorage.removeItem(STORAGE_KEY);
    window.sessionStorage.removeItem(STORAGE_KEY);
  } catch {
    /* nothing to clear */
  }
}

export function getToken(): string | null {
  return loadSession()?.token ?? null;
}

// ---------------------------------------------------------------------------
// HTTP
// ---------------------------------------------------------------------------

interface CallOptions {
  method?: string;
  body?: unknown;
  token?: string;
  timeoutMs?: number;
}

async function call<T>(path: string, { method = 'GET', body, token, timeoutMs = 15000 }: CallOptions = {}): Promise<T> {
  const headers: Record<string, string> = {};
  if (body !== undefined) headers['Content-Type'] = 'application/json';
  if (token) headers.Authorization = `Bearer ${token}`;

  const controller = new AbortController();
  const timer = window.setTimeout(() => controller.abort(), timeoutMs);

  let res: Response;
  try {
    res = await fetch(`${API_BASE}${path}`, {
      method,
      headers,
      body: body !== undefined ? JSON.stringify(body) : undefined,
      signal: controller.signal,
    });
  } catch {
    const host = API_BASE.replace(/^https?:\/\//, '');
    throw new AuthError(`Can't reach the server at ${host}. Start the backend, then try again.`, 0);
  } finally {
    window.clearTimeout(timer);
  }

  let data: any = null;
  try {
    data = await res.json();
  } catch {
    /* empty or non-JSON body */
  }

  if (!res.ok) {
    const detail = data?.detail;
    const message =
      typeof detail === 'string'
        ? detail
        : typeof detail?.message === 'string'
          ? detail.message
          : 'Something went wrong. Try again.';
    throw new AuthError(message, res.status, typeof detail === 'object' ? detail?.retry_after : undefined);
  }
  return data as T;
}

export function signIn(email: string, password: string, remember: boolean): Promise<AuthSession> {
  return call<AuthSession>('/api/auth/login', { method: 'POST', body: { email, password, remember } });
}

export function signUp(name: string, email: string, password: string, remember: boolean): Promise<AuthSession> {
  return call<AuthSession>('/api/auth/register', { method: 'POST', body: { name, email, password, remember } });
}

export function demoSignIn(): Promise<AuthSession> {
  return call<AuthSession>('/api/auth/demo', { method: 'POST' });
}

export function fetchMe(token: string): Promise<AuthUser> {
  return call<AuthUser>('/api/auth/me', { token });
}

export function signOut(token: string): Promise<{ status: string }> {
  return call<{ status: string }>('/api/auth/logout', { method: 'POST', token });
}

export function fetchHealth(): Promise<ServerHealth> {
  return call<ServerHealth>('/api/health', { timeoutMs: 4000 });
}
