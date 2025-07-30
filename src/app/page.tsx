
"use client";

import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowDown, Code, PenTool, Users, ArrowRight, LucideIcon } from "lucide-react";
import CountdownTimer from "@/components/countdown-timer";
import RegistrationForm from "@/components/registration-form";
import Header from "@/components/header";
import Footer from "@/components/footer";
import Timeline from "@/components/timeline";
import HeroSection from "@/components/hero-section";
import TeamMemberCard from "@/components/team-member-card";
import RegistrationCard from "@/components/registration-card";
import { useInteractiveCard } from "@/hooks/use-interactive-card";
import { cn } from "@/lib/utils";
import React from "react";

const teamMembers = [
  { name: "Alex Johnson", role: "Lead Organizer", avatar: "https://placehold.co/128x128.png", hint: "person portrait" },
  { name: "Maria Garcia", role: "Design Lead", avatar: "https://placehold.co/128x128.png", hint: "person portrait" },
  { name: "Sam Lee", role: "Tech Lead", avatar: "https://placehold.co/128x128.png", hint: "person portrait" },
  { name: "Jessica Chen", role: "Sponsorship Coordinator", avatar: "https://placehold.co/128x128.png", hint: "person portrait" },
];

const sponsors = [
  { name: "TechCorp", logo: "https://placehold.co/300x150.png", hint: "tech company" },
  { name: "DesignMinds", logo: "https://placehold.co/300x150.png", hint: "design agency" },
  { name: "Innovate Inc.", logo: "https://placehold.co/300x150.png", hint: "startup incubator" },
  { name: "Creative Solutions", logo: "https://placehold.co/300x150.png", hint: "creative agency" },
];

const aboutCardsData = [
  {
    icon: PenTool,
    title: "Design Challenges",
    description: "Tackle intriguing design problems and create user-centric solutions that make a real impact.",
    className: "md:col-span-2",
  },
  {
    icon: Code,
    title: "Prototype & Build",
    description: "Bring your ideas to life by building functional prototypes and demos with cutting-edge tools.",
    className: "md:row-span-2",
  },
  {
    icon: Users,
    title: "Collaborate & Network",
    description: "Work with talented peers and connect with industry mentors who can guide your journey.",
    className: "md:col-span-2",
  },
];

type AboutCardProps = {
    icon: LucideIcon;
    title: string;
    description: string;
    className?: string;
    style?: React.CSSProperties;
}

const AboutCard = ({ icon: Icon, title, description, className, style }: AboutCardProps) => {
    const { ref, style: interactiveStyle } = useInteractiveCard();
    return (
        <Card 
            ref={ref as React.RefObject<HTMLDivElement>}
            style={{...style, ...interactiveStyle}}
            className={cn("bg-card/50 border-border/50 text-left animate-fade-in-up flex flex-col card-3d-interactive", className)}
        >
            <CardHeader className="flex-shrink-0">
                <div className="flex items-center gap-4">
                    <div className="bg-primary/10 p-4 rounded-full w-fit">
                        <Icon className="h-8 w-8 glowing-icon" />
                    </div>
                    <CardTitle className="text-2xl">{title}</CardTitle>
                </div>
            </CardHeader>
            <CardContent className="flex-grow">
                <p className="text-foreground/70">{description}</p>
            </CardContent>
        </Card>
    )
}

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header />
      <main className="flex-grow">
        <HeroSection />

        <section id="about" className="py-20 lg:py-32 container mx-auto px-4">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-bold mb-6">What is SparkLab?</h2>
              <p className="text-lg text-foreground/80 max-w-3xl mx-auto">
                SparkLab is where creativity meets innovation in a high-energy, 30-hour design marathon. We bring together the brightest minds to tackle real-world challenges, pushing the boundaries of design and technology.
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 md:grid-rows-2 gap-8">
              {aboutCardsData.map((card, index) => (
                <AboutCard 
                    key={card.title} 
                    icon={card.icon}
                    title={card.title}
                    description={card.description}
                    className={card.className}
                    style={{animationDelay: `${index * 0.2}s`}}
                />
              ))}
            </div>
             <div className="text-center mt-16">
                <Button variant="ghost" size="lg" asChild>
                    <a href="#timeline">
                        See the full schedule <ArrowRight className="ml-2 h-5 w-5" />
                    </a>
                </Button>
            </div>
          </div>
        </section>

        <section id="timeline" className="py-20 lg:py-32 bg-card/20">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto text-center mb-12">
              <h2 className="text-4xl md:text-5xl font-bold mb-6">Event Timeline</h2>
              <p className="text-lg text-foreground/80">
                Follow the 30-hour journey of creation and innovation.
              </p>
            </div>
            <Timeline />
          </div>
        </section>

        <section id="team" className="py-20 lg:py-32">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-4xl md:text-5xl font-bold mb-12">Meet the Team</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8">
              {teamMembers.map((member, index) => (
                <TeamMemberCard key={member.name} member={member} style={{animationDelay: `${index * 0.2}s`}} />
              ))}
            </div>
          </div>
        </section>
        
        <section id="sponsors" className="py-20 lg:py-32">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-4xl md:text-5xl font-bold mb-12">Our Sponsors</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 items-center">
              {sponsors.map((sponsor) => (
                <div key={sponsor.name} className="flex justify-center">
                  <Image
                    src={sponsor.logo}
                    alt={`${sponsor.name} logo`}
                    width={200}
                    height={100}
                    data-ai-hint={sponsor.hint}
                    className="opacity-70 grayscale hover:opacity-100 hover:grayscale-0 transition-all duration-300"
                  />
                </div>
              ))}
            </div>
          </div>
        </section>

        <section id="register" className="py-20 lg:py-32 bg-card/20">
          <div className="container mx-auto px-4">
            <div className="max-w-2xl mx-auto">
              <RegistrationCard />
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
