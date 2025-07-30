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
        camera.position.z = 50;

        // Renderer
        const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
        renderer.setSize(currentMount.clientWidth, currentMount.clientHeight);
        renderer.setPixelRatio(window.devicePixelRatio);
        currentMount.appendChild(renderer.domElement);
        
        // Lighting
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.1);
        scene.add(ambientLight);
        
        const pointLight = new THREE.PointLight(new THREE.Color('hsl(262.1, 83.3%, 57.8%)').getHex(), 2, 100);
        scene.add(pointLight);

        // Starfield
        const starGeometry = new THREE.BufferGeometry();
        const starVertices = [];
        for (let i = 0; i < 10000; i++) {
            const x = (Math.random() - 0.5) * 2000;
            const y = (Math.random() - 0.5) * 2000;
            const z = (Math.random() - 0.5) * 2000;
            starVertices.push(x, y, z);
        }
        starGeometry.setAttribute('position', new THREE.Float32BufferAttribute(starVertices, 3));
        const starMaterial = new THREE.PointsMaterial({
            color: 0xffffff,
            size: 0.7,
            transparent: true,
            opacity: 0.7
        });
        const starfield = new THREE.Points(starGeometry, starMaterial);
        scene.add(starfield);

        // Asteroids
        const asteroidGroup = new THREE.Group();
        scene.add(asteroidGroup);
        const asteroidGeometry = new THREE.IcosahedronGeometry(1, 0);
        const asteroidMaterial = new THREE.MeshStandardMaterial({ 
            color: new THREE.Color('hsl(var(--primary))').getHex(), 
            flatShading: true,
            metalness: 0.5,
            roughness: 0.8
        });

        for (let i = 0; i < 200; i++) {
            const asteroid = new THREE.Mesh(asteroidGeometry, asteroidMaterial);

            const [x, y, z] = [
              (Math.random() - 0.5) * 150,
              (Math.random() - 0.5) * 150,
              (Math.random() - 0.5) * 150
            ];
            if(Math.sqrt(x*x + y*y + z*z) < 20) continue; // Keep clear of the center

            asteroid.position.set(x,y,z);

            const scale = Math.random() * 0.5 + 0.5;
            asteroid.scale.set(scale, scale, scale);
            asteroid.rotation.set(Math.random() * Math.PI, Math.random() * Math.PI, Math.random() * Math.PI);
            
            asteroidGroup.add(asteroid);
        }

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
            
            camera.position.y += (-mousePos.current.y * 10 - camera.position.y) * .05;
            camera.position.x += (mousePos.current.x * 10 - camera.position.x) * .05;
            camera.lookAt(scene.position);

            asteroidGroup.rotation.y = elapsedTime * 0.05;
            starfield.rotation.y = elapsedTime * 0.01;
            
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
            starGeometry.dispose();
            starMaterial.dispose();
            asteroidGeometry.dispose();
            asteroidMaterial.dispose();
        };
    }, []);

    return <div ref={mountRef} className="absolute inset-0 z-0" />;
};

export default Spark3D;
