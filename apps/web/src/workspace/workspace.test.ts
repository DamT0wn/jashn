import test from 'node:test';
import assert from 'node:assert/strict';
import { createEventBriefSchema } from '@jashn/contracts';
import { createSample, localDateAfter, sampleIds } from './fixtures';
import { initialForm, money, paiseToRupees, rupeesToPaise, validateBrief } from './form';
import { draftRepository, fixtureRepository } from './repository';

const now = new Date('2030-01-01T20:00:00Z');
const valid = { ...initialForm, name: 'A birthday', city: 'Noida', localDate: '2030-02-01', guests: '50', budget: '50000.50' };
test('all samples reconcile their illustrative cap and remain synthetic', () => {
  for (const id of sampleIds) {
    const plan = createSample(id, now);
    assert.equal(createEventBriefSchema(now).safeParse(plan.brief).success, true);
    assert.equal(plan.budgetLines.reduce((sum, line) => sum + line.estimatedCostMinor, plan.contingencyMinor), plan.brief.budgetMinor);
    for (const line of plan.budgetLines) {
      assert.equal(line.provenance.sourceType, 'synthetic');
      assert.equal(line.committedCostMinor, null);
      assert.equal(line.paidMinor, 0);
    }
    for (const task of plan.tasks) for (const dependency of task.dependencyIds) assert.ok(plan.tasks.some(item => item.id === dependency));
    for (const vendor of plan.vendorChecklist) { assert.equal(vendor.quote, null); assert.equal(vendor.estimatedRange.provenance.sourceType, 'synthetic'); }
  }
});
test('sample dates use event-local today and a controllable clock', () => {
  assert.equal(localDateAfter(now, 0), '2030-01-02');
  assert.equal(createSample('birthday', now).brief.localDate, '2030-02-01');
  assert.equal(createSample('birthday', new Date('2030-01-02T20:00:00Z')).brief.localDate, '2030-02-02');
  assert.equal(localDateAfter(new Date('2032-02-28T20:00:00Z'), 1), '2032-03-01');
});
test('INR conversion uses exact paise and rejects ambiguous or unsafe amounts', () => {
  assert.equal(rupeesToPaise('50000.50'), 5000050);
  assert.equal(rupeesToPaise('0.01'), 1);
  assert.equal(rupeesToPaise(paiseToRupees(Number.MAX_SAFE_INTEGER)), Number.MAX_SAFE_INTEGER);
  for (const input of ['', '-1', '1e3', '1,000', '1.001', '9007199254740992']) assert.equal(rupeesToPaise(input), null);
});
test('wizard rejects missing details, past dates, invalid zones and counts', () => {
  assert.equal(validateBrief(initialForm, now).success, false);
  assert.equal(validateBrief(valid, now).success, true);
  for (const change of [{ localDate: '2030-01-01' }, { timezone: 'invalid/zone' }, { guests: '2.5' }, { guests: '0' }, { budget: '0' }, { name: 'x'.repeat(121) }]) assert.equal(validateBrief({ ...valid, ...change }, now).success, false);
});
test('wizard preserves explicit priorities, requirements and optional preferences', () => {
  const result = validateBrief({ ...valid, priorities: ' Food, Photography ', hardRequirements: 'Vegetarian\nStep-free access', dietary: 'Vegetarian', cultural: 'Family-supplied ritual', accessibility: 'Step-free access' }, now);
  assert.ok(result.success);
  assert.equal(result.data.budgetMinor, 5000050);
  assert.deepEqual(result.data.priorities, ['Food', 'Photography']);
  assert.deepEqual(result.data.hardRequirements, ['Vegetarian', 'Step-free access']);
  assert.equal(result.data.preferences.cultural, 'Family-supplied ritual');
});
test('repositories keep local drafts separate and honor cancellation', async () => {
  const samples = fixtureRepository(() => now);
  assert.equal((await samples.list()).length, 3);
  assert.equal(await samples.get('local-draft'), null);
  assert.equal(await samples.get('unknown'), null);
  const empty = draftRepository(null);
  assert.deepEqual(await empty.list(), []);
  const draft = draftRepository(createSample('birthday', now).brief);
  assert.equal(await draft.get('birthday'), null);
  assert.equal((await draft.get('local-draft'))?.plan, null);
  assert.equal((await draft.get('local-draft'))?.mode, 'local-draft');
  const controller = new AbortController(); controller.abort();
  await assert.rejects(samples.get('birthday', controller.signal));
  await assert.rejects(draft.list(controller.signal));
});

test('money display preserves safe integer paise and signed shortfalls', () => {
  assert.equal(money(Number.MAX_SAFE_INTEGER), '₹9,00,71,99,25,47,409.91');
  assert.equal(money(-100001), '-₹1,000.01');
});
