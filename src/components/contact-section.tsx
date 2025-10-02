"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useInteractiveCard } from "@/hooks/use-interactive-card";
import { cn } from "@/lib/utils";
import { Mail, Phone, MapPin, Calendar, Clock, Users } from "lucide-react";
import React from "react";

const contactInfo = [
  {
    icon: Mail,
    title: "Email Us",
    details: ["diseno.divino@nmit.ac.in", "disenodivino.nmit@gmail.com"],
    description: "Get in touch for any queries or assistance",
  },
  {
    icon: Phone,
    title: "Call Us",
    details: ["+91 9538996039", "+91 9880742348"],
    description: "Speak directly with our team",
  },
  {
    icon: MapPin,
    title: "Visit Us",
    details: [
      "Nitte Meenakshi Institute of Technology, NDU",
      "Bangalore, Karnataka - 560064",
    ],
    description: "Join us at our campus location",
  },
];

const eventDetails = [
  {
    icon: Calendar,
    title: "Event Date",
    detail: "Oct 24-25, 2025",
    description: "30-hour intensive designathon",
  },
  {
    icon: Clock,
    title: "Registration Deadline",
    detail: "Oct 15, 2025",
    description: "Don't miss the opportunity",
  },
  {
    icon: Users,
    title: "Team Size",
    detail: "1-4 Members",
    description: "Form your dream team",
  },
];

const ContactCard = ({
  icon: Icon,
  title,
  details,
  description,
  style,
}: {
  icon: any;
  title: string;
  details: string[];
  description: string;
  style?: React.CSSProperties;
}) => {
  const { ref, style: interactiveStyle } = useInteractiveCard();

  return (
    <Card
      ref={ref as React.RefObject<HTMLDivElement>}
      style={{ ...style, ...interactiveStyle }}
      className="bg-card/30 border-border/40 hover:border-accent/50 animate-fade-in-up card-3d-interactive transition-all duration-300 hover:shadow-lg"
    >
      <CardHeader>
        <div className="flex items-center gap-4">
          <div className="p-3 rounded-lg bg-gradient-to-br from-accent/20 to-primary/20">
            <Icon className="h-6 w-6 text-accent" />
          </div>
          <CardTitle className="text-xl font-headline font-light">
            {title}
          </CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-2 mb-3">
          {details.map((detail, index) => (
            <p key={index} className="text-foreground font-medium">
              {detail}
            </p>
          ))}
        </div>
        <p className="text-foreground/60 text-sm">{description}</p>
      </CardContent>
    </Card>
  );
};

const EventDetailCard = ({
  icon: Icon,
  title,
  detail,
  description,
  style,
}: {
  icon: any;
  title: string;
  detail: string;
  description: string;
  style?: React.CSSProperties;
}) => {
  const { ref, style: interactiveStyle } = useInteractiveCard();

  return (
    <Card
      ref={ref as React.RefObject<HTMLDivElement>}
      style={{ ...style, ...interactiveStyle }}
      className="bg-gradient-to-br from-accent/10 to-primary/10 border-accent/30 animate-fade-in-up card-3d-interactive transition-all duration-300 hover:shadow-lg text-center"
    >
      <CardHeader className="pb-3">
        <div className="flex flex-col items-center gap-3">
          <div className="p-4 rounded-full bg-gradient-to-br from-accent to-primary">
            <Icon className="h-8 w-8 text-white" />
          </div>
          <CardTitle className="text-lg font-headline font-light">
            {title}
          </CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-2xl font-headline text-accent mb-2">{detail}</p>
        <p className="text-foreground/60 text-sm">{description}</p>
      </CardContent>
    </Card>
  );
};

export default function ContactSection() {
  return (
    <section id="contact" className="py-20 lg:py-32 bg-card/10">
      <div className="container mx-auto px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-headline mb-6">
              Get in Touch
            </h2>
            <p className="text-lg text-foreground/80 max-w-3xl mx-auto">
              Have questions about SparkLab? Need assistance with registration?
              We're here to help you every step of the way.
            </p>
          </div>

          {/* Contact Information */}
          <div className="mb-16">
            <h3 className="text-2xl font-headline text-center mb-8 text-accent">
              Contact Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {contactInfo.map((contact, index) => (
                <ContactCard
                  key={contact.title}
                  icon={contact.icon}
                  title={contact.title}
                  details={contact.details}
                  description={contact.description}
                  style={{ animationDelay: `${index * 0.2}s` }}
                />
              ))}
            </div>
          </div>

          {/* Event Details */}
          <div className="mb-16">
            <h3 className="text-2xl font-headline text-center mb-8 text-accent">
              Important Details
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 max-w-4xl mx-auto">
              {eventDetails.map((detail, index) => (
                <EventDetailCard
                  key={detail.title}
                  icon={detail.icon}
                  title={detail.title}
                  detail={detail.detail}
                  description={detail.description}
                  style={{ animationDelay: `${(index + 3) * 0.2}s` }}
                />
              ))}
            </div>
          </div>

          {/* Call to Action */}
          <div className="text-center">
            <div className="bg-gradient-to-br from-accent/20 to-primary/20 border border-accent/30 rounded-2xl p-8 max-w-2xl mx-auto">
              <h3 className="text-2xl font-headline mb-4">
                Ready to Spark Innovation?
              </h3>
              <p className="text-foreground/80 mb-6">
                Join hundreds of creative minds in this incredible journey of
                design and innovation.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button
                  size="lg"
                  className="bg-accent text-accent-foreground hover:bg-accent/90 glow-shadow-accent"
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
                <Button
                  size="lg"
                  variant="outline"
                  className="border-accent/50 hover:border-accent"
                  asChild
                >
                  <a href="mailto:diseno.divino@nmit.ac.in">Ask a Question</a>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
