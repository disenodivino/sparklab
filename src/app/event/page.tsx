import Image from "next/image";
import LoginForm from "@/components/login-form";
import Footer from "@/components/footer";
import MovingGrid from "@/components/moving-grid";

export default function EventLoginPage() {
  return (
    <div className="min-h-screen w-full flex flex-col bg-background relative overflow-hidden">
      {/* Animated background gradient */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_120%,rgba(59,130,246,0.15),rgba(0,0,0,0.2)_25%,rgba(0,0,0,0)_50%)]" />
      {/* Moving grid animation */}
      <MovingGrid />
      
      <div className="flex-grow flex flex-col items-center justify-center p-4 relative z-10">
        <div className="w-full max-w-sm space-y-8">
        <div className="flex justify-center items-center gap-4 mb-8">
          <Image 
            src="/2 (1).png" 
            alt="SparkLab Icon" 
            width={80} 
            height={80}
            className="h-auto"
            priority
          />
          <Image 
            src="/logo.svg" 
            alt="SparkLab Logo" 
            width={220} 
            height={80}
            className="h-auto"
            priority
          />
        </div>
        
        <LoginForm />

        {/* Sponsors Section */}
        <div className="mt-8">
          <p className="text-center text-xs text-muted-foreground mb-4">
            In collaboration with
          </p>
          <div className="flex items-center justify-center gap-6">
            <Image 
              src="/Petronet_LNG.jpg" 
              alt="Petronet LNG" 
              width={120} 
              height={60}
              className="object-contain h-12 w-auto"
            />
            <Image 
              src="/GoogleGemini_Lockup_FullColor_White.png" 
              alt="Google Gemini" 
              width={80} 
              height={40}
              className="object-contain h-8 w-auto"
            />
            <Image 
              src="/seamovation.png" 
              alt="Seamovation" 
              width={80} 
              height={40}
              className="object-contain h-8 w-auto"
            />
            <Image 
              src="/istelogo.png" 
              alt="ISTE" 
              width={120} 
              height={60}
              className="object-contain h-12 w-auto"
            />
          </div>
        </div>
      </div>
      </div>
      <Footer />
    </div>
  );
}