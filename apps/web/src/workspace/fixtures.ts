import { PlanSnapshotSchema } from '@jashn/contracts';
import type { EventBrief, PlanSnapshot } from '@jashn/contracts';

export type SampleId = 'birthday' | 'wedding' | 'community';
export const sampleIds: SampleId[] = ['birthday', 'wedding', 'community'];
export function localDateAfter(now: Date, days: number, timezone = 'Asia/Kolkata'): string {
  const parts = new Intl.DateTimeFormat('en', { timeZone: timezone, year: 'numeric', month: '2-digit', day: '2-digit' }).formatToParts(now);
  const part = (type: string) => parts.find(value => value.type === type)?.value;
  const date = new Date(`${part('year')}-${part('month')}-${part('day')}T00:00:00Z`);
  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString().slice(0, 10);
}

export function createSample(id: SampleId, now: Date): PlanSnapshot {
  const wedding = id === 'wedding';
  const community = id === 'community';
  const offset = wedding ? 90 : community ? 45 : 30;
  const date = (days: number) => localDateAfter(now, days);
  const names = { birthday: 'A birthday to remember', wedding: 'An intimate wedding', community: 'A neighbourhood gathering' };
  const categories = ['Venue', 'Food', 'Decor', 'Photography', community ? 'Accessibility & activities' : 'Activities'];
  const amounts = wedding ? [100000, 150000, 65000, 75000, 60000] : community ? [20000, 30000, 8000, 12000, 20000] : [12000, 20000, 6000, 4000, 3000];
  const budget = wedding ? 500000 : community ? 100000 : 50000;
  const provenance = { sourceType: 'synthetic' as const, note: 'Illustrative fixture; not a real vendor quote.' };
  const brief: EventBrief = {
    name: names[id], type: id, city: wedding ? 'Jaipur' : 'Noida', localDate: date(offset), timezone: 'Asia/Kolkata', guests: wedding ? 150 : community ? 100 : 50,
    currency: 'INR', budgetMinor: budget * 100, venueStatus: 'undecided', priorities: ['Food', 'Photography'],
    hardRequirements: community ? ['Vegetarian food', 'Step-free access'] : ['Vegetarian food'],
    preferences: { dietary: 'Vegetarian', theme: community ? 'An inclusive afternoon together' : wedding ? 'Warm, intimate and floral' : 'Relaxed garden celebration', ...(community ? { accessibility: 'Step-free access and accessible seating' } : {}) },
  };
  return PlanSnapshotSchema.parse({
    brief, overview: community ? 'An inclusive neighbourhood afternoon, with shared food, accessible activities and room to connect.' : wedding ? 'A warm wedding gathering built around meaningful rituals, a vegetarian menu and time with your closest people.' : 'A thoughtful birthday afternoon with vegetarian food, a memory corner and games for all ages.',
    assumptions: ['All costs are synthetic estimates, not confirmed quotes.', 'Venue availability and vendor availability have not been checked.'],
    budgetLines: categories.map((category, index) => ({ id: `line-${index}`, category, currency: 'INR', allocationMinor: amounts[index]! * 100, estimatedCostMinor: amounts[index]! * 100, committedCostMinor: null, paidMinor: 0, locked: index === 1 || index === 3, provenance, rationale: 'Illustrative allocation for this sample.' })),
    contingencyMinor: (wedding ? 50000 : community ? 10000 : 5000) * 100,
    tasks: [
      { id: 'venue', title: 'Shortlist a venue and check access', schedule: { kind: 'date', localDate: date(3) }, kind: 'preparation', dependencyIds: [], priority: 'high', status: 'todo', locked: false, rationale: 'Confirm space before finalizing suppliers.' },
      { id: 'menu', title: 'Confirm the vegetarian menu', schedule: { kind: 'date', localDate: date(10) }, kind: 'preparation', dependencyIds: ['venue'], priority: 'high', status: 'todo', locked: false, rationale: 'Check dietary requirements and service arrangements.' },
      { id: 'welcome', title: 'Welcome guests and celebrate', schedule: { kind: 'timed', startsAt: `${date(offset)}T16:00:00+05:30`, endsAt: `${date(offset)}T19:00:00+05:30` }, kind: 'agenda', dependencyIds: ['menu'], priority: 'medium', status: 'todo', locked: true, rationale: 'Leave room for relaxed conversation.' },
      { id: 'cleanup', title: 'Return rentals and tidy the venue', schedule: { kind: 'date', localDate: date(offset + 1) }, kind: 'post_event', dependencyIds: ['welcome'], priority: 'medium', status: 'todo', locked: false, rationale: 'Close out practical details after the event.' },
    ].map(task => ({ ...task, timezone: brief.timezone })),
    vendorChecklist: ['Venue', 'Catering'].map((category, index) => ({ id: `vendor-${index}`, category, requiredBy: date(index ? 10 : 3), questions: index ? ['Can you provide a fully vegetarian menu?', 'What is included in service and cleanup?'] : ['Is the entrance step-free?', 'What is the cancellation policy?'], documentsToRequest: ['Written quote', 'Cancellation terms'], estimatedRange: { minMinor: amounts[index]! * 80, maxMinor: amounts[index]! * 120, currency: 'INR', provenance }, status: 'researching', quote: null, linkedBudgetLineId: null })),
    ideas: [
      { title: 'A shared memory corner', description: 'Invite guests to leave a favourite memory on cards for the host.', preferenceMatch: 'Personal, relaxed and easy to join.' },
      { title: 'A seasonal vegetarian table', description: 'Build a simple menu around seasonal produce and clearly labeled dishes.', preferenceMatch: 'Respects the vegetarian requirement.' },
      { title: community ? 'An accessible activity circle' : 'A little time for play', description: 'Offer seated games and optional group activities with a quiet space nearby.', preferenceMatch: 'Welcoming activities without pressure to participate.' },
    ].map((idea, index) => ({ ...idea, id: `idea-${index}`, estimatedCostImpact: { direction: 'increase', amountMinor: (index + 1) * 50000, currency: 'INR', provenance }, status: 'suggested' })),
    warnings: ['Read-only synthetic sample. No bookings, payments or AI calls have taken place.'], feasibility: { status: 'feasible', shortfallMinor: 0, reasons: [] },
  });
}
