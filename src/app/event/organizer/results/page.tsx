'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2, Trophy, Award, Crown, Star, Lightbulb, Heart, Users, Eye, EyeOff, Save, Check, ExternalLink } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { toast } from '@/hooks/use-toast';
import Link from 'next/link';

interface Team {
  id: number;
  team_name: string;
}

interface Result {
  id: number;
  category: string;
  team_id: number | null;
}

interface PrizeCategory {
  category: string;
  icon: any;
  title: string;
  amount: string;
  description: string;
  gradient: string;
}

const prizeCategories: PrizeCategory[] = [
  {
    category: 'champion',
    icon: Crown,
    title: 'Champion Team',
    amount: 'Rs.15,000',
    description: 'The ultimate winner - 1st Place',
    gradient: 'from-yellow-400 to-orange-500',
  },
  {
    category: 'runner_up',
    icon: Trophy,
    title: 'Runner-up',
    amount: 'Rs.10,000',
    description: 'Excellence in performance - 2nd Place',
    gradient: 'from-slate-300 to-slate-500',
  },
  {
    category: 'third_place',
    icon: Award,
    title: 'Third Place',
    amount: 'Rs.6,000',
    description: 'Outstanding achievement - 3rd Place',
    gradient: 'from-amber-600 to-amber-800',
  },
  {
    category: 'best_womens_team',
    icon: Star,
    title: "Best Women's Team",
    amount: 'Rs.2,000',
    description: 'Celebrating diversity and innovation',
    gradient: 'from-pink-400 to-purple-500',
  },
  {
    category: 'most_innovative',
    icon: Lightbulb,
    title: 'Most Innovative Solution',
    amount: 'Rs.2,000',
    description: 'Breakthrough thinking and creativity',
    gradient: 'from-blue-400 to-cyan-500',
  },
  {
    category: 'peoples_choice',
    icon: Heart,
    title: "People's Choice Award",
    amount: 'Rs.2,000',
    description: 'Loved by the community',
    gradient: 'from-red-400 to-pink-500',
  },
  {
    category: 'special_recognition',
    icon: Award,
    title: 'Special Recognition',
    amount: 'Rs.3,000',
    description: 'Exceptional contribution and effort',
    gradient: 'from-green-400 to-emerald-500',
  },
];

