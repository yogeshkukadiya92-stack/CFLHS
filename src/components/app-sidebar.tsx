
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Settings, Package2, Users, ListTodo, Plane, UserCheck, ReceiptText, Target, CalendarDays, Briefcase, Calendar } from 'lucide-react';
import { useAuth } from './auth-provider';
import { cn } from '@/lib/utils';
import { useMemo } from 'react';
import { SidebarHeader, SidebarMenu, SidebarMenuItem, SidebarMenuButton, SidebarContent, SidebarFooter } from './ui/sidebar';

export function AppSidebar() {
  const pathname = usePathname();
  const { user, currentUser } = useAuth();

  const navItems = useMemo(() => [
    { href: '/', label: 'Employees', icon: Users, permissionKey: 'employees' },
    { href: '/routine-tasks', label: 'Routine Tasks', icon: ListTodo, permissionKey: 'routine_tasks' },
    { href: '/leaves', label: 'Leave Management', icon: Plane, permissionKey: 'leaves' },
    { href: '/attendance', label: 'Attendance', icon: UserCheck, permissionKey: 'attendance' },
    { href: '/expenses', label: 'Expense Claims', icon: ReceiptText, permissionKey: 'expenses' },
    { href: '/habit-tracker', label: 'Habit Tracker', icon: Target, permissionKey: 'habit_tracker' },
    { href: '/holidays', label: 'Holidays', icon: CalendarDays, permissionKey: 'holidays' },
    { href: '/recruitment', label: 'Recruitment', icon: Briefcase, permissionKey: 'recruitment' },
    { href: '/hr-calendar', label: 'HR Calendar', icon: Calendar, permissionKey: 'hr_calendar' },
  ], []);
  
  const hasPermission = (permissionKey: string) => {
    if (currentUser?.role === 'Admin') return true;
    if (!currentUser?.permissions) return false;
    return currentUser.permissions[permissionKey as keyof typeof currentUser.permissions];
  }

  if (!user) {
    return null;
  }

  return (
    <>
      <SidebarHeader>
        <Link href="/" className="flex items-center gap-2 font-semibold">
           <Package2 />
           <span>KRA Dashboard</span>
        </Link>
      </SidebarHeader>
      <SidebarContent>
        <SidebarMenu>
          {navItems.map((item) => (
             hasPermission(item.permissionKey) && (
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
          ))}
        </SidebarMenu>
      </SidebarContent>
      <SidebarFooter>
        <SidebarMenu>
            {hasPermission('settings') && (
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
