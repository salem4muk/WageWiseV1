
"use client";

import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { useCollection, useFirestore } from "@/firebase";
import { collection, doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
} from '@/components/ui/dialog';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PlusCircle, Users as UsersIcon } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import UserForm from './UserForm';
import UserList from './UserList';
import { useRouter } from 'next/navigation';
import { Skeleton } from '../ui/skeleton';
import { User } from '@/contexts/UsersContext';

// IMPORTANT: This component does not handle the creation of the user in Firebase Auth.
// It only manages the user's document in the 'users' collection in Firestore.
// A full implementation would require a backend function (e.g., a Firebase Function)
// to create the Auth user and the Firestore document transactionally.

export default function UserManagement() {
  const { user, hasRole } = useAuth();
  const firestore = useFirestore();
  const { data: users, loading } = useCollection<User>('users');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | undefined>(undefined);
  const { toast } = useToast();
  const router = useRouter();

  const isUserAdmin = hasRole('admin');

  useEffect(() => {
    if (!loading && !isUserAdmin) {
      router.push('/');
    }
  }, [user, loading, isUserAdmin, router]);

  if (!isUserAdmin) {
    return (
        <div className="container mx-auto p-4 sm:p-6 md:p-8">
            <Skeleton className="h-10 w-64 mb-6" />
            <Card>
                <CardHeader>
                    <Skeleton className="h-8 w-48" />
                </CardHeader>
                <CardContent className="space-y-4">
                    <Skeleton className="h-10 w-full" />
                    <Skeleton className="h-10 w-full" />
                    <Skeleton className="h-10 w-full" />
                </CardContent>
            </Card>
        </div>
    );
  }

  const handleFormSubmit = async (values: Omit<User, 'id'> & { id?: string }) => {
    try {
      if (editingUser) {
        // Prevent self-demotion
        if (editingUser.id === user?.uid && !values.roles?.includes('admin')) {
             toast({
                variant: "destructive",
                title: "غير مسموح",
                description: "لا يمكنك إزالة دور المسؤول من حسابك.",
            });
            return;
        }
        // Update user in Firestore
        const userDocRef = doc(firestore, 'users', editingUser.id);
        await updateDoc(userDocRef, values as any);
        toast({
          title: "تم التعديل بنجاح",
          description: `تم تحديث بيانات المستخدم ${values.name}.`,
        });
      } else {
        // This is a placeholder for creating a user. 
        // In a real app, you would call a Firebase Function here to create the Auth user.
        // For now, we will show a warning and not create the user doc.
        // The user must be created in Firebase console manually for this to work.
         toast({
          variant: "destructive",
          title: "الإضافة اليدوية مطلوبة",
          description: "يرجى إنشاء هذا المستخدم في Firebase Authentication يدويًا أولاً. هذه الواجهة تدير بيانات Firestore فقط.",
        });
        console.error("User creation via client is not secure. Please use a server-side function.");

        // If you were to proceed (NOT RECOMMENDED):
        // const usersCollectionRef = collection(firestore, "users");
        // await addDoc(usersCollectionRef, values);
      }

      setIsDialogOpen(false);
      setEditingUser(undefined);
    } catch (error) {
      console.error("Error managing user:", error);
      toast({
        variant: "destructive",
        title: "حدث خطأ",
        description: "لم نتمكن من إدارة المستخدم. راجع الكونسول.",
      });
    }
  };
  
  const handleEdit = (user: User) => {
    setEditingUser(user);
    setIsDialogOpen(true);
  };

  const handleDelete = async (userId: string) => {
     // In a real app, you would call a Firebase Function here to delete the Auth user and the Firestore doc.
    try {
        if (userId === user?.uid) {
            toast({ variant: 'destructive', title: 'غير مسموح', description: 'لا يمكنك حذف حسابك الخاص.' });
            return;
        }
        const userDocRef = doc(firestore, "users", userId);
        await deleteDoc(userDocRef);
        toast({
            variant: "destructive",
            title: "تم الحذف",
            description: "تم حذف مستند المستخدم من Firestore. (المستخدم في Auth لم يتم حذفه)",
        });
    } catch(e) {
        toast({
            variant: "destructive",
            title: "خطأ",
            description: "لم نتمكن من حذف مستند المستخدم.",
        });
    }
  };

  const openDialogForNew = () => {
    setEditingUser(undefined);
    setIsDialogOpen(true);
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-headline font-bold text-foreground">
          إدارة المستخدمين
        </h1>
        <Dialog open={isDialogOpen} onOpenChange={(isOpen) => {
          setIsDialogOpen(isOpen);
          if (!isOpen) {
            setEditingUser(undefined);
          }
        }}>
          <DialogTrigger asChild>
            <Button onClick={openDialogForNew} className="bg-accent text-accent-foreground hover:bg-accent/90">
              <PlusCircle className="ms-2 h-4 w-4" />
              <span>إضافة مستخدم جديد</span>
            </Button>
          </DialogTrigger>
          <DialogContent className="max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="font-headline">
                {editingUser ? "تعديل بيانات مستخدم" : "إضافة مستخدم جديد"}
              </DialogTitle>
              <DialogDescription>
                {editingUser ? "قم بتحديث تفاصيل المستخدم." : "لإضافة مستخدم، يجب أولاً إنشاؤه في Firebase Authentication ثم إضافة بياناته هنا."}
              </DialogDescription>
            </DialogHeader>
            <div className="py-4">
              <UserForm
                onSubmit={handleFormSubmit}
                initialData={editingUser}
              />
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="font-headline flex items-center gap-2">
            <UsersIcon />
            قائمة المستخدمين
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
             <div className="space-y-4">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </div>
          ) : (
            <UserList 
              users={users || []} 
              onEdit={handleEdit} 
              onDelete={handleDelete} 
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
