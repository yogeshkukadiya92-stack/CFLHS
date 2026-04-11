'use client';

import * as React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { HeartHandshake, Target, Users, Calendar, MessageCircle } from 'lucide-react';
import { HabitShareGroup, HabitShareHabit, GratitudeEntry, HabitShareUser } from '@/lib/types';
import { HabitCard } from './habit-card';
import { format } from 'date-fns';

interface GroupFeedProps {
  group: HabitShareGroup;
  habits: HabitShareHabit[];
  gratitudeEntries: GratitudeEntry[];
  members: HabitShareUser[];
  currentUser: HabitShareUser;
  currentDate: Date;
  onCheer?: (habitId: string) => void;
  onViewDetails?: (habitId: string) => void;
}

export function GroupFeed({
  group,
  habits,
  gratitudeEntries,
  members,
  currentUser,
  currentDate,
  onCheer,
  onViewDetails,
}: GroupFeedProps) {
  const [activeTab, setActiveTab] = React.useState<'habits' | 'gratitude'>('habits');

  const groupHabits = habits.filter(habit => habit.sharedWithGroups?.includes(group.id));
  const groupGratitude = gratitudeEntries.filter(entry => entry.sharedWithGroups?.includes(group.id));

  const getMemberInfo = (userId: string) => {
    return members.find(member => member.id === userId) || {
      name: 'Unknown',
      email: '',
      avatarUrl: '',
    };
  };

  return (
    <div className="space-y-6">
      {/* Group Header */}
      <Card className="creative-card border-none bg-[linear-gradient(140deg,rgba(241,245,255,0.95),rgba(255,255,255,0.84))]">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl font-black flex items-center gap-3">
                <div className="p-2 bg-indigo-100 rounded-xl">
                  <Users className="h-6 w-6 text-indigo-600" />
                </div>
                {group.name}
              </CardTitle>
              {group.description && (
                <p className="text-slate-600 mt-2">{group.description}</p>
              )}
            </div>
            <Badge variant="secondary" className="text-sm">
              {group.memberCount} members
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex -space-x-2 mb-4">
            {members.slice(0, 8).map((member) => (
              <Avatar key={member.id} className="h-10 w-10 border-2 border-white">
                <AvatarImage src={member.avatarUrl} />
                <AvatarFallback>{member.name.charAt(0)}</AvatarFallback>
              </Avatar>
            ))}
            {group.memberCount > 8 && (
              <div className="h-10 w-10 rounded-full bg-slate-200 border-2 border-white flex items-center justify-center">
                <span className="text-sm font-medium text-slate-600">+{group.memberCount - 8}</span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Tab Navigation */}
      <div className="flex gap-1 p-1 bg-slate-100 rounded-xl w-fit">
        <Button
          variant={activeTab === 'habits' ? 'default' : 'ghost'}
          size="sm"
          onClick={() => setActiveTab('habits')}
          className="rounded-lg"
        >
          <Target className="h-4 w-4 mr-2" />
          Habits ({groupHabits.length})
        </Button>
        <Button
          variant={activeTab === 'gratitude' ? 'default' : 'ghost'}
          size="sm"
          onClick={() => setActiveTab('gratitude')}
          className="rounded-lg"
        >
          <HeartHandshake className="h-4 w-4 mr-2" />
          Gratitude ({groupGratitude.length})
        </Button>
      </div>

      {/* Content */}
      {activeTab === 'habits' ? (
        <div className="space-y-4">
          {groupHabits.length === 0 ? (
            <Card className="creative-card border-none bg-[linear-gradient(145deg,rgba(255,255,255,0.92),rgba(248,250,255,0.84))]">
              <CardContent className="text-center py-12">
                <Target className="h-12 w-12 text-slate-300 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-slate-600 mb-2">No shared habits yet</h3>
                <p className="text-slate-500">Group members haven't shared any habits with the group yet.</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {groupHabits.map((habit) => {
                const member = getMemberInfo(habit.userId);
                return (
                  <div key={habit.id} className="relative">
                    <div className="absolute -top-2 -left-2 z-10">
                      <Avatar className="h-8 w-8 border-2 border-white shadow-sm">
                        <AvatarImage src={member.avatarUrl} />
                        <AvatarFallback className="text-xs">{member.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                    </div>
                    <HabitCard
                      habit={habit}
                      onToggleCheckIn={() => {}}
                      onCheer={onCheer}
                      onViewDetails={onViewDetails}
                      isFriendView={true}
                      currentDate={currentDate}
                      showMemberName={true}
                      memberName={member.name}
                    />
                  </div>
                );
              })}
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {groupGratitude.length === 0 ? (
            <Card className="creative-card border-none bg-[linear-gradient(145deg,rgba(255,255,255,0.92),rgba(248,250,255,0.84))]">
              <CardContent className="text-center py-12">
                <HeartHandshake className="h-12 w-12 text-slate-300 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-slate-600 mb-2">No shared gratitude yet</h3>
                <p className="text-slate-500">Group members haven't shared any gratitude entries with the group yet.</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {groupGratitude.map((entry) => {
                const member = getMemberInfo(entry.userId);
                const entryDate = new Date(entry.entryDate);
                const isToday = format(entryDate, 'yyyy-MM-dd') === format(currentDate, 'yyyy-MM-dd');

                return (
                  <Card key={entry.id} className="creative-card border-none bg-[linear-gradient(145deg,rgba(255,255,255,0.96),rgba(241,245,255,0.86))]">
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <Avatar className="h-10 w-10">
                            <AvatarImage src={member.avatarUrl} />
                            <AvatarFallback>{member.name.charAt(0)}</AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="font-semibold text-slate-900">{member.name}</div>
                            <div className="text-sm text-slate-500 flex items-center gap-2">
                              <Calendar className="h-3 w-3" />
                              {isToday ? 'Today' : format(entryDate, 'MMM d, yyyy')}
                            </div>
                          </div>
                        </div>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MessageCircle className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-slate-700 leading-relaxed whitespace-pre-wrap">{entry.content}</p>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}