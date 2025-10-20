import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { cookies } from "next/headers";

export async function POST(request: NextRequest) {
  const cookieStore = cookies();
  // Using the imported supabase client
  // Note: This endpoint may need refactoring for proper session-based authentication

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
    const { messageId } = await request.json();

    if (!messageId) {
      return NextResponse.json(
        { error: "Message ID is required" },
        { status: 400 }
      );
    }

    // Get team information for the user
    const { data: teamMember, error: teamMemberError } = await supabase
      .from("team_members")
      .select("team_id")
      .eq("user_id", user.id)
      .single();

    if (teamMemberError) {
      return NextResponse.json(
        { error: "User not associated with any team" },
        { status: 404 }
      );
    }

    // Get the message to verify it's for this user's team
    const { data: message, error: messageError } = await supabase
      .from("messages")
      .select("*")
      .eq("id", messageId)
      .single();

    if (messageError || !message) {
      return NextResponse.json(
        { error: "Message not found" },
        { status: 404 }
      );
    }

    // Verify the message is for this user's team or is a global message
    if (message.team_id !== null && message.team_id !== teamMember.team_id) {
      return NextResponse.json(
        { error: "Not authorized to access this message" },
        { status: 403 }
      );
    }

    // Mark the message as read
    const { data: updatedMessage, error: updateError } = await supabase
      .from("messages")
      .update({ is_read: true })
      .eq("id", messageId)
      .select()
      .single();

    if (updateError) {
      return NextResponse.json(
        { error: "Failed to update message" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: updatedMessage
    });
  } catch (error) {
    console.error("Error in mark message as read API:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}