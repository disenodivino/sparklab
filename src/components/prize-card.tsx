"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useInteractiveCard } from "@/hooks/use-interactive-card";
import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";
import React from "react";

export type PrizeCardProps = {
  icon: LucideIcon;
  title: string;
  amount: string;
  description: string;
  gradient: string;
  shadowColor: string;
  style?: React.CSSProperties;
};

export const MainPrizeCard = ({
  icon: Icon,
  title,
  amount,
  description,
  gradient,
  shadowColor,
  style,
  rank,
}: PrizeCardProps & { rank: number }) => {
  const { ref, style: interactiveStyle } = useInteractiveCard();
  const isFirst = rank === 1;

  return (
    <Card
      ref={ref as React.RefObject<HTMLDivElement>}
      style={{ ...style, ...interactiveStyle }}
      className={cn(
        "relative overflow-hidden text-center animate-fade-in-up card-3d-interactive transition-all duration-300",
        isFirst
          ? "bg-gradient-to-br from-yellow-500/20 to-orange-600/20 border-yellow-500/50 shadow-2xl shadow-yellow-500/20 scale-105"
          : "bg-card/30 border-border/30 hover:shadow-xl",
        shadowColor
      )}
    >
      {isFirst && (
        <div className="absolute top-0 right-0 bg-gradient-to-br from-yellow-400 to-orange-500 text-white px-3 py-1 text-xs font-bold rounded-bl-lg">
          WINNER
        </div>
      )}

      <CardHeader className="pb-4">
        <div className="flex flex-col items-center gap-4">
          <div
            className={cn(
              "p-6 rounded-full bg-gradient-to-br relative",
              gradient,
              isFirst ? "animate-pulse shadow-lg shadow-yellow-500/30" : ""
            )}
          >
            <Icon
              className={cn("text-white", isFirst ? "h-12 w-12" : "h-10 w-10")}
            />
          </div>
          <div>
            <div className="flex items-center gap-2 mb-2">
              <div
                className={cn(
                  "w-8 h-8 rounded-full bg-gradient-to-br flex items-center justify-center text-white font-bold text-sm",
                  gradient
                )}
              >
                {rank}
              </div>
              <CardTitle
                className={cn(
                  "font-headline font-light",
                  isFirst ? "text-2xl" : "text-xl"
                )}
              >
                {title}
              </CardTitle>
            </div>
            <div
              className={cn(
                "font-headline bg-gradient-to-r bg-clip-text text-transparent font-bold",
                gradient,
                isFirst ? "text-5xl mb-3" : "text-3xl mb-2"
              )}
            >
              {amount}
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-foreground/70 text-sm">{description}</p>
      </CardContent>
    </Card>
  );
};

export const ExtraPrizeCard = ({
  icon: Icon,
  title,
  amount,
  description,
  gradient,
  shadowColor,
  style,
}: PrizeCardProps) => {
  const { ref, style: interactiveStyle } = useInteractiveCard();

  return (
    <Card
      ref={ref as React.RefObject<HTMLDivElement>}
      style={{ ...style, ...interactiveStyle }}
      className={cn(
        "bg-card/20 border-border/40 hover:border-accent/50 text-left animate-fade-in-up card-3d-interactive transition-all duration-300 hover:shadow-lg group",
        shadowColor
      )}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start gap-4">
          <div
            className={cn(
              "p-3 rounded-lg bg-gradient-to-br group-hover:scale-110 transition-transform duration-300",
              gradient
            )}
          >
            <Icon className="h-6 w-6 text-white" />
          </div>
          <div className="flex-1">
            <CardTitle className="text-lg font-headline font-light mb-1">
              {title}
            </CardTitle>
            <div
              className={cn(
                "text-2xl font-headline bg-gradient-to-r bg-clip-text text-transparent",
                gradient
              )}
            >
              {amount}
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <p className="text-foreground/60 text-sm">{description}</p>
      </CardContent>
    </Card>
  );
};
