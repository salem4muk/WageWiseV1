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
  employeeId: z.string().min(1, { message: "معرف الموظف مطلوب." }),
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
      employeeId: "",
      department: "",
    },
  });

  useEffect(() => {
    if (initialData) {
      form.reset(initialData);
    } else {
        form.reset({
            name: "",
            employeeId: "",
            department: "",
        });
    }
  }, [initialData, form]);

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
        <FormField
          control={form.control}
          name="employeeId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>معرف الموظف</FormLabel>
              <FormControl>
                <Input placeholder="مثال: 1023" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
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
            <Save className="ms-2 h-4 w-4"/>
            {initialData ? "حفظ التعديلات" : "حفظ الموظف"}
        </Button>
      </form>
    </Form>
  );
}
