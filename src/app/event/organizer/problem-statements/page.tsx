'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/lib/supabase';
import { PlusCircle, Edit, Trash2, Loader2, FileText, Users, CheckCircle, XCircle } from 'lucide-react';

interface ProblemStatement {
  id: number;
  title: string;
  description: string;
  max_teams: number;
  active: boolean;
  created_at: string;
  team_count?: number;
}

export default function ProblemStatementsPage() {
  const [problemStatements, setProblemStatements] = useState<ProblemStatement[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    max_teams: 5,
    active: true
  });

  useEffect(() => {
    fetchProblemStatements();

    // Set up real-time subscription for problem_statements table
    const problemStatementsChannel = supabase
      .channel('problem_statements_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'problem_statements'
        },
        (payload) => {
          console.log('Problem statement changed:', payload);
          fetchProblemStatements();
        }
      )
      .subscribe();

    // Set up real-time subscription for teams table (to detect problem_id changes)
    const teamsChannel = supabase
      .channel('teams_problem_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'teams'
        },
        (payload) => {
          console.log('Team changed:', payload);
          fetchProblemStatements();
        }
      )
      .subscribe();

    // Cleanup subscriptions on unmount
    return () => {
      supabase.removeChannel(problemStatementsChannel);
      supabase.removeChannel(teamsChannel);
    };
  }, []);

  async function checkAndDeactivateFullProblems() {
    try {
      // Get all active problem statements
      const { data: activeProblems, error: fetchError } = await supabase
        .from('problem_statements')
        .select('*')
        .eq('active', true);

      if (fetchError) throw fetchError;

      // Check each active problem and deactivate if full
      for (const problem of activeProblems || []) {
        const { count } = await supabase
          .from('teams')
          .select('*', { count: 'exact', head: true })
          .eq('problem_id', problem.id)
          .is('role', null);

        console.log(`Problem ${problem.id} (${problem.title}): ${count}/${problem.max_teams} teams`);

        // If count meets or exceeds limit, deactivate
        if (count && count >= problem.max_teams) {
          console.log(`Deactivating problem ${problem.id} - limit reached`);
          
          const { error: updateError } = await supabase
            .from('problem_statements')
            .update({ active: false })
            .eq('id', problem.id);

          if (updateError) {
            console.error(`Error deactivating problem ${problem.id}:`, updateError);
          }
        }
      }
    } catch (error) {
      console.error('Error checking problem statement limits:', error);
    }
  }

  async function fetchProblemStatements() {
    try {
      // First check and deactivate any full problems
      await checkAndDeactivateFullProblems();

      const { data: problemsData, error: problemsError } = await supabase
        .from('problem_statements')
        .select('*')
        .order('created_at', { ascending: false });

      if (problemsError) throw problemsError;

      // Get team counts for each problem statement
      const problemsWithCounts = await Promise.all(
        (problemsData || []).map(async (problem) => {
          const { count } = await supabase
            .from('teams')
            .select('*', { count: 'exact', head: true })
            .eq('problem_id', problem.id)
            .is('role', null);

          return {
            ...problem,
            team_count: count || 0
          };
        })
      );

      setProblemStatements(problemsWithCounts);
    } catch (error) {
      console.error('Error fetching problem statements:', error);
      toast({
        title: 'Error',
        description: 'Failed to load problem statements',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  }

  function openAddDialog() {
    setEditingId(null);
    setFormData({
      title: '',
      description: '',
      max_teams: 5,
      active: true
    });
    setIsDialogOpen(true);
  }

  function openEditDialog(problem: ProblemStatement) {
    setEditingId(problem.id);
    setFormData({
      title: problem.title,
      description: problem.description,
      max_teams: problem.max_teams,
      active: problem.active
    });
    setIsDialogOpen(true);
  }

  async function handleSave() {
    if (!formData.title.trim() || !formData.description.trim()) {
      toast({
        title: 'Validation Error',
        description: 'Title and description are required',
        variant: 'destructive'
      });
      return;
    }

    if (formData.max_teams < 1) {
      toast({
        title: 'Validation Error',
        description: 'Maximum teams must be at least 1',
        variant: 'destructive'
      });
      return;
    }

    setIsSubmitting(true);

    try {
      if (editingId) {
        // Update existing problem statement
        const { error } = await supabase
          .from('problem_statements')
          .update({
            title: formData.title,
            description: formData.description,
            max_teams: formData.max_teams,
            active: formData.active
          })
          .eq('id', editingId);

        if (error) throw error;

        toast({
          title: 'Success',
          description: 'Problem statement updated successfully'
        });
      } else {
        // Create new problem statement
        const { error } = await supabase
          .from('problem_statements')
          .insert([{
            title: formData.title,
            description: formData.description,
            max_teams: formData.max_teams,
            active: formData.active
          }]);

        if (error) throw error;

        toast({
          title: 'Success',
          description: 'Problem statement created successfully'
        });
      }

      setIsDialogOpen(false);
      fetchProblemStatements();
    } catch (error: any) {
      console.error('Error saving problem statement:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to save problem statement',
        variant: 'destructive'
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleDelete(id: number) {
    if (!window.confirm('Are you sure you want to delete this problem statement? Teams assigned to it will be unassigned.')) {
      return;
    }

    setIsSubmitting(true);

    try {
      // First, unassign teams from this problem statement
      await supabase
        .from('teams')
        .update({ problem_id: null })
        .eq('problem_id', id);

      // Then delete the problem statement
      const { error } = await supabase
        .from('problem_statements')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Problem statement deleted successfully'
      });

      fetchProblemStatements();
    } catch (error: any) {
      console.error('Error deleting problem statement:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to delete problem statement',
        variant: 'destructive'
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  async function toggleActive(id: number, currentStatus: boolean) {
    console.log('Toggling active status:', { id, currentStatus, newStatus: !currentStatus });
    
    try {
      const { data, error } = await supabase
        .from('problem_statements')
        .update({ active: !currentStatus })
        .eq('id', id)
        .select();

      if (error) {
        console.error('Toggle error:', error);
        throw error;
      }

      console.log('Toggle successful, updated data:', data);

      toast({
        title: 'Success',
        description: `Problem statement ${!currentStatus ? 'activated' : 'deactivated'}`
      });

      fetchProblemStatements();
    } catch (error: any) {
      console.error('Error toggling status:', error);
      toast({
        title: 'Error',
        description: 'Failed to update status',
        variant: 'destructive'
      });
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

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Problem Statements</h1>
          <p className="text-muted-foreground">Manage problem statements for teams to select</p>
        </div>
        
        <Button onClick={openAddDialog}>
          <PlusCircle className="mr-2 h-4 w-4" />
          Add Problem Statement
        </Button>
      </div>

      {problemStatements.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <FileText className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
            <h3 className="text-lg font-semibold mb-2">No problem statements</h3>
            <p className="text-muted-foreground mb-4">
              Create problem statements for teams to select from
            </p>
            <Button onClick={openAddDialog}>
              <PlusCircle className="mr-2 h-4 w-4" />
              Add First Problem Statement
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {problemStatements.map((problem) => (
            <Card key={problem.id} className={!problem.active ? 'opacity-60' : ''}>
              <CardHeader>
                <div className="flex items-start justify-between gap-2">
                  <CardTitle className="text-lg line-clamp-2">{problem.title}</CardTitle>
                  <div className="flex gap-1">
                    {problem.active ? (
                      <Badge variant="outline" className="bg-green-500/10 text-green-500 border-green-500/20">
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Active
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="bg-gray-500/10 text-gray-500 border-gray-500/20">
                        <XCircle className="h-3 w-3 mr-1" />
                        Inactive
                      </Badge>
                    )}
                  </div>
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
                  <Badge variant={(problem.team_count || 0) >= problem.max_teams ? 'destructive' : 'secondary'}>
                    {(problem.team_count || 0) >= problem.max_teams ? 'Full' : `${problem.max_teams - (problem.team_count || 0)} slots`}
                  </Badge>
                </div>

                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => openEditDialog(problem)}
                    className="flex-1"
                  >
                    <Edit className="h-4 w-4 mr-1" />
                    Edit
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => toggleActive(problem.id, problem.active)}
                  >
                    {problem.active ? <XCircle className="h-4 w-4" /> : <CheckCircle className="h-4 w-4" />}
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleDelete(problem.id)}
                    className="text-red-500 hover:text-red-700"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Add/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>{editingId ? 'Edit' : 'Add'} Problem Statement</DialogTitle>
            <DialogDescription>
              {editingId ? 'Update the problem statement details' : 'Create a new problem statement for teams to select'}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="Enter problem statement title"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Enter detailed description"
                rows={6}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="max_teams">Maximum Teams</Label>
              <Input
                id="max_teams"
                type="number"
                min="1"
                value={formData.max_teams}
                onChange={(e) => setFormData({ ...formData, max_teams: parseInt(e.target.value) || 1 })}
              />
              <p className="text-xs text-muted-foreground">
                Maximum number of teams that can select this problem statement
              </p>
            </div>

            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="active"
                checked={formData.active}
                onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
                className="h-4 w-4"
              />
              <Label htmlFor="active" className="cursor-pointer">
                Active (visible to teams)
              </Label>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                editingId ? 'Update' : 'Create'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
