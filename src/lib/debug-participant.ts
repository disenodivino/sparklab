import { supabase } from './supabase';

const isDev = process.env.NODE_ENV === 'development';

export async function testParticipantInsertion() {
  const testTeamId = 1; // Use an existing team ID
  const timestamp = new Date().toISOString();
  
  if (isDev) console.log('Testing participant insertion...');
  
  try {
    // Attempt to insert a test participant
    const { data: participantData, error: participantError } = await supabase
      .from('participants')
      .insert({
        name: 'Test Participant ' + timestamp,
        team_id: testTeamId,
        created_at: timestamp
      })
      .select();
      
    if (participantError) {
      if (isDev) {
        console.error('Participant insertion error:', participantError);
        console.error('Error details:', participantError.message, participantError.details);
      }
      return { success: false, error: participantError };
    }
    
    if (isDev) console.log('Participant inserted successfully:', participantData);
    
    // Now attempt to insert into users table
    const { data: userData, error: userError } = await supabase
      .from('users')
      .insert({
        name: 'Test User ' + timestamp,
        team_id: testTeamId,
        created_at: timestamp
      })
      .select();
      
    if (userError) {
      if (isDev) {
        console.error('User insertion error:', userError);
        console.error('Error details:', userError.message, userError.details);
      }
      return { success: false, error: userError };
    }
    
    if (isDev) console.log('User inserted successfully:', userData);
    return { success: true, participant: participantData[0], user: userData[0] };
  } catch (error) {
    if (isDev) console.error('Unexpected error during test:', error);
    return { success: false, error };
  }
}

export async function getTableStructure(tableName: string) {
  try {
    // This is a workaround to get table structure using a select query
    // with limit 0 to not retrieve any actual data
    const { data, error } = await supabase
      .from(tableName)
      .select('*')
      .limit(0);
      
    if (error) {
      if (isDev) console.error(`Error getting structure for table ${tableName}:`, error);
      return { success: false, error };
    }
    
    // If we get here, the table exists and we have access to it
    return { success: true, columns: data };
  } catch (error) {
    if (isDev) console.error(`Unexpected error getting structure for table ${tableName}:`, error);
    return { success: false, error };
  }
}