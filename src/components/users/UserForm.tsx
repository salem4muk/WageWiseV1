
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
  FormDescription,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Save } from "lucide-react";
import type { Permission, Role } from "@/contexts/AuthContext";

const permissions: { id: Permission; label: string }[] = [
  { id: 'create', label: 'إضافة' },
  { id: 'update', label: 'تعديل' },
  { id: 'delete', label: 'حذف' },
  { id: 'view_reports', label: 'عرض التقارير' },
];

const userSchema = z.object({
  name: z.string().min(2, { message: "يجب أن يكون الاسم حرفين على الأقل." }),
  email: z.string().email({ message: "بريد إلكتروني غير صالح." }),
  password: z.string().min(6, { message: "يجب أن تكون كلمة المرور 6 أحرف على الأقل." }),
  role: z.enum(["user", "supervisor"], { required_error: "يجب اختيار دور للمستخدم."}),
  permissions: z.array(z.string()),
}).superRefine((data, ctx) => {
    if (data.role === 'user' && data.permissions.length === 0) {
        ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ['permissions'],
            message: "يجب عليك تحديد صلاحية واحدة على الأقل للمستخدم العادي.",
        });
    }
});


type UserFormValues = z.infer<typeof userSchema>;

interface UserFormProps {
  onSubmit: (values: Omit<UserFormValues, 'role'> & { roles: Role[] }) => void;
}

export default function UserForm({ onSubmit }: UserFormProps) {
  const form = useForm<UserFormValues>({
    resolver: zodResolver(userSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      role: "user",
      permissions: [],
    },
  });

  const selectedRole = form.watch("role");

  const handleFormSubmit = (values: UserFormValues) => {
    const { role, ...rest } = values;
    let permissions = values.permissions;
    let roles: Role[] = [role];

    if (role === 'supervisor') {
      permissions = []; // Supervisors don't need specific permissions from this form
    }
    
    onSubmit({ ...rest, roles, permissions });
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>اسم المستخدم</FormLabel>
              <FormControl>
                <Input placeholder="مثال: أحمد" {...field} />
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
              <FormLabel>كلمة المرور</FormLabel>
              <FormControl>
                <Input type="password" {...field} dir="ltr"/>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="role"
          render={({ field }) => (
            <FormItem className="space-y-3">
              <FormLabel>دور المستخدم</FormLabel>
              <FormControl>
                <RadioGroup
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                  className="flex flex-col space-y-1"
                >
                  <FormItem className="flex items-center space-x-3 space-y-0 rtl:space-x-reverse">
                    <FormControl>
                      <RadioGroupItem value="user" />
                    </FormControl>
                    <FormLabel className="font-normal">مستخدم عادي</FormLabel>
                  </FormItem>
                  <FormItem className="flex items-center space-x-3 space-y-0 rtl:space-x-reverse">
                    <FormControl>
                      <RadioGroupItem value="supervisor" />
                    </FormControl>
                    <FormLabel className="font-normal">مشرف</FormLabel>
                  </FormItem>
                </RadioGroup>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {selectedRole === 'user' && (
           <FormField
            control={form.control}
            name="permissions"
            render={() => (
              <FormItem>
                <div className="mb-4">
                  <FormLabel className="text-base">الصلاحيات</FormLabel>
                  <FormDescription>
                    حدد الإجراءات المسموح للمستخدم القيام بها.
                  </FormDescription>
                </div>
                {permissions.map((permission) => (
                  <FormField
                    key={permission.id}
                    control={form.control}
                    name="permissions"
                    render={({ field }) => {
                      return (
                        <FormItem
                          key={permission.id}
                          className="flex flex-row items-start space-x-3 space-y-0 rtl:space-x-reverse"
                        >
                          <FormControl>
                            <Checkbox
                              checked={field.value?.includes(permission.id)}
                              onCheckedChange={(checked) => {
                                return checked
                                  ? field.onChange([...field.value, permission.id])
                                  : field.onChange(
                                      field.value?.filter(
                                        (value) => value !== permission.id
                                      )
                                    );
                              }}
                            />
                          </FormControl>
                          <FormLabel className="font-normal">
                            {permission.label}
                          </FormLabel>
                        </FormItem>
                      );
                    }}
                  />
                ))}
                <FormMessage />
              </FormItem>
            )}
          />
        )}

        <Button type="submit" className="w-full">
            حفظ المستخدم
            <Save className="me-2 h-4 w-4"/>
        </Button>
      </form>
    </Form>
  );
}
