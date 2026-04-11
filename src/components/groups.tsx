'use client';

import * as React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Users, Plus, Settings, Crown, UserPlus, Search, X } from 'lucide-react';
import { HabitShareGroup, GroupMember, HabitShareUser } from '@/lib/types';
import { supabase } from '@/lib/supabase';

interface GroupsProps {
  currentUser: HabitShareUser;
  friends: HabitShareUser[];
  onGroupCreated?: (group: HabitShareGroup) => void;
}

export function Groups({ currentUser, friends, onGroupCreated }: GroupsProps) {
  const [groups, setGroups] = React.useState<HabitShareGroup[]>([]);
  const [groupMembers, setGroupMembers] = React.useState<Record<string, GroupMember[]>>({});
  const [isCreateDialogOpen, setIsCreateDialogOpen] = React.useState(false);
  const [isJoinDialogOpen, setIsJoinDialogOpen] = React.useState(false);
  const [groupName, setGroupName] = React.useState('');
  const [groupDescription, setGroupDescription] = React.useState('');
  const [isPublic, setIsPublic] = React.useState(false);
  const [selectedFriends, setSelectedFriends] = React.useState<string[]>([]);
  const [searchQuery, setSearchQuery] = React.useState('');
  const [loading, setLoading] = React.useState(false);

  React.useEffect(() => {
    loadGroups();
  }, [currentUser.id]);

  const loadGroups = async () => {
    try {
      // Load user's groups
      const { data: userGroups, error: groupsError } = await supabase
        .from('habit_groups')
        .select('*')
        .or(`created_by.eq.${currentUser.id},member_ids.cs.{${currentUser.id}}`);

      if (groupsError) throw groupsError;

      setGroups(userGroups || []);

      // Load members for each group
      const membersMap: Record<string, GroupMember[]> = {};
      for (const group of userGroups || []) {
        const { data: members, error: membersError } = await supabase
          .from('habit_group_members')
          .select('*')
          .eq('group_id', group.id);

        if (!membersError) {
          membersMap[group.id] = members || [];
        }
      }
      setGroupMembers(membersMap);
    } catch (error) {
      console.error('Failed to load groups:', error);
    }
  };

  const createGroup = async () => {
    if (!groupName.trim()) return;

    setLoading(true);
    try {
      const groupId = `group_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      const memberIds = [currentUser.id, ...selectedFriends];

      const groupData = {
        id: groupId,
        name: groupName.trim(),
        description: groupDescription.trim(),
        created_by: currentUser.id,
        created_by_name: currentUser.name,
        created_by_email: currentUser.email,
        member_ids: memberIds,
        member_count: memberIds.length,
        is_public: isPublic,
      };

      const { error: groupError } = await supabase
        .from('habit_groups')
        .insert(groupData);

      if (groupError) throw groupError;

      // Add group members
      const memberInserts = memberIds.map(userId => {
        const friend = friends.find(f => f.id === userId);
        return {
          id: `member_${Date.now()}_${userId}`,
          group_id: groupId,
          user_id: userId,
          user_name: friend?.name || currentUser.name,
          user_email: friend?.email || currentUser.email,
          role: userId === currentUser.id ? 'admin' : 'member',
        };
      });

      const { error: membersError } = await supabase
        .from('habit_group_members')
        .insert(memberInserts);

      if (membersError) throw membersError;

      // Reset form
      setGroupName('');
      setGroupDescription('');
      setIsPublic(false);
      setSelectedFriends([]);
      setIsCreateDialogOpen(false);

      // Reload groups
      await loadGroups();

      // Notify parent
      if (onGroupCreated) {
        onGroupCreated(groupData as HabitShareGroup);
      }
    } catch (error) {
      console.error('Failed to create group:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleFriendSelection = (friendId: string) => {
    setSelectedFriends(prev =>
      prev.includes(friendId)
        ? prev.filter(id => id !== friendId)
        : [...prev, friendId]
    );
  };

  const filteredFriends = friends.filter(friend =>
    friend.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    friend.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <Card className="creative-card border-none bg-[linear-gradient(140deg,rgba(241,245,255,0.95),rgba(255,255,255,0.84))]">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-xl font-black flex items-center gap-2">
                <Users className="h-5 w-5 text-indigo-500" />
                Groups
              </CardTitle>
              <CardDescription>Create groups to share habits and gratitude with multiple friends.</CardDescription>
            </div>
            <div className="flex gap-2">
              <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="bg-indigo-600 hover:bg-indigo-700 text-white shadow-md">
                    <Plus className="h-4 w-4 mr-2" />
                    Create Group
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-md">
                  <DialogHeader>
                    <DialogTitle>Create New Group</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium">Group Name</label>
                      <Input
                        value={groupName}
                        onChange={(e) => setGroupName(e.target.value)}
                        placeholder="Enter group name..."
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium">Description (Optional)</label>
                      <Textarea
                        value={groupDescription}
                        onChange={(e) => setGroupDescription(e.target.value)}
                        placeholder="Describe your group's purpose..."
                        className="mt-1"
                        rows={3}
                      />
                    </div>
                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id="isPublic"
                        checked={isPublic}
                        onChange={(e) => setIsPublic(e.target.checked)}
                        className="rounded"
                      />
                      <label htmlFor="isPublic" className="text-sm">Make group public (anyone can join)</label>
                    </div>
                    <div>
                      <label className="text-sm font-medium">Add Friends</label>
                      <div className="mt-2 space-y-2 max-h-40 overflow-y-auto">
                        <Input
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          placeholder="Search friends..."
                          className="mb-2"
                        />
                        {filteredFriends.map((friend) => (
                          <div
                            key={friend.id}
                            onClick={() => toggleFriendSelection(friend.id)}
                            className={`flex items-center gap-3 p-2 rounded-lg cursor-pointer transition-colors ${
                              selectedFriends.includes(friend.id)
                                ? 'bg-indigo-50 border border-indigo-200'
                                : 'hover:bg-gray-50'
                            }`}
                          >
                            <Avatar className="h-8 w-8">
                              <AvatarImage src={friend.avatarUrl} />
                              <AvatarFallback>{friend.name.charAt(0)}</AvatarFallback>
                            </Avatar>
                            <div className="flex-1">
                              <div className="font-medium text-sm">{friend.name}</div>
                              <div className="text-xs text-gray-500">{friend.email}</div>
                            </div>
                            {selectedFriends.includes(friend.id) && (
                              <div className="text-indigo-600">
                                <UserPlus className="h-4 w-4" />
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                    <div className="flex gap-2 pt-4">
                      <Button
                        onClick={createGroup}
                        disabled={loading || !groupName.trim()}
                        className="flex-1"
                      >
                        {loading ? 'Creating...' : 'Create Group'}
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => setIsCreateDialogOpen(false)}
                        className="flex-1"
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </CardHeader>
      </Card>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {groups.map((group) => {
          const members = groupMembers[group.id] || [];
          const isAdmin = members.find(m => m.userId === currentUser.id)?.role === 'admin';

          return (
            <Card key={group.id} className="creative-card border-none bg-[linear-gradient(145deg,rgba(255,255,255,0.92),rgba(248,250,255,0.84))]">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg font-bold text-slate-900">{group.name}</CardTitle>
                    {group.description && (
                      <CardDescription className="mt-1 text-sm">{group.description}</CardDescription>
                    )}
                  </div>
                  {isAdmin && (
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <Settings className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4 text-slate-400" />
                      <span className="text-slate-600">{group.memberCount} members</span>
                    </div>
                    {isAdmin && (
                      <Badge variant="secondary" className="text-xs">
                        <Crown className="h-3 w-3 mr-1" />
                        Admin
                      </Badge>
                    )}
                  </div>

                  <div className="flex -space-x-2">
                    {members.slice(0, 5).map((member) => (
                      <Avatar key={member.id} className="h-8 w-8 border-2 border-white">
                        <AvatarImage src="" />
                        <AvatarFallback className="text-xs">{member.userName.charAt(0)}</AvatarFallback>
                      </Avatar>
                    ))}
                    {group.memberCount > 5 && (
                      <div className="h-8 w-8 rounded-full bg-slate-200 border-2 border-white flex items-center justify-center">
                        <span className="text-xs font-medium text-slate-600">+{group.memberCount - 5}</span>
                      </div>
                    )}
                  </div>

                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" className="flex-1 text-xs">
                      View Group
                    </Button>
                    <Button size="sm" className="flex-1 text-xs">
                      Share Habit
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {groups.length === 0 && (
        <div className="text-center py-12">
          <Users className="h-12 w-12 text-slate-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-slate-600 mb-2">No groups yet</h3>
          <p className="text-slate-500 mb-4">Create your first group to start sharing habits and gratitude with multiple friends.</p>
          <Button onClick={() => setIsCreateDialogOpen(true)} className="bg-indigo-600 hover:bg-indigo-700">
            <Plus className="h-4 w-4 mr-2" />
            Create Your First Group
          </Button>
        </div>
      )}
    </div>
  );
}