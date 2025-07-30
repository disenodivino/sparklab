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

    const handleMouseMove = (e: MouseEvent) => {
      const { clientX, clientY } = e;
      cursorOuter.style.transform = `translate(${clientX}px, ${clientY}px)`;
      cursorInner.style.transform = `translate(${clientX}px, ${clientY}px)`;
    };

    const handleMouseOver = (e: MouseEvent) => {
      if ((e.target as HTMLElement).closest('a, button')) {
        cursorInner.classList.add('is-hover');
      }
    };

    const handleMouseOut = (e: MouseEvent) => {
      if ((e.target as HTMLElement).closest('a, button')) {
        cursorInner.classList.remove('is-hover');
      }
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseover', handleMouseOver);
    document.addEventListener('mouseout', handleMouseOut);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseover', handleMouseOver);
      document.removeEventListener('mouseout', handleMouseOut);
      document.documentElement.classList.remove('has-cursor');
    };
  }, []);

  return (
    <div className="custom-cursor">
      <div ref={cursorOuterRef} className="cursor cursor--outer"></div>
      <div ref={cursorInnerRef} className="cursor cursor--inner"></div>
    </div>
  );
};

export default CustomCursor;
