"use client";

import { useLocalStorage } from "@/hooks/use-local-storage";
import type { Employee, ProductionLog } from "@/lib/types";
import SummaryCards from "./SummaryCards";
import ProductionTable from "./ProductionTable";
import { Button } from "../ui/button";
import Link from "next/link";
import { PlusCircle } from "lucide-react";

export default function Dashboard() {
  const [employees] = useLocalStorage<Employee[]>("employees", []);
  const [productionLogs] = useLocalStorage<ProductionLog[]>("productionLogs", []);

  const totalCost = productionLogs.reduce((acc, log) => acc + log.cost, 0);
  const totalEmployees = employees.length;
  const totalProductionEntries = productionLogs.length;

  return (
    <div className="container mx-auto p-4 sm:p-6 md:p-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-headline font-bold text-foreground">
          لوحة التحكم
        </h1>
        <Button asChild className="bg-accent text-accent-foreground hover:bg-accent/90">
          <Link href="/production">
            <PlusCircle className="ms-2 h-4 w-4" />
            <span>إضافة إنتاج جديد</span>
          </Link>
        </Button>
      </div>
      <SummaryCards
        totalCost={totalCost}
        totalEmployees={totalEmployees}
        totalProductionEntries={totalProductionEntries}
      />
      <div className="mt-8">
        <ProductionTable
          productionLogs={productionLogs}
          employees={employees}
        />
      </div>
    </div>
  );
}
