import { GoogleGenAI } from '@google/genai';
import { mockProvider } from './mock.js';
export interface ProviderInput { system: string; data: string; schema: unknown; signal: AbortSignal }
export interface ProviderOutput { text: string; inputTokens: number; outputTokens: number }
export interface AiProvider { readonly model: string; readonly source: 'gemini' | 'synthetic'; generate(input: ProviderInput): Promise<ProviderOutput> }
export interface AiConfig { provider: AiProvider; userDailyLimit: number; globalDailyLimit: number; concurrency: number; timeoutMs: number }
export const MODEL_ID = 'gemini-3.8-flash';
export function configuredAi(env: NodeJS.ProcessEnv): AiConfig | null {
  if (env.MOCK_GENERATION_ENABLED === 'true') {
    if (env.NODE_ENV === 'production' || env.GENERATION_ENABLED === 'true' || env.GOOGLE_CLOUD_PROJECT !== 'demo-jashn' || env.FIRESTORE_EMULATOR_HOST !== '127.0.0.1:8080' || env.FIREBASE_AUTH_EMULATOR_HOST !== '127.0.0.1:9099') throw new Error('Mock generation requires the explicit local demo emulator configuration, without live generation.');
    return {provider:mockProvider,userDailyLimit:100,globalDailyLimit:1000,concurrency:4,timeoutMs:45000};
  }
  if (env.GENERATION_ENABLED !== 'true') return null;
  if (!env.GOOGLE_CLOUD_PROJECT || env.GOOGLE_CLOUD_PROJECT.startsWith('demo-') || env.FIRESTORE_EMULATOR_HOST || env.FIREBASE_AUTH_EMULATOR_HOST || !env.GOOGLE_CLOUD_LOCATION || env.GEMINI_MODEL !== MODEL_ID) throw new Error('Generation requires a live project, explicit location and the pinned model.');
  const positive = (key: string, max: number) => { const value = Number(env[key]); if (!Number.isInteger(value) || value < 1 || value > max) throw new Error(`Invalid ${key}`); return value; };
  const userDailyLimit = positive('GENERATION_DAILY_LIMIT',100);
  const globalDailyLimit = positive('GENERATION_GLOBAL_DAILY_LIMIT',1000);
  const concurrency = positive('GENERATION_CONCURRENCY',10);
  const client = new GoogleGenAI({ vertexai:true,project:env.GOOGLE_CLOUD_PROJECT,location:env.GOOGLE_CLOUD_LOCATION, httpOptions:{ apiVersion:'v1',timeout:45000,headers:{},retryOptions:{ attempts:1 } } });
  return { userDailyLimit, globalDailyLimit, concurrency, timeoutMs:45000, provider:{ model:MODEL_ID,source:'gemini',async generate(input) {
    const result = await client.models.generateContent({ model:MODEL_ID,contents:input.data,config:{ systemInstruction:input.system,responseMimeType:'application/json',responseJsonSchema:input.schema,maxOutputTokens:8192,abortSignal:input.signal } });
    if (!result.text) throw new Error('No usable output');
    return { text:result.text,inputTokens:result.usageMetadata?.promptTokenCount || 0,outputTokens:result.usageMetadata?.candidatesTokenCount || 0 };
  } } };
}
