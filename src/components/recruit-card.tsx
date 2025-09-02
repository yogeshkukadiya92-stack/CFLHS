
'use client';

import * as React from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { MoreHorizontal, Edit, Trash2, CheckCircle, XCircle, Hourglass, Briefcase, UserCheck, Send, MessageSquare } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import type { Recruit, RecruitmentStatus } from '@/lib/types';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { AddRecruitDialog } from './add-recruit-dialog';

const statusConfig: Record<RecruitmentStatus, { className: string; icon: React.ElementType }> = {
  'Applied': { className: 'bg-blue-100 text-blue-800 border-blue-200', icon: Send },
  'Screening': { className: 'bg-yellow-100 text-yellow-800 border-yellow-200', icon: Hourglass },
  'Interview': { className: 'bg-purple-100 text-purple-800 border-purple-200', icon: Briefcase },
  'Second Round': { className: 'bg-indigo-100 text-indigo-800 border-indigo-200', icon: Briefcase },
  'Offered': { className: 'bg-green-100 text-green-800 border-green-200', icon: CheckCircle },
  'Hired': { className: 'bg-green-200 text-green-900 border-green-300 font-semibold', icon: UserCheck },
  'Rejected': { className: 'bg-red-100 text-red-800 border-red-200', icon: XCircle },
  'Comment': { className: 'bg-gray-100 text-gray-800 border-gray-200', icon: MessageSquare },
};

interface RecruitCardProps {
    recruit: Recruit;
    isAdmin: boolean;
    onSave: (recruit: Recruit) => void;
    onDelete: (id: string) => void;
}

export function RecruitCard({ recruit, isAdmin, onSave, onDelete }: RecruitCardProps) {
    const StatusIcon = statusConfig[recruit.status]?.icon || Send;

  return (
    <Card className="flex flex-col">
      <CardHeader>
        <div className="flex items-start justify-between">
            <div className='flex items-center gap-3'>
                <Avatar className="h-10 w-10">
                    <AvatarImage src={recruit.avatarUrl} alt={recruit.name} data-ai-hint="people" />
                    <AvatarFallback>{recruit.name.charAt(0)}</AvatarFallback>
                </Avatar>
                <div>
                    <CardTitle className="text-base">{recruit.name}</CardTitle>
                    <CardDescription className='text-xs'>{recruit.position}</CardDescription>
                </div>
            </div>
             {isAdmin && (
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                    <Button aria-haspopup="true" size="icon" variant="ghost">
                        <MoreHorizontal className="h-4 w-4" />
                        <span className="sr-only">Toggle menu</span>
                    </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <AddRecruitDialog recruit={recruit} onSave={onSave}>
                            <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                                <Edit className="mr-2 h-4 w-4"/> Edit
                            </DropdownMenuItem>
                        </AddRecruitDialog>
                        <DropdownMenuItem onClick={() => onDelete(recruit.id)} className="text-destructive">
                            <Trash2 className="mr-2 h-4 w-4" /> Delete
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            )}
        </div>
      </CardHeader>
      <CardContent className="flex-grow space-y-2 text-sm text-muted-foreground">
        <p>{recruit.email}</p>
        <p>{recruit.phone}</p>
      </CardContent>
      <CardFooter className="flex justify-between items-center">
        <Badge variant="outline" className={cn('gap-1.5', statusConfig[recruit.status]?.className)}>
            <StatusIcon className="h-3.5 w-3.5" />
            {recruit.status}
        </Badge>
        <span className="text-xs text-muted-foreground">Applied: {format(new Date(recruit.appliedDate), 'MMM d, yyyy')}</span>
      </CardFooter>
    </Card>
  );
}
