
'use client';
import { useMemo } from 'react';
import { initializeApp, getApps, FirebaseApp } from 'firebase/app';
import { getAuth, Auth } from 'firebase/auth';
import { getFirestore, Firestore } from 'firebase/firestore';

import { firebaseConfig } from './config';
import { FirebaseProvider, useFirebase, useFirebaseApp, useFirestore, useAuth } from './provider';
import { useCollection } from './firestore/use-collection';
import { useDoc } from './firestore/use-doc';
import { useUser } from './auth/use-user';
import FirebaseClientProvider from './client-provider';

// Memoize Firebase initialization for performance
const useMemoFirebase = () => {
    const firebaseApp = useMemo<FirebaseApp>(() => {
        const apps = getApps();
        if (apps.length > 0) {
            return apps[0];
        }
        return initializeApp(firebaseConfig);
    }, []);

    const firestore = useMemo<Firestore>(() => getFirestore(firebaseApp), [firebaseApp]);
    const auth = useMemo<Auth>(() => getAuth(firebaseApp), [firebaseApp]);

    return { firebaseApp, firestore, auth };
};

export {
    useMemoFirebase,
    FirebaseProvider,
    FirebaseClientProvider,
    useCollection,
    useDoc,
    useUser,
    useFirebase,
    useFirebaseApp,
    useFirestore,
    useAuth,
};
