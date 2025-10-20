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

    async function fetchAnnouncements() {
      try {
        // Fetch broadcast messages sent to this team from organizer (team_id 1)
        const { data: messagesData, error: messagesError } = await supabase
          .from('messages')
          .select('*')
          .eq('sender_team_id', 1) // From organizer
          .eq('receiver_id', currentTeamId) // To this team
          .order('timestamp', { ascending: false });

        if (messagesError) throw messagesError;

        // Group messages by content and timestamp to identify broadcasts
        const groupedMessages = new Map<string, Message>();
        
        messagesData?.forEach((message) => {
          const timestamp = new Date(message.timestamp);
          const groupKey = `${message.content}_${timestamp.getFullYear()}-${timestamp.getMonth()}-${timestamp.getDate()}_${timestamp.getHours()}-${timestamp.getMinutes()}`;
          
          // Keep only one message per broadcast group
          if (!groupedMessages.has(groupKey)) {
            groupedMessages.set(groupKey, message);
          }
        });

        // Convert to array and sort by timestamp
        const uniqueAnnouncements = Array.from(groupedMessages.values())
          .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

        setAnnouncements(uniqueAnnouncements);
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
    }

    fetchAnnouncements();

    // Subscribe to new messages
    const channel = supabase
      .channel('announcements')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'messages' },
        (payload) => {
          const newMsg = payload.new as Message;
          // Only add if it's from organizer to this team
          if (newMsg.sender_team_id === 1 && newMsg.receiver_id === currentTeamId) {
            setAnnouncements(prev => {
              // Check if we already have this message (by content and time)
              const timestamp = new Date(newMsg.timestamp);
              const isDuplicate = prev.some(msg => {
                const msgTimestamp = new Date(msg.timestamp);
                return msg.content === newMsg.content && 
                       Math.abs(msgTimestamp.getTime() - timestamp.getTime()) < 60000; // Within 1 minute
              });
              
              if (!isDuplicate) {
                return [newMsg, ...prev];
              }
              return prev;
            });
          }
        }
      )
      .subscribe();

    return () => {
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
