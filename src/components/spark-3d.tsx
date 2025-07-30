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
        camera.position.z = 5;

        // Renderer
        const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
        renderer.setSize(currentMount.clientWidth, currentMount.clientHeight);
        renderer.setPixelRatio(window.devicePixelRatio);
        currentMount.appendChild(renderer.domElement);

        // Particles
        const particlesCount = 5000;
        const positions = new Float32Array(particlesCount * 3);
        const colors = new Float32Array(particlesCount * 3);

        const colorPrimary = new THREE.Color('hsl(217, 91%, 60%)');
        const colorAccent = new THREE.Color('hsl(330, 80%, 60%)');

        for (let i = 0; i < particlesCount; i++) {
            const i3 = i * 3;
            // Position particles in a sphere
            const phi = Math.acos(-1 + (2 * i) / particlesCount);
            const theta = Math.sqrt(particlesCount * Math.PI) * phi;
            
            const x = 2.5 * Math.cos(theta) * Math.sin(phi);
            const y = 2.5 * Math.sin(theta) * Math.sin(phi);
            const z = 2.5 * Math.cos(phi);

            positions[i3] = x;
            positions[i3 + 1] = y;
            positions[i3 + 2] = z;

            const mixedColor = colorPrimary.clone().lerp(colorAccent, Math.random());
            colors[i3] = mixedColor.r;
            colors[i3 + 1] = mixedColor.g;
            colors[i3 + 2] = mixedColor.b;
        }

        const particlesGeometry = new THREE.BufferGeometry();
        particlesGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        particlesGeometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

        const particlesMaterial = new THREE.PointsMaterial({
            size: 0.02,
            vertexColors: true,
            blending: THREE.AdditiveBlending,
            transparent: true,
            depthWrite: false,
        });

        const particleSystem = new THREE.Points(particlesGeometry, particlesMaterial);
        scene.add(particleSystem);
        
        // Lights (can be simplified if not using MeshStandardMaterial)
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
        scene.add(ambientLight);

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
            
            particleSystem.rotation.y = elapsedTime * 0.1 + mousePos.current.x * 0.3;
            particleSystem.rotation.x = elapsedTime * 0.05 + mousePos.current.y * 0.3;
            
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
            particlesGeometry.dispose();
            particlesMaterial.dispose();
        };
    }, []);

    return <div ref={mountRef} className="absolute inset-0 z-0" />;
};

export default Spark3D;
