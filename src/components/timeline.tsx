"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import { CheckCircle, Clock, Coffee, Flag, Award, Zap } from "lucide-react"

const timelineEvents = [
  {
    time: "Day 1, 09:00 AM",
    title: "Event Kick-off",
    description: "Opening ceremony, theme reveal, and official start of the designathon.",
    icon: Flag,
    status: "completed"
  },
  {
    time: "Day 1, 10:00 AM",
    title: "Ideation & Team Formation",
    description: "Brainstorming session and final team formations.",
    icon: Zap,
    status: "completed"
  },
  {
    time: "Day 1, 01:00 PM",
    title: "Lunch Break",
    description: "Time to refuel and network with fellow participants.",
    icon: Coffee,
    status: "completed"
  },
  {
    time: "Day 1, 02:00 PM",
    title: "Design Sprint Begins",
    description: "Deep dive into designing and prototyping. Mentors will be available for guidance.",
    icon: Clock,
    status: "ongoing"
  },
  {
    time: "Day 1, 07:00 PM",
    title: "Dinner",
    description: "A well-deserved dinner break.",
    icon: Coffee,
    status: "upcoming"
  },
    {
    time: "Day 1, 09:00 PM",
    title: "Checkpoint 1",
    description: "First progress check-in with the review panel.",
    icon: CheckCircle,
    status: "upcoming"
  },
  {
    time: "Day 2, 08:00 AM",
    title: "Breakfast & Final Push",
    description: "Grab breakfast and start the final sprint towards the finish line.",
    icon: Coffee,
    status: "upcoming"
  },
  {
    time: "Day 2, 01:00 PM",
    title: "Submission Deadline",
    description: "Final project submissions are due.",
    icon: CheckCircle,
    status: "upcoming"
  },
  {
    time: "Day 2, 02:00 PM",
    title: "Project Demos",
    description: "Teams present their final projects to the judges and audience.",
    icon: Clock,
    status: "upcoming"
  },
  {
    time: "Day 2, 04:00 PM",
    title: "Awards Ceremony",
    description: "Announcement of winners and closing remarks.",
    icon: Award,
    status: "upcoming"
  },
]

export default function Timeline() {
  return (
    <div className="relative">
      <div
        className="absolute left-1/2 -translate-x-1/2 h-full w-0.5 bg-border"
        aria-hidden="true"
      />
      <div className="space-y-12">
        {timelineEvents.map((event, index) => (
          <div
            key={event.title}
            className="relative flex items-center"
          >
            <div
              className={cn(
                "w-1/2",
                index % 2 === 0 ? "pr-8 text-right" : "pl-8 text-left"
              )}
            />
            <div className="absolute left-1/2 -translate-x-1/2 z-10">
                <div className={cn("h-8 w-8 rounded-full flex items-center justify-center ring-8 ring-background", {
                    "bg-primary text-primary-foreground": event.status === "completed",
                    "bg-accent text-accent-foreground animate-pulse": event.status === "ongoing",
                    "bg-muted text-muted-foreground": event.status === "upcoming"
                })}>
                    <event.icon className="h-5 w-5" />
                </div>
            </div>
            <div
              className={cn(
                "w-1/2",
                index % 2 === 0 ? "pl-8" : "pr-8"
              )}
            >
              <Card className={cn("transition-all duration-300", {
                  "border-primary/50 shadow-primary/10": event.status === "completed",
                  "border-accent/80 shadow-accent/20 glow-shadow-accent": event.status === "ongoing",
                  "border-border/50": event.status === "upcoming"
              })}>
                <CardHeader>
                  <p className="text-sm text-muted-foreground">{event.time}</p>
                  <CardTitle>{event.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-foreground/80">{event.description}</p>
                </CardContent>
              </Card>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
