'use client';

import Image from "next/image";
import dynamic from "next/dynamic";

const LoginForm = dynamic(() => import("@/components/login-form"), {
  ssr: false,
  loading: () => (
    <div className="w-full max-w-md p-8 border border-secondary/30 rounded-lg glass-navbar-enhanced">
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin h-8 w-8 border-t-2 border-primary border-opacity-50 rounded-full"></div>
      </div>
    </div>
  ),
});

export default function EventLoginPage() {
  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center p-4 bg-background relative overflow-hidden">
      {/* Animated Grid Background */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#3b82f610_1px,transparent_1px),linear-gradient(to_bottom,#3b82f610_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_80%_50%_at_50%_0%,#000_70%,transparent_110%)]" />
      
      {/* Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-background/50 to-background" />
      
      {/* Moving Spotlight Effect */}
      <div className="absolute inset-0 animate-spotlight">
        <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-primary/20 rounded-full blur-[120px] animate-move-1" />
        <div className="absolute top-1/3 right-1/4 w-[400px] h-[400px] bg-blue-500/15 rounded-full blur-[100px] animate-move-2" />
        <div className="absolute bottom-0 left-1/2 w-[450px] h-[450px] bg-primary/15 rounded-full blur-[110px] animate-move-3" />
      </div>
      
      {/* Sparkle/Star Effect */}
      <div className="absolute inset-0">
        <div className="absolute top-1/4 left-1/5 w-1 h-1 bg-primary animate-twinkle" style={{ animationDelay: '0s' }} />
        <div className="absolute top-1/3 right-1/4 w-0.5 h-0.5 bg-blue-400 animate-twinkle" style={{ animationDelay: '0.5s' }} />
        <div className="absolute top-2/3 left-1/3 w-1 h-1 bg-primary animate-twinkle" style={{ animationDelay: '1s' }} />
        <div className="absolute bottom-1/4 right-1/3 w-0.5 h-0.5 bg-blue-300 animate-twinkle" style={{ animationDelay: '1.5s' }} />
        <div className="absolute top-1/2 left-2/3 w-1 h-1 bg-primary animate-twinkle" style={{ animationDelay: '2s' }} />
        <div className="absolute top-3/4 right-1/5 w-0.5 h-0.5 bg-blue-400 animate-twinkle" style={{ animationDelay: '2.5s' }} />
      </div>
      
      <div className="relative z-10 w-full max-w-md animate-in fade-in slide-in-from-bottom-4 duration-700">
        <div className="flex justify-center items-center gap-8 mb-12">
          <Image 
            src="/2 (1).png" 
            alt="SparkLab Icon" 
            width={100} 
            height={100}
            className="h-auto animate-in zoom-in duration-500"
            priority
          />
          <Image 
            src="/logo.svg" 
            alt="SparkLab Logo" 
            width={280} 
            height={90}
            className="h-auto animate-in slide-in-from-right duration-500 delay-150"
            priority
          />
        </div>
        
        <LoginForm />
      </div>
      
      <style jsx>{`
        @keyframes float {
          0%, 100% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-20px);
          }
        }
        .animate-float {
          animation: float 3s ease-in-out infinite;
        }
        .delay-300 {
          animation-delay: 0.3s;
        }
        .delay-500 {
          animation-delay: 0.5s;
        }
        .delay-700 {
          animation-delay: 0.7s;
        }
        .delay-1000 {
          animation-delay: 1s;
        }
      `}</style>
    </div>
  );
}