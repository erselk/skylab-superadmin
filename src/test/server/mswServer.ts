import { setupServer } from 'msw/node';

import { handlers } from './handlers';

/**
 * API mock’lu testlerde suite içinde kullanın:
 *
 * ```ts
 * import { server } from '@/test/server/mswServer';
 *
 * beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));
 * afterEach(() => server.resetHandlers());
 * afterAll(() => server.close());
 * ```
 */
export const server = setupServer(...handlers);
