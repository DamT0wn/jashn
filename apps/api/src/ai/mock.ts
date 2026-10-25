import type { AiProvider } from './provider.js';

/** Explicit local preview only. Values are placeholders, never vendor research. */
export const mockProvider: AiProvider = {
  model: 'local-mock-v1', source: 'synthetic',
  async generate(input) {
    if (input.signal.aborted) throw new Error('Cancelled');
    const data = JSON.parse(input.data);
    if (!data.brief) return { text: JSON.stringify({
      draft: {name:null,type:null,city:null,localDate:null,timezone:null,guests:null,budgetMinor:null},
      evidence: {}, uncertainties: ['Mock mode does not interpret your text. Fill in the occasion details below.'],
    }), inputTokens:0, outputTokens:0 };
    const brief = data.brief;
    const provenance = {sourceType:'ai_estimate', note:'Local mock placeholder; not a real estimate.'};
    const id = `mock-${crypto.randomUUID()}`;
    return { inputTokens:0, outputTokens:0, text:JSON.stringify({
      overview:`A mock ${brief.type} plan for testing the review and acceptance flow. These placeholders do not evaluate your requirements.`,
      assumptions:['All costs and activities are illustrative placeholders.','Review and replace every placeholder before using this plan for a real occasion.'],
      budgetLines:[{id,category:'Sample refreshments',currency:'INR',allocationMinor:100000,estimatedCostMinor:100000,committedCostMinor:null,paidMinor:0,locked:false,provenance,rationale:'Fixed ₹1,000 placeholder, not a quote or personalized recommendation.'}],
      contingencyMinor:10000,
      tasks:[{id:'mock-review',title:'Review the celebration details',kind:'preparation',schedule:{kind:'date',localDate:brief.localDate},timezone:brief.timezone,dependencyIds:[],priority:'high',status:'todo',locked:false,rationale:'Placeholder task. Choose a suitable preparation deadline.'}],
      vendorChecklist:[{id:'mock-vendor',category:'Refreshments supplier',requiredBy:brief.localDate,questions:['Can you meet our dietary and accessibility requirements?','What is included in a written quote?'],documentsToRequest:['Written quote'],estimatedRange:{minMinor:100000,maxMinor:100000,currency:'INR',provenance},status:'researching',quote:null,linkedBudgetLineId:null}],
      ideas:[{id:'mock-idea',title:'A shared memory corner',description:'An illustrative idea to try the review flow.',preferenceMatch:'Not evaluated in mock mode.',estimatedCostImpact:{direction:'increase',amountMinor:10000,currency:'INR',provenance},status:'suggested'}],
      warnings:['Mock output: no AI request, supplier lookup or requirement evaluation was performed.'],
      feasibility:{status:'infeasible',shortfallMinor:0,reasons:['Mock placeholders require organizer review; suitability has not been evaluated.']},
    }) };
  },
};
