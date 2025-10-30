
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "./ui/sheet";
import { Menu, Settings2, LogOut, Shield, User as UserIcon } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";

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
  
  const navItems = [
    { href: "/", label: "لوحة التحكم", permission: true },
    { href: "/employees", label: "الموظفين", permission: hasRole('admin') || hasRole('supervisor') },
    { href: "/production", label: "الإنتاج", permission: hasPermission('create') },
    { href: "/payments", label: "سندات الصرف", permission: hasPermission('create') },
    { href: "/reports/employees", label: "تقرير الرواتب", permission: hasPermission('view_reports') },
    { href: "/reports/generator", label: "منشئ التقارير", permission: hasPermission('view_reports') },
  ];

  const adminNavItems = [
    { href: "/users", label: "إدارة المستخدمين", icon: <Shield className="ms-2 h-4 w-4"/>, permission: user?.roles?.includes('admin') },
  ];

  const visibleNavItems = navItems.filter(item => item.permission);
  const visibleAdminNavItems = adminNavItems.filter(item => item.permission);
  
  const getInitials = (name: string | null | undefined) => {
    if (!name) return 'U';
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  }

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
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                  <Avatar className="h-10 w-10">
                    <AvatarFallback>{getInitials(user.name)}</AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuLabel className="font-normal text-right">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">{user.name}</p>
                    <p className="text-xs leading-none text-muted-foreground">
                      {user.email}
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/profile">
                    <UserIcon className="ms-2 h-4 w-4" />
                    <span>الملف الشخصي</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={logout}>
                  <LogOut className="ms-2 h-4 w-4" />
                  <span>تسجيل الخروج</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
          <div className="md:hidden">
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Menu className="h-6 w-6" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right">
                <SheetHeader>
                  <SheetTitle className="sr-only">Menu</SheetTitle>
                </SheetHeader>
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
