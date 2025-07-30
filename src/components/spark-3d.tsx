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

        // Particle Geometry
        const particleCount = 5000;
        const positions = new Float32Array(particleCount * 3);
        const colors = new Float32Array(particleCount * 3);
        const sizes = new Float32Array(particleCount);

        const colorPrimary = new THREE.Color(0xE040FB);
        const colorAccent = new THREE.Color(0x3D5AFE);

        for (let i = 0; i < particleCount; i++) {
            const i3 = i * 3;
            const radius = 2 + Math.random() * 2;
            const phi = Math.random() * Math.PI * 2;
            const theta = Math.random() * Math.PI;

            positions[i3] = radius * Math.sin(theta) * Math.cos(phi);
            positions[i3 + 1] = radius * Math.sin(theta) * Math.sin(phi);
            positions[i3 + 2] = radius * Math.cos(theta);
            
            const mixedColor = Math.random() > 0.5 ? colorPrimary.clone() : colorAccent.clone();
            mixedColor.lerp(new THREE.Color(0xffffff), Math.random() * 0.5);
            colors[i3] = mixedColor.r;
            colors[i3 + 1] = mixedColor.g;
            colors[i3 + 2] = mixedColor.b;

            sizes[i] = Math.random() * 1.5 + 0.5;
        }

        const geometry = new THREE.BufferGeometry();
        geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
        geometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));
        
        // Particle Material
        const vertexShader = `
            attribute float size;
            varying vec3 vColor;
            void main() {
                vColor = color;
                vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
                gl_PointSize = size * (300.0 / -mvPosition.z);
                gl_Position = projectionMatrix * mvPosition;
            }
        `;

        const fragmentShader = `
            varying vec3 vColor;
            void main() {
                float strength = distance(gl_PointCoord, vec2(0.5));
                if (strength > 0.5) discard;
                gl_FragColor = vec4(vColor, (1.0 - strength * 2.0));
            }
        `;

        const material = new THREE.ShaderMaterial({
            vertexShader,
            fragmentShader,
            blending: THREE.AdditiveBlending,
            depthWrite: false,
            transparent: true,
            vertexColors: true,
        });

        // Particles
        const particles = new THREE.Points(geometry, material);
        scene.add(particles);

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
            
            particles.rotation.y = elapsedTime * 0.1 + mousePos.current.x * 0.5;
            particles.rotation.x = elapsedTime * 0.05 + mousePos.current.y * 0.5;

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
            geometry.dispose();
            material.dispose();
        };
    }, []);

    return <div ref={mountRef} className="absolute inset-0 z-0" />;
};

export default Spark3D;
