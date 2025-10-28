
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "./ui/sheet";
import { Menu, Settings2, LogOut, Shield } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";

const Logo = () => (
  <Link href="/" className="flex items-center gap-2">
    <Settings2 className="h-7 w-7 text-primary" />
    <span className="font-headline text-2xl font-bold text-primary">
      WageWise
    </span>
  </Link>
);

const NavLink = ({ href, children }: { href: string; children: React.ReactNode }) => {
  const pathname = usePathname();
  const isActive = pathname === href;

  return (
    <Link
      href={href}
      className={cn(
        "transition-colors hover:text-primary",
        isActive ? "text-primary font-semibold" : "text-muted-foreground"
      )}
    >
      {children}
    </Link>
  );
};

export default function Header() {
  const { user, logout, hasPermission, hasRole } = useAuth();
  
  let navItems = [
    { href: "/", label: "لوحة التحكم", permission: true },
    { href: "/employees", label: "الموظفين", permission: true },
    { href: "/production", label: "الإنتاج", permission: !hasRole('supervisor') },
    { href: "/payments", label: "سندات الصرف", permission: !hasRole('supervisor') },
    { href: "/reports/employees", label: "تقرير الرواتب", permission: hasPermission('view_reports') && !hasRole('supervisor') },
    { href: "/reports/generator", label: "منشئ التقارير", permission: hasPermission('view_reports') && !hasRole('supervisor') },
  ];

  if (hasRole('supervisor')) {
    navItems = [
      { href: "/", label: "لوحة التحكم", permission: true },
      { href: "/employees", label: "الموظفين", permission: true },
    ];
  }


  const adminNavItems = [
    { href: "/users", label: "إدارة المستخدمين", icon: <Shield className="ms-2 h-4 w-4"/>, permission: user?.roles?.includes('admin') },
  ];

  const visibleNavItems = navItems.filter(item => item.permission);
  const visibleAdminNavItems = adminNavItems.filter(item => item.permission);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 max-w-7xl items-center justify-between">
        <div className="flex items-center gap-6">
          <Logo />
          <nav className="hidden items-center gap-6 text-sm font-medium md:flex">
            {visibleNavItems.map((item) => (
              <NavLink key={item.href} href={item.href}>
                {item.label}
              </NavLink>
            ))}
             {visibleAdminNavItems.map((item) => (
              <NavLink key={item.href} href={item.href}>
                <div className="flex items-center">{item.label}{item.icon}</div>
              </NavLink>
            ))}
          </nav>
        </div>
        
        <div className="flex items-center gap-4">
          {user && (
            <div className="flex items-center gap-2">
               <span className="hidden sm:inline text-sm text-muted-foreground">أهلاً, {user.name}</span>
               <Button variant="ghost" size="icon" onClick={logout} title="تسجيل الخروج">
                <LogOut className="h-5 w-5" />
               </Button>
            </div>
          )}

          <div className="md:hidden">
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Menu className="h-6 w-6" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right">
                <div className="flex flex-col gap-6 p-6">
                  <Logo />
                  <nav className="flex flex-col gap-4 text-lg font-medium">
                    {visibleNavItems.map((item) => (
                      <NavLink key={item.href} href={item.href}>
                        {item.label}
                      </NavLink>
                    ))}
                    {visibleAdminNavItems.map((item) => (
                      <NavLink key={item.href} href={item.href}>
                        <div className="flex items-center">{item.label}{item.icon}</div>
                      </NavLink>
                    ))}
                  </nav>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  );
}
