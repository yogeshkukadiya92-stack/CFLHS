
'use client';

import * as React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ReceiptText, PlusCircle } from "lucide-react";
import { mockKras, mockExpenses } from '@/lib/data';
import type { Employee, Expense, KRA } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { ExpenseClaimsTable } from '@/components/expense-claims-table';
import { AddExpenseClaimDialog } from '@/components/add-expense-claim-dialog';
import { getMonth, getYear } from 'date-fns';


export default function ExpenseManagementPage() {
    const [kras, setKras] = React.useState<KRA[]>([]);
    const [expenses, setExpenses] = React.useState<Expense[]>([]);
    const [loading, setLoading] = React.useState(true);
    const [statusFilter, setStatusFilter] = React.useState('all');
    const [yearFilter, setYearFilter] = React.useState<string>('all');
    const [monthFilter, setMonthFilter] = React.useState<string>('all');

    const employees: Employee[] = React.useMemo(() => {
        return Array.from(new Map(kras.map(kra => [kra.employee.id, kra.employee])).values());
    }, [kras]);

    React.useEffect(() => {
        try {
            const savedKras = sessionStorage.getItem('kraData');
            if (savedKras) {
                setKras(JSON.parse(savedKras, (key, value) => {
                    if (['startDate', 'endDate', 'dueDate'].includes(key) && value) {
                        return new Date(value);
                    }
                    return value;
                }));
            } else {
                setKras(mockKras);
            }

            const savedExpenses = sessionStorage.getItem('expenseData');
            if (savedExpenses) {
                setExpenses(JSON.parse(savedExpenses, (key, value) => {
                    if (['date'].includes(key) && value) {
                        return new Date(value);
                    }
                    return value;
                }));
            } else {
                setExpenses(mockExpenses);
            }

        } catch (error) {
            console.error("Failed to parse data from sessionStorage", error);
            setKras(mockKras);
            setExpenses(mockExpenses);
        } finally {
            setLoading(false);
        }
    }, []);

    React.useEffect(() => {
        if (!loading) {
            sessionStorage.setItem('expenseData', JSON.stringify(expenses));
        }
    }, [expenses, loading]);

    const handleSaveExpense = (expenseToSave: Expense) => {
        setExpenses((prevExpenses) => {
            const exists = prevExpenses.some(l => l.id === expenseToSave.id);
            if (exists) {
                return prevExpenses.map((expense) => (expense.id === expenseToSave.id ? expenseToSave : expense));
            }
            return [expenseToSave, ...prevExpenses].sort((a,b) => b.date.getTime() - a.date.getTime());
        });
    };

    const handleDeleteExpense = (expenseId: string) => {
        setExpenses((prevExpenses) => prevExpenses.filter((expense) => expense.id !== expenseId));
    };

    const { availableYears, availableMonths } = React.useMemo(() => {
        const years = new Set<number>();
        expenses.forEach(exp => {
            years.add(getYear(new Date(exp.date)));
        });
        const monthMap = [
            'January', 'February', 'March', 'April', 'May', 'June', 
            'July', 'August', 'September', 'October', 'November', 'December'
        ];
        return {
            availableYears: Array.from(years).sort((a,b) => b - a),
            availableMonths: monthMap
        };
    }, [expenses]);

    const filteredExpenses = React.useMemo(() => {
        return expenses.filter(expense => {
            const statusMatch = statusFilter === 'all' || expense.status === statusFilter;
            const yearMatch = yearFilter === 'all' || getYear(new Date(expense.date)) === parseInt(yearFilter);
            const monthMatch = monthFilter === 'all' || getMonth(new Date(expense.date)) === parseInt(monthFilter);
            return statusMatch && yearMatch && monthMatch;
        }).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    }, [expenses, statusFilter, yearFilter, monthFilter]);

    return (
        <div className="flex flex-col gap-4">
            <h1 className="text-2xl font-semibold">Expense Management</h1>
            <Card>
                <CardHeader className="flex flex-row items-center justify-between gap-4">
                    <div className='flex items-center gap-4'>
                        <ReceiptText className="h-8 w-8 text-primary" />
                        <div>
                            <CardTitle>Expense Claims</CardTitle>
                            <CardDescription>
                                Review and manage all employee expense claims.
                            </CardDescription>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <Select value={yearFilter} onValueChange={setYearFilter}>
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
                         <Select value={monthFilter} onValueChange={setMonthFilter}>
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
                         <Select value={statusFilter} onValueChange={setStatusFilter}>
                            <SelectTrigger className="w-[180px]">
                                <SelectValue placeholder="Filter by Status" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Statuses</SelectItem>
                                <SelectItem value="Pending">Pending</SelectItem>
                                <SelectItem value="Approved">Approved</SelectItem>
                                <SelectItem value="Rejected">Rejected</SelectItem>
                                <SelectItem value="Paid">Paid</SelectItem>
                            </SelectContent>
                        </Select>
                        <AddExpenseClaimDialog employees={employees} onSave={handleSaveExpense}>
                            <Button>
                                <PlusCircle className="mr-2 h-4 w-4" />
                                Add Claim
                            </Button>
                        </AddExpenseClaimDialog>
                    </div>
                </CardHeader>
                <CardContent>
                    {loading ? (
                         <div className="space-y-4">
                            <Skeleton className="h-12 w-full" />
                            <Skeleton className="h-10 w-full" />
                            <Skeleton className="h-10 w-full" />
                            <Skeleton className="h-10 w-full" />
                         </div>
                    ) : (
                        <ExpenseClaimsTable
                            expenses={filteredExpenses} 
                            onSave={handleSaveExpense}
                            onDelete={handleDeleteExpense}
                            employees={employees}
                        />
                    )}
                </CardContent>
            </Card>
        </div>
    )
}
