'use client';

import { useState, useEffect } from 'react';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Bell, RefreshCw, Loader2 } from "lucide-react";
import { format } from 'date-fns';
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabase";

interface Announcement {
  id: number;
  title: string;
  content: string;
  timestamp: string;
  priority: 'low' | 'medium' | 'high';
}

export default function AnnouncementsSection() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  const fetchAnnouncements = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('announcements')
        .select('*')
        .order('timestamp', { ascending: false });
        
      if (error) throw error;
      
      // If no announcements, add sample ones
      if (!data || data.length === 0) {
        const now = new Date();
        
        const yesterday = new Date(now);
        yesterday.setDate(now.getDate() - 1);
        
        const lastWeek = new Date(now);
        lastWeek.setDate(now.getDate() - 7);
        
        const sampleAnnouncements = [
          {
            title: 'Welcome to SparkLab 2025!',
            content: 'We are excited to have you join us for this year\'s innovation challenge. Please review the guidelines and reach out if you have any questions.',
            timestamp: lastWeek.toISOString(),
            priority: 'medium'
          },
          {
            title: 'Mentor Sessions Available',
            content: 'Book your mentor sessions through the portal. Limited slots available on first-come-first-serve basis.',
            timestamp: yesterday.toISOString(),
            priority: 'low'
          },
          {
            title: 'Submission Deadline Extended',
            content: 'Due to multiple requests, we have extended the first checkpoint deadline by 48 hours. Please make sure to submit your work by the new deadline.',
            timestamp: now.toISOString(),
            priority: 'high'
          }
        ];
        
        const { data: newData, error: insertError } = await supabase
          .from('announcements')
          .insert(sampleAnnouncements)
          .select();
          
        if (insertError) throw insertError;
        
        setAnnouncements(newData || []);
      } else {
        setAnnouncements(data);
      }
      
      toast({
        title: "Announcements loaded",
        description: "Successfully loaded announcements",
      });
    } catch (error) {
      console.error('Error fetching announcements:', error);
      toast({
        title: 'Error',
        description: 'Failed to load announcements',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };
  
  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchAnnouncements();
  };
  
  // Priority color mapping
  const priorityColors = {
    low: "bg-blue-500/10 text-blue-500 border-blue-500/20",
    medium: "bg-amber-500/10 text-amber-500 border-amber-500/20",
    high: "bg-red-500/10 text-red-500 border-red-500/20"
  };
  
  // Priority labels
  const priorityLabels = {
    low: "Low Priority",
    medium: "Medium Priority",
    high: "High Priority"
  };
  
  const formatTimestamp = (timestamp: string) => {
    return format(new Date(timestamp), 'MMMM d, yyyy - h:mm a');
  };

  if (loading) {
    return (
      <Card className="border-secondary/30 backdrop-blur-xl bg-black/40 shadow-2xl">
        <CardContent className="p-6">
          <div className="flex flex-col items-center justify-center text-center py-12">
            <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
            <h3 className="font-medium text-lg">Loading announcements...</h3>
            <p className="text-muted-foreground mt-2">Fetching latest updates from organizers</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-secondary/30 backdrop-blur-xl bg-black/40 shadow-2xl">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <div>
          <CardTitle>Announcements</CardTitle>
          <CardDescription>Important updates from the organizers</CardDescription>
        </div>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={handleRefresh} 
          disabled={refreshing}
        >
          <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
          <span className="sr-only">Refresh</span>
        </Button>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {announcements.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-6 text-center">
              <Bell className="h-12 w-12 text-muted-foreground mb-2" />
              <p>No announcements yet.</p>
            </div>
          ) : (
            announcements.map((announcement) => (
              <Card 
                key={announcement.id} 
                className={`border ${priorityColors[announcement.priority]}`}
              >
                <CardContent className="p-4">
                  <div className="flex flex-col gap-2">
                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2">
                      <h3 className="font-medium text-lg">{announcement.title}</h3>
                      <Badge 
                        variant="outline" 
                        className={announcement.priority === 'high' ? 'bg-red-500/10 text-red-500 border-red-500/20' : ''}
                      >
                        {priorityLabels[announcement.priority]}
                      </Badge>
                    </div>
                    <p className="text-sm">{announcement.content}</p>
                    <p className="text-xs text-muted-foreground mt-2">
                      Posted {formatTimestamp(announcement.timestamp)}
                    </p>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}