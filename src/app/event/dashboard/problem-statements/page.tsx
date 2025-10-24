'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/lib/supabase';
import { FileText, Users, Loader2, CheckCircle, AlertCircle } from 'lucide-react';

interface ProblemStatement {
  id: number;
  title: string;
  description: string;
  max_teams: number;
  active: boolean;
  created_at: string;
  team_count?: number;
}

interface Team {
  id: number;
  team_name: string;
  problem_id: number | null;
  problem_statements?: ProblemStatement | null;
}

export default function ProblemStatementsPage() {
  const [problemStatements, setProblemStatements] = useState<ProblemStatement[]>([]);
  const [currentTeam, setCurrentTeam] = useState<Team | null>(null);
  const [selectedProblem, setSelectedProblem] = useState<ProblemStatement | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);

  useEffect(() => {
    // Get current team from localStorage
    const userString = localStorage.getItem('user');
    if (userString) {
      const userData = JSON.parse(userString);
      setCurrentTeam(userData);
      fetchData(userData.id);
    }
  }, []);

  async function fetchData(teamId: number) {
    try {
      // Fetch team's current problem statement (including the problem statement details via JOIN)
      const { data: teamData, error: teamError } = await supabase
        .from('teams')
        .select(`
          id, 
          team_name, 
          problem_id,
          problem_statements (
            id,
            title,
            description,
            max_teams,
            active,
            created_at
          )
        `)
        .eq('id', teamId)
        .single();

      if (teamError) throw teamError;
      
      // Process the team data - problem_statements comes as array or null
      const processedTeamData: Team = {
        id: teamData.id,
        team_name: teamData.team_name,
        problem_id: teamData.problem_id,
        problem_statements: Array.isArray(teamData.problem_statements) 
          ? teamData.problem_statements[0] || null 
          : teamData.problem_statements
      };
      
      setCurrentTeam(processedTeamData);

      // Fetch all active problem statements
      const { data: problemsData, error: problemsError } = await supabase
        .from('problem_statements')
        .select('*')
        .eq('active', true)
        .order('created_at', { ascending: false });

      if (problemsError) throw problemsError;

      // Get team counts for each problem statement and auto-deactivate if full
      const problemsWithCounts = await Promise.all(
        (problemsData || []).map(async (problem) => {
          const { count } = await supabase
            .from('teams')
            .select('*', { count: 'exact', head: true })
            .eq('problem_id', problem.id)
            .is('role', null);

          console.log(`Problem ${problem.id} count check:`, { count, max_teams: problem.max_teams });

          // Auto-deactivate if limit reached
          if (count && count >= problem.max_teams) {
            console.log(`Auto-deactivating problem ${problem.id} - ${count}/${problem.max_teams} teams`);
            await supabase
              .from('problem_statements')
              .update({ active: false })
              .eq('id', problem.id);
          }

          return {
            ...problem,
            team_count: count || 0
          };
        })
      );

      // If team has selected a problem, include it in the list (even if inactive)
      let allProblems = problemsWithCounts;
      if (processedTeamData.problem_id && processedTeamData.problem_statements) {
        const selectedProblem = processedTeamData.problem_statements;
        const isInActiveList = problemsWithCounts.some(p => p.id === selectedProblem.id);
        
        if (!isInActiveList) {
          // Get team count for the selected problem
          const { count } = await supabase
            .from('teams')
            .select('*', { count: 'exact', head: true })
            .eq('problem_id', selectedProblem.id)
            .is('role', null);

          allProblems = [
            {
              ...selectedProblem,
              team_count: count || 0
            },
            ...problemsWithCounts
          ];
        }
      }

      setProblemStatements(allProblems);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast({
        title: 'Error',
        description: 'Failed to load problem statements',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  }

  function openSelectDialog(problem: ProblemStatement) {
    const currentCount = problem.team_count || 0;
    console.log('Opening select dialog:', { 
      problemId: problem.id, 
      title: problem.title,
      currentCount, 
      maxTeams: problem.max_teams,
      isFull: currentCount >= problem.max_teams,
      currentTeamProblemId: currentTeam?.problem_id
    });

    // Check if problem is full
    if (currentCount >= problem.max_teams && currentTeam?.problem_id !== problem.id) {
      toast({
        title: 'Problem Statement Full',
        description: 'This problem statement has reached its maximum team limit',
        variant: 'destructive'
      });
      return;
    }

    setSelectedProblem(problem);
    setShowConfirmDialog(true);
  }

  async function handleSelectProblem() {
    if (!currentTeam || !selectedProblem) return;

    console.log('Selecting problem statement:', {
      teamId: currentTeam.id,
      teamName: currentTeam.team_name,
      problemId: selectedProblem.id,
      problemTitle: selectedProblem.title
    });

    setIsSubmitting(true);

    try {
      // First, update the team's problem_id
      const { data, error } = await supabase
        .from('teams')
        .update({ problem_id: selectedProblem.id })
        .eq('id', currentTeam.id)
        .select();

      if (error) {
        console.error('Selection error:', error);
        throw error;
      }

      console.log('Selection successful, updated team data:', data);

      // Now check if this problem has reached its limit and deactivate if needed
      const { count: teamCount } = await supabase
        .from('teams')
        .select('*', { count: 'exact', head: true })
        .eq('problem_id', selectedProblem.id)
        .is('role', null);

      console.log('Team count after selection:', {
        problemId: selectedProblem.id,
        teamCount,
        maxTeams: selectedProblem.max_teams
      });

      // If limit reached or exceeded, deactivate the problem statement
      if (teamCount && teamCount >= selectedProblem.max_teams) {
        console.log('Limit reached, deactivating problem statement');
        
        const { error: deactivateError } = await supabase
          .from('problem_statements')
          .update({ active: false })
          .eq('id', selectedProblem.id);

        if (deactivateError) {
          console.error('Error deactivating problem statement:', deactivateError);
        } else {
          console.log('Problem statement deactivated successfully');
        }
      }

      toast({
        title: 'Success',
        description: 'Problem statement selected successfully'
      });

      setShowConfirmDialog(false);
      fetchData(currentTeam.id);
    } catch (error: any) {
      console.error('Error selecting problem statement:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to select problem statement',
        variant: 'destructive'
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full min-h-[60vh]">
        <div className="flex flex-col items-center">
          <Loader2 className="h-10 w-10 animate-spin text-primary" />
          <p className="mt-4">Loading problem statements...</p>
        </div>
      </div>
    );
  }

  const currentProblem = problemStatements.find(p => p.id === currentTeam?.problem_id);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Problem Statements</h1>
        <p className="text-muted-foreground mt-2">
          {currentProblem 
            ? 'Your selected problem statement' 
            : 'Select a problem statement for your team to work on'}
        </p>
      </div>

      {/* Current Selection - Show only this if selected */}
      {currentProblem ? (
        <Card className="border-2 border-primary">
          <CardHeader>
            <div className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-500" />
              <CardTitle className="text-lg">Your Selected Problem Statement</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <h3 className="font-semibold text-xl mb-2">{currentProblem.title}</h3>
            <p className="text-muted-foreground whitespace-pre-wrap">{currentProblem.description}</p>
          </CardContent>
        </Card>
      ) : (
        /* Available Problem Statements - Show only if no selection */
        <div>
          <h2 className="text-xl font-semibold mb-4">Available Problem Statements</h2>

          {problemStatements.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <FileText className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                <h3 className="text-lg font-semibold mb-2">No problem statements available</h3>
                <p className="text-muted-foreground">
                  Problem statements will appear here when organizers create them
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {problemStatements.map((problem) => {
                const isFull = (problem.team_count || 0) >= problem.max_teams;
                
                return (
                  <Card key={problem.id} className={isFull ? 'opacity-60' : ''}>
                    <CardHeader>
                      <div className="flex items-start justify-between gap-2">
                        <CardTitle className="text-lg line-clamp-2">{problem.title}</CardTitle>
                        {isFull && (
                          <Badge variant="destructive">Full</Badge>
                        )}
                      </div>
                      <CardDescription className="line-clamp-3">
                        {problem.description}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Users className="h-4 w-4" />
                          <span>Teams: {problem.team_count || 0} / {problem.max_teams}</span>
                        </div>
                        <Badge variant={isFull ? 'destructive' : 'secondary'}>
                          {isFull ? 'Full' : `${problem.max_teams - (problem.team_count || 0)} slots`}
                        </Badge>
                      </div>

                      <Button
                        className="w-full"
                        onClick={() => openSelectDialog(problem)}
                        disabled={isFull}
                      >
                        {isFull ? 'No Slots Available' : 'Select This Problem'}
                      </Button>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Confirmation Dialog */}
      <Dialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Selection</DialogTitle>
            <DialogDescription>
              Are you sure you want to select this problem statement? This selection cannot be changed later.
            </DialogDescription>
          </DialogHeader>

          {selectedProblem && (
            <div className="py-4">
              <h3 className="font-semibold mb-2">{selectedProblem.title}</h3>
              <p className="text-sm text-muted-foreground line-clamp-4">
                {selectedProblem.description}
              </p>
            </div>
          )}

          <div className="rounded-lg bg-amber-500/10 border border-amber-500/20 p-3">
            <div className="flex gap-2">
              <AlertCircle className="h-4 w-4 text-amber-500 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-amber-700">
                Warning: Once selected, you cannot change or unselect this problem statement.
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowConfirmDialog(false)} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button onClick={handleSelectProblem} disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Selecting...
                </>
              ) : (
                'Confirm Selection'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
