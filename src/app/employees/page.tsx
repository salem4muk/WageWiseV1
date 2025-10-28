
"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/use-auth';
import { EmployeeManagement } from '@/components/employees/EmployeeManagement';

export default function EmployeesPage() {
  const { hasRole } = useAuth();
  const router = useRouter();

  const isAuthorized = hasRole('admin') || hasRole('supervisor');

  useEffect(() => {
    if (!isAuthorized) {
      router.push('/');
    }
  }, [isAuthorized, router]);

  if (!isAuthorized) {
    return null; 
  }

  return (
    <div className="container mx-auto p-4 sm:p-6 md:p-8">
      <EmployeeManagement />
    </div>
  );
}
