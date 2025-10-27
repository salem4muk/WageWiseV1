"use client";

import { useLocalStorage } from "@/hooks/use-local-storage";
import type { Employee, SalaryPayment } from "@/lib/types";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
import { Save } from "lucide-react";

const paymentSchema = z.object({
  employeeId: z.string({ required_error: "الرجاء اختيار موظف." }),
  amount: z.coerce.number().min(1, { message: "المبلغ يجب أن يكون 1 على الأقل." }),
  notes: z.string().optional(),
});

export default function PaymentForm() {
  const [employees] = useLocalStorage<Employee[]>("employees", []);
  const [, setSalaryPayments] = useLocalStorage<SalaryPayment[]>("salaryPayments", []);
  const router = useRouter();
  const { toast } = useToast();

  const form = useForm<z.infer<typeof paymentSchema>>({
    resolver: zodResolver(paymentSchema),
    defaultValues: {
      amount: 0,
      notes: "",
    },
  });

  function onSubmit(values: z.infer<typeof paymentSchema>) {
    const newPayment: SalaryPayment = {
      id: crypto.randomUUID(),
      date: new Date().toISOString(),
      ...values,
    };
    setSalaryPayments((prev) => [...prev, newPayment]);
    toast({
      title: "تم الحفظ بنجاح",
      description: "تم تسجيل سند الصرف الجديد.",
    });
    router.push("/reports/employees");
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-headline text-2xl">إضافة سند صرف راتب</CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <FormField
              control={form.control}
              name="employeeId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>اختر الموظف</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="قائمة الموظفين" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {employees.length > 0 ? (
                        employees.map((emp) => (
                          <SelectItem key={emp.id} value={emp.id}>
                            {emp.name}
                          </SelectItem>
                        ))
                      ) : (
                        <SelectItem value="no-emp" disabled>
                          الرجاء إضافة موظفين أولاً
                        </SelectItem>
                      )}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="amount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>المبلغ المصروف</FormLabel>
                  <FormControl>
                    <Input type="number" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>ملاحظات</FormLabel>
                  <FormControl>
                    <Textarea placeholder="أدخل ملاحظات (اختياري)" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button type="submit" className="w-full" disabled={employees.length === 0}>
                <Save className="ms-2 h-4 w-4"/>
                حفظ السند
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
