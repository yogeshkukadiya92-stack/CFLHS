
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
import { KraProgressChart } from '@/components/kra-progress-chart';
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

   const handleDeleteKra = (kraId: string) => {
    // Logic to handle KRA deletion would go here if needed in data store
    console.log("Delete KRA action triggered for", kraId);
  };

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
            <Skeleton className="h-9 w-36" />
            <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-3">
                <div className="lg:col-span-2 space-y-6">
                    <Card className="shadow-md">
                         <CardHeader className="flex flex-row items-center justify-between">
                            <div className="flex items-center gap-4">
                                <Skeleton className="h-12 w-12 rounded-full" />
                                <div>
                                    <Skeleton className="h-6 w-32 mb-2" />
                                    <Skeleton className="h-4 w-24" />
                                </div>
                            </div>
                             <div className="flex items-center gap-2">
                                <Skeleton className="h-10 w-24" />
                                <Skeleton className="h-10 w-10" />
                            </div>
                        </CardHeader>
                        <CardContent>
                             <div className="space-y-4">
                                <Skeleton className="h-12 w-full" />
                                <Skeleton className="h-10 w-full" />
                                <Skeleton className="h-10 w-full" />
                                <Skeleton className="h-10 w-full" />
                             </div>
                        </CardContent>
                    </Card>
                </div>
                <div className="lg:col-span-1 space-y-6">
                    <Card className="shadow-md">
                        <CardHeader>
                           <Skeleton className="h-6 w-48 mb-2" />
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <Skeleton className="h-4 w-full" />
                            <Skeleton className="h-4 w-full" />
                            <Skeleton className="h-4 w-full" />
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    )
  }

  return (
    <TooltipProvider>
    <div className="flex flex-col gap-4">
        <Link href="/" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
            <Button variant="outline" size="sm" className='gap-2'>
                <ArrowLeft className="h-4 w-4" />
                Back to Employees
            </Button>
        </Link>
        {employee ? (
            <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-3">
                <div className="lg:col-span-2 space-y-6">
                    <Card className="shadow-md">
                        <CardHeader className="flex flex-row items-center justify-between">
                            <div className="flex items-center gap-4">
                                <Avatar className="h-12 w-12">
                                <AvatarImage src={employee.avatarUrl} alt={employee.name} data-ai-hint="people" />
                                <AvatarFallback>{employee.name.charAt(0)}</AvatarFallback>
                                </Avatar>
                                <div>
                                    <div className='flex items-center gap-2'>
                                     <CardTitle>{employee.name}</CardTitle>
                                       {isManager && (
                                            <Tooltip>
                                                <TooltipTrigger>
                                                    <Badge variant="secondary" className="gap-1">
                                                        <ShieldCheck className="h-3.5 w-3.5" />
                                                        Manager
                                                    </Badge>
                                                </TooltipTrigger>
                                                <TooltipContent>
                                                    <p>Branch Manager</p>
                                                </TooltipContent>
                                            </Tooltip>
                                        )}
                                    </div>
                                    <CardDescription className='flex flex-col'>
                                        <span>{employee.branch ? `${employee.branch} Branch` : 'No branch assigned'}</span>
                                        <span className='flex items-center gap-1 mt-1 text-[10px] text-muted-foreground font-mono'>
                                            <Fingerprint className='h-3 w-3'/> ID: {employee.id}
                                        </span>
                                    </CardDescription>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <Button variant="outline" onClick={handleGenerateAiReview} disabled={isGenerating} className="gap-2 border-primary/50 hover:bg-primary/5">
                                    {isGenerating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4 text-yellow-500" />}
                                    AI Performance Review
                                </Button>
                                <AddKraDialog onSave={handleSaveKra} employees={employees}>
                                    <Button>Add KRA</Button>
                                </AddKraDialog>
                                <AlertDialog>
                                    <AlertDialogTrigger asChild>
                                        <Button variant="destructive" size="icon">
                                            <Trash2 className="h-4 w-4" />
                                            <span className="sr-only">Delete Employee</span>
                                        </Button>
                                    </AlertDialogTrigger>
                                    <AlertDialogContent>
                                        <AlertDialogHeader>
                                        <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                                        <AlertDialogDescription>
                                            This action cannot be undone. This will permanently delete the
                                            employee and all of their associated KRAs.
                                        </AlertDialogDescription>
                                        </AlertDialogHeader>
                                        <AlertDialogFooter>
                                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                                        <AlertDialogAction onClick={handleDelete} className="bg-destructive hover:bg-destructive/90">Delete</AlertDialogAction>
                                        </AlertDialogFooter>
                                    </AlertDialogContent>
                                </AlertDialog>
                            </div>
                        </CardHeader>
                        <CardContent>
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
                            <CardHeader className='pb-2'>
                                <div className='flex items-center justify-between'>
                                    <div className='flex items-center gap-2'>
                                        <Sparkles className='h-5 w-5 text-yellow-500' />
                                        <CardTitle className='text-lg'>Gemini AI Performance Analysis</CardTitle>
                                    </div>
                                    <Badge variant="outline" className='bg-background font-semibold'>{aiReview.overallSentiment}</Badge>
                                </div>
                            </CardHeader>
                            <CardContent className='space-y-4 pt-4'>
                                <div className='space-y-2'>
                                    <h4 className='font-semibold flex items-center gap-2'><Target className='h-4 w-4 text-primary'/> Summary</h4>
                                    <p className='text-sm text-muted-foreground leading-relaxed'>{aiReview.summary}</p>
                                </div>
                                <div className='grid md:grid-cols-2 gap-4'>
                                    <div className='p-3 rounded-lg bg-green-500/10 border border-green-500/20'>
                                        <h4 className='font-semibold flex items-center gap-2 text-green-700 mb-2'><TrendingUp className='h-4 w-4'/> Key Strengths</h4>
                                        <ul className='text-sm space-y-1 list-disc list-inside text-green-800/80'>
                                            {aiReview.strengths.map((s, i) => <li key={i}>{s}</li>)}
                                        </ul>
                                    </div>
                                    <div className='p-3 rounded-lg bg-orange-500/10 border border-orange-500/20'>
                                        <h4 className='font-semibold flex items-center gap-2 text-orange-700 mb-2'><AlertCircle className='h-4 w-4'/> Areas for Improvement</h4>
                                        <ul className='text-sm space-y-1 list-disc list-inside text-orange-800/80'>
                                            {aiReview.areasForImprovement.map((a, i) => <li key={i}>{a}</li>)}
                                        </ul>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    )}
                </div>
                <div className="lg:col-span-1 space-y-6">
                     <Card>
                        <CardHeader className='flex-row items-center justify-between pb-2'>
                            <CardTitle className='text-base'>
                                Employee Information
                            </CardTitle>
                             <EditEmployeeDialog employee={employee} onSave={handleSaveEmployee}>
                                <Button variant="ghost" size="icon">
                                    <Edit className="h-4 w-4" />
                                </Button>
                            </EditEmployeeDialog>
                        </CardHeader>
                        <CardContent className='text-sm space-y-3 pt-4'>
                            <div className='flex items-center gap-3'>
                                <Mail className="h-4 w-4 text-muted-foreground" />
                                <span>{employee.email || 'Not provided'}</span>
                            </div>
                            <div className='flex items-start gap-3'>
                                <Home className="h-4 w-4 text-muted-foreground mt-1" />
                                <span>{employee.address || 'Not provided'}</span>
                            </div>
                            <div className='flex items-center gap-3'>
                                <Phone className="h-4 w-4 text-muted-foreground" />
                                <span>{`Family: ${employee.familyMobileNumber || 'Not provided'}`}</span>
                            </div>
                            <div className='flex items-center gap-3'>
                                <CalendarIcon className="h-4 w-4 text-muted-foreground" />
                                <span>Joined on {employee.joiningDate ? format(new Date(employee.joiningDate), "MMM d, yyyy") : 'Not provided'}</span>
                            </div>
                            <div className='flex items-center gap-3'>
                                <Cake className="h-4 w-4 text-muted-foreground" />
                                <span>Born on {employee.birthDate ? format(new Date(employee.birthDate), "MMM d, yyyy") : 'Not provided'}</span>
                            </div>
                        </CardContent>
                    </Card>
                    <KraProgressChart kras={employeeKras} />
                </div>
            </div>
        ) : (
             <Card>
                <CardHeader>
                    <CardTitle>Employee Not Found</CardTitle>
                </CardHeader>
                <CardContent>
                    <p>The requested employee could not be found. They may have been deleted.</p>
                </CardContent>
            </Card>
        )}
    </div>
    </TooltipProvider>
  );
}
