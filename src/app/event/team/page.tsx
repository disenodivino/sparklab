'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Calendar, 
  Clock, 
  Users, 
  Bell, 
  FileText, 
  Loader2,
  MessageSquare,
  ArrowRight
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { toast } from '@/hooks/use-toast';
import { format, formatDistanceToNow } from 'date-fns';
import UserHeader from '@/components/user-header';
import Footer from '@/components/footer';

interface Checkpoint {
  id: number;
  title: string;
  description: string;
  deadline: string;
}

interface Message {
  id: number;
  content: string;
  sender_team_id: number;
  receiver_id: number;
  timestamp: string;
  sender?: {
    team_name: string;
  };
}

interface Submission {
  id: number;
  checkpoint_id: number;
  file_name: string;
  submitted_at: string;
}

interface Stats {
  upcomingCheckpoints: number;
  teamMembers: number;
  recentAnnouncements: number;
  submissions: number;
}

export default function TeamDashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [stats, setStats] = useState<Stats>({
    upcomingCheckpoints: 0,
    teamMembers: 0,
    recentAnnouncements: 0,
    submissions: 0
  });
  const [checkpoints, setCheckpoints] = useState<Checkpoint[]>([]);
  const [announcements, setAnnouncements] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => {
    // Check authentication
    const userString = localStorage.getItem('user');
    if (!userString) {
      router.push('/event');
      return;
    }

    try {
      const userData = JSON.parse(userString);
      
      // Check if user is organizer (redirect to organizer dashboard)
      if (userData.role === 'organizer') {
        router.push('/event/organizer');
        return;
      }
      
      setUser(userData);
      fetchDashboardData(userData.id);
    } catch (error) {
      console.error('Error parsing user data:', error);
      localStorage.removeItem('user');
      router.push('/event');
    }
  }, [router]);

  const fetchDashboardData = async (teamId: number) => {
    setLoading(true);
    try {
      // Fetch upcoming checkpoints
      const { data: checkpointsData, error: checkpointsError } = await supabase
        .from('checkpoints')
        .select('*')
        .gte('deadline', new Date().toISOString())
        .order('deadline', { ascending: true })
        .limit(5);

      if (checkpointsError) throw checkpointsError;
      
      setCheckpoints(checkpointsData || []);

      // Fetch team members count
      const { count: membersCount, error: membersError } = await supabase
        .from('users')
        .select('*', { count: 'exact', head: true })
        .eq('team_id', teamId);

      if (membersError) throw membersError;

      // Fetch broadcast messages (announcements) from organizer
      // First get organizer team ID
      const { data: organizerData } = await supabase
        .from('teams')
        .select('id')
        .or('role.eq.organizer,team_name.ilike.%organizer%')
        .single();

      let announcementsCount = 0;
      let announcementsList: Message[] = [];
      
      if (organizerData) {
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

        // Get messages from organizer to this team or broadcast messages
        const { data: messagesData, error: messagesError } = await supabase
          .from('messages')
          .select('*, sender:sender_team_id(team_name)')
          .eq('sender_team_id', organizerData.id)
          .or(`receiver_id.eq.${teamId},receiver_id.is.null`)
          .gte('timestamp', sevenDaysAgo.toISOString())
          .order('timestamp', { ascending: false });

        if (!messagesError && messagesData) {
          announcementsCount = messagesData.length;
          announcementsList = messagesData.slice(0, 3);
        }
      }

      setAnnouncements(announcementsList);

      // Fetch submissions count
      const { count: submissionsCount, error: submissionsError } = await supabase
        .from('submissions')
        .select('*', { count: 'exact', head: true })
        .eq('team_id', teamId);

      if (submissionsError) throw submissionsError;

      setStats({
        upcomingCheckpoints: checkpointsData?.length || 0,
        teamMembers: membersCount || 0,
        recentAnnouncements: announcementsCount,
        submissions: submissionsCount || 0
      });

    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      toast({
        title: 'Error',
        description: 'Failed to load dashboard data',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const getTimeRemaining = (deadline: string) => {
    const now = new Date();
    const deadlineDate = new Date(deadline);
    const diffMs = deadlineDate.getTime() - now.getTime();
    const diffHours = Math.ceil(diffMs / (1000 * 60 * 60));
    const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

    if (diffHours < 1) {
      return 'Due soon';
    } else if (diffHours < 24) {
      return `in ${diffHours} hour${diffHours !== 1 ? 's' : ''}`;
    } else if (diffDays === 1) {
      return 'in 1 day';
    } else {
      return `in ${diffDays} days`;
    }
  };

  if (loading || !user) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center bg-background">
        <div className="flex flex-col items-center">
          <Loader2 className="h-10 w-10 animate-spin text-primary" />
          <p className="mt-4">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full bg-background">
      <UserHeader collapsed={collapsed} />
      
      <div className={`pt-20 pb-8 px-6 transition-all duration-300 ${collapsed ? 'ml-20' : 'ml-0'}`}>
        <div className="max-w-7xl mx-auto space-y-8">
          {/* Welcome Section */}
          <div>
            <h1 className="text-4xl font-bold">
              Welcome back, {user.team_name}! 👋
            </h1>
            <p className="text-muted-foreground mt-2">
              Here's an overview of your team's progress and upcoming tasks
            </p>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                <CardTitle className="text-sm font-medium">Checkpoints</CardTitle>
                <Calendar className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{stats.upcomingCheckpoints}</div>
                <p className="text-xs text-muted-foreground mt-1">upcoming deadlines</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                <CardTitle className="text-sm font-medium">Team Members</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{stats.teamMembers}</div>
                <p className="text-xs text-muted-foreground mt-1">in your team</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                <CardTitle className="text-sm font-medium">Announcements</CardTitle>
                <Bell className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{stats.recentAnnouncements}</div>
                <p className="text-xs text-muted-foreground mt-1">in the last 7 days</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                <CardTitle className="text-sm font-medium">Submissions</CardTitle>
                <FileText className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{stats.submissions}</div>
                <p className="text-xs text-muted-foreground mt-1">completed</p>
              </CardContent>
            </Card>
          </div>

          {/* Latest Activity Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Upcoming Checkpoints */}
            <Card>
              <CardHeader>
                <CardTitle>Latest Activity</CardTitle>
                <CardDescription>Recent updates and upcoming deadlines</CardDescription>
              </CardHeader>
              <CardContent>
                {checkpoints.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No upcoming checkpoints</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {checkpoints.slice(0, 3).map((checkpoint) => (
                      <div key={checkpoint.id} className="flex items-start justify-between p-4 border border-secondary/30 rounded-lg hover:bg-secondary/5 transition-colors">
                        <div className="flex-1">
                          <h4 className="font-medium">{checkpoint.title}</h4>
                          <div className="flex items-center gap-2 mt-2 text-sm text-muted-foreground">
                            <Clock className="h-4 w-4" />
                            <span>Due: {format(new Date(checkpoint.deadline), 'M/d/yyyy')}</span>
                          </div>
                        </div>
                        <Badge variant="outline">
                          {getTimeRemaining(checkpoint.deadline)}
                        </Badge>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Latest Announcements */}
            <Card>
              <CardHeader>
                <CardTitle>Latest Updates</CardTitle>
                <CardDescription>Recent announcements and news</CardDescription>
              </CardHeader>
              <CardContent>
                {announcements.length === 0 ? (
                  <div className="text-center py-8">
                    <Bell className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                    <h3 className="font-medium mb-2">Check Announcements</h3>
                    <p className="text-sm text-muted-foreground">
                      Stay updated with the latest news from organizers
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {announcements.map((announcement) => (
                      <div key={announcement.id} className="p-4 border border-secondary/30 rounded-lg hover:bg-secondary/5 transition-colors">
                        <div className="flex items-start gap-3">
                          <MessageSquare className="h-5 w-5 text-primary mt-0.5" />
                          <div className="flex-1">
                            <p className="text-sm">{announcement.content}</p>
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

          {/* Quick Actions */}
          <Card className="bg-blue-500/5 border-blue-500/20">
            <CardHeader>
              <CardTitle className="text-blue-500">Need Help?</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Contact organizers directly for any questions or assistance.
              </p>
              <Button variant="outline" size="sm" className="gap-2">
                Message us here
                <ArrowRight className="h-4 w-4" />
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
