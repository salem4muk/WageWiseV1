"use client";

import { useState } from "react";
import { useLocalStorage } from "@/hooks/use-local-storage";
import type { Employee, SalaryPayment } from "@/lib/types";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { PlusCircle, Receipt } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import PaymentForm from "./PaymentForm";
import PaymentsList from "./PaymentsList";

export default function PaymentsManagement() {
  const [employees] = useLocalStorage<Employee[]>("employees", []);
  const [payments, setPayments] = useLocalStorage<SalaryPayment[]>("salaryPayments", []);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingPayment, setEditingPayment] = useState<SalaryPayment | undefined>(undefined);
  const { toast } = useToast();

  const handleFormSubmit = (values: any) => {
    const date = values.date.toISOString();

    if (editingPayment) {
      // Update existing payment
      const updatedPayments = payments.map((p) =>
        p.id === editingPayment.id ? { ...p, ...values, date } : p
      );
      setPayments(updatedPayments);
      toast({
        title: "تم التعديل بنجاح",
        description: "تم تحديث سند الصرف.",
      });
    } else {
      // Add new payment
      const newPayment: SalaryPayment = {
        id: crypto.randomUUID(),
        ...values,
        date,
      };
      setPayments((prev) => [...prev, newPayment]);
      toast({
        title: "تم الحفظ بنجاح",
        description: "تم تسجيل سند الصرف الجديد.",
      });
    }
    setIsDialogOpen(false);
    setEditingPayment(undefined);
  };

  const handleEdit = (payment: SalaryPayment) => {
    setEditingPayment(payment);
    setIsDialogOpen(true);
  };

  const handleDelete = (paymentId: string) => {
    setPayments((prev) => prev.filter((p) => p.id !== paymentId));
    toast({
      variant: "destructive",
      title: "تم الحذف",
      description: "تم حذف سند الصرف.",
    });
  };

  const openDialogForNew = () => {
    setEditingPayment(undefined);
    setIsDialogOpen(true);
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-headline font-bold text-foreground">
          إدارة سندات الصرف
        </h1>
        <Dialog open={isDialogOpen} onOpenChange={(isOpen) => {
          setIsDialogOpen(isOpen);
          if (!isOpen) {
            setEditingPayment(undefined);
          }
        }}>
          <DialogTrigger asChild>
            <Button onClick={openDialogForNew} className="bg-accent text-accent-foreground hover:bg-accent/90">
              <PlusCircle className="ms-2 h-4 w-4" />
              <span>إضافة سند جديد</span>
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="font-headline">
                {editingPayment ? "تعديل سند صرف" : "إضافة سند صرف جديد"}
              </DialogTitle>
              <DialogDescription>
                 {editingPayment ? "قم بتحديث تفاصيل سند الصرف." : "أدخل تفاصيل السند الجديد لحفظه."}
              </DialogDescription>
            </DialogHeader>
            <div className="py-4">
              <PaymentForm
                employees={employees}
                onSubmit={handleFormSubmit}
                initialData={editingPayment}
              />
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="font-headline flex items-center gap-2">
            <Receipt />
            قائمة سندات الصرف
          </CardTitle>
        </CardHeader>
        <CardContent>
          <PaymentsList
            payments={payments}
            employees={employees}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        </CardContent>
      </Card>
    </div>
  );
}
