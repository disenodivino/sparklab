
"use client";

import { cn } from "@/lib/utils";

const MovingGrid = () => {
  return (
    <div className="absolute inset-0 w-full h-full z-0 overflow-hidden">
      <div
        className={cn(
          "absolute inset-0 h-full w-full",
          "bg-[linear-gradient(to_right,hsl(var(--border))_1px,transparent_1px),linear-gradient(to_bottom,hsl(var(--border))_1px,transparent_1px)]",
          "bg-[size:2rem_2rem]",
          "[mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]",
        )}
        style={{
            animation: "grid-pan 15s linear infinite",
        }}
      ></div>
    </div>
  );
};

export default MovingGrid;
