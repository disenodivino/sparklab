'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Users, Mail, Phone, Loader2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { toast } from '@/hooks/use-toast';

interface Participant {
  id: number;
  name: string;
  email?: string;
  phone?: string;
  role?: string;
  team_id: number;
  created_at?: string;
}

interface TeamData {
  id: number;
  team_name: string;
  created_at?: string;
}

export default function TeamInfoPage() {
  const [team, setTeam] = useState<TeamData | null>(null);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchTeamData() {
      try {
        // Get user data
        const userString = localStorage.getItem('user');
        if (!userString) return;
        
        const userData = JSON.parse(userString);
        const teamId = userData.id;

        // Fetch team information
        const { data: teamData, error: teamError } = await supabase
          .from('teams')
          .select('*')
          .eq('id', teamId)
          .single();

        if (teamError) throw teamError;

        // Fetch team members from users table (maximum 4 members)
        const { data: usersData, error: usersError } = await supabase
          .from('users')
          .select('*')
          .eq('team_id', teamId)
          .order('id', { ascending: true })
          .limit(4);

        if (usersError) {
          console.error('Users error:', usersError);
          setParticipants([]);
        } else {
          // Ensure maximum 4 members
          const limitedUsers = (usersData || []).slice(0, 4);
          setParticipants(limitedUsers);
        }

        setTeam(teamData);
      } catch (error) {
        console.error('Error fetching team data:', error);
        toast({
          title: 'Error',
          description: 'Failed to load team information',
          variant: 'destructive'
        });
      } finally {
        setLoading(false);
      }
    }

    fetchTeamData();
  }, []);

  const getRoleColor = (role?: string) => {
    switch (role?.toLowerCase()) {
      case 'leader':
      case 'team leader':
        return 'bg-blue-500/10 text-blue-500 border-blue-500/20';
      case 'developer':
        return 'bg-green-500/10 text-green-500 border-green-500/20';
      case 'designer':
        return 'bg-purple-500/10 text-purple-500 border-purple-500/20';
      default:
        return 'bg-secondary text-secondary-foreground';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full min-h-[60vh]">
        <div className="flex flex-col items-center">
          <Loader2 className="h-10 w-10 animate-spin text-primary" />
          <p className="mt-4">Loading team information...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Team Information</h1>
        <p className="text-muted-foreground mt-2">View your team details and members</p>
      </div>

      {team && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-2xl">{team.team_name}</CardTitle>
                <CardDescription className="mt-2">Team ID: {team.id}</CardDescription>
              </div>
              <div className="flex items-center gap-2 bg-primary/10 px-4 py-2 rounded-lg">
                <Users className="h-5 w-5 text-primary" />
                <span className="font-medium">{participants.length} Members</span>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {team.created_at && (
              <p className="text-sm text-muted-foreground">
                Team created: {new Date(team.created_at).toLocaleDateString()}
              </p>
            )}
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Team Members</CardTitle>
          <CardDescription>
            Your team members (maximum 4 members per team)
          </CardDescription>
        </CardHeader>
        <CardContent>
          {participants.length === 0 ? (
            <div className="text-center text-muted-foreground py-8">
              No team members added yet
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              {participants.map((participant) => (
                <Card key={participant.id} className="border-secondary/30">
                  <CardContent className="p-6">
                    <div className="flex flex-col items-center text-center">
                      <Avatar className="h-20 w-20 mb-4 border-2 border-primary/20">
                        <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${participant.name}`} alt={participant.name} />
                        <AvatarFallback className="bg-primary/10 text-primary text-xl font-semibold">
                          {participant.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
                        </AvatarFallback>
                      </Avatar>
                      
                      <h3 className="font-semibold text-lg mb-2">{participant.name}</h3>
                      
                      {participant.role && (
                        <Badge 
                          variant="outline" 
                          className={`mb-3 ${getRoleColor(participant.role)}`}
                        >
                          {participant.role}
                        </Badge>
                      )}
                      
                      <div className="space-y-2 w-full mt-2">
                        {participant.email && (
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Mail className="h-4 w-4" />
                            <span className="truncate">{participant.email}</span>
                          </div>
                        )}
                        
                        {participant.phone && (
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Phone className="h-4 w-4" />
                            <span>{participant.phone}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
