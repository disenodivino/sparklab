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
    <header className="fixed top-0 left-0 right-0 z-50 transition-all duration-300">
      <div className="container mx-auto px-4 pt-4">
        <div className={cn(
          "flex items-center justify-between h-16 px-6 transition-all duration-300 rounded-full glass-navbar",
          scrolled ? "shadow-2xl" : ""
        )}>
          <Link href="/" className="flex items-center gap-2 pl-2">
            <div className="relative w-10 h-10 md:w-12 md:h-12 rounded-full overflow-hidden bg-background/20 flex items-center justify-center">
              <Image 
                src="/Di - Rounded.png" 
                alt="SparkLab Logo" 
                layout="fill"
                objectFit="cover"
                className=""
              />
            </div>
          </Link>
          <nav className="hidden md:flex items-center gap-6">
            <a href="/#about" className="text-sm font-medium text-foreground/80 hover:text-primary transition-colors">About</a>
            <a href="/#timeline" className="text-sm font-medium text-foreground/80 hover:text-primary transition-colors">Timeline</a>
            <a href="/#team" className="text-sm font-medium text-foreground/80 hover:text-primary transition-colors">Team</a>
            <a href="/#sponsors" className="text-sm font-medium text-foreground/80 hover:text-primary transition-colors">Sponsors</a>
            <a href="https://unstop.com/o/7DopUC5?utm_medium=Share&utm_source=logged_out_user&utm_campaign=Innovation_challenge" className="text-sm font-medium text-foreground/80 hover:text-primary transition-colors">Register</a>
          </nav>
          <Button asChild variant="outline" className="hidden md:flex animated-border-button rounded-full">
            <a href="https://unstop.com/o/7DopUC5?utm_medium=Share&utm_source=logged_out_user&utm_campaign=Innovation_challenge" target="_blank" rel="noopener noreferrer">Register Now</a>
          </Button>
        </div>
      </div>
    </header>
  );
};

export default Header;
