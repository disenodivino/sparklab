"use client";

import { TeamCard, TeamMember } from "./team-card";

const advisoryCommittee: TeamMember[] = [
  {
    name: "Dr. Piyush Kumar Pareek",
    role: "Convener & Head of Department (AIML)",
    avatar: "/advisory_committee/Dr Piyush Kumar Pareek.jpg",
    hint: "professor portrait",
  },
  {
    name: "Ms. Sumana Sinha",
    role: "Co-Convener & Associate Professor (AIML)",
    avatar: "/advisory_committee/Sumana Sinha.jpg",
    hint: "professor portrait",
  },
  {
    name: "Prof. Madhura G K",
    role: "Professor & Faculty Coordinator (AIML)",
    avatar: "/advisory_committee/Prof Madhura G K.jpg",
    hint: "professor portrait",
  },
  {
    name: "Dr. Lakshmana",
    role: "Associate Professor (AIML)",
    avatar: "/advisory_committee/Dr Lakshmana.jpg",
    hint: "professor portrait",
  },
];

export default function AdvisorySection() {
  return (
    <section
      id="advisory"
      className="pt-20 lg:pt-32 pb-10 lg:pb-16 bg-background"
    >
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-headline mb-6">
            Advisory Committee
          </h2>
          <p className="text-lg text-foreground/80 max-w-3xl mx-auto">
            Distinguished faculty members and academic leaders guiding SparkLab
            with their expertise and vision.
          </p>
        </div>

        {/* Advisory Committee */}
        <div className="mb-20">
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
      </div>
    </section>
  );
}
