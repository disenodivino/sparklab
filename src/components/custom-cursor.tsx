
"use client";

import React, { useEffect, useRef } from 'react';

const CustomCursor = () => {
  const dotRef = useRef<HTMLDivElement>(null);
  const cometsContainerRef = useRef<HTMLDivElement>(null);
  const animationFrameRef = useRef<number>();
  const lastMousePos = useRef({ x: 0, y: 0 });

  useEffect(() => {
    let frameCount = 0;
    
    const handleMouseMove = (e: MouseEvent) => {
      lastMousePos.current = { x: e.clientX, y: e.clientY };
      
      // Update dot position immediately on mouse move for responsiveness
      if (dotRef.current) {
        dotRef.current.style.transform = `translate(${e.clientX - 3}px, ${e.clientY - 3}px)`;
      }
    };

    const animate = () => {
      frameCount++;
      
      // Only create comets every 5th frame to reduce performance impact
      if (frameCount % 5 === 0 && cometsContainerRef.current) {
        const comet = document.createElement('div');
        comet.className = 'cursor cursor-comet';
        comet.style.transform = `translate(${lastMousePos.current.x - 1.5}px, ${lastMousePos.current.y - 1.5}px)`;
        
        cometsContainerRef.current.appendChild(comet);
        
        // Make comets fade out faster
        setTimeout(() => {
            comet.style.opacity = '0';
        }, 50);

        // Remove old comets from DOM to prevent memory leaks (reduced limit)
        if (cometsContainerRef.current.children.length > 10) {
            const oldComet = cometsContainerRef.current.children[0];
            if (oldComet) {
                cometsContainerRef.current.removeChild(oldComet);
            }
        }
        
        // Clean up fully faded comets from the DOM faster
        setTimeout(() => {
            if (comet.parentElement) {
                comet.parentElement.removeChild(comet);
            }
        }, 250);
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
