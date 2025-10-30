
"use client";

import { useState } from "react";
import { useCollection, useFirestore } from "@/firebase";
import { collection, addDoc, updateDoc, deleteDoc, doc } from "firebase/firestore";
import type { Employee } from "@/lib/types";
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
import { PlusCircle, Users } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import EmployeeForm from "./EmployeeForm";
import EmployeeList from "./EmployeeList";
import { useAuth } from "@/hooks/use-auth";
import { Skeleton } from "../ui/skeleton";

export function EmployeeManagement() {
  const firestore = useFirestore();
  const { data: employees, loading } = useCollection<Employee>("employees");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<Employee | undefined>(undefined);
  const { toast } = useToast();
  const { hasPermission } = useAuth();

  const canCreate = hasPermission('create');
  const canUpdate = hasPermission('update');
  const canDelete = hasPermission('delete');

  const handleFormSubmit = async (values: any) => {
    try {
      if (editingEmployee) {
        if (!canUpdate) return;
        const employeeDocRef = doc(firestore, "employees", editingEmployee.id);
        await updateDoc(employeeDocRef, values);
        toast({
          title: "تم التعديل بنجاح",
          description: `تم تحديث بيانات الموظف ${values.name}.`,
        });
      } else {
        if (!canCreate) return;
        const employeesCollectionRef = collection(firestore, "employees");
        await addDoc(employeesCollectionRef, values);
        toast({
          title: "تم بنجاح",
          description: `تمت إضافة الموظف ${values.name} بنجاح.`,
        });
      }
      setIsDialogOpen(false);
      setEditingEmployee(undefined);
    } catch (error) {
      console.error("Error saving employee:", error);
      toast({
        variant: "destructive",
        title: "حدث خطأ",
        description: "لم نتمكن من حفظ بيانات الموظف.",
      });
    }
  };
  
  const handleEdit = (employee: Employee) => {
    if (!canUpdate) return;
    setEditingEmployee(employee);
    setIsDialogOpen(true);
  };

  const handleDelete = async (employeeId: string) => {
    if (!canDelete) return;
    try {
      const employeeDocRef = doc(firestore, "employees", employeeId);
      await deleteDoc(employeeDocRef);
      toast({
        variant: "destructive",
        title: "تم الحذف",
        description: "تم حذف الموظف.",
      });
    } catch (error) {
      console.error("Error deleting employee:", error);
      toast({
        variant: "destructive",
        title: "حدث خطأ",
        description: "لم نتمكن من حذف الموظف.",
      });
    }
  };

  const openDialogForNew = () => {
    if (!canCreate) return;
    setEditingEmployee(undefined);
    setIsDialogOpen(true);
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-headline font-bold text-foreground">
          إدارة الموظفين
        </h1>
        {canCreate && (
          <Dialog open={isDialogOpen} onOpenChange={(isOpen) => {
            setIsDialogOpen(isOpen);
            if (!isOpen) {
              setEditingEmployee(undefined);
            }
          }}>
            <DialogTrigger asChild>
              <Button onClick={openDialogForNew} className="bg-accent text-accent-foreground hover:bg-accent/90">
                <PlusCircle className="ms-2 h-4 w-4" />
                <span>إضافة موظف جديد</span>
              </Button>
            </DialogTrigger>
            <DialogContent className="max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="font-headline">
                  {editingEmployee ? "تعديل بيانات موظف" : "إضافة موظف جديد"}
                </DialogTitle>
                <DialogDescription>
                  {editingEmployee ? "قم بتحديث تفاصيل الموظف." : "أدخل تفاصيل الموظف الجديد لحفظه في النظام."}
                </DialogDescription>
              </DialogHeader>
              <div className="py-4">
                 <EmployeeForm
                  onSubmit={handleFormSubmit}
                  initialData={editingEmployee}
                />
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="font-headline flex items-center gap-2">
            <Users />
            قائمة الموظفين
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-4">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </div>
          ) : (
            <EmployeeList
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
