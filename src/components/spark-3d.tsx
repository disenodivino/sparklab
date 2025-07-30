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
    <div className="absolute top-0 left-0 right-0 w-full h-full flex items-center justify-center md:justify-end overflow-hidden">
        <div className="w-[250%] md:w-[150%] lg:w-[225%] xl:w-[225%] h-[200%] md:translate-x-1/4">
            <canvas ref={canvasRef} id="canvas3d" className="w-full h-full" />
        </div>
    </div>
  );
};

export default Spark3D;
