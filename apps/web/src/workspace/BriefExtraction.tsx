import { useEffect, useState } from 'react';
import type { ExtractionResponse } from '@jashn/contracts';
import { aiApi } from './api';
export function BriefExtraction({ onExtract }: { onExtract:(value:ExtractionResponse)=>void }) {
  const [feedback,setFeedback]=useState<ExtractionResponse|null>(null);
  const [enabled,setEnabled]=useState(false); const [mock,setMock]=useState(false); const [text,setText]=useState(''); const [busy,setBusy]=useState(false); const [error,setError]=useState('');
  useEffect(()=>{const controller=new AbortController();void aiApi.status(controller.signal).then(status=>{if(!controller.signal.aborted){setEnabled(status.enabled && status.model !== 'local-mock-v1');setMock(status.model === 'local-mock-v1');}}).catch(()=>undefined);return()=>controller.abort();},[]);
  return <section className="workspace-panel mb-6"><h2>Start with your own words.</h2><p>English, Hindi or Hinglish. Leave out contact details and secrets. Missing details stay blank for your review.</p>{enabled?<><label htmlFor="extract-brief">Describe your occasion</label><textarea id="extract-brief" maxLength={5000} value={text} onChange={e=>setText(e.target.value)} disabled={busy}/><button className="secondary-button mt-6" disabled={busy||!text.trim()} onClick={()=>{setBusy(true);setError('');void aiApi.extract(text,crypto.randomUUID()).then(result=>{setFeedback(result);onExtract(result);}).catch(error=>setError(error.message)).finally(()=>setBusy(false));}}>{busy?'Extracting…':'Extract details for review'}</button></>:<p>{mock ? 'Mock mode does not interpret text. Complete the structured brief below to try a placeholder plan.' : 'AI extraction is not configured. You can complete the structured brief below.'}</p>}{feedback?<div role="status"><p>Review extracted details. Missing: {feedback.missingFields.join(", ") || "none"}.</p><ul>{feedback.uncertainties.map((item,index)=><li key={index}>{item}</li>)}</ul></div>:null}{error?<p role="alert">{error}</p>:null}</section>;
}

