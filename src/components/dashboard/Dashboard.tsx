
"use client";

import { useCollection } from "@/firebase";
import type { Employee, ProductionLog } from "@/lib/types";
import SummaryCards from "./SummaryCards";
import ProductionTable from "./ProductionTable";
import { Button } from "../ui/button";
import Link from "next/link";
import { PlusCircle } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { Skeleton } from "../ui/skeleton";

export default function Dashboard() {
  const { data: employees, loading: employeesLoading } = useCollection<Employee>("employees");
  const { data: productionLogs, loading: logsLoading } = useCollection<ProductionLog>("productionLogs");
  const { hasPermission } = useAuth();
  const canCreate = hasPermission('create');

  const isLoading = employeesLoading || logsLoading;

  const totalCost = productionLogs?.reduce((acc, log) => acc + log.cost, 0) || 0;
  const totalEmployees = employees?.length || 0;
  const totalProductionEntries = productionLogs?.length || 0;

  if (isLoading) {
    return (
      <div className="container mx-auto p-4 sm:p-6 md:p-8 space-y-6">
        <div className="flex items-center justify-between">
          <Skeleton className="h-10 w-48" />
          <Skeleton className="h-10 w-36" />
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-32 w-full" />
        </div>
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 sm:p-6 md:p-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-headline font-bold text-foreground">
          لوحة التحكم
        </h1>
        {canCreate && (
            <Button asChild className="bg-accent text-accent-foreground hover:bg-accent/90">
            <Link href="/production">
                <PlusCircle className="ms-2 h-4 w-4" />
                <span>إضافة إنتاج جديد</span>
            </Link>
            </Button>
        )}
      </div>
      <SummaryCards
        totalCost={totalCost}
        totalEmployees={totalEmployees}
        totalProductionEntries={totalProductionEntries}
      />
      <div className="mt-8">
        <ProductionTable
          productionLogs={productionLogs || []}
          employees={employees || []}
        />
      </div>
    </div>
  );
}
