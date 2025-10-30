
"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Save } from "lucide-react";
import { useEffect } from "react";
import type { Employee } from "@/lib/types";

const employeeSchema = z.object({
  name: z.string().min(2, { message: "يجب أن يكون الاسم حرفين على الأقل." }),
  department: z.string().min(2, { message: "يجب أن يكون القسم حرفين على الأقل." }),
});

type EmployeeFormValues = z.infer<typeof employeeSchema>;

interface EmployeeFormProps {
  onSubmit: (values: EmployeeFormValues) => void;
  initialData?: Employee;
}

export default function EmployeeForm({ onSubmit, initialData }: EmployeeFormProps) {
  const form = useForm<EmployeeFormValues>({
    resolver: zodResolver(employeeSchema),
    defaultValues: initialData || {
      name: "",
      department: "",
    },
  });

  useEffect(() => {
    if (initialData) {
      form.reset({
        name: initialData.name,
        department: initialData.department,
      });
    } else {
        form.reset({
            name: "",
            department: "",
        });
    }
  }, [initialData, form]);
  
  const isEditing = !!initialData;

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>اسم الموظف</FormLabel>
              <FormControl>
                <Input placeholder="مثال: محمد علي" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
         {isEditing && initialData.employeeId && (
          <div className="space-y-2">
            <label className="text-sm font-medium">معرف الموظف</label>
            <Input
              value={initialData.employeeId}
              disabled
              className="bg-muted"
            />
          </div>
        )}
        <FormField
          control={form.control}
          name="department"
          render={({ field }) => (
            <FormItem>
              <FormLabel>القسم</FormLabel>
              <FormControl>
                <Input placeholder="مثال: الإنتاج" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" className="w-full">
            {initialData ? "حفظ التعديلات" : "حفظ الموظف"}
            <Save className="me-2 h-4 w-4"/>
        </Button>
      </form>
    </Form>
  );
}
