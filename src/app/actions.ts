"use server";

import * as z from "zod";

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
    // Here you would typically save the data to a database.
    // For this example, we'll just log it to the console.
    console.log("New registration:", validatedFields.data);

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
