
"use client";

import { useState } from 'react';
import { useUsers, User } from '@/contexts/UsersContext';
import { useAuth } from '@/hooks/use-auth';
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
import { useEffect } from 'react';

export default function UserManagement() {
  const { user } = useAuth();
  const { users, setUsers } = useUsers();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { toast } = useToast();
  const router = useRouter();

  useEffect(() => {
    if (!user?.roles?.includes('admin')) {
      router.push('/');
    }
  }, [user, router]);

  if (!user?.roles?.includes('admin')) {
    return null; // or a loading/access denied component
  }

  const handleFormSubmit = (values: any) => {
    // Check for duplicate email
    if (users.some(u => u.email === values.email)) {
      toast({
        variant: "destructive",
        title: "خطأ في الإضافة",
        description: "هذا البريد الإلكتروني مستخدم بالفعل.",
      });
      return;
    }

    const newUser: User = {
      id: crypto.randomUUID(),
      ...values,
    };
    setUsers((prev) => [...prev, newUser]);
    toast({
      title: "تم بنجاح",
      description: `تمت إضافة المستخدم ${values.name} بنجاح.`,
    });
    setIsDialogOpen(false);
  };

  const handleDelete = (userId: string) => {
    setUsers((prev) => prev.filter((u) => u.id !== userId));
    toast({
      variant: "destructive",
      title: "تم الحذف",
      description: "تم حذف المستخدم.",
    });
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-headline font-bold text-foreground">
          إدارة المستخدمين
        </h1>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-accent text-accent-foreground hover:bg-accent/90">
              <PlusCircle className="ms-2 h-4 w-4" />
              <span>إضافة مستخدم جديد</span>
            </Button>
          </DialogTrigger>
          <DialogContent className="max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="font-headline">
                إضافة مستخدم جديد
              </DialogTitle>
              <DialogDescription>
                أدخل تفاصيل المستخدم الجديد ودوره وصلاحياته.
              </DialogDescription>
            </DialogHeader>
            <div className="py-4">
              <UserForm onSubmit={handleFormSubmit} />
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
          <UserList users={users} onDelete={handleDelete} />
        </CardContent>
      </Card>
    </div>
  );
}
