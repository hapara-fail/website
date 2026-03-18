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

/** Allowed hostnames for password-reset redirect links (H-2). */
const ALLOWED_RESET_ORIGINS = new Set([
  'hapara.fail',
  'www.hapara.fail',
  'localhost',
  '127.0.0.1',
]);

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

    // ── Email & Password ──────────────────────────────────────────────────

    emailAndPassword: {
      enabled: true,

      // [C-1] Block sign-in until the user has verified their email address.
      // Prevents account squatting and throwaway registrations.
      requireEmailVerification: true,

      sendResetPassword: async ({ user, url, token }) => {
        // [H-2] Validate the redirect origin before emailing the reset link.
        // Prevents open-redirect attacks that tunnel the token to an attacker.
        try {
          const parsed = new URL(url);
          if (!ALLOWED_RESET_ORIGINS.has(parsed.hostname)) {
            console.error(
              `[auth] Blocked suspicious reset redirect for ${user.email}: ${parsed.hostname}`
            );
            return;
          }
        } catch {
          console.error(`[auth] Invalid reset URL received for ${user.email}`);
          return;
        }

        if (env.BETTER_AUTH_ENABLE_RESET_LOGGING) {
          console.log(`\n🔑 PASSWORD RESET for ${user.email}\n   URL: ${url}\n   Token: ${token}\n`);
        } else {
          // Avoid logging sensitive reset credentials (URL/token) in production.
          console.log(`Password reset requested for ${user.email}`);
        }
      },
    },

    // ── Email Verification ────────────────────────────────────────────────
    // [C-1] sendVerificationEmail is the correct hook for email verification
    // in Better Auth (lives under `emailVerification`, not `emailAndPassword`).

    emailVerification: {
      // [C-1] Stub: replace with Resend, Mailchannels, or similar before launch.
      sendVerificationEmail: async ({ user, url }) => {
        if (env.BETTER_AUTH_ENABLE_RESET_LOGGING) {
          console.log(`\n📧 VERIFY EMAIL for ${user.email}\n   URL: ${url}\n`);
        } else {
          // TODO: send a real verification email here.
          console.log(`Email verification requested for ${user.email}`);
        }
      },
    },

    // ── Session / Cookie hardening ────────────────────────────────────────
    // [M-1] Declare cookie security attributes explicitly so a library upgrade
    // cannot silently change the behaviour.
    advanced: {
      cookies: {
        sessionToken: {
          attributes: {
            httpOnly: true,
            sameSite: 'lax' as const, // 'lax' supports standard auth flows
            secure: true,
            path: '/',
          },
        },
      },
    },

    // ── Database-level field validation ──────────────────────────────────
    // [H-3] Reject profile image URLs that are not HTTPS. This prevents
    // javascript:/data: URI injection when an image is rendered as <img src>.
    databaseHooks: {
      user: {
        create: {
          before: async (user) => {
            if (
              user.image !== undefined &&
              user.image !== null &&
              !user.image.startsWith('https://')
            ) {
              // Strip the unsafe image URL rather than hard-rejecting, to keep
              // UX smooth for sign-ups that accidentally pass a non-HTTPS URL.
              return {
                data: { ...user, image: null },
              };
            }
          },
        },
        update: {
          before: async (user) => {
            if (
              'image' in user &&
              user.image !== undefined &&
              user.image !== null &&
              !(user.image as string).startsWith('https://')
            ) {
              return {
                data: { ...user, image: null },
              };
            }
          },
        },
      },
    },
  });
}

export type Auth = ReturnType<typeof getAuth>;
