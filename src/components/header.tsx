"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "./ui/button";
import { cn } from "@/lib/utils";
import { Sparkles } from "lucide-react";

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
          <Link href="/" className="flex items-center gap-2 text-xl font-bold">
            <Sparkles className="h-6 w-6 text-primary" />
            <span className="font-headline">Diseño Divino</span>
          </Link>
          <nav className="hidden md:flex items-center gap-6">
            <a href="/#about" className="text-sm font-medium text-foreground/80 hover:text-primary transition-colors">About</a>
            <Link href="/timeline" className="text-sm font-medium text-foreground/80 hover:text-primary transition-colors">Timeline</Link>
            <a href="/#team" className="text-sm font-medium text-foreground/80 hover:text-primary transition-colors">Team</a>
            <a href="/#register" className="text-sm font-medium text-foreground/80 hover:text-primary transition-colors">Register</a>
            <a href="/#sponsors" className="text-sm font-medium text-foreground/80 hover:text-primary transition-colors">Sponsors</a>
          </nav>
          <Button asChild className="hidden md:flex bg-primary text-primary-foreground hover:bg-primary/90">
            <a href="#register">Register Now</a>
          </Button>
        </div>
      </div>
    </header>
  );
};

export default Header;
