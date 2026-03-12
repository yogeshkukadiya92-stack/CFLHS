'use client';

import * as React from 'react';
import { useParams, useRouter } from 'next/navigation';
import { KraTable } from '@/components/kra-table';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import Link from 'next/link';
import { ArrowLeft, ShieldCheck, Trash2, Edit, Mail, Home, Calendar as CalendarIcon, Cake, Phone, Sparkles, Loader2, Target, TrendingUp, AlertCircle, Fingerprint } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { Employee, KRA, Branch } from '@/lib/types';
import { AddKraDialog } from '@/components/add-kra-dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { format } from 'date-fns';
import { EditEmployeeDialog } from '@/components/edit-employee-dialog';
import { useDataStore } from '@/hooks/use-data-store';
import { generatePerformanceReview, type PerformanceReviewOutput } from '@/ai/flows/performance-review';


export default function EmployeeKraPage() {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const id = params.id as string;
  
  const { 
    kras, 
    branches, 
    loading, 
    employees,
    handleSaveKra,
    handleDeleteKra,
    handleSaveEmployee,
    handleDeleteEmployee
  } = useDataStore();

  const [aiReview, setAiReview] = React.useState<PerformanceReviewOutput | null>(null);
  const [isGenerating, setIsGenerating] = React.useState(false);


  const handleDelete = () => {
    handleDeleteEmployee(id);
    toast({
        title: "Employee Deleted",
        description: "The employee and all their associated KRAs have been removed.",
    });
    router.push('/');
  };
  
  const employeeKras = kras.filter((kra) => kra.employee.id === id);
  const employee = employees.find(e => e.id === id);

  const isManager = React.useMemo(() => {
    return branches.some(b => b.managerId === id);
  }, [branches, id]);

  const handleGenerateAiReview = async () => {
    if (!employee) return;
    if (employeeKras.length === 0) {
        toast({ title: "No Data", description: "This employee has no KRAs assigned for analysis.", variant: "destructive" });
        return;
    }

    setIsGenerating(true);
    try {
        const input = {
            employeeName: employee.name,
            kraData: employeeKras.map(k => ({
                task: k.taskDescription || 'Unspecified Task',
                progress: k.progress,
                status: k.status,
                marks: (k.marksAchieved || 0) + (k.bonus || 0) - (k.penalty || 0)
            }))
        };
        const result = await generatePerformanceReview(input);
        setAiReview(result);
        toast({ title: "Review Generated", description: "Gemini AI has analyzed the employee performance." });
    } catch (error) {
        console.error("AI Error:", error);
        toast({ title: "AI Error", description: "Failed to generate AI review. Please try again.", variant: "destructive" });
    } finally {
        setIsGenerating(false);
    }
  }

  if (loading) {
    return (
        <div className="flex flex-col gap-4">
            <Skeleton className="h-8 w-32" />
            <Card>
                 <CardHeader className="p-4">
                    <div className="flex items-center gap-3">
                        <Skeleton className="h-10 w-10 rounded-full" />
                        <div>
                            <Skeleton className="h-5 w-24 mb-1" />
                            <Skeleton className="h-3 w-16" />
                        </div>
                    </div>
                </CardHeader>
                <CardContent className='p-4'>
                     <Skeleton className="h-40 w-full" />
                </CardContent>
            </Card>
        </div>
    )
  }

  return (
    <TooltipProvider>
    <div className="flex flex-col gap-3">
        <div className='flex items-center justify-between'>
            <Link href="/">
                <Button variant="ghost" size="sm" className='h-8 gap-1.5 text-xs text-muted-foreground hover:text-foreground'>
                    <ArrowLeft className="h-3.5 w-3.5" /> Back
                </Button>
            </Link>
            {employee && (
                <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" onClick={handleGenerateAiReview} disabled={isGenerating} className="h-8 gap-1.5 text-xs border-primary/30">
                        {isGenerating ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Sparkles className="h-3.5 w-3.5 text-yellow-500" />}
                        AI Review
                    </Button>
                    <AddKraDialog onSave={handleSaveKra} employees={employees}>
                        <Button size="sm" className="h-8 gap-1.5 text-xs">
                            <Target className="h-3.5 w-3.5" /> Add KRA
                        </Button>
                    </AddKraDialog>
                    <EditEmployeeDialog employee={employee} onSave={handleSaveEmployee}>
                        <Button variant="outline" size="icon" className='h-8 w-8'>
                            <Edit className="h-3.5 w-3.5" />
                        </Button>
                    </EditEmployeeDialog>
                    <AlertDialog>
                        <AlertDialogTrigger asChild>
                            <Button variant="destructive" size="icon" className='h-8 w-8'>
                                <Trash2 className="h-3.5 w-3.5" />
                            </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                            <AlertDialogHeader>
                            <AlertDialogTitle>Delete Employee?</AlertDialogTitle>
                            <AlertDialogDescription>This will permanently remove the employee and all associated KRAs.</AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={handleDelete} className="bg-destructive hover:bg-destructive/90">Delete</AlertDialogAction>
                            </AlertDialogFooter>
                        </AlertDialogContent>
                    </AlertDialog>
                </div>
            )}
        </div>

        {employee ? (
            <div className="space-y-4">
                <Card className="shadow-sm overflow-hidden">
                    <CardHeader className="flex flex-row items-center justify-between p-4 bg-slate-50/50">
                        <div className="flex items-center gap-3">
                            <Avatar className="h-10 w-10 border-2 border-white shadow-sm">
                                <AvatarImage src={employee.avatarUrl} alt={employee.name} data-ai-hint="people" />
                                <AvatarFallback>{employee.name.charAt(0)}</AvatarFallback>
                            </Avatar>
                            <div>
                                <div className='flex items-center gap-2'>
                                    <CardTitle className="text-base">{employee.name}</CardTitle>
                                    {isManager && <Badge variant="secondary" className="text-[9px] h-4 px-1">Manager</Badge>}
                                </div>
                                <CardDescription className='flex items-center gap-3 text-[10px]'>
                                    <span className="font-semibold text-primary">{employee.branch || 'No Dept.'}</span>
                                    <span className='font-mono text-muted-foreground'>ID: {employee.id.slice(0,8)}</span>
                                </CardDescription>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="p-0 sm:p-4">
                        <KraTable 
                            kras={employeeKras}
                            employees={employees}
                            onSave={handleSaveKra}
                            onDelete={handleDeleteKra}
                        />
                    </CardContent>
                </Card>

                {aiReview && (
                    <Card className="border-primary/20 bg-primary/5 shadow-inner">
                        <CardHeader className='p-4 pb-2'>
                            <div className='flex items-center justify-between'>
                                <div className='flex items-center gap-2'>
                                    <Sparkles className='h-4 w-4 text-yellow-500' />
                                    <CardTitle className='text-sm'>AI Performance Analysis</CardTitle>
                                </div>
                                <Badge variant="outline" className='bg-background text-[10px] h-5'>{aiReview.overallSentiment}</Badge>
                            </div>
                        </CardHeader>
                        <CardContent className='space-y-3 p-4 pt-2'>
                            <p className='text-[11px] text-muted-foreground leading-relaxed'>{aiReview.summary}</p>
                            <div className='grid md:grid-cols-2 gap-3'>
                                <div className='p-2 rounded-lg bg-green-500/5 border border-green-500/10'>
                                    <h4 className='text-[10px] font-bold text-green-700 mb-1'>Key Strengths</h4>
                                    <ul className='text-[10px] space-y-0.5 list-disc list-inside text-green-800/80'>
                                        {aiReview.strengths.slice(0,3).map((s, i) => <li key={i}>{s}</li>)}
                                    </ul>
                                </div>
                                <div className='p-2 rounded-lg bg-orange-500/5 border border-orange-500/10'>
                                    <h4 className='text-[10px] font-bold text-orange-700 mb-1'>Improvement Areas</h4>
                                    <ul className='text-[10px] space-y-0.5 list-disc list-inside text-orange-800/80'>
                                        {aiReview.areasForImprovement.slice(0,2).map((a, i) => <li key={i}>{a}</li>)}
                                    </ul>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                )}
            </div>
        ) : (
             <Card>
                <CardContent className='p-10 text-center text-muted-foreground text-sm'>
                    Employee not found.
                </CardContent>
            </Card>
        )}
    </div>
    </TooltipProvider>
  );
}
