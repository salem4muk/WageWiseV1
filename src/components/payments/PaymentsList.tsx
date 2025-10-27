"use client";

import type { Employee, SalaryPayment } from "@/lib/types";
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
} from "@/components/ui/alert-dialog"

interface PaymentsListProps {
  payments: SalaryPayment[];
  employees: Employee[];
  onEdit: (payment: SalaryPayment) => void;
  onDelete: (paymentId: string) => void;
}

export default function PaymentsList({ payments, employees, onEdit, onDelete }: PaymentsListProps) {
  const employeeMap = new Map(employees.map((emp) => [emp.id, emp.name]));

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("ar-YE", {
      style: "currency",
      currency: "YER",
      minimumFractionDigits: 0,
    }).format(value);
  };
  
  const sortedPayments = [...payments].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="text-center">الموظف</TableHead>
          <TableHead className="text-center">التاريخ</TableHead>
          <TableHead className="text-center">المبلغ</TableHead>
          <TableHead className="text-center">ملاحظات</TableHead>
          <TableHead className="text-center">إجراءات</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {sortedPayments.length > 0 ? (
          sortedPayments.map((payment) => (
            <TableRow key={payment.id}>
              <TableCell className="text-center font-medium">
                {employeeMap.get(payment.employeeId) || "موظف محذوف"}
              </TableCell>
              <TableCell className="text-center">
                {new Date(payment.date).toLocaleDateString("ar-EG")}
              </TableCell>
              <TableCell className="text-center font-semibold text-destructive">
                {formatCurrency(payment.amount)}
              </TableCell>
              <TableCell className="text-center">{payment.notes}</TableCell>
              <TableCell className="text-center">
                <div className="flex gap-2 justify-center">
                  <Button variant="outline" size="icon" onClick={() => onEdit(payment)}>
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
                          لا يمكن التراجع عن هذا الإجراء. سيؤدي هذا إلى حذف سند الصرف نهائيًا.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>إلغاء</AlertDialogCancel>
                        <AlertDialogAction onClick={() => onDelete(payment.id)}>
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
              لا توجد سندات صرف حتى الآن.
            </TableCell>
          </TableRow>
        )}
      </TableBody>
    </Table>
  );
}
