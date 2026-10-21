import { useEffect, useState } from 'react';
import { Link, Route, Routes } from 'react-router-dom';
import { ArrowUpRight } from 'lucide-react';
import { HealthResponseSchema } from '@jashn/contracts';

function ConnectionStatus() {
  const [attempt, setAttempt] = useState(0);
  const [status, setStatus] = useState<'loading' | 'ready' | 'error'>('loading');
  useEffect(() => {
    const controller = new AbortController();
    let active = true;
    const timeout = window.setTimeout(() => controller.abort(), 5_000);
    const base = (import.meta.env.VITE_API_BASE_URL || '/api').replace(/\/$/, '');
    async function check() {
      try {
        const response = await fetch(`${base}/health`, { signal: controller.signal });
        if (!response.ok) throw new Error('Health request failed');
        HealthResponseSchema.parse(await response.json());
        if (active) setStatus('ready');
      } catch {
        if (active) setStatus('error');
      } finally { window.clearTimeout(timeout); }
    }
    void check();
    return () => { active = false; controller.abort(); window.clearTimeout(timeout); };
  }, [attempt]);
  return <section aria-labelledby="connection-title" className="rounded-2xl border border-white/15 bg-white/[.03] p-6">
    <h2 id="connection-title" className="text-lg">Development connection</h2>
    <p role="status" className="mt-3 text-sm text-primary/80">
      {status === 'loading' ? 'Checking the API…' : status === 'ready' ? 'API connected · local service is responding.' : 'API unavailable. Start the API and try again.'}
    </p>
    {status === 'error' ? <button className="mt-4 rounded-full border border-primary/50 px-4 py-2 text-sm" onClick={() => { setStatus('loading'); setAttempt(value => value + 1); }}>Retry connection</button> : null}
    <p className="mt-4 text-xs leading-relaxed text-primary/60">This checks the API process only. Authentication, saved events and AI generation are not connected yet.</p>
  </section>;
}

function Home() {
  return <>
    <p className="text-xs uppercase tracking-[.25em] text-primary/60">Project foundation · Phase 02</p>
    <h1 className="mt-5 text-6xl tracking-tight sm:text-8xl">Jashn<span className="text-primary/50">.</span></h1>
    <p className="mt-5 text-2xl">Plan the joy.</p>
    <p className="mt-5 max-w-lg leading-relaxed text-primary/75">A celebration begins with an idea. We’re building a place to bring your budget, timeline and priorities together.</p>
    <div className="mt-10 grid gap-6 md:grid-cols-2">
      <ConnectionStatus />
      <section className="rounded-2xl border border-white/15 p-6"><h2 className="text-lg">What comes next</h2><p className="mt-3 text-sm leading-relaxed text-primary/75">The landing page is next, followed by the event wizard. Planning and sample plans will become available in later phases.</p><Link className="mt-5 inline-flex items-center gap-2 text-sm underline underline-offset-4" to="/app">View workspace status <ArrowUpRight size={16} aria-hidden="true" /></Link></section>
    </div>
  </>;
}

function Pending({ sample = false }: { sample?: boolean }) {
  return <><p className="text-xs uppercase tracking-widest text-primary/60">Not available yet</p><h1 className="mt-4 text-4xl">{sample ? 'Sample plans' : 'Your celebration workspace'}</h1><p className="mt-5 max-w-xl leading-relaxed text-primary/75">{sample ? 'Clearly labeled synthetic birthday, wedding and community samples arrive in Phase 04.' : 'The event wizard arrives in Phase 04. Sign-in and persistent event storage follow in Phase 05.'}</p><Link to="/" className="mt-8 inline-block underline underline-offset-4">Back to Jashn</Link></>;
}

export function App() {
  return <div className="min-h-screen bg-[#101010] text-primary">
    <a className="sr-only focus:not-sr-only focus:absolute focus:p-4" href="#main">Skip to content</a>
    <header className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-4 border-b border-white/10 px-6 py-6">
      <Link to="/" aria-label="Jashn home" className="text-xl">Jashn</Link>
      <nav aria-label="Main" className="flex gap-5 text-sm"><Link className="py-2" to="/app">Workspace</Link><Link className="py-2" to="/demo">Samples</Link></nav>
    </header>
    <main id="main" className="mx-auto max-w-5xl px-6 py-16 sm:py-24"><Routes><Route path="/" element={<Home />} /><Route path="/app" element={<Pending />} /><Route path="/app/new" element={<Pending />} /><Route path="/demo" element={<Pending sample />} /><Route path="*" element={<><h1 className="text-3xl">Page not found</h1><Link to="/" className="mt-6 inline-block underline">Back to Jashn</Link></>} /></Routes></main>
    <footer className="mx-auto max-w-5xl px-6 pb-8 text-xs text-primary/60">Development preview. No personal events are stored.</footer>
  </div>;
}
