"use client";

import { TeamCard, TeamMember } from "./team-card";

const juryMembers: TeamMember[] = [
  {
    name: "Shilpa Kotian",
    designation: "Senior UI/UX Designer",
    company: "Tata Elxsi",
    role: "Jury Panelist",
    avatar: "/jury/shilpa.jpeg",
    hint: "professional portrait",
  },
  {
    name: "Sunil Kumar V",
    designation: "Assistant Professor",
    company: "NMIT, Dept. of AI&ML",
    role: "Internal Jury Member",
    avatar: "/jury/sunil.jpg",
    hint: "professional portrait",
  },
  {
    name: "Harish Kumar S",
    designation: "Service Now Architect",
    company: "Hexaware Technologies",
    role: "Internal Jury Member",
    avatar: "/jury/Harish_Kumar_s.jpg",
    hint: "professional portrait",
  },
  {
    name: "Sowmya A",
    designation: "Associate Director, Consulting, Kyndryl",
    company: "Currently working with Kyndryl ",
    role: "Internal Jury Member",
    avatar: "/jury/Sowmya_A.jpg",
    hint: "professional portrait",
  },
];

export default function JurySection() {
  return (
    <section id="jury" className="py-10 lg:py-16 bg-background/50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-headline mb-6">
            Meet the Jury
          </h2>
          <p className="text-lg text-foreground/80 max-w-3xl mx-auto">
            Industry experts and thought leaders who will evaluate and guide the
            next generation of innovators.
          </p>
        </div>

        {/* Jury Members Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8 max-w-7xl mx-auto justify-items-center items-stretch">
          {juryMembers.map((member, index) => (
            <div key={member.name} className="w-full max-w-xs flex justify-center">
              <div className="w-full h-full jury-card-wrapper relative transform hover:scale-105 transition-all duration-300">
                {/* Blue accent dot for jury distinction */}
                <div className="absolute -top-2 -right-2 w-4 h-4 bg-blue-500 rounded-full opacity-70 z-10 shadow-lg shadow-blue-500/50"></div>
                <div
                  className="jury-card-bg relative h-full"
                  style={{
                    background:
                      "linear-gradient(135deg, rgba(59, 130, 246, 0.05) 0%, rgba(14, 165, 233, 0.08) 100%)",
                    borderRadius: "12px",
                    padding: "2px",
                  }}
                >
                  <TeamCard
                    member={member}
                    size="medium"
                    style={{ animationDelay: `${index * 0.2}s` }}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
