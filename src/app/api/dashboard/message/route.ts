import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase";
import { cookies } from "next/headers";

export async function POST(request: NextRequest) {
  const cookieStore = cookies();
  const supabase = createClient(cookieStore);

  try {
    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    // Get request data
    const { message, teamId } = await request.json();

    if (!message) {
      return NextResponse.json(
        { error: "Message content is required" },
        { status: 400 }
      );
    }

    // Get team information for the user if not sending to all teams
    if (teamId) {
      const { data: teamMember, error: teamMemberError } = await supabase
        .from("team_members")
        .select("team_id")
        .eq("user_id", user.id)
        .eq("team_id", teamId)
        .single();

      if (teamMemberError || !teamMember) {
        return NextResponse.json(
          { error: "User not associated with the specified team" },
          { status: 403 }
        );
      }
    }

    // Get user profile information
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("full_name")
      .eq("id", user.id)
      .single();

    if (profileError) {
      return NextResponse.json(
        { error: "Failed to retrieve user profile" },
        { status: 500 }
      );
    }

    // Create a new message
    const { data: newMessage, error: messageError } = await supabase
      .from("messages")
      .insert([
        {
          content: message,
          team_id: teamId || null, // null means message is for all teams
          sender_id: user.id,
          sender_name: profile?.full_name || user.email,
          is_read: false
        }
      ])
      .select()
      .single();

    if (messageError) {
      return NextResponse.json(
        { error: "Failed to create message" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: newMessage
    });
  } catch (error) {
    console.error("Error in message API:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}