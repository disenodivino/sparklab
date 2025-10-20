"use client";

import { TeamCard, TeamMember } from "./team-card";

const executiveTeam: TeamMember[] = [
  {
    name: "Srivathsa S Murthy",
    role: "President, Diseño Divino & Event Head",
    avatar: "/team_pics/svsm3.jpg",
    hint: "person portrait",
  },
  {
    name: "Rohith Vishwanath",
    role: "Secretary, Diseño Divino & Event Lead Organizer",
    avatar: "/team_pics/Rohith.jpg",
    hint: "person portrait",
  },
  {
    name: "Sriram P S",
    role: "Treasurer, Diseño Divino & Finance Head",
    avatar: "/team_pics/SRIRAM P_S.jpg",
    hint: "person portrait",
  },
];

const organizers: TeamMember[] = [
  {
    name: "Anirudha Acharya",
    role: "Sponsorship Lead",
    avatar: "/team_pics/ANIRUDHA_ACHARYA.jpg",
    hint: "person portrait",
  },
  {
    name: "Kalattur Somesh",
    role: "Operations Lead & Event Lead Coordinator",
    avatar: "/team_pics/KALATTUR SOMESH.jpg",
    hint: "person portrait",
  },
  {
    name: "Wilfred D'Souza",
    role: "Technical Lead",
    avatar: "/team_pics/Wilfred_D'Souza.jpg",
    hint: "person portrait",
  },
  {
    name: "Aasiya Shariff",
    role: "Social Media Lead",
    avatar: "/team_pics/AASIYA SHARIFF.jpeg",
    hint: "person portrait",
  },
  {
    name: "Sahil Yadav",
    role: "Marketing Lead",
    avatar: "/team_pics/SAHIL_YADAV.jpg",
    hint: "person portrait",
  },
  {
    name: "Vibhas Reddy",
    role: "Design Lead",
    avatar: "/team_pics/RACHAMALLU VIBHAS.jpeg",
    hint: "person portrait",
  },
  {
    name: "Prarthana T Raj",
    role: "Operations & Logistics Coordinator",
    avatar: "/team_pics/PRARTHANA_T.jpg",
    hint: "person portrait",
  },
  {
    name: "Badarinarayana",
    role: "Hospitality Head",
    avatar: "/team_pics/BADARINARAYANA BR.jpg",
    hint: "person portrait",
  },
  
  {
    name: "Yogesh Kumar Singh",
    role: "Event Coordinator",
    avatar: "/team_pics/YOGESH_KUMAR.jpeg",
    hint: "person portrait",
  },
  {
    name: "Diya Sharma",
    role: "Event Coordinator",
    avatar: "/team_pics/Diya_sharma.jpeg",
    hint: "person portrait",
  },
];

export default function ExecutiveTeamSection() {
  return (
    <section id="team" className="pt-10 lg:pt-16 pb-20 lg:pb-32 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-headline mb-6">
            Meet the Team
          </h2>
          <p className="text-lg text-foreground/80 max-w-3xl mx-auto">
            The brilliant minds behind SparkLab - bringing together experience,
            passion, and innovation to create an unforgettable event.
          </p>
        </div>

        {/* Executive Team */}
        <div className="mb-20">
          <h3 className="text-3xl font-headline text-center mb-12 text-accent">
            Executive Team
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8 lg:gap-12 max-w-6xl mx-auto justify-items-center items-stretch">
            {executiveTeam.map((member, index) => (
              <div key={member.name} className="w-full max-w-sm flex justify-center">
                <div className="w-full h-full">
                  <TeamCard
                    member={member}
                    size="large"
                    style={{ animationDelay: `${index * 0.2}s` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Organizers */}
        <div>
          <h3 className="text-3xl font-headline text-center mb-12 text-accent">
            Organizers
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 lg:gap-8 max-w-7xl mx-auto justify-items-center items-stretch">
            {organizers.map((member, index) => (
              <div key={member.name} className="w-full max-w-xs flex justify-center">
                <div className="w-full h-full">
                  <TeamCard
                    member={member}
                    size="medium"
                    style={{ animationDelay: `${(index + 3) * 0.1}s` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
