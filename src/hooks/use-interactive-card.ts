"use client";

import { useRef, useEffect, useState, CSSProperties } from 'react';

export const useInteractiveCard = (maxRotation = 8) => {
  const cardRef = useRef<HTMLElement>(null);
  const [style, setStyle] = useState<CSSProperties>({});

  useEffect(() => {
    const card = cardRef.current;
    if (!card) return;

    const handleMouseMove = (e: MouseEvent) => {
      if (!card) return;
      const { clientX, clientY } = e;
      const { left, top, width, height } = card.getBoundingClientRect();
      const x = clientX - left;
      const y = clientY - top;
      
      const rotateX = (maxRotation * (y - height / 2)) / (height / 2);
      const rotateY = (-1 * maxRotation * (x - width / 2)) / (width / 2);

      setStyle({
        transform: `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.05, 1.05, 1.05)`,
      });
    };

    const handleMouseLeave = () => {
      setStyle({
        transform: 'perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)',
      });
    };

    card.addEventListener('mousemove', handleMouseMove);
    card.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      card.removeEventListener('mousemove', handleMouseMove);
      card.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, [maxRotation]);

  return { ref: cardRef, style };
};
