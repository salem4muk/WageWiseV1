
"use client";

import { User } from "@/contexts/UsersContext";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Edit, Trash2 } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Badge } from "../ui/badge";
import type { Permission, Role } from "@/contexts/AuthContext";
import { useAuth } from "@/hooks/use-auth";

interface UserListProps {
  users: User[];
  onEdit: (user: User) => void;
  onDelete: (userId: string) => void;
}

const permissionLabels: Record<Permission, string> = {
    create: 'إضافة',
    update: 'تعديل',
    delete: 'حذف',
    view_reports: 'عرض التقارير',
};

const roleLabels: Record<Role, string> = {
    admin: 'مدير',
    supervisor: 'مشرف',
    user: 'مستخدم'
};

export default function UserList({ users, onEdit, onDelete }: UserListProps) {
  const { user: currentUser } = useAuth();
  
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="text-center">الاسم</TableHead>
          <TableHead className="text-center">البريد الإلكتروني</TableHead>
          <TableHead className="text-center">الدور</TableHead>
          <TableHead className="text-center">الصلاحيات</TableHead>
          <TableHead className="text-center">إجراءات</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {users.length > 0 ? (
          users.map((user) => (
            <TableRow key={user.id}>
              <TableCell className="text-center font-medium">{user.name}</TableCell>
              <TableCell className="text-center">{user.email}</TableCell>
              <TableCell className="text-center">
                 <div className="flex gap-1 justify-center flex-wrap">
                    {user.roles?.sort().map(r => <Badge key={r} variant={r === 'admin' ? 'destructive' : 'default'}>{roleLabels[r]}</Badge>)}
                 </div>
              </TableCell>
              <TableCell className="text-center">
                <div className="flex gap-1 justify-center flex-wrap">
                    {user.roles?.includes('supervisor') ? (
                        <Badge variant="secondary">كل صلاحيات المشرف</Badge>
                    ) : user.roles?.includes('admin') ? (
                        <Badge variant="secondary">كافة الصلاحيات</Badge>
                    ) : (
                        user.permissions?.map(p => <Badge key={p} variant="secondary">{permissionLabels[p]}</Badge>)
                    )}
                </div>
              </TableCell>
              <TableCell className="text-center">
                <div className="flex gap-2 justify-center">
                  <Button variant="outline" size="icon" onClick={() => onEdit(user)} disabled={user.id === currentUser?.uid}>
                    <Edit className="h-4 w-4" />
                  </Button>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="destructive" size="icon" disabled={user.roles?.includes('admin') || user.id === currentUser?.uid}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>هل أنت متأكد؟</AlertDialogTitle>
                        <AlertDialogDescription>
                          لا يمكن التراجع عن هذا الإجراء. سيؤدي هذا إلى حذف المستخدم نهائيًا.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>إلغاء</AlertDialogCancel>
                        <AlertDialogAction onClick={() => onDelete(user.id!)}>
                          حذف
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </TableCell>
            </TableRow>
          ))
        ) : (
          <TableRow>
            <TableCell colSpan={5} className="h-24 text-center">
              لا يوجد مستخدمين. قم بإضافة مستخدم جديد.
            </TableCell>
          </TableRow>
        )}
      </TableBody>
    </Table>
  );
}
