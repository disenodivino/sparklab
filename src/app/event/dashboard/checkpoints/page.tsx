'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, Clock, Loader2, CheckCircle2, Circle } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { toast } from '@/hooks/use-toast';
import { format } from 'date-fns';

// Countdown Timer Component
function CountdownTimer({ deadline, isNextDeadline }: { deadline: string; isNextDeadline?: boolean }) {
  const [timeLeft, setTimeLeft] = useState<string>('');
  const [colorClass, setColorClass] = useState<string>('text-primary');

  useEffect(() => {
    const calculateTimeLeft = () => {
      const now = new Date().getTime();
      const target = new Date(deadline).getTime();
      const diff = target - now;

      if (diff <= 0) {
        setTimeLeft('Overdue');
        setColorClass('text-red-500');
        return;
      }

      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);

      // Color coding: green for next deadline, orange for other upcoming
      if (isNextDeadline) {
        setColorClass('text-green-500');
      } else {
        setColorClass('text-orange-500');
      }

      if (days > 0) {
        setTimeLeft(`${days}d ${hours}h ${minutes}m`);
      } else if (hours > 0) {
        setTimeLeft(`${hours}h ${minutes}m ${seconds}s`);
      } else if (minutes > 0) {
        setTimeLeft(`${minutes}m ${seconds}s`);
      } else {
        setTimeLeft(`${seconds}s`);
      }
    };

    calculateTimeLeft();
    const timer = setInterval(calculateTimeLeft, 1000);

    return () => clearInterval(timer);
  }, [deadline, isNextDeadline]);

  return (
    <span className={`${colorClass} font-semibold font-mono`}>
      {timeLeft}
    </span>
  );
}

interface Checkpoint {
  id: number;
  title: string;
  description: string;
  deadline: string;
  daysRemaining: number;
  isPast: boolean;
  isToday: boolean;
}

