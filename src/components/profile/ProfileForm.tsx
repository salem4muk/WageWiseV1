
"use client";

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
import { Save } from "lucide-react";
import { useEffect } from "react";
import type { User } from "@/contexts/UsersContext";

const profileSchema = z.object({
  name: z.string().min(2, { message: "يجب أن يكون الاسم حرفين على الأقل." }),
  email: z.string().email({ message: "بريد إلكتروني غير صالح." }),
  password: z.string().optional(),
});

type ProfileFormValues = z.infer<typeof profileSchema>;

interface ProfileFormProps {
  onSubmit: (values: ProfileFormValues) => void;
  initialData?: User;
}

export default function ProfileForm({ onSubmit, initialData }: ProfileFormProps) {
  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
    },
  });

  useEffect(() => {
    if (initialData) {
      form.reset({
        name: initialData.name,
        email: initialData.email,
        password: "", // Always start with empty password
      });
    }
  }, [initialData, form]);
  
  const handleFormSubmit = (values: ProfileFormValues) => {
    if (values.password && values.password.length > 0 && values.password.length < 6) {
        form.setError("password", { type: "manual", message: "يجب أن تكون كلمة المرور 6 أحرف على الأقل." });
        return;
    }
    
    // Create a copy to modify
    const finalValues = { ...values };

    // Don't submit password if it's empty
    if (!finalValues.password) {
      delete finalValues.password;
    }
    
    onSubmit(finalValues);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>الاسم</FormLabel>
              <FormControl>
                <Input placeholder="اسمك" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>البريد الإلكتروني</FormLabel>
              <FormControl>
                <Input type="email" placeholder="user@example.com" {...field} dir="ltr" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>كلمة المرور الجديدة</FormLabel>
              <FormControl>
                <Input type="password" {...field} dir="ltr" placeholder="اتركه فارغًا لعدم التغيير" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <Button type="submit" className="w-full">
            حفظ التعديلات
            <Save className="me-2 h-4 w-4"/>
        </Button>
      </form>
    </Form>
  );
}
