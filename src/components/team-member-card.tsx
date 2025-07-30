"use client";

import Image from 'next/image';
import { useInteractiveCard } from '@/hooks/use-interactive-card';

type TeamMemberCardProps = {
  member: {
    name: string;
    role: string;
    avatar: string;
    hint: string;
  };
  style?: React.CSSProperties;
};

const TeamMemberCard: React.FC<TeamMemberCardProps> = ({ member, style }) => {
  const { ref, style: interactiveStyle } = useInteractiveCard();

  return (
    <div
      ref={ref as React.RefObject<HTMLDivElement>}
      style={{...style, ...interactiveStyle}}
      className="flex flex-col items-center animate-fade-in-up card-3d-interactive p-4 rounded-lg"
    >
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
  );
};

export default TeamMemberCard;
