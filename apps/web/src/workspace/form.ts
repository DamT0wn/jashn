import { createEventBriefSchema, EventBriefSchema } from '@jashn/contracts';

export function rupeesToPaise(input: string): number | null {
  if (!/^\d+(\.\d{1,2})?$/.test(input.trim()) || input.length > 18) return null;
  const [whole = '', fraction = ''] = input.trim().split('.');
  const value = BigInt(whole) * 100n + BigInt(fraction.padEnd(2, '0'));
  return value <= BigInt(Number.MAX_SAFE_INTEGER) ? Number(value) : null;
}
export function paiseToRupees(minor: number): string {
  const value = BigInt(minor);
  return String(value / 100n) + '.' + String(value % 100n).padStart(2, '0');
}
export const initialForm = { name: '', type: 'birthday', city: '', localDate: '', timezone: 'Asia/Kolkata', guests: '', budget: '', priorities: '', venueStatus: 'undecided', dietary: '', accessibility: '', cultural: '', theme: '', hardRequirements: '' };
export type BriefForm = typeof initialForm;
export function validateBrief(form: BriefForm, now = new Date(), allowHistoricalDate = false) {
  const optional = (value: string) => value.trim() || undefined;
  return (allowHistoricalDate ? EventBriefSchema : createEventBriefSchema(now)).safeParse({
    name: form.name, type: form.type, city: form.city, localDate: form.localDate, timezone: form.timezone,
    guests: /^\d+$/.test(form.guests) ? Number(form.guests) : NaN,
    budgetMinor: rupeesToPaise(form.budget), currency: 'INR', venueStatus: form.venueStatus,
    priorities: form.priorities.split(',').map(value => value.trim()).filter(Boolean),
    hardRequirements: form.hardRequirements.split('\n').map(value => value.trim()).filter(Boolean),
    preferences: { dietary: optional(form.dietary), accessibility: optional(form.accessibility), cultural: optional(form.cultural), theme: optional(form.theme) },
  });
}
export const money = (minor: number) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: minor % 100 ? 2 : 0 }).format(minor / 100);
