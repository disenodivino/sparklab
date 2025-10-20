import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';
import { hashPassword, verifyPassword } from '@/lib/crypto';

// Initialize Supabase on the server side
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Missing Supabase environment variables');
}

const supabase = createClient(supabaseUrl, supabaseKey);

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    const { username, password } = body;
    
    if (!username || !password) {
      return NextResponse.json(
        { error: 'Username and password are required' }, 
        { status: 400 }
      );
    }

    // Check the teams table for both organizer and team logins
    const { data: team, error: teamError } = await supabase
      .from('teams')
      .select('*')
      .eq('username', username)
      .single();

    if (teamError || !team) {
      return NextResponse.json(
        { error: 'Invalid username or password' },
        { status: 401 }
      );
    }

    // Verify password against stored hash
    // Verify the password hash
    if (!verifyPassword(password, team.password_hash)) {
      return NextResponse.json(
        { error: 'Invalid username or password' },
        { status: 401 }
      );
    }
    
    // Check if this is an organizer or team account
    const isOrganizer = team.role === 'organizer';
    
    if (isOrganizer) {
      // Return organizer user object
      const organizerUser = {
        id: team.id,
        email: team.username,
        name: team.team_name || 'Organizer',
        role: 'organizer',
        team_id: null
      };
      
      return NextResponse.json({ user: organizerUser });
    }
    
    // For team login, get team participants
    const { data: participants } = await supabase
      .from('users')
      .select('*')
      .eq('team_id', team.id);
    
    // Create a session for team
    const session = {
      user: {
        id: team.id,
        name: team.team_name,
        username: team.username,
        role: 'team',
        participants: participants || []
      }
    };

    return NextResponse.json(session);
  } catch (error) {
    // Return more detailed error information
    return NextResponse.json(
      { 
        error: 'An unexpected error occurred', 
        message: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined 
      },
      { status: 500 }
    );
  }
}