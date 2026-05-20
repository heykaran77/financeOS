'use client';

import { Button, type ButtonProps } from '@/components/ui/button';
import { authClient } from '@/lib/auth-client';
import { useRouter } from 'next/navigation';
import { toastManager } from '../ui/toast';

export default function Logout({ children, ...props }: ButtonProps) {
  const router = useRouter();
  const handleLogout = async () => {
    try {
      toastManager.promise(authClient.signOut(), {
        loading: 'Logging out...',
        success: () => {
          router.push('/auth/login');
          return {
            description: 'You have been logged out successfully',
            title: 'Logout successful',
          };
        },
        error: () => {
          return {
            title: 'Logout failed',
            description: 'Something went wrong while logging out',
          };
        },
      });
    } catch (error) {
      console.log(error);
    }
  };
  return (
    <Button {...props} onClick={handleLogout}>
      {children || 'Logout'}
    </Button>
  );
}
