import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

// Initialize Supabase on the server side
const supabaseUrl = 'https://wawqvwyaijzcoynpxsvj.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Indhd3F2d3lhaWp6Y295bnB4c3ZqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA2OTIzMTMsImV4cCI6MjA3NjI2ODMxM30.qxZC5V6izAjl0cvyoJP6hsj_euQ1By5Ko4kLirE8L0I';
const supabase = createClient(supabaseUrl, supabaseKey);

export async function GET() {
  try {
    // Get upcoming checkpoints
    const { data, error } = await supabase
      .from('checkpoints')
      .select('id, title, description, deadline')
      .order('deadline', { ascending: true });
      
    if (error) throw error;
    
    const now = new Date();
    const upcomingCheckpoints = data
      .filter(checkpoint => new Date(checkpoint.deadline) > now)
      .map(checkpoint => {
        const deadlineDate = new Date(checkpoint.deadline);
        const diffTime = deadlineDate.getTime() - now.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        
        return {
          id: checkpoint.id,
          title: checkpoint.title,
          description: checkpoint.description || '',
          deadline: checkpoint.deadline,
          daysRemaining: diffDays
        };
      })
      .slice(0, 3);
    
    return NextResponse.json({ checkpoints: upcomingCheckpoints });
  } catch (error) {
    console.error('Error getting upcoming checkpoints:', error);
    return NextResponse.json(
      { error: 'Failed to fetch upcoming checkpoints' },
      { status: 500 }
    );
  }
}