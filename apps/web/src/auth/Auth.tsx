import { createContext, useContext, useEffect, useState } from 'react';
import type { ReactNode, FormEvent } from 'react';
import { createUserWithEmailAndPassword, GoogleAuthProvider, onIdTokenChanged, sendPasswordResetEmail, signInWithEmailAndPassword, signInWithPopup, signOut } from 'firebase/auth';
import type { User } from 'firebase/auth';
import { Link } from 'react-router-dom';
import { auth, emulatorMode } from './firebase';
const AuthContext = createContext<{ user: User | null; loading: boolean }>({ user: null, loading: true });
export const useAuth = () => useContext(AuthContext);
export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<{ user: User | null; loading: boolean }>({ user: null, loading: Boolean(auth) });
  useEffect(() => auth ? onIdTokenChanged(auth, user => setState({ user, loading: false }), () => setState({ user: null, loading: false })) : undefined, []);
  return <AuthContext.Provider value={state}>{children}</AuthContext.Provider>;
}
export function AccountControl() {
  const { user } = useAuth(); const [error, setError] = useState('');
  return <div className="account-control">{emulatorMode ? <span className="badge">Local Firebase emulators</span> : null}{user ? <><span>{user.email || 'Signed in'}</span><button className="secondary-button" onClick={() => { void signOut(auth!).catch(() => setError('Could not sign out. Try again.')); }}>Sign out</button></> : <Link to="/app">Sign in</Link>}{error ? <p role="alert">{error}</p> : null}</div>;
}
export function RequireAccount({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth();
  if (loading) return <p role="status">Checking your session…</p>;
  if (!auth) return <section className="workspace-panel"><h1>Account setup is needed.</h1><p>Sign-in and saving need Firebase configuration. You can still explore the public samples.</p><Link className="cream-button mt-6" to="/demo">Explore samples</Link></section>;
  return user ? <div key={user.uid}>{children}</div> : <SignIn />;
}
function SignIn() {
  const [mode, setMode] = useState<'signin' | 'signup' | 'reset'>('signin');
  const [email, setEmail] = useState(''); const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false); const [message, setMessage] = useState('');
  async function run(action: () => Promise<unknown>, reset = false) {
    setBusy(true); setMessage('');
    try { await action(); if (reset) setMessage('If an account exists for that email, recovery instructions have been requested.'); }
    catch { setMessage('Unable to complete the request. Check your details and connection, then try again.'); }
    finally { setBusy(false); }
  }
  function submit(event: FormEvent) { event.preventDefault(); void run(() => mode === 'reset' ? sendPasswordResetEmail(auth!, email) : mode === 'signup' ? createUserWithEmailAndPassword(auth!, email, password) : signInWithEmailAndPassword(auth!, email, password), mode === 'reset'); }
  return <section className="workspace-panel auth-panel"><p className="eyebrow">Your celebrations, together</p><h1>{mode === 'signup' ? 'Create your account.' : mode === 'reset' ? 'Recover your account.' : 'Welcome to Jashn.'}</h1>{emulatorMode ? <div className="notice">Local emulator environment. Use test accounts only. Recovery links appear in the local emulator output; no email is sent.</div> : null}<form onSubmit={submit}><div className="form-field"><label htmlFor="auth-email">Email</label><input id="auth-email" type="email" autoComplete="email" required value={email} onChange={e => setEmail(e.target.value)} /></div>{mode !== 'reset' ? <div className="form-field mt-5"><label htmlFor="auth-password">Password</label><input id="auth-password" type="password" minLength={6} autoComplete={mode === 'signup' ? 'new-password' : 'current-password'} required value={password} onChange={e => setPassword(e.target.value)} /></div> : null}<button className="cream-button mt-6" disabled={busy}>{busy ? 'Please wait…' : mode === 'signup' ? 'Create account' : mode === 'reset' ? 'Request recovery email' : 'Sign in'}</button></form>{message ? <p role="alert" className="mt-5">{message}</p> : null}<div className="form-actions"><button className="secondary-button" disabled={busy} onClick={() => { void run(() => signInWithPopup(auth!, new GoogleAuthProvider())); }}>Continue with Google</button><button disabled={busy} onClick={() => { setMode(mode === 'signup' ? 'signin' : 'signup'); setPassword(''); setMessage(''); }}>{mode === 'signup' ? 'Already have an account?' : 'Create an account'}</button><button disabled={busy} onClick={() => { setMode(mode === 'reset' ? 'signin' : 'reset'); setPassword(''); setMessage(''); }}>{mode === 'reset' ? 'Back to sign in' : 'Forgot password?'}</button></div></section>;
}
