import { supabase } from './supabase';

/**
 * Utility function to check the database schema and validate table structures
 */
export async function checkDatabaseTables() {
  console.log('Checking database tables...');
  
  try {
    // Check teams table
    const { data: teamsInfo, error: teamsError } = await supabase
      .from('teams')
      .select('count(*)')
      .limit(1);
      
    if (teamsError) {
      console.error('Error accessing teams table:', teamsError);
    } else {
      console.log('Teams table accessible, first row:', teamsInfo);
    }
    
    // Check users table
    const { data: usersInfo, error: usersError } = await supabase
      .from('users')
      .select('count(*)')
      .limit(1);
      
    if (usersError) {
      console.error('Error accessing users table:', usersError);
      
      // Try to get more detailed information about the users table structure using system tables
      // This is a workaround for Supabase's limited ability to query schema information
      const { error: schemaError } = await supabase.rpc('check_table_exists', { table_name: 'users' });
      
      if (schemaError) {
        console.error('Could not check if users table exists:', schemaError);
      }
    } else {
      console.log('Users table accessible, first row:', usersInfo);
    }
    
    // Check participants table
    const { data: participantsInfo, error: participantsError } = await supabase
      .from('participants')
      .select('count(*)')
      .limit(1);
      
    if (participantsError) {
      console.error('Error accessing participants table:', participantsError);
    } else {
      console.log('Participants table accessible, first row:', participantsInfo);
    }
    
    return {
      teamsAccessible: !teamsError,
      usersAccessible: !usersError,
      participantsAccessible: !participantsError
    };
  } catch (error) {
    console.error('Error checking database tables:', error);
    return {
      teamsAccessible: false,
      usersAccessible: false,
      participantsAccessible: false,
      error
    };
  }
}

// Function to create a diagnostic SQL RPC function in the database
// Note: This must be executed by an admin user
export async function setupDiagnosticFunctions() {
  try {
    // Create a function to check if a table exists
    const { error } = await supabase.rpc('create_check_table_exists_function');
    
    if (error) {
      console.error('Error creating diagnostic function:', error);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('Error setting up diagnostic functions:', error);
    return false;
  }
}