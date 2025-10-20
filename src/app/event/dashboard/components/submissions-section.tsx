'use client';

import { useState, useEffect } from 'react';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, FileUp, Loader2, RefreshCw, Download, FileX } from "lucide-react";
import { format } from 'date-fns';
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabase";

interface SubmissionsSectionProps {
  teamId: number;
}

interface Submission {
  id: number;
  team_id: number;
  checkpoint_id: number;
  file_url: string;
  file_name: string;
  submitted_at: string;
  checkpoint?: {
    title: string;
    deadline: string;
  };
}

export default function SubmissionsSection({ teamId }: SubmissionsSectionProps) {
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [downloading, setDownloading] = useState<number | null>(null);

  useEffect(() => {
    fetchSubmissions();
  }, [teamId]);

  const fetchSubmissions = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('submissions')
        .select('*, checkpoint:checkpoint_id(title, deadline)')
        .eq('team_id', teamId)
        .order('submitted_at', { ascending: false });
        
      if (error) throw error;
      
      setSubmissions(data || []);
      
      if (data && data.length > 0) {
        toast({
          title: "Submissions loaded",
          description: `Found ${data.length} submission${data.length !== 1 ? 's' : ''}`,
        });
      }
    } catch (error) {
      console.error('Error fetching submissions:', error);
      toast({
        title: 'Error',
        description: 'Failed to load submissions',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };
  
  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchSubmissions();
  };

  const handleDownload = async (submission: Submission) => {
    setDownloading(submission.id);
    try {
      const { data, error } = await supabase.storage
        .from('team-submissions')
        .download(submission.file_url);
      
      if (error) throw error;
      
      // Create a download link
      const url = URL.createObjectURL(data);
      const a = document.createElement('a');
      a.href = url;
      a.download = submission.file_name;
      document.body.appendChild(a);
      a.click();
      URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      toast({
        title: "Download started",
        description: `Downloading ${submission.file_name}`,
      });
    } catch (error) {
      console.error('Error downloading file:', error);
      toast({
        title: 'Download failed',
        description: 'There was an error downloading your file',
        variant: 'destructive',
      });
    } finally {
      setDownloading(null);
    }
  };
  
  const formatDateTime = (dateString: string) => {
    return format(new Date(dateString), 'MMMM d, yyyy - h:mm a');
  };

  if (loading) {
    return (
      <Card className="border-secondary/30 backdrop-blur-xl bg-black/40 shadow-2xl">
        <CardContent className="p-6">
          <div className="flex flex-col items-center justify-center text-center py-12">
            <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
            <h3 className="font-medium text-lg">Loading submissions...</h3>
            <p className="text-muted-foreground mt-2">Retrieving your submitted files</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-secondary/30 backdrop-blur-xl bg-black/40 shadow-2xl">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <div>
          <CardTitle>Your Submissions</CardTitle>
          <CardDescription>Files you have submitted for checkpoints</CardDescription>
        </div>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={handleRefresh} 
          disabled={refreshing}
        >
          <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
          <span className="sr-only">Refresh</span>
        </Button>
      </CardHeader>
      <CardContent>
        {submissions.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-12 text-center">
            <FileX className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="font-medium text-lg">No submissions yet</h3>
            <p className="text-muted-foreground mt-2 mb-6">
              You haven't submitted any files for checkpoints yet. Go to the Checkpoints tab to make a submission.
            </p>
            <Button onClick={() => document.querySelector('[value="checkpoints"]')?.dispatchEvent(new MouseEvent('click'))}>
              <Calendar className="mr-2 h-4 w-4" />
              View Checkpoints
            </Button>
          </div>
        ) : (
          <div className="grid gap-4">
            {submissions.map((submission) => (
              <Card key={submission.id} className="border-secondary/20">
                <CardContent className="p-4">
                  <div className="flex flex-col sm:flex-row justify-between gap-4">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <FileUp className="h-5 w-5 text-primary" />
                        <h3 className="font-medium text-base">{submission.file_name}</h3>
                      </div>
                      {submission.checkpoint && (
                        <p className="text-sm text-muted-foreground">
                          For checkpoint: {submission.checkpoint.title}
                        </p>
                      )}
                      <p className="text-xs text-muted-foreground">
                        Submitted on {formatDateTime(submission.submitted_at)}
                      </p>
                    </div>
                    
                    <div className="flex items-center">
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => handleDownload(submission)}
                        disabled={downloading === submission.id}
                      >
                        {downloading === submission.id ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Downloading...
                          </>
                        ) : (
                          <>
                            <Download className="mr-2 h-4 w-4" />
                            Download
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}