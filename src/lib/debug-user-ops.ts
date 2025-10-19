// Helper function to debug Supabase user table operations
import { SupabaseClient } from '@supabase/supabase-js';

export async function debugUserInsert(
  supabase: SupabaseClient, 
  name: string, 
  team_id: number
) {
  console.log('DEBUG: Starting user insert check...');

  // 1. Check if team exists
  const { data: team, error: teamError } = await supabase
    .from('teams')
    .select('id, team_name')
    .eq('id', team_id)
    .single();

  if (teamError) {
    console.error('DEBUG: Team lookup error:', teamError);
    return { success: false, error: 'Team not found' };
  }

  console.log(`DEBUG: Found team ${team.team_name} with ID ${team.id}`);

  // 2. Try to insert the user
  try {
    const { data: userData, error: userError } = await supabase
      .from('users')
      .insert({
        name: name,
        team_id: team_id,
        created_at: new Date().toISOString()
      })
      .select();

    if (userError) {
      console.error('DEBUG: User insert error:', userError);
      
      // Try to get more detailed error information
      if (userError.message.includes('foreign key constraint')) {
        console.error('DEBUG: This appears to be a foreign key constraint violation');
      }
      
      return { success: false, error: userError };
    }

    console.log('DEBUG: User inserted successfully:', userData);
    return { success: true, data: userData };
  } catch (error) {
    console.error('DEBUG: Unexpected error during user insert:', error);
    return { success: false, error };
  }
}