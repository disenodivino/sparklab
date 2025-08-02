
"use client";

import React, { useEffect, useRef } from 'react';

const CustomCursor = () => {
  const dotRef = useRef<HTMLDivElement>(null);
  const cometsContainerRef = useRef<HTMLDivElement>(null);
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

      if (cometsContainerRef.current) {
        const comet = document.createElement('div');
        comet.className = 'cursor cursor-comet';
        comet.style.transform = `translate(${lastMousePos.current.x - 1.5}px, ${lastMousePos.current.y - 1.5}px)`;
        
        cometsContainerRef.current.appendChild(comet);
        
        // Make comets fade out
        setTimeout(() => {
            comet.style.opacity = '0';
        }, 100);

        // Remove old comets from DOM
        if (cometsContainerRef.current.children.length > 20) {
            cometsContainerRef.current.removeChild(cometsContainerRef.current.children[0]);
        }
        
        // Clean up fully faded comets
        setTimeout(() => {
            if (comet.parentElement) {
                comet.parentElement.removeChild(comet);
            }
        }, 500);
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
    <div className="custom-cursor">
      <div ref={dotRef} className="cursor cursor-dot"></div>
      <div ref={cometsContainerRef}></div>
    </div>
  );
};

export default CustomCursor;
