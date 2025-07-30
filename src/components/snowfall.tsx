"use client";

import React, { useState, useEffect } from 'react';

interface Snowflake {
  id: number;
  style: React.CSSProperties;
}

const Snowfall = ({ count = 150 }) => {
  const [snowflakes, setSnowflakes] = useState<Snowflake[]>([]);

  useEffect(() => {
    const generateSnowflakes = () => {
      return Array.from({ length: count }).map((_, i) => {
        const style: React.CSSProperties = {
          left: `${Math.random() * 100}vw`,
          animationDuration: `${20 + Math.random() * 20}s`,
          animationDelay: `${-1 * Math.random() * 40}s`,
          opacity: Math.random(),
          '--i': Math.random(),
        };
        return { id: i, style };
      });
    };
    
    setSnowflakes(generateSnowflakes());
  }, [count]);

  return (
    <div className="snowfall-container">
      {snowflakes.map(snowflake => (
        <div key={snowflake.id} className="snowflake" style={snowflake.style}></div>
      ))}
    </div>
  );
};

export default Snowfall;
