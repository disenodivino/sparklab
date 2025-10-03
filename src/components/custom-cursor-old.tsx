"use client";

import React, { useEffect, useState } from "react";

const CustomCursor = () => {
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isHovering, setIsHovering] = useState(false);

  useEffect(() => {
    // Only enable on devices with hover support
    const hasHover = window.matchMedia("(hover: hover)").matches;
    if (!hasHover) return;

    const updateCursorPosition = (e: MouseEvent) => {
      setPosition({ x: e.clientX, y: e.clientY });
    };

    const handleMouseOver = (e: MouseEvent) => {
      const target = e.target as HTMLElement;

      // Safer check for interactive elements
      if (target && typeof target.matches === "function") {
        const isInteractive =
          target.matches(
            'button, a, [role="button"], input, select, textarea, .cursor-pointer'
          ) ||
          (target.closest &&
            target.closest(
              'button, a, [role="button"], input, select, textarea, .cursor-pointer'
            ));
        setIsHovering(!!isInteractive);
      }
    };

    // Hide default cursor
    document.documentElement.style.cursor = "none";
    document.body.style.cursor = "none";

    // Add event listeners
    document.addEventListener("mousemove", updateCursorPosition);
    document.addEventListener("mouseover", handleMouseOver);

    return () => {
      // Restore default cursor
      document.documentElement.style.cursor = "";
      document.body.style.cursor = "";

      // Remove event listeners
      document.removeEventListener("mousemove", updateCursorPosition);
      document.removeEventListener("mouseover", handleMouseOver);
    };
  }, []);

  return (
    <div
      className="fixed pointer-events-none z-50 mix-blend-difference"
      style={{
        left: position.x - 10,
        top: position.y - 10,
        transform: `scale(${isHovering ? 1.5 : 1})`,
        transition: "transform 0.2s ease-out",
      }}
    >
      <div className="w-5 h-5 bg-white rounded-full shadow-lg" />
    </div>
  );
};

export default CustomCursor;
