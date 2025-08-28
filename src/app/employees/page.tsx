
'use client';

import * as React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Eye } from "lucide-react";
import { mockKras } from '@/lib/data';
import type { Employee, KRA } from '@/lib/types';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"


interface EmployeeSummary {
    employee: Employee;
    kraCount: number;
    averagePerformance: number;
}

export default function EmployeesPage() {
    const [kras, setKras] = React.useState<KRA[]>([]);
    const [loading, setLoading] = React.useState(true);
    const [selectedBranch, setSelectedBranch] = React.useState('all');

    React.useEffect(() => {
        try {
            const savedKras = sessionStorage.getItem('kraData');
            if (savedKras) {
                setKras(JSON.parse(savedKras, (key, value) => {
                    if (key === 'startDate' || key === 'endDate' || key === 'date') {
                        return new Date(value);
                    }
                    return value;
                }));
            } else {
                setKras(mockKras);
            }
        } catch (error) {
            console.error("Failed to parse KRA data from sessionStorage", error);
            setKras(mockKras);
        } finally {
            setLoading(false);
        }
    }, []);

    const { employeeSummary, branches } = React.useMemo(() => {
        const employeeMap = new Map<string, { employee: Employee; kras: KRA[] }>();

        kras.forEach(kra => {
            if (!employeeMap.has(kra.employee.id)) {
                employeeMap.set(kra.employee.id, { employee: kra.employee, kras: [] });
            }
            employeeMap.get(kra.employee.id)!.kras.push(kra);
        });
        
        const summaryData: EmployeeSummary[] = [];
        employeeMap.forEach(({ employee, kras }) => {
            const totalWeightage = kras.reduce((sum, kra) => sum + (kra.weightage || 0), 0);
            const totalMarksAchieved = kras.reduce((sum, kra) => sum + (kra.marksAchieved || 0), 0);
            const averagePerformance = totalWeightage > 0 ? Math.round((totalMarksAchieved / totalWeightage) * 100) : 0;
            
            summaryData.push({
                employee,
                kraCount: kras.length,
                averagePerformance
            });
        });

        const sortedSummary = summaryData.sort((a, b) => a.employee.name.localeCompare(b.employee.name));
        const allEmployees: Employee[] = Array.from(employeeMap.values()).map(e => e.employee);
        const uniqueBranches = ['all', ...Array.from(new Set(allEmployees.map(e => e.branch).filter(Boolean)))];

        return { employeeSummary: sortedSummary, branches: uniqueBranches };

    }, [kras]);

    const filteredEmployeeSummary = selectedBranch === 'all'
        ? employeeSummary
        : employeeSummary.filter(summary => summary.employee.branch === selectedBranch);


  return (
    <div className="flex flex-col gap-4">
        <h1 className="text-2xl font-semibold">Employee Management</h1>
        <Card>
            <CardHeader className="flex flex-row items-center justify-between gap-4">
                <div className='flex items-center gap-4'>
                    <Users className="h-8 w-8 text-primary" />
                    <div>
                        <CardTitle>All Employees</CardTitle>
                        <CardDescription>
                            View and manage all employees in the system.
                        </CardDescription>
                    </div>
                </div>
                <Select value={selectedBranch} onValueChange={setSelectedBranch}>
                    <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Filter by Branch" />
                    </SelectTrigger>
                    <SelectContent>
                        {branches.map(branch => (
                        <SelectItem key={branch} value={branch}>
                            {branch === 'all' ? 'All Branches' : branch}
                        </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </CardHeader>
            <CardContent>
                <div className="border rounded-lg">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Employee</TableHead>
                                <TableHead>Branch</TableHead>
                                <TableHead>KRAs Assigned</TableHead>
                                <TableHead className="w-[200px]">Avg. Performance</TableHead>
                                <TableHead><span className="sr-only">Actions</span></TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {loading ? (
                                Array.from({ length: 5 }).map((_, i) => (
                                <TableRow key={i}>
                                    <TableCell>
                                        <div className="flex items-center gap-3">
                                            <Skeleton className="h-10 w-10 rounded-full" />
                                            <Skeleton className="h-4 w-32" />
                                        </div>
                                    </TableCell>
                                    <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                                    <TableCell><Skeleton className="h-4 w-8" /></TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-2">
                                            <Skeleton className="h-2 w-full" />
                                            <Skeleton className="h-4 w-8" />
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <Skeleton className="h-9 w-20" />
                                    </TableCell>
                                </TableRow>
                                ))
                            ) : (
                                filteredEmployeeSummary.map(({ employee, kraCount, averagePerformance }) => (
                                    <TableRow key={employee.id}>
                                        <TableCell>
                                            <div className="flex items-center gap-3">
                                                <Avatar className="h-10 w-10">
                                                <AvatarImage src={employee.avatarUrl} alt={employee.name} data-ai-hint="people" />
                                                <AvatarFallback>{employee.name.charAt(0)}</AvatarFallback>
                                                </Avatar>
                                                <div className="font-medium">{employee.name}</div>
                                            </div>
                                        </TableCell>
                                        <TableCell>{employee.branch || 'N/A'}</TableCell>
                                        <TableCell>{kraCount}</TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-2">
                                                <Progress value={averagePerformance} className="h-2" />
                                                <span className="text-xs font-semibold text-muted-foreground">{averagePerformance}%</span>
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <Link href={`/employees/${employee.id}`}>
                                                <Button variant="outline" size="sm">
                                                    <Eye className="mr-2 h-4 w-4" />
                                                    View
                                                </Button>
                                            </Link>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </div>
            </CardContent>
        </Card>
    </div>
  )
}
