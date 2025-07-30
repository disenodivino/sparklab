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
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.2);
        scene.add(ambientLight);
        
        const pointLight = new THREE.PointLight(new THREE.Color('hsl(262.1, 83.3%, 57.8%)').getHex(), 1.5, 200);
        pointLight.position.set(0, 0, 25);
        scene.add(pointLight);

        // Starfield
        const starGeometry = new THREE.BufferGeometry();
        const starVertices = [];
        for (let i = 0; i < 10000; i++) {
            const x = (Math.random() - 0.5) * 2000;
            const y = (Math.random() - 0.5) * 2000;
            const z = (Math.random() - 1) * 1000; // Position them further back
            starVertices.push(x, y, z);
        }
        starGeometry.setAttribute('position', new THREE.Float32BufferAttribute(starVertices, 3));
        const starMaterial = new THREE.PointsMaterial({
            color: 0xffffff,
            size: 0.5,
            transparent: true,
            opacity: 0.6
        });
        const starfield = new THREE.Points(starGeometry, starMaterial);
        scene.add(starfield);

        // Central Star Core
        const starCoreGeometry = new THREE.IcosahedronGeometry(10, 15);
        const starCoreMaterial = new THREE.MeshPhongMaterial({
             color: new THREE.Color('hsl(var(--primary))').getHex(),
             emissive: new THREE.Color('hsl(var(--primary))').getHex(),
             emissiveIntensity: 0.8,
             shininess: 100,
             specular: 0xffffff,
        });
        const starCore = new THREE.Mesh(starCoreGeometry, starCoreMaterial);
        scene.add(starCore);

        // Star Atmosphere
        const starAtmosphereMaterial = new THREE.ShaderMaterial({
            vertexShader: `
                varying vec3 vNormal;
                void main() {
                    vNormal = normalize(normalMatrix * normal);
                    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
                }
            `,
            fragmentShader: `
                varying vec3 vNormal;
                uniform vec3 glowColor;
                void main() {
                    float intensity = pow(0.5 - dot(vNormal, vec3(0.0, 0.0, 1.0)), 2.0);
                    gl_FragColor = vec4(glowColor, 1.0) * intensity;
                }
            `,
             uniforms: {
                glowColor: { value: new THREE.Color('hsl(var(--accent))') }
            },
            side: THREE.BackSide,
            blending: THREE.AdditiveBlending,
            transparent: true
        });

        const starAtmosphere = new THREE.Mesh(
            new THREE.IcosahedronGeometry(10, 15),
            starAtmosphereMaterial
        );
        starAtmosphere.scale.set(1.2, 1.2, 1.2);
        scene.add(starAtmosphere);


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
            
            camera.position.y += (-mousePos.current.y * 10 - camera.position.y) * 0.05;
            camera.position.x += (mousePos.current.x * 10 - camera.position.x) * 0.05;
            camera.lookAt(scene.position);

            starCore.rotation.y = elapsedTime * 0.1;
            starAtmosphere.rotation.y = elapsedTime * 0.1;
            starfield.rotation.y = elapsedTime * 0.02;
            
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
        };
    }, []);

    return <div ref={mountRef} className="absolute inset-0 z-0" />;
};

export default Spark3D;
