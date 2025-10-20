'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Bell } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { toast } from '@/hooks/use-toast';
import { formatDistanceToNow } from 'date-fns';

interface Message {
  id: number;
  sender_team_id: number;
  receiver_id: number | null;
  content: string;
  timestamp: string;
}

export default function AnnouncementsPage() {
  const [announcements, setAnnouncements] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentTeamId, setCurrentTeamId] = useState<number | null>(null);
  const [nonOrganizerTeamsCount, setNonOrganizerTeamsCount] = useState<number>(0);

  useEffect(() => {
    // Get current team ID from localStorage
    const userString = localStorage.getItem('user');
    if (userString) {
      try {
        const userData = JSON.parse(userString);
        setCurrentTeamId(userData.id || userData.team_id);
      } catch (error) {
        console.error('Error parsing user data:', error);
      }
    }
  }, []);

  useEffect(() => {
    if (!currentTeamId) return;

    const fetchAnnouncements = async () => {
      setLoading(true);
      try {
        // Count all teams except the organizer (id 1)
        const { data: teamsData, error: teamsError } = await supabase
          .from('teams')
          .select('id');
        if (teamsError) throw teamsError;
        const nonOrganizerTeams = (teamsData || []).filter(t => t.id !== 1);
        const nonOrgCount = nonOrganizerTeams.length;
        setNonOrganizerTeamsCount(nonOrgCount);

        // Fetch all messages sent by organizer to teams
        const { data: orgMessages, error: orgMsgError } = await supabase
          .from('messages')
          .select('id, sender_team_id, receiver_id, content, timestamp')
          .eq('sender_team_id', 1)
          .not('receiver_id', 'is', null)
          .order('timestamp', { ascending: false });
        if (orgMsgError) throw orgMsgError;

        // Group by content + minute and collect unique receivers
        type Group = { key: string; messages: Message[]; receivers: Set<number> };
        const groups = new Map<string, Group>();
        (orgMessages || []).forEach((m) => {
          const ts = new Date(m.timestamp);
          const key = `${m.content.trim()}__${ts.getFullYear()}-${ts.getMonth()}-${ts.getDate()}_${ts.getHours()}-${ts.getMinutes()}`;
          if (!groups.has(key)) {
            groups.set(key, { key, messages: [m as Message], receivers: new Set<number>(m.receiver_id ? [m.receiver_id] : []) });
          } else {
            const g = groups.get(key)!;
            g.messages.push(m as Message);
            if (m.receiver_id) g.receivers.add(m.receiver_id);
          }
        });

        // Keep only groups where the message was sent to ALL non-organizer teams
        const broadcastGroups = Array.from(groups.values()).filter(g => g.receivers.size === nonOrgCount);

        // For each group, pick the message that belongs to this current team
        const result: Message[] = [];
        broadcastGroups.forEach(g => {
          const msgForTeam = g.messages.find(m => m.receiver_id === currentTeamId);
          if (msgForTeam) result.push(msgForTeam);
        });

        // Sort descending by timestamp
        result.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
        setAnnouncements(result);
      } catch (error) {
        console.error('Error fetching announcements:', error);
        toast({
          title: 'Error',
          description: 'Failed to load announcements',
          variant: 'destructive'
        });
      } finally {
        setLoading(false);
      }
    };

    fetchAnnouncements();

    // Subscribe to new messages and recompute (debounced) so we only keep true broadcasts
    let debounceTimer: any;
    const channel = supabase
      .channel('announcements')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'messages' },
        () => {
          clearTimeout(debounceTimer);
          debounceTimer = setTimeout(() => {
            fetchAnnouncements();
          }, 500);
        }
      )
      .subscribe();

    return () => {
      clearTimeout(debounceTimer);
      supabase.removeChannel(channel);
    };
  }, [currentTeamId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full min-h-[60vh]">
        <div className="flex flex-col items-center">
          <Loader2 className="h-10 w-10 animate-spin text-primary" />
          <p className="mt-4">Loading announcements...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Announcements</h1>
        <p className="text-muted-foreground mt-2">Important updates and announcements from the organizers</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5 text-yellow-500" />
            Event Announcements
          </CardTitle>
          <CardDescription>
            Stay updated with the latest announcements
          </CardDescription>
        </CardHeader>
        <CardContent>
          {announcements.length === 0 ? (
            <div className="text-center text-muted-foreground py-12">
              <Bell className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No announcements yet</p>
            </div>
          ) : (
            <div className="space-y-4">
              {announcements.map((announcement) => (
                <div
                  key={announcement.id}
                  className="bg-yellow-500/5 border border-yellow-500/20 rounded-lg p-4"
                >
                  <div className="flex items-start gap-3">
                    <div className="p-2 rounded-full bg-yellow-500/10">
                      <Bell className="h-5 w-5 text-yellow-500" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm whitespace-pre-wrap">{announcement.content}</p>
                      <p className="text-xs text-muted-foreground mt-2">
                        {formatDistanceToNow(new Date(announcement.timestamp), { addSuffix: true })}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
