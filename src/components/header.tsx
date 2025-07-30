"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "./ui/button";
import { cn } from "@/lib/utils";
import Image from "next/image";

const Header = () => {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
        scrolled ? "bg-background/80 backdrop-blur-lg border-b border-border/50" : "bg-transparent"
      )}
    >
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-20">
          <Link href="/" className="flex items-center gap-2">
            <div className="relative w-36 md:w-44 h-12">
              <Image 
                src="/Di - Rounded.png" 
                alt="SparkLab Logo" 
                layout="fill"
                objectFit="contain"
              />
            </div>
          </Link>
          <nav className="hidden md:flex items-center gap-6">
            <a href="/#about" className="text-sm font-medium text-foreground/80 hover:text-primary transition-colors">About</a>
            <a href="/#timeline" className="text-sm font-medium text-foreground/80 hover:text-primary transition-colors">Timeline</a>
            <a href="/#team" className="text-sm font-medium text-foreground/80 hover:text-primary transition-colors">Team</a>
            <a href="/#sponsors" className="text-sm font-medium text-foreground/80 hover:text-primary transition-colors">Sponsors</a>
            <a href="/#register" className="text-sm font-medium text-foreground/80 hover:text-primary transition-colors">Register</a>
          </nav>
          <Button asChild variant="outline" className="hidden md:flex animated-border-button">
            <a href="#register">Register Now</a>
          </Button>
        </div>
      </div>
    </header>
  );
};

export default Header;
