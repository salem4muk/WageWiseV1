
'use client';

import { ReactNode } from 'react';
import { useMemoFirebase, FirebaseProvider } from '.';

export default function FirebaseClientProvider({ children }: { children: ReactNode }) {
  const { firebaseApp, firestore, auth } = useMemoFirebase();
  return (
    <FirebaseProvider firebaseApp={firebaseApp} firestore={firestore} auth={auth}>
      {children}
    </FirebaseProvider>
  );
}
