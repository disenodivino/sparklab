"use client";

import React, { useEffect, useRef } from 'react';

const CustomCursor = () => {
  const cursorOuterRef = useRef<HTMLDivElement>(null);
  const cursorInnerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    document.documentElement.classList.add('has-cursor');
    const cursorOuter = cursorOuterRef.current;
    const cursorInner = cursorInnerRef.current;

    if (!cursorOuter || !cursorInner) return;

    let animationFrameId: number;
    const mouse = { x: 0, y: 0 };
    const previousMouse = { x: 0, y: 0 };
    const outerCursor = { x: 0, y: 0 };
    const lerpAmount = 0.2; // Linear interpolation amount

    const handleMouseMove = (e: MouseEvent) => {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
    };
    
    const animate = () => {
      // Lerp for smoothing
      outerCursor.x = lerp(outerCursor.x, mouse.x, lerpAmount);
      outerCursor.y = lerp(outerCursor.y, mouse.y, lerpAmount);
      
      if(cursorOuter) {
          cursorOuter.style.transform = `translate(${outerCursor.x}px, ${outerCursor.y}px)`;
      }
      if(cursorInner) {
          cursorInner.style.transform = `translate(${mouse.x}px, ${mouse.y}px)`;
      }

      previousMouse.x = outerCursor.x;
      previousMouse.y = outerCursor.y;

      animationFrameId = requestAnimationFrame(animate);
    }
    
    animationFrameId = requestAnimationFrame(animate);

    const handleMouseOver = (e: MouseEvent) => {
      if ((e.target as HTMLElement).closest('a, button')) {
        cursorInner?.classList.add('is-hover');
      }
    };

    const handleMouseOut = (e: MouseEvent) => {
      if ((e.target as HTMLElement).closest('a, button')) {
        cursorInner?.classList.remove('is-hover');
      }
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseover', handleMouseOver);
    document.addEventListener('mouseout', handleMouseOut);

    return () => {
      cancelAnimationFrame(animationFrameId);
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseover', handleMouseOver);
      document.removeEventListener('mouseout', handleMouseOut);
      document.documentElement.classList.remove('has-cursor');
    };
  }, []);

  const lerp = (start: number, end: number, amount: number) => {
    return (1 - amount) * start + amount * end;
  };

  return (
    <div className="custom-cursor">
      <div ref={cursorOuterRef} className="cursor cursor--outer"></div>
      <div ref={cursorInnerRef} className="cursor cursor--inner"></div>
    </div>
  );
};

export default CustomCursor;
