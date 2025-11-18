/**
 * PocketBase URL configuration
 * - Development: http://127.0.0.1:8090
 * - Production: https://geyikdb.erkut.dev
 *
 * Usage inside SvelteKit:
 *     import { PB_URL } from '$lib/config';
 */

export const PB_URL = import.meta.env.DEV ? 'http://localhost:8090' : 'https://geyikdb.erkut.dev';
