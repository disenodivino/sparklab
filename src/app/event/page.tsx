import Image from "next/image";
import LoginForm from "@/components/login-form";

export default function EventLoginPage() {
  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center p-4 bg-background">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_120%,rgba(59,130,246,0.15),rgba(0,0,0,0.2)_25%,rgba(0,0,0,0)_50%)]" />
      
      <div className="relative z-10 w-full max-w-md">
        <div className="flex justify-center items-center gap-4 mb-8">
          <Image 
            src="/2 (1).png" 
            alt="SparkLab Icon" 
            width={60} 
            height={60}
            className="h-auto"
            priority
          />
          <Image 
            src="/logo.svg" 
            alt="SparkLab Logo" 
            width={180} 
            height={60}
            className="h-auto"
            priority
          />
        </div>
        
        <LoginForm />
      </div>
    </div>
  );
}