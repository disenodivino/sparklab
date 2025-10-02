"use client";

import { Button } from "@/components/ui/button";
import CountdownTimer from "@/components/countdown-timer";
import Spark3D from "@/components/spark-3d";
import { ArrowDown } from "lucide-react";
import Image from "next/image";
import MovingGrid from "./moving-grid";

export default function HeroSection() {
  return (
    <section
      id="hero"
      className="relative w-full h-screen flex items-center justify-center pt-20 overflow-hidden"
    >
      <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-background to-transparent z-10 pointer-events-none"></div>

      <MovingGrid />

      <div className="absolute inset-0 z-[2]">
        <Spark3D />
      </div>

      <div className="relative z-20 container mx-auto px-4 grid md:grid-cols-2 gap-8 items-center text-center md:text-left">
        <div className="flex flex-col animate-fade-in-up">
          {/* Logo section - always center aligned */}
          <div className="flex flex-col items-center mb-6">
            {/* Petro Logo with "presents" text */}
            <div className="flex flex-col items-center mb-4">
              <div className="w-[120px] md:w-[150px] mb-2">
                <Image
                  src="/petro_logo.svg"
                  alt="Petro Logo"
                  width={150}
                  height={60}
                  className="object-contain"
                />
              </div>
              <p className="text-sm md:text-base font-medium text-foreground/70">
                presents
              </p>
            </div>

            {/* Main SparkLab Logo */}
            <div className="w-[200px] md:w-[500px]">
              <Image
                src="/logo.svg"
                alt="SparkLab Logo"
                width={500}
                height={150}
              />
            </div>
          </div>

          {/* Text content - center aligned like logos */}
          <div className="flex flex-col items-center text-center">
            {/* <h1 className="font-headline text-2xl md:text-3xl mb-8">
              Design Tomorrow. Today!
            </h1> */}
            <p className="max-w-xl text-lg md:text-xl text-foreground/80 mb-6">
              A 30-Hour National Level Designathon by{" "}
              <span className="font-nimbus">
                <span
                  className="text-foreground"
                  style={{ textShadow: "0 0 8px hsl(var(--primary))" }}
                >
                  Diseño
                </span>{" "}
                <span className="text-accent">Divino</span>
              </span>
            </p>

            <div className="mb-12">
              <CountdownTimer />
            </div>
            <Button
              size="lg"
              className="bg-accent text-accent-foreground hover:bg-accent/90 glow-shadow-accent transition-all duration-300"
              asChild
            >
              <a
                href="https://unstop.com/o/7DopUC5?utm_medium=Share&utm_source=logged_out_user&utm_campaign=Innovation_challenge"
                target="_blank"
                rel="noopener noreferrer"
              >
                Register Now
              </a>
            </Button>
          </div>
        </div>
      </div>

      <a
        href="#about"
        aria-label="Scroll down"
        className="absolute bottom-10 left-1/2 -translate-x-1/2 z-20 animate-bounce"
      >
        <ArrowDown className="h-8 w-8 text-foreground/50" />
      </a>
    </section>
  );
}
