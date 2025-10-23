'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { FileText, Calendar, Clock, ExternalLink, Loader2, AlertCircle } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { toast } from '@/hooks/use-toast';

interface Form {
  id: number;
  title: string;
  description: string | null;
  form_link: string;
  deadline: string | null;
  created_at: string | null;
}

// Countdown Timer Component
function CountdownTimer({ deadline, isNextDeadline }: { deadline: string | null; isNextDeadline?: boolean }) {
  const [timeLeft, setTimeLeft] = useState<string>('');
  const [colorClass, setColorClass] = useState<string>('text-primary');

  useEffect(() => {
    if (!deadline) {
      setTimeLeft('No deadline');
      setColorClass('text-muted-foreground');
      return;
    }

    const updateTimer = () => {
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

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [deadline, isNextDeadline]);

  if (!deadline) {
    return <span className="text-muted-foreground">No deadline set</span>;
  }

  return (
    <span className={`${colorClass} font-semibold`}>
      {timeLeft}
    </span>
  );
}

export default function SubmissionsPage() {
  const [forms, setForms] = useState<Form[]>([]);
  const [loading, setLoading] = useState(true);
  const [nextDeadline, setNextDeadline] = useState<Form | null>(null);
  const [nextDeadlineId, setNextDeadlineId] = useState<number | null>(null);

  useEffect(() => {
    async function fetchForms() {
      try {
        const { data, error } = await supabase
          .from('forms')
          .select('*')
          .order('deadline', { ascending: true, nullsFirst: false });

        if (error) throw error;

        const formsData = (data as Form[]) || [];
        
        // Sort: upcoming deadlines first, then past deadlines, then no deadline
        const now = new Date().getTime();
        const sorted = formsData.sort((a, b) => {
          const aDeadline = a.deadline ? new Date(a.deadline).getTime() : Infinity;
          const bDeadline = b.deadline ? new Date(b.deadline).getTime() : Infinity;
          
          const aIsPast = aDeadline < now;
          const bIsPast = bDeadline < now;
          
          // Upcoming deadlines come first
          if (!aIsPast && bIsPast) return -1;
          if (aIsPast && !bIsPast) return 1;
          
          // Within same category, sort by deadline
          return aDeadline - bDeadline;
        });

        setForms(sorted);
        
        // Find the next upcoming deadline (not past)
        const upcoming = sorted.find(f => f.deadline && new Date(f.deadline).getTime() > now);
        setNextDeadline(upcoming || null);
        setNextDeadlineId(upcoming?.id || null);
      } catch (error) {
        console.error('Error fetching forms:', error);
        toast({
          title: 'Error',
          description: 'Failed to load submission forms',
          variant: 'destructive'
        });
      } finally {
        setLoading(false);
      }
    }

    fetchForms();

    // Set up real-time subscription for forms updates
    const formsChannel = supabase
      .channel('submissions_forms')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'forms' },
        () => {
          fetchForms();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(formsChannel);
    };
  }, []);

  const formatDeadline = (deadline: string | null) => {
    if (!deadline) return 'No deadline';
    try {
      const date = new Date(deadline);
      return date.toLocaleString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
      });
    } catch {
      return String(deadline);
    }
  };

  const isDeadlinePast = (deadline: string | null) => {
    if (!deadline) return false;
    return new Date(deadline).getTime() < new Date().getTime();
  };

  const getDeadlineStatus = (deadline: string | null, formId: number) => {
    if (!deadline) return { label: 'No deadline', color: 'gray' };
    
    const now = new Date().getTime();
    const target = new Date(deadline).getTime();
    const diff = target - now;
    
    if (diff <= 0) {
      return { label: 'Overdue', color: 'red' };
    } else if (formId === nextDeadlineId) {
      return { label: 'Next Deadline', color: 'green' };
    } else {
      return { label: 'Upcoming', color: 'orange' };
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
        <h1 className="text-3xl font-bold">Submission Forms</h1>
        <p className="text-muted-foreground mt-2">View and submit your work through the forms below</p>
      </div>

      {/* Highlighted Next Deadline */}
      {nextDeadline && (
        <Card className="border-2 border-green-500 bg-green-500/5">
          <CardHeader>
            <div className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-green-500" />
              <CardTitle className="text-lg text-green-500">Next Deadline</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div>
                <h3 className="font-semibold text-xl">{nextDeadline.title}</h3>
                {nextDeadline.description && (
                  <p className="text-sm text-muted-foreground mt-1">{nextDeadline.description}</p>
                )}
              </div>
              <div className="flex items-center gap-4 flex-wrap">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-green-500" />
                  <span className="text-sm font-medium">Time Remaining:</span>
                  <CountdownTimer deadline={nextDeadline.deadline} isNextDeadline={true} />
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">
                    Due: {formatDeadline(nextDeadline.deadline)}
                  </span>
                </div>
              </div>
              <Button asChild className="w-full sm:w-auto bg-green-500 hover:bg-green-600">
                <a href={nextDeadline.form_link} target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="mr-2 h-4 w-4" />
                  Open Submission Form
                </a>
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* All Forms List */}
      {forms.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <FileText className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-semibold mb-2">No submission forms available</h3>
            <p className="text-muted-foreground">
              Submission forms will appear here when organizers create them.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">All Submission Forms</h2>
          {forms.map((form) => {
            const isPast = isDeadlinePast(form.deadline);
            const status = getDeadlineStatus(form.deadline, form.id);
            const isNext = form.id === nextDeadlineId;
            
            const getBadgeClass = () => {
              switch (status.color) {
                case 'red':
                  return 'bg-red-500/10 text-red-500 border-red-500/20';
                case 'orange':
                  return 'bg-orange-500/10 text-orange-500 border-orange-500/20';
                case 'green':
                  return 'bg-green-500/10 text-green-500 border-green-500/20';
                default:
                  return 'bg-gray-500/10 text-gray-500 border-gray-500/20';
              }
            };

            const getCardBorderClass = () => {
              if (isPast) return '';
              switch (status.color) {
                case 'green':
                  return 'border-green-500/50';
                case 'orange':
                  return 'border-orange-500/50';
                default:
                  return '';
              }
            };

            const getButtonClass = () => {
              if (isPast) return '';
              switch (status.color) {
                case 'green':
                  return 'bg-green-500 hover:bg-green-600';
                case 'orange':
                  return 'bg-orange-500 hover:bg-orange-600';
                default:
                  return '';
              }
            };
            
            return (
              <Card key={form.id} className={`${isPast ? 'opacity-60' : ''} ${getCardBorderClass()} ${!isPast ? 'border-2' : ''}`}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <FileText className="h-5 w-5 text-primary" />
                        <CardTitle className="text-lg">{form.title}</CardTitle>
                        <Badge variant="outline" className={getBadgeClass()}>
                          {status.label}
                        </Badge>
                      </div>
                      {form.description && (
                        <CardDescription>{form.description}</CardDescription>
                      )}
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Calendar className="h-4 w-4" />
                      <span>Deadline: {formatDeadline(form.deadline)}</span>
                    </div>
                  </div>

                  <Button asChild variant={isPast ? 'outline' : 'default'} disabled={isPast} className={getButtonClass()}>
                    <a href={form.form_link} target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="mr-2 h-4 w-4" />
                      {isPast ? 'Submission Closed' : 'Open Form'}
                    </a>
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
