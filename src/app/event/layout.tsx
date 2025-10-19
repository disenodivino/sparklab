import type { Metadata } from "next";
import "./event.css";

export const metadata: Metadata = {
  title: "SparkLab Event | Participant Login",
  description: "Login to access SparkLab event details and resources for participants.",
};

export default function EventLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="event-layout normal-cursor">
      {children}
    </div>
  );
}