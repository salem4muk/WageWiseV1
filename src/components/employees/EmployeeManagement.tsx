"use client";

import { useState } from "react";
import { useLocalStorage } from "@/hooks/use-local-storage";
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

export function EmployeeManagement() {
  const [employees, setEmployees] = useLocalStorage<Employee[]>("employees", []);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<Employee | undefined>(undefined);
  const { toast } = useToast();

  const handleFormSubmit = (values: any) => {
    if (editingEmployee) {
      const updatedEmployees = employees.map((emp) =>
        emp.id === editingEmployee.id ? { ...editingEmployee, ...values } : emp
      );
      setEmployees(updatedEmployees);
      toast({
        title: "تم التعديل بنجاح",
        description: `تم تحديث بيانات الموظف ${values.name}.`,
      });
    } else {
      const newEmployee: Employee = {
        id: crypto.randomUUID(),
        ...values,
      };
      setEmployees((prev) => [...prev, newEmployee]);
      toast({
        title: "تم بنجاح",
        description: `تمت إضافة الموظف ${values.name} بنجاح.`,
      });
    }
    setIsDialogOpen(false);
    setEditingEmployee(undefined);
  };
  
  const handleEdit = (employee: Employee) => {
    setEditingEmployee(employee);
    setIsDialogOpen(true);
  };

  const handleDelete = (employeeId: string) => {
    setEmployees((prev) => prev.filter((emp) => emp.id !== employeeId));
    toast({
      variant: "destructive",
      title: "تم الحذف",
      description: "تم حذف الموظف.",
    });
  };

  const openDialogForNew = () => {
    setEditingEmployee(undefined);
    setIsDialogOpen(true);
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-headline font-bold text-foreground">
          إدارة الموظفين
        </h1>
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
          <DialogContent>
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
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="font-headline flex items-center gap-2">
            <Users />
            قائمة الموظفين
          </CardTitle>
        </CardHeader>
        <CardContent>
          <EmployeeList
            employees={employees}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        </CardContent>
      </Card>
    </div>
  );
}
