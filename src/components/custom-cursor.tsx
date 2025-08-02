
"use client";

import React, { useEffect, useRef } from 'react';

const CustomCursor = () => {
  const dotRef = useRef<HTMLDivElement>(null);
  const cometRef = useRef<HTMLDivElement>(null);
  const animationFrameRef = useRef<number>();
  const lastMousePos = useRef({ x: 0, y: 0 });
  const lastCometPos = useRef({ x: 0, y: 0 });
  
  // Easing factor
  const easing = 0.15;

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      lastMousePos.current = { x: e.clientX, y: e.clientY };
    };

    const animate = () => {
      // Animate dot
      if (dotRef.current) {
        dotRef.current.style.transform = `translate(${lastMousePos.current.x - 3}px, ${lastMousePos.current.y - 3}px)`;
      }

      // Animate comet with easing
      if (cometRef.current) {
        const dx = lastMousePos.current.x - lastCometPos.current.x;
        const dy = lastMousePos.current.y - lastCometPos.current.y;
        
        lastCometPos.current.x += dx * easing;
        lastCometPos.current.y += dy * easing;

        cometRef.current.style.transform = `translate(${lastCometPos.current.x - 1.5}px, ${lastCometPos.current.y - 1.5}px)`;
      }
      
      animationFrameRef.current = requestAnimationFrame(animate);
    };

    document.documentElement.classList.add('has-cursor');
    document.addEventListener('mousemove', handleMouseMove);
    animationFrameRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      document.removeEventListener('mousemove', handleMouseMove);
      document.documentElement.classList.remove('has-cursor');
    };
  }, []);

  return (
    <>
      <div ref={dotRef} className="cursor cursor-dot"></div>
      <div ref={cometRef} className="cursor cursor-comet"></div>
    </>
  );
};

export default CustomCursor;
