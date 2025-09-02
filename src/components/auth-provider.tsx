
'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { Skeleton } from './ui/skeleton';
import type { Employee, KRA } from '@/lib/types';
import { mockKras } from '@/lib/data';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  currentUser: Employee | null;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  currentUser: null,
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<Employee | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      if (user) {
        // In a real app, you'd fetch this from your database.
        // For now, we'll find it from mock data.
        const kraData = sessionStorage.getItem('kraData');
        const kras : KRA[] = kraData ? JSON.parse(kraData, (key, value) => {
             if (['startDate', 'endDate', 'dueDate', 'joiningDate', 'birthDate'].includes(key) && value) {
                return new Date(value);
            }
            return value;
        }) : mockKras;

        const employeeData = kras.find((k:any) => k.employee.email === user.email);
        
        if (employeeData) {
            setCurrentUser(employeeData.employee);
        } else {
             // Fallback for users not in KRA data (e.g., new sign-ups)
            const mockAdmin = mockKras.find(k => k.employee.email === 'connect@luvfitnessworld.com');
            if (user.email === 'connect@luvfitnessworld.com' && mockAdmin) {
                setCurrentUser(mockAdmin.employee);
            } else {
                 setCurrentUser({
                    id: user.uid,
                    name: user.displayName || 'New User',
                    email: user.email!,
                    avatarUrl: user.photoURL || `https://placehold.co/32x32.png?text=${user.email![0].toUpperCase()}`,
                    role: 'Employee',
                    permissions: {
                        employees: true, routine_tasks: true, leaves: true, attendance: true, 
                        expenses: true, habit_tracker: true, holidays: true, recruitment: true, hr_calendar: true, settings: false
                    }
                });
            }
        }
      } else {
        setCurrentUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  if (loading) {
    return (
        <div className="flex flex-col h-screen">
            <header className="flex h-14 items-center gap-4 border-b bg-muted/40 px-6">
                 <Skeleton className="h-6 w-40" />
                 <div className="ml-auto">
                    <Skeleton className="h-8 w-20" />
                 </div>
            </header>
            <div className="flex-1 p-6">
                <Skeleton className="h-full w-full" />
            </div>
        </div>
    )
  }

  return <AuthContext.Provider value={{ user, loading, currentUser }}>{children}</AuthContext.Provider>;
};

export const useAuth = () => useContext(AuthContext);
