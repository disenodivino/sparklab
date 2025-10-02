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
    name: "Google Gemini",
    logo: "/GoogleGemini_Lockup_FullColor_White.png",
    hint: "Google Gemini",
    website: "https://gemini.google.com",
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
          Our Sponsors
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
                  className="block hover:scale-105 transition-transform duration-300"
                >
                  <Image
                    src={sponsor.logo}
                    alt={`${sponsor.name} logo`}
                    width={sponsor.name === "Google Gemini" ? 500 : 200}
                    height={sponsor.name === "Google Gemini" ? 300 : 100}
                    data-ai-hint={sponsor.hint}
                    className="hover:drop-shadow-lg transition-all duration-300"
                  />
                </a>
              ) : (
                <div className="hover:scale-105 transition-transform duration-300">
                  <Image
                    src={sponsor.logo}
                    alt={`${sponsor.name} logo`}
                    width={sponsor.name === "Google Gemini" ? 500 : 200}
                    height={sponsor.name === "Google Gemini" ? 300 : 100}
                    data-ai-hint={sponsor.hint}
                    className="hover:drop-shadow-lg transition-all duration-300"
                  />
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
            href="mailto:sponsors@sparklab.com"
            className="text-accent hover:text-accent/80 font-medium transition-colors duration-300"
          >
            Get in touch with us →
          </a>
        </div>
      </div>
    </section>
  );
}
