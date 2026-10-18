import React, { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import type { LucideIcon } from 'lucide-react';
import {
  AlertCircle,
  ArrowBigUp,
  Check,
  Eye,
  EyeOff,
  Info,
  Loader2,
  Lock,
  Mail,
  RefreshCw,
  User,
  X,
} from 'lucide-react';
import { LogoMark } from '../Logo';
import { EvidenceStage } from './EvidenceStage';
import { useAuth } from '../../auth/AuthContext';
import { useReducedMotion } from '../../hooks/useReducedMotion';
import { AuthError, AuthSession, demoSignIn, fetchHealth, signIn, signUp } from '../../services/authService';

type Mode = 'signin' | 'register';
type Phase = 'idle' | 'submitting' | 'demo' | 'success';
type FormError = { kind: 'lock' | 'exists' | 'other'; message: string };
type Health = { state: 'checking' | 'online' | 'offline'; demo: boolean };

const EMAIL_RE = /^[^@\s]+@[^@\s]+\.[^@\s]{2,}$/;
const COMMON_PASSWORDS = ['password', 'qwerty', '123456', 'letmein', 'welcome', 'admin', 'iloveyou', 'abc123'];
const MIN_PASSWORD = 8;
const MAX_DENSITY = 4;

const sleep = (ms: number) => new Promise<void>((resolve) => window.setTimeout(resolve, ms));

function formatCountdown(totalSeconds: number): string {
  const m = Math.floor(totalSeconds / 60);
  const s = totalSeconds % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
}

// ---------------------------------------------------------------------------
// Password strength. Only the length is enforced; the rest is guidance.
// ---------------------------------------------------------------------------

function passwordChecks(pw: string) {
  return [
    { id: 'len', label: 'At least 8 characters', ok: pw.length >= MIN_PASSWORD },
    { id: 'case', label: 'Upper and lower case', ok: /[a-z]/.test(pw) && /[A-Z]/.test(pw) },
    { id: 'num', label: 'A number', ok: /\d/.test(pw) },
    { id: 'sym', label: 'A symbol', ok: /[^A-Za-z0-9]/.test(pw) },
  ];
}

const STRENGTH_LABELS = ['Too short', 'Weak', 'Fair', 'Good', 'Strong'];

function passwordStrength(pw: string, email: string): number {
  if (pw.length < MIN_PASSWORD) return 0;
  const classes = [/[a-z]/, /[A-Z]/, /\d/, /[^A-Za-z0-9]/].filter((re) => re.test(pw)).length;
  let score = 1;
  if (pw.length >= 12) score += 1;
  if (classes >= 3) score += 1;
  if (classes === 4 && pw.length >= 12) score += 1;

  const lower = pw.toLowerCase();
  const local = email.split('@')[0].toLowerCase();
  const guessable =
    COMMON_PASSWORDS.some((c) => lower.includes(c)) ||
    (local.length >= 3 && lower.includes(local)) ||
    /^(.)\1+$/.test(pw);
  return guessable ? 1 : Math.min(score, 4);
}

const STRENGTH_COLOR = ['bg-rose-500', 'bg-rose-500', 'bg-amber-400', 'bg-emerald-400', 'bg-emerald-400'];
const STRENGTH_TEXT = ['text-rose-300', 'text-rose-300', 'text-amber-300', 'text-emerald-300', 'text-emerald-300'];

// ---------------------------------------------------------------------------
// Small pieces
// ---------------------------------------------------------------------------

const inputClass = (invalid: boolean) =>
  `h-11 w-full rounded-[10px] border bg-slate-900/70 pl-10 pr-10 text-sm text-slate-100 outline-none transition-colors placeholder:text-slate-500 focus:border-indigo-400 focus:ring-4 focus:ring-indigo-500/15 disabled:opacity-60 ${
    invalid ? 'border-rose-500/70' : 'border-slate-700 hover:border-slate-600'
  }`;

interface FieldShellProps {
  id: string;
  label: string;
  icon: LucideIcon;
  error?: string | null;
  right?: React.ReactNode;
  below?: React.ReactNode;
  children: React.ReactNode;
}

const FieldShell: React.FC<FieldShellProps> = ({ id, label, icon: Icon, error, right, below, children }) => (
  <div>
    <label htmlFor={id} className="mb-1.5 block text-[13px] font-medium text-slate-300">
      {label}
    </label>
    <div className="group relative">
      <Icon
        className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500 transition-colors group-focus-within:text-indigo-300"
        aria-hidden="true"
      />
      {children}
      {right && <div className="absolute right-2 top-1/2 flex -translate-y-1/2 items-center">{right}</div>}
    </div>
    {error && (
      <p id={`${id}-error`} className="mt-1.5 flex items-center gap-1.5 text-xs text-rose-300">
        <AlertCircle className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
        {error}
      </p>
    )}
    {below}
  </div>
);

const StrengthMeter: React.FC<{ password: string; email: string }> = ({ password, email }) => {
  const score = passwordStrength(password, email);
  const checks = passwordChecks(password);
  return (
    <div className="mt-2.5" aria-live="polite">
      <div className="flex items-center gap-3">
        <div className="flex flex-1 gap-1.5" aria-hidden="true">
          {[1, 2, 3, 4].map((segment) => (
            <span
              key={segment}
              className={`h-1 flex-1 rounded-full transition-colors duration-300 ${
                score >= segment ? STRENGTH_COLOR[score] : 'bg-slate-800'
              }`}
            />
          ))}
        </div>
        <span className={`w-16 text-right text-xs font-medium ${STRENGTH_TEXT[score]}`}>{STRENGTH_LABELS[score]}</span>
      </div>
      <ul className="mt-2.5 grid grid-cols-2 gap-x-4 gap-y-1">
        {checks.map((c) => (
          <li
            key={c.id}
            className={`flex items-center gap-1.5 text-xs transition-colors ${c.ok ? 'text-emerald-300' : 'text-slate-500'}`}
          >
            {c.ok ? (
              <Check className="h-3 w-3" aria-hidden="true" />
            ) : (
              <span className="mx-[5px] h-1 w-1 rounded-full bg-slate-600" aria-hidden="true" />
            )}
            {c.label}
          </li>
        ))}
      </ul>
    </div>
  );
};

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export const LoginPage: React.FC = () => {
  const { establish, notice, dismissNotice } = useAuth();
  const reduceMotion = useReducedMotion();

  const [mode, setMode] = useState<Mode>('signin');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [remember, setRemember] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [capsLock, setCapsLock] = useState(false);

  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [submitted, setSubmitted] = useState(false);
  const [phase, setPhase] = useState<Phase>('idle');
  const [error, setError] = useState<FormError | null>(null);
  const [shakeKey, setShakeKey] = useState(0);
  const [retryIn, setRetryIn] = useState(0);
  const [health, setHealth] = useState<Health>({ state: 'checking', demo: false });

  const nameRef = useRef<HTMLInputElement>(null);
  const emailRef = useRef<HTMLInputElement>(null);
  const passwordRef = useRef<HTMLInputElement>(null);
  const confirmRef = useRef<HTMLInputElement>(null);

  const busy = phase !== 'idle';
  const locked = retryIn > 0;
  const isRegister = mode === 'register';

  // ----- fit the left panel to the window -----
  // The sample report is decoration. It must never push the form off screen, so it
  // measures itself and steps down until it fits:
  //   0 full, 1 less text, 2 and 3 smaller sample, 4 no sample.
  const asideRef = useRef<HTMLElement>(null);
  const [density, setDensity] = useState(0);
  const [fitTick, setFitTick] = useState(0);
  const refit = useCallback(() => {
    setDensity(0);
    setFitTick((t) => t + 1);
  }, []);

  useLayoutEffect(() => {
    const el = asideRef.current;
    if (!el || el.clientHeight === 0) return; // hidden on small screens
    if (el.scrollHeight > el.clientHeight + 1 && density < MAX_DENSITY) setDensity((d) => d + 1);
  }, [density, fitTick]);

  useEffect(() => {
    let frame = 0;
    let active = true;
    const onResize = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(refit);
    };
    window.addEventListener('resize', onResize);
    // Web fonts change text height once they arrive.
    void document.fonts?.ready.then(() => {
      if (active) refit();
    });
    return () => {
      active = false;
      cancelAnimationFrame(frame);
      window.removeEventListener('resize', onResize);
    };
  }, [refit]);

  const compact = density >= 1;
  const showStage = density < MAX_DENSITY;
  const showLede = density === 0 || density === MAX_DENSITY;
  const stageZoom = density === 2 ? 0.9 : density === 3 ? 0.8 : 1;

  // ----- server status -----
  const checkHealth = useCallback(async (quiet = false) => {
    if (!quiet) setHealth((h) => ({ ...h, state: 'checking' }));
    try {
      const h = await fetchHealth();
      setHealth({ state: 'online', demo: h.demo_login });
    } catch {
      setHealth((h) => ({ ...h, state: 'offline' }));
    }
  }, []);

  useEffect(() => {
    void checkHealth();
  }, [checkHealth]);

  useEffect(() => {
    if (health.state !== 'offline') return;
    const timer = window.setInterval(() => void checkHealth(true), 5000);
    return () => window.clearInterval(timer);
  }, [health.state, checkHealth]);

  // ----- lockout countdown -----
  useEffect(() => {
    if (retryIn <= 0) return;
    const timer = window.setTimeout(() => setRetryIn((s) => s - 1), 1000);
    return () => window.clearTimeout(timer);
  }, [retryIn]);

  useEffect(() => {
    if (retryIn === 0) setError((e) => (e?.kind === 'lock' ? null : e));
  }, [retryIn]);

  // ----- validation -----
  const errors = {
    name: isRegister && name.trim().length < 2 ? 'Enter your name.' : null,
    email: !email.trim()
      ? 'Enter your email.'
      : !EMAIL_RE.test(email.trim())
        ? 'Enter a valid email, like name@company.com.'
        : null,
    password: !password
      ? 'Enter your password.'
      : isRegister && password.length < MIN_PASSWORD
        ? `Use at least ${MIN_PASSWORD} characters.`
        : null,
    confirm: isRegister && confirm !== password ? 'Passwords don’t match.' : null,
  };
  const visible = (field: keyof typeof errors) => (submitted || touched[field] ? errors[field] : null);
  const touch = (field: string) => () => setTouched((t) => ({ ...t, [field]: true }));
  const emailValid = email.trim().length > 0 && EMAIL_RE.test(email.trim());

  const focusFirstInvalid = () => {
    if (errors.name) nameRef.current?.focus();
    else if (errors.email) emailRef.current?.focus();
    else if (errors.password) passwordRef.current?.focus();
    else if (errors.confirm) confirmRef.current?.focus();
  };

  const fail = (formError: FormError) => {
    setError(formError);
    setShakeKey((k) => k + 1);
  };

  // ----- actions -----
  const switchMode = (next: Mode) => {
    if (next === mode || busy) return;
    setMode(next);
    setError(null);
    setSubmitted(false);
    setTouched({});
    setConfirm('');
    setShowPassword(false);
    window.setTimeout(() => (next === 'register' ? nameRef : emailRef).current?.focus(), 0);
  };

  const onTabKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') {
      e.preventDefault();
      switchMode(mode === 'signin' ? 'register' : 'signin');
    }
  };

  const finish = async (session: AuthSession, keep: boolean) => {
    setPhase('success');
    if (!reduceMotion) await sleep(750);
    establish(session, keep);
  };

  const handleFailure = (err: unknown) => {
    setPhase('idle');
    if (err instanceof AuthError) {
      if (err.isNetwork) {
        setHealth((h) => ({ ...h, state: 'offline' }));
        fail({ kind: 'other', message: err.message });
      } else if (err.status === 429) {
        setRetryIn(err.retryAfter ?? 60);
        fail({ kind: 'lock', message: err.message });
      } else if (err.status === 409) {
        fail({ kind: 'exists', message: err.message });
      } else {
        fail({ kind: 'other', message: err.message });
        if (err.status === 401 && mode === 'signin') {
          // Clear the box without flagging it as "missing" right after a wrong guess.
          setPassword('');
          setSubmitted(false);
          setTouched((t) => ({ ...t, password: false }));
          window.setTimeout(() => passwordRef.current?.focus(), 0);
        }
      }
    } else {
      fail({ kind: 'other', message: 'Something went wrong. Try again.' });
    }
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (busy || locked) return;
    setSubmitted(true);

    if (Object.values(errors).some(Boolean)) {
      setError(null);
      setShakeKey((k) => k + 1);
      focusFirstInvalid();
      return;
    }

    setError(null);
    setPhase('submitting');
    try {
      const session = isRegister
        ? await signUp(name.trim(), email.trim(), password, remember)
        : await signIn(email.trim(), password, remember);
      await finish(session, remember);
    } catch (err) {
      handleFailure(err);
    }
  };

  const onDemo = async () => {
    if (busy) return;
    setError(null);
    setPhase('demo');
    try {
      const session = await demoSignIn();
      await finish(session, false);
    } catch (err) {
      handleFailure(err);
    }
  };

  const trackCapsLock = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (typeof e.getModifierState === 'function') setCapsLock(e.getModifierState('CapsLock'));
  };

  // ----- derived copy -----
  const submitLabel = (() => {
    if (phase === 'success') return isRegister ? 'Account created' : 'Signed in';
    if (phase === 'submitting') return isRegister ? 'Creating account…' : 'Signing in…';
    if (locked) return `Try again in ${formatCountdown(retryIn)}`;
    return isRegister ? 'Create account' : 'Sign in';
  })();

  const bannerMessage = error?.kind === 'lock' ? `Too many failed attempts. Try again in ${formatCountdown(retryIn)}.` : error?.message;

  return (
    <div className="grid min-h-screen bg-slate-950 text-slate-100 lg:grid-cols-[minmax(0,1.12fr)_minmax(440px,0.88fr)]">
      {/* Brand and live demo (desktop only) */}
      <aside
        ref={asideRef}
        className={`hidden flex-col justify-between overflow-hidden border-r border-slate-800/80 bg-[#0a1020] px-14 lg:sticky lg:top-0 lg:flex lg:h-screen ${
          compact ? 'py-8' : 'py-12'
        }`}
      >
        <div className="flex items-center gap-3">
          <LogoMark className="h-10 w-10 shrink-0" />
          <span className="text-lg font-semibold tracking-tight">
            DocuMind <span className="text-indigo-300">AI</span>
          </span>
        </div>

        <div className={compact ? 'py-4' : 'py-10'}>
          <h1
            className={`max-w-[16ch] font-semibold leading-[1.02] tracking-[-0.035em] text-white ${
              compact ? 'text-[42px]' : 'text-[52px]'
            }`}
          >
            Every answer comes with its evidence.
          </h1>
          {showLede && (
            <p className="mt-5 max-w-[46ch] text-base leading-relaxed text-slate-400">
              Ask questions about your reports. DocuMind shows the page, table, or chart each answer comes from, so you
              can check it before you act.
            </p>
          )}
          {showStage && (
            <div className={compact ? 'mt-7' : 'mt-10'} style={{ zoom: stageZoom }}>
              <EvidenceStage compact={compact} />
            </div>
          )}
        </div>

        <p className="text-xs text-slate-600">HackNex 2026 qualifier project</p>
      </aside>

      {/* Sign in / create account */}
      <main className="flex flex-col justify-center px-6 py-10 sm:px-12 lg:px-16 lg:py-6">
        <div className="mx-auto w-full max-w-[400px]">
          <div className="mb-10 flex items-center gap-3 lg:hidden">
            <LogoMark className="h-10 w-10 shrink-0" />
            <div>
              <p className="text-lg font-semibold leading-tight tracking-tight">
                DocuMind <span className="text-indigo-300">AI</span>
              </p>
              <p className="text-xs text-slate-400">Every answer comes with its evidence.</p>
            </div>
          </div>

          <h2 id="auth-heading" className="text-[28px] font-semibold leading-tight tracking-tight text-white">
            {isRegister ? 'Create your account' : 'Sign in to DocuMind AI'}
          </h2>
          <p className="mt-2 text-sm leading-relaxed text-slate-400">
            {isRegister
              ? 'Upload a report and ask it anything. Every answer cites its page.'
              : 'Pick up your documents, questions, and action plan.'}
          </p>

          {/* Mode switch */}
          <div
            role="tablist"
            aria-label="Account"
            onKeyDown={onTabKeyDown}
            className="relative mt-7 grid grid-cols-2 rounded-xl border border-slate-800 bg-slate-900/80 p-1"
          >
            <span
              aria-hidden="true"
              className={`absolute inset-y-1 left-1 w-[calc(50%-4px)] rounded-lg bg-slate-700/70 transition-transform duration-300 ease-out ${
                isRegister ? 'translate-x-full' : 'translate-x-0'
              }`}
            />
            {(
              [
                ['signin', 'Sign in'],
                ['register', 'Create account'],
              ] as const
            ).map(([value, label]) => (
              <button
                key={value}
                type="button"
                role="tab"
                id={`tab-${value}`}
                aria-selected={mode === value}
                aria-controls="auth-panel"
                tabIndex={mode === value ? 0 : -1}
                onClick={() => switchMode(value)}
                className={`relative z-10 rounded-lg py-2 text-sm font-medium transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 ${
                  mode === value ? 'text-white' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {label}
              </button>
            ))}
          </div>

          {notice && !error && (
            <div
              role="status"
              className="mt-5 flex items-start gap-2.5 rounded-[10px] border border-indigo-400/25 bg-indigo-500/10 px-3.5 py-3 text-sm text-indigo-100"
            >
              <Info className="mt-0.5 h-4 w-4 shrink-0 text-indigo-300" aria-hidden="true" />
              <p className="flex-1">{notice}</p>
              <button
                type="button"
                onClick={dismissNotice}
                aria-label="Dismiss message"
                className="rounded p-0.5 text-indigo-200/70 hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-300"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          )}

          {error && (
            <div
              key={shakeKey}
              role="alert"
              className="mt-5 flex animate-shake items-start gap-2.5 rounded-[10px] border border-rose-500/30 bg-rose-500/10 px-3.5 py-3 text-sm text-rose-100"
            >
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-rose-300" aria-hidden="true" />
              <div className="flex-1">
                <p>{bannerMessage}</p>
                {error.kind === 'exists' && (
                  <button
                    type="button"
                    onClick={() => switchMode('signin')}
                    className="mt-1 font-medium text-white underline underline-offset-2 hover:text-rose-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-rose-300"
                  >
                    Sign in instead
                  </button>
                )}
              </div>
            </div>
          )}

          <form
            id="auth-panel"
            role="tabpanel"
            aria-labelledby={`tab-${mode}`}
            onSubmit={onSubmit}
            noValidate
            className="mt-6 space-y-4"
          >
            {isRegister && (
              <FieldShell id="name" label="Full name" icon={User} error={visible('name')}>
                <input
                  ref={nameRef}
                  id="name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  onBlur={touch('name')}
                  autoComplete="name"
                  placeholder="Asha Raman"
                  disabled={busy}
                  aria-invalid={Boolean(visible('name'))}
                  aria-describedby={visible('name') ? 'name-error' : undefined}
                  className={inputClass(Boolean(visible('name')))}
                />
              </FieldShell>
            )}

            <FieldShell
              id="email"
              label="Email"
              icon={Mail}
              error={visible('email')}
              right={emailValid && !visible('email') ? <Check className="mr-1.5 h-4 w-4 text-emerald-400" aria-label="Looks valid" /> : null}
            >
              <input
                ref={emailRef}
                id="email"
                type="email"
                inputMode="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onBlur={touch('email')}
                autoComplete={isRegister ? 'email' : 'username'}
                autoCapitalize="none"
                spellCheck={false}
                autoFocus
                placeholder="you@company.com"
                disabled={busy}
                aria-invalid={Boolean(visible('email'))}
                aria-describedby={visible('email') ? 'email-error' : undefined}
                className={inputClass(Boolean(visible('email')))}
              />
            </FieldShell>

            <FieldShell
              id="password"
              label="Password"
              icon={Lock}
              error={visible('password')}
              right={
                <button
                  type="button"
                  onClick={() => setShowPassword((s) => !s)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  aria-pressed={showPassword}
                  className="rounded-md p-2 text-slate-400 transition-colors hover:text-slate-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              }
              below={
                <>
                  {capsLock && (
                    <p className="mt-1.5 flex items-center gap-1.5 text-xs text-amber-300">
                      <ArrowBigUp className="h-3.5 w-3.5" aria-hidden="true" />
                      Caps Lock is on
                    </p>
                  )}
                  {isRegister && password.length > 0 && <StrengthMeter password={password} email={email} />}
                </>
              }
            >
              <input
                ref={passwordRef}
                id="password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onBlur={() => {
                  touch('password')();
                  setCapsLock(false);
                }}
                onKeyDown={trackCapsLock}
                onKeyUp={trackCapsLock}
                autoComplete={isRegister ? 'new-password' : 'current-password'}
                placeholder={isRegister ? 'At least 8 characters' : 'Your password'}
                disabled={busy}
                aria-invalid={Boolean(visible('password'))}
                aria-describedby={visible('password') ? 'password-error' : undefined}
                className={inputClass(Boolean(visible('password')))}
              />
            </FieldShell>

            {isRegister && (
              <FieldShell
                id="confirm"
                label="Confirm password"
                icon={Lock}
                error={visible('confirm')}
                right={
                  confirm.length > 0 && confirm === password ? (
                    <Check className="mr-1.5 h-4 w-4 text-emerald-400" aria-label="Passwords match" />
                  ) : null
                }
              >
                <input
                  ref={confirmRef}
                  id="confirm"
                  type={showPassword ? 'text' : 'password'}
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  onBlur={touch('confirm')}
                  autoComplete="new-password"
                  placeholder="Type it again"
                  disabled={busy}
                  aria-invalid={Boolean(visible('confirm'))}
                  aria-describedby={visible('confirm') ? 'confirm-error' : undefined}
                  className={inputClass(Boolean(visible('confirm')))}
                />
              </FieldShell>
            )}

            <label className="flex w-fit cursor-pointer select-none items-center gap-2.5 text-sm text-slate-300">
              <input
                type="checkbox"
                checked={remember}
                onChange={(e) => setRemember(e.target.checked)}
                disabled={busy}
                className="peer sr-only"
              />
              <span
                aria-hidden="true"
                className="flex h-[18px] w-[18px] items-center justify-center rounded-[5px] border border-slate-600 bg-slate-900 text-white transition-colors peer-checked:border-indigo-500 peer-checked:bg-indigo-600 peer-focus-visible:ring-2 peer-focus-visible:ring-indigo-400 peer-focus-visible:ring-offset-2 peer-focus-visible:ring-offset-slate-950"
              >
                {remember && <Check className="h-3 w-3" strokeWidth={3} />}
              </span>
              Keep me signed in on this device
            </label>

            <button
              type="submit"
              disabled={busy || locked}
              className={`flex h-11 w-full items-center justify-center gap-2 rounded-[10px] text-sm font-semibold text-white shadow-lg transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-300 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950 active:scale-[0.99] disabled:cursor-not-allowed ${
                phase === 'success'
                  ? 'bg-emerald-600 shadow-emerald-600/25'
                  : 'bg-indigo-600 shadow-indigo-600/25 hover:bg-indigo-500 disabled:opacity-70 disabled:hover:bg-indigo-600'
              }`}
            >
              {phase === 'submitting' && <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />}
              {phase === 'success' && <Check className="h-4 w-4" strokeWidth={3} aria-hidden="true" />}
              {submitLabel}
            </button>
          </form>

          {health.demo && (
            <div className="mt-6">
              <div className="flex items-center gap-3 text-xs text-slate-500" aria-hidden="true">
                <span className="h-px flex-1 bg-slate-800" />
                or
                <span className="h-px flex-1 bg-slate-800" />
              </div>
              <button
                type="button"
                onClick={onDemo}
                disabled={busy}
                className="mt-4 flex h-11 w-full items-center justify-center gap-2 rounded-[10px] border border-slate-700 text-sm font-medium text-slate-200 transition-colors hover:border-slate-500 hover:bg-slate-900 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {phase === 'demo' && <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />}
                {phase === 'demo' ? 'Opening demo…' : 'Explore with a demo account'}
              </button>
              <p className="mt-2 text-center text-xs text-slate-500">No sign-up. Opens a shared workspace you can use with the sample report.</p>
            </div>
          )}

          {/* Server status */}
          <div className="mt-10 text-xs" role="status">
            {health.state === 'online' && (
              <p className="flex items-center gap-2 text-slate-500">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" aria-hidden="true" />
                Server connected
              </p>
            )}
            {health.state === 'checking' && (
              <p className="flex items-center gap-2 text-slate-500">
                <Loader2 className="h-3 w-3 animate-spin" aria-hidden="true" />
                Checking the server…
              </p>
            )}
            {health.state === 'offline' && (
              <div className="rounded-[10px] border border-amber-400/25 bg-amber-400/5 px-3.5 py-3 text-amber-100">
                <p className="flex items-center gap-2 font-medium">
                  <span className="h-1.5 w-1.5 rounded-full bg-amber-400" aria-hidden="true" />
                  Can’t reach the server
                </p>
                <p className="mt-1.5 leading-relaxed text-amber-100/80">
                  Start the backend from the project folder, then retry:
                </p>
                <code className="mt-1.5 block overflow-x-auto whitespace-nowrap rounded-md bg-slate-950/70 px-2.5 py-1.5 text-[11px] text-slate-300">
                  python -m uvicorn backend.main:app --port 8000
                </code>
                <button
                  type="button"
                  onClick={() => void checkHealth()}
                  className="mt-2.5 inline-flex items-center gap-1.5 font-medium text-white underline underline-offset-2 hover:text-amber-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-300"
                >
                  <RefreshCw className="h-3 w-3" aria-hidden="true" />
                  Retry now
                </button>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default LoginPage;
