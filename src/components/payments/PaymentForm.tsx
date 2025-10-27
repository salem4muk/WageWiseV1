"use client";

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
import { Save, Calendar as CalendarIcon } from "lucide-react";
import { useEffect } from "react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { arSA } from "date-fns/locale";

const paymentSchema = z.object({
  employeeId: z.string({ required_error: "الرجاء اختيار موظف." }),
  date: z.date({ required_error: "الرجاء تحديد تاريخ الصرف." }),
  amount: z.coerce.number().min(1, { message: "المبلغ يجب أن يكون 1 على الأقل." }),
  notes: z.string().optional(),
});

type PaymentFormValues = z.infer<typeof paymentSchema>;

interface PaymentFormProps {
  employees: Employee[];
  onSubmit: (values: PaymentFormValues) => void;
  initialData?: SalaryPayment;
}


export default function PaymentForm({ employees, onSubmit, initialData }: PaymentFormProps) {
  const form = useForm<PaymentFormValues>({
    resolver: zodResolver(paymentSchema),
    defaultValues: initialData ? {
        ...initialData,
        date: new Date(initialData.date),
        notes: initialData.notes || "",
    } : {
      amount: 0,
      notes: "",
      date: new Date(),
    },
  });

  useEffect(() => {
    if (initialData) {
      form.reset({
        ...initialData,
        date: new Date(initialData.date)
      });
    } else {
        form.reset({
            amount: 0,
            notes: "",
            date: new Date(),
            employeeId: undefined
        })
    }
  }, [initialData, form]);

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <FormField
          control={form.control}
          name="employeeId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>اختر الموظف</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value} dir="rtl">
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
          name="date"
          render={({ field }) => (
            <FormItem className="flex flex-col">
              <FormLabel>تاريخ الصرف</FormLabel>
              <Popover>
                <PopoverTrigger asChild>
                  <FormControl>
                    <Button
                      variant={"outline"}
                      className={cn(
                        "w-full justify-between text-right font-normal",
                        !field.value && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="ms-2 h-4 w-4 opacity-50" />
                      {field.value ? (
                        format(field.value, "PPP", { locale: arSA })
                      ) : (
                        <span>اختر تاريخًا</span>
                      )}
                    </Button>
                  </FormControl>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    locale={arSA}
                    mode="single"
                    selected={field.value}
                    onSelect={field.onChange}
                    disabled={(date) =>
                      date > new Date() || date < new Date("1900-01-01")
                    }
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
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
  );
}
