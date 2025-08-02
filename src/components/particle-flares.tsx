"use client";

import React, { useState, useEffect } from 'react';

interface Flare {
  id: number;
  style: React.CSSProperties;
}

const ParticleFlares = ({ count = 50 }) => {
  const [flares, setFlares] = useState<Flare[]>([]);

  useEffect(() => {
    const generateFlares = () => {
      return Array.from({ length: count }).map((_, i) => {
        const style: React.CSSProperties = {
          left: `${Math.random() * 100}vw`,
          animationDuration: `${10 + Math.random() * 10}s`,
          animationDelay: `${-1 * Math.random() * 20}s`,
        };
        return { id: i, style };
      });
    };
    
    setFlares(generateFlares());
  }, [count]);

  return (
    <div className="particle-flares-container">
      {flares.map(flare => (
        <div key={flare.id} className="flare" style={flare.style}></div>
      ))}
    </div>
  );
};

export default ParticleFlares;
