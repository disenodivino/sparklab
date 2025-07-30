"use client";

import React from 'react';

const Snowfall = ({ count = 150 }) => {
  const snowflakes = Array.from({ length: count }).map((_, i) => {
    const style = {
      '--i': Math.random(),
      left: `${Math.random() * 100}vw`,
      animationDuration: `${20 + Math.random() * 20}s`,
      animationDelay: `${-1 * Math.random() * 40}s`,
      opacity: Math.random(),
    };
    // Using as because TS doesn't know about --i
    return <div key={i} className="snowflake" style={style as React.CSSProperties}></div>;
  });

  return <div className="snowfall-container">{snowflakes}</div>;
};

export default Snowfall;
