"use client";

import { MainPrizeCard, ExtraPrizeCard } from "./prize-card";
import { Trophy, Award, Crown, Star, Lightbulb, Heart } from "lucide-react";

const mainPrizesData = [
  {
    icon: Crown,
    title: "Champion Team",
    amount: "Rs.15,000",
    description:
      "The ultimate winner takes it all - glory, recognition, and the biggest reward",
    gradient: "from-yellow-400 to-orange-500",
    shadowColor: "shadow-yellow-500/20",
  },
  {
    icon: Trophy,
    title: "Runner-up",
    amount: "Rs.10,000",
    description:
      "Excellence deserves recognition - outstanding performance rewarded",
    gradient: "from-slate-300 to-slate-500",
    shadowColor: "shadow-slate-500/20",
  },
  {
    icon: Award,
    title: "Third Place",
    amount: "Rs.6,000",
    description:
      "Bronze brilliance shines bright - creativity and innovation celebrated",
    gradient: "from-amber-600 to-amber-800",
    shadowColor: "shadow-amber-600/20",
  },
];

const extraPrizesData = [
  {
    icon: Star,
    title: "Best Women's Team",
    amount: "Rs.2,000",
    description: "Empowering innovation and celebrating diversity in tech",
    gradient: "from-pink-400 to-purple-500",
    shadowColor: "shadow-pink-500/20",
  },
  {
    icon: Lightbulb,
    title: "Most Innovative Solution",
    amount: "Rs.2,000",
    description: "Breakthrough thinking and creative problem-solving",
    gradient: "from-blue-400 to-cyan-500",
    shadowColor: "shadow-blue-500/20",
  },
  {
    icon: Heart,
    title: "People's Choice Award",
    amount: "Rs.2,000",
    description: "Loved by the community and audience favorite",
    gradient: "from-red-400 to-pink-500",
    shadowColor: "shadow-red-500/20",
  },
  {
    icon: Award,
    title: "Special Recognition",
    amount: "Rs.3,000",
    description: "Outstanding contribution and exceptional effort",
    gradient: "from-green-400 to-emerald-500",
    shadowColor: "shadow-green-500/20",
  },
];

export default function PrizesSection() {
  return (
    <section id="prizes" className="py-20 lg:py-32">
      <div className="container mx-auto px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-headline mb-6">
              Prizes & Recognition
            </h2>
            <p className="text-lg text-foreground/80 max-w-3xl mx-auto">
              Compete for exciting prizes and recognition. We celebrate
              innovation, creativity, and excellence across multiple categories.
            </p>
          </div>

          {/* Main Prizes */}
          <div className="mb-16">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
              {/* Reorder: 2nd place (left), 1st place (middle), 3rd place (right) */}
              {[1, 0, 2].map((dataIndex, displayIndex) => {
                const prize = mainPrizesData[dataIndex];
                return (
                  <MainPrizeCard
                    key={prize.title}
                    icon={prize.icon}
                    title={prize.title}
                    amount={prize.amount}
                    description={prize.description}
                    gradient={prize.gradient}
                    shadowColor={prize.shadowColor}
                    rank={dataIndex + 1}
                    style={{ animationDelay: `${displayIndex * 0.2}s` }}
                  />
                );
              })}
            </div>
          </div>

          {/* Extra Prizes */}
          <div>
            <h3 className="text-2xl font-headline text-center mb-8 text-accent/80">
              Special Recognition Awards
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {extraPrizesData.map((prize, index) => (
                <ExtraPrizeCard
                  key={prize.title}
                  icon={prize.icon}
                  title={prize.title}
                  amount={prize.amount}
                  description={prize.description}
                  gradient={prize.gradient}
                  shadowColor={prize.shadowColor}
                  style={{ animationDelay: `${(index + 3) * 0.15}s` }}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
