import { buildApp } from './app.js';

const port = Number(process.env.PORT || 3001);
if (!Number.isInteger(port) || port < 1 || port > 65535) throw new Error('PORT must be an integer from 1 to 65535');
const app = buildApp();
try {
  await app.listen({ port, host: process.env.HOST || '127.0.0.1' });
  console.info(`Jashn API listening on port ${port}`);
} catch {
  console.error('API could not start. Check HOST, PORT and whether the port is in use.');
  process.exitCode = 1;
}
for (const signal of ['SIGINT', 'SIGTERM'] as const) {
  process.once(signal, () => { void app.close(); });
}
