
"use client";

import { useLocalStorage } from "@/hooks/use-local-storage";
import type { Employee, ProductionLog, SalaryPayment } from "@/lib/types";
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
import { useMemo, useEffect } from "react";
import { FileText, Download } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { useRouter } from "next/navigation";
import { Button } from "../ui/button";
import { downloadAsTextFile } from "@/lib/utils";

interface EmployeeReportData {
  employee: Employee;
  totalProductionCost: number;
  totalPayments: number;
  netSalary: number;
  productionCount: number;
}

export default function EmployeeReport() {
  const { hasPermission } = useAuth();
  const router = useRouter();

  const [employees] = useLocalStorage<Employee[]>("employees", []);
  const [productionLogs] = useLocalStorage<ProductionLog[]>("productionLogs", []);
  const [salaryPayments] = useLocalStorage<SalaryPayment[]>("salaryPayments", []);

  useEffect(() => {
    if (!hasPermission('view_reports')) {
      router.push('/');
    }
  }, [hasPermission, router]);

  const employeeReportData: EmployeeReportData[] = useMemo(() => {
    const reportMap = new Map<string, { totalProductionCost: number; productionCount: number }>();
    const paymentsMap = new Map<string, number>();

    productionLogs.forEach((log) => {
      const entry = reportMap.get(log.employeeId) || { totalProductionCost: 0, productionCount: 0 };
      entry.totalProductionCost += log.cost;
      entry.productionCount += 1;
      reportMap.set(log.employeeId, entry);
    });

    salaryPayments.forEach((payment) => {
      const currentAmount = paymentsMap.get(payment.employeeId) || 0;
      paymentsMap.set(payment.employeeId, currentAmount + payment.amount);
    });

    return employees.map((employee) => {
      const productionData = reportMap.get(employee.id) || { totalProductionCost: 0, productionCount: 0 };
      const totalPayments = paymentsMap.get(employee.id) || 0;
      const netSalary = productionData.totalProductionCost - totalPayments;
      
      return {
        employee,
        totalProductionCost: productionData.totalProductionCost,
        totalPayments,
        netSalary,
        productionCount: productionData.productionCount,
      }
    }).sort((a, b) => b.netSalary - a.netSalary);
  }, [employees, productionLogs, salaryPayments]);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("ar-YE", {
      style: "currency",
      currency: "YER",
      minimumFractionDigits: 0,
    }).format(value);
  };

  const handleExport = () => {
    let content = `تقرير رواتب الموظفين\n`;
    content += `تاريخ التصدير: ${new Date().toLocaleDateString("ar-EG")}\n`;
    content += "========================================================\n\n";

    employeeReportData.forEach(data => {
      content += `اسم الموظف: ${data.employee.name}\n`;
      content += `إجمالي الإنتاج: ${formatCurrency(data.totalProductionCost)}\n`;
      content += `إجمالي المصروف: ${formatCurrency(data.totalPayments)}\n`;
      content += `صافي الراتب: ${formatCurrency(data.netSalary)}\n`;
      content += "--------------------------------------------------------\n";
    });

    content += `\nالمجموع الإجمالي للرواتب الصافية: ${formatCurrency(totalNetSalaries)}\n`;

    downloadAsTextFile(content, "report-salaries-summary.txt");
  };
  
  const totalNetSalaries = employeeReportData.reduce((sum, data) => sum + data.netSalary, 0);

  if (!hasPermission('view_reports')) {
    return null; // or a loading/access denied component
  }

  return (
    <div>
      <div className="flex justify-between items-start mb-6">
        <div>
            <h1 className="text-3xl font-headline font-bold text-foreground">
            تقرير رواتب الموظفين
            </h1>
            <p className="text-muted-foreground">
            عرض تفصيلي لإجمالي مستحقات كل موظف بناءً على الإنتاج والخصومات.
            </p>
        </div>
        <Button onClick={handleExport} disabled={employeeReportData.length === 0}>
            <Download className="ms-2 h-4 w-4" />
            تصدير إلى TXT
        </Button>
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
                <TableHead className="text-center">اسم الموظف</TableHead>
                <TableHead className="text-center">إجمالي الإنتاج</TableHead>
                <TableHead className="text-center">إجمالي المصروف</TableHead>
                <TableHead className="text-center">صافي الراتب</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {employeeReportData.length > 0 ? (
                employeeReportData.map((data) => (
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
                    لا توجد بيانات لعرضها. قم بإضافة موظفين وسجلات إنتاج أولاً.
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
    </div>
  );
}
