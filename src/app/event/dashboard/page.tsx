'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, Users, MessageSquare, FileText, Loader2, Bell, Clock } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { toast } from '@/hooks/use-toast';
import Link from 'next/link';
import { formatDistanceToNow } from 'date-fns';

interface User {
  id: number;
  name?: string;
  username?: string;
  team_name?: string;
  role: string;
}

export default function DashboardPage() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    upcomingCheckpoints: 0,
    teamMembers: 0,
    unreadAnnouncements: 0,
    submissions: 0
  });
  const [recentActivity, setRecentActivity] = useState<Array<{
    id: string;
    type: 'checkpoint' | 'announcement' | 'submission';
    title: string;
    description: string;
    timestamp: string;
    icon: any;
  }>>([]);
  const router = useRouter();

  useEffect(() => {
    // Check if user is logged in
    const userString = localStorage.getItem('user');
    if (!userString) {
      toast({
        title: 'Not authenticated',
        description: 'Please log in to access this page',
        variant: 'destructive',
      });
      router.push('/event');
      return;
    }

    try {
      const userData = JSON.parse(userString);
      
      // If user is an organizer, redirect them to the organizer dashboard
      if (userData.role === 'organizer') {
        router.push('/event/organizer');
        return;
      }

      setUser(userData);
      fetchDashboardStats(userData.id);
    } catch (error) {
      console.error('Error parsing user data:', error);
      localStorage.removeItem('user');
      router.push('/event');
    }
  }, [router]);

  async function fetchDashboardStats(teamId: number) {
    try {
      // Fetch upcoming checkpoints count
      const now = new Date().toISOString();
      const { count: checkpointsCount, data: upcomingCheckpoints } = await supabase
        .from('checkpoints')
        .select('*', { count: 'exact' })
        .gte('deadline', now)
        .order('deadline', { ascending: true })
        .limit(3);

      // Fetch team members count
      const { count: membersCount } = await supabase
        .from('users')
        .select('*', { count: 'exact', head: true })
        .eq('team_id', teamId);

      // Fetch announcements count (last 7 days)
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      const { count: announcementsCount, data: recentAnnouncements } = await supabase
        .from('messages')
        .select('*', { count: 'exact' })
        .eq('sender_team_id', 1)
        .is('receiver_id', null)
        .gte('timestamp', sevenDaysAgo.toISOString())
        .order('timestamp', { ascending: false })
        .limit(3);

      setStats({
        upcomingCheckpoints: checkpointsCount || 0,
        teamMembers: membersCount || 0,
        unreadAnnouncements: announcementsCount || 0,
        submissions: 0
      });

      // Build recent activity from checkpoints and announcements
      const activities: Array<{
        id: string;
        type: 'checkpoint' | 'announcement' | 'submission';
        title: string;
        description: string;
        timestamp: string;
        icon: any;
      }> = [];

      // Add checkpoints
      upcomingCheckpoints?.forEach((checkpoint: any) => {
        activities.push({
          id: `checkpoint-${checkpoint.id}`,
          type: 'checkpoint',
          title: checkpoint.title || 'Checkpoint',
          description: `Due: ${new Date(checkpoint.deadline).toLocaleDateString()}`,
          timestamp: checkpoint.deadline,
          icon: Calendar
        });
      });

      // Add announcements
      recentAnnouncements?.forEach((announcement: any) => {
        activities.push({
          id: `announcement-${announcement.id}`,
          type: 'announcement',
          title: 'New Announcement',
          description: announcement.content.substring(0, 60) + (announcement.content.length > 60 ? '...' : ''),
          timestamp: announcement.timestamp,
          icon: Bell
        });
      });

      // Sort by timestamp and take top 5
      activities.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
      setRecentActivity(activities.slice(0, 5));
      
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
    } finally {
      setLoading(false);
    }
  }

  if (loading || !user) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="flex flex-col items-center">
          <Loader2 className="h-10 w-10 animate-spin text-primary" />
          <p className="mt-4">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="p-6">
        <h1 className="text-3xl font-bold mb-2">
          Welcome back, {user.team_name || user.name || user.username}! 👋
        </h1>
        <p className="text-muted-foreground">
          Here's an overview of your team's progress and upcoming tasks
        </p>
      </div>

      {/* Quick Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Link href="/event/dashboard/checkpoints">
          <Card className="hover:border-primary/50 transition-all cursor-pointer hover:shadow-lg">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Checkpoints</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.upcomingCheckpoints}</div>
              <p className="text-xs text-muted-foreground">upcoming deadlines</p>
            </CardContent>
          </Card>
        </Link>

        <Link href="/event/dashboard/team">
          <Card className="hover:border-primary/50 transition-all cursor-pointer hover:shadow-lg">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Team Members</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.teamMembers}</div>
              <p className="text-xs text-muted-foreground">in your team</p>
            </CardContent>
          </Card>
        </Link>

        <Link href="/event/dashboard/announcements">
          <Card className="hover:border-primary/50 transition-all cursor-pointer hover:shadow-lg">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Announcements</CardTitle>
              <Bell className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.unreadAnnouncements}</div>
              <p className="text-xs text-muted-foreground">in the last 7 days</p>
            </CardContent>
          </Card>
        </Link>

        <Link href="/event/dashboard/submissions">
          <Card className="hover:border-primary/50 transition-all cursor-pointer hover:shadow-lg">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Submissions</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.submissions}</div>
              <p className="text-xs text-muted-foreground">completed</p>
            </CardContent>
          </Card>
        </Link>
      </div>

      {/* Recent Activity and Latest Updates */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-primary" />
              Latest Activity
            </CardTitle>
            <CardDescription>Recent updates and upcoming deadlines</CardDescription>
          </CardHeader>
          <CardContent>
            {recentActivity.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Clock className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">No recent activity</p>
              </div>
            ) : (
              <div className="space-y-3">
                {recentActivity.map((activity) => {
                  const Icon = activity.icon;
                  const isCheckpoint = activity.type === 'checkpoint';
                  const isAnnouncement = activity.type === 'announcement';
  
                  return (
                    <div
                      key={activity.id}
                      className={`p-3 rounded-lg border transition-colors ${
                        isCheckpoint
                          ? 'bg-blue-500/5 border-blue-500/20 hover:bg-blue-500/10'
                          : isAnnouncement
                          ? 'bg-yellow-500/5 border-yellow-500/20 hover:bg-yellow-500/10'
                          : 'bg-secondary/20 border-secondary/30 hover:bg-secondary/40'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div className={`p-2 rounded-lg ${
                          isCheckpoint
                            ? 'bg-blue-500/10'
                            : isAnnouncement
                            ? 'bg-yellow-500/10'
                            : 'bg-primary/10'
                        }`}>
                          <Icon className={`h-4 w-4 ${
                            isCheckpoint
                              ? 'text-blue-500'
                              : isAnnouncement
                              ? 'text-yellow-500'
                              : 'text-primary'
                          }`} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm">{activity.title}</p>
                          <p className="text-xs text-muted-foreground mt-0.5 truncate">
                            {activity.description}
                          </p>
                          <p className="text-[10px] text-muted-foreground mt-1">
                            {formatDistanceToNow(new Date(activity.timestamp), { addSuffix: true })}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5 text-yellow-500" />
              Latest Updates
            </CardTitle>
            <CardDescription>Recent announcements and news</CardDescription>
          </CardHeader>
          <CardContent>
            <Link
              href="/event/dashboard/announcements"
              className="block p-4 rounded-lg bg-yellow-500/5 border border-yellow-500/20 hover:bg-yellow-500/10 transition-colors"
            >
              <div className="flex items-start gap-3">
                <MessageSquare className="h-5 w-5 text-yellow-500 mt-0.5" />
                <div className="flex-1">
                  <p className="font-medium mb-1">Check Announcements</p>
                  <p className="text-sm text-muted-foreground">
                    Stay updated with the latest news from organizers
                  </p>
                </div>
              </div>
            </Link>
          </CardContent>
        </Card>
      </div>

      {/* Important Info Banner */}
      <Card className="bg-blue-500/5 border-blue-500/20">
        <CardContent className="p-6">
          <div className="flex items-start gap-4">
            <div className="p-2 rounded-full bg-blue-500/10">
              <MessageSquare className="h-6 w-6 text-blue-500" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-lg mb-2">Need Help?</h3>
              <p className="text-sm text-muted-foreground mb-3">
                Contact organizers directly for any questions or assistance.
              </p>
              <button
                onClick={() => {
                  // Trigger click on the message popup button
                  const messageButton = document.querySelector('button[class*="fixed bottom-6 right-6"]') as HTMLButtonElement;
                  if (messageButton) {
                    messageButton.click();
                  }
                }}
                className="text-sm text-primary hover:underline font-medium cursor-pointer inline-flex items-center gap-1"
              >
                Message us here →
              </button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}