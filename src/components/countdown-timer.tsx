
"use client";

import { useState, useEffect } from 'react';

const CountdownTimer = () => {
  const calculateTimeLeft = () => {
    const eventDate = new Date("2025-09-05T09:00:00Z").getTime();
    const now = new Date().getTime();
    const difference = eventDate - now;

    let timeLeft = {
      days: 0,
      hours: 0,
      minutes: 0,
      seconds: 0,
    };

    if (difference > 0) {
      timeLeft = {
        days: Math.floor(difference / (1000 * 60 * 60 * 24)),
        hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((difference / 1000 / 60) % 60),
        seconds: Math.floor((difference / 1000) % 60),
      };
    }
    return timeLeft;
  };

  const [timeLeft, setTimeLeft] = useState<{days: number, hours: number, minutes: number, seconds: number} | null>(null);

  useEffect(() => {
    setTimeLeft(calculateTimeLeft());
    
    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const timeUnits = timeLeft ? [
    { label: 'Days', value: timeLeft.days },
    { label: 'Hours', value: timeLeft.hours },
    { label: 'Minutes', value: timeLeft.minutes },
    { label: 'Seconds', value: timeLeft.seconds },
  ] : [
    { label: 'Days', value: 0 },
    { label: 'Hours', value: 0 },
    { label: 'Minutes', value: 0 },
    { label: 'Seconds', value: 0 },
  ];

  if (!timeLeft) {
    // Render a placeholder or loading state on the server and initial client render
    return (
        <div className="flex justify-center items-center gap-4 md:gap-8">
            {timeUnits.map((unit, index) => (
                <div key={index} className="flex flex-col items-center">
                    <div className="text-4xl md:text-6xl font-bold font-headline text-foreground tracking-tighter w-20 h-20 md:w-28 md:h-28 flex items-center justify-center bg-primary/10 rounded-lg border border-primary/20">
                        --
                    </div>
                    <span className="text-sm md:text-base font-medium text-foreground/70 mt-2">{unit.label}</span>
                </div>
            ))}
        </div>
    );
  }

  return (
    <div className="flex justify-center items-center gap-4 md:gap-8">
      {timeUnits.map((unit, index) => (
        <div key={index} className="flex flex-col items-center">
          <div className="text-4xl md:text-6xl font-bold font-headline text-foreground tracking-tighter w-20 h-20 md:w-28 md:h-28 flex items-center justify-center bg-primary/10 rounded-lg border border-primary/20">
            {String(unit.value).padStart(2, '0')}
          </div>
          <span className="text-sm md:text-base font-medium text-foreground/70 mt-2">{unit.label}</span>
        </div>
      ))}
    </div>
  );
};

export default CountdownTimer;
