
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


export default function EmployeeKraPage() {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const id = params.id as string;
  
  // This local state will be temporary. In a real app, this would come from a global store or context.
  const [kras, setKras] = React.useState<KRA[]>(() => {
      // In a real app, you'd fetch this data. Here we simulate it.
      // We check for sessionStorage to persist state across reloads on the client.
      if (typeof window !== 'undefined') {
          const savedKras = sessionStorage.getItem('kraData');
          if (savedKras) {
              return JSON.parse(savedKras, (key, value) => {
                  if (key === 'startDate' || key === 'endDate' || key === 'date') {
                      return new Date(value);
                  }
                  return value;
              });
          }
      }
      return mockKras;
  });

  // Persist state to sessionStorage whenever it changes
  React.useEffect(() => {
    if (typeof window !== 'undefined') {
        sessionStorage.setItem('kraData', JSON.stringify(kras));
    }
  }, [kras]);


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
    setKras((prevKras) => prevKras.filter((kra) => kra.employee.id !== id));
    
    toast({
        title: "Employee Deleted",
        description: "The employee and all their associated KRAs have been removed.",
    });

    router.push('/');
  };
  
  const employees: Employee[] = Array.from(new Map(kras.map(kra => [kra.employee.id, kra.employee])).values());
  const employeeKras = kras.filter((kra) => kra.employee.id === id);
  const employee = employees.find(e => e.id === id);

  return (
    <div className="flex flex-col gap-4">
        <Link href="/" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
            <Button variant="outline" size="sm" className='gap-2'>
                <ArrowLeft className="h-4 w-4" />
                Back to Employees
            </Button>
        </Link>
        {employee && (
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
                                        Key Result Areas
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
        )}
        {!employee && (
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
