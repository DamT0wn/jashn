import { useEffect, useState } from 'react';
import type { EventRecord, PlanSnapshot, ReplanProposal } from '@jashn/contracts';
import { money, paiseToRupees, rupeesToPaise } from './form';
import { replanApi } from './api';

type Changes = { budgetMinor?: number; localDate?: string; guests?: number };

function DiffTable({ proposal }: { proposal: ReplanProposal }) {
  const { diff, preservedLockIds, candidate, requestedChanges } = proposal;
  const currentBudget = candidate.budgetLines;
  const lockedLines = currentBudget.filter(l => l.locked).map(l => l.category);
  const budgetDiff = diff.filter(d => d.entity === 'budget' || d.entity === 'contingency' || d.entity === 'brief');
  const taskDiff = diff.filter(d => d.entity === 'task');
  const ideaDiff = diff.filter(d => d.entity === 'idea');
  return (
    <div className="workspace-panel mt-6">
      <h3>Proposed changes</h3>
      {preservedLockIds.length > 0 && (
        <p className="subtle">Protected and locked: {lockedLines.join(', ')}</p>
      )}
      {requestedChanges.budgetMinor !== undefined && (
        <p>New budget cap: <strong>{money(requestedChanges.budgetMinor)}</strong></p>
      )}
      {requestedChanges.localDate && (
        <p>New event date: <strong>{requestedChanges.localDate}</strong></p>
      )}
      {requestedChanges.guests !== undefined && (
        <p>New guest count: <strong>{requestedChanges.guests}</strong></p>
      )}
      {budgetDiff.length > 0 && (
        <>
          <h4>Budget changes</h4>
          <table className="diff-table" role="table">
            <thead><tr><th>Line</th><th>Field</th><th>Before</th><th>After</th></tr></thead>
            <tbody>
              {budgetDiff.map((entry, i) => (
                <tr key={i} className={entry.before === null ? 'diff-added' : entry.after === null ? 'diff-removed' : 'diff-changed'}>
                  <td>{entry.entityId ?? '—'}</td>
                  <td>{entry.field}</td>
                  <td>{entry.before ?? <em>none</em>}</td>
                  <td>{entry.after ?? <em>removed</em>}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </>
      )}
      {taskDiff.length > 0 && (
        <>
          <h4>Task changes</h4>
          <ul className="content-list">
            {taskDiff.map((entry, i) => (
              <li key={i}>
                {entry.field === 'added' ? `Added: ${entry.after}` : entry.field === 'removed' ? `Removed: ${entry.before}` : `${entry.entityId} · ${entry.field}: ${entry.before} → ${entry.after}`}
              </li>
            ))}
          </ul>
        </>
      )}
      {ideaDiff.length > 0 && (
        <>
          <h4>Idea changes</h4>
          <ul className="content-list">
            {ideaDiff.map((entry, i) => <li key={i}>{entry.field === 'added' ? `Added: ${entry.after}` : entry.field === 'removed' ? `Removed: ${entry.before}` : `${entry.entityId} changed`}</li>)}
          </ul>
        </>
      )}
      {diff.length === 0 && <p className="subtle">No differences detected between the current plan and this proposal.</p>}
    </div>
  );
}

function CandidateSummary({ candidate, cap }: { candidate: PlanSnapshot; cap: number }) {
  const projected = candidate.budgetLines.reduce((sum, l) => sum + (l.committedCostMinor ?? l.estimatedCostMinor), 0) + candidate.contingencyMinor;
  const remaining = cap - projected;
  return (
    <div className="workspace-panel mt-4">
      <h3>Proposed plan summary</h3>
      <dl className="brief-details">
        <div><dt>New budget cap</dt><dd>{money(cap)}</dd></div>
        <div><dt>Proposed projected cost</dt><dd>{money(projected)}</dd></div>
        <div><dt>Remaining forecast</dt><dd>{money(remaining)}</dd></div>
        <div><dt>Contingency reserve</dt><dd>{money(candidate.contingencyMinor)}</dd></div>
      </dl>
      {candidate.feasibility.status === 'infeasible' && (
        <div role="alert" className="notice">
          <strong>Infeasible:</strong> shortfall of {money(candidate.feasibility.shortfallMinor)}.
          <ul className="content-list">{candidate.feasibility.reasons.map((r, i) => <li key={i}>{r}</li>)}</ul>
        </div>
      )}
      {candidate.warnings.length > 0 && (
        <ul className="content-list subtle">{candidate.warnings.map((w, i) => <li key={i}>{w}</li>)}</ul>
      )}
    </div>
  );
}

export function ReplanEditor({
  event,
  plan,
  onApplied,
  initialProposal = null,
}: {
  initialProposal?: ReplanProposal | null;
  event: EventRecord;
  plan: PlanSnapshot;
  onApplied: (event: EventRecord, plan: PlanSnapshot) => void;
}) {
  const [budgetInput, setBudgetInput] = useState(paiseToRupees(plan.brief.budgetMinor));
  const [dateInput, setDateInput] = useState('');
  const [guestsInput, setGuestsInput] = useState('');
  const [proposal, setProposal] = useState<ReplanProposal | null>(initialProposal);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [acknowledgeInfeasible, setAcknowledgeInfeasible] = useState(false);
  const [applied, setApplied] = useState(false);
  const locked = event.status !== 'active' || event.currentVersion === null;
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => { const timer = setInterval(() => setNow(Date.now()), 1000); return () => clearInterval(timer); }, []);
  const expired = proposal ? Date.parse(proposal.expiresAt) <= now : false;

  async function generate(event_: React.FormEvent) {
    event_.preventDefault();
    setError(''); setMessage(''); setProposal(null);
    const changes: Changes = {};
    const newBudget = rupeesToPaise(budgetInput.trim());
    if (newBudget !== null && newBudget !== plan.brief.budgetMinor) changes.budgetMinor = newBudget;
    if (dateInput.trim() && dateInput.trim() !== plan.brief.localDate) changes.localDate = dateInput.trim();
    const g = guestsInput.trim() ? parseInt(guestsInput.trim(), 10) : null;
    if (g !== null && !Number.isNaN(g) && g !== plan.brief.guests) changes.guests = g;
    if (Object.keys(changes).length === 0) { setError('Change at least one field — budget, date or guest count.'); return; }
    setBusy(true);
    try {
      const result = await replanApi.generate(event.id, event.revision, changes);
      setProposal(result.proposal);
      setMessage('Proposal generated. Review the changes before applying.');
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setBusy(false);
    }
  }

  async function apply() {
    if (!proposal) return;
    if (proposal.candidate.feasibility.status === 'infeasible' && !acknowledgeInfeasible) {
      setError('This proposal has a budget shortfall. Check the box to confirm you understand before applying.');
      return;
    }
    setBusy(true); setError('');
    try {
      const result = await replanApi.apply(event.id, proposal.id, event.revision, acknowledgeInfeasible);
      setApplied(true); setMessage(`Plan updated to revision ${result.event.revision}. The accepted plan has been replaced.`);
      onApplied(result.event, result.plan!);
      setProposal(null);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setBusy(false);
    }
  }

  async function discard() {
    if (!proposal) return;
    setBusy(true); setError('');
    try {
      await replanApi.discard(event.id, proposal.id, event.revision);
      setProposal(null); setMessage('Proposal discarded. Your accepted plan is unchanged.');
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="workspace-panel mt-6" aria-label="Replan your occasion">
      <p className="eyebrow">Your priorities stay protected</p>
      <h2>When plans change, review your options.</h2>
      <p className="subtle">
        Request a change to the budget, date or guest count. The system generates a proposal
        showing what would change while protecting locked items. Review it, then choose whether to apply.
      </p>

      {error && (
        <p role="alert" className="notice">{error}</p>
      )}
      {message && (
        <p role="status">{message}</p>
      )}

      {locked && (
        <p className="unavailable-note">
          {event.status !== 'active' ? 'Restore this occasion to request changes.' : 'Accept a plan first to unlock replanning.'}
        </p>
      )}

      {!locked && !proposal && !applied && (
        <form onSubmit={generate} className="mt-6">
          <fieldset disabled={busy}>
            <legend>Request a change</legend>
            <p className="subtle">
              Your locked lines and recorded commitments will be preserved.
              Only flexible estimated lines will be adjusted.
            </p>
            <div className="detail-grid">
              <label htmlFor="replan-budget">
                New budget cap (INR)
                <input
                  id="replan-budget"
                  type="text"
                  inputMode="decimal"
                  value={budgetInput}
                  onChange={e => setBudgetInput(e.target.value)}
                  aria-describedby="replan-budget-hint"
                />
                <small id="replan-budget-hint">Current: {money(plan.brief.budgetMinor)}</small>
              </label>
              <label htmlFor="replan-date">
                New event date (YYYY-MM-DD, optional)
                <input
                  id="replan-date"
                  type="date"
                  value={dateInput}
                  onChange={e => setDateInput(e.target.value)}
                  aria-describedby="replan-date-hint"
                />
                <small id="replan-date-hint">Current: {plan.brief.localDate}</small>
              </label>
              <label htmlFor="replan-guests">
                New guest count (optional)
                <input
                  id="replan-guests"
                  type="number"
                  min={1}
                  max={100000}
                  value={guestsInput}
                  onChange={e => setGuestsInput(e.target.value)}
                  aria-describedby="replan-guests-hint"
                />
                <small id="replan-guests-hint">Current: {plan.brief.guests}</small>
              </label>
            </div>
            <button className="cream-button mt-6" type="submit" disabled={busy}>
              {busy ? 'Generating proposal…' : 'Generate proposal'}
            </button>
          </fieldset>
        </form>
      )}

      {proposal && !applied && (
        <div className="mt-6">
          <p className="eyebrow">
            Proposal · expires {new Date(proposal.expiresAt).toLocaleString('en-IN')}
            {expired ? ' · EXPIRED' : ''}
            {proposal.status !== 'draft' ? ` · ${proposal.status}` : ''}
          </p>

          <CandidateSummary
            candidate={proposal.candidate}
            cap={proposal.requestedChanges.budgetMinor ?? plan.brief.budgetMinor}
          />
          <DiffTable proposal={proposal} />

          {expired && (
            <p className="notice">This proposal has expired. Generate a new one to apply changes.</p>
          )}

          {!expired && proposal.status === 'draft' && (
            <div className="form-actions mt-6">
              {proposal.candidate.feasibility.status === 'infeasible' && (
                <label className="block">
                  <input
                    type="checkbox"
                    checked={acknowledgeInfeasible}
                    onChange={e => setAcknowledgeInfeasible(e.target.checked)}
                  />
                  {' '}I understand this proposal has a budget shortfall and want to apply it anyway.
                </label>
              )}
              <button
                className="cream-button"
                disabled={busy}
                onClick={() => { void apply(); }}
              >
                {busy ? 'Applying…' : 'Apply proposal'}
              </button>
              <button
                className="secondary-button"
                disabled={busy}
                onClick={() => { void discard(); }}
              >
                Discard proposal
              </button>
            </div>
          )}

          {!expired && proposal.status === 'draft' && (
            <button
              className="secondary-button mt-6"
              disabled={busy}
              onClick={() => setProposal(null)}
            >
              Start over with different changes
            </button>
          )}
        </div>
      )}
    </section>
  );
}
