"use client";

export default function ClubMember() {
  return (
    <div className="container mx-auto px-4 py-20 lg:py-32" id="team">
      <h2 className="text-4xl font-headline mb-6 text-center text-accent">Club Members</h2>
      <div className="flex mr-2 justify-center">
        <img src="/team_pics/Rohith.jpg" alt="" className="border-4 border-accent/30 hover:border-accent/60 rounded-full h-40 w-40 -mr-12 hover:scale-105 transition-transform duration-200"/>
        <img src="/team_pics/Rohith.jpg" alt="" className="border-4 border-accent/30 hover:border-accent/60 rounded-full h-40 w-40 -mr-12 hover:scale-105 transition-transform duration-200"/>
        <img src="/team_pics/Rohith.jpg" alt="" className="border-4 border-accent/30 hover:border-accent/60  rounded-full h-40 w-40 -mr-12 hover:scale-105 transition-transform duration-200"/>
        <img src="/team_pics/Rohith.jpg" alt="" className="border-4 border-accent/30 hover:border-accent/60  rounded-full h-40 w-40 -mr-12 hover:scale-105 transition-transform duration-200"/>
        <img src="/team_pics/Rohith.jpg" alt="" className="border-4 border-accent/30 hover:border-accent/60  rounded-full h-40 w-40 -mr-12 hover:scale-105 transition-transform duration-200"/>
        <span className="flex items-center justify-center bg-accent/30 text-sm text-gray-800 font-semibold border-2 border-accent/30 rounded-full h-40 w-40"></span>
      </div>
    </div>
  );
}
