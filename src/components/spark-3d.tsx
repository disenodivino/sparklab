"use client";

import dynamic from 'next/dynamic';

const Spline = dynamic(() => import('@splinetool/react-spline'), {
  ssr: false,
});

const Spark3D = () => {
    return (
        <div className="absolute top-0 left-0 w-full h-full">
            <Spline scene="https://prod.spline.design/NeOtOPUTsNojinFh/scene.splinecode" />
        </div>
    );
};

export default Spark3D;
