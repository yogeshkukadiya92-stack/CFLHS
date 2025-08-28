
'use client';

import * as React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp } from "lucide-react";
import { mockKras } from '@/lib/data';
import type { Employee, KRA } from '@/lib/types';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { BarChart, CartesianGrid, XAxis, YAxis, ResponsiveContainer, Tooltip } from 'recharts';
import { ChartContainer, ChartTooltipContent } from '@/components/ui/chart';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Bar } from 'recharts';

interface EmployeePerformance {
    employee: Employee;
    totalWeightage: number;
    totalMarksAchieved: number;
    performanceScore: number;
}

export default function IncrementsPage() {
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

    const { performanceData, branches } = React.useMemo(() => {
        const employeeMap = new Map<string, { employee: Employee; kras: KRA[] }>();

        kras.forEach(kra => {
            if (!employeeMap.has(kra.employee.id)) {
                employeeMap.set(kra.employee.id, { employee: kra.employee, kras: [] });
            }
            employeeMap.get(kra.employee.id)!.kras.push(kra);
        });
        
        const data: EmployeePerformance[] = [];
        employeeMap.forEach(({ employee, kras }) => {
            const totalWeightage = kras.reduce((sum, kra) => sum + (kra.weightage || 0), 0);
            const totalMarksAchieved = kras.reduce((sum, kra) => sum + (kra.marksAchieved || 0), 0);
            const performanceScore = totalWeightage > 0 ? Math.round((totalMarksAchieved / totalWeightage) * 100) : 0;
            
            data.push({
                employee,
                totalWeightage,
                totalMarksAchieved,
                performanceScore
            });
        });

        const sortedData = data.sort((a, b) => b.performanceScore - a.performanceScore);
        const allEmployees: Employee[] = Array.from(employeeMap.values()).map(e => e.employee);
        const uniqueBranches = ['all', ...Array.from(new Set(allEmployees.map(e => e.branch).filter(Boolean)))];

        return { performanceData: sortedData, branches: uniqueBranches };

    }, [kras]);

    const filteredPerformanceData = selectedBranch === 'all'
        ? performanceData
        : performanceData.filter(data => data.employee.branch === selectedBranch);


  return (
    <div className="flex flex-col gap-4">
        <h1 className="text-2xl font-semibold">Increment Management</h1>
        <Card>
            <CardHeader className="flex flex-row items-center justify-between gap-4">
                <div className='flex items-center gap-4'>
                    <TrendingUp className="h-8 w-8 text-primary" />
                    <div>
                        <CardTitle>Evaluations & Increments</CardTitle>
                        <CardDescription>
                            Review employee performance based on KRA scores and manage salary increments.
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
            <CardContent className="grid gap-6 md:grid-cols-2">
                 <div>
                    <h2 className="text-lg font-semibold mb-2">Performance Summary</h2>
                    <div className="border rounded-lg">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Employee</TableHead>
                                    <TableHead>Branch</TableHead>
                                    <TableHead className="text-right">Performance</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {loading ? (
                                    Array.from({ length: 5 }).map((_, i) => (
                                        <TableRow key={i}>
                                            <TableCell>
                                                <div className="flex items-center gap-3">
                                                    <Skeleton className="h-8 w-8 rounded-full" />
                                                    <Skeleton className="h-4 w-24" />
                                                </div>
                                            </TableCell>
                                            <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                                            <TableCell className="text-right"><Skeleton className="h-4 w-10 ml-auto" /></TableCell>
                                        </TableRow>
                                    ))
                                ) : (
                                    filteredPerformanceData.map(({ employee, performanceScore }) => (
                                        <TableRow key={employee.id}>
                                            <TableCell>
                                                <div className="flex items-center gap-3">
                                                    <Avatar className="h-8 w-8">
                                                    <AvatarImage src={employee.avatarUrl} alt={employee.name} data-ai-hint="people" />
                                                    <AvatarFallback>{employee.name.charAt(0)}</AvatarFallback>
                                                    </Avatar>
                                                    <div className="font-medium">{employee.name}</div>
                                                </div>
                                            </TableCell>
                                            <TableCell>{employee.branch || 'N/A'}</TableCell>
                                            <TableCell className="text-right font-semibold">{performanceScore}%</TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </div>
                 </div>
                 <div>
                    <h2 className="text-lg font-semibold mb-2">Performance Comparison</h2>
                     <div className="h-[400px]">
                        {loading ? (
                            <Skeleton className="h-full w-full" />
                        ) : (
                            <ChartContainer config={{
                                performance: { label: 'Performance', color: 'hsl(var(--primary))' },
                            }}>
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={filteredPerformanceData} layout="vertical" margin={{ left: 20 }}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis type="number" domain={[0, 100]} tickSuffix="%" />
                                    <YAxis dataKey="employee.name" type="category" width={80} tick={{ fontSize: 12 }} />
                                    <Tooltip
                                        cursor={{fill: 'hsl(var(--muted))'}}
                                        content={<ChartTooltipContent 
                                            formatter={(value) => `${value}%`}
                                            indicator="dot" 
                                        />}
                                    />
                                    <Bar dataKey="performanceScore" name="Performance" radius={4} />
                                </BarChart>
                            </ResponsiveContainer>
                            </ChartContainer>
                        )}
                    </div>
                 </div>
            </CardContent>
        </Card>
    </div>
  )
}
