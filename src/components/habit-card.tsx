
'use client';

import * as React from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar } from "@/components/ui/calendar";
import type { Habit } from "@/lib/types";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { isSameDay, addDays, isAfter, setHours, setMinutes, setSeconds, isBefore } from 'date-fns';
import { Progress } from './ui/progress';
import { Badge } from './ui/badge';
import { Target } from 'lucide-react';
import { cn, ensureDate } from '@/lib/utils';

interface HabitCardProps {
  habit: Habit;
  onSave: (habit: Habit) => void;
}

export function HabitCard({ habit, onSave }: HabitCardProps) {
  const [month, setMonth] = React.useState<Date>(ensureDate(habit.startDate));
  const [currentTime, setCurrentTime] = React.useState(new Date());

  React.useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000); // Update every minute
    return () => clearInterval(timer);
  }, []);

  const handleDayClick = (day: Date, modifiers: { selected: boolean }) => {
     const startDate = ensureDate(habit.startDate);
     if (isBefore(day, startDate) || isAfter(day, addDays(startDate, habit.goalDays -1))) {
        return;
    }
    
    let updatedCheckIns: Date[];
    if (modifiers.selected) {
      // Deselect the day
      updatedCheckIns = habit.checkIns.map(d => ensureDate(d)).filter(
        (checkedInDate) => !isSameDay(checkedInDate, day)
      );
    } else {
      // Select the day
      updatedCheckIns = [...habit.checkIns.map(d => ensureDate(d)), day];
    }
    onSave({ ...habit, checkIns: updatedCheckIns });
  };
  
  const completedDays = habit.checkIns.filter(d => {
    const checkInDate = ensureDate(d);
    const startDate = ensureDate(habit.startDate);
    return checkInDate >= startDate && checkInDate <= addDays(startDate, habit.goalDays - 1)
  }).length;

  const progress = Math.round((completedDays / habit.goalDays) * 100);
  const daysLeft = habit.goalDays - completedDays;

  const todayCheckedIn = habit.checkIns.some(d => isSameDay(ensureDate(d), currentTime));
  const deadlineTime = habit.deadline || '14:30';
  const [hours, minutes] = deadlineTime.split(':').map(Number);
  const deadline = setSeconds(setMinutes(setHours(new Date(), hours), minutes), 0);

  const isOverdue = isAfter(currentTime, deadline) && !todayCheckedIn && isSameDay(currentTime, new Date());


  return (
    <Card className={cn("flex flex-col transition-colors", isOverdue && "border-destructive")}>
      <CardHeader>
        <div className="flex items-start justify-between">
            <div>
                 <div className="flex items-center gap-2 mb-1">
                    <Target className="h-5 w-5 text-primary" />
                    <CardTitle className="text-lg">{habit.name}</CardTitle>
                </div>
                <CardDescription>{habit.description}</CardDescription>
            </div>
            <div className="flex items-center gap-2">
                <Avatar className="h-8 w-8">
                    <AvatarImage src={habit.employee.avatarUrl} alt={habit.employee.name} data-ai-hint="people" />
                    <AvatarFallback>{habit.employee.name.charAt(0)}</AvatarFallback>
                </Avatar>
            </div>
        </div>
      </CardHeader>
      <CardContent className="flex-grow">
        <Calendar
          mode="multiple"
          selected={habit.checkIns.map(d => ensureDate(d))}
          onDayClick={handleDayClick}
          month={month}
          onMonthChange={setMonth}
          fromDate={ensureDate(habit.startDate)}
          toDate={addDays(ensureDate(habit.startDate), habit.goalDays - 1)}
          className="rounded-md border p-0"
          classNames={{
             day_selected: "bg-primary text-primary-foreground hover:bg-primary/90 focus:bg-primary/90",
             months: "w-full",
             month: "w-full",
             table: "w-full",
             head_row: "w-full flex justify-around",
             row: "w-full flex justify-around mt-1"
          }}
        />
      </CardContent>
      <CardFooter className="flex-col items-start gap-2">
        <div className="w-full">
            <div className="flex justify-between text-sm font-medium mb-1">
                <span>Progress</span>
                <span>{completedDays} / {habit.goalDays} days</span>
            </div>
            <Progress value={progress} className="h-2" />
        </div>
        <div className="flex justify-between w-full text-xs text-muted-foreground">
            <span>Goal: {habit.goalDays} days</span>
             <Badge variant={daysLeft > 0 ? "secondary" : "default"}>
                {daysLeft > 0 ? `${daysLeft} days left` : "Goal Achieved!"}
             </Badge>
        </div>
      </CardFooter>
    </Card>
  );
}
