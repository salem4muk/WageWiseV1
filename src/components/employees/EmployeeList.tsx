"use client";

import type { Employee } from "@/lib/types";
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

interface EmployeeListProps {
  employees: Employee[];
  onEdit: (employee: Employee) => void;
  onDelete: (employeeId: string) => void;
}

export default function EmployeeList({ employees, onEdit, onDelete }: EmployeeListProps) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="text-center">الاسم</TableHead>
          <TableHead className="text-center">معرف الموظف</TableHead>
          <TableHead className="text-center">القسم</TableHead>
          <TableHead className="text-center">إجراءات</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {employees.length > 0 ? (
          employees.map((employee) => (
            <TableRow key={employee.id}>
              <TableCell className="text-center font-medium">{employee.name}</TableCell>
              <TableCell className="text-center">{employee.employeeId}</TableCell>
              <TableCell className="text-center">{employee.department}</TableCell>
              <TableCell className="text-center">
                <div className="flex gap-2 justify-center">
                  <Button variant="outline" size="icon" onClick={() => onEdit(employee)}>
                    <Edit className="h-4 w-4" />
                  </Button>
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
                          لا يمكن التراجع عن هذا الإجراء. سيؤدي هذا إلى حذف الموظف نهائيًا.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>إلغاء</AlertDialogCancel>
                        <AlertDialogAction onClick={() => onDelete(employee.id)}>
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
            <TableCell colSpan={4} className="h-24 text-center">
              لا يوجد موظفين. قم بإضافة موظف جديد.
            </TableCell>
          </TableRow>
        )}
      </TableBody>
    </Table>
  );
}
