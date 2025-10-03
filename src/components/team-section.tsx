"use client";

import { TeamCard, TeamMember } from "./team-card";

const advisoryCommittee: TeamMember[] = [
  {
    name: "Dr. Piyush Kumar Pareek",
    role: "Convener & Head of Department (AIML)",
    avatar: "/team_pics/Rohith.jpg",
    hint: "professor portrait",
  },
  {
    name: "Dr. Sumana Sinha",
    role: "Faculty Advisor & ISTE Coordinator (Assoc. Prof. , ISE)",
    avatar: "/team_pics/Rohith.jpg",
    hint: "professor portrait",
  },
  {
    name: "Prof. Madhura G K",
    role: "Faculty Advisor, Diseño Divino (Asst. Prof. , AIML)",
    avatar: "/team_pics/Rohith.jpg",
    hint: "professor portrait",
  },
  {
    name: "Dr. Laxmana ",
    role: "Faculty Advisor, SparkLab (HOD, Dept of AI&DS)",
    avatar: "/team_pics/Rohith.jpg",
    hint: "professor portrait",
  },
];

const executiveTeam: TeamMember[] = [
  {
    name: "Srivathsa S Murthy",
    role: "President, Diseño Divino",
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
    avatar: "/team_pics/Rohith.jpg",
    hint: "person portrait",
  },
];

const organizers: TeamMember[] = [
  {
    name: "Anirudha Acharya",
    role: "Sponsorship Lead",
    avatar: "/team_pics/Rohith.jpg",
    hint: "person portrait",
  },
  {
    name: "Kalattur Somesh",
    role: "Operations Lead & Event Lead Coordinator",
    avatar: "/team_pics/somu.jpeg",
    hint: "person portrait",
  },
  {
    name: "Vibhas Reddy",
    role: "Design Lead",
    avatar: "/team_pics/Rohith.jpg",
    hint: "person portrait",
  },
  {
    name: "Prarthana T Raj",
    role: "Operations & Logistics Coordinator",
    avatar: "/team_pics/Rohith.jpg",
    hint: "person portrait",
  },
  {
    name: "Sahil Yadav",
    role: "Marketing Lead",
    avatar: "/team_pics/Rohith.jpg",
    hint: "person portrait",
  },
  {
    name: "Aasiya Shariff",
    role: "Social Media Lead",
    avatar: "/team_pics/Rohith.jpg",
    hint: "person portrait",
  },
  {
    name: "Badarinarayana",
    role: "Hospitality Head",
    avatar: "/team_pics/Rohith.jpg",
    hint: "person portrait",
  },
  {
    name: "Wilfred D'Souza",
    role: "Technical Lead",
    avatar: "/team_pics/Rohith.jpg",
    hint: "person portrait",
  },
  {
    name: "Yogesh Kumar Singh",
    role: "Event Coordinator",
    avatar: "/team_pics/Rohith.jpg",
    hint: "person portrait",
  },
  {
    name: "Diya Sharma",
    role: "Event Coordinator",
    avatar: "/team_pics/Rohith.jpg",
    hint: "person portrait",
  },
];

export default function TeamSection() {
  return (
    <section id="team" className="py-20 lg:py-32">
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

        {/* Advisory Committee */}
        <div className="mb-20">
          <h3 className="text-3xl font-headline text-center mb-12 text-accent">
            Advisory Committee
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 max-w-6xl mx-auto justify-items-center">
            {advisoryCommittee.map((member, index) => (
              <div
                key={member.name}
                className={index === 3 ? "md:col-start-2" : ""}
              >
                <TeamCard
                  member={member}
                  size="large"
                  style={{ animationDelay: `${index * 0.2}s` }}
                />
              </div>
            ))}
          </div>
        </div>

        {/* Executive Team */}
        <div className="mb-20">
          <h3 className="text-3xl font-headline text-center mb-12 text-accent">
            Executive Team
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 max-w-6xl mx-auto justify-items-center">
            {executiveTeam.map((member, index) => (
              <TeamCard
                key={member.name}
                member={member}
                size="large"
                style={{ animationDelay: `${(index + 3) * 0.2}s` }}
              />
            ))}
          </div>
        </div>

        {/* Organizers */}
        <div>
          <h3 className="text-3xl font-headline text-center mb-12 text-accent">
            Organizers
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-8 max-w-7xl mx-auto justify-items-center">
            {organizers.map((member, index) => (
              <div
                key={member.name}
                className={
                  index === 8
                    ? "md:col-start-2"
                    : index === 9
                    ? "md:col-start-3"
                    : ""
                }
              >
                <TeamCard
                  member={member}
                  size="medium"
                  style={{ animationDelay: `${(index + 6) * 0.1}s` }}
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
