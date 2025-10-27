"use client";

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
import type { Employee, ProductionLog } from "@/lib/types";
import { Badge } from "../ui/badge";
import { Package } from "lucide-react";

interface ProductionReportTableProps {
  productionLogs: ProductionLog[];
  employees: Employee[];
}

const ProductionReportTable = ({ productionLogs, employees }: ProductionReportTableProps) => {
  const employeeMap = new Map(employees.map((emp) => [emp.id, emp.name]));

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("ar-YE", {
      style: "currency",
      currency: "YER",
      minimumFractionDigits: 0,
    }).format(value);
  };
  
  const sortedLogs = [...productionLogs].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  const totalCost = sortedLogs.reduce((acc, log) => acc + log.cost, 0);


  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-headline flex items-center gap-2">
            <Package />
            تقرير الإنتاج
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="text-center">الموظف</TableHead>
              <TableHead className="text-center">التاريخ</TableHead>
              <TableHead className="text-center">الكمية</TableHead>
              <TableHead className="text-center">الحجم</TableHead>
              <TableHead className="text-center">العملية</TableHead>
              <TableHead className="text-center">التكلفة</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedLogs.length > 0 ? (
              sortedLogs.map((log) => (
                <TableRow key={log.id}>
                  <TableCell className="text-center font-medium">
                    {employeeMap.get(log.employeeId) || "موظف محذوف"}
                  </TableCell>
                  <TableCell className="text-center">
                    {new Date(log.date).toLocaleDateString("ar-EG")}
                  </TableCell>
                  <TableCell className="text-center">{log.count}</TableCell>
                  <TableCell className="text-center">
                    <Badge variant={log.containerSize === 'large' ? 'default' : 'secondary'}>
                      {log.containerSize === "large" ? "كبير" : "صغير"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-center">
                    {log.processType === "blown" ? "نفخ" : "لف"}
                  </TableCell>
                  <TableCell className="text-center font-semibold text-primary">
                    {formatCurrency(log.cost)}
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={6} className="h-24 text-center">
                  لا توجد سجلات إنتاج في هذا النطاق الزمني.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
           <TableFooter>
                <TableRow>
                    <TableCell colSpan={5} className="text-center font-bold text-lg">المجموع الإجمالي</TableCell>
                    <TableCell className="text-center font-bold text-lg text-primary">{formatCurrency(totalCost)}</TableCell>
                </TableRow>
            </TableFooter>
        </Table>
      </CardContent>
    </Card>
  );
};

export default ProductionReportTable;
