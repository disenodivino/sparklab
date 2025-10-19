'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { useRouter } from 'next/navigation';

interface Participant {
  id: string;
  name: string;
  role: string;
}

interface TeamUser {
  id: number;
  team_name: string;
  username?: string;
  role?: string;
  participants?: Participant[];
}

export default function TeamDashboard() {
  const [user, setUser] = useState<TeamUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // Check if user is logged in
    const storedUser = localStorage.getItem('user');
    
    if (!storedUser) {
      router.push('/event/login');
      return;
    }
    
    try {
      const parsedUser = JSON.parse(storedUser);
      
      if (parsedUser.role !== 'team') {
        // Redirect non-team users
        router.push('/event/login');
        return;
      }
      
      setUser(parsedUser);
    } catch (error) {
      console.error('Failed to parse user data', error);
      router.push('/event/login');
    } finally {
      setIsLoading(false);
    }
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem('user');
    router.push('/event/login');
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin h-12 w-12 border-t-2 border-primary border-opacity-50 rounded-full mx-auto mb-4"></div>
          <p className="text-lg">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4 md:px-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Team Dashboard</h1>
        <div className="space-x-2">
          <Button variant="default" onClick={() => router.push('/event/team/messages')}>Messages</Button>
          <Button variant="outline" onClick={handleLogout}>Logout</Button>
        </div>
      </div>
      
      {user && (
        <>
          <Card className="mb-8 border-secondary/30 glass-navbar-enhanced">
            <CardHeader>
              <CardTitle>Team Information</CardTitle>
              <CardDescription>Your team profile and details</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h3 className="font-medium text-lg">{user.name}</h3>
                  <p className="text-sm text-muted-foreground">Team ID: {user.id}</p>
                  <Badge variant="outline" className="mt-2">Team</Badge>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="border-secondary/30 glass-navbar-enhanced">
            <CardHeader>
              <CardTitle>Team Members</CardTitle>
              <CardDescription>Members participating in your team</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {user.participants && user.participants.length > 0 ? (
                  user.participants.map((participant) => (
                    <Card key={participant.id} className="border-secondary/20">
                      <CardContent className="p-4">
                        <div className="flex items-center space-x-4">
                          <Avatar>
                            <AvatarFallback>{participant.name.charAt(0)}</AvatarFallback>
                          </Avatar>
                            <div>
                              <p className="font-medium">{participant.name}</p>
                              <Badge variant="secondary" className="mt-1">{participant.role}</Badge>
                            </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                ) : (
                  <p>No team members found.</p>
                )}
              </div>
            </CardContent>
            <CardFooter>
              <p className="text-sm text-muted-foreground">
                Team members are managed by event organizers. Contact them for any changes.
              </p>
            </CardFooter>
          </Card>
        </>
      )}
    </div>
  );
}