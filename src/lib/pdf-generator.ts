'use client';

import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { arimo } from './arimo-normal';
import type { Employee, ProductionLog, SalaryPayment } from './types';
import { DateRange } from 'react-day-picker';
import { format } from 'date-fns';

type ReportType = 'production' | 'payments' | 'employee_summary';

// Extend jsPDF with the autoTable plugin
interface jsPDFWithAutoTable extends jsPDF {
  autoTable: (options: any) => jsPDFWithAutoTable;
}

const addArabicFont = (doc: jsPDF) => {
  doc.addFileToVFS('Arimo-Regular.ttf', arimo);
  doc.addFont('Arimo-Regular.ttf', 'Arimo', 'normal');
  doc.setFont('Arimo');
};

const generateHeader = (doc: jsPDFWithAutoTable, title: string, dateRange: DateRange) => {
    const from = format(dateRange.from!, 'yyyy/MM/dd');
    const to = format(dateRange.to!, 'yyyy/MM/dd');
    
    doc.setFontSize(20);
    doc.text(title, 105, 15, { align: 'center' });
    doc.setFontSize(10);
    doc.text(`الفترة من: ${from} إلى: ${to}`, 105, 22, { align: 'center' });
    doc.setFontSize(12);
};

const filterByDateRange = (items: (ProductionLog | SalaryPayment)[], dateRange: DateRange) => {
  const from = dateRange.from!;
  const to = dateRange.to!;
  return items.filter(item => {
    const itemDate = new Date(item.date);
    return itemDate >= from && itemDate <= to;
  });
};

const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("ar-YE", {
      style: "currency",
      currency: "YER",
      minimumFractionDigits: 0,
    }).format(value);
};

const generateProductionReport = (
  doc: jsPDFWithAutoTable,
  dateRange: DateRange,
  productionLogs: ProductionLog[],
  employees: Employee[]
) => {
  const employeeMap = new Map(employees.map(emp => [emp.id, emp.name]));
  const filteredLogs = filterByDateRange(productionLogs, dateRange) as ProductionLog[];
  
  generateHeader(doc, 'تقرير الإنتاج', dateRange);

  let totalCost = 0;

  const body = filteredLogs.map(log => {
    totalCost += log.cost;
    return [
      formatCurrency(log.cost),
      log.processType === 'blown' ? 'نفخ' : 'لف',
      log.containerSize === 'large' ? 'كبير' : 'صغير',
      log.count.toString(),
      new Date(log.date).toLocaleDateString('ar-EG'),
      employeeMap.get(log.employeeId) || 'موظف محذوف'
    ];
  });
  
  const totalRow = [
      formatCurrency(totalCost), 
      { content: 'المجموع الإجمالي', colSpan: 5, styles: { halign: 'center', fontStyle: 'bold' } }
  ];
  
  body.push(totalRow);

  doc.autoTable({
    head: [['التكلفة', 'العملية', 'الحجم', 'الكمية', 'التاريخ', 'الموظف']],
    body: body,
    startY: 30,
    styles: { font: 'Arimo', halign: 'right' },
    headStyles: { fillColor: [231, 48, 48] },
    footStyles: { fillColor: [220, 220, 220], textColor: 0, fontStyle: 'bold' },
  });
};

const generatePaymentsReport = (
  doc: jsPDFWithAutoTable,
  dateRange: DateRange,
  salaryPayments: SalaryPayment[],
  employees: Employee[]
) => {
  const employeeMap = new Map(employees.map(emp => [emp.id, emp.name]));
  const filteredPayments = filterByDateRange(salaryPayments, dateRange) as SalaryPayment[];
  
  generateHeader(doc, 'تقرير سندات الصرف', dateRange);

  let totalAmount = 0;

  const body = filteredPayments.map(payment => {
    totalAmount += payment.amount;
    return [
      payment.notes || '-',
      formatCurrency(payment.amount),
      new Date(payment.date).toLocaleDateString('ar-EG'),
      employeeMap.get(payment.employeeId) || 'موظف محذوف',
    ];
  });
  
  const totalRow = [
      '',
      formatCurrency(totalAmount),
      { content: 'المجموع الإجمالي', colSpan: 2, styles: { halign: 'center', fontStyle: 'bold' } }
  ];

  body.push(totalRow);
  
  doc.autoTable({
    head: [['ملاحظات', 'المبلغ', 'التاريخ', 'الموظف']],
    body: body,
    startY: 30,
    styles: { font: 'Arimo', halign: 'right' },
    headStyles: { fillColor: [231, 48, 48] },
  });
};

const generateEmployeeSummaryReport = (
  doc: jsPDFWithAutoTable,
  dateRange: DateRange,
  employees: Employee[],
  productionLogs: ProductionLog[],
  salaryPayments: SalaryPayment[]
) => {
  generateHeader(doc, 'تقرير ملخص رواتب الموظفين', dateRange);

  const filteredLogs = filterByDateRange(productionLogs, dateRange) as ProductionLog[];
  const filteredPayments = filterByDateRange(salaryPayments, dateRange) as SalaryPayment[];

  const reportMap = new Map<string, { totalProductionCost: number }>();
  filteredLogs.forEach(log => {
    const entry = reportMap.get(log.employeeId) || { totalProductionCost: 0 };
    entry.totalProductionCost += log.cost;
    reportMap.set(log.employeeId, entry);
  });

  const paymentsMap = new Map<string, number>();
  filteredPayments.forEach(payment => {
    const currentAmount = paymentsMap.get(payment.employeeId) || 0;
    paymentsMap.set(payment.employeeId, currentAmount + payment.amount);
  });

  let totalNetSalary = 0;

  const body = employees.map(employee => {
    const productionData = reportMap.get(employee.id) || { totalProductionCost: 0 };
    const totalPayments = paymentsMap.get(employee.id) || 0;
    const netSalary = productionData.totalProductionCost - totalPayments;
    totalNetSalary += netSalary;
    
    return [
      formatCurrency(netSalary),
      formatCurrency(totalPayments),
      formatCurrency(productionData.totalProductionCost),
      employee.name,
    ];
  });
  
  const totalRow = [
      formatCurrency(totalNetSalary),
      { content: 'إجمالي صافي الرواتب', colSpan: 3, styles: { halign: 'center', fontStyle: 'bold' } }
  ];

  body.push(totalRow);

  doc.autoTable({
    head: [['صافي الراتب', 'إجمالي المصروف', 'إجمالي الإنتاج', 'اسم الموظف']],
    body: body,
    startY: 30,
    styles: { font: 'Arimo', halign: 'right' },
    headStyles: { fillColor: [231, 48, 48] },
  });
};

export const generatePdf = (
  reportType: ReportType,
  dateRange: DateRange,
  employees: Employee[],
  productionLogs: ProductionLog[],
  salaryPayments: SalaryPayment[]
) => {
  const doc = new jsPDF() as jsPDFWithAutoTable;
  addArabicFont(doc);

  switch (reportType) {
    case 'production':
      generateProductionReport(doc, dateRange, productionLogs, employees);
      break;
    case 'payments':
      generatePaymentsReport(doc, dateRange, salaryPayments, employees);
      break;
    case 'employee_summary':
      generateEmployeeSummaryReport(doc, dateRange, employees, productionLogs, salaryPayments);
      break;
  }

  doc.save(`${reportType}_report_${format(new Date(), 'yyyy-MM-dd')}.pdf`);
};
