'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { toast } from '@/hooks/use-toast';
import { PlusCircle, Edit, Trash2, Calendar, RefreshCw, Clock, CalendarDays, Loader2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';

interface Checkpoint {
  id: number;
  title: string;
  description: string | null;
  deadline: string;
  created_at: string;
  status: 'open' | 'upcoming' | 'closed';
}

// Helper functions for IST time handling
const IST_TIMEZONE = 'Asia/Kolkata';

// Get current time in IST by creating a date in UTC and formatting in IST
const getCurrentTimeIST = (): Date => {
  const now = new Date();
  // Return the current time - we'll handle timezone conversion when needed
  return now;
};

// Format a date string to display in IST timezone
const formatToISTString = (dateStr: string): string => {
  const date = new Date(dateStr);
  return date.toLocaleString('en-IN', {
    timeZone: IST_TIMEZONE,
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  }) + ' IST';
};

// Explicitly convert local browser time to IST for storage in Supabase
const formatForStorage = (localDateTimeInput: string): string => {
  // Parse the user's input in local time
  const localDate = new Date(localDateTimeInput);
  
  // If the user inputs "2025-10-19T19:00", we want to store "2025-10-19T19:00:00+05:30"
  // We want to keep the same hour/minute but change the timezone to IST
  
  // Extract year, month, day, hour, minute from the local date
  const year = localDate.getFullYear();
  const month = String(localDate.getMonth() + 1).padStart(2, '0');
  const day = String(localDate.getDate()).padStart(2, '0');
  const hour = String(localDate.getHours()).padStart(2, '0');
  const minute = String(localDate.getMinutes()).padStart(2, '0');
  
  // Create an IST timestamp string directly
  // Format: YYYY-MM-DDTHH:MM:SS+05:30
  return `${year}-${month}-${day}T${hour}:${minute}:00+05:30`;
};

// Helper function to determine checkpoint status
const determineStatus = (deadline: string): 'open' | 'upcoming' | 'closed' => {
  const now = new Date();
  
  // Get the current time in IST
  const nowInIST = new Date(now.toLocaleString('en-US', { timeZone: IST_TIMEZONE }));
  
  // Get the deadline in IST
  const deadlineInIST = new Date(new Date(deadline).toLocaleString('en-US', { timeZone: IST_TIMEZONE }));
  
  // Compare dates in the same timezone
  const timeDiff = deadlineInIST.getTime() - nowInIST.getTime();
  const daysDiff = Math.ceil(timeDiff / (1000 * 60 * 60 * 24));
  
  if (timeDiff < 0) return 'closed'; // Past deadline
  if (daysDiff <= 7) return 'open';  // Within 7 days
  return 'upcoming';
};

export default function CheckpointsPage() {
  const [checkpoints, setCheckpoints] = useState<Checkpoint[]>([]);
  const [isAddingCheckpoint, setIsAddingCheckpoint] = useState(false);
  const [isEditingCheckpoint, setIsEditingCheckpoint] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Form states
  const [editingCheckpointId, setEditingCheckpointId] = useState<number | null>(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [deadline, setDeadline] = useState('');
  
  // Function to fetch and process checkpoints
  const fetchCheckpoints = async (showToastOnError = true) => {
    try {
      const { data, error } = await supabase
        .from('checkpoints')
        .select('*')
        .order('deadline', { ascending: true });
        
      if (error) {
        throw error;
      }
      
      // Process checkpoints and add status based on IST time
      const processedCheckpoints = data.map(checkpoint => ({
        ...checkpoint,
        status: determineStatus(checkpoint.deadline)
      }));
      
      // Sort checkpoints: open first, then upcoming, then closed
      const sortedCheckpoints = [...processedCheckpoints].sort((a, b) => {
        // First by status priority
        const statusPriority: Record<string, number> = { open: 0, upcoming: 1, closed: 2 };
        const statusDiff = statusPriority[a.status as string] - statusPriority[b.status as string];
        if (statusDiff !== 0) return statusDiff;
        
        // Within same status, sort by deadline
        const aDate = new Date(a.deadline);
        const bDate = new Date(b.deadline);
        return aDate.getTime() - bDate.getTime();
      });
      
      setCheckpoints(sortedCheckpoints);
      return true;
    } catch (error) {
      console.error('Error fetching checkpoints:', error);
      if (showToastOnError) {
        toast({
          title: 'Error',
          description: 'Failed to load checkpoints',
          variant: 'destructive',
        });
      }
      return false;
    } finally {
      setIsLoading(false);
    }
  };
  
  // Initial fetch and periodic refresh of checkpoints
  useEffect(() => {
    // Initial fetch
    fetchCheckpoints();
    
    // Set up auto-refresh every minute to update checkpoint statuses
    const intervalId = setInterval(() => {
      // Silent refresh (no error toasts)
      fetchCheckpoints(false);
    }, 60000); // Every minute
    
    // Clean up interval on component unmount
    return () => clearInterval(intervalId);
  }, []);
  
  // Re-evaluate statuses whenever the component renders to ensure accuracy
  useEffect(() => {
    if (checkpoints.length > 0) {
      const updatedCheckpoints = checkpoints.map(checkpoint => ({
        ...checkpoint,
        status: determineStatus(checkpoint.deadline)
      }));
      
      // Only update if statuses have changed
      const statusesChanged = updatedCheckpoints.some(
        (checkpoint, index) => checkpoint.status !== checkpoints[index].status
      );
      
      if (statusesChanged) {
        setCheckpoints(updatedCheckpoints);
      }
    }
  }, [checkpoints]);
  
  const handleAddCheckpoint = async () => {
    if (!title.trim() || !description.trim() || !deadline) {
      toast({
        title: 'Error',
        description: 'Please fill all fields',
        variant: 'destructive',
      });
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Format the deadline with explicit IST timezone
      const formattedDeadline = formatForStorage(deadline);
      
      // Debug information to help troubleshoot time issues
      console.log('Time Debug Info:');
      console.log('  Input deadline from form:', deadline);
      console.log('  Formatted for storage with IST timezone:', formattedDeadline);
      
      // Insert checkpoint into database with explicit IST timezone
      const { data, error } = await supabase.from('checkpoints').insert({ 
        title, 
        description, 
        deadline: formattedDeadline
      }).select();
      
      if (error) throw error;
      
      // Add the new checkpoint to state
      if (data && data.length > 0) {
        // Debug information about what we received from the database
        console.log('Database Response:');
        console.log('  DB deadline string:', data[0].deadline);
        console.log('  Parsed as Date:', new Date(data[0].deadline).toString());
        console.log('  Displayed format:', formatDeadline(data[0].deadline));
        console.log('  Status:', determineStatus(data[0].deadline));
        
        const newCheckpoint = {
          ...data[0],
          status: determineStatus(data[0].deadline)
        };
        
        // Add to checkpoints and re-sort
        const updatedCheckpoints = [...checkpoints, newCheckpoint];
        fetchCheckpoints(false); // Refresh to sort properly
      }
      
      // Reset form
      setTitle('');
      setDescription('');
      setDeadline('');
      setIsAddingCheckpoint(false);
      
      toast({
        title: 'Success',
        description: 'Checkpoint added successfully',
      });
    } catch (error) {
      console.error('Error adding checkpoint:', error);
      toast({
        title: 'Error',
        description: 'Failed to add checkpoint',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Format a date from the database for the datetime-local input
  // We need to convert from timestamptz to local browser time for the input
  const formatDateForInput = (dateString: string): string => {
    // First, create a date object from the database string (timestamptz)
    const date = new Date(dateString);
    
    // Format for datetime-local input (YYYY-MM-DDThh:mm) - use local browser time
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    
    // Log for debugging
    console.log('Edit conversion debug:');
    console.log('  DB date string:', dateString);
    console.log('  Parsed as Date:', date.toString());
    console.log('  Formatted for input:', `${year}-${month}-${day}T${hours}:${minutes}`);
    
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  };

  const handleEditCheckpoint = (checkpoint: Checkpoint) => {
    setEditingCheckpointId(checkpoint.id);
    setTitle(checkpoint.title);
    setDescription(checkpoint.description || '');
    
    // Format date for datetime-local input
    try {
      // With timestamptz, browser automatically converts to local timezone
      setDeadline(formatDateForInput(checkpoint.deadline));
    } catch (error) {
      setDeadline('');
      console.error('Error formatting date:', error);
    }
    
    setIsEditingCheckpoint(true);
  };
  
  const handleUpdateCheckpoint = async () => {
    if (!title.trim() || !deadline) {
      toast({
        title: 'Error',
        description: 'Please fill all required fields',
        variant: 'destructive',
      });
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Format deadline with explicit IST timezone
      const formattedDeadline = formatForStorage(deadline);
      
      // Debug information for update
      console.log('Update Checkpoint Debug:');
      console.log('  Input deadline from form:', deadline);
      console.log('  Formatted for storage with IST timezone:', formattedDeadline);
      
      // Update checkpoint in database with explicit timezone
      const { error } = await supabase
        .from('checkpoints')
        .update({ 
          title, 
          description, 
          deadline: formattedDeadline
        })
        .eq('id', editingCheckpointId);
      
      if (error) throw error;
      
      // Refresh to ensure proper sorting and status calculation with IST time
      fetchCheckpoints(false);
      
      // Reset form
      setTitle('');
      setDescription('');
      setDeadline('');
      setEditingCheckpointId(null);
      setIsEditingCheckpoint(false);
      
      toast({
        title: 'Success',
        description: 'Checkpoint updated successfully',
      });
    } catch (error) {
      console.error('Error updating checkpoint:', error);
      toast({
        title: 'Error',
        description: 'Failed to update checkpoint',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const handleDeleteCheckpoint = async (id: number) => {
    if (confirm('Are you sure you want to delete this checkpoint?')) {
      setIsSubmitting(true);
      
      try {
        // Check if checkpoint has submissions
        const { count, error: countError } = await supabase
          .from('submissions')
          .select('*', { count: 'exact', head: true })
          .eq('checkpoint_id', id);
        
        if (countError) throw countError;
        
        if (count && count > 0) {
          toast({
            title: 'Cannot Delete',
            description: 'This checkpoint has submissions and cannot be deleted',
            variant: 'destructive',
          });
          return;
        }
        
        // Delete checkpoint from database
        const { error } = await supabase.from('checkpoints').delete().eq('id', id);
        
        if (error) throw error;
        
        // Update local state
        setCheckpoints(checkpoints.filter(checkpoint => checkpoint.id !== id));
        
        toast({
          title: 'Success',
          description: 'Checkpoint deleted successfully',
        });
      } catch (error) {
        console.error('Error deleting checkpoint:', error);
        toast({
          title: 'Error',
          description: 'Failed to delete checkpoint',
          variant: 'destructive',
        });
      } finally {
        setIsSubmitting(false);
      }
    }
  };
  
  const formatDeadline = (deadline: string) => {
    // Simply use our helper function to format the date in IST
    return formatToISTString(deadline);
  };
  
  const getStatusBadge = (status: string, deadline: string) => {
    // Use the same method as determineStatus for consistency
    const now = new Date();
    
    // Get the current time in IST
    const nowInIST = new Date(now.toLocaleString('en-US', { timeZone: IST_TIMEZONE }));
    
    // Get the deadline in IST
    const deadlineInIST = new Date(new Date(deadline).toLocaleString('en-US', { timeZone: IST_TIMEZONE }));
    
    // Compare dates in the same timezone
    const timeRemaining = deadlineInIST.getTime() - nowInIST.getTime();
    const daysRemaining = Math.ceil(timeRemaining / (1000 * 60 * 60 * 24));
    const hoursRemaining = Math.ceil(timeRemaining / (1000 * 60 * 60));
    const minutesRemaining = Math.ceil(timeRemaining / (1000 * 60));
    
    // Force a re-check of the status based on current time
    const currentStatus = determineStatus(deadline);
    
    if (currentStatus === 'open') {
      let timeDisplay = '';
      if (timeRemaining <= 0) {
        timeDisplay = 'Deadline passed';
      } else if (hoursRemaining <= 1) {
        // Show minutes when less than 1 hour remains
        timeDisplay = `${minutesRemaining} minutes left`;
      } else {
        // Always show hours
        timeDisplay = `${hoursRemaining} hours left`;
      }
      
      return (
        <div className="inline-flex items-center bg-green-500/10 text-green-500 px-2 py-1 rounded text-xs font-medium">
          <Clock className="mr-1 h-3 w-3" /> 
          {timeDisplay}
        </div>
      );
    }
    
    if (currentStatus === 'upcoming') {
      return (
        <div className="inline-flex items-center bg-blue-500/10 text-blue-500 px-2 py-1 rounded text-xs font-medium">
          <CalendarDays className="mr-1 h-3 w-3" />
          Upcoming ({hoursRemaining} hours)
        </div>
      );
    }
    
    if (currentStatus === 'closed') {
      return (
        <div className="inline-flex items-center bg-gray-500/10 text-gray-500 px-2 py-1 rounded text-xs font-medium">
          Completed
        </div>
      );
    }
    
    return null;
  };
  
  if (isLoading) {
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
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Checkpoints</h1>
          <p className="text-muted-foreground">
            Manage submission checkpoints and deadlines (Indian Standard Time)
            <span className="ml-2 text-xs text-muted-foreground">
              Current IST: {new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}
            </span>
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          <Button 
            variant="outline" 
            onClick={async () => {
              const success = await fetchCheckpoints();
              if (success) {
                toast({
                  title: 'Refreshed',
                  description: 'Checkpoint statuses updated successfully',
                });
              }
            }}
            disabled={isLoading}
          >
            <RefreshCw className={`mr-2 h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh Status
          </Button>
        </div>
        
        <Dialog open={isAddingCheckpoint} onOpenChange={setIsAddingCheckpoint}>
          <DialogTrigger asChild>
            <Button>
              <PlusCircle className="mr-2 h-4 w-4" />
              Add Checkpoint
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Add New Checkpoint</DialogTitle>
              <DialogDescription>
                Create a new submission checkpoint with a deadline.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="title">Title</Label>
                <Input 
                  id="title" 
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Enter checkpoint title"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea 
                  id="description" 
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Enter checkpoint description"
                  rows={3}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="deadline">Deadline</Label>
                <div className="space-y-1">
                  <Input 
                    id="deadline" 
                    type="datetime-local"
                    value={deadline}
                    onChange={(e) => setDeadline(e.target.value)}
                  />
                  <p className="text-xs text-muted-foreground">
                    Enter deadline in your local time. All times are displayed in IST on the dashboard.
                  </p>
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsAddingCheckpoint(false)}>Cancel</Button>
              <Button onClick={handleAddCheckpoint} disabled={isSubmitting}>
                {isSubmitting && <RefreshCw className="mr-2 h-4 w-4 animate-spin" />}
                Add Checkpoint
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
        
        <Dialog open={isEditingCheckpoint} onOpenChange={setIsEditingCheckpoint}>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Edit Checkpoint</DialogTitle>
              <DialogDescription>
                Update checkpoint details and deadline.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="edit-title">Title</Label>
                <Input 
                  id="edit-title" 
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="edit-description">Description</Label>
                <Textarea 
                  id="edit-description" 
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="edit-deadline">Deadline</Label>
                <div className="space-y-1">
                  <Input 
                    id="edit-deadline" 
                    type="datetime-local"
                    value={deadline}
                    onChange={(e) => setDeadline(e.target.value)}
                  />
                  <p className="text-xs text-muted-foreground">
                    Enter deadline in your local time. All times are displayed in IST on the dashboard.
                  </p>
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsEditingCheckpoint(false)}>Cancel</Button>
              <Button onClick={handleUpdateCheckpoint} disabled={isSubmitting}>
                {isSubmitting && <RefreshCw className="mr-2 h-4 w-4 animate-spin" />}
                Update Checkpoint
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
      
      <div className="grid grid-cols-1 gap-6">
        {checkpoints.map((checkpoint) => (
          <Card key={checkpoint.id}>
            <CardHeader className="flex flex-row items-start justify-between space-y-0">
              <div>
                <CardTitle className="text-lg">{checkpoint.title}</CardTitle>
                <CardDescription>
                  Created: {checkpoint.created_at ? formatToISTString(checkpoint.created_at) : 'N/A'}
                </CardDescription>
              </div>
              {getStatusBadge(checkpoint.status, checkpoint.deadline)}
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm">{checkpoint.description}</p>
              
              <div className="flex items-center text-sm text-muted-foreground">
                <Calendar className="mr-2 h-4 w-4" />
                Deadline: {formatDeadline(checkpoint.deadline)}
              </div>
              
              <div className="flex justify-end space-x-2">
                <Button size="sm" variant="outline" onClick={() => handleEditCheckpoint(checkpoint)}>
                  <Edit className="mr-2 h-4 w-4" />
                  Edit
                </Button>
                <Button 
                  size="sm" 
                  variant="outline" 
                  className="text-red-500 hover:text-red-700"
                  onClick={() => handleDeleteCheckpoint(checkpoint.id)}
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}