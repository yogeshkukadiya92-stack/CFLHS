'use client';

import * as React from 'react';
import { format, subDays } from 'date-fns';
import { CalendarDays, Heart, Share2, Trash2 } from 'lucide-react';
import { Button } from './ui/button';
import type { Habit, HabitShareHabit } from '@/lib/types';

type HabitCardHabit = Pick<Habit, 'id' | 'name' | 'description'> & {
  checkIns: Array<Date | string>;
  isShared?: boolean;
  cheers?: number;
};

interface HabitCardProps {
  habit: HabitCardHabit | HabitShareHabit;
  onCheer?: (habitId: string) => void;
  onViewDetails?: (habitId: string) => void;
  onEdit?: (habitId: string) => void;
  onDelete?: (habitId: string) => void;
  isFriendView?: boolean;
  currentDate?: Date;
  showMemberName?: boolean;
  memberName?: string;
}

export function HabitCard({
  habit,
  onCheer,
  onViewDetails,
  onEdit,
  onDelete,
  isFriendView = false,
  currentDate = new Date(),
  showMemberName = false,
  memberName,
}: HabitCardProps) {
  const checkInStrings = React.useMemo(() => {
    // Normalize date strings so older ISO values still match daily keys.
    const normalized = habit.checkIns.map((checkIn) => {
      if (typeof checkIn === 'string') {
        return checkIn.slice(0, 10);
      }
      return format(new Date(checkIn), 'yyyy-MM-dd');
    });
    return Array.from(new Set(normalized));
  }, [habit.checkIns]);

  const last7Days = Array.from({ length: 7 }).map((_, i) => subDays(currentDate, 6 - i));
  const todayKey = format(new Date(), 'yyyy-MM-dd');
  const currentStreak = React.useMemo(() => {
    const dates = new Set(checkInStrings);
    let streak = 0;
    let cursor = currentDate;

    if (dates.has(format(cursor, 'yyyy-MM-dd'))) {
      streak++;
      cursor = subDays(cursor, 1);
    } else {
      cursor = subDays(cursor, 1);
      if (!dates.has(format(cursor, 'yyyy-MM-dd'))) return 0;
    }

    while (dates.has(format(cursor, 'yyyy-MM-dd'))) {
      streak++;
      cursor = subDays(cursor, 1);
    }
    return streak;
  }, [checkInStrings, currentDate]);

  const completionRate = Math.round((checkInStrings.length / Math.max(checkInStrings.length + 2, 5)) * 100);
  const activeDateStr = format(currentDate, 'yyyy-MM-dd');
  const activeIsDone = checkInStrings.includes(activeDateStr);
  const activeIsFuture = activeDateStr > todayKey;

  const openCalendar = () => onViewDetails?.(habit.id);

  const isCheckedIn = (date: Date) => checkInStrings.includes(format(date, 'yyyy-MM-dd'));

  return (
    <button
      type="button"
      className="w-full rounded-2xl border border-slate-200 bg-white px-3 py-3 text-left transition hover:border-slate-300"
      onClick={() => {
        if (!isFriendView) {
          onEdit?.(habit.id);
        } else {
          onViewDetails?.(habit.id);
        }
      }}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex items-center gap-1.5">
            <div className="truncate text-left text-lg font-black text-slate-900">{habit.name}</div>
            {!isFriendView && onDelete ? (
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 rounded-lg text-rose-500 hover:bg-rose-50 hover:text-rose-600"
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(habit.id);
                }}
                title="Delete habit"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            ) : null}
          </div>
          {showMemberName && memberName ? <div className="text-xs font-semibold text-slate-500">By {memberName}</div> : null}
          <div className="mt-1 text-sm font-semibold text-slate-700">
            Streak: +{currentStreak} | Overall: {completionRate}% | {habit.isShared ? 'Shared' : 'Private'}
          </div>
        </div>
        <div className="flex items-center gap-1.5">
          {habit.isShared && !isFriendView ? (
            <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-indigo-100 text-indigo-600">
              <Share2 className="h-3.5 w-3.5" />
            </span>
          ) : null}
          {isFriendView && habit.cheers ? (
            <span className="inline-flex items-center gap-1 rounded-full bg-pink-100 px-2 py-1 text-xs font-bold text-pink-600">
              <Heart className="h-3 w-3 fill-pink-500" />
              {habit.cheers}
            </span>
          ) : null}
        </div>
      </div>

      <div className="mt-3 flex items-center justify-between gap-2">
        <div className="flex gap-1.5 overflow-x-auto">
          {last7Days.map((date) => {
            const checked = isCheckedIn(date);
            const dateKey = format(date, 'yyyy-MM-dd');
            const isFuture = dateKey > todayKey;
            const label = format(date, 'EE').charAt(0);
            return (
              <button
                key={format(date, 'yyyy-MM-dd')}
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  openCalendar();
                }}
                className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-sm font-bold ${
                  checked ? 'bg-emerald-500 text-white' : isFuture ? 'border border-slate-200 bg-white text-slate-400' : 'bg-rose-100 text-rose-500'
                } ${isFriendView ? 'pointer-events-none' : ''}`}
              >
                {label}
              </button>
            );
          })}
        </div>

        <div className="flex items-center gap-2">
          {!isFriendView ? (
            <Button
              size="icon"
              variant="ghost"
              onClick={(e) => {
                e.stopPropagation();
                openCalendar();
              }}
              className={`h-9 w-9 rounded-full border ${
                activeIsDone ? 'border-emerald-500 bg-emerald-50 text-emerald-600' : activeIsFuture ? 'border-slate-200 bg-white text-slate-400' : 'border-rose-200 bg-rose-50 text-rose-500'
              }`}
            >
              <CalendarDays className="h-5 w-5" />
            </Button>
          ) : (
            <Button
              size="sm"
              className="h-9 rounded-xl bg-pink-100 px-3 text-pink-700 hover:bg-pink-200"
              onClick={(e) => {
                e.stopPropagation();
                onCheer?.(habit.id);
              }}
            >
              <Heart className="mr-1.5 h-3.5 w-3.5" />
              Cheer
            </Button>
          )}

        </div>
      </div>
    </button>
  );
}
