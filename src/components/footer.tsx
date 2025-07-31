import { Github, Twitter, Instagram, Sparkles } from "lucide-react";
import Link from "next/link";

const Footer = () => {
  return (
    <footer className="bg-card/20 border-t border-border/50">
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2 text-xl">
            <Sparkles className="h-6 w-6 text-primary" />
            <span className="font-nimbus"><span className="text-foreground">Diseño</span> <span className="text-accent">Divino</span></span>
          </div>
          <p className="text-sm text-foreground/60">
            &copy; {new Date().getFullYear()} SparkLab. All rights reserved.
          </p>
          <div className="flex gap-4">
            <Link href="#" aria-label="Twitter">
              <Twitter className="h-6 w-6 text-foreground/60 hover:text-primary transition-colors" />
            </Link>
            <Link href="#" aria-label="Instagram">
              <Instagram className="h-6 w-6 text-foreground/60 hover:text-primary transition-colors" />
            </Link>
            <Link href="#" aria-label="GitHub">
              <Github className="h-6 w-6 text-foreground/60 hover:text-primary transition-colors" />
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
