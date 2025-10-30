
"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { format } from "date-fns";
import { arSA } from "date-fns/locale";
import { Calendar as CalendarIcon, FileSearch, Download } from "lucide-react";
import { DateRange } from "react-day-picker";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { amiriFont } from "@/lib/amiri-font";

import { useCollection } from "@/firebase";
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
import { cn, downloadAsTextFile } from "@/lib/utils";
import type { Employee, ProductionLog, SalaryPayment } from "@/lib/types";

import ProductionReportTable from "./ProductionReportTable";
import PaymentsReportTable from "./PaymentsReportTable";
import EmployeeSummaryReportTable from "./EmployeeSummaryReportTable";
import { useAuth } from "@/hooks/use-auth";
import { useRouter } from "next/navigation";
import { Skeleton } from "../ui/skeleton";

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
  const { hasPermission } = useAuth();
  const router = useRouter();

  const { data: employees, loading: eLoading } = useCollection<Employee>("employees");
  const { data: productionLogs, loading: pLoading } = useCollection<ProductionLog>("productionLogs");
  const { data: salaryPayments, loading: sLoading } = useCollection<SalaryPayment>("salaryPayments");

  const [reportData, setReportData] = useState<any[] | null>(null);
  const [activeReportType, setActiveReportType] = useState<string | null>(null);
  const [activeReportMetadata, setActiveReportMetadata] = useState<any>(null);

  const isLoading = eLoading || pLoading || sLoading;

  useEffect(() => {
    if (!hasPermission('view_reports')) {
      router.push('/');
    }
  }, [hasPermission, router]);

  const form = useForm<ReportFormValues>({
    resolver: zodResolver(reportSchema),
  });
  
  const formatCurrency = (value: number) => {
    const formattedValue = new Intl.NumberFormat("ar-YE", {
      minimumFractionDigits: 0,
    }).format(value);
    return `${formattedValue} ريال`;
  };

  const filterByDateRange = (items: (ProductionLog | SalaryPayment)[], dateRange: DateRange) => {
    if(!dateRange || !dateRange.from || !dateRange.to) return items;
    const from = dateRange.from!;
    const to = dateRange.to!;
    to.setHours(23, 59, 59, 999); // Include the whole end day
    return items.filter(item => {
      const itemDate = new Date(item.date);
      return itemDate >= from && itemDate <= to;
    });
  };
  
  const onSubmit = (values: ReportFormValues) => {
    if (!productionLogs || !salaryPayments || !employees) return;

    let data;
    const { employeeId, dateRange, reportType } = values;

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
    
    setReportData(data);
    setActiveReportType(values.reportType);
    setActiveReportMetadata({
      dateRange,
      employeeId,
      reportType,
    });
  };

  const handleExport = () => {
    if (!reportData || !activeReportType || !activeReportMetadata || !employees) return;

    const { dateRange, employeeId, reportType } = activeReportMetadata;
    const employeeMap = new Map(employees.map((emp) => [emp.id, emp.name]));
    const selectedEmployeeName = employeeId === 'all' || !employeeId ? 'جميع الموظفين' : employeeMap.get(employeeId) || 'موظف محذوف';

    let content = `تقرير ${reportType === 'production' ? 'الإنتاج' : reportType === 'payments' ? 'سندات الصرف' : 'ملخص الرواتب'}\n`;
    content += `من: ${format(dateRange.from, "dd/MM/yyyy", { locale: arSA })} إلى: ${format(dateRange.to, "dd/MM/yyyy", { locale: arSA })}\n`;
    content += `الموظف: ${selectedEmployeeName}\n`;
    content += "========================================================\n\n";

    if (reportData.length === 0) {
      content += "لا توجد بيانات لعرضها في هذا النطاق الزمني.\n";
    } else {
      switch (reportType) {
        case "production":
          let totalCost = 0;
          (reportData as ProductionLog[]).forEach(log => {
            totalCost += log.cost;
            content += `الموظف: ${employeeMap.get(log.employeeId)}\n`;
            content += `التاريخ: ${new Date(log.date).toLocaleDateString("ar-EG")}\n`;
            content += `الكمية: ${log.count}, الحجم: ${log.containerSize === 'large' ? 'كبير' : 'صغير'}, العملية: ${log.processType === 'blown' ? 'نفخ' : 'لف'}\n`;
            content += `التكلفة: ${formatCurrency(log.cost)}\n`;
            content += "--------------------------------------------------------\n";
          });
          content += `\nالمجموع الإجمالي للتكلفة: ${formatCurrency(totalCost)}\n`;
          break;
        case "payments":
          let totalAmount = 0;
          (reportData as SalaryPayment[]).forEach(payment => {
            totalAmount += payment.amount;
            content += `الموظف: ${employeeMap.get(payment.employeeId)}\n`;
            content += `التاريخ: ${new Date(payment.date).toLocaleDateString("ar-EG")}\n`;
            content += `المبلغ: ${formatCurrency(payment.amount)}\n`;
            content += `ملاحظات: ${payment.notes || 'لا يوجد'}\n`;
            content += "--------------------------------------------------------\n";
          });
          content += `\nالمجموع الإجمالي للمصروفات: ${formatCurrency(totalAmount)}\n`;
          break;
        case "employee_summary":
          let totalNet = 0;
          reportData.forEach(item => {
            totalNet += item.netSalary;
            content += `الموظف: ${item.employee.name}\n`;
            content += `إجمالي الإنتاج: ${formatCurrency(item.totalProductionCost)}\n`;
            content += `إجمالي المصروف: ${formatCurrency(item.totalPayments)}\n`;
            content += `صافي الراتب: ${formatCurrency(item.netSalary)}\n`;
            content += "--------------------------------------------------------\n";
          });
          content += `\nالمجموع الإجمالي للرواتب الصافية: ${formatCurrency(totalNet)}\n`;
          break;
      }
    }

    downloadAsTextFile(content, `report-${reportType}-${dateRange.from.toISOString().split('T')[0]}.txt`);
  };

  const handleExportPdf = () => {
    if (!reportData || !activeReportType || !activeReportMetadata || !employees) return;

    const doc = new jsPDF();

    // Add Amiri font for Arabic support
    doc.addFileToVFS("Amiri-Regular.ttf", amiriFont);
    doc.addFont("Amiri-Regular.ttf", "Amiri", "normal");
    doc.setFont("Amiri");

    const { dateRange, employeeId, reportType } = activeReportMetadata;
    const employeeMap = new Map(employees.map((emp) => [emp.id, emp.name]));
    const selectedEmployeeName = employeeId === 'all' || !employeeId ? 'جميع الموظفين' : employeeMap.get(employeeId) || 'موظف محذوف';
    
    const reportTitleMap = {
        production: 'تقرير الإنتاج',
        payments: 'تقرير سندات الصرف',
        employee_summary: 'تقرير ملخص رواتب الموظفين'
    };

    const title = reportTitleMap[reportType as keyof typeof reportTitleMap];
    const dateFromString = format(dateRange.from, "dd/MM/yyyy", { locale: arSA });
    const dateToString = format(dateRange.to, "dd/MM/yyyy", { locale: arSA });
    
    doc.text(title, 105, 15, { align: 'center', lang: 'ar' });
    doc.setFontSize(10);
    doc.text(`الفترة من: ${dateFromString} إلى: ${dateToString}`, 105, 22, { align: 'center', lang: 'ar' });
    doc.text(`الموظف: ${selectedEmployeeName}`, 105, 29, { align: 'center', lang: 'ar' });
    
    let head: any[] = [];
    let body: any[] = [];
    let totalRow: any[] = [];
    
    const styles = { font: "Amiri", halign: 'center', fontStyle: 'normal' };
    const headStyles = { ...styles, fillColor: [41, 128, 185], textColor: 255 };

    switch (reportType) {
        case 'production':
            head = [['التكلفة', 'العملية', 'الحجم', 'الكمية', 'التاريخ', 'الموظف']];
            body = (reportData as ProductionLog[]).map(log => [
                formatCurrency(log.cost),
                log.processType === 'blown' ? 'نفخ' : 'لف',
                log.containerSize === 'large' ? 'كبير' : 'صغير',
                log.count,
                new Date(log.date).toLocaleDateString("ar-EG"),
                employeeMap.get(log.employeeId) || 'محذوف'
            ]);
            const totalCost = reportData.reduce((sum, log) => sum + log.cost, 0);
            totalRow = [{ content: formatCurrency(totalCost), colSpan: 1, styles }, {content: 'المجموع الإجمالي', colSpan: 5, styles: { ...styles, fontStyle: 'bold' } }];
            break;
        case 'payments':
            head = [['ملاحظات', 'المبلغ', 'التاريخ', 'الموظف']];
            body = (reportData as SalaryPayment[]).map(p => [
                p.notes || '-',
                formatCurrency(p.amount),
                new Date(p.date).toLocaleDateString("ar-EG"),
                employeeMap.get(p.employeeId) || 'محذوف'
            ]);
            const totalAmount = reportData.reduce((sum, p) => sum + p.amount, 0);
            totalRow = [{ content: '', styles }, { content: formatCurrency(totalAmount), styles }, {content: 'المجموع الإجمالي', colSpan: 2, styles: { ...styles, fontStyle: 'bold' } }];
            break;
        case 'employee_summary':
            head = [['صافي الراتب', 'إجمالي المصروف', 'إجمالي الإنتاج', 'اسم الموظف']];
            body = reportData.map(d => [
                formatCurrency(d.netSalary),
                formatCurrency(d.totalPayments),
                formatCurrency(d.totalProductionCost),
                d.employee.name
            ]);
            const totalNet = reportData.reduce((sum, d) => sum + d.netSalary, 0);
            totalRow = [{ content: formatCurrency(totalNet), styles }, {content: 'المجموع الإجمالي', colSpan: 3, styles: { ...styles, fontStyle: 'bold' } }];
            break;
    }
    
    if (reportData.length > 0) {
      body.push(totalRow);
    }
    
    autoTable(doc, {
        head,
        body,
        startY: 35,
        styles,
        headStyles,
        theme: 'grid',
        didDrawCell: (data) => {
            if (data.row.section === 'body' && data.column.dataKey !== undefined) {
                 // Right-align the text in cells for RTL
                doc.text(String(data.cell.text), data.cell.x + data.cell.width - 5, data.cell.y + 7, { align: 'right' });
            }
        }
    });

    doc.save(`report-${reportType}-${dateRange.from.toISOString().split('T')[0]}.pdf`);
  };
  
  const renderReport = () => {
    if (!reportData) {
      return null;
    }
     if (!employees) return;

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

  if (!hasPermission('view_reports')) {
    return null; // or a loading/access denied component
  }
  
  if (isLoading) {
    return (
        <div className="container mx-auto p-4 sm:p-6 md:p-8">
            <Skeleton className="h-10 w-64 mb-2" />
            <Skeleton className="h-5 w-80 mb-6" />
            <Card className="mb-8">
                <CardHeader>
                    <Skeleton className="h-8 w-48 mb-2" />
                    <Skeleton className="h-5 w-72" />
                </CardHeader>
                <CardContent className="space-y-8">
                    <div className="space-y-2"><Skeleton className="h-5 w-24" /><Skeleton className="h-10 w-full" /></div>
                    <div className="space-y-2"><Skeleton className="h-5 w-24" /><Skeleton className="h-10 w-full" /></div>
                    <div className="space-y-2"><Skeleton className="h-5 w-24" /><Skeleton className="h-10 w-full" /></div>
                    <Skeleton className="h-10 w-full" />
                </CardContent>
            </Card>
        </div>
    )
  }

  return (
    <div className="container mx-auto p-4 sm:p-6 md:p-8">
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
                       {(employees || []).map(emp => (
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
    
    {reportData && (
        <div className="flex justify-end mb-4 gap-2">
            <Button onClick={handleExport} disabled={reportData.length === 0} variant="outline">
                <Download className="ms-2 h-4 w-4" />
                تصدير إلى TXT
            </Button>
            <Button onClick={handleExportPdf} disabled={reportData.length === 0}>
                <Download className="ms-2 h-4 w-4" />
                تصدير إلى PDF
            </Button>
        </div>
    )}

    {renderReport()}

    </div>
  );
}
