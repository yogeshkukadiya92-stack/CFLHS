
'use client';

import * as React from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { MoreHorizontal, Calendar, CheckCircle, XCircle, Hourglass, Trash2, BadgeDollarSign, Car, Utensils, BedDouble, Edit } from 'lucide-react';
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
import type { Employee, Expense, ExpenseStatus, ExpenseType } from '@/lib/types';
import { cn, ensureDate } from '@/lib/utils';
import { format } from 'date-fns';
import { AddExpenseClaimDialog } from './add-expense-claim-dialog';
import { useToast } from '@/hooks/use-toast';

const statusConfig: Record<ExpenseStatus, { className: string; icon: React.ElementType }> = {
  'Pending': { className: 'bg-yellow-100 text-yellow-800 border-yellow-200', icon: Hourglass },
  'Approved': { className: 'bg-blue-100 text-blue-800 border-blue-200', icon: CheckCircle },
  'Rejected': { className: 'bg-red-100 text-red-800 border-red-200', icon: XCircle },
  'Paid': { className: 'bg-green-100 text-green-800 border-green-200', icon: BadgeDollarSign }
};

const typeConfig: Record<ExpenseType, { icon: React.ElementType }> = {
    'Travel': { icon: Car },
    'Food': { icon: Utensils },
    'Accommodation': { icon: BedDouble },
}

interface ExpenseCardProps {
    expense: Expense;
    employees: Employee[];
    onSave: (expense: Expense) => void;
    onDelete: (id: string) => void;
}

export function ExpenseCard({ expense, employees, onSave, onDelete }: ExpenseCardProps) {
  const { toast } = useToast();
  const StatusIcon = statusConfig[expense.status].icon;
  const TypeIcon = typeConfig[expense.expenseType].icon;

  const handleStatusChange = (expense: Expense, status: ExpenseStatus) => {
    onSave({ ...expense, status });
    toast({
        title: "Status Updated",
        description: `Expense claim for ${expense.employee.name} has been marked as ${status.toLowerCase()}.`
    })
  }

  return (
    <Card className="flex flex-col">
      <CardHeader>
        <div className="flex items-start justify-between">
            <div className='flex items-center gap-3'>
                <Avatar className="h-10 w-10">
                    <AvatarImage src={expense.employee.avatarUrl} alt={expense.employee.name} data-ai-hint="people" />
                    <AvatarFallback>{expense.employee.name.charAt(0)}</AvatarFallback>
                </Avatar>
                <div>
                    <CardTitle className="text-base">{expense.employee.name}</CardTitle>
                    <CardDescription className='text-xs'>{format(ensureDate(expense.date), 'MMM d, yyyy')}</CardDescription>
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
                    <AddExpenseClaimDialog expense={expense} onSave={onSave} employees={employees}>
                    <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                        <Edit className="mr-2 h-4 w-4" /> Edit
                    </DropdownMenuItem>
                </AddExpenseClaimDialog>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => handleStatusChange(expense, 'Approved')} disabled={expense.status === 'Approved' || expense.status === 'Paid'}>
                    <CheckCircle className="mr-2 h-4 w-4 text-blue-500" /> Approve
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleStatusChange(expense, 'Rejected')} disabled={expense.status === 'Rejected'}>
                    <XCircle className="mr-2 h-4 w-4 text-red-500" /> Reject
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleStatusChange(expense, 'Paid')} disabled={expense.status !== 'Approved'}>
                    <BadgeDollarSign className="mr-2 h-4 w-4 text-green-500" /> Mark as Paid
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => onDelete(expense.id)} className="text-destructive">
                    <Trash2 className="mr-2 h-4 w-4" /> Delete
                </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
        </div>
      </CardHeader>
      <CardContent className="flex-grow space-y-2">
         <div className='flex items-center gap-2'>
            <TypeIcon className="h-4 w-4 text-muted-foreground" />
            <span className="font-semibold">{expense.expenseType}</span>
         </div>
        <p className="text-sm text-muted-foreground line-clamp-2">{expense.description}</p>
      </CardContent>
      <CardFooter className="flex justify-between items-center">
        <Badge variant="outline" className={cn('gap-1.5', statusConfig[expense.status].className)}>
            <StatusIcon className="h-3.5 w-3.5" />
            {expense.status}
        </Badge>
        <span className="text-lg font-bold">₹{expense.totalAmount.toLocaleString('en-IN')}</span>
      </CardFooter>
    </Card>
  );
}
