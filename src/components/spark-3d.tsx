"use client";

import React, { useEffect, useRef } from 'react';
import { Application } from '@splinetool/runtime';

const Spark3D = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (canvasRef.current) {
      const app = new Application(canvasRef.current);
      app.load('https://prod.spline.design/NeOtOPUTsNojinFh/scene.splinecode');
    }
  }, []);

  return (
    <div className="absolute top-0 left-0 w-full h-full">
      <canvas ref={canvasRef} id="canvas3d" />
    </div>
  );
};

export default Spark3D;
