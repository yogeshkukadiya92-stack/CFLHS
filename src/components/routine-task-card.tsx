
'use client';

import * as React from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { MoreHorizontal, Flag, Calendar, Edit, Trash2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import type { Employee, RoutineTask, RoutineTaskStatus } from '@/lib/types';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { AddRoutineTaskDialog } from './add-routine-task-dialog';

const statusStyles: Record<RoutineTaskStatus, string> = {
  'To Do': 'bg-gray-100 text-gray-800 border-gray-200',
  'In Progress': 'bg-yellow-100 text-yellow-800 border-yellow-200',
  'Completed': 'bg-green-100 text-green-800 border-green-200',
};

const priorityStyles: Record<'Low' | 'Medium' | 'High', string> = {
    'Low': 'text-gray-500',
    'Medium': 'text-yellow-500',
    'High': 'text-red-500',
}

interface RoutineTaskCardProps {
    task: RoutineTask;
    employees: Employee[];
    onSave: (task: RoutineTask) => void;
    onDelete: (id: string) => void;
}

export function RoutineTaskCard({ task, employees, onSave, onDelete }: RoutineTaskCardProps) {
  
  return (
     <TooltipProvider>
    <Card className="flex flex-col">
      <CardHeader>
        <div className="flex items-start justify-between">
            <div>
                <CardTitle className="text-base line-clamp-1">{task.title}</CardTitle>
                <div className="flex items-center gap-2 mt-1">
                     <Tooltip>
                        <TooltipTrigger>
                           <Flag className={cn("h-4 w-4", priorityStyles[task.priority])} />
                        </TooltipTrigger>
                        <TooltipContent>
                           <p>{task.priority} Priority</p>
                        </TooltipContent>
                    </Tooltip>
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Calendar className="h-3 w-3" />
                        <span>Due: {format(task.dueDate, 'MMM d, yyyy')}</span>
                    </div>
                </div>
            </div>
             <DropdownMenu>
                <DropdownMenuTrigger asChild>
                <Button aria-haspopup="true" size="icon" variant="ghost">
                    <MoreHorizontal className="h-4 w-4" />
                    <span className="sr-only">Toggle menu</span>
                </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                    <AddRoutineTaskDialog task={task} onSave={onSave} employees={employees}>
                        <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                            <Edit className="mr-2 h-4 w-4" /> Edit
                        </DropdownMenuItem>
                    </AddRoutineTaskDialog>
                    <DropdownMenuItem onClick={() => onDelete(task.id)} className="text-destructive">
                        <Trash2 className="mr-2 h-4 w-4" /> Delete
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
        </div>
      </CardHeader>
      <CardContent className="flex-grow space-y-2">
        <p className="text-sm text-muted-foreground line-clamp-2">{task.description}</p>
      </CardContent>
      <CardFooter className="flex justify-between items-center">
         <div className="flex items-center gap-2">
            <Avatar className="h-6 w-6">
                <AvatarImage src={task.employee.avatarUrl} alt={task.employee.name} data-ai-hint="people" />
                <AvatarFallback>{task.employee.name.charAt(0)}</AvatarFallback>
            </Avatar>
            <span className="text-xs font-medium">{task.employee.name}</span>
        </div>
        <Badge variant="outline" className={cn(statusStyles[task.status])}>
            {task.status}
        </Badge>
      </CardFooter>
    </Card>
     </TooltipProvider>
  );
}
