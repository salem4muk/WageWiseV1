
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
import { Trash2 } from "lucide-react";
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
import type { Permission } from "@/contexts/AuthContext";

interface UserListProps {
  users: User[];
  onDelete: (userId: string) => void;
}

const permissionLabels: Record<Permission, string> = {
    create: 'إضافة',
    update: 'تعديل',
    delete: 'حذف',
};

export default function UserList({ users, onDelete }: UserListProps) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="text-center">الاسم</TableHead>
          <TableHead className="text-center">البريد الإلكتروني</TableHead>
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
                <div className="flex gap-1 justify-center">
                    {user.permissions?.map(p => <Badge key={p} variant="secondary">{permissionLabels[p]}</Badge>)}
                </div>
              </TableCell>
              <TableCell className="text-center">
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="destructive" size="icon">
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
              </TableCell>
            </TableRow>
          ))
        ) : (
          <TableRow>
            <TableCell colSpan={4} className="h-24 text-center">
              لا يوجد مستخدمين. قم بإضافة مستخدم جديد.
            </TableCell>
          </TableRow>
        )}
      </TableBody>
    </Table>
  );
}
