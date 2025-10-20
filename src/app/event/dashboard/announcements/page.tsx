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

  useEffect(() => {
    const fetchAnnouncements = async () => {
      setLoading(true);
      try {
        // Fetch all announcements from the announcements table
        const { data: announcementsData, error: announcementsError } = await supabase
          .from('announcements')
          .select('*')
          .order('created_at', { ascending: false });
        
        if (announcementsError) {
          console.error('Error fetching announcements:', announcementsError);
          throw announcementsError;
        }

        // Map announcements to match the Message interface
        const mappedAnnouncements: Message[] = (announcementsData || []).map((announcement: any) => ({
          id: announcement.id,
          sender_team_id: 1, // Organizer team ID
          receiver_id: null, // Broadcast to all
          content: announcement.message,
          timestamp: announcement.created_at
        }));

        setAnnouncements(mappedAnnouncements);
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

    // Subscribe to new announcements
    const channel = supabase
      .channel('announcements')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'announcements' },
        () => {
          fetchAnnouncements();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

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
