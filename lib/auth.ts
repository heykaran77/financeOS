import { db } from '@/db';
import { betterAuth } from 'better-auth';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';
import * as schema from '@/db/schema/schema';
import { nextCookies } from 'better-auth/next-js';

export const auth = betterAuth({
  emailAndPassword: { enabled: true, requireEmailVerification: true },
  database: drizzleAdapter(db, {
    provider: 'pg',
    schema: schema,
  }),
  plugins: [nextCookies()],
});
