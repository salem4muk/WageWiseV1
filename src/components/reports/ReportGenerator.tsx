
"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { format } from "date-fns";
import { arSA } from "date-fns/locale";
import { Calendar as CalendarIcon, FileSearch } from "lucide-react";
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
import type { Employee, ProductionLog, SalaryPayment } from "@/lib/types";

import ProductionReportTable from "./ProductionReportTable";
import PaymentsReportTable from "./PaymentsReportTable";
import EmployeeSummaryReportTable from "./EmployeeSummaryReportTable";
import { useAuth } from "@/hooks/use-auth";
import { useRouter } from "next/navigation";

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
  employeeId: z.string().optional(),
});

type ReportFormValues = z.infer<typeof reportSchema>;

export default function ReportGenerator() {
  const { hasPermission, hasRole } = useAuth();
  const router = useRouter();

  const [employees] = useLocalStorage<Employee[]>("employees", []);
  const [productionLogs] = useLocalStorage<ProductionLog[]>("productionLogs", []);
  const [salaryPayments] = useLocalStorage<SalaryPayment[]>("salaryPayments", []);

  const [reportData, setReportData] = useState<any[] | null>(null);
  const [activeReportType, setActiveReportType] = useState<string | null>(null);
  const [filteredEmployees, setFilteredEmployees] = useState<Employee[]>([]);

  useEffect(() => {
    if (!hasPermission('view_reports') || hasRole('supervisor')) {
      router.push('/');
    }
  }, [hasPermission, hasRole, router]);

  const form = useForm<ReportFormValues>({
    resolver: zodResolver(reportSchema),
  });

  const filterByDateRange = (items: (ProductionLog | SalaryPayment)[], dateRange: DateRange) => {
    const from = dateRange.from!;
    const to = dateRange.to!;
    to.setHours(23, 59, 59, 999); // Include the whole end day
    return items.filter(item => {
      const itemDate = new Date(item.date);
      return itemDate >= from && itemDate <= to;
    });
  };
  
  const onSubmit = (values: ReportFormValues) => {
    let data;
    const { employeeId, dateRange } = values;

    const filterByEmployee = (items: (ProductionLog | SalaryPayment)[]) => {
      if (!employeeId || employeeId === 'all') return items;
      return items.filter(item => item.employeeId === employeeId);
    }
    
    switch (values.reportType) {
      case "production":
        data = filterByEmployee(filterByDateRange(productionLogs, dateRange));
        break;
      case "payments":
        data = filterByEmployee(filterByDateRange(salaryPayments, dateRange));
        break;
      case "employee_summary":
        const filteredLogs = filterByEmployee(filterByDateRange(productionLogs, dateRange)) as ProductionLog[];
        const filteredPayments = filterByEmployee(filterByDateRange(salaryPayments, dateRange)) as SalaryPayment[];
        
        const targetEmployees = (employeeId && employeeId !== 'all') 
          ? employees.filter(e => e.id === employeeId) 
          : employees;
          
        setFilteredEmployees(targetEmployees);

        const reportMap = new Map<string, { totalProductionCost: number, productionCount: number }>();
        filteredLogs.forEach(log => {
          const entry = reportMap.get(log.employeeId) || { totalProductionCost: 0, productionCount: 0 };
          entry.totalProductionCost += log.cost;
          entry.productionCount += 1;
          reportMap.set(log.employeeId, entry);
        });

        const paymentsMap = new Map<string, number>();
        filteredPayments.forEach(payment => {
          const currentAmount = paymentsMap.get(payment.employeeId) || 0;
          paymentsMap.set(payment.employeeId, currentAmount + payment.amount);
        });
        
        data = targetEmployees.map(employee => {
          const productionData = reportMap.get(employee.id) || { totalProductionCost: 0 };
          const totalPayments = paymentsMap.get(employee.id) || 0;
          return {
            employee,
            totalProductionCost: productionData.totalProductionCost,
            totalPayments,
            netSalary: productionData.totalProductionCost - totalPayments,
          };
        }).filter(item => item.totalProductionCost > 0 || item.totalPayments > 0);
        break;
      default:
        data = [];
    }
    if (values.reportType !== 'employee_summary') {
        setFilteredEmployees(employees);
    }
    setReportData(data);
    setActiveReportType(values.reportType);
  };
  
  const renderReport = () => {
    if (!reportData) {
      return null;
    }

    switch (activeReportType) {
      case 'production':
        return <ProductionReportTable productionLogs={reportData as ProductionLog[]} employees={employees} />;
      case 'payments':
        return <PaymentsReportTable payments={reportData as SalaryPayment[]} employees={employees} />;
      case 'employee_summary':
        return <EmployeeSummaryReportTable reportData={reportData} />;
      default:
        return null;
    }
  }

  if (!hasPermission('view_reports') || hasRole('supervisor')) {
    return null; // or a loading/access denied component
  }

  return (
    <div>
       <div className="mb-6">
        <h1 className="text-3xl font-headline font-bold text-foreground">
          منشئ التقارير
        </h1>
        <p className="text-muted-foreground">
         اختر نوع التقرير والنطاق الزمني والموظف لعرضه.
        </p>
      </div>
    <Card className="mb-8">
      <CardHeader>
        <CardTitle className="font-headline">خيارات التقرير</CardTitle>
        <CardDescription>
          حدد المعايير لعرض التقرير المخصص.
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
                    dir="rtl"
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
              name="employeeId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>الموظف</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value} dir="rtl">
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="اختر موظفًا (اختياري)"/>
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                       <SelectItem value="all">جميع الموظفين</SelectItem>
                       {employees.map(emp => (
                           <SelectItem key={emp.id} value={emp.id}>{emp.name}</SelectItem>
                       ))}
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
                            "w-full justify-start text-right font-normal",
                            !field.value && "text-muted-foreground"
                          )}
                        >
                           
                          {field.value?.from ? (
                            field.value.to ? (
                              <>
                                {format(field.value.from, "dd/MM/yyyy", { locale: arSA })} -{" "}
                                {format(field.value.to, "dd/MM/yyyy", { locale: arSA })}
                              </>
                            ) : (
                              format(field.value.from, "dd/MM/yyyy", { locale: arSA })
                            )
                          ) : (
                            <span>اختر نطاقًا زمنيًا</span>
                          )}
                           <CalendarIcon className="me-auto h-4 w-4 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        locale={arSA}
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
              <FileSearch className="ms-2 h-4 w-4" />
              إنشاء التقرير
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
    
    {renderReport()}

    </div>
  );
}
