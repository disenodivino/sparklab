"use client";

import React, { useEffect, useRef, useState } from 'react';
import { cn } from '@/lib/utils';

const CustomCursor = () => {
  const dotRef = useRef<HTMLDivElement>(null);
  const [comets, setComets] = useState<{ x: number; y: number; id: number }[]>([]);
  const animationFrameRef = useRef<number>();
  const lastMousePos = useRef({ x: 0, y: 0 });
  const cometCounter = useRef(0);


  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      lastMousePos.current = { x: e.clientX, y: e.clientY };
    };

    const animate = () => {
      if (dotRef.current) {
        dotRef.current.style.transform = `translate(${lastMousePos.current.x - 3}px, ${lastMousePos.current.y - 3}px)`;
      }
      
      setComets(prev => [
        ...prev.slice(-10), 
        { x: lastMousePos.current.x, y: lastMousePos.current.y, id: cometCounter.current++ }
      ]);

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
    <div className="custom-cursor">
      <div ref={dotRef} className="cursor cursor-dot"></div>
      {comets.map((comet, index) => (
        <div
          key={comet.id}
          className="cursor cursor-comet"
          style={{
            transform: `translate(${comet.x - 1.5}px, ${comet.y - 1.5}px)`,
            opacity: (index + 1) / (comets.length + 1) * 0.5
          }}
        />
      ))}
    </div>
  );
};

export default CustomCursor;
