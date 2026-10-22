import { eventRoutes, ApiFailure } from './events.js';
import type { EventServices } from './events.js';
import Fastify from 'fastify';
import { randomUUID } from 'node:crypto';
import { ApiErrorSchema, HealthResponseSchema, LIMITS } from '@jashn/contracts';
import type { ApiError } from '@jashn/contracts';

export function buildApp(services: EventServices | null = null) {
  const app = Fastify({ bodyLimit: LIMITS.bodyBytes, genReqId: () => randomUUID(), logger: false });
  app.get('/health', async () => HealthResponseSchema.parse({ status: 'ok', service: 'jashn-api', schemaVersion: 1 }));
  eventRoutes(app, services);
  app.setNotFoundHandler((request, reply) => reply.code(404).send(ApiErrorSchema.parse({ error: { code: 'NOT_FOUND', message: 'Route not found.', requestId: request.id } })));
  app.setErrorHandler((error, request, reply) => {
    if (error instanceof ApiFailure) return reply.code(error.statusCode).send(ApiErrorSchema.parse({ error: { code: error.code, message: error.message, requestId: request.id } }));
    if (error instanceof Error && error.name === 'ZodError') return reply.code(400).send(ApiErrorSchema.parse({ error: { code: 'INVALID_INPUT', message: 'Check the submitted fields and try again.', requestId: request.id } }));
    const reportedStatus = typeof error === 'object' && error !== null && 'statusCode' in error && typeof error.statusCode === 'number' ? error.statusCode : 500;
    const status = reportedStatus === 413 ? 413 : reportedStatus >= 400 && reportedStatus < 500 ? 400 : 500;
    const code: ApiError['error']['code'] = status === 413 ? 'PAYLOAD_TOO_LARGE' : status === 400 ? 'INVALID_INPUT' : 'INTERNAL_ERROR';
    return reply.code(status).send(ApiErrorSchema.parse({ error: { code, message: status === 500 ? 'An unexpected error occurred.' : 'The request could not be accepted.', requestId: request.id } }));
  });
  return app;
}
