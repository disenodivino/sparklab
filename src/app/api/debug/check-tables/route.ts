import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase with admin role for schema changes
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_SERVICE_KEY || '';

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Missing required Supabase environment variables');
}

const supabase = createClient(supabaseUrl, supabaseKey);

export async function GET(request: Request) {
  // Disable this endpoint in production for security
  if (process.env.NODE_ENV === 'production') {
    return NextResponse.json({ 
      error: 'This endpoint is disabled in production' 
    }, { status: 403 });
  }

  try {
    console.log('Starting database table check and repair...');
    
    // Check if users table exists
    const { data: existingTables, error: tableError } = await supabase
      .from('information_schema.tables')
      .select('table_name')
      .eq('table_schema', 'public')
      .eq('table_name', 'users');
    
    if (tableError) {
      console.error('Error checking tables:', tableError);
      return NextResponse.json({ 
        error: 'Failed to check tables',
        details: tableError
      }, { status: 500 });
    }
    
    const usersTableExists = existingTables && existingTables.length > 0;
    
    // Create users table if it doesn't exist
    if (!usersTableExists) {
      console.log('Users table does not exist, creating it...');
      
      const { error: createError } = await supabase.rpc('exec_sql', { 
        sql: `
          CREATE TABLE IF NOT EXISTS public.users (
            id SERIAL PRIMARY KEY,
            name VARCHAR(100) NOT NULL,
            team_id INT REFERENCES public.teams(id) ON DELETE CASCADE,
            created_at TIMESTAMP DEFAULT NOW()
          );
          
          GRANT ALL PRIVILEGES ON TABLE public.users TO postgres;
          GRANT USAGE, SELECT ON SEQUENCE public.users_id_seq TO postgres;
          
          -- Add any missing index
          CREATE INDEX IF NOT EXISTS idx_users_team_id ON public.users(team_id);
        `
      });
      
      if (createError) {
        console.error('Error creating users table:', createError);
        return NextResponse.json({
          error: 'Failed to create users table',
          details: createError
        }, { status: 500 });
      }
      
      return NextResponse.json({
        success: true,
        message: 'Users table created successfully',
        action: 'create'
      });
    }
    
    // Check users table structure if it exists
    const { data: columns, error: columnError } = await supabase
      .from('information_schema.columns')
      .select('column_name, data_type')
      .eq('table_schema', 'public')
      .eq('table_name', 'users');
    
    if (columnError) {
      console.error('Error checking users table columns:', columnError);
      return NextResponse.json({ 
        error: 'Failed to check users table structure',
        details: columnError
      }, { status: 500 });
    }
    
    // Return table structure info
    return NextResponse.json({
      success: true,
      message: 'Users table exists',
      action: 'none',
      structure: {
        tableExists: usersTableExists,
        columns: columns || []
      }
    });
    
  } catch (error) {
    console.error('Error in debug API:', error);
    return NextResponse.json({ 
      error: 'Unexpected error occurred',
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
}