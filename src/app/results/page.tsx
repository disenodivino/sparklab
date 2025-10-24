'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Loader2, Trophy, Award, Crown, Star, Lightbulb, Heart, Users, Sparkles, ArrowLeft } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import confetti from 'canvas-confetti';
import Footer from '@/components/footer';
import { motion } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import MovingGrid from '@/components/moving-grid';

interface Team {
  id: number;
  team_name: string;
}

interface Result {
  category: string;
  team_id: number | null;
  teams?: Team | Team[];
}

interface PrizeData {
  category: string;
  icon: any;
  title: string;
  amount: string;
  description: string;
  gradient: string;
  shadowColor: string;
  rank?: number;
}

const prizeConfig: PrizeData[] = [
  {
    category: 'champion',
    icon: Crown,
    title: 'Champion Team',
    amount: 'Rs.15,000',
    description: 'The ultimate winner takes it all - glory, recognition, and the biggest reward',
    gradient: 'from-yellow-400 to-orange-500',
    shadowColor: 'shadow-yellow-500/50',
    rank: 1,
  },
  {
    category: 'runner_up',
    icon: Trophy,
    title: 'Runner-up',
    amount: 'Rs.10,000',
    description: 'Excellence deserves recognition - outstanding performance rewarded',
    gradient: 'from-slate-300 to-slate-500',
    shadowColor: 'shadow-slate-500/50',
    rank: 2,
  },
  {
    category: 'third_place',
    icon: Award,
    title: 'Third Place',
    amount: 'Rs.6,000',
    description: 'Bronze brilliance shines bright - creativity and innovation celebrated',
    gradient: 'from-amber-600 to-amber-800',
    shadowColor: 'shadow-amber-600/50',
    rank: 3,
  },
  {
    category: 'best_womens_team',
    icon: Star,
    title: "Best Women's Team",
    amount: 'Rs.2,000',
    description: 'Empowering innovation and celebrating diversity in tech',
    gradient: 'from-pink-400 to-purple-500',
    shadowColor: 'shadow-pink-500/50',
  },
  {
    category: 'most_innovative',
    icon: Lightbulb,
    title: 'Most Innovative Solution',
    amount: 'Rs.2,000',
    description: 'Breakthrough thinking and creative problem-solving',
    gradient: 'from-blue-400 to-cyan-500',
    shadowColor: 'shadow-blue-500/50',
  },
  {
    category: 'peoples_choice',
    icon: Heart,
    title: "People's Choice Award",
    amount: 'Rs.2,000',
    description: 'Loved by the community and audience favorite',
    gradient: 'from-red-400 to-pink-500',
    shadowColor: 'shadow-red-500/50',
  },
  {
    category: 'special_recognition',
    icon: Award,
    title: 'Special Recognition',
    amount: 'Rs.3,000',
    description: 'Outstanding contribution and exceptional effort',
    gradient: 'from-green-400 to-emerald-500',
    shadowColor: 'shadow-green-500/50',
  },
];

