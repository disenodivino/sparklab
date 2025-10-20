import { supabase } from './supabase';

const isDev = process.env.NODE_ENV === 'development';

/**
 * Utility function to check the database schema and validate table structures
 */
export async function checkDatabaseTables() {
  if (isDev) console.log('Checking database tables...');
  
  try {
    // Check teams table
    const { data: teamsInfo, error: teamsError } = await supabase
      .from('teams')
      .select('count(*)')
      .limit(1);
      
    if (teamsError) {
      if (isDev) console.error('Error accessing teams table:', teamsError);
    } else {
      if (isDev) console.log('Teams table accessible, first row:', teamsInfo);
    }
    
    // Check users table
    const { data: usersInfo, error: usersError } = await supabase
      .from('users')
      .select('count(*)')
      .limit(1);
      
    if (usersError) {
      if (isDev) console.error('Error accessing users table:', usersError);
      
      // Try to get more detailed information about the users table structure using system tables
      // This is a workaround for Supabase's limited ability to query schema information
      const { error: schemaError } = await supabase.rpc('check_table_exists', { table_name: 'users' });
      
      if (schemaError) {
        if (isDev) console.error('Could not check if users table exists:', schemaError);
      }
    } else {
      if (isDev) console.log('Users table accessible, first row:', usersInfo);
    }
    
    // Check participants table
    const { data: participantsInfo, error: participantsError } = await supabase
      .from('participants')
      .select('count(*)')
      .limit(1);
      
    if (participantsError) {
      if (isDev) console.error('Error accessing participants table:', participantsError);
    } else {
      if (isDev) console.log('Participants table accessible, first row:', participantsInfo);
    }
    
    return {
      teamsAccessible: !teamsError,
      usersAccessible: !usersError,
      participantsAccessible: !participantsError
    };
  } catch (error) {
    if (isDev) console.error('Error checking database tables:', error);
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
      if (isDev) console.error('Error creating diagnostic function:', error);
      return false;
    }
    
    return true;
  } catch (error) {
    if (isDev) console.error('Error setting up diagnostic functions:', error);
    return false;
  }
}