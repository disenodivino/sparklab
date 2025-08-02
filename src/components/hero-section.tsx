
"use client";

import { Button } from "@/components/ui/button";
import CountdownTimer from "@/components/countdown-timer";
import Spark3D from "@/components/spark-3d";
import { ArrowDown } from "lucide-react";
import Image from "next/image";
import ParticleFlares from "./particle-flares";

export default function HeroSection() {
    return (
        <section id="hero" className="relative w-full h-screen flex items-center justify-center pt-20">
             <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-background to-transparent z-10 pointer-events-none"></div>
            
            <ParticleFlares />
            <div className="absolute inset-0 z-[2]">
                <Spark3D />
            </div>

            <div className="relative z-20 container mx-auto px-4 grid md:grid-cols-2 gap-8 items-center text-center md:text-left">
                <div className="flex flex-col items-center md:items-start animate-fade-in-up">
                    <div className="w-[200px] md:w-[500px] mb-4">
                        <Image src="/sparklab logo.png" alt="SparkLab Logo" width={500} height={150} />
                    </div>
                    <p className="max-w-xl text-lg md:text-xl text-foreground/80 mb-6">
                        A 30-Hour National Level Designathon by <span className="font-nimbus"><span className="text-foreground" style={{ textShadow: '0 0 8px hsl(var(--primary))' }}>Diseño</span> <span style={{color: '#40E0D0', textShadow: '0 0 8px #40E0D0'}}>Divino</span></span>
                    </p>
                    <p className="font-headline text-2xl md:text-3xl font-medium mb-8">Ignite. Innovate. Inspire.</p>
                    <div className="mb-12">
                        <CountdownTimer />
                    </div>
                    <Button size="lg" className="bg-accent text-accent-foreground hover:bg-accent/90 glow-shadow-accent transition-all duration-300" asChild>
                        <a href="#register">Register Now</a>
                    </Button>
                </div>
            </div>
            
            <a href="#about" aria-label="Scroll down" className="absolute bottom-10 left-1/2 -translate-x-1/2 z-20 animate-bounce">
                <ArrowDown className="h-8 w-8 text-foreground/50" />
            </a>
        </section>
    )
}
