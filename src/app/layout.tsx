
"use client";

import type { Metadata } from 'next';
import './globals.css';
import { Toaster } from "@/components/ui/toaster";
import Header from '@/components/Header';
import { AuthProvider } from '@/contexts/AuthContext';
import { useAuth } from '@/hooks/use-auth';
import PrivateRoute from '@/components/auth/PrivateRoute';
import { UsersProvider } from '@/contexts/UsersContext';
import { usePathname } from 'next/navigation';
import { ReactNode } from 'react';

// This can't be set dynamically for a client component layout root.
// We are setting it here as a static object.
// export const metadata: Metadata = {
//   title: 'WageWise',
//   description: 'Employee production and salary management',
// };

const AppLayout = ({ children }: { children: ReactNode }) => {
  const { user, loading } = useAuth();
  const pathname = usePathname();

  if (pathname === '/login') {
    return <>{children}</>;
  }

  return (
    <div className="flex min-h-screen w-full flex-col bg-background">
      <Header />
      <main className="flex-1">
        {children}
      </main>
    </div>
  );
};


export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ar" dir="rtl">
      <head>
        <title>WageWise</title>
        <meta name="description" content="Employee production and salary management" />
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#f0e7f9" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="WageWise" />
        <link rel="apple-touch-icon" href="/icons/icon-192x192.png" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Cairo:wght@400;500;600;700;800;900&display=swap" rel="stylesheet" />
      </head>
      <body className="font-body antialiased">
        <AuthProvider>
          <UsersProvider>
            <PrivateRoute>
              <AppLayout>
                {children}
              </AppLayout>
              <Toaster />
            </PrivateRoute>
          </UsersProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
