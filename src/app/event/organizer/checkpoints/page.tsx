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

// Helper function to determine checkpoint status
const determineStatus = (deadline: string): 'open' | 'upcoming' | 'closed' => {
  const now = new Date();
  const deadlineDate = new Date(deadline);
  const timeDiff = deadlineDate.getTime() - now.getTime();
  const daysDiff = Math.ceil(timeDiff / (1000 * 60 * 60 * 24));
  
  if (daysDiff < 0) return 'closed';
  if (daysDiff <= 7) return 'open';
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
  
  // Fetch checkpoints from database
  useEffect(() => {
    async function fetchCheckpoints() {
      try {
        const { data, error } = await supabase
          .from('checkpoints')
          .select('*')
          .order('deadline', { ascending: true });
          
        if (error) {
          throw error;
        }
        
        // Process checkpoints and add status
        const processedCheckpoints = data.map(checkpoint => ({
          ...checkpoint,
          status: determineStatus(checkpoint.deadline)
        }));
        
        setCheckpoints(processedCheckpoints);
      } catch (error) {
        console.error('Error fetching checkpoints:', error);
        toast({
          title: 'Error',
          description: 'Failed to load checkpoints',
          variant: 'destructive',
        });
      } finally {
        setIsLoading(false);
      }
    }
    
    fetchCheckpoints();
  }, []);
  
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
      // Insert checkpoint into database
      const { data, error } = await supabase.from('checkpoints').insert({ 
        title, 
        description, 
        deadline: new Date(deadline).toISOString()
      }).select();
      
      if (error) throw error;
      
      // Add the new checkpoint to state
      if (data && data.length > 0) {
        const newCheckpoint = {
          ...data[0],
          status: determineStatus(data[0].deadline)
        };
        
        setCheckpoints([...checkpoints, newCheckpoint]);
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
  
  const handleEditCheckpoint = (checkpoint: Checkpoint) => {
    setEditingCheckpointId(checkpoint.id);
    setTitle(checkpoint.title);
    setDescription(checkpoint.description || '');
    
    // Format date for datetime-local input
    try {
      const dateObj = new Date(checkpoint.deadline);
      const isoString = dateObj.toISOString();
      const formattedDate = isoString.substring(0, isoString.length - 8); // Remove seconds and milliseconds
      setDeadline(formattedDate);
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
      // Update checkpoint in database
      const { error } = await supabase
        .from('checkpoints')
        .update({ 
          title, 
          description, 
          deadline: new Date(deadline).toISOString() 
        })
        .eq('id', editingCheckpointId);
      
      if (error) throw error;
      
      // Update local state
      setCheckpoints(checkpoints.map(checkpoint => 
        checkpoint.id === editingCheckpointId 
          ? { 
              ...checkpoint, 
              title, 
              description, 
              deadline: new Date(deadline).toISOString(),
              status: determineStatus(new Date(deadline).toISOString())
            }
          : checkpoint
      ));
      
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
    const date = new Date(deadline);
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    });
  };
  
  const getStatusBadge = (status: string, deadline: string) => {
    const now = new Date();
    const deadlineDate = new Date(deadline);
    const timeRemaining = deadlineDate.getTime() - now.getTime();
    const daysRemaining = Math.ceil(timeRemaining / (1000 * 60 * 60 * 24));
    
    if (status === 'open') {
      return (
        <div className="inline-flex items-center bg-green-500/10 text-green-500 px-2 py-1 rounded text-xs font-medium">
          <Clock className="mr-1 h-3 w-3" /> 
          {daysRemaining <= 0 ? 'Due today' : `${daysRemaining} days left`}
        </div>
      );
    }
    
    if (status === 'upcoming') {
      return (
        <div className="inline-flex items-center bg-blue-500/10 text-blue-500 px-2 py-1 rounded text-xs font-medium">
          <CalendarDays className="mr-1 h-3 w-3" />
          Upcoming
        </div>
      );
    }
    
    if (status === 'closed') {
      return (
        <div className="inline-flex items-center bg-gray-500/10 text-gray-500 px-2 py-1 rounded text-xs font-medium">
          Closed
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
          <p className="text-muted-foreground">Manage submission checkpoints and deadlines</p>
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
                <Input 
                  id="deadline" 
                  type="datetime-local"
                  value={deadline}
                  onChange={(e) => setDeadline(e.target.value)}
                />
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
                <Input 
                  id="edit-deadline" 
                  type="datetime-local"
                  value={deadline}
                  onChange={(e) => setDeadline(e.target.value)}
                />
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
                <CardDescription>Created: {checkpoint.created_at}</CardDescription>
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