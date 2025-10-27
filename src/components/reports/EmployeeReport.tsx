"use client";

import { useLocalStorage } from "@/hooks/use-local-storage";
import type { Employee, ProductionLog } from "@/lib/types";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useMemo } from "react";
import { FileText } from "lucide-react";

interface EmployeeReportData {
  employee: Employee;
  totalCost: number;
  productionCount: number;
}

export default function EmployeeReport() {
  const [employees] = useLocalStorage<Employee[]>("employees", []);
  const [productionLogs] = useLocalStorage<ProductionLog[]>("productionLogs", []);

  const employeeReportData: EmployeeReportData[] = useMemo(() => {
    const reportMap = new Map<string, { totalCost: number; productionCount: number }>();

    productionLogs.forEach((log) => {
      const entry = reportMap.get(log.employeeId) || { totalCost: 0, productionCount: 0 };
      entry.totalCost += log.cost;
      entry.productionCount += 1;
      reportMap.set(log.employeeId, entry);
    });

    return employees.map((employee) => ({
      employee,
      totalCost: reportMap.get(employee.id)?.totalCost || 0,
      productionCount: reportMap.get(employee.id)?.productionCount || 0,
    })).sort((a, b) => b.totalCost - a.totalCost);
  }, [employees, productionLogs]);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("ar-YE", {
      style: "currency",
      currency: "YER",
      minimumFractionDigits: 0,
    }).format(value);
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-3xl font-headline font-bold text-foreground">
          تقرير رواتب الموظفين
        </h1>
        <p className="text-muted-foreground">
          عرض تفصيلي لإجمالي مستحقات كل موظف بناءً على الإنتاج.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="font-headline flex items-center gap-2">
            <FileText />
            ملخص الرواتب
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>اسم الموظف</TableHead>
                <TableHead>القسم</TableHead>
                <TableHead>عدد عمليات الإنتاج</TableHead>
                <TableHead className="text-left">إجمالي الراتب</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {employeeReportData.length > 0 ? (
                employeeReportData.map((data) => (
                  <TableRow key={data.employee.id}>
                    <TableCell className="font-medium">{data.employee.name}</TableCell>
                    <TableCell>{data.employee.department}</TableCell>
                    <TableCell>{data.productionCount}</TableCell>
                    <TableCell className="text-left font-semibold text-primary">
                      {formatCurrency(data.totalCost)}
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={4} className="h-24 text-center">
                    لا توجد بيانات لعرضها. قم بإضافة موظفين وسجلات إنتاج أولاً.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
