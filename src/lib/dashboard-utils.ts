'use client';

import { useEffect, useState, useCallback } from 'react';
import { supabase } from './supabase';

type SubscriptionCallback<T> = (payload: T) => void;

export function useRealtimeSubscription<T>(
  table: string,
  event: 'INSERT' | 'UPDATE' | 'DELETE' | '*' = '*',
  filter?: { column: string; value: any },
  callback?: SubscriptionCallback<T>
) {
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState<Error | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  // Use stable reference for filter value
  const filterValue = filter?.value;
  const filterColumn = filter?.column;

  useEffect(() => {
    // Skip if table is not provided
    if (!table) return;
    
    let mounted = true;
    
    const channel = supabase.channel(`${table}-changes-${Date.now()}`);
    
    const subscription = channel
      .on(
        'postgres_changes' as any, // Type assertion needed for Supabase realtime
        {
          event: event,
          schema: 'public',
          table: table,
          filter: filterColumn && filterValue !== undefined ? 
            `${filterColumn}=eq.${filterValue}` : undefined,
        } as any,
        (payload: any) => {
          if (mounted) {
            setData(payload.new as T);
            if (callback) {
              callback(payload.new as T);
            }
          }
        }
      )
      .subscribe((status) => {
        if (mounted) {
          if (status === 'SUBSCRIBED') {
            setIsConnected(true);
            setError(null);
          } else {
            setIsConnected(false);
            setError(new Error('Connection status: ' + status));
          }
        }
      });

    return () => {
      mounted = false;
      supabase.removeChannel(channel);
    };
  }, [table, event, filterColumn, filterValue]);

  return { data, error, isConnected };
}

export async function fetchDashboardData(teamId?: string) {
  try {
    if (!teamId) {
      return getEmptyDashboardData();
    }

    console.log('Fetching dashboard data for teamId:', teamId);
    
    // Create mock data with realistic structure
    const now = new Date();
    const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);
    const nextWeek = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
    
    return {
      teamId: teamId,
      team: null, // Will be fetched separately
      announcements: [
        {
          id: 'ann-1',
          title: 'Welcome to SparkLab 2025',
          content: 'Get ready for an amazing 30-hour designathon! Check your dashboard regularly for updates and important announcements.',
          created_at: now.toISOString(),
          updated_at: now.toISOString(),
          created_by: 'admin'
        },
        {
          id: 'ann-2',
          title: 'Checkpoint 1 - Project Ideation',
          content: 'First checkpoint is coming up! Make sure your team has finalized your project idea.',
          created_at: now.toISOString(),
          updated_at: now.toISOString(),
          created_by: 'admin'
        }
      ],
      messages: [
        {
          id: 'msg-1',
          content: 'Welcome to the team chat! Organizers will use this channel to communicate important updates.',
          created_at: now.toISOString(),
          sender_name: 'System',
          sender_id: 'system',
          team_id: null,
          is_read: true
        }
      ],
      checkpoints: [
        {
          id: 'cp-1',
          title: 'Project Ideation & Team Setup',
          description: 'Submit your initial project idea, team members list, and design approach.',
          deadline: tomorrow.toISOString(),
          created_at: now.toISOString()
        },
        {
          id: 'cp-2',
          title: 'Design Progress Update',
          description: 'Share your progress so far, including wireframes or prototypes.',
          deadline: new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000).toISOString(),
          created_at: now.toISOString()
        },
        {
          id: 'cp-3',
          title: 'Final Submission',
          description: 'Submit your final design with documentation and presentation materials.',
          deadline: nextWeek.toISOString(),
          created_at: now.toISOString()
        }
      ],
      submissions: []
    };
  } catch (error) {
    console.error('Error with dashboard data:', error);
    return getEmptyDashboardData();
  }
}

export function getEmptyDashboardData() {
  return {
    teamId: 'unknown',
    announcements: [],
    messages: [],
    checkpoints: [],
    submissions: [],
    team: null
  };
}

export async function submitFile(file: File, checkpointId: string, notes?: string) {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('checkpointId', checkpointId);
  if (notes) {
    formData.append('notes', notes);
  }

  try {
    const response = await fetch('/api/dashboard/submission', {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to submit file');
    }

    return await response.json();
  } catch (error) {
    console.error('Error submitting file:', error);
    throw error;
  }
}

export async function sendMessage(message: string, teamId?: string) {
  try {
    // Check if there's a user in localStorage
    const userString = localStorage.getItem('user');
    if (!userString) {
      throw new Error('Authentication required');
    }
    
    // Parse user data
    const user = JSON.parse(userString);
    
    // For development, create a mock successful response without making API call
    if (process.env.NODE_ENV === 'development') {
      console.log('Dev mode: Creating mock message response');
      
      // Create a mock message
      const mockMessage = {
        id: `msg-${Date.now()}`,
        content: message,
        created_at: new Date().toISOString(),
        sender_name: user.name || 'Team Member',
        sender_id: user.id || teamId,
        team_id: teamId,
        is_read: false
      };
      
      // Return mock response after a small delay to simulate network
      await new Promise(resolve => setTimeout(resolve, 300));
      
      return { message: mockMessage, success: true };
    }
    
    // In production, make the actual API call
    const response = await fetch('/api/dashboard/message', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message,
        teamId,
        userId: user.id,
        senderName: user.name || 'Team Member'
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to send message');
    }

    return await response.json();
  } catch (error) {
    console.error('Error sending message:', error);
    throw error;
  }
}

export async function markMessageAsRead(messageId: string) {
  try {
    const response = await fetch('/api/dashboard/message/read', {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        messageId,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to mark message as read');
    }

    return await response.json();
  } catch (error) {
    console.error('Error marking message as read:', error);
    throw error;
  }
}