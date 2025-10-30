
"use client";

import { useState } from "react";
import { useCollection, useFirestore } from "@/firebase";
import { collection, addDoc, updateDoc, deleteDoc, doc } from "firebase/firestore";
import type { Employee, SalaryPayment } from "@/lib/types";
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
import { PlusCircle, Receipt } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import PaymentForm from "./PaymentForm";
import PaymentsList from "./PaymentsList";
import { useAuth } from "@/hooks/use-auth";
import { Skeleton } from "../ui/skeleton";

export default function PaymentsManagement() {
  const firestore = useFirestore();
  const { data: employees, loading: employeesLoading } = useCollection<Employee>("employees");
  const { data: payments, loading: paymentsLoading } = useCollection<SalaryPayment>("salaryPayments");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingPayment, setEditingPayment] = useState<SalaryPayment | undefined>(undefined);
  const { toast } = useToast();
  const { hasPermission } = useAuth();

  const canCreate = hasPermission('create');
  const canUpdate = hasPermission('update');
  const canDelete = hasPermission('delete');
  const isLoading = employeesLoading || paymentsLoading;

  const handleFormSubmit = async (values: any) => {
    const paymentData = {
        ...values,
        date: values.date.toISOString(),
    };

    try {
        if (editingPayment) {
        if (!canUpdate) return;
        const paymentDocRef = doc(firestore, "salaryPayments", editingPayment.id);
        await updateDoc(paymentDocRef, paymentData);
        toast({
            title: "تم التعديل بنجاح",
            description: "تم تحديث سند الصرف.",
        });
        } else {
        if (!canCreate) return;
        const paymentsCollectionRef = collection(firestore, "salaryPayments");
        await addDoc(paymentsCollectionRef, paymentData);
        toast({
            title: "تم الحفظ بنجاح",
            description: "تم تسجيل سند الصرف الجديد.",
        });
        }
        setIsDialogOpen(false);
        setEditingPayment(undefined);
    } catch (error) {
        console.error("Error saving payment:", error);
        toast({
            variant: "destructive",
            title: "حدث خطأ",
            description: "لم نتمكن من حفظ سند الصرف.",
        });
    }
  };

  const handleEdit = (payment: SalaryPayment) => {
    if (!canUpdate) return;
    setEditingPayment(payment);
    setIsDialogOpen(true);
  };

  const handleDelete = async (paymentId: string) => {
    if (!canDelete) return;
    try {
        const paymentDocRef = doc(firestore, "salaryPayments", paymentId);
        await deleteDoc(paymentDocRef);
        toast({
            variant: "destructive",
            title: "تم الحذف",
            description: "تم حذف سند الصرف.",
        });
    } catch (error) {
        console.error("Error deleting payment:", error);
        toast({
            variant: "destructive",
            title: "حدث خطأ",
            description: "لم نتمكن من حذف سند الصرف.",
        });
    }
  };

  const openDialogForNew = () => {
    if (!canCreate) return;
    setEditingPayment(undefined);
    setIsDialogOpen(true);
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-headline font-bold text-foreground">
          إدارة سندات الصرف
        </h1>
        {canCreate && (
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
            <DialogContent className="max-h-[90vh] overflow-y-auto">
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
                  employees={employees || []}
                  onSubmit={handleFormSubmit}
                  initialData={editingPayment}
                />
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="font-headline flex items-center gap-2">
            <Receipt />
            قائمة سندات الصرف
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-4">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
            </div>
           ) : (
            <PaymentsList
                payments={payments || []}
                employees={employees || []}
                onEdit={handleEdit}
                onDelete={handleDelete}
                canUpdate={canUpdate}
                canDelete={canDelete}
            />
           )}
        </CardContent>
      </Card>
    </div>
  );
}
