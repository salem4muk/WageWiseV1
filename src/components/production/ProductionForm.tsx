"use client";

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
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { arSA } from "date-fns/locale";
import { Calendar as CalendarIcon, Save } from "lucide-react";
import { useEffect } from "react";
import type { Employee, ProductionLog } from "@/lib/types";

const productionSchema = z.object({
  employeeId: z.string({ required_error: "الرجاء اختيار موظف." }),
  date: z.date({ required_error: "الرجاء تحديد تاريخ الإنتاج." }),
  count: z.coerce.number().min(1, { message: "الكمية يجب أن تكون 1 على الأقل." }),
  containerSize: z.enum(["large", "small"], {
    required_error: "يجب اختيار حجم العلبة.",
  }),
  processType: z.enum(["blown", "rolled"], {
    required_error: "يجب اختيار نوع العملية.",
  }),
});

type ProductionFormValues = z.infer<typeof productionSchema>;

interface ProductionFormProps {
  employees: Employee[];
  onSubmit: (values: ProductionFormValues) => void;
  initialData?: ProductionLog;
}

export default function ProductionForm({ employees, onSubmit, initialData }: ProductionFormProps) {
  const form = useForm<ProductionFormValues>({
    resolver: zodResolver(productionSchema),
    defaultValues: initialData 
    ? { ...initialData, date: new Date(initialData.date) } 
    : {
      count: 1,
      date: new Date(),
    },
  });

   useEffect(() => {
    if (initialData) {
      form.reset({ ...initialData, date: new Date(initialData.date) });
    } else {
        form.reset({
            count: 1,
            date: new Date(),
            containerSize: undefined,
            processType: undefined,
            employeeId: undefined,
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
              <FormLabel>تاريخ الإنتاج</FormLabel>
              <Popover>
                <PopoverTrigger asChild>
                  <FormControl>
                    <Button
                      variant={"outline"}
                      className={cn(
                        "w-full justify-between pl-3 pr-4 font-normal",
                        !field.value && "text-muted-foreground"
                      )}
                    >
                      {field.value ? (
                        format(field.value, "PPP", { locale: arSA })
                      ) : (
                        <span>اختر تاريخًا</span>
                      )}
                      <CalendarIcon className="h-4 w-4 opacity-50" />
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
                  <FormItem className="flex items-center space-x-3 space-y-0 rtl:space-x-reverse">
                    <FormControl>
                      <RadioGroupItem value="large" />
                    </FormControl>
                    <FormLabel className="font-normal">كبير</FormLabel>
                  </FormItem>
                  <FormItem className="flex items-center space-x-3 space-y-0 rtl:space-x-reverse">
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
                  <FormItem className="flex items-center space-x-3 space-y-0 rtl:space-x-reverse">
                    <FormControl>
                      <RadioGroupItem value="blown" />
                    </FormControl>
                    <FormLabel className="font-normal">نفخ (الكبير * 3, الصغير * 1)</FormLabel>
                  </FormItem>
                  <FormItem className="flex items-center space-x-3 space-y-0 rtl:space-x-reverse">
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
          <Save className="ms-2 h-4 w-4" />
          {initialData ? "حفظ التعديلات" : "حفظ الإنتاج"}
        </Button>
      </form>
    </Form>
  );
}
