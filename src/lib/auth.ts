import { supabase } from './supabase';
import { verifyPassword } from './crypto';

export interface LoginCredentials {
  username: string;
  password: string;
}

export interface AuthResponse {
  user: any | null;
  error: string | null;
}

export async function loginUser({ username, password }: LoginCredentials): Promise<AuthResponse> {
  try {
    // Special case for the organizer account
    const organizerUsername = process.env.NEXT_PUBLIC_ORGANIZER_USERNAME || 'organizer';
    const organizerPassword = process.env.NEXT_PUBLIC_ORGANIZER_PASSWORD || 'password123';
    
    if (username === organizerUsername && password === organizerPassword) {
      if (process.env.NODE_ENV === 'development') {
        console.log('Organizer login successful via auth.ts');
      }
      
      // Use hardcoded values for organizer
      return { 
        user: {
          id: 'org-001',
          email: 'organizer@sparklab.com',
          name: 'Organizer',
          role: 'organizer',
          team_id: null
        }, 
        error: null 
      };
    }
    
    // For team login, check the teams table
    const { data: team, error: teamError } = await supabase
      .from('teams')
      .select('*')
      .eq('username', username)
      .single();

    if (teamError || !team) {
      return { user: null, error: 'Invalid username or password' };
    }

    // Verify password against stored hash
    if (!verifyPassword(password, team.password_hash)) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Password does not match');
      }
      return { user: null, error: 'Invalid username or password' };
    }
    
    if (process.env.NODE_ENV === 'development') {
      console.log('Login successful via password verification');
    }
    
    // Get team participants
    const { data: participants } = await supabase
      .from('participants')
      .select('*')
      .eq('team_id', team.id);

    // Create a team user session
    const teamUser = {
      id: team.id,
      name: team.name,
      username: team.username,
      role: 'team',
      participants: participants || []
    };

    // Store in localStorage
    localStorage.setItem('user', JSON.stringify(teamUser));

    return { user: teamUser, error: null };
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.error('Login error:', error);
    }
    return { user: null, error: 'An unexpected error occurred' };
  }
}

export function logoutUser() {
  localStorage.removeItem('user');
}

export function getCurrentUser() {
  const userStr = localStorage.getItem('user');
  if (!userStr) return null;
  try {
    return JSON.parse(userStr);
  } catch (e) {
    localStorage.removeItem('user');
    return null;
  }
}