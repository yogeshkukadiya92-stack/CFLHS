
'use client';

import * as React from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import type { Employee, KRA } from "@/lib/types";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Progress } from './ui/progress';
import { Badge } from './ui/badge';
import { ShieldCheck, Eye } from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import Link from 'next/link';
import { Button } from './ui/button';

interface EmployeeSummary {
    employee: Employee;
    kraCount: number;
    averagePerformance: number;
}

interface EmployeeCardProps {
  summary: EmployeeSummary;
}

export function EmployeeCard({ summary }: EmployeeCardProps) {
    const { employee, kraCount, averagePerformance } = summary;
  return (
    <Card className="flex flex-col">
      <CardHeader>
        <div className="flex items-center gap-4">
            <Avatar className="h-12 w-12">
                <AvatarImage src={employee.avatarUrl} alt={employee.name} data-ai-hint="people" />
                <AvatarFallback>{employee.name.charAt(0)}</AvatarFallback>
            </Avatar>
            <div className='w-full'>
                 <div className='flex items-center gap-2'>
                    <CardTitle className="text-lg leading-tight">{employee.name}</CardTitle>
                    {employee.isManager && (
                        <Tooltip>
                            <TooltipTrigger>
                                <Badge variant="secondary" className="gap-1 px-1.5 py-0.5">
                                    <ShieldCheck className="h-3.5 w-3.5" />
                                </Badge>
                            </TooltipTrigger>
                            <TooltipContent>
                                <p>Branch Manager</p>
                            </TooltipContent>
                        </Tooltip>
                    )}
                 </div>
                <CardDescription>{employee.branch || 'No branch assigned'}</CardDescription>
            </div>
        </div>
      </CardHeader>
      <CardContent className="flex-grow space-y-3">
         <div>
            <div className="flex justify-between items-center mb-1">
                <span className="text-sm font-medium text-muted-foreground">Performance</span>
                <span className="text-sm font-semibold">{averagePerformance}%</span>
            </div>
            <Progress value={averagePerformance} className="h-2" />
        </div>
        <div>
             <span className="text-sm font-medium text-muted-foreground">KRAs Assigned</span>
             <p className='text-xl font-bold'>{kraCount}</p>
        </div>
      </CardContent>
      <CardFooter>
        <Link href={`/employees/${employee.id}`} className='w-full'>
            <Button variant="outline" size="sm" className='w-full'>
                <Eye className="mr-2 h-4 w-4" />
                View Details
            </Button>
        </Link>
      </CardFooter>
    </Card>
  );
}
