import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

// Initialize Supabase on the server side
const supabaseUrl = 'https://wawqvwyaijzcoynpxsvj.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Indhd3F2d3lhaWp6Y295bnB4c3ZqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA2OTIzMTMsImV4cCI6MjA3NjI2ODMxM30.qxZC5V6izAjl0cvyoJP6hsj_euQ1By5Ko4kLirE8L0I';
const supabase = createClient(supabaseUrl, supabaseKey);

export async function GET() {
  try {
    // Run queries in parallel for better performance
    const [
      teamsResult,
      participantsResult,
      checkpointsResult,
      messagesResult,
      submissionsResult
    ] = await Promise.all([
      // Get team count
      supabase.from('teams').select('*', { count: 'exact', head: true }),
      
      // Get participants count - avoid ambiguity with message foreign keys
      supabase.from('users').select('*', { count: 'exact', head: true }),
      
      // Get checkpoints
      supabase.from('checkpoints').select('*').order('deadline', { ascending: true }),
      
      // Get messages count
      supabase.from('messages').select('*', { count: 'exact', head: true }),
      
      // Get submissions count
      supabase.from('submissions').select('*', { count: 'exact', head: true })
    ]);
    
    // Check for errors
    if (teamsResult.error) throw teamsResult.error;
    if (participantsResult.error) throw participantsResult.error;
    if (checkpointsResult.error) throw checkpointsResult.error;
    if (messagesResult.error) throw messagesResult.error;
    if (submissionsResult.error) throw submissionsResult.error;
    
    // Get checkpoint data
    const now = new Date();
    const upcomingCheckpoints = checkpointsResult.data
      .filter(checkpoint => new Date(checkpoint.deadline) > now)
      .sort((a, b) => new Date(a.deadline).getTime() - new Date(b.deadline).getTime());
      
    const nextCheckpointDays = upcomingCheckpoints.length > 0
      ? Math.ceil((new Date(upcomingCheckpoints[0].deadline).getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
      : null;
    
    // Construct stats object
    const stats = {
      teamsCount: teamsResult.count || 0,
      participantsCount: participantsResult.count || 0,
      checkpointsCount: checkpointsResult.data.length,
      nextCheckpointDays,
      messagesCount: messagesResult.count || 0,
      unreadMessagesCount: Math.floor((messagesResult.count || 0) * 0.25), // For demo: 25% of messages are unread
      submissionsCount: submissionsResult.count || 0,
      pendingSubmissionsCount: Math.floor((submissionsResult.count || 0) * 0.4) // For demo: 40% of submissions need review
    };
    
    return NextResponse.json({ stats });
  } catch (error) {
    console.error('Error getting dashboard stats:', error);
    return NextResponse.json(
      { error: 'Failed to fetch dashboard statistics' },
      { status: 500 }
    );
  }
}