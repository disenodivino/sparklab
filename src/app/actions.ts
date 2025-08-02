
"use server";

import * as z from "zod";
import { createClient } from "@supabase/supabase-js";

const formSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters." }),
  email: z.string().email({ message: "Please enter a valid email." }),
  university: z.string().min(3, { message: "Please enter your university name." }),
  reason: z.string().min(10, { message: "Please tell us a bit more." }).max(500),
});

export async function registerForEvent(data: z.infer<typeof formSchema>) {
  const supabaseUrl = 'https://izahxmtcripexpgtaxdr.supabase.co';
  const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml6YWh4bXRjcmlwZXhwZ3RheGRyIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NDE0OTkyNiwiZXhwIjoyMDY5NzI1OTI2fQ.WwgIQHDogt5yTRcUsWgC3yS5SKoBfRfsLU-Alhsr-s8';
  
  const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  });

  const validatedFields = formSchema.safeParse(data);

  if (!validatedFields.success) {
    return {
      message: "Invalid form data. Please check your inputs.",
      success: false,
    };
  }

  try {
    const { error } = await supabaseAdmin
      .from('registrations')
      .insert([validatedFields.data]);

    if (error) {
      console.error("Supabase error:", error);
      return {
        message: "There was an error saving your registration. Please try again.",
        success: false,
      };
    }

    console.log("New registration saved to Supabase:", validatedFields.data);

    return {
      message: "Thank you for registering! We've received your submission and will be in touch soon.",
      success: true,
    };
  } catch (error) {
    console.error("Registration failed:", error);
    return {
      message: "An unexpected error occurred. Please try again later.",
      success: false,
    };
  }
}