export default function ResultsPage() {
  const [results, setResults] = useState<Result[]>([]);
  const [loading, setLoading] = useState(true);
  const [visible, setVisible] = useState(false);
  const [confettiShown, setConfettiShown] = useState(false);

  useEffect(() => {
    fetchResults();
  }, []);

  useEffect(() => {
    if (visible && !confettiShown && results.some(r => r.team_id)) {
      triggerConfetti();
      setConfettiShown(true);
    }
  }, [visible, results, confettiShown]);

  useEffect(() => {
    // Continuous confetti when results are visible
    if (visible && results.some(r => r.team_id)) {
      const continuousConfetti = setInterval(() => {
        triggerContinuousConfetti();
      }, 8000); // Launch confetti every 8 seconds (3s animation + 5s pause)

      return () => clearInterval(continuousConfetti);
    }
  }, [visible, results]);

  async function fetchResults() {
    try {
      // Check if results are visible
      const { data: settingsData, error: settingsError } = await supabase
        .from('event_settings')
        .select('results_visible')
        .eq('id', 1)
        .single();

      if (settingsError) throw settingsError;

      setVisible(settingsData?.results_visible || false);

      // Fetch results with team details
      const { data: resultsData, error: resultsError } = await supabase
        .from('results')
        .select('category, team_id, teams:team_id(id, team_name)')
        .order('id', { ascending: true });

      if (resultsError) throw resultsError;

      setResults(resultsData || []);
    } catch (error) {
      console.error('Error fetching results:', error);
    } finally {
      setLoading(false);
    }
  }

  function triggerConfetti() {
    const duration = 5000;
    const animationEnd = Date.now() + duration;
    const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 9999 };

    function randomInRange(min: number, max: number) {
      return Math.random() * (max - min) + min;
    }

    const interval: any = setInterval(function() {
      const timeLeft = animationEnd - Date.now();

      if (timeLeft <= 0) {
        return clearInterval(interval);
      }

      const particleCount = 50 * (timeLeft / duration);

      confetti({
        ...defaults,
        particleCount,
        origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 }
      });
      confetti({
        ...defaults,
        particleCount,
        origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 }
      });
    }, 250);
  }

  function triggerContinuousConfetti() {
    const duration = 3000; // Reduced from 5000 to 3000ms
    const animationEnd = Date.now() + duration;
    const defaults = { startVelocity: 25, spread: 360, ticks: 50, zIndex: 9999 }; // Slightly reduced velocity and ticks

    function randomInRange(min: number, max: number) {
      return Math.random() * (max - min) + min;
    }

    const interval: any = setInterval(function() {
      const timeLeft = animationEnd - Date.now();

      if (timeLeft <= 0) {
        return clearInterval(interval);
      }

      const particleCount = 35 * (timeLeft / duration); // Reduced from 50 to 35 particles

      confetti({
        ...defaults,
        particleCount,
        origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 }
      });
      confetti({
        ...defaults,
        particleCount,
        origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 }
      });
    }, 250);
  }

  if (loading) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center bg-background">
        <div className="flex flex-col items-center">
          <Loader2 className="h-10 w-10 animate-spin text-primary" />
          <p className="mt-4">Loading results...</p>
        </div>
      </div>
    );
  }

  if (!visible) {
    return (
      <div className="min-h-screen w-full bg-background">
        <div className="fixed top-6 left-6 z-50">
          <Link href="/">
            <Button variant="outline" size="sm" className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              Back to Home
            </Button>
          </Link>
        </div>
        <div className="flex flex-col items-center justify-center min-h-[80vh] px-4">
          <div className="text-center space-y-6 max-w-2xl">
            <div className="flex justify-center">
              <div className="relative">
                <Trophy className="h-32 w-32 text-primary/30" />
                <Sparkles className="h-8 w-8 text-primary/50 absolute -top-2 -right-2 animate-pulse" />
              </div>
            </div>
            <h1 className="text-4xl md:text-6xl font-headline font-bold">
              Results Coming Soon!
            </h1>
            <p className="text-xl text-muted-foreground">
              The results will be announced shortly. Stay tuned for the big reveal!
            </p>
            <div className="pt-8">
              <Badge variant="secondary" className="text-lg px-6 py-3">
                Check back soon
              </Badge>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  const mainPrizes = prizeConfig.filter(p => p.rank).map(prize => ({
    ...prize,
    result: results.find(r => r.category === prize.category)
  }));

  const specialPrizes = prizeConfig.filter(p => !p.rank).map(prize => ({
    ...prize,
    result: results.find(r => r.category === prize.category)
  }));

  return (
    <div className="min-h-screen w-full bg-background">
      <div className="fixed top-6 left-6 z-50">
        <Link href="/">
          <Button variant="outline" size="sm" className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back to Home
          </Button>
        </Link>
      </div>
      
      <main className="relative py-8 lg:py-16 overflow-hidden">
        {/* Moving Grid Background */}
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 w-full h-full overflow-hidden">
            <div
              className="absolute inset-0 h-full w-full bg-[linear-gradient(to_right,hsl(var(--border))_1px,transparent_1px),linear-gradient(to_bottom,hsl(var(--border))_1px,transparent_1px)] bg-[size:2rem_2rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]"
              style={{
                animation: 'grid-pan 60s linear infinite'
              }}
            />
          </div>
        </div>
        
        <div className="container mx-auto px-4 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-10 mt-16 md:mt-0"
          >
            <div className="flex justify-center mb-6">
              <div className="relative">
                <Image 
                  src="/Results Logo.png" 
                  alt="SparkLab Results" 
                  width={600} 
                  height={200}
                  className="max-w-full h-auto relative z-10"
                  priority
                  style={{
                    filter: 'drop-shadow(0 0 20px rgba(139, 92, 246, 0.5)) drop-shadow(0 0 40px rgba(168, 85, 247, 0.3))'
                  }}
                />
              </div>
            </div>
          </motion.div>

          {/* Main Prizes - Podium Style */}
          <div className="mb-20">
            <motion.h2
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="text-3xl font-headline font-bold text-center mb-12"
            >
              Top 3 Winners
            </motion.h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
              {/* Reorder: 2nd, 1st, 3rd */}
              {[mainPrizes[1], mainPrizes[0], mainPrizes[2]].map((prize, index) => {
                const Icon = prize.icon;
                const actualRank = prize.rank || 0;
                const displayDelay = index * 0.2 + 0.4;
                
                return (
                  <motion.div
                    key={prize.category}
                    initial={{ opacity: 0, y: 50 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: displayDelay, duration: 0.6, type: 'spring' }}
                    className={actualRank === 1 ? 'md:-mt-8' : 'md:mt-8'}
                  >
                    <Card className={`relative overflow-hidden border-2 ${prize.shadowColor} shadow-2xl hover:shadow-3xl transition-all duration-300 hover:scale-105`}>
                      {/* Gradient Background */}
                      <div className={`absolute inset-0 bg-gradient-to-br ${prize.gradient} opacity-10`} />
                      
                      {/* Rank Badge */}
                      <div className="absolute -top-4 -right-4">
                        <div className={`w-20 h-20 rounded-full bg-gradient-to-br ${prize.gradient} flex items-center justify-center shadow-lg`}>
                          <span className="text-2xl font-bold text-white">#{actualRank}</span>
                        </div>
                      </div>

                      <CardHeader className="relative pt-8 pb-4">
                        <div className="flex justify-center mb-4">
                          <div className={`p-6 rounded-full bg-gradient-to-br ${prize.gradient} shadow-lg`}>
                            <Icon className="h-12 w-12 text-white" />
                          </div>
                        </div>
                        <CardTitle className="text-2xl font-bold text-center mb-2 text-foreground">
                          {prize.title}
                        </CardTitle>
                        <p className={`text-3xl font-bold text-center bg-gradient-to-r ${prize.gradient} bg-clip-text text-transparent`}>
                          {prize.amount}
                        </p>
                      </CardHeader>

                      <CardContent className="relative">
                        <p className="text-sm text-center text-muted-foreground mb-4">
                          {prize.description}
                        </p>
                        
                        {prize.result?.team_id && prize.result?.teams ? (
                          <motion.div
                            initial={{ scale: 0.8, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{ delay: displayDelay + 0.3 }}
                            className={`p-4 rounded-lg bg-gradient-to-br ${prize.gradient} shadow-lg text-center`}
                          >
                            <Users className="h-5 w-5 mx-auto mb-2 text-white" />
                            <p className="font-bold text-lg text-white">
                              {Array.isArray(prize.result.teams) 
                                ? prize.result.teams[0]?.team_name 
                                : prize.result.teams.team_name}
                            </p>
                          </motion.div>
                        ) : (
                          <div className="p-4 rounded-lg bg-muted/50 text-center">
                            <p className="text-sm text-muted-foreground italic">To be announced</p>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })}
            </div>
          </div>

          {/* Special Recognition Awards */}
          <div>
            <motion.h2
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.2 }}
              className="text-3xl font-headline font-bold text-center mb-12 text-accent/80"
            >
              Special Recognition Awards
            </motion.h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto">
              {specialPrizes.map((prize, index) => {
                const Icon = prize.icon;
                const delay = 1.4 + index * 0.15;
                
                return (
                  <motion.div
                    key={prize.category}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay, duration: 0.5 }}
                  >
                    <Card className={`relative overflow-hidden border ${prize.shadowColor} shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 h-full`}>
                      <div className={`absolute inset-0 bg-gradient-to-br ${prize.gradient} opacity-5`} />
                      
                      <CardHeader className="relative">
                        <div className="flex justify-center mb-3">
                          <div className={`p-4 rounded-full bg-gradient-to-br ${prize.gradient}`}>
                            <Icon className="h-8 w-8 text-white" />
                          </div>
                        </div>
                        <CardTitle className="text-lg font-bold text-center mb-2 text-foreground">
                          {prize.title}
                        </CardTitle>
                        <p className={`text-xl font-bold text-center bg-gradient-to-r ${prize.gradient} bg-clip-text text-transparent`}>
                          {prize.amount}
                        </p>
                      </CardHeader>

                      <CardContent className="relative">
                        <p className="text-xs text-center text-muted-foreground mb-3">
                          {prize.description}
                        </p>
                        
                        {prize.result?.team_id && prize.result?.teams ? (
                          <motion.div
                            initial={{ scale: 0.8, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{ delay: delay + 0.2 }}
                            className={`p-3 rounded-lg bg-gradient-to-br ${prize.gradient} shadow-lg text-center`}
                          >
                            <Users className="h-4 w-4 mx-auto mb-1 text-white" />
                            <p className="font-bold text-sm text-white">
                              {Array.isArray(prize.result.teams) 
                                ? prize.result.teams[0]?.team_name 
                                : prize.result.teams.team_name}
                            </p>
                          </motion.div>
                        ) : (
                          <div className="p-3 rounded-lg bg-muted/50 text-center">
                            <p className="text-xs text-muted-foreground italic">To be announced</p>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })}
            </div>
          </div>

          {/* Thank You Section */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 2.5 }}
            className="mt-20 text-center"
          >
            <Card className="max-w-3xl mx-auto bg-gradient-to-br from-primary/5 to-purple-500/5 border-2">
              <CardContent className="py-12">
                <h3 className="text-3xl font-headline font-bold mb-4">
                  Thank You to All Participants! 🙌
                </h3>
                <p className="text-lg text-muted-foreground">
                  Every team brought incredible creativity and innovation to SparkLab.
                  You all are winners in our eyes!
                </p>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
