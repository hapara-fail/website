import { betterAuth } from 'better-auth';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';
import type { AppDatabase } from './db';
import * as schema from './drizzle-schema';

export interface AuthEnv {
  BETTER_AUTH_SECRET: string;
  BETTER_AUTH_URL: string;
  /**
   * When true, log full password reset URLs and tokens to the console.
   * Enable only in local development; leave undefined/false in production.
   */
  BETTER_AUTH_ENABLE_RESET_LOGGING?: boolean;
}

export function getAuth(db: AppDatabase, env: AuthEnv) {
  return betterAuth({
    database: drizzleAdapter(db, {
      provider: 'sqlite',
      schema: {
        user: schema.user,
        session: schema.session,
        account: schema.account,
        verification: schema.verification,
      },
    }),
    secret: env.BETTER_AUTH_SECRET,
    baseURL: env.BETTER_AUTH_URL,
    trustedOrigins: [
      'http://localhost:8787',
      'http://localhost:8788',
      'http://127.0.0.1:8787',
      'http://127.0.0.1:8788',
      'https://www.hapara.fail',
      'https://hapara.fail',
    ],
    emailAndPassword: {
      enabled: true,
      sendResetPassword: async ({ user, url, token }) => {
        // In production, replace this with a real email sender (e.g. Resend, Mailchannels).
        // For local dev, the reset URL can be logged by enabling BETTER_AUTH_ENABLE_RESET_LOGGING.
        if (env.BETTER_AUTH_ENABLE_RESET_LOGGING) {
          console.log(`\n🔑 PASSWORD RESET for ${user.email}\n   URL: ${url}\n   Token: ${token}\n`);
        } else {
          // Avoid logging sensitive reset credentials (URL/token) in production.
          console.log(`Password reset requested for ${user.email}`);
        }
      },
    },
  });
}

export type Auth = ReturnType<typeof getAuth>;
