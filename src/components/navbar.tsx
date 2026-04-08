
'use client';

import React from 'react';
import { signOut } from 'firebase/auth';
import { useRouter } from 'next/navigation';
import { useAuth } from './auth-provider';
import { auth } from '@/lib/firebase';
import { Button } from './ui/button';
import { ShieldCheck, Settings, UserRound } from 'lucide-react';
import { Badge } from './ui/badge';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from './ui/sheet';
import { Separator } from './ui/separator';

export const Navbar = () => {
  const { user, currentUser } = useAuth();
  const router = useRouter();

  const handleLogout = async () => {
    await signOut(auth);
    router.push('/login');
  };

  const isAdmin = currentUser?.role === 'Admin';

  return (
    <header className="sticky top-0 z-10 flex h-14 items-center gap-4 border-b bg-background px-4 sm:px-6">
      <div className="flex items-center gap-2">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
          <UserRound className="h-4 w-4" />
        </div>
        <span className="text-sm font-semibold tracking-wide text-slate-700">Habit Share</span>
      </div>
      
      {user && (
        <div className="ml-auto flex items-center gap-4">
            <div className='flex items-center gap-2'>
              <span className="text-sm text-muted-foreground hidden sm:inline font-medium">Welcome, {currentUser?.name || user.email}</span>
              {isAdmin && (
                <Badge variant="secondary" className="gap-1 bg-primary/10 text-primary border-none">
                  <ShieldCheck className="h-3.5 w-3.5" />
                  Admin
                </Badge>
              )}
            </div>
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline" size="sm" className="h-9 rounded-lg font-semibold text-slate-600 border-slate-200">
                <Settings className="mr-2 h-4 w-4" />
                Profile
              </Button>
            </SheetTrigger>
            <SheetContent className="w-[340px] sm:w-[420px]">
              <SheetHeader>
                <SheetTitle>User Information</SheetTitle>
              </SheetHeader>
              <div className="mt-6 space-y-4 text-sm">
                <div className="rounded-lg border bg-slate-50/60 p-4">
                  <p className="text-xs uppercase tracking-wider text-slate-500">Name</p>
                  <p className="mt-1 font-medium text-slate-800">{currentUser?.name || 'N/A'}</p>
                </div>
                <div className="rounded-lg border bg-slate-50/60 p-4">
                  <p className="text-xs uppercase tracking-wider text-slate-500">Email</p>
                  <p className="mt-1 font-medium text-slate-800">{user.email || 'N/A'}</p>
                </div>
                <div className="rounded-lg border bg-slate-50/60 p-4">
                  <p className="text-xs uppercase tracking-wider text-slate-500">Role</p>
                  <p className="mt-1 font-medium text-slate-800">{currentUser?.role || 'Employee'}</p>
                </div>
                <div className="rounded-lg border bg-slate-50/60 p-4">
                  <p className="text-xs uppercase tracking-wider text-slate-500">Branch</p>
                  <p className="mt-1 font-medium text-slate-800">{currentUser?.branch || 'Not set'}</p>
                </div>
                <Separator />
                <div className="rounded-lg border bg-slate-50/60 p-4">
                  <p className="text-xs uppercase tracking-wider text-slate-500">User ID</p>
                  <p className="mt-1 break-all font-mono text-xs text-slate-700">{user.uid}</p>
                </div>
              </div>
            </SheetContent>
          </Sheet>
          <Button onClick={handleLogout} variant="outline" size="sm" className="h-9 rounded-lg font-semibold text-slate-600 border-slate-200">Logout</Button>
        </div>
      )}
    </header>
  );
};
