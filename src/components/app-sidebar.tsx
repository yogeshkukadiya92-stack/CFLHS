'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Settings, Package2, Users, ListTodo, Plane, UserCheck, ReceiptText, Target, CalendarDays, Briefcase, Calendar, ListChecks, Sparkles } from 'lucide-react';
import { useAuth } from './auth-provider';
import { cn } from '@/lib/utils';
import { useMemo } from 'react';
import { SidebarHeader, SidebarMenu, SidebarMenuItem, SidebarMenuButton, SidebarContent, SidebarFooter } from './ui/sidebar';
import type { EmployeePermissions } from '@/lib/types';

export function AppSidebar() {
  const pathname = usePathname();
  const { user, currentUser, getPermission } = useAuth();

  const navItems = useMemo(() => [
    { href: '/', label: 'Dashboard', icon: Users, permissionKey: 'employees' as keyof EmployeePermissions },
    { href: '/kras', label: 'KRA Management', icon: ListChecks, permissionKey: 'employees' as keyof EmployeePermissions },
    { href: '/routine-tasks', label: 'Routine Tasks', icon: ListTodo, permissionKey: 'routine_tasks' as keyof EmployeePermissions },
    { href: '/leaves', label: 'Leave Account', icon: Plane, permissionKey: 'leaves' as keyof EmployeePermissions },
    { href: '/attendance', label: 'Attendance', icon: UserCheck, permissionKey: 'attendance' as keyof EmployeePermissions },
    { href: '/expenses', label: 'Expense Claims', icon: ReceiptText, permissionKey: 'expenses' as keyof EmployeePermissions },
    { href: '/habit-tracker', label: 'Habit Tracker', icon: Target, permissionKey: 'habit_tracker' as keyof EmployeePermissions },
    { href: '/recruitment', label: 'Recruitment', icon: Briefcase, permissionKey: 'recruitment' as keyof EmployeePermissions },
    { href: '/hr-calendar', label: 'HR Calendar', icon: Calendar, permissionKey: 'hr_calendar' as keyof EmployeePermissions },
  ], []);
  
  const hasAccess = (permissionKey: keyof EmployeePermissions) => {
    const permission = getPermission(permissionKey);
    return permission !== 'none' && permission !== 'employee_only';
  }
  
  const hasEmployeeAccess = (permissionKey: keyof EmployeePermissions) => {
    return getPermission(permissionKey) !== 'none';
  }

  if (!user) {
    return null;
  }
  
  const employeeNavItems = [
    { href: '/', label: 'My Dashboard', icon: Users, permissionKey: 'employees' as keyof EmployeePermissions },
    { href: '/leaves', label: 'Leave Account', icon: Plane, permissionKey: 'leaves' as keyof EmployeePermissions },
    { href: '/expenses', label: 'Expense Claims', icon: ReceiptText, permissionKey: 'expenses' as keyof EmployeePermissions },
  ]

  const itemsToRender = getPermission('employees') === 'employee_only' ? employeeNavItems : navItems;


  return (
    <>
      <SidebarHeader className="border-b bg-primary/5 py-4">
        <Link href="/" className="flex items-center gap-3 px-2">
           <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-lg shadow-primary/20">
              <Sparkles className="h-5 w-5" />
           </div>
           <div className="flex flex-col">
              <span className="text-sm font-bold leading-none tracking-tight">HR Studio</span>
              <span className="text-[10px] font-medium text-muted-foreground mt-1">Management Suite</span>
           </div>
        </Link>
      </SidebarHeader>
      <SidebarContent className="py-4">
        <SidebarMenu>
          {itemsToRender.map((item) => {
             const canAccess = hasEmployeeAccess(item.permissionKey);
             const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));

             return canAccess && (
                 <SidebarMenuItem key={item.href} className="px-2">
                    <Link href={item.href}>
                      <SidebarMenuButton 
                        isActive={isActive}
                        tooltip={item.label}
                        className={cn(
                          "transition-all duration-200 rounded-lg h-10 px-3",
                          isActive 
                            ? "bg-primary text-primary-foreground shadow-md shadow-primary/20 hover:bg-primary/90" 
                            : "hover:bg-primary/10 hover:text-primary"
                        )}
                       >
                        <item.icon className={cn("h-4 w-4 shrink-0", isActive ? "text-white" : "text-primary/70")} />
                        <span className="font-medium">{item.label}</span>
                      </SidebarMenuButton>
                    </Link>
                 </SidebarMenuItem>
             )
          })}
        </SidebarMenu>
      </SidebarContent>
      <SidebarFooter className="border-t bg-muted/30 p-4">
        <SidebarMenu>
            {hasAccess('settings') && (
                <SidebarMenuItem>
                    <Link href="/settings">
                        <SidebarMenuButton 
                          isActive={pathname.startsWith('/settings')} 
                          tooltip="Settings"
                          className={cn(
                            "transition-all duration-200 rounded-lg h-10 px-3",
                            pathname.startsWith('/settings')
                              ? "bg-primary text-primary-foreground shadow-md shadow-primary/20" 
                              : "hover:bg-primary/10 hover:text-primary"
                          )}
                        >
                            <Settings className={cn("h-4 w-4 shrink-0", pathname.startsWith('/settings') ? "text-white" : "text-primary/70")} />
                            <span className="font-medium">Settings</span>
                        </SidebarMenuButton>
                    </Link>
                </SidebarMenuItem>
            )}
        </SidebarMenu>
      </SidebarFooter>
    </>
  );
}
