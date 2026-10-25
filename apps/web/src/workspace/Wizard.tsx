import { useState } from 'react';
import type { FormEvent } from 'react';
import { BriefExtraction } from './BriefExtraction';

import type { EventBrief } from '@jashn/contracts';
import { initialForm, money, paiseToRupees, validateBrief } from './form';
import type { BriefForm } from './form';

export function Wizard({ onConfirm, initialBrief }: { onConfirm: (brief: EventBrief) => Promise<void>; initialBrief?: EventBrief }) {
  const [form, setForm] = useState<BriefForm>(() => initialBrief ? { ...initialForm, dietary: initialBrief.preferences.dietary || '', accessibility: initialBrief.preferences.accessibility || '', cultural: initialBrief.preferences.cultural || '', theme: initialBrief.preferences.theme || '', name: initialBrief.name, type: initialBrief.type, city: initialBrief.city, localDate: initialBrief.localDate, timezone: initialBrief.timezone, guests: String(initialBrief.guests), budget: paiseToRupees(initialBrief.budgetMinor), venueStatus: initialBrief.venueStatus || 'undecided', priorities: initialBrief.priorities.join(', '), hardRequirements: initialBrief.hardRequirements.join('\n') } : initialForm);
  const [step, setStep] = useState(0);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [confirmed, setConfirmed] = useState<EventBrief | null>(null);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState('');
  async function save() {
    const result = validateBrief(form, new Date(), Boolean(initialBrief && initialBrief.localDate === form.localDate));
    if (!result.success) { setStep(0); setErrors({ localDate: 'Review your date and details before saving.' }); return; }
    setSaving(true); setSaveError('');
    try { await onConfirm({ ...initialBrief, ...result.data, preferences: { ...initialBrief?.preferences, ...result.data.preferences } }); } catch (error) { setSaveError(error instanceof Error ? error.message : 'Could not save. Try again.'); } finally { setSaving(false); }
  }
  const update = (key: keyof BriefForm, value: string) => { setForm(current => ({ ...current, [key]: value })); setErrors(current => ({ ...current, [key]: '' })); };
  function submit(event: FormEvent) {
    event.preventDefault();
    const result = validateBrief(form, new Date(), Boolean(initialBrief && initialBrief.localDate === form.localDate));
    if (!result.success) {
      const next: Record<string, string> = {};
      for (const issue of result.error.issues) {
        const field = issue.path[0] === 'preferences' ? String(issue.path[1]) : issue.path[0] === 'budgetMinor' ? 'budget' : String(issue.path[0]);
        next[field] = field === 'name' && !form.name.trim() ? 'Enter an event name.' : field === 'city' && !form.city.trim() ? 'Enter a city.' : field === 'budget' ? 'Enter a positive INR amount with at most two decimal places.' : field === 'guests' ? 'Enter a whole guest count between 1 and 100,000.' : issue.message;
      }
      const detailFields = ['name', 'type', 'city', 'localDate', 'timezone', 'guests', 'budget'];
      if (step === 0 && !Object.keys(next).some(key => detailFields.includes(key))) { setStep(1); setErrors({}); return; }
      setErrors(next);
      const first = Object.keys(next)[0];
      if (first && detailFields.includes(first)) setStep(0);
      requestAnimationFrame(() => document.getElementById(`field-${first}`)?.focus());
      return;
    }
    setErrors({});
    if (step === 0) setStep(1);
    else { setConfirmed(result.data); setStep(2); }
  }
  function field(key: keyof BriefForm, label: string, options: { type?: string; hint?: string; required?: boolean; maxLength?: number; multiline?: boolean } = {}) {
    const shared = { id: `field-${key}`, name: key, value: form[key], onChange: (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => update(key, event.target.value), 'aria-invalid': Boolean(errors[key]), 'aria-describedby': `hint-${key}`, required: options.required || false, maxLength: options.maxLength || 2000 };
    return <div className="form-field"><label htmlFor={shared.id}>{label}{options.required ? <span aria-hidden="true"> *</span> : null}</label>{options.multiline ? <textarea {...shared} rows={3} /> : <input {...shared} type={options.type || 'text'} inputMode={key === 'budget' ? 'decimal' : key === 'guests' ? 'numeric' : undefined} />}<p id={`hint-${key}`} className={errors[key] ? 'field-error' : 'field-hint'}>{errors[key] || options.hint}</p></div>;
  }
  return <>
    <div className="page-heading"><p className="eyebrow">A celebration, in the making</p><h1>Start with your occasion.</h1><p>A few thoughtful details help shape a plan that feels like you.</p></div>
    <div className="notice">Review your details before saving to your signed-in account. Generation requires separate draft review and acceptance.</div>
    <BriefExtraction onExtract={result => { const draft=result.draft; setForm(current => ({ ...current,name:draft.name || "",type:draft.type || "",city:draft.city || "",localDate:draft.localDate || "",timezone:draft.timezone || "",guests:draft.guests === null ? "" : String(draft.guests),budget:draft.budgetMinor === null ? "" : paiseToRupees(draft.budgetMinor) })); setStep(0); setSaveError(""); setErrors({}); }} /><ol className="wizard-steps" aria-label="Progress">{['The essentials', 'Your priorities', 'Review your brief'].map((label, index) => <li key={label} aria-current={step === index ? 'step' : undefined}><span>0{index + 1}</span>{label}</li>)}</ol>
    {step < 2 ? <form className="workspace-panel wizard-form" onSubmit={submit} noValidate>
      <h2>{step === 0 ? 'Tell us what you’re celebrating.' : 'Make it your kind of celebration.'}</h2>
      <p className="subtle">{step === 0 ? 'Fields marked * are required. Dates are interpreted in your chosen timezone.' : 'These details are optional. Hard requirements below must be preserved in future plans.'}</p>
      {Object.values(errors).some(Boolean) ? <p role="alert" className="field-error">Please correct the highlighted fields. Your entries have been kept.</p> : null}
      <div className="form-grid">{step === 0 ? <>
        {field('name', 'Event name', { required: true, maxLength: 120, hint: 'For example, Aanya’s birthday' })}
        <div className="form-field"><label htmlFor="field-type">Occasion *</label><select id="field-type" value={form.type} onChange={event => update('type', event.target.value)}><option value="">Choose occasion</option><option value="birthday">Birthday</option><option value="wedding">Wedding</option><option value="community">Community gathering</option></select></div>
        {field('city', 'City', { required: true, maxLength: 100 })}{field('localDate', 'Event date', { type: 'date', required: true })}
        {field('timezone', 'Timezone', { required: true, maxLength: 100, hint: 'Suggested: Asia/Kolkata. Confirm or enter another IANA timezone.' })}
        {field('guests', 'Guest count', { required: true, maxLength: 6 })}
        {field('budget', 'Total budget (INR)', { required: true, maxLength: 18, hint: 'Enter rupees, e.g. 50000 or 50000.50. INR only.' })}
        <div className="form-field"><label htmlFor="field-venueStatus">Venue status</label><select id="field-venueStatus" value={form.venueStatus} onChange={event => update('venueStatus', event.target.value)}><option value="undecided">Still exploring</option><option value="shortlisted">Shortlisted</option><option value="confirmed">Confirmed by me</option></select></div>
      </> : <>
        {field('priorities', 'Priority categories', { hint: 'Comma-separated, e.g. Food, Photography. Up to 20.' })}
        {field('theme', 'Theme or atmosphere')}{field('dietary', 'Dietary preferences')}{field('accessibility', 'Accessibility needs')}{field('cultural', 'Cultural preferences', { hint: 'Only what you choose to share; nothing is inferred.' })}
        {field('hardRequirements', 'Requirements to preserve', { multiline: true, hint: 'One per line, e.g. Fully vegetarian menu. Up to 20.' })}
      </>}</div>
      <div className="unavailable-note">Confirm every extracted detail. Missing or uncertain information must be filled in before saving.</div>
      <div className="form-actions">{step === 1 ? <button type="button" className="secondary-button" onClick={() => { setStep(0); setErrors({}); }}>Back</button> : <span />}<button className="cream-button" type="submit">{step === 0 ? 'Continue to priorities' : 'Review brief'} <span aria-hidden="true">→</span></button></div>
    </form> : confirmed ? <section className="workspace-panel"><p className="eyebrow">Review before saving</p><h2>Does everything look right?</h2><dl className="brief-details">{Object.entries({ Event: confirmed.name, Occasion: confirmed.type, City: confirmed.city, Date: confirmed.localDate, Timezone: confirmed.timezone, Guests: confirmed.guests, Budget: money(confirmed.budgetMinor), Venue: confirmed.venueStatus, Priorities: confirmed.priorities.join(', ') || 'None specified', Requirements: confirmed.hardRequirements.join('; ') || 'None specified', ...confirmed.preferences }).map(([label, value]) => <div key={label}><dt>{label}</dt><dd>{value || 'None specified'}</dd></div>)}</dl>{saveError ? <p role="alert" className="field-error">{saveError}</p> : null}<div className="form-actions"><button className="secondary-button" disabled={saving} onClick={() => setStep(1)}>Edit details</button><button className="cream-button" disabled={saving} onClick={() => { void save(); }}>{saving ? 'Saving…' : 'Confirm and save →'}</button></div></section> : null}
  </>;
}
