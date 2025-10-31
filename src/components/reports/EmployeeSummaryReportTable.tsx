
"use client";

import type { Employee } from "@/lib/types";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  TableFooter,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText } from "lucide-react";

interface EmployeeReportData {
  employee: Employee;
  totalProductionCost: number;
  totalPayments: number;
  netSalary: number;
}

interface EmployeeSummaryReportTableProps {
    reportData: EmployeeReportData[];
}

export default function EmployeeSummaryReportTable({ reportData }: EmployeeSummaryReportTableProps) {
  
  const sortedData = [...reportData].sort((a, b) => b.netSalary - a.netSalary);

  const formatCurrency = (value: number) => {
    const formattedValue = new Intl.NumberFormat("ar-YE", {
      minimumFractionDigits: 0,
    }).format(value);
    return `${formattedValue} ريال`;
  };
  
  const totalNetSalaries = sortedData.reduce((sum, data) => sum + data.netSalary, 0);

  return (
    <Card>
        <CardHeader>
          <CardTitle className="font-headline flex items-center gap-2">
            <FileText />
            تقرير ملخص رواتب الموظفين
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-center">اسم الموظف</TableHead>
                <TableHead className="text-center">إجمالي الإنتاج</TableHead>
                <TableHead className="text-center">إجمالي المصروف</TableHead>
                <TableHead className="text-center">صافي الراتب</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedData.length > 0 ? (
                sortedData.map((data) => (
                  <TableRow key={data.employee.id}>
                    <TableCell className="text-center font-medium">{data.employee.name}</TableCell>
                    <TableCell className="text-center">{formatCurrency(data.totalProductionCost)}</TableCell>
                    <TableCell className="text-center text-destructive">{formatCurrency(data.totalPayments)}</TableCell>
                    <TableCell className="text-center font-semibold text-primary">
                      {formatCurrency(data.netSalary)}
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={4} className="h-24 text-center">
                    لا توجد بيانات لعرضها في هذا النطاق الزمني.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
            <TableFooter>
                <TableRow>
                    <TableCell colSpan={3} className="text-center font-bold text-lg">المجموع الإجمالي للرواتب الصافية</TableCell>
                    <TableCell className="text-center font-bold text-lg text-primary">{formatCurrency(totalNetSalaries)}</TableCell>
                </TableRow>
            </TableFooter>
          </Table>
        </CardContent>
      </Card>
  );
}
