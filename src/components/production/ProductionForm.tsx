"use client";

import { useLocalStorage } from "@/hooks/use-local-storage";
import type { Employee, ProductionLog } from "@/lib/types";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
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
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
import { Save } from "lucide-react";

const productionSchema = z.object({
  employeeId: z.string({ required_error: "الرجاء اختيار موظف." }),
  count: z.coerce.number().min(1, { message: "الكمية يجب أن تكون 1 على الأقل." }),
  containerSize: z.enum(["large", "small"], {
    required_error: "يجب اختيار حجم العلبة.",
  }),
  processType: z.enum(["blown", "rolled"], {
    required_error: "يجب اختيار نوع العملية.",
  }),
});

export default function ProductionForm() {
  const [employees] = useLocalStorage<Employee[]>("employees", []);
  const [, setProductionLogs] = useLocalStorage<ProductionLog[]>("productionLogs", []);
  const router = useRouter();
  const { toast } = useToast();

  const form = useForm<z.infer<typeof productionSchema>>({
    resolver: zodResolver(productionSchema),
    defaultValues: {
      count: 1,
    },
  });

  function calculateCost(values: z.infer<typeof productionSchema>): number {
    const { count, containerSize, processType } = values;
    if (processType === "blown") {
      return containerSize === "large" ? count * 3 : count * 1;
    }
    if (processType === "rolled") {
      return containerSize === "large" ? count * 2 : count * 1;
    }
    return 0;
  }

  function onSubmit(values: z.infer<typeof productionSchema>) {
    const newLog: ProductionLog = {
      id: crypto.randomUUID(),
      date: new Date().toISOString(),
      cost: calculateCost(values),
      ...values,
    };
    setProductionLogs((prev) => [...prev, newLog]);
    toast({
      title: "تم الحفظ بنجاح",
      description: "تم تسجيل عملية الإنتاج الجديدة.",
    });
    router.push("/");
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-headline text-2xl">إضافة إنتاج جديد</CardTitle>
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
              name="count"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>عدد العلب المنتجة</FormLabel>
                  <FormControl>
                    <Input type="number" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="containerSize"
              render={({ field }) => (
                <FormItem className="space-y-3">
                  <FormLabel>حجم العلبة</FormLabel>
                  <FormControl>
                    <RadioGroup
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      className="flex flex-col space-y-1"
                    >
                      <FormItem className="flex items-center space-x-3 space-y-0">
                        <FormControl>
                          <RadioGroupItem value="large" />
                        </FormControl>
                        <FormLabel className="font-normal">كبير</FormLabel>
                      </FormItem>
                      <FormItem className="flex items-center space-x-3 space-y-0">
                        <FormControl>
                          <RadioGroupItem value="small" />
                        </FormControl>
                        <FormLabel className="font-normal">صغير</FormLabel>
                      </FormItem>
                    </RadioGroup>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="processType"
              render={({ field }) => (
                <FormItem className="space-y-3">
                  <FormLabel>نوع العملية</FormLabel>
                  <FormControl>
                    <RadioGroup
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      className="flex flex-col space-y-1"
                    >
                      <FormItem className="flex items-center space-x-3 space-y-0">
                        <FormControl>
                          <RadioGroupItem value="blown" />
                        </FormControl>
                        <FormLabel className="font-normal">نفخ (الكبير * 3, الصغير * 1)</FormLabel>
                      </FormItem>
                      <FormItem className="flex items-center space-x-3 space-y-0">
                        <FormControl>
                          <RadioGroupItem value="rolled" />
                        </FormControl>
                        <FormLabel className="font-normal">لف (الكبير * 2, الصغير * 1)</FormLabel>
                      </FormItem>
                    </RadioGroup>
                  </FormControl>
                  <FormDescription>
                    سيتم حساب التكلفة بناءً على اختيارك.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button type="submit" className="w-full" disabled={employees.length === 0}>
                <Save className="ms-2 h-4 w-4"/>
                حفظ الإنتاج
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
