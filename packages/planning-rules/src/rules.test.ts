import test from 'node:test';
import assert from 'node:assert/strict';
import type { BudgetLine, Task } from '@jashn/contracts';
import { budgetTotals, validateManualBudget, validateProtectedBudget, validateTimeline, validateProtectedTasks } from './index.js';
const line: BudgetLine = { id:'food',category:'Food',currency:'INR',allocationMinor:2000000,estimatedCostMinor:2000000,committedCostMinor:1800000,paidMinor:500000,locked:true,provenance:{ sourceType:'organizer_estimate' },rationale:'Organizer record' };
const ledger = (lines = [line], contingencyMinor = 0) => ({ lines, contingencyMinor });
test('partial payments do not double count; contingency once; null differs from zero', () => {
  const totals = budgetTotals(ledger([line],100000),5000000);
  assert.equal(totals.projectedMinor,1900000); assert.equal(totals.outstandingMinor,1300000); assert.equal(totals.remainingMinor,3100000);
  assert.equal(budgetTotals(ledger([{ ...line,committedCostMinor:0,paidMinor:0 }]),1).projectedMinor,0);
  assert.equal(budgetTotals(ledger([{ ...line,committedCostMinor:null,paidMinor:0 }]),1).projectedMinor,2000000);
});
test('credit is explicit, payment needs commitment, aggregate overflow rejected', () => {
  const totals=budgetTotals(ledger([{ ...line,paidMinor:1900000 }]),1800000);
  assert.equal(totals.creditMinor,100000); assert.equal(totals.outstandingMinor,0); assert.equal(totals.projectedMinor,1800000);
  assert.throws(()=>budgetTotals(ledger([{ ...line,committedCostMinor:null }]),1));
  assert.throws(()=>budgetTotals(ledger([{ ...line,committedCostMinor:Number.MAX_SAFE_INTEGER }],1),1));
  assert.throws(()=>budgetTotals(ledger([{ ...line,paidMinor:1.5 }]),1));
});
test('protected minimum and impossible cap are visible without fabricated savings', () => {
  const totals=budgetTotals(ledger([{ ...line,committedCostMinor:4500000 }]),4000000);
  assert.equal(totals.minimumShortfallMinor,500000); assert.equal(totals.shortfallMinor,500000); assert.equal(totals.remainingMinor,-500000);
});
test('manual corrections require reason/confirmation; protected removal and AI changes fail', () => {
  const before=ledger(); const after=ledger([{ ...line,paidMinor:0 }]);
  assert.throws(()=>validateManualBudget(before,after,false,'refund')); assert.throws(()=>validateManualBudget(before,after,true,''));
  validateManualBudget(before,after,true,'Refund recorded'); assert.throws(()=>validateManualBudget(before,ledger([]),true,'remove'));
  assert.throws(()=>validateProtectedBudget(before,after)); assert.throws(()=>validateProtectedBudget(before,ledger([])));
  validateProtectedBudget(before,before);
  assert.throws(()=>validateProtectedBudget(ledger([]),before));
});
const task: Task={ id:'a',title:'Prepare',kind:'preparation',schedule:{ kind:'date',localDate:'2030-02-01' },timezone:'Asia/Kolkata',dependencyIds:[],priority:'high',status:'todo',locked:false,rationale:'Prepare' };
const clock=new Date('2030-02-01T19:00:00Z');
test('date-only overdue uses event timezone and completed tasks are not overdue', () => {
  assert.deepEqual(validateTimeline([task],'Asia/Kolkata',clock).overdueIds,['a']);
  assert.deepEqual(validateTimeline([{ ...task,status:'done' }],'Asia/Kolkata',clock).overdueIds,[]);
  assert.deepEqual(validateTimeline([task],'Asia/Kolkata',new Date('2030-02-01T18:00:00Z')).overdueIds,[]);
});
test('missing/cyclic/later dependencies and blocked completion rejected', () => {
  const b:Task={ ...task,id:'b',dependencyIds:['a'] };
  assert.deepEqual(validateTimeline([task,b],'Asia/Kolkata',clock).blockedIds,['b']);
  assert.throws(()=>validateTimeline([b],'Asia/Kolkata',clock));
  assert.throws(()=>validateTimeline([{ ...task,dependencyIds:['b'] },b],'Asia/Kolkata',clock));
  assert.throws(()=>validateTimeline([task,{ ...b,status:'done' }],'Asia/Kolkata',clock));
  assert.throws(()=>validateTimeline([{ ...task,schedule:{ kind:'date',localDate:'2030-02-02' } },b],'Asia/Kolkata',clock));
});
test('timed dependencies compare actual instants; locked tasks cannot move', () => {
  const a:Task={ ...task,schedule:{ kind:'timed',startsAt:'2030-02-01T10:00:00+05:30',endsAt:'2030-02-01T11:00:00+05:30' } };
  const b:Task={ ...a,id:'b',dependencyIds:['a'],schedule:{ kind:'timed',startsAt:'2030-02-01T05:00:00Z',endsAt:'2030-02-01T06:00:00Z' } };
  assert.throws(()=>validateTimeline([a,b],'Asia/Kolkata',clock));
  assert.throws(()=>validateProtectedTasks([{ ...a,locked:true }],[a]));
  assert.throws(()=>validateProtectedTasks([a],[{ ...a,locked:true }]));
  assert.throws(()=>validateProtectedTasks([],[{ ...a,locked:true }]));
});
test('event-relative phases and invalid clocks are rejected without moving dates', () => {
  assert.throws(()=>validateTimeline([task],'Asia/Kolkata',clock,'2030-01-31'));
  assert.throws(()=>validateTimeline([task],'Asia/Kolkata',new Date('invalid')));
});
