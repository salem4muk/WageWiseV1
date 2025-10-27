"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { format } from "date-fns";
import { Calendar as CalendarIcon, FileDown } from "lucide-react";
import { DateRange } from "react-day-picker";

import { useLocalStorage } from "@/hooks/use-local-storage";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { generatePdf } from "@/lib/pdf-generator";
import type { Employee, ProductionLog, SalaryPayment } from "@/lib/types";

const reportSchema = z.object({
  reportType: z.enum([
    "production",
    "payments",
    "employee_summary",
  ], {
    required_error: "الرجاء اختيار نوع التقرير.",
  }),
  dateRange: z.object({
    from: z.date({ required_error: "الرجاء تحديد تاريخ البدء." }),
    to: z.date({ required_error: "الرجاء تحديد تاريخ الانتهاء." }),
  }),
});

type ReportFormValues = z.infer<typeof reportSchema>;

export default function ReportGenerator() {
  const [employees] = useLocalStorage<Employee[]>("employees", []);
  const [productionLogs] = useLocalStorage<ProductionLog[]>("productionLogs", []);
  const [salaryPayments] = useLocalStorage<SalaryPayment[]>("salaryPayments", []);

  const form = useForm<ReportFormValues>({
    resolver: zodResolver(reportSchema),
  });

  const onSubmit = (values: ReportFormValues) => {
    generatePdf(
      values.reportType,
      values.dateRange,
      employees,
      productionLogs,
      salaryPayments
    );
  };

  return (
    <div>
       <div className="mb-6">
        <h1 className="text-3xl font-headline font-bold text-foreground">
          منشئ التقارير
        </h1>
        <p className="text-muted-foreground">
         اختر نوع التقرير والنطاق الزمني لإنشاء ملف PDF.
        </p>
      </div>
    <Card>
      <CardHeader>
        <CardTitle className="font-headline">خيارات التقرير</CardTitle>
        <CardDescription>
          حدد المعايير لتوليد التقرير المخصص.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <FormField
              control={form.control}
              name="reportType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>نوع التقرير</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="اختر نوع التقرير المراد إنشاؤه" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="production">تقرير الإنتاج</SelectItem>
                      <SelectItem value="payments">تقرير سندات الصرف</SelectItem>
                      <SelectItem value="employee_summary">
                        تقرير رواتب الموظفين
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="dateRange"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>النطاق الزمني</FormLabel>
                   <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          id="date"
                          variant={"outline"}
                          className={cn(
                            "w-full justify-start text-left font-normal",
                            !field.value && "text-muted-foreground"
                          )}
                        >
                          <CalendarIcon className="ml-2 h-4 w-4" />
                          {field.value?.from ? (
                            field.value.to ? (
                              <>
                                {format(field.value.from, "LLL dd, y")} -{" "}
                                {format(field.value.to, "LLL dd, y")}
                              </>
                            ) : (
                              format(field.value.from, "LLL dd, y")
                            )
                          ) : (
                            <span>اختر نطاقًا زمنيًا</span>
                          )}
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        initialFocus
                        mode="range"
                        defaultMonth={field.value?.from}
                        selected={field.value}
                        onSelect={field.onChange}
                        numberOfMonths={2}
                      />
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button type="submit" className="w-full">
              <FileDown className="ms-2 h-4 w-4" />
              إنشاء وتنزيل التقرير
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card