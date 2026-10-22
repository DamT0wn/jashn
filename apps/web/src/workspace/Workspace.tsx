import { AccountControl } from '../auth/Auth';
import { useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import { Link, NavLink, useParams, useSearchParams } from 'react-router-dom';
import type { EventBrief } from '@jashn/contracts';
import { fixtureRepository } from './repository';
import type { EventRepository, WorkspaceEvent } from './repository';
import { PlanView, tabs } from './PlanView';
import type { PlanTab } from './PlanView';
import { money } from './form';

export const samples = fixtureRepository();
export function WorkspaceLayout({ children }: { children: ReactNode }) {
  return <div className="workspace"><a className="sr-only focus:not-sr-only" href="#workspace-main">Skip to content</a><aside className="workspace-sidebar"><Link to="/" className="workspace-logo" aria-label="Jashn home">Jashn ✳</Link><p className="subtle">A little structure. A lot of joy.</p><nav aria-label="Workspace"><NavLink to="/app" end>Your occasions</NavLink><NavLink to="/app/new">Create an occasion</NavLink><NavLink to="/demo">Explore samples</NavLink></nav><div className="sidebar-note"><p>Your budget.<br />Your people.<br />Your kind of joy.</p><AccountControl /></div></aside><div className="workspace-body"><header className="workspace-topbar"><AccountControl /><Link className="cream-button" to="/app/new">New occasion +</Link></header><main id="workspace-main" tabIndex={-1}>{children}</main><footer className="workspace-footer">Development preview · Live AI is not connected. Samples are illustrative.</footer></div></div>;
}
export function Occasions({ draft }: { draft: EventBrief | null }) {
  return <><div className="page-heading"><p className="eyebrow">A space for your celebrations</p><h1>Your occasions.</h1><p>Bring the details together, so you can be there for the joy.</p></div>{draft ? <section className="workspace-panel"><span className="badge">Local draft · not saved</span><h2>{draft.name}</h2><p>{draft.localDate} · {draft.guests} guests · {money(draft.budgetMinor)}</p><p className="subtle">Reloading clears this draft. Confirming another brief replaces it.</p><Link className="cream-button mt-6" to="/app/events/local-draft">Open local draft →</Link></section> : <section className="workspace-panel empty-state"><span className="idea-number">✳</span><h2>Every celebration starts somewhere.</h2><p className="subtle">Create your first brief. For now, it stays in this browser tab until you reload.</p><Link className="cream-button mt-6" to="/app/new">Create your first brief →</Link></section>}<div className="section-heading"><p className="eyebrow">A little inspiration</p><h2>See what a plan could look like.</h2><p className="subtle">Three synthetic, read-only examples. No live AI or real vendor quotes.</p></div><div className="sample-tiles">{[['birthday', 'A birthday to remember', '50 people. One thoughtful celebration.'], ['wedding', 'An intimate wedding', 'A shared beginning, beautifully considered.'], ['community', 'A neighbourhood gathering', 'Good company, with room for everyone.']].map(([id, title, description]) => <Link className={`sample-tile ${id}`} key={id} to={`/demo?event=${id}`}><span className="eyebrow">Synthetic sample ↗</span><h3>{title}</h3><p>{description}</p></Link>)}</div></>;
}
type LoadState = { status: 'loading' } | { status: 'error' } | { status: 'ready'; event: WorkspaceEvent | null };
function EventLoader({ repository, id, tab }: { repository: EventRepository; id: string; tab: PlanTab }) {
  const [state, setState] = useState<LoadState>({ status: 'loading' });
  const [attempt, setAttempt] = useState(0);
  useEffect(() => {
    const controller = new AbortController();
    let active = true;
    void repository.get(id, controller.signal).then(event => { if (active) setState({ status: 'ready', event }); }).catch(() => { if (active) setState({ status: 'error' }); });
    return () => { active = false; controller.abort(); };
  }, [repository, id, attempt]);
  if (state.status === 'loading') return <p role="status">Opening your workspace…</p>;
  if (state.status === 'error') return <section className="workspace-panel"><h2>We couldn’t open this occasion.</h2><p role="alert">Something went wrong. Your brief has not been changed.</p><button className="cream-button" onClick={() => { setState({ status: 'loading' }); setAttempt(value => value + 1); }}>Try again</button></section>;
  if (!state.event) return <section className="workspace-panel"><h2>This occasion isn’t available.</h2><p className="subtle">Check the link. Local drafts disappear after a reload; samples are available from the sample picker.</p><Link className="cream-button mt-6" to="/app">Back to your occasions</Link></section>;
  return <><div className="page-heading"><p className="eyebrow">{state.event.mode === 'synthetic' ? 'An illustrative celebration' : 'Your confirmed brief'}</p><h1>{state.event.brief.name}</h1><p>{state.event.brief.city} · {state.event.brief.type}</p></div><PlanView event={state.event} tab={tab} /></>;
}
export function EventWorkspace({ repository, demo = false }: { repository: EventRepository; demo?: boolean }) {
  const [query, setQuery] = useSearchParams();
  const params = useParams();
  const id = demo ? query.get('event') || 'birthday' : params.id || '';
  const requested = query.get('tab') || 'overview';
  const tab = tabs.includes(requested as PlanTab) ? requested as PlanTab : 'overview';
  return <><div className="notice">{demo ? 'Synthetic sample · Read-only. Illustrative amounts and dates, not live AI or vendor quotes.' : 'Local draft · Not saved to an account. Reloading clears it.'}</div>{demo ? <div className="sample-picker"><label htmlFor="sample-choice">Explore an occasion</label><select id="sample-choice" value={id} onChange={event => { const next = new URLSearchParams(query); next.set('event', event.target.value); setQuery(next); }}>{!['birthday', 'wedding', 'community'].includes(id) ? <option value={id}>Unknown sample</option> : null}<option value="birthday">Birthday</option><option value="wedding">Wedding</option><option value="community">Community gathering</option></select></div> : null}<nav aria-label="Plan sections" className="plan-nav">{tabs.map(item => { const next = new URLSearchParams(query); next.set('tab', item); return <Link key={item} to={`?${next.toString()}`} aria-current={item === tab ? 'page' : undefined}>{item}</Link>; })}</nav>{requested !== tab ? <p role="status">Unknown section. Showing overview.</p> : null}<EventLoader key={`${demo}:${id}`} repository={repository} id={id} tab={tab} /></>;
}
