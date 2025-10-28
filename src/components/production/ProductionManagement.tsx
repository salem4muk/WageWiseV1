
"use client";

import { useState, useEffect } from "react";
import { useLocalStorage } from "@/hooks/use-local-storage";
import type { Employee, ProductionLog } from "@/lib/types";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
} from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { PlusCircle, Package } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import ProductionForm from "./ProductionForm";
import ProductionList from "./ProductionList";
import { useAuth } from "@/hooks/use-auth";
import { useRouter } from "next/navigation";

export default function ProductionManagement() {
  const [employees] = useLocalStorage<Employee[]>("employees", []);
  const [productionLogs, setProductionLogs] = useLocalStorage<ProductionLog[]>("productionLogs", []);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingLog, setEditingLog] = useState<ProductionLog | undefined>(undefined);
  const { toast } = useToast();
  const { hasPermission, hasRole } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (hasRole('supervisor')) {
      router.push('/');
    }
  }, [hasRole, router]);

  const canCreate = hasPermission('create');
  const canUpdate = hasPermission('update');
  const canDelete = hasPermission('delete');

  const calculateCost = (values: any): number => {
    const { count, containerSize, processType } = values;
    if (processType === "blown") {
      return containerSize === "large" ? count * 3 : count * 1;
    }
    if (processType === "rolled") {
      return containerSize === "large" ? count * 2 : count * 1;
    }
    return 0;
  };

  const handleFormSubmit = (values: any) => {
    const date = values.date.toISOString();

    if (editingLog) {
      if (!canUpdate) return;
      const updatedLogs = productionLogs.map((log) =>
        log.id === editingLog.id ? { ...log, ...values, date, cost: calculateCost(values) } : log
      );
      setProductionLogs(updatedLogs);
      toast({
        title: "تم التعديل بنجاح",
        description: "تم تحديث سجل الإنتاج.",
      });
    } else {
      if (!canCreate) return;
      const newLog: ProductionLog = {
        id: crypto.randomUUID(),
        ...values,
        date,
        cost: calculateCost(values),
      };
      setProductionLogs((prev) => [...prev, newLog]);
      toast({
        title: "تم الحفظ بنجاح",
        description: "تم تسجيل عملية الإنتاج الجديدة.",
      });
    }
    setIsDialogOpen(false);
    setEditingLog(undefined);
  };

  const handleEdit = (log: ProductionLog) => {
    if (!canUpdate) return;
    setEditingLog(log);
    setIsDialogOpen(true);
  };

  const handleDelete = (logId: string) => {
    if (!canDelete) return;
    setProductionLogs((prev) => prev.filter((p) => p.id !== logId));
    toast({
      variant: "destructive",
      title: "تم الحذف",
      description: "تم حذف سجل الإنتاج.",
    });
  };

  const openDialogForNew = () => {
    if (!canCreate) return;
    setEditingLog(undefined);
    setIsDialogOpen(true);
  }

  if (hasRole('supervisor')) {
    return null;
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-headline font-bold text-foreground">
          إدارة الإنتاج
        </h1>
        {canCreate && (
          <Dialog open={isDialogOpen} onOpenChange={(isOpen) => {
            setIsDialogOpen(isOpen);
            if (!isOpen) {
              setEditingLog(undefined);
            }
          }}>
            <DialogTrigger asChild>
              <Button onClick={openDialogForNew} className="bg-accent text-accent-foreground hover:bg-accent/90">
                <PlusCircle className="ms-2 h-4 w-4" />
                <span>إضافة إنتاج جديد</span>
              </Button>
            </DialogTrigger>
            <DialogContent className="max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="font-headline">
                  {editingLog ? "تعديل سجل إنتاج" : "إضافة إنتاج جديد"}
                </DialogTitle>
                <DialogDescription>
                   {editingLog ? "قم بتحديث تفاصيل سجل الإنتاج." : "أدخل تفاصيل الإنتاج الجديد لحفظه."}
                </DialogDescription>
              </DialogHeader>
              <div className="py-4">
                <ProductionForm
                  employees={employees}
                  onSubmit={handleFormSubmit}
                  initialData={editingLog}
                />
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="font-headline flex items-center gap-2">
            <Package />
            قائمة سجلات الإنتاج
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ProductionList
            productionLogs={productionLogs}
            employees={employees}
            onEdit={handleEdit}
            onDelete={handleDelete}
            canUpdate={canUpdate}
            canDelete={canDelete}
          />
        </CardContent>
      </Card>
    </div>
  );
}
