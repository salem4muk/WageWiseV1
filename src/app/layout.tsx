
import type { Metadata } from 'next';
import './globals.css';
import { Toaster } from "@/components/ui/toaster";
import Header from '@/components/Header';
import { AuthProvider } from '@/contexts/AuthContext';
import PrivateRoute from '@/components/auth/PrivateRoute';
import { UsersProvider } from '@/contexts/UsersContext';

export const metadata: Metadata = {
  title: 'WageWise',
  description: 'Employee production and salary management',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ar" dir="rtl">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Cairo:wght@400;500;600;700;800;900&display=swap" rel="stylesheet" />
      </head>
      <body className="font-body antialiased">
        <AuthProvider>
          <UsersProvider>
            <PrivateRoute>
              <div className="flex min-h-screen w-full flex-col bg-background">
                <Header />
                <main className="flex-1">
                  {children}
                </main>
              </div>
              <Toaster />
            </PrivateRoute>
          </UsersProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
