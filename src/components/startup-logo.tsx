"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";

const StartupLogo = () => {
  const [isVisible, setIsVisible] = useState(true);
  const [animationPhase, setAnimationPhase] = useState(0);

  useEffect(() => {
    // Clear previous session for testing - remove this line in production
    sessionStorage.removeItem("nmit-logo-shown");

    // Check if animation has already been shown
    const hasShownAnimation = sessionStorage.getItem("nmit-logo-shown");

    if (hasShownAnimation) {
      setIsVisible(false);
      return;
    }

    // Animation sequence
    const timer1 = setTimeout(() => setAnimationPhase(1), 500); // Fade in
    const timer2 = setTimeout(() => setAnimationPhase(2), 2000); // Scale up
    const timer3 = setTimeout(() => setAnimationPhase(3), 3000); // Hold
    const timer4 = setTimeout(() => {
      setAnimationPhase(4); // Fade out
      sessionStorage.setItem("nmit-logo-shown", "true");
    }, 4000);
    const timer5 = setTimeout(() => setIsVisible(false), 4800); // Hide completely

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
      clearTimeout(timer4);
      clearTimeout(timer5);
    };
  }, []);

  if (!isVisible) return null;

  const getAnimationClasses = () => {
    switch (animationPhase) {
      case 0:
        return "opacity-100 scale-50"; // Make visible from start
      case 1:
        return "opacity-100 scale-75 transition-all duration-1000 ease-out";
      case 2:
        return "opacity-100 scale-100 transition-all duration-500 ease-out";
      case 3:
        return "opacity-100 scale-100";
      case 4:
        return "opacity-0 scale-110 transition-all duration-800 ease-in";
      default:
        return "opacity-100 scale-50"; // Make visible from start
    }
  };

  return (
    <div className="fixed inset-0 z-[9999] bg-background flex items-center justify-center">
      {/* Background glow effect */}
      <div className="absolute inset-0 bg-gradient-radial from-primary/5 via-transparent to-transparent" />

      {/* Animated particles */}
      <div className="absolute inset-0 overflow-hidden">
        {[...Array(6)].map((_, i) => (
          <div
            key={i}
            className="absolute w-2 h-2 bg-primary/30 rounded-full animate-pulse"
            style={{
              left: `${20 + i * 15}%`,
              top: `${30 + (i % 2) * 40}%`,
              animationDelay: `${i * 0.3}s`,
              animationDuration: "2s",
            }}
          />
        ))}
      </div>

      {/* Main logo container */}
      <div className={`relative ${getAnimationClasses()}`}>
        {/* Glow ring */}
        <div className="absolute inset-0 -m-8 rounded-full bg-gradient-to-r from-primary/20 via-accent/20 to-primary/20 blur-xl animate-pulse" />

        {/* Logo */}
        <div className="relative bg-background/90 backdrop-blur-sm rounded-2xl p-8 shadow-2xl border border-primary/20">
          <Image
            src="/nmit_logo.svg"
            alt="NMIT Logo"
            width={400}
            height={125}
            className="drop-shadow-lg"
          />

          {/* Sparkle effects */}
          {animationPhase >= 2 && (
            <>
              <div className="absolute -top-2 -left-2 w-3 h-3 bg-accent rounded-full animate-ping" />
              <div className="absolute -top-1 -right-3 w-2 h-2 bg-primary rounded-full animate-ping delay-300" />
              <div className="absolute -bottom-2 -right-1 w-3 h-3 bg-accent rounded-full animate-ping delay-150" />
              <div className="absolute -bottom-1 -left-3 w-2 h-2 bg-primary rounded-full animate-ping delay-450" />
            </>
          )}
        </div>
      </div>

      {/* Loading dots */}
      <div className="absolute bottom-20 left-1/2 transform -translate-x-1/2 flex space-x-2">
        {[...Array(3)].map((_, i) => (
          <div
            key={i}
            className="w-2 h-2 bg-primary rounded-full animate-bounce"
            style={{ animationDelay: `${i * 0.2}s` }}
          />
        ))}
      </div>
    </div>
  );
};

export default StartupLogo;
