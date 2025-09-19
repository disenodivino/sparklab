
"use client";

import React, { useEffect, useRef } from 'react';

const CustomCursor = () => {
  const dotRef = useRef<HTMLDivElement>(null);
  const cometRef = useRef<HTMLDivElement>(null);
  const animationFrameRef = useRef<number>();
  const mousePos = useRef({ x: 0, y: 0 });
  const dotPos = useRef({ x: 0, y: 0 });
  const cometPos = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      mousePos.current = { x: e.clientX, y: e.clientY };
    };

    const animate = () => {
      // Smooth following for dot (immediate)
      dotPos.current.x = mousePos.current.x;
      dotPos.current.y = mousePos.current.y;
      
      // Smooth following for comet (with slight delay)
      cometPos.current.x += (mousePos.current.x - cometPos.current.x) * 0.8;
      cometPos.current.y += (mousePos.current.y - cometPos.current.y) * 0.8;

      if (dotRef.current) {
        dotRef.current.style.transform = `translate3d(${dotPos.current.x - 3}px, ${dotPos.current.y - 3}px, 0)`;
      }

      if (cometRef.current) {
        cometRef.current.style.transform = `translate3d(${cometPos.current.x - 1.5}px, ${cometPos.current.y - 1.5}px, 0)`;
      }
      
      animationFrameRef.current = requestAnimationFrame(animate);
    };

    document.documentElement.classList.add('has-cursor');
    document.addEventListener('mousemove', handleMouseMove, { passive: true });
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
    <div className="custom-cursor">
      <div ref={dotRef} className="cursor cursor-dot"></div>
      <div ref={cometRef} className="cursor cursor-comet"></div>
    </div>
  );
};

export default CustomCursor;
