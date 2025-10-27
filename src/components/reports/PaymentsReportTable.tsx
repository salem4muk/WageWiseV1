"use client";

import type { Employee, SalaryPayment } from "@/lib/types";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  TableFooter
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Receipt } from "lucide-react";


interface PaymentsReportTableProps {
  payments: SalaryPayment[];
  employees: Employee[];
}

export default function PaymentsReportTable({ payments, employees }: PaymentsReportTableProps) {
  const employeeMap = new Map(employees.map((emp) => [emp.id, emp.name]));

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("ar-YE", {
      style: "currency",
      currency: "YER",
      minimumFractionDigits: 0,
    }).format(value);
  };
  
  const sortedPayments = [...payments].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  const totalAmount = sortedPayments.reduce((acc, payment) => acc + payment.amount, 0);

  return (
     <Card>
      <CardHeader>
        <CardTitle className="font-headline flex items-center gap-2">
            <Receipt />
            تقرير سندات الصرف
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>الموظف</TableHead>
              <TableHead>التاريخ</TableHead>
              <TableHead>المبلغ</TableHead>
              <TableHead>ملاحظات</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedPayments.length > 0 ? (
              sortedPayments.map((payment) => (
                <TableRow key={payment.id}>
                  <TableCell className="font-medium">
                    {employeeMap.get(payment.employeeId) || "موظف محذوف"}
                  </TableCell>
                  <TableCell>
                    {new Date(payment.date).toLocaleDateString("ar-EG")}
                  </TableCell>
                  <TableCell className="font-semibold text-destructive">
                    {formatCurrency(payment.amount)}
                  </TableCell>
                  <TableCell>{payment.notes}</TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={4} className="h-24 text-center">
                  لا توجد سندات صرف في هذا النطاق الزمني.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
          <TableFooter>
                <TableRow>
                    <TableCell colSpan={2} className="font-bold text-lg">المجموع الإجمالي</TableCell>
                    <TableCell className="font-bold text-lg text-destructive">{formatCurrency(totalAmount)}</TableCell>
                    <TableCell></TableCell>
                </TableRow>
            </TableFooter>
        </Table>
       </CardContent>
    </Card>
  );
}
