import { useEffect, useState } from 'react';
import type { EventRecord, PlanVersion, ReplanProposal } from '@jashn/contracts';
import { versionsApi } from './api';
import { PlanExport } from './PlanExport';
import { money } from './form';

type VersionSummary = { id: string; version: number; acceptedAt: string; overview: string };

function VersionDetail({
  event,
  versionId,
  onRestoreProposal,
  onClose,
}: {
  event: EventRecord;
  versionId: string;
  onRestoreProposal: (proposal: ReplanProposal) => void;
  onClose: () => void;
}) {
  const [version, setVersion] = useState<PlanVersion | null>(null);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    const controller = new AbortController();
    void versionsApi.get(event.id, versionId, controller.signal)
      .then(result => { if (!controller.signal.aborted) setVersion(result.version); })
      .catch(err => { if (!controller.signal.aborted) setError((err as Error).message); });
    return () => controller.abort();
  }, [event.id, versionId]);

  async function restore() {
    if (!version) return;
    setBusy(true); setError('');
    try {
      const result = await versionsApi.restore(event.id, versionId, event.revision);
      onRestoreProposal(result.proposal);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setBusy(false);
    }
  }

  if (error) return <p role="alert" className="notice">{error} <button onClick={onClose}>Close</button></p>;
  if (!version) return <p role="status">Loading version…</p>;

  const snap = version.snapshot;
  const projected = snap.budgetLines.reduce(
    (sum, l) => sum + (l.committedCostMinor ?? l.estimatedCostMinor), 0
  ) + snap.contingencyMinor;

  return (
    <section className="workspace-panel mt-6" aria-label={`Version ${version.version} detail`}>
      <p className="eyebrow badge">Historical snapshot · not current data</p>
      <h3>Version {version.version}</h3>
      <p className="subtle">Accepted {new Date(version.acceptedAt).toLocaleString('en-IN')} · Source: {version.generation.source}</p>
      {version.acknowledgedInfeasible && (
        <p className="notice">This version was accepted with an acknowledged budget shortfall.</p>
      )}
      <p>{snap.overview}</p>
      <dl className="brief-details">
        <div><dt>Budget cap</dt><dd>{money(snap.brief.budgetMinor)}</dd></div>
        <div><dt>Projected cost (at time of acceptance)</dt><dd>{money(projected)}</dd></div>
        <div><dt>Guests</dt><dd>{snap.brief.guests}</dd></div>
        <div><dt>Date</dt><dd>{snap.brief.localDate}</dd></div>
        <div><dt>Feasibility</dt><dd>{snap.feasibility.status}</dd></div>
      </dl>
      {snap.feasibility.status === 'infeasible' && (
        <ul className="content-list subtle">
          {snap.feasibility.reasons.map((r, i) => <li key={i}>{r}</li>)}
        </ul>
      )}
      <h4>Budget lines at this version</h4>
      <div className="budget-list">
        {snap.budgetLines.map(line => (
          <div className="budget-row" key={line.id}>
            <div>
              <strong>{line.category}</strong>
              <span>{line.locked ? 'Locked in this snapshot' : 'Flexible'}{line.committedCostMinor !== null ? ' · committed' : ''}</span>
            </div>
            <strong>{money(line.committedCostMinor ?? line.estimatedCostMinor)}</strong>
          </div>
        ))}
        <div className="budget-row">
          <div><strong>Contingency</strong></div>
          <strong>{money(snap.contingencyMinor)}</strong>
        </div>
      </div>
      <PlanExport plan={snap} version={version.version}/>
      <p className="subtle mt-4">
        Restoring creates a new proposal that reconciles these planning choices
        with your current financial records and locks. Current payments and
        commitments are never overwritten by a restore.
      </p>
      <div className="form-actions mt-4">
        {event.status === 'active' && event.currentVersion !== null && (
          <button
            className="cream-button"
            disabled={busy || Number(versionId) === event.currentVersion}
            onClick={() => { void restore(); }}
          >
            {busy ? 'Creating restore proposal…' : Number(versionId) === event.currentVersion ? 'This is the current version' : 'Restore this version as a proposal'}
          </button>
        )}
        <button className="secondary-button" disabled={busy} onClick={onClose}>
          Close version
        </button>
      </div>
      {error && <p role="alert" className="notice">{error}</p>}
    </section>
  );
}

export function VersionHistory({
  event,
  onRestoreProposal,
}: {
  event: EventRecord;
  onRestoreProposal: (proposal: ReplanProposal) => void;
}) {
  const [versions, setVersions] = useState<VersionSummary[]>([]);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    const controller = new AbortController();
    void versionsApi.list(event.id, undefined, controller.signal)
      .then(result => {
        if (!controller.signal.aborted) {
          setVersions(result.versions);
          setNextCursor(result.nextCursor);
          setLoading(false);
        }
      })
      .catch(err => {
        if (!controller.signal.aborted) {
          setError((err as Error).message);
          setLoading(false);
        }
      });
    return () => controller.abort();
  }, [event.id, attempt]);

  async function loadMore() {
    if (!nextCursor) return;
    setLoading(true); setError('');
    try {
      const result = await versionsApi.list(event.id, nextCursor);
      setVersions(current => [...current, ...result.versions]);
      setNextCursor(result.nextCursor);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="workspace-panel mt-6" aria-label="Plan version history">
      <p className="eyebrow">Each apply creates an immutable record</p>
      <h2>Version history.</h2>
      <p className="subtle">
        Every accepted plan and applied proposal is preserved. Restoring a version
        creates a new reviewable proposal — it never overwrites history.
      </p>

      {error && (
        <p role="alert" className="notice">
          {error}{' '}
          <button onClick={() => { setError(''); setAttempt(v => v + 1); }}>Reload history</button>
        </p>
      )}
      {loading && <p role="status">Loading version history…</p>}
      {!loading && !error && versions.length === 0 && (
        <p>No accepted versions yet. Accept a generated plan to begin building your history.</p>
      )}

      {versions.length > 0 && (
        <ol className="timeline-list mt-6">
          {versions.map(v => (
            <li key={v.id}>
              <span className="timeline-dot" aria-hidden="true" />
              <div>
                <span className="eyebrow">
                  Version {v.version} · {new Date(v.acceptedAt).toLocaleDateString('en-IN')}
                  {v.version === event.currentVersion ? ' · Current' : ' · Historical'}
                </span>
                <p>{v.overview}</p>
                <button
                  className="secondary-button mt-2"
                  onClick={() => setSelectedId(selectedId === v.id ? null : v.id)}
                  aria-expanded={selectedId === v.id}
                >
                  {selectedId === v.id ? 'Collapse' : 'View this version'}
                </button>
              </div>
            </li>
          ))}
        </ol>
      )}

      {nextCursor && (
        <button className="secondary-button mt-6" disabled={loading} onClick={() => { void loadMore(); }}>
          Load older versions
        </button>
      )}

      {selectedId && (
        <VersionDetail
          key={selectedId}
          event={event}
          versionId={selectedId}
          onRestoreProposal={proposal => {
            setSelectedId(null);
            onRestoreProposal(proposal);
          }}
          onClose={() => setSelectedId(null)}
        />
      )}
    </section>
  );
}
