"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "./ui/button";
import { cn } from "@/lib/utils";
import Image from "next/image";
import { Menu, X } from "lucide-react";

const Header = () => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

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
        <div
          className={cn(
            "flex items-center justify-between h-16 px-6 transition-all duration-300 rounded-full glass-navbar-enhanced",
            scrolled ? "shadow-2xl" : ""
          )}
        >
          <Link href="/" className="flex items-center gap-2 pl-2">
            <div className="relative w-10 h-10 md:w-12 md:h-12 rounded-full overflow-hidden bg-background/20 flex items-center justify-center">
              <Image
                src="/Di - Rounded.png"
                alt="SparkLab Logo"
                fill
                className="object-cover"
              />
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-6">
            <a
              href="/#about"
              className="text-sm font-medium text-foreground/80 hover:text-primary transition-colors"
            >
              About
            </a>
            <a
              href="/#timeline"
              className="text-sm font-medium text-foreground/80 hover:text-primary transition-colors"
            >
              Timeline
            </a>
            <a
              href="/#prizes"
              className="text-sm font-medium text-foreground/80 hover:text-primary transition-colors"
            >
              Prizes
            </a>
            <a
              href="/#team"
              className="text-sm font-medium text-foreground/80 hover:text-primary transition-colors"
            >
              Team
            </a>
            <a
              href="/#jury"
              className="text-sm font-medium text-foreground/80 hover:text-primary transition-colors"
            >
              Jury
            </a>
            <a
              href="/#sponsors"
              className="text-sm font-medium text-foreground/80 hover:text-primary transition-colors"
            >
              Sponsors
            </a>
            <a
              href="/results"
              className="text-sm font-medium text-foreground/80 hover:text-primary transition-colors"
            >
              Results
            </a>
            <a
              href="/#contact"
              className="text-sm font-medium text-foreground/80 hover:text-primary transition-colors"
            >
              Contact
            </a>
          </nav>

          {/* Desktop Register Button */}
          <div className="hidden md:flex items-center gap-3">
            <Button
              asChild
              variant="outline"
              className="animated-border-button rounded-full"
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

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-3 text-foreground hover:text-primary transition-colors rounded-full hover:bg-white/10 active:bg-white/20"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle mobile menu"
          >
            {mobileMenuOpen ? <X size={28} /> : <Menu size={28} />}
          </button>
        </div>

        {/* Mobile Navigation Dropdown */}
        {mobileMenuOpen && (
          <div className="md:hidden mt-2 glass-navbar-enhanced rounded-2xl overflow-hidden animate-in slide-in-from-top-2 duration-200">
            <nav className="flex flex-col p-6 space-y-4">
              <a
                href="/#about"
                className="text-base font-medium text-foreground hover:text-primary transition-colors py-3 px-2 rounded-lg hover:bg-white/10"
                onClick={() => setMobileMenuOpen(false)}
              >
                About
              </a>
              <a
                href="/#timeline"
                className="text-base font-medium text-foreground hover:text-primary transition-colors py-3 px-2 rounded-lg hover:bg-white/10"
                onClick={() => setMobileMenuOpen(false)}
              >
                Timeline
              </a>
              <a
                href="/#prizes"
                className="text-base font-medium text-foreground hover:text-primary transition-colors py-3 px-2 rounded-lg hover:bg-white/10"
                onClick={() => setMobileMenuOpen(false)}
              >
                Prizes
              </a>
              <a
                href="/#team"
                className="text-base font-medium text-foreground hover:text-primary transition-colors py-3 px-2 rounded-lg hover:bg-white/10"
                onClick={() => setMobileMenuOpen(false)}
              >
                Team
              </a>
              <a
                href="/#jury"
                className="text-base font-medium text-foreground hover:text-primary transition-colors py-3 px-2 rounded-lg hover:bg-white/10"
                onClick={() => setMobileMenuOpen(false)}
              >
                Jury
              </a>
              <a
                href="/#sponsors"
                className="text-base font-medium text-foreground hover:text-primary transition-colors py-3 px-2 rounded-lg hover:bg-white/10"
                onClick={() => setMobileMenuOpen(false)}
              >
                Sponsors
              </a>
              <a
                href="/results"
                className="text-base font-medium text-foreground hover:text-primary transition-colors py-3 px-2 rounded-lg hover:bg-white/10"
                onClick={() => setMobileMenuOpen(false)}
              >
                Results
              </a>
              <a
                href="/#contact"
                className="text-base font-medium text-foreground hover:text-primary transition-colors py-3 px-2 rounded-lg hover:bg-white/10"
                onClick={() => setMobileMenuOpen(false)}
              >
                Contact
              </a>
              <div className="space-y-3 mt-6 mx-2">
                <Button
                  asChild
                  variant="outline"
                  className="animated-border-button rounded-full w-full"
                  onClick={() => setMobileMenuOpen(false)}
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
            </nav>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
