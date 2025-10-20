'use client';

import { useState, useEffect, useRef } from 'react';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { 
  Calendar, 
  Clock, 
  AlertTriangle, 
  FileUp, 
  Upload, 
  Loader2, 
  RefreshCw 
} from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { format, formatDistanceToNow, isPast } from 'date-fns';
import { supabase } from "@/lib/supabase";

interface CheckpointsSectionProps {
  teamId: number;
}

interface Checkpoint {
  id: number;
  title: string;
  description: string;
  deadline: string;
  submission_open: boolean;
}

export default function CheckpointsSection({ teamId }: CheckpointsSectionProps) {
  const [checkpoints, setCheckpoints] = useState<Checkpoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [submissionFile, setSubmissionFile] = useState<File | null>(null);
  const [submissionCheckpointId, setSubmissionCheckpointId] = useState<number | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchCheckpoints();
  }, []);

  const fetchCheckpoints = async () => {
    setLoading(true);
    try {
      // Get checkpoints ordered by deadline (closest first)
      const { data, error } = await supabase
        .from('checkpoints')
        .select('*')
        .order('deadline', { ascending: true });
        
      if (error) throw error;
      
      // If no checkpoints, add some sample ones for demo
      if (!data || data.length === 0) {
        const now = new Date();
        
        // Checkpoint 1: Past (3 days ago)
        const pastDate = new Date(now);
        pastDate.setDate(now.getDate() - 3);
        
        // Checkpoint 2: Coming soon (in 2 days)
        const soonDate = new Date(now);
        soonDate.setDate(now.getDate() + 2);
        
        // Checkpoint 3: Future (in 10 days)
        const futureDate = new Date(now);
        futureDate.setDate(now.getDate() + 10);
        
        const sampleCheckpoints = [
          {
            title: 'Idea Submission',
            description: 'Submit your initial project idea and team formation details.',
            deadline: pastDate.toISOString(),
            submission_open: true
          },
          {
            title: 'Progress Update',
            description: 'Share your progress so far, including any challenges faced and solutions found.',
            deadline: soonDate.toISOString(),
            submission_open: true
          },
          {
            title: 'Final Submission',
            description: 'Submit your completed project with documentation and presentation materials.',
            deadline: futureDate.toISOString(),
            submission_open: false
          }
        ];
        
        const { data: newData, error: insertError } = await supabase
          .from('checkpoints')
          .insert(sampleCheckpoints)
          .select();
          
        if (insertError) throw insertError;
        
        setCheckpoints(newData || []);
      } else {
        setCheckpoints(data);
      }
      
      toast({
        title: "Checkpoints loaded",
        description: "Successfully loaded checkpoint data",
      });
    } catch (error) {
      console.error('Error fetching checkpoints:', error);
      toast({
        title: 'Error',
        description: 'Failed to load checkpoints',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };
  
  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchCheckpoints();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      
      // Check file type
      const fileType = file.type;
      if (fileType !== "application/pdf" && 
          fileType !== "application/vnd.ms-powerpoint" && 
          fileType !== "application/vnd.openxmlformats-officedocument.presentationml.presentation") {
        toast({
          title: "Invalid file type",
          description: "Please upload only PDF or PowerPoint files",
          variant: "destructive"
        });
        return;
      }
      
      // Check file size (limit to 10MB)
      if (file.size > 10 * 1024 * 1024) {
        toast({
          title: "File too large",
          description: "Please upload a file smaller than 10MB",
          variant: "destructive"
        });
        return;
      }
      
      setSubmissionFile(file);
    }
  };
  
  const submitFile = async () => {
    if (!submissionFile || !submissionCheckpointId || !teamId) {
      toast({
        title: "Missing information",
        description: "Please select a file and checkpoint",
        variant: "destructive"
      });
      return;
    }
    
    setSubmitting(true);
    
    try {
      // Upload file to Supabase storage
      const fileExt = submissionFile.name.split('.').pop();
      const fileName = `${teamId}_${submissionCheckpointId}_${Date.now()}.${fileExt}`;
      const filePath = `submissions/${fileName}`;
      
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('team-submissions')
        .upload(filePath, submissionFile);
        
      if (uploadError) throw uploadError;
      
      // Create submission record in database
      const { data: submissionData, error: submissionError } = await supabase
        .from('submissions')
        .insert({
          team_id: teamId,
          checkpoint_id: submissionCheckpointId,
          file_url: filePath,
          file_name: submissionFile.name,
          submitted_at: new Date().toISOString()
        })
        .select()
        .single();
        
      if (submissionError) throw submissionError;
      
      toast({
        title: "Submission successful",
        description: "Your file has been submitted successfully",
      });
      
      // Reset form
      setSubmissionFile(null);
      setSubmissionCheckpointId(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
      
    } catch (error) {
      console.error('Error submitting file:', error);
      toast({
        title: 'Submission failed',
        description: 'There was an error uploading your file. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setSubmitting(false);
    }
  };
  
  // Get current date for deadline comparisons
  const now = new Date();
  
  if (loading) {
    return (
      <Card className="border-secondary/30 backdrop-blur-xl bg-black/40 shadow-2xl">
        <CardContent className="p-6">
          <div className="flex flex-col items-center justify-center text-center py-12">
            <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
            <h3 className="font-medium text-lg">Loading checkpoints...</h3>
            <p className="text-muted-foreground mt-2">Fetching your deadlines and project milestones</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-secondary/30 backdrop-blur-xl bg-black/40 shadow-2xl">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <div>
          <CardTitle>Event Checkpoints</CardTitle>
          <CardDescription>Track your progress through event milestones</CardDescription>
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
        <div className="space-y-6">
          {checkpoints.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-6 text-center">
              <Clock className="h-12 w-12 text-muted-foreground mb-2" />
              <p>No checkpoints available yet.</p>
            </div>
          ) : (
            checkpoints.map((checkpoint) => {
              const deadline = new Date(checkpoint.deadline);
              const isPastDeadline = isPast(deadline);
              const timeRemaining = formatDistanceToNow(deadline, { addSuffix: true });
              
              return (
                <Card key={checkpoint.id} className={`border ${isPastDeadline ? 'border-muted' : 'border-primary/30'}`}>
                  <CardContent className="p-4">
                    <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <h3 className="font-medium text-lg">{checkpoint.title}</h3>
                          {isPastDeadline ? (
                            <Badge variant="outline">Past</Badge>
                          ) : (
                            <Badge variant="default">Upcoming</Badge>
                          )}
                        </div>
                        <p className="text-sm">{checkpoint.description}</p>
                        <div className="flex items-center gap-1 mt-2">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          <p className="text-sm text-muted-foreground">
                            {format(deadline, 'MMMM d, yyyy - h:mm a')}
                            {!isPastDeadline && (
                              <span className="ml-2 font-medium">
                                ({timeRemaining})
                              </span>
                            )}
                          </p>
                        </div>
                      </div>
                      
                      {checkpoint.submission_open && (
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button 
                              variant={isPastDeadline ? "outline" : "default"} 
                              size="sm"
                              onClick={() => setSubmissionCheckpointId(checkpoint.id)}
                            >
                              <FileUp className="mr-2 h-4 w-4" />
                              {isPastDeadline ? "Late Submission" : "Submit Now"}
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Submit for {checkpoint.title}</DialogTitle>
                              <DialogDescription>
                                Upload your PDF or PowerPoint presentation for this checkpoint.
                                {isPastDeadline && (
                                  <div className="flex items-center gap-2 mt-2 p-2 bg-amber-500/10 text-amber-500 rounded">
                                    <AlertTriangle className="h-4 w-4" />
                                    <span>This submission will be marked as late.</span>
                                  </div>
                                )}
                              </DialogDescription>
                            </DialogHeader>
                            
                            <div className="space-y-4 py-4">
                              <div className="grid w-full max-w-sm items-center gap-1.5">
                                <label htmlFor="file-upload" className="text-sm font-medium">
                                  Upload File (PDF or PPT only, max 10MB)
                                </label>
                                <Input 
                                  id="file-upload" 
                                  type="file" 
                                  accept=".pdf,.ppt,.pptx" 
                                  onChange={handleFileChange}
                                  ref={fileInputRef}
                                />
                              </div>
                              
                              {submissionFile && (
                                <div className="flex items-center gap-2 p-2 bg-secondary/20 rounded">
                                  <FileUp className="h-4 w-4" />
                                  <span className="text-sm">{submissionFile.name}</span>
                                </div>
                              )}
                            </div>
                            
                            <div className="flex justify-end gap-2">
                              <Button 
                                variant="ghost" 
                                onClick={() => {
                                  setSubmissionFile(null);
                                  setSubmissionCheckpointId(null);
                                  if (fileInputRef.current) {
                                    fileInputRef.current.value = "";
                                  }
                                }}
                              >
                                Cancel
                              </Button>
                              <Button 
                                onClick={submitFile} 
                                disabled={!submissionFile || submitting}
                              >
                                {submitting ? (
                                  <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Uploading...
                                  </>
                                ) : (
                                  <>
                                    <Upload className="mr-2 h-4 w-4" />
                                    Submit File
                                  </>
                                )}
                              </Button>
                            </div>
                          </DialogContent>
                        </Dialog>
                      )}
                    </div>
                    
                    {!isPastDeadline && (
                      <div className="mt-3">
                        <p className="text-xs text-muted-foreground mb-1">Time remaining</p>
                        <Progress 
                          value={
                            // Calculate percentage of time passed (capped at 100)
                            Math.min(100, 
                              100 - (((deadline.getTime() - now.getTime()) / 
                              (1000 * 60 * 60 * 24 * 7)) * 100)
                            )
                          } 
                          className="h-2"
                        />
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })
          )}
        </div>
      </CardContent>
    </Card>
  );
}