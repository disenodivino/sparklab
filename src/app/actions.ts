"use server";

import * as z from "zod";
import { supabase } from "@/lib/supabase";

const formSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters." }),
  email: z.string().email({ message: "Please enter a valid email." }),
  university: z.string().min(3, { message: "Please enter your university name." }),
  reason: z.string().min(10, { message: "Please tell us a bit more." }),
});

export async function registerForEvent(prevState: any, formData: FormData) {
  const validatedFields = formSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    university: formData.get("university"),
    reason: formData.get("reason"),
  });

  if (!validatedFields.success) {
    return {
      message: "Invalid form data. Please check your inputs.",
      success: false,
    };
  }

  try {
    const { data, error } = await supabase
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
