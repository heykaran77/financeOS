import { auth } from '@/lib/auth';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';

/**
 * Returns the authenticated user from the server session.
 * Redirects to login if no session exists.
 * Use this in Server Components and query functions only.
 */
export async function getAuthenticatedUser() {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user) redirect('/auth/login');
    return session.user;
  } catch (error) {
    console.error('Session error:', error);
    redirect('/auth/login');
  }
}
