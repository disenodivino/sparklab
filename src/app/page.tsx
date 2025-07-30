import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowDown, Code, PenTool, Users } from "lucide-react";
import CountdownTimer from "@/components/countdown-timer";
import RegistrationForm from "@/components/registration-form";
import Header from "@/components/header";
import Footer from "@/components/footer";
import Timeline from "@/components/timeline";
import HeroSection from "@/components/hero-section";

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

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header />
      <main className="flex-grow">
        <HeroSection />

        <section id="about" className="py-20 lg:py-32 container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-4xl md:text-5xl font-bold mb-6">About The Event</h2>
            <p className="text-lg text-foreground/80 mb-12">
              SparkLab is where creativity meets innovation in a high-energy, 30-hour design marathon. We bring together the brightest minds from across the nation to tackle real-world challenges, pushing the boundaries of design and technology. Whether you're a designer, developer, or dreamer, this is your platform to shine.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <Card className="bg-card/50 border-border/50 text-center animate-fade-in-up" style={{animationDelay: '0.2s'}}>
                <CardHeader>
                  <div className="mx-auto bg-primary/10 p-4 rounded-full w-fit">
                    <PenTool className="h-8 w-8 glowing-icon" />
                  </div>
                  <CardTitle className="mt-4">Design Challenges</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-foreground/70">Tackle intriguing design problems and create user-centric solutions.</p>
                </CardContent>
              </Card>
              <Card className="bg-card/50 border-border/50 text-center animate-fade-in-up" style={{animationDelay: '0.4s'}}>
                <CardHeader>
                  <div className="mx-auto bg-primary/10 p-4 rounded-full w-fit">
                    <Code className="h-8 w-8 glowing-icon" />
                  </div>
                  <CardTitle className="mt-4">Prototype & Build</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-foreground/70">Bring your ideas to life by building functional prototypes and demos.</p>
                </CardContent>
              </Card>
              <Card className="bg-card/50 border-border/50 text-center animate-fade-in-up" style={{animationDelay: '0.6s'}}>
                <CardHeader>
                  <div className="mx-auto bg-primary/10 p-4 rounded-full w-fit">
                    <Users className="h-8 w-8 glowing-icon" />
                  </div>
                  <CardTitle className="mt-4">Collaborate & Network</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-foreground/70">Work with talented peers and connect with industry mentors.</p>
                </CardContent>
              </Card>
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
                <div key={member.name} className="flex flex-col items-center animate-fade-in-up" style={{animationDelay: `${index * 0.2}s`}}>
                  <Image
                    src={member.avatar}
                    alt={member.name}
                    width={128}
                    height={128}
                    data-ai-hint={member.hint}
                    className="rounded-full mb-4 border-2 border-primary/50"
                  />
                  <h3 className="text-xl font-bold">{member.name}</h3>
                  <p className="text-accent">{member.role}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section id="register" className="py-20 lg:py-32 bg-card/20">
          <div className="container mx-auto px-4">
            <div className="max-w-2xl mx-auto">
              <Card className="border-2 border-primary/50 glow-shadow-primary">
                <CardHeader className="text-center">
                  <CardTitle className="text-4xl">Join the Spark</CardTitle>
                  <CardDescription>Register now to secure your spot in the most exciting designathon of the year.</CardDescription>
                </CardHeader>
                <CardContent>
                  <RegistrationForm />
                </CardContent>
              </Card>
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
      </main>
      <Footer />
    </div>
  );
}
