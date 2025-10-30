
"use client";

import { useState } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { useAuth as useFirebaseAuth, useFirestore } from '@/firebase';
import { updateEmail, updatePassword, reauthenticateWithCredential, EmailAuthProvider } from 'firebase/auth';
import { doc, updateDoc, getDoc } from 'firebase/firestore';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import ProfileForm, { ProfileFormValues } from './ProfileForm';
import { useToast } from '@/hooks/use-toast';

export default function ProfileManagement() {
  const { user: authUser } = useAuth();
  const firebaseAuth = useFirebaseAuth();
  const firestore = useFirestore();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  if (!authUser) {
    return null; // Should be redirected by PrivateRoute
  }

  const handleFormSubmit = async (values: ProfileFormValues) => {
    setLoading(true);
    const currentUser = firebaseAuth.currentUser;
    if (!currentUser) {
        toast({ variant: "destructive", title: "خطأ", description: "يجب عليك تسجيل الدخول مرة أخرى." });
        setLoading(false);
        return;
    }

    try {
        // 1. Update Name in Firestore
        if (values.name && values.name !== authUser.name) {
            const userDocRef = doc(firestore, 'users', currentUser.uid);
            await updateDoc(userDocRef, { name: values.name });
        }

        // 2. Update Email in Firebase Auth
        if (values.email && values.email !== authUser.email) {
            // Reauthentication might be required for security-sensitive operations
            // This is a simplified example. A real app would prompt for current password.
            await updateEmail(currentUser, values.email);
            // Also update it in Firestore if you store it there
            const userDocRef = doc(firestore, 'users', currentUser.uid);
             await updateDoc(userDocRef, { email: values.email });
        }

        // 3. Update Password in Firebase Auth
        if (values.password) {
            await updatePassword(currentUser, values.password);
        }

        toast({
            title: 'تم التحديث بنجاح',
            description: 'تم تحديث بيانات ملفك الشخصي. قد تحتاج إلى تسجيل الدخول مرة أخرى.',
        });

    } catch (error: any) {
        console.error("Profile Update Error:", error);
        toast({
            variant: 'destructive',
            title: 'خطأ في التحديث',
            description: error.message || 'حدث خطأ غير متوقع. قد تحتاج إلى تسجيل الدخول مرة أخرى لتنفيذ بعض الإجراءات.',
        });
    } finally {
        setLoading(false);
    }
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-3xl font-headline font-bold text-foreground">
          الملف الشخصي
        </h1>
        <p className="text-muted-foreground">
          قم بتعديل معلومات حسابك الشخصي.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="font-headline">تعديل البيانات</CardTitle>
          <CardDescription>
            يمكنك تحديث اسمك وبريدك الإلكتروني وكلمة المرور الخاصة بك هنا.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ProfileForm onSubmit={handleFormSubmit} initialData={authUser} loading={loading} />
        </CardContent>
      </Card>
    </div>
  );
}
