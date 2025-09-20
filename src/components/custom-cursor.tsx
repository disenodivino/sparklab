
"use client";

import React, { useEffect } from 'react';

const CustomCursor = () => {
  useEffect(() => {
    // Only enable on devices with hover support
    const hasHover = window.matchMedia('(hover: hover)').matches;
    if (!hasHover) return;

    // Ultra-lightweight mouse tracking using CSS custom properties
    const updateCursorPosition = (e: MouseEvent) => {
      document.documentElement.style.setProperty('--cursor-x', `${e.clientX}px`);
      document.documentElement.style.setProperty('--cursor-y', `${e.clientY}px`);
    };

    // Simple hover state management
    const handleHoverStart = (e: Event) => {
      const target = e.target as HTMLElement;
      const isInteractive = target.matches('button, a, [role="button"], input, select, textarea, [tabindex]:not([tabindex="-1"])');
      
      if (isInteractive) {
        document.documentElement.classList.add('cursor-hover-interactive');
      } else {
        document.documentElement.classList.add('cursor-hover');
      }
    };

    const handleHoverEnd = () => {
      document.documentElement.classList.remove('cursor-hover', 'cursor-hover-interactive');
    };

    const handleMouseDown = () => {
      document.documentElement.classList.add('cursor-pressed');
    };

    const handleMouseUp = () => {
      document.documentElement.classList.remove('cursor-pressed');
    };

    // Initialize cursor position
    document.documentElement.style.setProperty('--cursor-x', '0px');
    document.documentElement.style.setProperty('--cursor-y', '0px');
    document.documentElement.classList.add('has-custom-cursor');

    // Add event listeners with passive for better performance
    document.addEventListener('mousemove', updateCursorPosition, { passive: true });
    document.addEventListener('mousedown', handleMouseDown, { passive: true });
    document.addEventListener('mouseup', handleMouseUp, { passive: true });

    // Delegate hover events for better performance
    document.addEventListener('mouseover', handleHoverStart, { passive: true });
    document.addEventListener('mouseout', handleHoverEnd, { passive: true });

    return () => {
      document.documentElement.classList.remove('has-custom-cursor', 'cursor-hover', 'cursor-hover-interactive', 'cursor-pressed');
      document.removeEventListener('mousemove', updateCursorPosition);
      document.removeEventListener('mousedown', handleMouseDown);
      document.removeEventListener('mouseup', handleMouseUp);
      document.removeEventListener('mouseover', handleHoverStart);
      document.removeEventListener('mouseout', handleHoverEnd);
    };
  }, []);

  return (
    <div className="sparklab-cursor">
      <div className="sparklab-cursor-trail"></div>
      <div className="sparklab-cursor-dot"></div>
    </div>
  );
};

export default CustomCursor;
