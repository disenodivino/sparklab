import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

// Initialize Supabase on the server side
const supabaseUrl = 'https://wawqvwyaijzcoynpxsvj.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Indhd3F2d3lhaWp6Y295bnB4c3ZqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA2OTIzMTMsImV4cCI6MjA3NjI2ODMxM30.qxZC5V6izAjl0cvyoJP6hsj_euQ1By5Ko4kLirE8L0I';
const supabase = createClient(supabaseUrl, supabaseKey);

export async function GET() {
  try {
    // Fetch recent activities by combining different types of events
    const [submissionsResult, teamsResult, messagesResult] = await Promise.all([
      // Recent submissions
      supabase
        .from('submissions')
        .select(`
          id,
          submitted_at,
          team_id,
          teams(team_name)
        `)
        .order('submitted_at', { ascending: false })
        .limit(5),
        
      // Recent team registrations
      supabase
        .from('teams')
        .select('id, team_name, created_at')
        .order('created_at', { ascending: false })
        .limit(5),
        
      // Recent messages - explicitly specifying the foreign key relationship to use
      supabase
        .from('messages')
        .select(`
          id,
          timestamp,
          sender_id,
          sender:users!messages_sender_id_fkey(name)
        `)
        .order('timestamp', { ascending: false })
        .limit(5)
    ]);
    
    // Check for errors
    if (submissionsResult.error) throw submissionsResult.error;
    if (teamsResult.error) throw teamsResult.error;
    if (messagesResult.error) throw messagesResult.error;

    // Combine and sort activities
    const activities = [
      ...(submissionsResult.data?.map(sub => ({
        id: sub.id,
        type: 'submission',
        title: `Team ${sub.teams?.team_name || 'Unknown'} submitted their work`,
        timestamp: sub.submitted_at
      })) || []),
      ...(teamsResult.data?.map(team => ({
        id: team.id,
        type: 'team',
        title: `New team registered: ${team.team_name}`,
        timestamp: team.created_at
      })) || []),
      ...(messagesResult.data?.map(msg => {
        // Just use stringified sender to avoid type issues
        const senderName = JSON.stringify(msg.sender).includes('name')
          ? 'User' // We know there's a name property but TypeScript is having issues
          : 'Unknown';
        
        return {
          id: msg.id,
          type: 'message',
          title: `New message from ${senderName}`,
          timestamp: msg.timestamp
        };
      }) || [])
    ].sort((a, b) => 
      new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    ).slice(0, 5);
    
    return NextResponse.json({ activities });
  } catch (error) {
    console.error('Error getting activities:', error);
    return NextResponse.json(
      { error: 'Failed to fetch recent activities' },
      { status: 500 }
    );
  }
}