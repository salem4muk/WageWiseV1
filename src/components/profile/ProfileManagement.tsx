
"use client";

import { useAuth } from '@/hooks/use-auth';
import { useUsers } from '@/contexts/UsersContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import ProfileForm from './ProfileForm';
import { useToast } from '@/hooks/use-toast';
import type { User } from '@/contexts/UsersContext';
import { User as AuthUser } from '@/contexts/AuthContext';

export default function ProfileManagement() {
  const { user: authUser, login, updateUser: updateAuthUser } = useAuth();
  const { users, updateUser: updateUsersContext } = useUsers();
  const { toast } = useToast();

  if (!authUser) {
    return null; // Should be redirected by PrivateRoute
  }

  const handleFormSubmit = (values: Partial<User>) => {
    // Check if email is already taken by another user
    const emailExists = users.some(
      (u) => u.email === values.email && u.email !== authUser.email
    );

    if (emailExists) {
      toast({
        variant: 'destructive',
        title: 'خطأ في التحديث',
        description: 'هذا البريد الإلكتروني مستخدم بالفعل من قبل مستخدم آخر.',
      });
      return;
    }

    const updatedUserFields = {
      ...authUser,
      ...values,
    };
    
    // We need to find the user in the general users list to get the ID
    const currentUserInList = users.find(u => u.email === authUser.email);
    if (!currentUserInList?.id) {
        toast({
            variant: "destructive",
            title: "خطأ",
            description: "لم يتم العثور على المستخدم في القائمة.",
        });
        return;
    }

    // Update user in the global users list
    updateUsersContext(currentUserInList.id, updatedUserFields);
    
    // Update user in the auth context
    updateAuthUser(updatedUserFields as AuthUser);

    toast({
      title: 'تم التحديث بنجاح',
      description: 'تم تحديث بيانات ملفك الشخصي.',
    });
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
          <ProfileForm onSubmit={handleFormSubmit} initialData={authUser} />
        </CardContent>
      </Card>
    </div>
  );
}