export default function OrganizerResultsPage() {
  const [teams, setTeams] = useState<Team[]>([]);
  const [results, setResults] = useState<Result[]>([]);
  const [resultsVisible, setResultsVisible] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [selectedWinners, setSelectedWinners] = useState<Record<string, number | null>>({});
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    try {
      setLoading(true);

      // Fetch all teams (excluding organizer)
      const { data: teamsData, error: teamsError } = await supabase
        .from('teams')
        .select('id, team_name')
        .is('role', null)
        .order('team_name', { ascending: true });

      if (teamsError) throw teamsError;
      setTeams(teamsData || []);

      // Fetch current results
      const { data: resultsData, error: resultsError } = await supabase
        .from('results')
        .select('*');

      if (resultsError) throw resultsError;
      setResults(resultsData || []);

      // Set selected winners
      const winners: Record<string, number | null> = {};
      resultsData?.forEach(result => {
        winners[result.category] = result.team_id;
      });
      setSelectedWinners(winners);

      // Fetch visibility setting
      const { data: settingsData, error: settingsError } = await supabase
        .from('event_settings')
        .select('results_visible')
        .eq('id', 1)
        .single();

      if (settingsError) throw settingsError;
      setResultsVisible(settingsData?.results_visible || false);

    } catch (error) {
      console.error('Error fetching data:', error);
      toast({
        title: 'Error',
        description: 'Failed to load results data',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }

  async function handleSaveResults() {
    try {
      setSaving(true);

      // Update each result
      const updates = Object.entries(selectedWinners).map(async ([category, teamId]) => {
        return supabase
          .from('results')
          .update({ team_id: teamId, updated_at: new Date().toISOString() })
          .eq('category', category);
      });

      const results = await Promise.all(updates);
      const errors = results.filter(r => r.error);

      if (errors.length > 0) {
        throw new Error('Failed to update some results');
      }

      toast({
        title: 'Success',
        description: 'Results saved successfully',
      });

      setHasChanges(false);
      fetchData();
    } catch (error) {
      console.error('Error saving results:', error);
      toast({
        title: 'Error',
        description: 'Failed to save results',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  }

  async function handleToggleVisibility(visible: boolean) {
    try {
      const { error } = await supabase
        .from('event_settings')
        .update({ results_visible: visible, updated_at: new Date().toISOString() })
        .eq('id', 1);

      if (error) throw error;

      setResultsVisible(visible);
      toast({
        title: 'Success',
        description: `Results are now ${visible ? 'visible' : 'hidden'} to the public`,
      });
    } catch (error) {
      console.error('Error toggling visibility:', error);
      toast({
        title: 'Error',
        description: 'Failed to update visibility',
        variant: 'destructive',
      });
    }
  }

  function handleWinnerChange(category: string, teamId: string | null) {
    setSelectedWinners(prev => ({
      ...prev,
      [category]: teamId && teamId !== 'none' ? parseInt(teamId) : null,
    }));
    setHasChanges(true);
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full min-h-[60vh]">
        <div className="flex flex-col items-center">
          <Loader2 className="h-10 w-10 animate-spin text-primary" />
          <p className="mt-4">Loading results...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Manage Results</h1>
          <p className="text-muted-foreground mt-2">
            Select winners for each category and control results visibility
          </p>
        </div>
        <Link href="/results" target="_blank">
          <Button variant="outline" size="sm" className="gap-2">
            <ExternalLink className="h-4 w-4" />
            Preview Results
          </Button>
        </Link>
      </div>

      {/* Visibility Control */}
      <Card className="border-2">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {resultsVisible ? <Eye className="h-5 w-5" /> : <EyeOff className="h-5 w-5" />}
            Results Visibility
          </CardTitle>
          <CardDescription>
            Control whether results are visible to the public on /results page
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label htmlFor="visibility" className="text-base font-medium">
                Make results public
              </Label>
              <p className="text-sm text-muted-foreground">
                {resultsVisible 
                  ? 'Results are currently visible to everyone' 
                  : 'Results are hidden from the public'}
              </p>
            </div>
            <Switch
              id="visibility"
              checked={resultsVisible}
              onCheckedChange={handleToggleVisibility}
            />
          </div>
          {resultsVisible && (
            <div className="mt-4 p-3 rounded-lg bg-green-500/10 border border-green-500/20">
              <p className="text-sm text-green-700 dark:text-green-400 flex items-center gap-2">
                <Check className="h-4 w-4" />
                Results page is live and accessible at <strong>/results</strong>
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Save Changes Button */}
      {hasChanges && (
        <div className="flex justify-end">
          <Button onClick={handleSaveResults} disabled={saving} size="lg" className="gap-2">
            {saving ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="h-5 w-5" />
                Save All Changes
              </>
            )}
          </Button>
        </div>
      )}

      {/* Main Prizes */}
      <div>
        <h2 className="text-2xl font-bold mb-4">Top 3 Winners</h2>
        <div className="grid gap-6">
          {prizeCategories.slice(0, 3).map((prize) => {
            const Icon = prize.icon;
            const currentWinner = selectedWinners[prize.category];
            
            return (
              <Card key={prize.category} className="border-2">
                <CardHeader>
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-center gap-4">
                      <div className={`p-4 rounded-full bg-gradient-to-br ${prize.gradient}`}>
                        <Icon className="h-8 w-8 text-white" />
                      </div>
                      <div>
                        <CardTitle className="text-xl">{prize.title}</CardTitle>
                        <CardDescription>{prize.description}</CardDescription>
                        <p className={`text-2xl font-bold mt-2 bg-gradient-to-r ${prize.gradient} bg-clip-text text-transparent`}>
                          {prize.amount}
                        </p>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <Label htmlFor={`winner-${prize.category}`}>Select Winner</Label>
                    <Select
                      value={currentWinner?.toString() || 'none'}
                      onValueChange={(value) => handleWinnerChange(prize.category, value || null)}
                    >
                      <SelectTrigger id={`winner-${prize.category}`}>
                        <SelectValue placeholder="Select a team..." />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">No winner yet</SelectItem>
                        {teams.map((team) => (
                          <SelectItem key={team.id} value={team.id.toString()}>
                            {team.team_name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Special Recognition Awards */}
      <div>
        <h2 className="text-2xl font-bold mb-4">Special Recognition Awards</h2>
        <div className="grid gap-4 md:grid-cols-2">
          {prizeCategories.slice(3).map((prize) => {
            const Icon = prize.icon;
            const currentWinner = selectedWinners[prize.category];
            
            return (
              <Card key={prize.category}>
                <CardHeader>
                  <div className="flex items-start gap-3">
                    <div className={`p-3 rounded-full bg-gradient-to-br ${prize.gradient}`}>
                      <Icon className="h-6 w-6 text-white" />
                    </div>
                    <div className="flex-1">
                      <CardTitle className="text-lg">{prize.title}</CardTitle>
                      <CardDescription className="text-sm">{prize.description}</CardDescription>
                      <p className={`text-xl font-bold mt-1 bg-gradient-to-r ${prize.gradient} bg-clip-text text-transparent`}>
                        {prize.amount}
                      </p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <Label htmlFor={`winner-${prize.category}`} className="text-sm">Select Winner</Label>
                    <Select
                      value={currentWinner?.toString() || 'none'}
                      onValueChange={(value) => handleWinnerChange(prize.category, value || null)}
                    >
                      <SelectTrigger id={`winner-${prize.category}`}>
                        <SelectValue placeholder="Select a team..." />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">No winner yet</SelectItem>
                        {teams.map((team) => (
                          <SelectItem key={team.id} value={team.id.toString()}>
                            {team.team_name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Summary</CardTitle>
          <CardDescription>Overview of selected winners</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {prizeCategories.map((prize) => {
              const currentWinner = selectedWinners[prize.category];
              const winnerTeam = teams.find(t => t.id === currentWinner);
              
              return (
                <div key={prize.category} className="flex items-center justify-between py-2 border-b last:border-b-0">
                  <span className="font-medium">{prize.title}</span>
                  {winnerTeam ? (
                    <Badge variant="secondary" className="gap-2">
                      <Users className="h-3 w-3" />
                      {winnerTeam.team_name}
                    </Badge>
                  ) : (
                    <Badge variant="outline">Not assigned</Badge>
                  )}
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Save Changes Button (bottom) */}
      {hasChanges && (
        <div className="flex justify-end">
          <Button onClick={handleSaveResults} disabled={saving} size="lg" className="gap-2">
            {saving ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="h-5 w-5" />
                Save All Changes
              </>
            )}
          </Button>
        </div>
      )}
    </div>
  );
}
