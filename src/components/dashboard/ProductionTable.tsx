"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { Employee, ProductionLog } from "@/lib/types";
import { Badge } from "../ui/badge";

interface ProductionTableProps {
  productionLogs: ProductionLog[];
  employees: Employee[];
}

const ProductionTable = ({ productionLogs, employees }: ProductionTableProps) => {
  const employeeMap = new Map(employees.map((emp) => [emp.id, emp.name]));

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("ar-SA", {
      style: "currency",
      currency: "SAR",
      minimumFractionDigits: 0,
    }).format(value);
  };
  
  const sortedLogs = [...productionLogs].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-headline">سجل الإنتاج الأخير</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>الموظف</TableHead>
              <TableHead>التاريخ</TableHead>
              <TableHead>الكمية</TableHead>
              <TableHead>الحجم</TableHead>
              <TableHead>العملية</TableHead>
              <TableHead className="text-left">التكلفة</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedLogs.length > 0 ? (
              sortedLogs.map((log) => (
                <TableRow key={log.id}>
                  <TableCell className="font-medium">
                    {employeeMap.get(log.employeeId) || "موظف محذوف"}
                  </TableCell>
                  <TableCell>
                    {new Date(log.date).toLocaleDateString("ar-EG")}
                  </TableCell>
                  <TableCell>{log.count}</TableCell>
                  <TableCell>
                    <Badge variant={log.containerSize === 'large' ? 'default' : 'secondary'}>
                      {log.containerSize === "large" ? "كبير" : "صغير"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {log.processType === "blown" ? "نفخ" : "لف"}
                  </TableCell>
                  <TableCell className="text-left font-semibold text-primary">
                    {formatCurrency(log.cost)}
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={6} className="h-24 text-center">
                  لا توجد سجلات إنتاج حتى الآن.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};

export default ProductionTable;
