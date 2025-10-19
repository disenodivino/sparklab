'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Calendar, MessageSquare, FileText, Clock, Loader2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { formatDistanceToNow } from 'date-fns';

interface Stats {
  teamsCount: number;
  participantsCount: number;
  checkpointsCount: number;
  nextCheckpointDays: number | null;
  messagesCount: number;
  unreadMessagesCount: number;
  submissionsCount: number;
  pendingSubmissionsCount: number;
}

interface Activity {
  id: number;
  type: 'submission' | 'team' | 'message';
  title: string;
  timestamp: string;
}

interface Checkpoint {
  id: number;
  title: string;
  description: string;
  deadline: string;
  daysRemaining: number;
}

export default function OrganizerDashboardPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [checkpoints, setCheckpoints] = useState<Checkpoint[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchDashboardData() {
      try {
        // Use the API routes to fetch data in parallel
        const [statsResponse, activitiesResponse, checkpointsResponse] = await Promise.all([
          fetch('/api/dashboard/stats'),
          fetch('/api/dashboard/activities'),
          fetch('/api/dashboard/checkpoints')
        ]);
        
        if (!statsResponse.ok) throw new Error('Failed to fetch stats');
        if (!activitiesResponse.ok) throw new Error('Failed to fetch activities');
        if (!checkpointsResponse.ok) throw new Error('Failed to fetch checkpoints');
        
        const { stats: dashboardStats } = await statsResponse.json();
        const { activities: dashboardActivities } = await activitiesResponse.json();
        const { checkpoints: dashboardCheckpoints } = await checkpointsResponse.json();
        
        // Update state with fetched data
        setStats(dashboardStats);
        setActivities(dashboardActivities);
        setCheckpoints(dashboardCheckpoints);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchDashboardData();
  }, []);

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'submission':
        return <FileText className="h-4 w-4" />;
      case 'team':
        return <Users className="h-4 w-4" />;
      case 'message':
        return <MessageSquare className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  const formatTimeAgo = (timestamp: string) => {
    try {
      return formatDistanceToNow(new Date(timestamp), { addSuffix: true });
    } catch (error) {
      return 'recently';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full min-h-[60vh]">
        <div className="flex flex-col items-center">
          <Loader2 className="h-10 w-10 animate-spin text-primary" />
          <p className="mt-4">Loading dashboard data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Organizer Dashboard</h1>
      <p className="text-muted-foreground">Manage teams, checkpoints, and communications for SparkLab event.</p>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">Total Teams</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.teamsCount || 0}</div>
            <p className="text-xs text-muted-foreground">{stats?.participantsCount || 0} participants</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">Upcoming Checkpoints</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.checkpointsCount || 0}</div>
            {stats?.nextCheckpointDays !== null ? (
              <p className="text-xs text-muted-foreground">Next in {stats?.nextCheckpointDays} days</p>
            ) : (
              <p className="text-xs text-muted-foreground">No upcoming checkpoints</p>
            )}
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">Messages</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.messagesCount || 0}</div>
            <p className="text-xs text-muted-foreground">{stats?.unreadMessagesCount || 0} unread</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">Submissions</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.submissionsCount || 0}</div>
            <p className="text-xs text-muted-foreground">{stats?.pendingSubmissionsCount || 0} need review</p>
          </CardContent>
        </Card>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="col-span-1">
          <CardHeader>
            <CardTitle>Recent Activities</CardTitle>
            <CardDescription>Latest activities in the event</CardDescription>
          </CardHeader>
          <CardContent>
            {activities.length === 0 ? (
              <div className="text-center text-muted-foreground py-8">
                No recent activities to display
              </div>
            ) : (
              <div className="space-y-4">
                {activities.map((activity) => (
                  <div key={`${activity.type}-${activity.id}`} className="flex items-center space-x-4">
                    <div className="bg-primary/10 p-2 rounded-full">
                      {getActivityIcon(activity.type)}
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm font-medium">{activity.title}</p>
                      <div className="flex items-center text-xs text-muted-foreground">
                        <Clock className="mr-1 h-3 w-3" /> {formatTimeAgo(activity.timestamp)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
        
        <Card className="col-span-1">
          <CardHeader>
            <CardTitle>Upcoming Deadlines</CardTitle>
            <CardDescription>Next checkpoints and their deadlines</CardDescription>
          </CardHeader>
          <CardContent>
            {checkpoints.length === 0 ? (
              <div className="text-center text-muted-foreground py-8">
                No upcoming deadlines
              </div>
            ) : (
              <div className="space-y-4">
                {checkpoints.map((checkpoint) => (
                  <div key={checkpoint.id} className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">{checkpoint.title}</p>
                      <p className="text-sm text-muted-foreground">
                        {checkpoint.description || 'No description provided'}
                      </p>
                    </div>
                    <div className={`
                      px-2 py-1 rounded text-xs font-medium
                      ${checkpoint.daysRemaining <= 2 
                        ? 'bg-yellow-500/10 text-yellow-500' 
                        : 'bg-green-500/10 text-green-500'}
                    `}>
                      {checkpoint.daysRemaining === 1 
                        ? '1 day left' 
                        : `${checkpoint.daysRemaining} days left`}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}