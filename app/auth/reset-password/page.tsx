import ResetPasswordForm from '@/components/forms/resetPasswordForm';
import { Suspense } from 'react';
import { Skeleton } from '@/components/ui/skeleton';

export default function ResetPasswordPage() {
  return (
    <Suspense
      fallback={
        <div className="flex w-full flex-col gap-6">
          <div className="flex flex-col items-center gap-2">
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-4 w-64" />
          </div>
          <div className="mt-2 flex flex-col gap-5">
            <div className="flex flex-col gap-2">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-10 w-full" />
            </div>
            <div className="flex flex-col gap-2">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-10 w-full" />
            </div>
            <Skeleton className="mt-2 h-10 w-full" />
          </div>
        </div>
      }
    >
      <ResetPasswordForm />
    </Suspense>
  );
}
