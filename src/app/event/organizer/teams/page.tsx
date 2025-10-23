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
import { PlusCircle, Users, UserPlus, Trash2, Edit, Search, RefreshCw, Loader2, Eye, EyeOff, Lock } from 'lucide-react';
import { format } from 'date-fns';

interface Team {
  id: number;
  team_name: string;
  created_at: string;
  members?: number;
  username?: string;
  password?: string;
  password_hash?: string;
  role?: string;
}

interface TeamMember {
  id: number;
  name: string;
  team_id: number | null;
  team_name?: string;
  created_at: string;
}

export default function TeamsPage() {
  const [teams, setTeams] = useState<Team[]>([]);
  const [participants, setParticipants] = useState<TeamMember[]>([]);
  const [isAddingTeamWithParticipants, setIsAddingTeamWithParticipants] = useState(false);
  const [isEditingTeam, setIsEditingTeam] = useState(false);
  const [isEditingParticipant, setIsEditingParticipant] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Store plain text passwords for newly created teams (in-memory only)
  const [teamPasswords, setTeamPasswords] = useState<Record<number, string>>({});
  
  // Master password state
  const [showPasswordDialog, setShowPasswordDialog] = useState(false);
  const [masterPassword, setMasterPassword] = useState('');
  const [isPasswordUnlocked, setIsPasswordUnlocked] = useState(false);
  const [selectedTeamForPassword, setSelectedTeamForPassword] = useState<number | null>(null);
  
  // Master password (you can change this)
  const MASTER_PASSWORD = 'admin@sparklab2025';
  
  // Undo states
  const [deletedTeam, setDeletedTeam] = useState<{
    team: Team;
    members: TeamMember[];
    messages: any[];
    submissions: any[];
  } | null>(null);
  const [deletedParticipant, setDeletedParticipant] = useState<TeamMember | null>(null);
  
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
    participants: [{ name: '', gender: '' }]
  });
  
  // Function to fetch teams and team members from the database
  const fetchData = async (showLoading = true) => {
    if (showLoading) {
      setIsLoading(true);
    }
    
    try {
      console.log('Fetching teams and team members data...');
      
      // Fetch teams
      const { data: teamsData, error: teamsError } = await supabase
        .from('teams')
        .select('*')
        .order('created_at', { ascending: false });
        
      if (teamsError) {
        console.error('Error fetching teams:', teamsError);
        toast({
          title: 'Error',
          description: 'Failed to load teams',
          variant: 'destructive',
        });
        setIsLoading(false);
        return;
      }
      
      console.log('Teams fetched successfully:', teamsData?.length || 0, teamsData);

      // Filter out the organizer team (role === 'organizer' or team_name contains 'organizer')
      const participantTeams = (teamsData || []).filter(team => 
        team.role !== 'organizer' && 
        !team.team_name.toLowerCase().includes('organizer')
      );
      console.log('Participant teams (excluding organizer):', participantTeams.length, participantTeams);

      // Fetch users from the users table
      const { data: usersData, error: usersError } = await supabase
        .from('users')
        .select('*')
        .order('created_at', { ascending: false });
        
      if (usersError) {
        console.error('Error fetching users:', usersError);
        toast({
          title: 'Error',
          description: 'Failed to load team members',
          variant: 'destructive',
        });
        // Still continue with teams data
      } else {
        console.log('Users fetched successfully:', usersData?.length || 0, usersData);
      }
      
      // Count team members and add that info (only for participant teams)
      const teamsWithMembers = participantTeams.map(team => {
        // If usersData is null or undefined, provide an empty array
        const memberCount = (usersData || []).filter(p => p.team_id === team.id).length;
        return { ...team, members: memberCount };
      });
      
      // Extract passwords from teams data and store in state
      const passwordsMap: Record<number, string> = {};
      participantTeams.forEach(team => {
        if (team.password) {
          passwordsMap[team.id] = team.password;
        }
      });
      setTeamPasswords(passwordsMap);
      console.log('Loaded passwords for teams:', Object.keys(passwordsMap).length);
      
      // Process users as participants if we have them
      let participantsWithTeamNames = [];
      if (usersData && usersData.length > 0) {
        participantsWithTeamNames = usersData.map(user => {
          const team = participantTeams.find(t => t.id === user.team_id);
          return {
            ...user,
            team_name: team ? team.team_name : 'No team'
          };
        });
      }

      // Update state with the data we have
      setTeams(teamsWithMembers);
      setParticipants(participantsWithTeamNames);
      
      console.log('Data fetching completed successfully.');
    } catch (error) {
      console.error('Error fetching teams and team members:', error);
      toast({
        title: 'Error',
        description: 'Failed to load teams and team members',
        variant: 'destructive',
      });
    } finally {
      if (showLoading) {
        setIsLoading(false);
      }
    }
  };
  
  // Fetch data on component mount and when the component refreshes
  useEffect(() => {
    console.log('Teams component mounted, fetching initial data...');
    
    // Set a loading state immediately to show loading indicator
    setIsLoading(true);
    
    // Fetch data with error handling
    fetchData(false)
      .then(() => {
        console.log('Initial data fetch completed successfully');
      })
      .catch(error => {
        console.error('Error during initial data fetch:', error);
        toast({
          title: 'Data Load Error',
          description: 'There was a problem loading the teams data. Please try refreshing.',
          variant: 'destructive',
        });
      });

    // Set up real-time subscriptions
    const teamsChannel = supabase
      .channel('organizer-teams-page')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'teams' },
        (payload) => {
          console.log('Team changed:', payload);
          fetchData(false);
        }
      )
      .subscribe();

    const usersChannel = supabase
      .channel('organizer-users-page')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'users' },
        (payload) => {
          console.log('User changed:', payload);
          fetchData(false);
        }
      )
      .subscribe();

    // Cleanup subscriptions
    return () => {
      supabase.removeChannel(teamsChannel);
      supabase.removeChannel(usersChannel);
    };
  }, []);
  
  // Add team with participants in a single operation
  const handleAddTeam = async () => {
    console.log("Starting team creation process...");
    
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
    
    // Validate that we have at least one valid team member
    const validParticipants = newTeamData.participants.filter(
      p => p.name.trim()
    );
    
    if (validParticipants.length === 0) {
      toast({
        title: 'Error',
        description: 'Please add at least one team member with a name',
        variant: 'destructive',
      });
      return;
    }
    
    console.log(`Creating team "${newTeamData.teamName}" with ${validParticipants.length} team members`);
    setIsSubmitting(true);
    
    try {      
      // Create the team with username and hashed password
      console.log("Creating team record in database...");
      const { data: teamData, error: teamError } = await supabase
        .from('teams')
        .insert({ 
          team_name: newTeamData.teamName, 
          username: newTeamData.username,
          password: newTeamData.password, // Store plain password in database
          password_hash: hashPassword(newTeamData.password), // Hash the password for authentication
          created_at: new Date().toISOString()
        })
        .select();
      
      if (teamError) {
        console.error("Team creation error:", teamError);
        throw new Error(`Failed to create team: ${teamError.message}`);
      }
      
      if (!teamData || teamData.length === 0) {
        console.error("Team creation failed: No team data returned");
        throw new Error('Failed to create team: No data returned from database');
      }
      
      console.log("Team created successfully:", teamData[0]);
      
      const newTeam = teamData[0];
      const createdUsers: TeamMember[] = [];
      let userErrors = 0;
      
      // No need to store in localStorage anymore since it's in the database
      // Just update the local state for immediate display
      setTeamPasswords(prev => ({
        ...prev,
        [newTeam.id]: newTeamData.password
      }));
      
      // Step 2: Create users for the team
      console.log(`Creating ${validParticipants.length} users for team ${newTeam.team_name} (ID: ${newTeam.id})`);
      
      for (let i = 0; i < validParticipants.length; i++) {
        const participant = validParticipants[i];
        try {
          console.log(`Creating user ${i+1}/${validParticipants.length}: ${participant.name}`);
          
          // Add the user to the users table
          console.log(`Adding ${participant.name} to users table with team_id ${newTeam.id}`);
          
          const { data: userData, error: userError } = await supabase
            .from('users')
            .insert({
              name: participant.name,
              gender: participant.gender || '',
              team_id: newTeam.id,
              created_at: new Date().toISOString()
            })
            .select();
          
          if (userError) {
            console.error('Error creating user record:', userError);
            console.error('Error details:', userError.message);
            userErrors++;
          } else {
            console.log('User created successfully:', userData);
            
            if (userData && userData[0]) {
              createdUsers.push({
                ...userData[0],
                team_name: newTeam.team_name
              });
              console.log(`Successfully created user ${participant.name} (ID: ${userData[0].id})`);
            }
          }
        } catch (error) {
          console.error('Error creating user:', error);
          userErrors++;
        }
      }
      
      // Log summary of team member creation
      console.log(`Team member creation summary: ${createdUsers.length} created, ${userErrors} errors`);
      
      // If no team members were created but team was, show a warning
      if (createdUsers.length === 0 && validParticipants.length > 0) {
        console.error("Failed to create any team members even though team was created successfully!");
      }
      
      // Save info for the toast message before resetting the form
      const teamName = newTeamData.teamName;
      const userCount = createdUsers.length;
      
      console.log("Team creation process completed, now resetting form and refreshing data...");
      
      // Reset the form
      setNewTeamData({
        teamName: '',
        username: '',
        password: '',
        participants: [{ name: '', gender: '' }]
      });
      
      // Close the form panel
      setIsAddingTeamWithParticipants(false);
      
      // Show success or partial success message based on user creation results
      if (userCount === validParticipants.length) {
        toast({
          title: 'Success',
          description: `Team "${teamName}" created with ${userCount} team members`,
        });
      } else {
        toast({
          title: 'Partial Success',
          description: `Team "${teamName}" created but only ${userCount} of ${validParticipants.length} team members were added`,
          variant: 'destructive', // Changed from 'warning' to 'destructive' as it's a valid variant
        });
      }
      
      // Refresh data from the server with a longer delay to ensure all database writes have completed
      console.log("Scheduling data refresh after team creation...");
      setTimeout(async () => {
        console.log("Executing refresh data after team creation...");
        try {
          await fetchData(true);
          console.log("Data refresh completed successfully");
        } catch (refreshError) {
          console.error("Error during data refresh:", refreshError);
          toast({
            title: 'Warning',
            description: 'Team created but there was an error refreshing the data. Please click refresh manually.',
            variant: 'destructive', // Changed from 'warning' to 'destructive' as it's a valid variant
          });
        }
      }, 1000);
      
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
    if (newTeamData.participants.length >= 4) {
      toast({
        title: 'Maximum Reached',
        description: 'A team can have a maximum of 4 participants',
        variant: 'destructive',
      });
      return;
    }
    setNewTeamData({
      ...newTeamData,
      participants: [...newTeamData.participants, { name: '', gender: '' }]
    });
  };
  
  const removeParticipantField = (index: number) => {
    const updatedParticipants = [...newTeamData.participants];
    updatedParticipants.splice(index, 1);
    setNewTeamData({
      ...newTeamData,
      participants: updatedParticipants.length ? updatedParticipants : [{ name: '', gender: '' }]
    });
  };
  
  const updateParticipantField = (index: number, field: 'name' | 'gender', value: string) => {
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
            onClick={async () => {
              console.log("Manual refresh requested...");
              toast({
                title: "Refreshing data",
                description: "Fetching latest teams and team members data"
              });
              
              try {
                await fetchData(true);
                console.log("Manual refresh completed successfully");
                toast({
                  title: "Refresh complete",
                  description: "Teams and team members data has been updated"
                });
              } catch (error) {
                console.error("Error during manual refresh:", error);
                toast({
                  title: "Refresh failed",
                  description: "There was an error refreshing the data. Please try again.",
                  variant: "destructive"
                });
              }
            }}
            disabled={isLoading}
          >
            <RefreshCw className={`mr-2 h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
            Refresh
          </Button>
          
          <Button
            variant={isPasswordUnlocked ? "destructive" : "outline"}
            onClick={() => {
              if (!isPasswordUnlocked) {
                setShowPasswordDialog(true);
              } else {
                setIsPasswordUnlocked(false);
                toast({
                  title: 'Passwords Hidden',
                  description: 'All passwords are now hidden',
                });
              }
            }}
          >
            {isPasswordUnlocked ? (
              <>
                <EyeOff className="mr-2 h-4 w-4" />
                Hide Passwords
              </>
            ) : (
              <>
                <Eye className="mr-2 h-4 w-4" />
                Show Passwords
              </>
            )}
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
                  <div className="flex items-center justify-between">
                    <Label className="text-lg font-medium">Participants</Label>
                    <span className="text-sm text-muted-foreground">
                      {newTeamData.participants.length} / 4 participants
                    </span>
                  </div>
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
                          
                          <div className="grid gap-2">
                            <Label htmlFor={`participant-${index}-gender`}>Gender</Label>
                            <select
                              id={`participant-${index}-gender`}
                              value={participant.gender}
                              onChange={(e) => updateParticipantField(index, 'gender', e.target.value)}
                              className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                              <option value="">Select gender</option>
                              <option value="Male">Male</option>
                              <option value="Female">Female</option>
                              <option value="Other">Other</option>
                            </select>
                          </div>

                        </div>
                      </div>
                    ))}
                    
                    <Button 
                      type="button" 
                      variant="outline" 
                      className="w-full"
                      onClick={addParticipantField}
                      disabled={newTeamData.participants.length >= 4}
                    >
                      <PlusCircle className="mr-2 h-4 w-4" />
                      {newTeamData.participants.length >= 4 
                        ? 'Maximum 4 Participants Reached' 
                        : 'Add Another Participant'}
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
            Team Members ({participants.length})
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
                      <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Username</th>
                      <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Password</th>
                      <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Created</th>
                      <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Members</th>
                      <th className="h-12 px-4 text-right align-middle font-medium text-muted-foreground">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredTeams.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="p-4 text-center text-muted-foreground">
                          No teams found
                        </td>
                      </tr>
                    ) : (
                      filteredTeams.map((team) => (
                        <tr key={team.id} className="border-b">
                          <td className="p-4 align-middle">{team.id}</td>
                          <td className="p-4 align-middle font-medium">{team.team_name}</td>
                          <td className="p-4 align-middle">
                            <code className="px-2 py-1 bg-secondary/50 rounded text-sm">
                              {team.username || 'N/A'}
                            </code>
                          </td>
                          <td className="p-4 align-middle">
                            <div className="flex items-center gap-2">
                              {isPasswordUnlocked ? (
                                teamPasswords[team.id] ? (
                                  <code className="px-2 py-1 bg-green-500/10 border border-green-500/20 rounded text-sm text-green-700">
                                    {teamPasswords[team.id]}
                                  </code>
                                ) : (
                                  <code className="px-2 py-1 bg-amber-500/10 border border-amber-500/20 rounded text-sm text-amber-700">
                                    Not stored
                                  </code>
                                )
                              ) : (
                                <code className="px-2 py-1 bg-secondary/50 rounded text-sm">
                                  ••••••••
                                </code>
                              )}
                              <Button
                                size="sm"
                                variant="ghost"
                                className="h-7 w-7 p-0"
                                onClick={() => {
                                  if (!isPasswordUnlocked) {
                                    setSelectedTeamForPassword(team.id);
                                    setShowPasswordDialog(true);
                                  } else {
                                    setIsPasswordUnlocked(false);
                                    toast({
                                      title: 'Passwords Hidden',
                                      description: 'All passwords are now hidden',
                                    });
                                  }
                                }}
                              >
                                {isPasswordUnlocked ? (
                                  <EyeOff className="h-4 w-4" />
                                ) : (
                                  <Eye className="h-4 w-4" />
                                )}
                              </Button>
                            </div>
                          </td>
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
                                  const teamMembers = participants.filter(p => p.team_id === team.id);
                                  const memberCount = teamMembers.length;
                                  const confirmMessage = memberCount > 0 
                                    ? `Are you sure you want to delete ${team.team_name}? This will also delete:\n- ${memberCount} team member(s)\n- All messages\n- All submissions`
                                    : `Are you sure you want to delete ${team.team_name}? This will also delete all related messages and submissions.`;
                                  
                                  if (window.confirm(confirmMessage)) {
                                    setIsSubmitting(true);
                                    try {
                                      // Fetch related data before deleting for undo functionality
                                      const { data: relatedMessages } = await supabase
                                        .from('messages')
                                        .select('*')
                                        .or(`sender_team_id.eq.${team.id},receiver_id.eq.${team.id}`);
                                      
                                      const { data: relatedSubmissions } = await supabase
                                        .from('submissions')
                                        .select('*')
                                        .eq('team_id', team.id);
                                      
                                      // Delete in order to avoid foreign key constraint violations:
                                      
                                      // 1. Delete messages where team is sender or receiver
                                      const { error: messagesError } = await supabase
                                        .from('messages')
                                        .delete()
                                        .or(`sender_team_id.eq.${team.id},receiver_id.eq.${team.id}`);
                                      
                                      if (messagesError) {
                                        console.error('Error deleting messages:', messagesError);
                                        throw new Error(`Failed to delete messages: ${messagesError.message}`);
                                      }
                                      
                                      // 2. Delete submissions for this team
                                      const { error: submissionsError } = await supabase
                                        .from('submissions')
                                        .delete()
                                        .eq('team_id', team.id);
                                      
                                      if (submissionsError) {
                                        console.error('Error deleting submissions:', submissionsError);
                                        throw new Error(`Failed to delete submissions: ${submissionsError.message}`);
                                      }
                                      
                                      // 3. Delete users (team members) associated with this team
                                      if (memberCount > 0) {
                                        const { error: usersError } = await supabase
                                          .from('users')
                                          .delete()
                                          .eq('team_id', team.id);
                                        
                                        if (usersError) {
                                          console.error('Error deleting users:', usersError);
                                          throw new Error(`Failed to delete team members: ${usersError.message}`);
                                        }
                                      }
                                      
                                      // 4. Finally delete the team
                                      const { error: teamError } = await supabase
                                        .from('teams')
                                        .delete()
                                        .eq('id', team.id);
                                      
                                      if (teamError) {
                                        console.error('Error deleting team:', teamError);
                                        throw new Error(`Failed to delete team: ${teamError.message}`);
                                      }
                                      
                                      // Store deleted data for undo - capture in a local variable
                                      const deletedData = {
                                        team: team,
                                        members: teamMembers,
                                        messages: relatedMessages || [],
                                        submissions: relatedSubmissions || []
                                      };
                                      
                                      setDeletedTeam(deletedData);
                                      
                                      // Update local state
                                      setTeams(teams.filter(t => t.id !== team.id));
                                      setParticipants(participants.filter(p => p.team_id !== team.id));
                                      
                                      toast({
                                        title: 'Team Deleted',
                                        description: `Team "${team.team_name}" deleted successfully`,
                                        action: (
                                          <button
                                            onClick={async () => {
                                              try {
                                                console.log('Starting team restoration...', deletedData);
                                                
                                                // Restore team without forcing the ID
                                                const teamToInsert = {
                                                  team_name: deletedData.team.team_name,
                                                  username: deletedData.team.username,
                                                  password: deletedData.team.password,
                                                  password_hash: deletedData.team.password_hash,
                                                  role: deletedData.team.role,
                                                  created_at: deletedData.team.created_at
                                                };
                                                
                                                const { data: restoredTeam, error: teamError } = await supabase
                                                  .from('teams')
                                                  .insert([teamToInsert])
                                                  .select();
                                                
                                                if (teamError) {
                                                  console.error('Team restore error:', teamError);
                                                  throw new Error(`Failed to restore team: ${teamError.message}`);
                                                }
                                                
                                                console.log('Team restored:', restoredTeam);
                                                const newTeamId = restoredTeam[0].id;
                                                
                                                // Restore members with new team_id
                                                if (deletedData.members.length > 0) {
                                                  const membersToInsert = deletedData.members.map(m => ({
                                                    name: m.name,
                                                    team_id: newTeamId,
                                                    gender: (m as any).gender || '',
                                                    created_at: m.created_at
                                                  }));
                                                  
                                                  const { error: membersError } = await supabase
                                                    .from('users')
                                                    .insert(membersToInsert);
                                                  
                                                  if (membersError) {
                                                    console.error('Error restoring members:', membersError);
                                                  } else {
                                                    console.log('Members restored successfully');
                                                  }
                                                }
                                                
                                                // Restore messages with new team_id
                                                if (deletedData.messages.length > 0) {
                                                  const messagesToInsert = deletedData.messages.map(m => ({
                                                    sender_team_id: m.sender_team_id === deletedData.team.id ? newTeamId : m.sender_team_id,
                                                    receiver_id: m.receiver_id === deletedData.team.id ? newTeamId : m.receiver_id,
                                                    content: m.content,
                                                    timestamp: m.timestamp,
                                                    seen_timestamp: m.seen_timestamp
                                                  }));
                                                  
                                                  const { error: messagesError } = await supabase
                                                    .from('messages')
                                                    .insert(messagesToInsert);
                                                    
                                                  if (messagesError) {
                                                    console.error('Error restoring messages:', messagesError);
                                                  }
                                                }
                                                
                                                // Restore submissions with new team_id
                                                if (deletedData.submissions.length > 0) {
                                                  const submissionsToInsert = deletedData.submissions.map(s => ({
                                                    team_id: newTeamId,
                                                    checkpoint_id: s.checkpoint_id,
                                                    file_url: s.file_url,
                                                    submitted_at: s.submitted_at
                                                  }));
                                                  
                                                  const { error: submissionsError } = await supabase
                                                    .from('submissions')
                                                    .insert(submissionsToInsert);
                                                    
                                                  if (submissionsError) {
                                                    console.error('Error restoring submissions:', submissionsError);
                                                  }
                                                }
                                                
                                                // Refresh data
                                                await fetchData(true);
                                                setDeletedTeam(null);
                                                
                                                toast({
                                                  title: 'Team Restored',
                                                  description: `Team "${deletedData.team.team_name}" has been restored`,
                                                });
                                              } catch (error: any) {
                                                console.error('Error restoring team:', error);
                                                toast({
                                                  title: 'Error',
                                                  description: error.message || 'Failed to restore team',
                                                  variant: 'destructive',
                                                });
                                              }
                                            }}
                                            className="px-3 py-1 bg-primary text-primary-foreground rounded-md text-sm hover:bg-primary/90"
                                          >
                                            Undo
                                          </button>
                                        ),
                                      });
                                    } catch (error: any) {
                                      console.error('Error deleting team:', error);
                                      toast({
                                        title: 'Error',
                                        description: error.message || 'Failed to delete team',
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
              <CardTitle>Team Members</CardTitle>
              <CardDescription>List of all registered team members</CardDescription>
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
                                  if (window.confirm(`Are you sure you want to delete team member ${participant.name}?`)) {
                                    setIsSubmitting(true);
                                    try {
                                      console.log(`Deleting team member: ${participant.name} (ID: ${participant.id})`);
                                      
                                      // Store the participant for undo - capture in local variable
                                      const deletedData = { ...participant };
                                      setDeletedParticipant(deletedData);
                                      
                                      // Delete from users table directly
                                      const { error } = await supabase
                                        .from('users')
                                        .delete()
                                        .eq('id', participant.id);
                                      
                                      if (error) {
                                        console.error('Error deleting team member:', error);
                                        throw error;
                                      }
                                      
                                      console.log('Team member deleted successfully from database');
                                      
                                      // Update local state
                                      setParticipants(participants.filter(p => p.id !== participant.id));
                                      
                                      // Update team members count if the member was in a team
                                      if (participant.team_id) {
                                        setTeams(teams.map(team => 
                                          team.id === participant.team_id 
                                            ? { ...team, members: (team.members || 1) - 1 }
                                            : team
                                        ));
                                      }
                                      
                                      toast({
                                        title: 'Participant Deleted',
                                        description: `${participant.name} deleted successfully`,
                                        action: (
                                          <button
                                            onClick={async () => {
                                              try {
                                                console.log('Restoring participant:', deletedData);
                                                
                                                // Restore participant without forcing the ID
                                                const participantToInsert = {
                                                  name: deletedData.name,
                                                  team_id: deletedData.team_id,
                                                  gender: (deletedData as any).gender || '',
                                                  created_at: deletedData.created_at
                                                };
                                                
                                                const { error: restoreError } = await supabase
                                                  .from('users')
                                                  .insert([participantToInsert]);
                                                
                                                if (restoreError) {
                                                  console.error('Restore error:', restoreError);
                                                  throw new Error(`Failed to restore: ${restoreError.message}`);
                                                }
                                                
                                                console.log('Participant restored successfully');
                                                
                                                // Refresh data
                                                await fetchData(true);
                                                setDeletedParticipant(null);
                                                
                                                toast({
                                                  title: 'Participant Restored',
                                                  description: `${deletedData.name} has been restored`,
                                                });
                                              } catch (error: any) {
                                                console.error('Error restoring participant:', error);
                                                toast({
                                                  title: 'Error',
                                                  description: error.message || 'Failed to restore participant',
                                                  variant: 'destructive',
                                                });
                                              }
                                            }}
                                            className="px-3 py-1 bg-primary text-primary-foreground rounded-md text-sm hover:bg-primary/90"
                                          >
                                            Undo
                                          </button>
                                        ),
                                      });
                                    } catch (error) {
                                      console.error('Error deleting team member:', error);
                                      toast({
                                        title: 'Error',
                                        description: 'Failed to delete team member',
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
                  
                  // Update user directly in the users table (not participants table)
                  const { error } = await supabase
                    .from('users')
                    .update({ 
                      name: editParticipantName,
                      team_id: editParticipantTeamId
                    })
                    .eq('id', editParticipantId);
                  
                  if (error) throw error;
                  
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

      {/* Master Password Dialog */}
      <Dialog open={showPasswordDialog} onOpenChange={setShowPasswordDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Lock className="h-5 w-5" />
              Enter Master Password
            </DialogTitle>
            <DialogDescription>
              Enter the organizer master password to view all team passwords
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="masterPassword">Master Password</Label>
              <Input
                id="masterPassword"
                type="password"
                value={masterPassword}
                onChange={(e) => setMasterPassword(e.target.value)}
                placeholder="Enter master password"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    if (masterPassword === MASTER_PASSWORD) {
                      setIsPasswordUnlocked(true);
                      setShowPasswordDialog(false);
                      setMasterPassword('');
                      const storedCount = Object.keys(teamPasswords).length;
                      toast({
                        title: 'Success',
                        description: `Passwords unlocked! ${storedCount} team password(s) available to view.`,
                      });
                    } else {
                      toast({
                        title: 'Error',
                        description: 'Incorrect master password',
                        variant: 'destructive',
                      });
                    }
                  }
                }}
              />
            </div>
          </div>
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => {
                setShowPasswordDialog(false);
                setMasterPassword('');
              }}
            >
              Cancel
            </Button>
            <Button 
              onClick={() => {
                if (masterPassword === MASTER_PASSWORD) {
                  setIsPasswordUnlocked(true);
                  setShowPasswordDialog(false);
                  setMasterPassword('');
                  const storedCount = Object.keys(teamPasswords).length;
                  console.log('Passwords unlocked. Stored passwords:', teamPasswords);
                  console.log('Number of stored passwords:', storedCount);
                  toast({
                    title: 'Success',
                    description: `Passwords unlocked! ${storedCount} team password(s) available to view.`,
                  });
                } else {
                  toast({
                    title: 'Error',
                    description: 'Incorrect master password',
                    variant: 'destructive',
                  });
                }
              }}
            >
              Unlock
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}