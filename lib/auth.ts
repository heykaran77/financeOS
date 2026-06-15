import { db } from '@/db';
import { betterAuth } from 'better-auth';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';
import * as schema from '@/db/schema/schema';
import { nextCookies } from 'better-auth/next-js';
import { render } from '@react-email/components';
import VerificationEmail from '@/components/emails/VerificationEmail';
import ResetPasswordEmail from '@/components/emails/ResetPasswordEmail';
import { sendEmail } from '@/lib/email';

export const auth = betterAuth({
  baseURL: process.env.BETTER_AUTH_URL!,
  emailVerification: {
    sendVerificationEmail: async ({ user, url }) => {
      console.log('Generating verification email for:', user.name, user.email);
      console.log('Verification URL:', url);
      const emailHTML = await render(
        VerificationEmail({ userName: user.name, verificationUrl: url }),
      );
      await sendEmail({
        to: user.email,
        subject: 'Verify your email address - FinanceOS',
        html: emailHTML,
      });
    },
    sendOnSignUp: true,
  },
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: true,
    onExistingUserSignUp: async ({ user }) => {
      if (!user.emailVerified) {
        await auth.api.sendVerificationEmail({
          body: {
            email: user.email,
            callbackURL: '/dashboard',
          },
        });
      }
    },
    sendResetPassword: async ({ user, url }) => {
      if (!user.email) return;
      const emailHTML = await render(
        ResetPasswordEmail({ userName: user.name, resetPasswordUrl: url }),
      );
      await sendEmail({
        to: user.email,
        subject: 'Reset your password - FinanceOS',
        html: emailHTML,
      });
    },
  },
  database: drizzleAdapter(db, {
    provider: 'pg',
    schema: schema,
  }),
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    },
  },
  databaseHooks: {
    user: {
      create: {
        before: async (user) => {
          if (!user.image) {
            const seed = encodeURIComponent(user.name || user.email || 'user');
            user.image = `https://api.dicebear.com/10.x/notionists/svg?seed=${seed}`;
          }
          return { data: user };
        },
      },
    },
  },
  plugins: [nextCookies()],
});
