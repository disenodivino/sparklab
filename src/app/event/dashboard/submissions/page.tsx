'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FileText, Calendar, Clock, ExternalLink, Loader2, CheckCircle, XCircle } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { toast } from '@/hooks/use-toast';
import { formatDistanceToNow } from 'date-fns';

interface Submission {
  id: number;
  checkpoint_id: number;
  file_url: string;
  notes?: string;
  submitted_at: string;
  status: string;
  checkpoint?: {
    title: string;
    description: string;
    deadline: string;
  };
}

export default function SubmissionsPage() {
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchSubmissions() {
      try {
        // Get user data
        const userString = localStorage.getItem('user');
        if (!userString) return;
        
        const userData = JSON.parse(userString);
        const teamId = userData.id;

        // Fetch submissions with checkpoint details
        const { data: submissionsData, error: submissionsError } = await supabase
          .from('submissions')
          .select('*')
          .eq('team_id', teamId)
          .order('submitted_at', { ascending: false });

        if (submissionsError) throw submissionsError;

        // Fetch checkpoint details for each submission
        if (submissionsData && submissionsData.length > 0) {
          const checkpointIds = [...new Set(submissionsData.map(s => s.checkpoint_id))];
          const { data: checkpointsData } = await supabase
            .from('checkpoints')
            .select('*')
            .in('id', checkpointIds);

          // Combine data
          const enrichedSubmissions = submissionsData.map(submission => ({
            ...submission,
            checkpoint: checkpointsData?.find(c => c.id === submission.checkpoint_id)
          }));

          setSubmissions(enrichedSubmissions);
        } else {
          setSubmissions([]);
        }
      } catch (error) {
        console.error('Error fetching submissions:', error);
        toast({
          title: 'Error',
          description: 'Failed to load submissions',
          variant: 'destructive'
        });
      } finally {
        setLoading(false);
      }
    }

    fetchSubmissions();
  }, []);

  const getStatusBadge = (status: string) => {
    switch (status.toLowerCase()) {
      case 'submitted':
        return <Badge className="bg-blue-500/10 text-blue-500 border-blue-500/20">Submitted</Badge>;
      case 'approved':
        return <Badge className="bg-green-500/10 text-green-500 border-green-500/20">Approved</Badge>;
      case 'rejected':
        return <Badge className="bg-red-500/10 text-red-500 border-red-500/20">Rejected</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case 'approved':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'rejected':
        return <XCircle className="h-5 w-5 text-red-500" />;
      default:
        return <FileText className="h-5 w-5 text-blue-500" />;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full min-h-[60vh]">
        <div className="flex flex-col items-center">
          <Loader2 className="h-10 w-10 animate-spin text-primary" />
          <p className="mt-4">Loading submissions...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Your Submissions</h1>
        <p className="text-muted-foreground mt-2">View all your submitted work</p>
      </div>

      {submissions.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <FileText className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-semibold mb-2">No submissions yet</h3>
            <p className="text-muted-foreground">
              Your submitted work will appear here. Visit the Checkpoints page to submit your work.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {submissions.map((submission) => (
            <Card key={submission.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      {getStatusIcon(submission.status)}
                      <CardTitle>
                        {submission.checkpoint?.title || `Checkpoint #${submission.checkpoint_id}`}
                      </CardTitle>
                    </div>
                    <CardDescription>
                      {submission.checkpoint?.description || 'No description available'}
                    </CardDescription>
                  </div>
                  {getStatusBadge(submission.status)}
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Clock className="h-4 w-4" />
                    <span>
                      Submitted {formatDistanceToNow(new Date(submission.submitted_at), { addSuffix: true })}
                    </span>
                  </div>
                  {submission.checkpoint?.deadline && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Calendar className="h-4 w-4" />
                      <span>
                        Deadline: {new Date(submission.checkpoint.deadline).toLocaleDateString()}
                      </span>
                    </div>
                  )}
                </div>

                <div className="bg-secondary/20 rounded-lg p-4 space-y-3">
                  <div>
                    <p className="text-sm font-medium mb-2">Submitted File:</p>
                    <a
                      href={submission.file_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 text-sm text-primary hover:underline"
                    >
                      <ExternalLink className="h-4 w-4" />
                      <span className="truncate">{submission.file_url}</span>
                    </a>
                  </div>

                  {submission.notes && (
                    <div>
                      <p className="text-sm font-medium mb-2">Notes:</p>
                      <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                        {submission.notes}
                      </p>
                    </div>
                  )}
                </div>

                {submission.status.toLowerCase() === 'submitted' && (
                  <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-3">
                    <p className="text-sm text-blue-500">
                      Your submission is under review by the organizers
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
