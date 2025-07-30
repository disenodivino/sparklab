"use client";

import React, { useRef, useEffect } from 'react';
import * as THREE from 'three';

const Spark3D = () => {
    const mountRef = useRef<HTMLDivElement>(null);
    const mousePos = useRef({ x: 0, y: 0 });

    useEffect(() => {
        if (!mountRef.current) return;

        const currentMount = mountRef.current;

        // Scene
        const scene = new THREE.Scene();

        // Camera
        const camera = new THREE.PerspectiveCamera(75, currentMount.clientWidth / currentMount.clientHeight, 0.1, 1000);
        camera.position.z = 10;

        // Renderer
        const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
        renderer.setSize(currentMount.clientWidth, currentMount.clientHeight);
        renderer.setPixelRatio(window.devicePixelRatio);
        currentMount.appendChild(renderer.domElement);
        
        const particleGroup = new THREE.Group();
        scene.add(particleGroup);

        const colorPrimary = new THREE.Color('hsl(var(--primary))');
        const colorAccent = new THREE.Color('hsl(var(--accent))');

        const createRing = (radius: number, particleCount: number, particleSize: number) => {
            const geometry = new THREE.BufferGeometry();
            const positions = new Float32Array(particleCount * 3);
            const colors = new Float32Array(particleCount * 3);

            for (let i = 0; i < particleCount; i++) {
                const i3 = i * 3;
                const angle = (i / particleCount) * Math.PI * 2;
                positions[i3] = radius * Math.cos(angle);
                positions[i3 + 1] = 0;
                positions[i3 + 2] = radius * Math.sin(angle);
                
                const mixedColor = colorPrimary.clone().lerp(colorAccent, Math.random());
                colors[i3] = mixedColor.r;
                colors[i3 + 1] = mixedColor.g;
                colors[i3 + 2] = mixedColor.b;
            }

            geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
            geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

            const material = new THREE.PointsMaterial({
                size: particleSize,
                vertexColors: true,
                blending: THREE.AdditiveBlending,
                transparent: true,
                depthWrite: false,
            });

            return new THREE.Points(geometry, material);
        };
        
        const ring1 = createRing(3.5, 2000, 0.03);
        ring1.rotation.x = Math.PI / 3;
        ring1.rotation.y = Math.PI / 4;
        
        const ring2 = createRing(4.5, 3000, 0.025);
        ring2.rotation.x = -Math.PI / 3;
        ring2.rotation.y = -Math.PI / 4;

        const ring3 = createRing(5.5, 4000, 0.02);
        ring3.rotation.x = Math.PI / 2;
        ring3.rotation.y = 0;

        particleGroup.add(ring1, ring2, ring3);

        // Mouse move listener
        const onMouseMove = (event: MouseEvent) => {
            mousePos.current.x = (event.clientX / window.innerWidth) * 2 - 1;
            mousePos.current.y = -(event.clientY / window.innerHeight) * 2 + 1;
        };
        window.addEventListener('mousemove', onMouseMove);

        // Animation
        const clock = new THREE.Clock();
        const animate = () => {
            const elapsedTime = clock.getElapsedTime();
            
            particleGroup.rotation.y = elapsedTime * 0.05 + mousePos.current.x * 0.2;
            particleGroup.rotation.x = elapsedTime * 0.05 + mousePos.current.y * 0.2;

            ring1.rotation.z = elapsedTime * 0.1;
            ring2.rotation.z = -elapsedTime * 0.15;
            ring3.rotation.z = elapsedTime * 0.08;

            renderer.render(scene, camera);
            requestAnimationFrame(animate);
        };
        animate();

        // Resize handler
        const onResize = () => {
            camera.aspect = currentMount.clientWidth / currentMount.clientHeight;
            camera.updateProjectionMatrix();
            renderer.setSize(currentMount.clientWidth, currentMount.clientHeight);
        };
        window.addEventListener('resize', onResize);

        // Cleanup
        return () => {
            window.removeEventListener('resize', onResize);
            window.removeEventListener('mousemove', onMouseMove);
            if(currentMount && renderer.domElement){
                currentMount.removeChild(renderer.domElement);
            }
            ring1.geometry.dispose();
            ring1.material.dispose();
            ring2.geometry.dispose();
            ring2.material.dispose();
            ring3.geometry.dispose();
            ring3.material.dispose();
        };
    }, []);

    return <div ref={mountRef} className="absolute inset-0 z-0" />;
};

export default Spark3D;
