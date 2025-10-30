
"use client";

import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/use-auth';
import { useEffect, ReactNode } from 'react';
import { Skeleton } from '../ui/skeleton';

export default function PrivateRoute({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (loading) return; // Wait for the auth state to be determined

    if (!user && pathname !== '/login') {
      router.push('/login');
    }
     if (user && pathname === '/login') {
      router.push('/');
    }
  }, [user, loading, router, pathname]);

  if (loading) {
    return (
        <div className="flex flex-col min-h-screen p-8 space-y-4">
            <div className="flex items-center space-x-4">
                <Skeleton className="h-12 w-12 rounded-full" />
                <div className="space-y-2">
                    <Skeleton className="h-4 w-[250px]" />
                    <Skeleton className="h-4 w-[200px]" />
                </div>
            </div>
            <Skeleton className="h-[125px] w-full rounded-xl" />
            <div className="space-y-2">
                <Skeleton className="h-8 w-full" />
                <Skeleton className="h-8 w-full" />
                <Skeleton className="h-8 w-full" />
            </div>
        </div>
    )
  }

  // If we are on any route that requires auth, but we're not loaded and don't have a user
  if (!user && pathname !== '/login') {
    return null; // Don't render anything, the useEffect will redirect
  }
  
  // If we are on the login page, but we do have a user
  if (user && pathname === '/login') {
    return null; // Don't render anything, the useEffect will redirect
  }

  return <>{children}</>;
}
