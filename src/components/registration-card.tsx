"use client";

import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import RegistrationForm from "@/components/registration-form";
import { useInteractiveCard } from "@/hooks/use-interactive-card";

export default function RegistrationCard() {
  const { ref, style } = useInteractiveCard();

  return (
    <Card 
      ref={ref as React.RefObject<HTMLDivElement>}
      style={style}
      className="border-2 border-primary/50 glow-shadow-primary card-3d-interactive"
    >
      <CardHeader className="text-center">
        <CardTitle className="text-4xl">Join the Spark</CardTitle>
        <CardDescription>Register now to secure your spot in the most exciting designathon of the year.</CardDescription>
      </CardHeader>
      <CardContent>
        <RegistrationForm />
      </CardContent>
    </Card>
  );
}
