import { buildApp } from '../apps/api/src/app.js';
import { firebaseServices } from '../apps/api/src/firebase.js';
import { brief, fakeConfig } from '../apps/api/src/ai/test-fixtures.js';
import { mockProvider } from '../apps/api/src/ai/mock.js';
if(process.env.GOOGLE_CLOUD_PROJECT!=='demo-jashn')throw Error('Local demo only');
const email='demo@jashn.test',password='Jashn-Local-Demo-Only!';
let response=await fetch('http://127.0.0.1:9099/identitytoolkit.googleapis.com/v1/accounts:signUp?key=demo-key',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({email,password,returnSecureToken:true})});
if(!response.ok)response=await fetch('http://127.0.0.1:9099/identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=demo-key',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({email,password,returnSecureToken:true})});
if(!response.ok)throw Error('Local demo account unavailable');
const user=await response.json() as {idToken:string};const app=buildApp(firebaseServices()!,fakeConfig(mockProvider,10000));
const call=(url:string,payload:unknown)=>app.inject({method:'POST',url,payload,headers:{authorization:`Bearer ${user.idToken}`,'idempotency-key':crypto.randomUUID()}});
try {const created=await call('/v1/events',{brief:{...brief,name:'Jashn mock celebration'}});if(created.statusCode!==201)throw Error(created.body);const path=`/v1/events/${created.json().event.id}`;const generated=await call(`${path}/generations`,{expectedVersion:0});if(generated.statusCode!==201)throw Error(generated.body);const accepted=await call(`${path}/drafts/${generated.json().draft.id}/accept`,{expectedVersion:0,acknowledgeInfeasible:true});if(accepted.statusCode!==200)throw Error(accepted.body);console.log(`Demo ready: http://127.0.0.1:5173/app/events/${created.json().event.id}\nLocal-only login: ${email} / ${password}`);}finally{await app.close();}
