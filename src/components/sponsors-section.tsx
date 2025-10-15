"use client";

import Image from "next/image";
import React from "react";

export type Sponsor = {
  name: string;
  logo: string;
  hint?: string;
  website?: string;
};

const sponsors: Sponsor[] = [
  {
    name: "Petro",
    logo: "/Petronet_LNG.jpg",
    hint: "Petro Logo",
    website: "https://petro.com",
  },
  {
    name: "Google Gemini",
    logo: "/GoogleGemini_Lockup_FullColor_White.png",
    hint: "Google Gemini",
    website: "https://gemini.google.com",
  },
  {
    name: "Seamovation Labs Pvt. Ltd.",
    logo: "/seamovation.png",
    hint: "Seamovation Labs Pvt. Ltd.",
    website: "https://www.seamovation.com",
  },
  {
    name: "ISTE",
    logo: "/istelogo.png",
    hint: "ISTE organization",
    website: "https://www.iste.org",
  },
];

export default function SponsorsSection() {
  return (
    <section id="sponsors" className="py-20 lg:py-32">
      <div className="container mx-auto px-4 text-center">
        <h2 className="text-4xl md:text-5xl font-headline mb-6">
          In Collaboration With
        </h2>
        <p className="text-lg text-foreground/80 max-w-3xl mx-auto mb-12">
          We're grateful to our amazing sponsors who make SparkLab possible.
          Their support enables us to create an extraordinary experience for all
          participants.
        </p>

        <div className="flex flex-wrap justify-center items-center gap-12 md:gap-16">
          {sponsors.map((sponsor, index) => (
            <div
              key={sponsor.name}
              className="flex justify-center animate-fade-in-up"
              style={{ animationDelay: `${index * 0.2}s` }}
            >
              {sponsor.website ? (
                <a
                  href={sponsor.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block hover:scale-105 transition-transform duration-300 hover:cursor-none"
                >
                  <div className="h-16 md:h-20 lg:h-24 w-32 md:w-40 lg:w-48 relative">
                    <Image
                      src={sponsor.logo}
                      alt={`${sponsor.name} logo`}
                      fill
                      data-ai-hint={sponsor.hint}
                      className="object-contain hover:drop-shadow-lg transition-all duration-300 hover:cursor-none"
                    />
                  </div>
                </a>
              ) : (
                <div className="hover:scale-105 transition-transform duration-300 hover:cursor-none">
                  <div className="h-16 md:h-20 lg:h-24 w-32 md:w-40 lg:w-48 relative">
                    <Image
                      src={sponsor.logo}
                      alt={`${sponsor.name} logo`}
                      fill
                      data-ai-hint={sponsor.hint}
                      className="object-contain hover:drop-shadow-lg transition-all duration-300 hover:cursor-none"
                    />
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="mt-16 text-center">
          <p className="text-foreground/60 mb-4">
            Interested in sponsoring SparkLab?
          </p>
          <a
            href="mailto:diseno.divino@nmit.ac.in"
            className="text-accent hover:text-accent/80 font-medium transition-colors duration-300 hover:underline hover:cursor-none"
          >
            Get in touch with us →
          </a>
        </div>
      </div>
    </section>
  );
}
