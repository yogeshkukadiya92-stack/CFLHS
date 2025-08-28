
'use client';

import * as React from 'react';
import { useParams, useRouter } from 'next/navigation';
import { KraTable } from '@/components/kra-table';
import { mockKras } from '@/lib/data';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import Link from 'next/link';
import { ArrowLeft, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { Employee, KRA } from '@/lib/types';
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


export default function EmployeeKraPage() {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const id = params.id as string;
  
  const [kras, setKras] = React.useState<KRA[]>([]);
  const [loading, setLoading] = React.useState(true);

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

  React.useEffect(() => {
    if (!loading) {
      sessionStorage.setItem('kraData', JSON.stringify(kras));
    }
  }, [kras, loading]);


  const handleSaveKra = (kraToSave: KRA) => {
    setKras((prevKras) => {
      const exists = prevKras.some(k => k.id === kraToSave.id);
      if (exists) {
        return prevKras.map((kra) => (kra.id === kraToSave.id ? kraToSave : kra));
      }
      return [...prevKras, kraToSave];
    });
  };

  const handleDeleteKra = (kraId: string) => {
    setKras((prevKras) => prevKras.filter((kra) => kra.id !== kraId));
  };

  const handleDeleteEmployee = () => {
    const updatedKras = kras.filter(kra => kra.employee.id !== id);
    sessionStorage.setItem('kraData', JSON.stringify(updatedKras));
    
    toast({
        title: "Employee Deleted",
        description: "The employee and all their associated KRAs have been removed.",
    });

    router.push('/employees');
  };
  
  const employees: Employee[] = Array.from(new Map(kras.map(kra => [kra.employee.id, kra.employee])).values());
  const employeeKras = kras.filter((kra) => kra.employee.id === id);
  const employee = employees.find(e => e.id === id);

  if (loading) {
    return (
        <div className="flex flex-col gap-4">
            <Skeleton className="h-9 w-36" />
            <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-3">
                <div className="lg:col-span-2">
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
                <div className="lg:col-span-1">
                    <Card className="shadow-md">
                        <CardHeader>
                           <Skeleton className="h-6 w-48 mb-2" />
                           <Skeleton className="h-4 w-64" />
                        </CardHeader>
                        <CardContent className="flex items-center justify-center h-[250px]">
                             <Skeleton className="h-48 w-48 rounded-full" />
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    )
  }

  return (
    <div className="flex flex-col gap-4">
        <Link href="/employees" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
            <Button variant="outline" size="sm" className='gap-2'>
                <ArrowLeft className="h-4 w-4" />
                Back to Employees
            </Button>
        </Link>
        {employee ? (
            <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-3">
                <div className="lg:col-span-2">
                    <Card className="shadow-md">
                        <CardHeader className="flex flex-row items-center justify-between">
                            <div className="flex items-center gap-4">
                                <Avatar className="h-12 w-12">
                                <AvatarImage src={employee.avatarUrl} alt={employee.name} data-ai-hint="people" />
                                <AvatarFallback>{employee.name.charAt(0)}</AvatarFallback>
                                </Avatar>
                                <div>
                                    <CardTitle>{employee.name}</CardTitle>
                                    <CardDescription>
                                        {employee.branch ? `${employee.branch} Branch` : 'Key Result Areas'}
                                    </CardDescription>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
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
                                        <AlertDialogAction onClick={handleDeleteEmployee} className="bg-destructive hover:bg-destructive/90">Delete</AlertDialogAction>
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
                </div>
                <div className="lg:col-span-1">
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
  );
}
