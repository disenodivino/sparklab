"use client";

import React, { useEffect, useState, useRef } from "react";

interface Particle {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  size: number;
}

const CustomCursor = () => {
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isHovering, setIsHovering] = useState(false);
  const [isMoving, setIsMoving] = useState(false);
  const [particles, setParticles] = useState<Particle[]>([]);
  const particleId = useRef(0);
  const moveTimeout = useRef<NodeJS.Timeout>();
  const [isEventPage, setIsEventPage] = useState(false);

  useEffect(() => {
    // Check if current page is an event page
    if (typeof window !== 'undefined') {
      const isEvent = window.location.pathname.startsWith('/event');
      setIsEventPage(isEvent);
      
      // If on event page, don't enable custom cursor
      if (isEvent) return;
    }
    
    // Only enable on devices with hover support
    const hasHover = window.matchMedia("(hover: hover)").matches;
    if (!hasHover) return;

    const updateCursorPosition = (e: MouseEvent) => {
      const newPos = { x: e.clientX, y: e.clientY };
      setPosition(newPos);
      setIsMoving(true);

      // Create golden particles when moving
      if (Math.random() < 0.3) {
        // 30% chance to create particle
        const newParticle: Particle = {
          id: particleId.current++,
          x: newPos.x + (Math.random() - 0.5) * 20,
          y: newPos.y + (Math.random() - 0.5) * 20,
          vx: (Math.random() - 0.5) * 4,
          vy: (Math.random() - 0.5) * 4,
          life: 1,
          maxLife: 60 + Math.random() * 40,
          size: 2 + Math.random() * 4,
        };

        setParticles((prev) => [...prev.slice(-20), newParticle]); // Keep max 20 particles
      }

      // Reset moving state after 100ms
      clearTimeout(moveTimeout.current);
      moveTimeout.current = setTimeout(() => setIsMoving(false), 100);
    };

    const handleMouseOver = (e: MouseEvent) => {
      const target = e.target as HTMLElement;

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

      // Clear timeout
      if (moveTimeout.current) {
        clearTimeout(moveTimeout.current);
      }
    };
  }, []);

  // Animate particles
  useEffect(() => {
    const animateParticles = () => {
      setParticles((prev) =>
        prev
          .map((particle) => ({
            ...particle,
            x: particle.x + particle.vx,
            y: particle.y + particle.vy,
            life: particle.life + 1,
            vy: particle.vy + 0.1, // gravity
            vx: particle.vx * 0.99, // air resistance
          }))
          .filter((particle) => particle.life < particle.maxLife)
      );
    };

    const interval = setInterval(animateParticles, 16); // ~60fps
    return () => clearInterval(interval);
  }, []);

  // Don't render anything for event pages
  if (isEventPage) {
    return null;
  }
  
  return (
    <>
      {/* Golden Particles */}
      {particles.map((particle) => {
        const opacity = 1 - particle.life / particle.maxLife;
        const scale = opacity * (particle.size / 4);

        return (
          <div
            key={particle.id}
            className="fixed pointer-events-none z-40"
            style={{
              left: particle.x - particle.size / 2,
              top: particle.y - particle.size / 2,
              width: particle.size,
              height: particle.size,
              backgroundColor: "#FFD700",
              borderRadius: "50%",
              opacity,
              transform: `scale(${scale})`,
              boxShadow: `0 0 ${particle.size * 2}px rgba(255, 215, 0, ${
                opacity * 0.8
              })`,
            }}
          />
        );
      })}

      {/* Main Cursor */}
      <div
        className="fixed pointer-events-none z-50"
        style={{
          left: position.x - 4,
          top: position.y - 4,
          transform: `scale(${isHovering ? 1.8 : isMoving ? 1.3 : 1})`,
          transition: "transform 0.15s ease-out",
        }}
      >
        {/* Round Dot Cursor */}
        <div className="relative w-2 h-2">
          {/* Main dot body */}
          <div
            className="absolute inset-0 rounded-full bg-gradient-to-br from-yellow-400 via-orange-500 to-red-500"
            style={{
              filter: "drop-shadow(0 0 6px rgba(255, 215, 0, 0.8))",
            }}
          />

          {/* Inner glow */}
          <div className="absolute inset-0.5 rounded-full bg-gradient-to-br from-yellow-200 to-orange-300 opacity-60" />

          {/* Sparkle effect when hovering */}
          {isHovering && (
            <div className="absolute -inset-2 animate-pulse">
              <div className="w-0.5 h-0.5 bg-yellow-300 rounded-full absolute -top-0.5 left-1/2 transform -translate-x-1/2 animate-ping" />
              <div className="w-0.5 h-0.5 bg-orange-300 rounded-full absolute top-1/2 -right-0.5 transform -translate-y-1/2 animate-ping delay-75" />
              <div className="w-0.5 h-0.5 bg-red-300 rounded-full absolute -bottom-0.5 left-1/2 transform -translate-x-1/2 animate-ping delay-150" />
              <div className="w-0.5 h-0.5 bg-yellow-300 rounded-full absolute top-1/2 -left-0.5 transform -translate-y-1/2 animate-ping delay-300" />
            </div>
          )}

          {/* Outer ring when moving */}
          {isMoving && (
            <div className="absolute -inset-1 rounded-full border border-yellow-400 opacity-60 animate-pulse" />
          )}
        </div>
      </div>
    </>
  );
};

export default CustomCursor;
