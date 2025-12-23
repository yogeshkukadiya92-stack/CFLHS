
'use client';

import * as React from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AddKraDialog } from '@/components/add-kra-dialog';
import type { Employee, KRA, Branch } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Protected } from '@/components/protected';
import { PlusCircle, ListChecks } from 'lucide-react';
import { getYear, getMonth, startOfMonth, endOfMonth } from 'date-fns';
import { useDataStore } from '@/hooks/use-data-store';
import { KraTable } from '@/components/kra-table';
import { useAuth } from '@/components/auth-provider';


function KraManagementPage() {
  const { 
    kras, 
    loading, 
    employees, 
    handleSaveKra, 
    handleDeleteEmployee, // This seems incorrect, should be handleDeleteKra
  } = useDataStore();
  const [selectedBranch, setSelectedBranch] = React.useState('all');
  const [selectedYear, setSelectedYear] = React.useState<string>(String(getYear(new Date())));
  const [selectedMonth, setSelectedMonth] = React.useState<string>('all');
  const { currentUser, getPermission } = useAuth();
  const pagePermission = getPermission('employees'); // Assuming 'employees' permission governs KRA visibility

  const { filteredKras, branchOptions, availableYears, availableMonths } = React.useMemo(() => {
        let krasToProcess = kras;

        if (pagePermission === 'employee_only' && currentUser) {
            krasToProcess = kras.filter(k => k.employee.id === currentUser.id);
        }

        const filteredByBranch = selectedBranch === 'all' 
            ? krasToProcess
            : krasToProcess.filter(k => k.employee.branch === selectedBranch);

        const filteredKrasByDate = filteredByBranch.filter(kra => {
            if (selectedYear === 'all' && selectedMonth === 'all') return true;
            
            const year = parseInt(selectedYear);
            const month = parseInt(selectedMonth);
            const kraStart = new Date(kra.startDate);
            const kraEnd = new Date(kra.endDate);

            if (selectedYear !== 'all' && selectedMonth === 'all') {
                return getYear(kraStart) <= year && getYear(kraEnd) >= year;
            }
            if (selectedYear !== 'all' && selectedMonth !== 'all') {
                 const monthStart = startOfMonth(new Date(year, month));
                 const monthEnd = endOfMonth(new Date(year, month));
                 return kraStart <= monthEnd && kraEnd >= monthStart;
            }
            return true;
        });

        const allEmployees: Employee[] = Array.from(new Map(kras.map(kra => [kra.employee.id, kra.employee])).values());
        const uniqueBranches = ['all', ...Array.from(new Set(allEmployees.map(e => e.branch).filter(Boolean)))];

        const yearsSet = new Set<number>();
        kras.forEach(kra => {
            yearsSet.add(getYear(new Date(kra.startDate)));
            yearsSet.add(getYear(new Date(kra.endDate)));
        });
         if (!yearsSet.has(getYear(new Date()))) {
            yearsSet.add(getYear(new Date()));
        }

        const monthMap = [
            'January', 'February', 'March', 'April', 'May', 'June', 
            'July', 'August', 'September', 'October', 'November', 'December'
        ];

        return { 
            filteredKras: filteredKrasByDate, 
            branchOptions: uniqueBranches, 
            availableYears: Array.from(yearsSet).sort((a, b) => b - a),
            availableMonths: monthMap
        };

    }, [kras, pagePermission, currentUser, selectedBranch, selectedYear, selectedMonth]);

    const handleDeleteKra = (kraId: string) => {
        // This needs to be implemented in useDataStore
        console.log("Delete KRA requested for ID:", kraId);
    }

  return (
        <div className="flex-1 flex flex-col gap-4">
            <h1 className="text-2xl font-semibold">KRA Management</h1>
            <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                <div className='flex items-center gap-4'>
                    <ListChecks className="h-8 w-8 text-primary" />
                    <div>
                        <CardTitle>All Key Result Areas (KRAs)</CardTitle>
                        <CardDescription>
                            View, manage, and evaluate all KRAs across the organization.
                        </CardDescription>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                     <Select value={selectedYear} onValueChange={setSelectedYear}>
                        <SelectTrigger className="w-[120px]">
                            <SelectValue placeholder="Year" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Years</SelectItem>
                            {availableYears.map(year => (
                                <SelectItem key={year} value={String(year)}>{year}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    <Select value={selectedMonth} onValueChange={setSelectedMonth} disabled={selectedYear === 'all'}>
                        <SelectTrigger className="w-[140px]">
                            <SelectValue placeholder="Month" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Months</SelectItem>
                            {availableMonths.map((month, index) => (
                                <SelectItem key={index} value={String(index)}>{month}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    {pagePermission !== 'employee_only' && (
                        <Select value={selectedBranch} onValueChange={setSelectedBranch}>
                            <SelectTrigger className="w-[180px]">
                                <SelectValue placeholder="Filter by Branch" />
                            </SelectTrigger>
                            <SelectContent>
                                {branchOptions.map(branch => (
                                <SelectItem key={branch} value={branch}>
                                    {branch === 'all' ? 'All Branches' : branch}
                                </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    )}
                    {pagePermission === 'edit' || pagePermission === 'download' && (
                        <AddKraDialog onSave={handleSaveKra} employees={employees}>
                            <Button>
                                 <PlusCircle className="mr-2 h-4 w-4" />
                                Add KRA
                            </Button>
                        </AddKraDialog>
                    )}
                </div>
                </CardHeader>
                <CardContent>
                    {loading ? (
                        <div className="space-y-2">
                            <Skeleton className="h-12 w-full" />
                            <Skeleton className="h-12 w-full" />
                            <Skeleton className="h-12 w-full" />
                        </div>
                    ) : (
                        <KraTable 
                           kras={filteredKras}
                           employees={employees}
                           onSave={handleSaveKra}
                           onDelete={handleDeleteKra}
                        />
                    )}
                </CardContent>
            </Card>
        </div>
  );
}

export default function KRAManagement() {
    return (
        <Protected>
            <KraManagementPage />
        </Protected>
    )
}
