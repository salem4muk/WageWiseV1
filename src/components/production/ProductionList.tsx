
"use client";

import type { Employee, ProductionLog } from "@/lib/types";
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

interface ProductionListProps {
  productionLogs: ProductionLog[];
  employees: Employee[];
  onEdit: (log: ProductionLog) => void;
  onDelete: (logId: string) => void;
  canUpdate: boolean;
  canDelete: boolean;
}

export default function ProductionList({ productionLogs, employees, onEdit, onDelete, canUpdate, canDelete }: ProductionListProps) {
  const employeeMap = new Map(employees.map((emp) => [emp.id, emp.name]));

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("ar-YE", {
      style: "currency",
      currency: "YER",
      minimumFractionDigits: 0,
    }).format(value);
  };

  const sortedLogs = [...productionLogs].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="text-center">الموظف</TableHead>
          <TableHead className="text-center">التاريخ</TableHead>
          <TableHead className="text-center">الكمية</TableHead>
          <TableHead className="text-center">الحجم</TableHead>
          <TableHead className="text-center">العملية</TableHead>
          <TableHead className="text-center">التكلفة</TableHead>
          <TableHead className="text-center">إجراءات</TableHead>
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
              <TableCell className="text-center">
                <div className="flex gap-2 justify-center">
                  {canUpdate && (
                    <Button variant="outline" size="icon" onClick={() => onEdit(log)}>
                      <Edit className="h-4 w-4" />
                    </Button>
                  )}
                  {canDelete && (
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
                            لا يمكن التراجع عن هذا الإجراء. سيؤدي هذا إلى حذف سجل الإنتاج نهائيًا.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>إلغاء</AlertDialogCancel>
                          <AlertDialogAction onClick={() => onDelete(log.id)}>
                            حذف
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  )}
                </div>
              </TableCell>
            </TableRow>
          ))
        ) : (
          <TableRow>
            <TableCell colSpan={7} className="h-24 text-center">
              لا توجد سجلات إنتاج حتى الآن.
            </TableCell>
          </TableRow>
        )}
      </TableBody>
    </Table>
  );
}
