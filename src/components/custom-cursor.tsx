
"use client";

import React, { useEffect, useRef, useCallback, useState } from 'react';

interface CursorState {
  isHovering: boolean;
  isPointer: boolean;
  isPressed: boolean;
  scale: number;
}

const CustomCursor = () => {
  const cursorDotRef = useRef<HTMLDivElement>(null);
  const cursorOutlineRef = useRef<HTMLDivElement>(null);
  const requestRef = useRef<number>();
  const isMoving = useRef(false);
  const movingTimer = useRef<NodeJS.Timeout>();
  
  // Mouse position with smooth interpolation
  const mousePos = useRef({ x: 0, y: 0 });
  const cursorPos = useRef({ x: 0, y: 0 });
  const outlinePos = useRef({ x: 0, y: 0 });
  
  // Cursor state
  const [cursorState, setCursorState] = useState<CursorState>({
    isHovering: false,
    isPointer: false,
    isPressed: false,
    scale: 1
  });

  // Optimized mouse move handler with throttling
  const handleMouseMove = useCallback((e: MouseEvent) => {
    mousePos.current = { x: e.clientX, y: e.clientY };
    
    // Set moving state
    isMoving.current = true;
    clearTimeout(movingTimer.current);
    movingTimer.current = setTimeout(() => {
      isMoving.current = false;
    }, 150);
  }, []);

  // Handle hover effects
  const handleMouseEnter = useCallback((e: Event) => {
    const target = e.target as HTMLElement;
    const isClickable = target.matches('button, a, [role="button"], input, select, textarea, [tabindex]:not([tabindex="-1"])');
    
    setCursorState(prev => ({
      ...prev,
      isHovering: true,
      isPointer: isClickable,
      scale: isClickable ? 1.5 : 1.2
    }));
  }, []);

  const handleMouseLeave = useCallback(() => {
    setCursorState(prev => ({
      ...prev,
      isHovering: false,
      isPointer: false,
      scale: 1
    }));
  }, []);

  const handleMouseDown = useCallback(() => {
    setCursorState(prev => ({ ...prev, isPressed: true, scale: prev.scale * 0.8 }));
  }, []);

  const handleMouseUp = useCallback(() => {
    setCursorState(prev => ({ ...prev, isPressed: false, scale: prev.isHovering ? (prev.isPointer ? 1.5 : 1.2) : 1 }));
  }, []);

  // Optimized animation loop
  const animate = useCallback(() => {
    // Smooth cursor following with different speeds
    const dotSpeed = 0.25;
    const outlineSpeed = 0.15;
    
    // Update dot position (faster)
    cursorPos.current.x += (mousePos.current.x - cursorPos.current.x) * dotSpeed;
    cursorPos.current.y += (mousePos.current.y - cursorPos.current.y) * dotSpeed;
    
    // Update outline position (slower for trailing effect)
    outlinePos.current.x += (mousePos.current.x - outlinePos.current.x) * outlineSpeed;
    outlinePos.current.y += (mousePos.current.y - outlinePos.current.y) * outlineSpeed;

    // Apply transforms efficiently
    if (cursorDotRef.current) {
      const transform = `translate3d(${cursorPos.current.x}px, ${cursorPos.current.y}px, 0) scale(${cursorState.scale})`;
      cursorDotRef.current.style.transform = transform;
    }

    if (cursorOutlineRef.current) {
      const outlineScale = cursorState.isHovering ? cursorState.scale * 0.8 : 1;
      const transform = `translate3d(${outlinePos.current.x}px, ${outlinePos.current.y}px, 0) scale(${outlineScale})`;
      cursorOutlineRef.current.style.transform = transform;
    }

    requestRef.current = requestAnimationFrame(animate);
  }, [cursorState.scale, cursorState.isHovering]);

  useEffect(() => {
    // Check if device supports hover (not mobile)
    const hasHoverSupport = window.matchMedia('(hover: hover)').matches;
    if (!hasHoverSupport) return;

    document.documentElement.classList.add('has-custom-cursor');
    
    // Add event listeners
    document.addEventListener('mousemove', handleMouseMove, { passive: true });
    document.addEventListener('mousedown', handleMouseDown, { passive: true });
    document.addEventListener('mouseup', handleMouseUp, { passive: true });
    
    // Add hover listeners to interactive elements
    const interactiveElements = document.querySelectorAll('button, a, [role="button"], input, select, textarea, [tabindex]:not([tabindex="-1"])');
    interactiveElements.forEach(el => {
      el.addEventListener('mouseenter', handleMouseEnter, { passive: true });
      el.addEventListener('mouseleave', handleMouseLeave, { passive: true });
    });

    // Start animation
    requestRef.current = requestAnimationFrame(animate);

    return () => {
      document.documentElement.classList.remove('has-custom-cursor');
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mousedown', handleMouseDown);
      document.removeEventListener('mouseup', handleMouseUp);
      
      interactiveElements.forEach(el => {
        el.removeEventListener('mouseenter', handleMouseEnter);
        el.removeEventListener('mouseleave', handleMouseLeave);
      });

      if (requestRef.current) {
        cancelAnimationFrame(requestRef.current);
      }
      
      clearTimeout(movingTimer.current);
    };
  }, [handleMouseMove, handleMouseEnter, handleMouseLeave, handleMouseDown, handleMouseUp, animate]);

  // Don't render on mobile devices
  const hasHoverSupport = typeof window !== 'undefined' ? window.matchMedia('(hover: hover)').matches : true;
  if (!hasHoverSupport) return null;

  return (
    <div className="custom-cursor">
      <div 
        ref={cursorOutlineRef} 
        className={`cursor-outline ${cursorState.isHovering ? 'cursor-hover' : ''} ${cursorState.isPressed ? 'cursor-pressed' : ''}`}
      />
      <div 
        ref={cursorDotRef} 
        className={`cursor-dot ${cursorState.isPointer ? 'cursor-pointer' : ''} ${isMoving.current ? 'cursor-moving' : ''}`}
      />
    </div>
  );
};

export default CustomCursor;
