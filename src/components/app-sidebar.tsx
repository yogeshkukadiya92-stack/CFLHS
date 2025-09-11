
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Settings, Package2, Users, ListTodo, Plane, UserCheck, ReceiptText, Target, CalendarDays, Briefcase, Calendar } from 'lucide-react';
import { useAuth } from './auth-provider';
import { cn } from '@/lib/utils';
import { useMemo } from 'react';
import { SidebarHeader, SidebarMenu, SidebarMenuItem, SidebarMenuButton, SidebarContent, SidebarFooter } from './ui/sidebar';
import type { EmployeePermissions } from '@/lib/types';

export function AppSidebar() {
  const pathname = usePathname();
  const { user, currentUser, getPermission } = useAuth();

  const navItems = useMemo(() => [
    { href: '/', label: 'Employees', icon: Users, permissionKey: 'employees' as keyof EmployeePermissions },
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

  return (
    <>
      <SidebarHeader>
        <Link href="/" className="flex items-center gap-2 font-semibold">
           <Package2 />
           <span>HR Dashboard</span>
        </Link>
      </SidebarHeader>
      <SidebarContent>
        <SidebarMenu>
          {navItems.map((item) => {
             const canAccess = item.permissionKey === 'employees' || item.permissionKey === 'leaves' || item.permissionKey === 'expenses'
                ? hasEmployeeAccess(item.permissionKey)
                : hasAccess(item.permissionKey);

             return canAccess && (
                 <SidebarMenuItem key={item.href}>
                    <Link href={item.href}>
                      <SidebarMenuButton 
                        isActive={pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href))}
                        tooltip={item.label}
                       >
                        <item.icon />
                        <span>{item.label}</span>
                      </SidebarMenuButton>
                    </Link>
                 </SidebarMenuItem>
             )
          })}
        </SidebarMenu>
      </SidebarContent>
      <SidebarFooter>
        <SidebarMenu>
            {hasAccess('settings') && (
                <SidebarMenuItem>
                    <Link href="/settings">
                        <SidebarMenuButton isActive={pathname.startsWith('/settings')} tooltip="Settings">
                            <Settings />
                            <span>Settings</span>
                        </SidebarMenuButton>
                    </Link>
                </SidebarMenuItem>
            )}
        </SidebarMenu>
      </SidebarFooter>
    </>
  );
}
