
"use client";

import UserManagement from '@/components/users/UserManagement';
import { useAuth } from '@/hooks/use-auth';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function UsersPage() {
  const { hasRole, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !hasRole('admin')) {
      router.push('/');
    }
  }, [loading, hasRole, router]);

  if (loading || !hasRole('admin')) {
    // You can show a skeleton or a loading spinner here
    return null;
  }

  return (
    <div className="container mx-auto p-4 sm:p-6 md:p-8">
      <UserManagement />
    </div>
  );
}
