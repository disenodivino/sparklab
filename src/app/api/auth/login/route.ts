import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';
import { hashPassword, verifyPassword } from '@/lib/crypto';

// Initialize Supabase on the server side
const supabaseUrl = 'https://wawqvwyaijzcoynpxsvj.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Indhd3F2d3lhaWp6Y295bnB4c3ZqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA2OTIzMTMsImV4cCI6MjA3NjI2ODMxM30.qxZC5V6izAjl0cvyoJP6hsj_euQ1By5Ko4kLirE8L0I';
const supabase = createClient(supabaseUrl, supabaseKey);

export async function POST(request: Request) {
  console.log('Login API called');
  try {
    const body = await request.json();
    console.log('Request body received:', { ...body, password: body.password ? '******' : undefined });
    
    const { username, password } = body;
    
    if (!username || !password) {
      console.log('Missing username or password');
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
      console.log('User not found:', username);
      return NextResponse.json(
        { error: 'Invalid username or password' },
        { status: 401 }
      );
    }

    // Verify password against stored hash
    console.log(`Team input password: ${password}`);
    console.log(`Stored password hash: ${team.password_hash || 'No password hash stored'}`);
    
    // Verify the password hash
    if (!verifyPassword(password, team.password_hash)) {
      console.error('Password does not match');
      return NextResponse.json(
        { error: 'Invalid username or password' },
        { status: 401 }
      );
    }
    
    console.log('Login successful via password verification');
    
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
      
      console.log('Returning organizer user:', organizerUser);
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
    console.error('Login error:', error);
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