import test from 'node:test';
import assert from 'node:assert/strict';
import { PlanSnapshotSchema } from '@jashn/contracts';
import { brief, candidate } from './test-fixtures.js';
import { mockProvider } from './mock.js';
import { checkedReplanCandidate, buildReplanPromptData } from './replan-pipeline.js';
test('mock 50000 to 40000 preserves 20000 food and 4000 photography; impossible cap is explicit',async()=>{
 const base=PlanSnapshotSchema.parse({...candidate,brief,budgetLines:[{...candidate.budgetLines[0],id:'food',estimatedCostMinor:2000000,allocationMinor:2000000,locked:true},{...candidate.budgetLines[0],id:'photo',estimatedCostMinor:400000,allocationMinor:400000,committedCostMinor:400000,paidMinor:100000},{...candidate.budgetLines[0],id:'decor',estimatedCostMinor:1800000,allocationMinor:1800000}],contingencyMinor:800000});
 for(const budgetMinor of [4000000,1000000]){
 const output=await mockProvider.generate({system:'',schema:{},data:JSON.stringify(buildReplanPromptData(base,{budgetMinor})),signal:new AbortController().signal});
 const next=checkedReplanCandidate(JSON.parse(output.text),{...brief,budgetMinor},base,new Date('2026-10-31'));
 assert.deepEqual(next.budgetLines.find(x=>x.id==='food'),base.budgetLines[0]);assert.deepEqual(next.budgetLines.find(x=>x.id==='photo'),base.budgetLines[1]);assert.equal(next.feasibility.status,budgetMinor===4000000?'feasible':'infeasible');
 }
});
