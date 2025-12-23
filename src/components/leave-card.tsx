

'use client';

import * as React from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { MoreHorizontal, Calendar, CheckCircle, XCircle, Hourglass, Trash2, Edit } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import type { Employee, Leave, LeaveStatus } from '@/lib/types';
import { cn } from '@/lib/utils';
import { format, differenceInDays } from 'date-fns';
import { AddLeaveRequestDialog } from './add-leave-request-dialog';
import { useToast } from '@/hooks/use-toast';

const statusConfig: Record<LeaveStatus, { className: string; icon: React.ElementType }> = {
  'Pending': { className: 'bg-yellow-100 text-yellow-800 border-yellow-200', icon: Hourglass },
  'Approved': { className: 'bg-green-100 text-green-800 border-green-200', icon: CheckCircle },
  'Rejected': { className: 'bg-red-100 text-red-800 border-red-200', icon: XCircle },
};

interface LeaveCardProps {
    leave: Leave;
    employees: Employee[];
    onSave: (leave: Leave) => void;
    onDelete: (id: string) => void;
}

export function LeaveCard({ leave, employees, onSave, onDelete }: LeaveCardProps) {
  const { toast } = useToast();
  const Icon = statusConfig[leave.status].icon;
  const duration = leave.duration ?? (differenceInDays(leave.endDate, leave.startDate) + 1);

  const handleStatusChange = (leave: Leave, status: LeaveStatus) => {
    onSave({ ...leave, status });
    toast({
        title: "Status Updated",
        description: `Leave request for ${leave.employee.name} has been ${status.toLowerCase()}.`
    })
  }

  return (
    <Card className="flex flex-col">
      <CardHeader>
        <div className="flex items-start justify-between">
            <div className='flex items-center gap-3'>
                <Avatar className="h-10 w-10">
                    <AvatarImage src={leave.employee.avatarUrl} alt={leave.employee.name} data-ai-hint="people" />
                    <AvatarFallback>{leave.employee.name.charAt(0)}</AvatarFallback>
                </Avatar>
                <div>
                    <CardTitle className="text-base">{leave.employee.name}</CardTitle>
                    <CardDescription className='text-xs'>Leave Request</CardDescription>
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
                    <AddLeaveRequestDialog leave={leave} onSave={onSave} employees={employees}>
                    <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                        <Edit className="mr-2 h-4 w-4" /> Edit
                    </DropdownMenuItem>
                </AddLeaveRequestDialog>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => handleStatusChange(leave, 'Approved')} disabled={leave.status === 'Approved'}>
                    <CheckCircle className="mr-2 h-4 w-4 text-green-500" /> Approve
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleStatusChange(leave, 'Rejected')} disabled={leave.status === 'Rejected'}>
                    <XCircle className="mr-2 h-4 w-4 text-red-500" /> Reject
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => onDelete(leave.id)} className="text-destructive">
                    <Trash2 className="mr-2 h-4 w-4" /> Delete
                </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
        </div>
      </CardHeader>
      <CardContent className="flex-grow space-y-2">
         <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Calendar className="h-4 w-4" />
            <span>{format(leave.startDate, 'MMM d')} - {format(leave.endDate, 'MMM d, yyyy')}</span>
        </div>
        <p className="text-sm text-muted-foreground line-clamp-2">"{leave.reason}"</p>
      </CardContent>
      <CardFooter className="flex justify-between items-center">
        <Badge variant="outline" className={cn('gap-1.5', statusConfig[leave.status].className)}>
            <Icon className="h-3.5 w-3.5" />
            {leave.status}
        </Badge>
        <Badge variant="secondary">{duration} day{duration > 1 ? 's' : ''}</Badge>
      </CardFooter>
    </Card>
  );
}
