import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { cookies } from "next/headers";

export async function GET(request: NextRequest) {
  const cookieStore = cookies();
  // Use the existing supabase client instead of creating a new one
  // Note: This endpoint may need refactoring for proper authentication

  try {
    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    // Check if the user is an admin (you may want to implement a proper admin check)
    const { data: adminCheck, error: adminError } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    if (adminError || !adminCheck || adminCheck.role !== "admin") {
      return NextResponse.json(
        { error: "Unauthorized. Admin access required." },
        { status: 403 }
      );
    }

    // Initialize database tables if they don't exist
    // This is normally handled by migrations but this is a simple way to ensure the schema exists
    await initializeDatabase(supabase);

    return NextResponse.json({
      success: true,
      message: "Database schema initialized successfully"
    });
  } catch (error) {
    console.error("Error in database initialization:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

async function initializeDatabase(supabase: any) {
  const tableChecks = [
    // Check if teams table exists
    supabase.from('teams').select('id').limit(1),
    // Check if team_members table exists
    supabase.from('team_members').select('id').limit(1),
    // Check if checkpoints table exists
    supabase.from('checkpoints').select('id').limit(1),
    // Check if submissions table exists
    supabase.from('submissions').select('id').limit(1),
    // Check if messages table exists
    supabase.from('messages').select('id').limit(1),
    // Check if announcements table exists
    supabase.from('announcements').select('id').limit(1)
  ];

  const results = await Promise.all(tableChecks.map(p => p.catch((e: Error) => ({ error: e }))));
  const missingTables = [];

  // Check which tables are missing
  if (results[0].error) missingTables.push('teams');
  if (results[1].error) missingTables.push('team_members');
  if (results[2].error) missingTables.push('checkpoints');
  if (results[3].error) missingTables.push('submissions');
  if (results[4].error) missingTables.push('messages');
  if (results[5].error) missingTables.push('announcements');

  // Create SQL for missing tables
  if (missingTables.length > 0) {
    console.log(`Creating missing tables: ${missingTables.join(', ')}`);
    
    for (const table of missingTables) {
      const createQuery = getCreateTableSQL(table);
      if (createQuery) {
        await supabase.rpc('create_table_if_not_exists', { query: createQuery }).catch(console.error);
      }
    }
  }

  return true;
}

function getCreateTableSQL(tableName: string): string | null {
  switch (tableName) {
    case 'teams':
      return `
        CREATE TABLE IF NOT EXISTS teams (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          name TEXT NOT NULL,
          description TEXT,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
      `;
    
    case 'team_members':
      return `
        CREATE TABLE IF NOT EXISTS team_members (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          team_id UUID REFERENCES teams(id) ON DELETE CASCADE,
          user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
          role TEXT NOT NULL,
          joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          UNIQUE(team_id, user_id)
        );
      `;
    
    case 'checkpoints':
      return `
        CREATE TABLE IF NOT EXISTS checkpoints (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          title TEXT NOT NULL,
          description TEXT,
          deadline TIMESTAMP WITH TIME ZONE NOT NULL,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          created_by UUID REFERENCES auth.users(id)
        );
      `;
    
    case 'submissions':
      return `
        CREATE TABLE IF NOT EXISTS submissions (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          team_id UUID REFERENCES teams(id) ON DELETE CASCADE,
          checkpoint_id UUID REFERENCES checkpoints(id) ON DELETE CASCADE,
          file_url TEXT NOT NULL,
          file_name TEXT NOT NULL,
          notes TEXT,
          submitted_by UUID REFERENCES auth.users(id),
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          UNIQUE(team_id, checkpoint_id)
        );
      `;
    
    case 'messages':
      return `
        CREATE TABLE IF NOT EXISTS messages (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          content TEXT NOT NULL,
          team_id UUID REFERENCES teams(id) ON DELETE CASCADE,
          sender_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
          sender_name TEXT NOT NULL,
          is_read BOOLEAN DEFAULT FALSE,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
      `;
    
    case 'announcements':
      return `
        CREATE TABLE IF NOT EXISTS announcements (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          title TEXT NOT NULL,
          content TEXT NOT NULL,
          created_by UUID REFERENCES auth.users(id),
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
      `;
    
    default:
      return null;
  }
}