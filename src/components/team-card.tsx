"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useInteractiveCard } from "@/hooks/use-interactive-card";
import { cn } from "@/lib/utils";
import Image from "next/image";
import React from "react";

export type TeamMember = {
  name: string;
  role: string;
  avatar: string;
  hint?: string;
  company?: string;
  designation?: string;
};

export type TeamCardProps = {
  member: TeamMember;
  size?: "large" | "medium" | "small";
  style?: React.CSSProperties;
};

export const TeamCard = ({ member, size = "medium", style }: TeamCardProps) => {
  const { ref, style: interactiveStyle } = useInteractiveCard();

  const sizeClasses = {
    large: {
      container: "p-8",
      image: "w-40 h-40 md:w-48 md:h-48",
      imageSize: { width: 192, height: 192 },
      name: "text-2xl md:text-3xl",
      role: "text-lg md:text-xl",
    },
    medium: {
      container: "p-6",
      image: "w-32 h-32 md:w-36 md:h-36",
      imageSize: { width: 144, height: 144 },
      name: "text-xl md:text-2xl",
      role: "text-base md:text-lg",
    },
    small: {
      container: "p-4",
      image: "w-24 h-24 md:w-28 md:h-28",
      imageSize: { width: 112, height: 112 },
      name: "text-lg md:text-xl",
      role: "text-sm md:text-base",
    },
  };

  const currentSize = sizeClasses[size];

  return (
    <div
      ref={ref as React.RefObject<HTMLDivElement>}
      style={{ ...style, ...interactiveStyle }}
      className={cn(
        "flex flex-col items-center animate-fade-in-up card-3d-interactive rounded-lg transition-all duration-300 hover:shadow-lg",
        "bg-card/30 border border-border/40 hover:border-accent/50",
        currentSize.container
      )}
    >
      <div className="relative mb-6 group">
        <div className="absolute inset-0 bg-gradient-to-br from-accent/20 to-primary/20 rounded-full blur-xl group-hover:blur-2xl transition-all duration-300 opacity-50 group-hover:opacity-70"></div>
        <Image
          src={member.avatar}
          alt={member.name}
          width={currentSize.imageSize.width}
          height={currentSize.imageSize.height}
          data-ai-hint={member.hint}
          className={cn(
            "rounded-full border-4 border-accent/30 group-hover:border-accent/60 transition-all duration-300 relative z-10 object-cover",
            currentSize.image
          )}
        />
      </div>

      <div className="text-center">
        <h3 className={cn("font-headline font-light mb-2", currentSize.name)}>
          {member.name}
        </h3>
        {member.designation && (
          <p className={cn("text-primary font-medium mb-1", currentSize.role)}>
            {member.designation}
          </p>
        )}
        {member.company && (
          <p className={cn("text-foreground/70 text-sm mb-1")}>
            {member.company}
          </p>
        )}
        <p className={cn("text-accent/80", currentSize.role)}>{member.role}</p>
      </div>
    </div>
  );
};