export default function CheckpointsPage() {
  const [checkpoints, setCheckpoints] = useState<Checkpoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [nextCheckpoint, setNextCheckpoint] = useState<Checkpoint | null>(null);
  const [nextCheckpointId, setNextCheckpointId] = useState<number | null>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        // Fetch checkpoints
        const { data: checkpointsData, error: checkpointsError } = await supabase
          .from('checkpoints')
          .select('*')
          .order('deadline', { ascending: true });

        if (checkpointsError) throw checkpointsError;

        // Process checkpoints
        const now = new Date();
        now.setHours(0, 0, 0, 0); // Reset to start of day for accurate comparison
        
        const processedCheckpoints = checkpointsData?.map(checkpoint => {
          const deadlineDate = new Date(checkpoint.deadline);
          deadlineDate.setHours(0, 0, 0, 0);
          
          const daysRemaining = Math.ceil((deadlineDate.getTime() - now.getTime()) / (1000 * 3600 * 24));
          const isPast = daysRemaining < 0;
          const isToday = daysRemaining === 0;

          return {
            id: checkpoint.id,
            title: checkpoint.title || 'Untitled Checkpoint',
            description: checkpoint.description || '',
            deadline: checkpoint.deadline,
            daysRemaining,
            isPast,
            isToday
          };
        }) || [];

        setCheckpoints(processedCheckpoints);
        
        // Find the next upcoming checkpoint (not past, not today)
        const nowTime = new Date().getTime();
        const upcoming = processedCheckpoints.find(cp => !cp.isPast && new Date(cp.deadline).getTime() > nowTime);
        setNextCheckpoint(upcoming || null);
        setNextCheckpointId(upcoming?.id || null);
      } catch (error) {
        console.error('Error fetching checkpoints:', error);
        toast({
          title: 'Error',
          description: 'Failed to load checkpoints',
          variant: 'destructive'
        });
      } finally {
        setLoading(false);
      }
    }

    fetchData();

    // Set up real-time subscription for checkpoints updates
    const checkpointsChannel = supabase
      .channel('checkpoints_page')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'checkpoints' },
        () => {
          fetchData();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(checkpointsChannel);
    };
  }, []);

  const getDeadlineStatus = (checkpoint: Checkpoint) => {
    if (checkpoint.isPast) {
      return { label: 'Overdue', color: 'red' };
    } else if (checkpoint.id === nextCheckpointId) {
      return { label: 'Next Deadline', color: 'green' };
    } else {
      return { label: 'Upcoming', color: 'orange' };
    }
  };

  const getStatusColor = (checkpoint: Checkpoint) => {
    if (checkpoint.isPast) return 'text-red-500';
    if (checkpoint.id === nextCheckpointId) return 'text-green-500';
    return 'text-orange-500';
  };

  const getTimeRemainingText = (checkpoint: Checkpoint) => {
    if (checkpoint.isPast) return 'Overdue';
    if (checkpoint.id === nextCheckpointId) return 'Next Deadline';
    return 'Upcoming';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full min-h-[60vh]">
        <div className="flex flex-col items-center">
          <Loader2 className="h-10 w-10 animate-spin text-primary" />
          <p className="mt-4">Loading checkpoints...</p>
        </div>
      </div>
    );
  }

  // Find the next immediate checkpoint (first checkpoint that is not past and not today)
  const nextCheckpointIndex = checkpoints.findIndex(cp => !cp.isPast && !cp.isToday);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Event Timeline</h1>
        <p className="text-muted-foreground mt-2">Track all checkpoints and deadlines</p>
      </div>

      {/* Highlighted Next Checkpoint */}
      {nextCheckpoint && (
        <Card className="border-2 border-green-500 bg-green-500/5">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-green-500" />
              <CardTitle className="text-lg text-green-500">Next Checkpoint</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div>
                <h3 className="font-semibold text-xl">{nextCheckpoint.title}</h3>
                {nextCheckpoint.description && (
                  <p className="text-sm text-muted-foreground mt-1">{nextCheckpoint.description}</p>
                )}
              </div>
              <div className="flex items-center gap-4 flex-wrap">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-green-500" />
                  <span className="text-sm font-medium">Time Remaining:</span>
                  <CountdownTimer deadline={nextCheckpoint.deadline} isNextDeadline={true} />
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">
                    Due: {format(new Date(nextCheckpoint.deadline), 'EEEE, MMMM d, yyyy')}
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {checkpoints.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No checkpoints scheduled yet</p>
          </CardContent>
        </Card>
      ) : (
        <div className="relative">
          {/* Vertical timeline line */}
          <div className="absolute left-5 top-0 bottom-0 w-0.5 bg-gradient-to-b from-primary/50 via-primary/30 to-transparent" />
          
          <div className="space-y-8">
            {checkpoints.map((checkpoint, index) => {
              const isLast = index === checkpoints.length - 1;
              const isNextCheckpoint = index === nextCheckpointIndex;
              
              return (
                <div key={checkpoint.id} className="relative pl-16">
                  {/* Timeline dot */}
                  <div className="absolute left-0 top-0 flex items-center justify-center">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      checkpoint.isPast 
                        ? 'bg-red-500/20 border-2 border-red-500' 
                        : checkpoint.id === nextCheckpointId
                        ? 'bg-green-500/20 border-2 border-green-500 animate-pulse'
                        : 'bg-orange-500/20 border-2 border-orange-500'
                    }`}>
                      {checkpoint.isPast ? (
                        <CheckCircle2 className="h-5 w-5 text-red-500" />
                      ) : (
                        <Circle className={`h-5 w-5 ${getStatusColor(checkpoint)}`} fill="currentColor" />
                      )}
                    </div>
                  </div>

                  {/* Content card */}
                  <Card className={`${
                    checkpoint.isPast ? 'opacity-60 border-red-500/30' :
                    checkpoint.id === nextCheckpointId ? 'border-2 border-green-500/50' :
                    'border-2 border-orange-500/50'
                  }`}>
                    <CardHeader>
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <CardTitle className="text-xl mb-2">
                            {checkpoint.title}
                          </CardTitle>
                          {checkpoint.description && (
                            <CardDescription className="text-base">
                              {checkpoint.description}
                            </CardDescription>
                          )}
                        </div>
                        
                        {/* Status badge */}
                        <div className={`
                          px-4 py-2 rounded-lg text-sm font-semibold whitespace-nowrap flex items-center gap-2
                          ${checkpoint.isPast 
                            ? 'bg-red-500/10 text-red-500 border-red-500/20 border' 
                            : checkpoint.id === nextCheckpointId
                            ? 'bg-green-500/10 text-green-500 border-green-500/20 border'
                            : 'bg-orange-500/10 text-orange-500 border-orange-500/20 border'}
                        `}>
                          <Clock className="h-4 w-4" />
                          {getTimeRemainingText(checkpoint)}
                        </div>
                      </div>
                    </CardHeader>
                    
                    <CardContent>
                      <div className="flex items-center gap-6 text-sm">
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Calendar className="h-4 w-4" />
                          <span className="font-medium">
                            {format(new Date(checkpoint.deadline), 'EEEE, MMMM d, yyyy')}
                          </span>
                        </div>
                        
                        <div className={`flex items-center gap-2 text-sm ${getStatusColor(checkpoint)}`}>
                          <Clock className="h-4 w-4" />
                          <span className="font-medium">
                            {format(new Date(checkpoint.deadline), 'h:mm a')}
                          </span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
