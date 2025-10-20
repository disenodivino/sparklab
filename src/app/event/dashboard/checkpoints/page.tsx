'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, Clock, Loader2, CheckCircle2, Circle } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { toast } from '@/hooks/use-toast';
import { format } from 'date-fns';

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
  }, []);

  const getStatusColor = (checkpoint: Checkpoint) => {
    if (checkpoint.isPast) return 'text-gray-400';
    if (checkpoint.isToday) return 'text-orange-500';
    if (checkpoint.daysRemaining <= 3) return 'text-red-500';
    if (checkpoint.daysRemaining <= 7) return 'text-yellow-500';
    return 'text-green-500';
  };

  const getTimeRemainingText = (checkpoint: Checkpoint) => {
    if (checkpoint.isPast) return 'Completed';
    if (checkpoint.isToday) return 'Due Today';
    if (checkpoint.daysRemaining === 1) return '1 day left';
    return `${checkpoint.daysRemaining} days left`;
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

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Event Timeline</h1>
        <p className="text-muted-foreground mt-2">Track all checkpoints and deadlines</p>
      </div>

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
              
              return (
                <div key={checkpoint.id} className="relative pl-16">
                  {/* Timeline dot */}
                  <div className="absolute left-0 top-0 flex items-center justify-center">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      checkpoint.isPast 
                        ? 'bg-gray-500/20 border-2 border-gray-400' 
                        : checkpoint.isToday
                        ? 'bg-orange-500/20 border-2 border-orange-500 animate-pulse'
                        : 'bg-primary/20 border-2 border-primary'
                    }`}>
                      {checkpoint.isPast ? (
                        <CheckCircle2 className="h-5 w-5 text-gray-400" />
                      ) : (
                        <Circle className={`h-5 w-5 ${getStatusColor(checkpoint)}`} fill="currentColor" />
                      )}
                    </div>
                  </div>

                  {/* Content card */}
                  <Card className={`${
                    checkpoint.isToday ? 'border-orange-500 border-2 shadow-lg' :
                    checkpoint.isPast ? 'opacity-60' : 
                    'border-primary/30'
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
                            ? 'bg-gray-500/10 text-gray-500' 
                            : checkpoint.isToday
                            ? 'bg-orange-500/10 text-orange-500'
                            : checkpoint.daysRemaining <= 3 
                            ? 'bg-red-500/10 text-red-500' 
                            : checkpoint.daysRemaining <= 7
                            ? 'bg-yellow-500/10 text-yellow-500'
                            : 'bg-green-500/10 text-green-500'}
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
                        
                        {!checkpoint.isPast && (
                          <div className={`flex items-center gap-2 font-semibold ${getStatusColor(checkpoint)}`}>
                            <Clock className="h-4 w-4" />
                            <span>
                              {checkpoint.isToday 
                                ? 'Due Today!' 
                                : checkpoint.daysRemaining < 0 
                                ? 'Overdue' 
                                : `${Math.abs(checkpoint.daysRemaining)} day${Math.abs(checkpoint.daysRemaining) !== 1 ? 's' : ''} remaining`
                              }
                            </span>
                          </div>
                        )}
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
