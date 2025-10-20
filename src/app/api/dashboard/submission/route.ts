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

    // Get form data
    const formData = await request.formData();
    const file = formData.get("file") as File;
    const checkpointId = formData.get("checkpointId") as string;
    const notes = formData.get("notes") as string;

    if (!file || !checkpointId) {
      return NextResponse.json(
        { error: "File and checkpoint ID are required" },
        { status: 400 }
      );
    }

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

    // Check if the checkpoint exists and is still open for submissions
    const { data: checkpoint, error: checkpointError } = await supabase
      .from("checkpoints")
      .select("*")
      .eq("id", checkpointId)
      .single();

    if (checkpointError || !checkpoint) {
      return NextResponse.json(
        { error: "Checkpoint not found" },
        { status: 404 }
      );
    }

    // Check if deadline has passed
    if (new Date(checkpoint.deadline) < new Date()) {
      return NextResponse.json(
        { error: "Submission deadline has passed" },
        { status: 400 }
      );
    }

    // Generate a unique file path
    const fileExt = file.name.split('.').pop();
    const fileName = `${teamMember.team_id}_${checkpointId}_${Date.now()}.${fileExt}`;
    const filePath = `submissions/${fileName}`;

    // Upload the file to Supabase Storage
    const { data: storageData, error: storageError } = await supabase.storage
      .from("sparklab")
      .upload(filePath, file);

    if (storageError) {
      return NextResponse.json(
        { error: "Failed to upload file" },
        { status: 500 }
      );
    }

    // Get the public URL for the file
    const { data: publicUrlData } = supabase.storage
      .from("sparklab")
      .getPublicUrl(filePath);

    const fileUrl = publicUrlData.publicUrl;

    // Create a submission record in the database
    const { data: submission, error: submissionError } = await supabase
      .from("submissions")
      .insert([
        {
          team_id: teamMember.team_id,
          checkpoint_id: checkpointId,
          file_url: fileUrl,
          file_name: file.name,
          notes: notes || "",
          submitted_by: user.id
        }
      ])
      .select()
      .single();

    if (submissionError) {
      // If there was an error creating the submission record, delete the uploaded file
      await supabase.storage.from("sparklab").remove([filePath]);
      
      return NextResponse.json(
        { error: "Failed to create submission record" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      submission
    });
  } catch (error) {
    console.error("Error in submission API:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}