import type { AiProvider } from './provider.js';

/** Explicit local preview only. Values are placeholders, never vendor research. */
export const mockProvider: AiProvider = {
  model: 'local-mock-v1', source: 'synthetic',
  async generate(input) {
    if (input.signal.aborted) throw new Error('Cancelled');
    const data = JSON.parse(input.data);
    // Replan mode: currentPlan + requestedChanges provided
    if (data.currentPlan && data.requestedChanges) {
      const current = data.currentPlan;
      const changes = data.requestedChanges;
      const newBudget = changes.budgetMinor ?? current.brief.budgetMinor;
      // Build candidate: preserve locked lines exactly; scale down unlocked estimated lines proportionally.
      const lockedLines = current.budgetLines.filter((l: Record<string,unknown>) => l.locked || l.committedCostMinor !== null);
      const unlocked = current.budgetLines.filter((l: Record<string,unknown>) => !l.locked && l.committedCostMinor === null);
      const lockedTotal = lockedLines.reduce((sum: number, l: Record<string,unknown>) => sum + (l.committedCostMinor as number ?? l.estimatedCostMinor as number), 0);
      const contingency = Math.round(newBudget * 0.08);
      const available = Math.max(newBudget - lockedTotal - contingency, 0);
      const unlockedTotal = unlocked.reduce((sum: number, l: Record<string,unknown>) => sum + (l.estimatedCostMinor as number), 0);
      const scale = unlockedTotal > 0 ? Math.min(1, available / unlockedTotal) : 0;
      const scaledUnlocked = unlocked.map((l: Record<string,unknown>) => ({ ...l, estimatedCostMinor: Math.round((l.estimatedCostMinor as number) * scale), rationale: 'Scaled to fit revised budget. This is a placeholder estimate.' }));
      const candidateLines = [...lockedLines, ...scaledUnlocked];
      const feasible = candidateLines.reduce((sum: number, l: Record<string,unknown>) => sum + (l.committedCostMinor as number ?? l.estimatedCostMinor as number), 0) + contingency <= newBudget;
      const brief = { ...current.brief, ...(changes.budgetMinor ? { budgetMinor: changes.budgetMinor } : {}), ...(changes.localDate ? { localDate: changes.localDate } : {}), ...(changes.guests ? { guests: changes.guests } : {}), ...(changes.hardRequirements ? { hardRequirements: changes.hardRequirements } : {}) };
      return { inputTokens:0, outputTokens:0, text:JSON.stringify({
        brief, overview: `Revised mock plan reflecting your requested changes. Scaled flexible estimates; locked items unchanged. Not a real AI proposal.`,
        assumptions: ['All scaled amounts are illustrative placeholders.','Confirm every updated estimate with real suppliers.'],
        budgetLines: candidateLines,
        contingencyMinor: contingency,
        tasks: current.tasks,
        vendorChecklist: current.vendorChecklist,
        ideas: current.ideas,
        warnings: ['Mock replan: no AI evaluation of suitability, vendor quotes or real cost data.'],
        feasibility: feasible
          ? { status:'feasible', shortfallMinor:0, reasons:[] }
          : { status:'infeasible', shortfallMinor: Math.max(candidateLines.reduce((sum: number, l: Record<string,unknown>) => sum + (l.committedCostMinor as number ?? l.estimatedCostMinor as number), 0) + contingency - newBudget, 0), reasons:['Committed and locked costs exceed the requested budget cap.'] },
      }) };
    }
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
