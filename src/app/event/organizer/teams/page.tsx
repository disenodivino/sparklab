'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/lib/supabase';
import { hashPassword } from '@/lib/crypto';
import { debugUserInsert } from '@/lib/debug-user-ops';
import { checkDatabaseTables } from '@/lib/db-check';
import { PlusCircle, Users, UserPlus, Trash2, Edit, Search, RefreshCw, Loader2 } from 'lucide-react';
import { format } from 'date-fns';

interface Team {
  id: number;
  team_name: string;
  created_at: string;
  members?: number;
  username?: string;
  password_hash?: string;
}

interface Participant {
  id: number;
  name: string;
  team_id: number | null;
  team_name?: string;
  created_at: string;
  role?: string;
}

export default function TeamsPage() {
  const [teams, setTeams] = useState<Team[]>([]);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [isAddingTeamWithParticipants, setIsAddingTeamWithParticipants] = useState(false);
  const [isEditingTeam, setIsEditingTeam] = useState(false);
  const [isEditingParticipant, setIsEditingParticipant] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Edit states
  const [editTeamId, setEditTeamId] = useState<number | null>(null);
  const [editTeamName, setEditTeamName] = useState('');
  const [editParticipantId, setEditParticipantId] = useState<number | null>(null);
  const [editParticipantName, setEditParticipantName] = useState('');
  const [editParticipantTeamId, setEditParticipantTeamId] = useState<number | null>(null);
  
  // Team with participants form state
  const [newTeamData, setNewTeamData] = useState({
    teamName: '',
    username: '',
    password: '',
    participants: [{ name: '' }]
  });
  
  // Function to fetch teams and participants from the database
  const fetchData = async (showLoading = true) => {
    if (showLoading) {
      setIsLoading(true);
    }
    
    try {
      console.log('Fetching teams and participants data...');
      
      // Fetch teams
      const { data: teamsData, error: teamsError } = await supabase
        .from('teams')
        .select('*')
        .order('created_at', { ascending: false });
        
      if (teamsError) throw teamsError;
      
      console.log('Teams fetched:', teamsData?.length || 0);

      // Fetch participants from the participants table
      const { data: participantsData, error: participantsError } = await supabase
        .from('participants')
        .select('*')
        .order('created_at', { ascending: false });
        
      if (participantsError) throw participantsError;
      
      console.log('Participants fetched:', participantsData?.length || 0);
      
      // Count team members and add that info
      const teamsWithMembers = teamsData.map(team => {
        const memberCount = participantsData.filter(p => p.team_id === team.id).length;
        return { ...team, members: memberCount };
      });
      
      // Add team name to participants for display
      const participantsWithTeamNames = participantsData.map(participant => {
        const team = teamsData.find(t => t.id === participant.team_id);
        return {
          ...participant,
          team_name: team ? team.team_name : 'No team'
        };
      });

      setTeams(teamsWithMembers);
      setParticipants(participantsWithTeamNames);
    } catch (error) {
      console.error('Error fetching teams and participants:', error);
      toast({
        title: 'Error',
        description: 'Failed to load teams and participants',
        variant: 'destructive',
      });
    } finally {
      if (showLoading) {
        setIsLoading(false);
      }
    }
  };
  
  // Fetch data on component mount
  useEffect(() => {
    // Check database tables to diagnose any issues
    checkDatabaseTables().then(result => {
      console.log('Database tables check result:', result);
      
      if (!result.usersAccessible) {
        toast({
          title: "Database Warning",
          description: "The users table may not be accessible or properly configured",
          variant: "destructive"
        });
      }
    });
    
    // Fetch team and participant data
    fetchData();
  }, []);
  
  // Add team with participants in a single operation
  const handleAddTeam = async () => {
    // Validate team name, username, and password
    if (!newTeamData.teamName.trim()) {
      toast({
        title: 'Error',
        description: 'Team name cannot be empty',
        variant: 'destructive',
      });
      return;
    }
    
    if (!newTeamData.username.trim()) {
      toast({
        title: 'Error',
        description: 'Team username cannot be empty',
        variant: 'destructive',
      });
      return;
    }
    
    if (!newTeamData.password.trim()) {
      toast({
        title: 'Error',
        description: 'Team password cannot be empty',
        variant: 'destructive',
      });
      return;
    }
    
    // Validate that we have at least one valid participant
    const validParticipants = newTeamData.participants.filter(
      p => p.name.trim()
    );
    
    if (validParticipants.length === 0) {
      toast({
        title: 'Error',
        description: 'Please add at least one participant with a name',
        variant: 'destructive',
      });
      return;
    }
    
    setIsSubmitting(true);
    
    try {      
      // Create the team with username and hashed password
      const { data: teamData, error: teamError } = await supabase
        .from('teams')
        .insert({ 
          team_name: newTeamData.teamName, 
          username: newTeamData.username,
          password_hash: hashPassword(newTeamData.password) // Hash the password before storing
        })
        .select();
      
      if (teamError) throw teamError;
      
      if (!teamData || teamData.length === 0) {
        throw new Error('Failed to create team');
      }
      
      const newTeam = teamData[0];
      const createdParticipants: Participant[] = [];
      
      // Step 2: Create participants for the team and add them to both participants and users tables
      for (const participant of validParticipants) {
        try {
          // Create participant record in the participants table
          const { data: participantData, error: participantError } = await supabase
            .from('participants')
            .insert({
              name: participant.name,
              role: 'participant',
              team_id: newTeam.id,
              created_at: new Date().toISOString()
            })
            .select();
          
          if (participantError) {
            console.error('Error creating participant record:', participantError);
            console.error('Error details:', participantError.message, participantError.details);
            continue;
          }
          
          // Also add the participant to the users table - use debug helper for detailed diagnostics
          console.log(`Adding ${participant.name} to users table with team_id ${newTeam.id}`);
          
          // Try direct insert first
          const { data: userData, error: userError } = await supabase
            .from('users')
            .insert({
              name: participant.name,
              team_id: newTeam.id,
              created_at: new Date().toISOString()
            })
            .select();
          
          // If there's an error, use the debug helper to diagnose
          if (userError) {
            console.error('Error creating user record:', userError);
            console.error('Error details:', userError.message, userError.details);
            
            // Use debug helper to get more information
            const debugResult = await debugUserInsert(supabase, participant.name, newTeam.id);
            console.log('Debug user insert result:', debugResult);
            
            // Continue anyway since the participant was created successfully
          } else {
            console.log('User record created successfully:', userData);
          }
          
          if (participantData && participantData[0]) {
            createdParticipants.push({
              ...participantData[0],
              team_name: newTeam.team_name
            });
          }
        } catch (error) {
          console.error('Error creating participant:', error);
        }
      }
      
      // Reset form
      setNewTeamData({
        teamName: '',
        username: '',
        password: '',
        participants: [{ name: '' }]
      });
      
      setIsAddingTeamWithParticipants(false);
      
      // Refresh data from the server to ensure we have the latest state
      await fetchData(false); // Don't show loading state during this refresh
      
      toast({
        title: 'Success',
        description: `Team "${newTeamData.teamName}" created with ${createdParticipants.length} participants`,
      });
      
    } catch (error) {
      console.error('Error creating team with participants:', error);
      let errorMessage = 'Failed to create team with participants';
      
      if (error instanceof Error) {
        errorMessage = `Error: ${error.message}`;
      }
      
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Helper functions for managing participants in the new team form
  const addParticipantField = () => {
    setNewTeamData({
      ...newTeamData,
      participants: [...newTeamData.participants, { name: '' }]
    });
  };
  
  const removeParticipantField = (index: number) => {
    const updatedParticipants = [...newTeamData.participants];
    updatedParticipants.splice(index, 1);
    setNewTeamData({
      ...newTeamData,
      participants: updatedParticipants.length ? updatedParticipants : [{ name: '' }]
    });
  };
  
  const updateParticipantField = (index: number, field: 'name', value: string) => {
    const updatedParticipants = [...newTeamData.participants];
    updatedParticipants[index] = { ...updatedParticipants[index], [field]: value };
    setNewTeamData({
      ...newTeamData,
      participants: updatedParticipants
    });
  };
  
  const filteredTeams = teams.filter(team => 
    team.team_name.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  const filteredParticipants = participants.filter(participant => 
    participant.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (participant.team_name && participant.team_name.toLowerCase().includes(searchQuery.toLowerCase()))
  );
  
  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Teams & Participants</h1>
          <p className="text-muted-foreground">Manage teams and participants for the event</p>
        </div>
        
        <div className="flex items-center gap-2">
          <Button 
            variant="outline"
            onClick={() => {
              toast({
                title: "Refreshing data",
                description: "Fetching latest teams and participants data"
              });
              fetchData();
            }}
            disabled={isLoading}
          >
            <RefreshCw className={`mr-2 h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
            Refresh
          </Button>
          
          <Button
            variant="outline" 
            className="border-amber-500 text-amber-500 hover:bg-amber-500/10"
            onClick={async () => {
              try {
                toast({
                  title: "Checking database",
                  description: "Verifying table structure..."
                });
                
                const response = await fetch('/api/debug/check-tables');
                const result = await response.json();
                
                console.log('Database check result:', result);
                
                if (result.success) {
                  toast({
                    title: "Database check completed",
                    description: result.message,
                  });
                } else {
                  toast({
                    title: "Database check failed",
                    description: result.error || "Unknown error",
                    variant: "destructive"
                  });
                }
              } catch (error) {
                console.error('Error checking database:', error);
                toast({
                  title: "Error",
                  description: "Failed to check database structure",
                  variant: "destructive"
                });
              }
            }}
          >
            <span className="text-xs">Check DB</span>
          </Button>
          
          <Dialog open={isAddingTeamWithParticipants} onOpenChange={setIsAddingTeamWithParticipants}>
            <DialogTrigger asChild>
              <Button>
                <PlusCircle className="mr-2 h-4 w-4" />
                Add Team
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[700px]">
              <DialogHeader>
                <DialogTitle>Add New Team with Participants</DialogTitle>
                <DialogDescription>
                  Create a new team and add participants all at once.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-6 py-4 max-h-[60vh] overflow-y-auto">
                {/* Team Information */}
                <div className="space-y-2">
                  <Label htmlFor="unified-team-name" className="text-lg font-medium">Team Information</Label>
                  <div className="pl-2 border-l-2 border-primary/50 space-y-4">
                    <div className="grid gap-2">
                      <Label htmlFor="unified-team-name">Team Name</Label>
                      <Input 
                        id="unified-team-name" 
                        value={newTeamData.teamName}
                        onChange={(e) => setNewTeamData({...newTeamData, teamName: e.target.value})}
                        placeholder="Enter team name"
                      />
                    </div>
                    
                    <div className="grid gap-2">
                      <Label htmlFor="team-username">Team Username</Label>
                      <Input 
                        id="team-username" 
                        value={newTeamData.username}
                        onChange={(e) => setNewTeamData({...newTeamData, username: e.target.value})}
                        placeholder="Enter login username"
                      />
                    </div>
                    
                    <div className="grid gap-2">
                      <Label htmlFor="team-password">Team Password</Label>
                      <Input 
                        id="team-password"
                        type="password" 
                        value={newTeamData.password}
                        onChange={(e) => setNewTeamData({...newTeamData, password: e.target.value})}
                        placeholder="Enter login password"
                      />
                    </div>
                  </div>
                </div>
                
                {/* Participants Section */}
                <div className="space-y-4">
                  <Label className="text-lg font-medium">Participants</Label>
                  <div className="space-y-6">
                    {newTeamData.participants.map((participant, index) => (
                      <div key={index} className="pl-2 border-l-2 border-primary/50 pt-2 pb-4 space-y-4">
                        <div className="flex justify-between items-center">
                          <Label className="font-medium">Participant {index + 1}</Label>
                          {newTeamData.participants.length > 1 && (
                            <Button 
                              size="sm" 
                              variant="ghost" 
                              className="h-8 px-2 text-red-500"
                              onClick={() => removeParticipantField(index)}
                            >
                              <Trash2 className="h-4 w-4" />
                              <span className="ml-1">Remove</span>
                            </Button>
                          )}
                        </div>
                        
                        <div className="space-y-3">
                          <div className="grid gap-2">
                            <Label htmlFor={`participant-${index}-name`}>Name</Label>
                            <Input 
                              id={`participant-${index}-name`} 
                              value={participant.name}
                              onChange={(e) => updateParticipantField(index, 'name', e.target.value)}
                              placeholder="Enter full name"
                            />
                          </div>
                          

                        </div>
                      </div>
                    ))}
                    
                    <Button 
                      type="button" 
                      variant="outline" 
                      className="w-full"
                      onClick={addParticipantField}
                    >
                      <PlusCircle className="mr-2 h-4 w-4" />
                      Add Another Participant
                    </Button>
                  </div>
                </div>
              </div>
              
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsAddingTeamWithParticipants(false)} disabled={isSubmitting}>Cancel</Button>
                <Button onClick={handleAddTeam} disabled={isSubmitting}>
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    'Create Team'
                  )}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>
      
      <div className="flex items-center">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search teams or participants..."
            className="pl-9"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>
      
      <Tabs defaultValue="teams" className="w-full">
        <TabsList>
          <TabsTrigger value="teams" className="flex items-center">
            <Users className="mr-2 h-4 w-4" />
            Teams ({teams.length})
          </TabsTrigger>
          <TabsTrigger value="participants" className="flex items-center">
            <UserPlus className="mr-2 h-4 w-4" />
            Participants ({participants.length})
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="teams" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Teams</CardTitle>
              <CardDescription>List of all registered teams</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <table className="w-full">
                  <thead>
                    <tr className="border-b bg-secondary/20">
                      <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">ID</th>
                      <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Name</th>
                      <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Created</th>
                      <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Members</th>
                      <th className="h-12 px-4 text-right align-middle font-medium text-muted-foreground">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredTeams.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="p-4 text-center text-muted-foreground">
                          No teams found
                        </td>
                      </tr>
                    ) : (
                      filteredTeams.map((team) => (
                        <tr key={team.id} className="border-b">
                          <td className="p-4 align-middle">{team.id}</td>
                          <td className="p-4 align-middle font-medium">{team.team_name}</td>
                          <td className="p-4 align-middle">{team.created_at}</td>
                          <td className="p-4 align-middle">{team.members}</td>
                          <td className="p-4 align-middle text-right">
                            <div className="flex justify-end gap-2">
                              <Button 
                                size="sm" 
                                variant="ghost"
                                onClick={() => {
                                  setEditTeamId(team.id);
                                  setEditTeamName(team.team_name);
                                  setIsEditingTeam(true);
                                }}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button 
                                size="sm" 
                                variant="ghost" 
                                className="text-red-500 hover:text-red-700"
                                onClick={async () => {
                                  if (window.confirm(`Are you sure you want to delete ${team.team_name}?`)) {
                                    setIsSubmitting(true);
                                    try {
                                      // First check if there are participants in this team
                                      const teamParticipants = participants.filter(p => p.team_id === team.id);
                                      
                                      if (teamParticipants.length > 0) {
                                        toast({
                                          title: 'Error',
                                          description: `Cannot delete team with ${teamParticipants.length} participants. Please reassign or remove participants first.`,
                                          variant: 'destructive',
                                        });
                                        return;
                                      }
                                      
                                      const { error } = await supabase
                                        .from('teams')
                                        .delete()
                                        .eq('id', team.id);
                                      
                                      if (error) throw error;
                                      
                                      setTeams(teams.filter(t => t.id !== team.id));
                                      
                                      toast({
                                        title: 'Success',
                                        description: 'Team deleted successfully',
                                      });
                                    } catch (error) {
                                      console.error('Error deleting team:', error);
                                      toast({
                                        title: 'Error',
                                        description: 'Failed to delete team',
                                        variant: 'destructive',
                                      });
                                    } finally {
                                      setIsSubmitting(false);
                                    }
                                  }
                                }}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="participants" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Participants</CardTitle>
              <CardDescription>List of all registered participants</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <table className="w-full">
                  <thead>
                    <tr className="border-b bg-secondary/20">
                      <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">ID</th>
                      <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Name</th>
                      <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Team</th>
                      <th className="h-12 px-4 text-right align-middle font-medium text-muted-foreground">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredParticipants.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="p-4 text-center text-muted-foreground">
                          No participants found
                        </td>
                      </tr>
                    ) : (
                      filteredParticipants.map((participant) => (
                        <tr key={participant.id} className="border-b">
                          <td className="p-4 align-middle">{participant.id}</td>
                          <td className="p-4 align-middle font-medium">{participant.name}</td>
                          <td className="p-4 align-middle">{participant.team_name || 'No team'}</td>
                          <td className="p-4 align-middle text-right">
                            <div className="flex justify-end gap-2">
                              <Button 
                                size="sm" 
                                variant="ghost"
                                onClick={() => {
                                  setEditParticipantId(participant.id);
                                  setEditParticipantName(participant.name);
                                  setEditParticipantTeamId(participant.team_id);
                                  setIsEditingParticipant(true);
                                }}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button 
                                size="sm" 
                                variant="ghost" 
                                className="text-red-500 hover:text-red-700"
                                onClick={async () => {
                                  if (window.confirm(`Are you sure you want to delete ${participant.name}?`)) {
                                    setIsSubmitting(true);
                                    try {
                                      // Delete participant from the participants table
                                      const { error } = await supabase
                                        .from('participants')
                                        .delete()
                                        .eq('id', participant.id);
                                      
                                      if (error) throw error;
                                      
                                      // Also delete from users table where name and team_id match
                                      const { error: userError } = await supabase
                                        .from('users')
                                        .delete()
                                        .match({ 
                                          name: participant.name, 
                                          team_id: participant.team_id 
                                        });
                                      
                                      if (userError) {
                                        console.error('Error deleting user record:', userError);
                                        // Continue anyway as the participant was deleted
                                      }
                                      
                                      // Update local state
                                      setParticipants(participants.filter(p => p.id !== participant.id));
                                      
                                      // Update team members count if the participant was in a team
                                      if (participant.team_id) {
                                        setTeams(teams.map(team => 
                                          team.id === participant.team_id 
                                            ? { ...team, members: (team.members || 1) - 1 }
                                            : team
                                        ));
                                      }
                                      
                                      toast({
                                        title: 'Success',
                                        description: 'Participant deleted successfully',
                                      });
                                    } catch (error) {
                                      console.error('Error deleting participant:', error);
                                      toast({
                                        title: 'Error',
                                        description: 'Failed to delete participant',
                                        variant: 'destructive',
                                      });
                                    } finally {
                                      setIsSubmitting(false);
                                    }
                                  }
                                }}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      
      {/* Edit Team Dialog */}
      <Dialog open={isEditingTeam} onOpenChange={setIsEditingTeam}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Team</DialogTitle>
            <DialogDescription>
              Update team information
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="editTeamName">Team Name</Label>
              <Input
                id="editTeamName"
                value={editTeamName}
                onChange={(e) => setEditTeamName(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setIsEditingTeam(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button 
              onClick={async () => {
                if (!editTeamName.trim()) {
                  toast({
                    title: 'Error',
                    description: 'Team name cannot be empty',
                    variant: 'destructive',
                  });
                  return;
                }
                
                setIsSubmitting(true);
                
                try {
                  const { error } = await supabase
                    .from('teams')
                    .update({ team_name: editTeamName })
                    .eq('id', editTeamId);
                  
                  if (error) throw error;
                  
                  // Update local state
                  setTeams(teams.map(team => 
                    team.id === editTeamId 
                      ? { ...team, team_name: editTeamName }
                      : team
                  ));
                  
                  // Update team name in participants display
                  setParticipants(participants.map(p => 
                    p.team_id === editTeamId
                      ? { ...p, team_name: editTeamName }
                      : p
                  ));
                  
                  setIsEditingTeam(false);
                  
                  toast({
                    title: 'Success',
                    description: 'Team updated successfully',
                  });
                } catch (error) {
                  console.error('Error updating team:', error);
                  toast({
                    title: 'Error',
                    description: 'Failed to update team',
                    variant: 'destructive',
                  });
                } finally {
                  setIsSubmitting(false);
                }
              }}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                'Save Changes'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Participant Dialog */}
      <Dialog open={isEditingParticipant} onOpenChange={setIsEditingParticipant}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Participant</DialogTitle>
            <DialogDescription>
              Update participant information
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="editParticipantName">Name</Label>
              <Input
                id="editParticipantName"
                value={editParticipantName}
                onChange={(e) => setEditParticipantName(e.target.value)}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="editParticipantTeam">Team</Label>
              <select
                id="editParticipantTeam"
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                value={editParticipantTeamId || ""}
                onChange={(e) => setEditParticipantTeamId(e.target.value ? Number(e.target.value) : null)}
              >
                <option value="">No team</option>
                {teams.map((team) => (
                  <option key={team.id} value={team.id}>
                    {team.team_name}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setIsEditingParticipant(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button 
              onClick={async () => {
                if (!editParticipantName.trim()) {
                  toast({
                    title: 'Error',
                    description: 'Participant name cannot be empty',
                    variant: 'destructive',
                  });
                  return;
                }
                
                setIsSubmitting(true);
                
                try {
                  // Get the old participant data to check if team changed
                  const oldParticipant = participants.find(p => p.id === editParticipantId);
                  const oldTeamId = oldParticipant?.team_id;
                  
                  // Update participant in the database
                  const { error } = await supabase
                    .from('participants')
                    .update({ 
                      name: editParticipantName,
                      team_id: editParticipantTeamId
                    })
                    .eq('id', editParticipantId);
                  
                  if (error) throw error;
                  
                  // Update the corresponding user in the users table
                  // First find matching user by name and team_id
                  const { data: userData, error: userFindError } = await supabase
                    .from('users')
                    .select('id')
                    .match({ 
                      name: oldParticipant?.name, 
                      team_id: oldParticipant?.team_id 
                    });
                    
                  if (userFindError) {
                    console.error('Error finding user record:', userFindError);
                  } else if (userData && userData.length > 0) {
                    // Update the user record
                    const { error: userUpdateError } = await supabase
                      .from('users')
                      .update({ 
                        name: editParticipantName,
                        team_id: editParticipantTeamId
                      })
                      .eq('id', userData[0].id);
                      
                    if (userUpdateError) {
                      console.error('Error updating user record:', userUpdateError);
                    }
                  }
                  
                  // Get the team name for display
                  const teamName = editParticipantTeamId 
                    ? teams.find(team => team.id === editParticipantTeamId)?.team_name || 'No team'
                    : 'No team';
                  
                  // Update local state
                  setParticipants(participants.map(participant => 
                    participant.id === editParticipantId 
                      ? { 
                          ...participant, 
                          name: editParticipantName,
                          team_id: editParticipantTeamId,
                          team_name: teamName
                        }
                      : participant
                  ));
                  
                  // If team changed, update team member counts
                  if (oldTeamId !== editParticipantTeamId) {
                    setTeams(teams.map(team => {
                      if (team.id === oldTeamId) {
                        return { ...team, members: (team.members || 1) - 1 };
                      }
                      if (team.id === editParticipantTeamId) {
                        return { ...team, members: (team.members || 0) + 1 };
                      }
                      return team;
                    }));
                  }
                  
                  setIsEditingParticipant(false);
                  
                  toast({
                    title: 'Success',
                    description: 'Participant updated successfully',
                  });
                } catch (error) {
                  console.error('Error updating participant:', error);
                  toast({
                    title: 'Error',
                    description: 'Failed to update participant',
                    variant: 'destructive',
                  });
                } finally {
                  setIsSubmitting(false);
                }
              }}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                'Save Changes'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}