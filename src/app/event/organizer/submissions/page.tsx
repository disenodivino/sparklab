'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { toast } from '@/hooks/use-toast';
import { 
  FileText, 
  Search, 
  Download, 
  CheckCircle, 
  XCircle,
  Filter,
  Calendar
} from 'lucide-react';

// Mock data for initial development
const mockCheckpoints = [
  { id: 1, title: 'Initial Wireframes', deadline: '2025-10-21T23:59:59' },
  { id: 2, title: 'User Research', deadline: '2025-10-24T23:59:59' },
  { id: 3, title: 'Prototype', deadline: '2025-10-28T23:59:59' },
];

const mockSubmissions = [
  { 
    id: 1, 
    team_id: 1, 
    team_name: 'Design Masters',
    checkpoint_id: 1, 
    checkpoint_name: 'Initial Wireframes',
    file_url: 'https://example.com/files/designmasters_wireframes.pdf', 
    submitted_at: '2025-10-20T14:30:00',
    status: 'pending'
  },
  { 
    id: 2, 
    team_id: 2, 
    team_name: 'UX Warriors',
    checkpoint_id: 1, 
    checkpoint_name: 'Initial Wireframes',
    file_url: 'https://example.com/files/uxwarriors_wireframes.pdf', 
    submitted_at: '2025-10-20T15:45:00',
    status: 'approved'
  },
  { 
    id: 3, 
    team_id: 3, 
    team_name: 'Creative Minds',
    checkpoint_id: 1, 
    checkpoint_name: 'Initial Wireframes',
    file_url: 'https://example.com/files/creativeminds_wireframes.pdf', 
    submitted_at: '2025-10-20T16:20:00',
    status: 'rejected'
  },
];

export default function SubmissionsPage() {
  const [submissions, setSubmissions] = useState(mockSubmissions);
  const [checkpoints, setCheckpoints] = useState(mockCheckpoints);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCheckpointId, setFilterCheckpointId] = useState<number | null>(null);
  const [filterStatus, setFilterStatus] = useState<string | null>(null);
  
  const handleApproveSubmission = (id: number) => {
    setSubmissions(submissions.map(sub => 
      sub.id === id ? { ...sub, status: 'approved' } : sub
    ));
    
    toast({
      title: 'Success',
      description: 'Submission approved',
    });
  };
  
  const handleRejectSubmission = (id: number) => {
    setSubmissions(submissions.map(sub => 
      sub.id === id ? { ...sub, status: 'rejected' } : sub
    ));
    
    toast({
      title: 'Success',
      description: 'Submission rejected',
    });
  };
  
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="outline" className="bg-yellow-500/10 text-yellow-500 border-yellow-500/20">Pending</Badge>;
      case 'approved':
        return <Badge variant="outline" className="bg-green-500/10 text-green-500 border-green-500/20">Approved</Badge>;
      case 'rejected':
        return <Badge variant="outline" className="bg-red-500/10 text-red-500 border-red-500/20">Rejected</Badge>;
      default:
        return null;
    }
  };
  
  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    });
  };
  
  // Filter submissions based on search, checkpoint, and status
  const filteredSubmissions = submissions.filter(submission => {
    const matchesSearch = 
      submission.team_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      submission.checkpoint_name.toLowerCase().includes(searchQuery.toLowerCase());
      
    const matchesCheckpoint = filterCheckpointId === null || submission.checkpoint_id === filterCheckpointId;
    const matchesStatus = filterStatus === null || submission.status === filterStatus;
    
    return matchesSearch && matchesCheckpoint && matchesStatus;
  });
  
  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Submissions</h1>
          <p className="text-muted-foreground">Review and manage participant submissions</p>
        </div>
      </div>
      
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative md:flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search submissions..."
            className="pl-9"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        
        <div className="flex gap-2">
          <select
            className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            value={filterCheckpointId || ''}
            onChange={(e) => setFilterCheckpointId(e.target.value ? parseInt(e.target.value) : null)}
          >
            <option value="">All Checkpoints</option>
            {checkpoints.map((checkpoint) => (
              <option key={checkpoint.id} value={checkpoint.id}>
                {checkpoint.title}
              </option>
            ))}
          </select>
          
          <select
            className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            value={filterStatus || ''}
            onChange={(e) => setFilterStatus(e.target.value || null)}
          >
            <option value="">All Status</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>
      </div>
      
      <div className="grid grid-cols-1 gap-6">
        {filteredSubmissions.length === 0 ? (
          <Card>
            <CardContent className="flex items-center justify-center h-40">
              <p className="text-muted-foreground">No submissions found</p>
            </CardContent>
          </Card>
        ) : (
          filteredSubmissions.map((submission) => (
            <Card key={submission.id}>
              <CardHeader className="flex flex-row items-start justify-between space-y-0">
                <div>
                  <CardTitle className="text-lg flex items-center">
                    <FileText className="mr-2 h-5 w-5" />
                    {submission.team_name}
                  </CardTitle>
                  <CardDescription>
                    Checkpoint: {submission.checkpoint_name}
                  </CardDescription>
                </div>
                {getStatusBadge(submission.status)}
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center text-sm text-muted-foreground">
                  <Calendar className="mr-2 h-4 w-4" />
                  Submitted: {formatTimestamp(submission.submitted_at)}
                </div>
                
                <div className="flex flex-wrap gap-2">
                  <Button size="sm" variant="outline" asChild>
                    <a href={submission.file_url} target="_blank" rel="noopener noreferrer">
                      <Download className="mr-2 h-4 w-4" />
                      Download Submission
                    </a>
                  </Button>
                  
                  {submission.status === 'pending' && (
                    <>
                      <Button 
                        size="sm" 
                        variant="outline" 
                        className="text-green-500 hover:text-green-700 hover:bg-green-100/10"
                        onClick={() => handleApproveSubmission(submission.id)}
                      >
                        <CheckCircle className="mr-2 h-4 w-4" />
                        Approve
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline" 
                        className="text-red-500 hover:text-red-700 hover:bg-red-100/10"
                        onClick={() => handleRejectSubmission(submission.id)}
                      >
                        <XCircle className="mr-2 h-4 w-4" />
                        Reject
                      </Button>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}