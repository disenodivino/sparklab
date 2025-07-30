"use client";

import { Button } from "@/components/ui/button";
import CountdownTimer from "@/components/countdown-timer";
import Spark3D from "@/components/spark-3d";
import { ArrowDown } from "lucide-react";

export default function HeroSection() {
    return (
        <section id="hero" className="relative w-full h-screen flex items-center justify-center overflow-hidden">
             <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-background to-transparent z-20 pointer-events-none"></div>
            
            <div className="absolute inset-0">
                <Spark3D />
            </div>

            <div className="relative z-10 container mx-auto px-4 grid md:grid-cols-2 gap-8 items-center">
                <div className="flex flex-col items-start text-left animate-fade-in-up">
                    <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold tracking-tighter mb-4 text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent">
                        SparkLab
                    </h1>
                    <p className="max-w-xl text-lg md:text-xl text-foreground/80 mb-6">
                        A 30-Hour National Level Designathon by <span className="font-bold text-accent">Diseño Divino</span>
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
            
            <a href="#about" aria-label="Scroll down" className="absolute bottom-10 left-1/2 -translate-x-1/2 z-10 animate-bounce">
                <ArrowDown className="h-8 w-8 text-foreground/50" />
            </a>
        </section>
    )
}