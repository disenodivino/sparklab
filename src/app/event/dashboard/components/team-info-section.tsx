'use client';

import { useState, useEffect } from 'react';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { supabase } from '@/lib/supabase';
import { Loader2 } from 'lucide-react';

interface Team {
  id: string;
  team_name: string;
  description?: string;
  created_at: string;
}

interface TeamInfoSectionProps {
  teamId: string;
}

export default function TeamInfoSection({ teamId }: TeamInfoSectionProps) {
  const [team, setTeam] = useState<Team | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchTeam() {
      try {
        const { data, error } = await supabase
          .from('teams')
          .select('*')
          .eq('id', teamId)
          .single();

        if (error) throw error;
        setTeam(data);
      } catch (error) {
        console.error('Error fetching team:', error);
      } finally {
        setLoading(false);
      }
    }

    if (teamId) {
      fetchTeam();
    }
  }, [teamId]);

  if (loading) {
    return (
      <Card className="border-secondary/30 backdrop-blur-xl bg-black/40 shadow-2xl">
        <CardContent className="flex items-center justify-center p-8">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </CardContent>
      </Card>
    );
  }

  if (!team) {
    return (
      <Card className="border-secondary/30 backdrop-blur-xl bg-black/40 shadow-2xl">
        <CardContent className="p-8">
          <p className="text-center text-muted-foreground">Team information not found</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid gap-6">
      <Card className="border-secondary/30 backdrop-blur-xl bg-black/40 shadow-2xl">
        <CardHeader>
          <CardTitle>Team Information</CardTitle>
          <CardDescription>Your team profile and details</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <h3 className="font-medium text-lg">{team.team_name}</h3>
              <p className="text-sm text-muted-foreground">Team ID: {teamId}</p>
              <Badge variant="outline" className="mt-2">Team</Badge>
            </div>
            
            {team.description && (
              <div className="mt-4">
                <h4 className="text-sm font-medium mb-1">Description</h4>
                <p className="text-sm text-muted-foreground">{team.description}</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
      
      <Card className="border-secondary/30 backdrop-blur-xl bg-black/40 shadow-2xl">
        <CardHeader>
          <CardTitle>Team Members</CardTitle>
          <CardDescription>Members participating in your team</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {/* Placeholder for team members - actual implementation will come later */}
            <Card className="border-secondary/20">
              <CardContent className="p-4">
                <div className="flex items-center space-x-4">
                  <Avatar>
                    <AvatarFallback>T</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium">Team Leader</p>
                    <Badge variant="secondary" className="mt-1">Leader</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="border-secondary/20">
              <CardContent className="p-4">
                <div className="flex items-center space-x-4">
                  <Avatar>
                    <AvatarFallback>M</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium">Team Member</p>
                    <Badge variant="secondary" className="mt-1">Member</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </CardContent>
        <CardFooter>
          <p className="text-sm text-muted-foreground">
            Team members are managed by event organizers. Contact them for any changes.
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}