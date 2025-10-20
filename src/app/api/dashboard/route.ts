import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { cookies } from "next/headers";

export async function GET(request: NextRequest) {
  const cookieStore = cookies();
  // Using the imported supabase client
  // Note: This endpoint may need refactoring for proper session-based authentication

  try {
    // Try to get team ID from the query parameters (for localStorage auth)
    const teamId = request.nextUrl.searchParams.get('teamId');
    
    // If we have a teamId in the request, use it directly
    if (teamId) {
      console.log('Using teamId from query params:', teamId);
      return getDashboardDataForTeam(supabase, teamId);
    }
    
    // Otherwise, try to get authenticated user from Supabase
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }
    
    console.log('Authenticated user:', user.id);

    // Get team information for the user
    const { data: teamMember, error: teamMemberError } = await supabase
      .from("team_members")
      .select("team_id")
      .eq("user_id", user.id)
      .single();

    if (teamMemberError || !teamMember) {
      return NextResponse.json(
        { error: "User not associated with any team" },
        { status: 404 }
      );
    }

    // Fetch the latest announcements (limit to 5)
    const { data: announcements, error: announcementsError } = await supabase
      .from("announcements")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(5);

    if (announcementsError) {
      return NextResponse.json(
        { error: "Failed to fetch announcements" },
        { status: 500 }
      );
    }

    // Fetch the latest messages for the team (limit to 20)
    const { data: messages, error: messagesError } = await supabase
      .from("messages")
      .select("*")
      .or(`team_id.eq.${teamMember.team_id},team_id.is.null`)
      .order("created_at", { ascending: false })
      .limit(20);

    if (messagesError) {
      return NextResponse.json(
        { error: "Failed to fetch messages" },
        { status: 500 }
      );
    }

    // Fetch upcoming checkpoints
    const { data: checkpoints, error: checkpointsError } = await supabase
      .from("checkpoints")
      .select("*")
      .gt("deadline", new Date().toISOString())
      .order("deadline", { ascending: true });

    if (checkpointsError) {
      return NextResponse.json(
        { error: "Failed to fetch checkpoints" },
        { status: 500 }
      );
    }

    // Fetch team's submissions
    const { data: submissions, error: submissionsError } = await supabase
      .from("submissions")
      .select("*")
      .eq("team_id", teamMember.team_id)
      .order("created_at", { ascending: false });

    if (submissionsError) {
      return NextResponse.json(
        { error: "Failed to fetch submissions" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      announcements,
      messages,
      checkpoints,
      submissions,
      teamId: teamMember.team_id
    });
  } catch (error) {
    console.error("Error in dashboard API:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// Helper function to get dashboard data for a specific team
async function getDashboardDataForTeam(supabase: any, teamId: string) {
  try {
    // Verify team exists
    const { data: team, error: teamError } = await supabase
      .from("teams")
      .select("*")
      .eq("id", teamId)
      .single();
    
    if (teamError) {
      console.log('Team not found:', teamId);
      
      // For development purposes, return empty data with the team ID
      return NextResponse.json({
        announcements: [],
        messages: [],
        checkpoints: [],
        submissions: [],
        teamId: teamId
      });
    }
    
    // Fetch the latest announcements (limit to 5)
    const { data: announcements, error: announcementsError } = await supabase
      .from("announcements")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(5);

    // Fetch the latest messages for the team (limit to 20)
    const { data: messages, error: messagesError } = await supabase
      .from("messages")
      .select("*")
      .or(`team_id.eq.${teamId},team_id.is.null`)
      .order("created_at", { ascending: false })
      .limit(20);

    // Fetch upcoming checkpoints
    const { data: checkpoints, error: checkpointsError } = await supabase
      .from("checkpoints")
      .select("*")
      .gt("deadline", new Date().toISOString())
      .order("deadline", { ascending: true });

    // Fetch team's submissions
    const { data: submissions, error: submissionsError } = await supabase
      .from("submissions")
      .select("*")
      .eq("team_id", teamId)
      .order("created_at", { ascending: false });

    return NextResponse.json({
      announcements: announcements || [],
      messages: messages || [],
      checkpoints: checkpoints || [],
      submissions: submissions || [],
      teamId: teamId
    });
  } catch (error) {
    console.error("Error in dashboard API for team:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}