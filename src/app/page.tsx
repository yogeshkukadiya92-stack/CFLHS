
'use client';

import * as React from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { AddKraDialog } from '@/components/add-kra-dialog';
import { mockKras } from '@/lib/data';
import Link from 'next/link';
import type { Employee, KRA } from '@/lib/types';


export default function Dashboard() {
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

  const employees: Employee[] = Array.from(new Map(kras.map(kra => [kra.employee.id, kra.employee])).values());

  return (
    <div className="flex flex-col gap-4">
      <Card className="shadow-md">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Employees</CardTitle>
            <CardDescription>
              Select an employee to view their Key Result Areas.
            </CardDescription>
          </div>
          <AddKraDialog onSave={handleSaveKra} employees={employees}>
             <Button>Add KRA</Button>
          </AddKraDialog>
        </CardHeader>
        <CardContent>
           <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {employees.map((employee) => (
                <Link href={`/employees/${employee.id}`} key={employee.id}>
                    <Card className="hover:bg-muted/50 transition-all transform hover:-translate-y-1 shadow-sm hover:shadow-lg">
                        <CardHeader className="flex flex-row items-center gap-4">
                            <Avatar className="h-12 w-12">
                                <AvatarImage src={employee.avatarUrl} alt={employee.name} data-ai-hint="people" />
                                <AvatarFallback>{employee.name.charAt(0)}</AvatarFallback>
                            </Avatar>
                            <div>
                                <CardTitle className="text-lg">{employee.name}</CardTitle>
                                <CardDescription>View KRAs</CardDescription>
                            </div>
                        </CardHeader>
                    </Card>
                </Link>
              ))}
           </div>
        </CardContent>
      </Card>
    </div>
  );
}
