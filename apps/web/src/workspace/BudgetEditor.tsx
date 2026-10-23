import { useEffect, useState } from 'react';
import { BudgetLedgerSchema } from '@jashn/contracts';
import type { BudgetResponse, EventRecord } from '@jashn/contracts';
import { eventsApi } from './api';
import { money, paiseToRupees, rupeesToPaise } from './form';

type Row = { id: string; category: string; allocation: string; estimate: string; commitment: string; paid: string; locked: boolean; source: 'organizer_estimate' | 'confirmed_quote'; note: string };
const rowsFrom = (result: BudgetResponse): Row[] => result.ledger.lines.map(line => ({ id: line.id, category: line.category, allocation: paiseToRupees(line.allocationMinor), estimate: paiseToRupees(line.estimatedCostMinor), commitment: line.committedCostMinor === null ? '' : paiseToRupees(line.committedCostMinor), paid: paiseToRupees(line.paidMinor), locked: line.locked, source: line.provenance.sourceType === 'confirmed_quote' ? 'confirmed_quote' : 'organizer_estimate', note: line.rationale }));
export function BudgetEditor({ event, onSaved }: { event: EventRecord; onSaved: (event: EventRecord) => void }) {
  const [data, setData] = useState<BudgetResponse | null>(null); const [rows, setRows] = useState<Row[]>([]);
  const [reserve, setReserve] = useState('0'); const [reason, setReason] = useState('');
  const [confirm, setConfirm] = useState(false); const [acknowledge, setAcknowledge] = useState(false);
  const [error, setError] = useState(''); const [message, setMessage] = useState(''); const [busy, setBusy] = useState(false); const [attempt, setAttempt] = useState(0);
  useEffect(() => { const controller = new AbortController(); void eventsApi.budget(event.id, controller.signal).then(result => { if (!controller.signal.aborted) { setData(result); setRows(rowsFrom(result)); setReserve(paiseToRupees(result.ledger.contingencyMinor)); } }).catch(error => { if (!controller.signal.aborted) setError(error.message); }); return () => controller.abort(); }, [event.id, attempt]);
  function update(id: string, values: Partial<Row>) { setRows(current => current.map(row => row.id === id ? { ...row, ...values } : row)); setMessage('Unsaved changes. Totals below show the last saved budget.'); }
  async function save() {
    setError(''); setMessage('');
    const parsed = BudgetLedgerSchema.safeParse({ contingencyMinor: rupeesToPaise(reserve), lines: rows.map(row => ({ id: row.id, category: row.category, currency: 'INR', allocationMinor: rupeesToPaise(row.allocation), estimatedCostMinor: rupeesToPaise(row.estimate), committedCostMinor: row.commitment.trim() === '' ? null : (rupeesToPaise(row.commitment) ?? NaN), paidMinor: rupeesToPaise(row.paid), locked: row.locked, provenance: { sourceType: row.source }, rationale: row.note || 'Manually recorded by organizer.' })) });
    if (!parsed.success) { setError('Check categories and amounts: use non-negative INR with at most two decimal places. Only an unknown commitment may be blank.'); return; }
    setBusy(true);
    try { const result = await eventsApi.saveBudget(event.id, { expectedVersion: data!.event.revision, ledger: parsed.data, confirmCorrections: confirm, reason, acknowledgeShortfall: acknowledge }); setData(result); onSaved(result.event); setConfirm(false); setAcknowledge(false); setReason(''); setMessage('Budget saved. Totals calculated by the server.'); }
    catch (error) { setError((error as Error).message); } finally { setBusy(false); }
  }
  return <section className="workspace-panel budget-editor mt-6"><h2>Your budget ledger.</h2><p>Manual organizer records in INR. Payments are recorded here, never transferred. This ledger is not an accepted AI plan.</p>
    {error ? <p role="alert" className="notice">{error} <button type="button" disabled={busy} onClick={() => { setError(''); setAttempt(value => value + 1); }}>Reload saved budget (discard edits)</button></p> : null}
    {message ? <p role="status">{message}</p> : null}
    {!data ? <p>Loading budget…</p> : <><dl className="brief-details">{Object.entries({ 'Saved projected cost, including reserve': data.totals.projectedMinor, 'Saved contingency': data.ledger.contingencyMinor, 'Remaining forecast': data.totals.remainingMinor, 'Paid (not added to forecast)': data.totals.paidMinor, 'Outstanding confirmed': data.totals.outstandingMinor, 'Credit / refund due': data.totals.creditMinor, 'Protected minimum': data.totals.protectedMinor }).map(([label,value]) => <div key={label}><dt>{label}</dt><dd>{money(value)}</dd></div>)}</dl>
    {data.totals.shortfallMinor > 0 ? <p className="notice" role="status">Budget shortfall: {money(data.totals.shortfallMinor)}. Protected minimum shortfall: {money(data.totals.minimumShortfallMinor)}. Review obligations or raise the cap; no savings have been invented.</p> : <p>Recorded costs are within the cap. This does not certify a complete or feasible event plan.</p>}
    <form onSubmit={e => { e.preventDefault(); void save(); }}><fieldset disabled={busy || event.status !== 'active'}><legend>Budget items</legend>
      {rows.map((row,index) => <fieldset className="workspace-panel mt-6" key={row.id}><legend>Item {index + 1}</legend><div className="detail-grid"><label>Category<input maxLength={160} required value={row.category} onChange={e => update(row.id,{ category:e.target.value })} /></label>{(['allocation','estimate','commitment','paid'] as const).map(field => <label key={field}>{field === 'commitment' ? 'Confirmed total (blank = unknown)' : field === 'paid' ? 'Paid to date' : field === 'allocation' ? 'Allocation' : 'Estimated total'} (INR)<input inputMode="decimal" value={row[field]} onChange={e => update(row.id,{ [field]: e.target.value })} /></label>)}<label>Source<select value={row.source} onChange={e => update(row.id,{ source:e.target.value as Row['source'] })}><option value="organizer_estimate">Organizer estimate</option><option value="confirmed_quote">Organizer-confirmed quote</option></select></label><label>Notes<input maxLength={2000} value={row.note} onChange={e => update(row.id,{ note:e.target.value })} /></label></div><label><input type="checkbox" checked={row.locked} onChange={e => update(row.id,{ locked:e.target.checked })} /> Lock against AI changes</label><button className="secondary-button" type="button" onClick={() => setRows(current => current.filter(item => item.id !== row.id))}>Remove item {index + 1}</button></fieldset>)}
      <button className="secondary-button mt-6" type="button" disabled={rows.length >= 100} onClick={() => setRows(current => [...current,{ id:crypto.randomUUID(),category:'',allocation:'0',estimate:'0',commitment:'',paid:'0',locked:false,source:'organizer_estimate',note:'' }])}>Add budget item</button>
      <div className="detail-grid mt-6"><label>Contingency reserve (INR)<input inputMode="decimal" value={reserve} onChange={e => setReserve(e.target.value)} /></label><label>Correction reason<input maxLength={500} value={reason} onChange={e => setReason(e.target.value)} /></label></div>
      <p>To remove a protected item, first explicitly clear its commitment/payments and unlock it, save, then remove it. Corrections do not cancel vendor agreements.</p>
      <label className="block"><input type="checkbox" checked={confirm} onChange={e => setConfirm(e.target.checked)} /> I confirm reductions to recorded commitments or payments.</label>
      <label className="block"><input type="checkbox" checked={acknowledge} onChange={e => setAcknowledge(e.target.checked)} /> I acknowledge any budget shortfall in this save.</label>
      <button className="cream-button mt-6" type="submit">{busy ? 'Saving…' : 'Save budget'}</button>
    </fieldset></form></>}
  </section>;
}
