'use client';

import Image from 'next/image';
import { LogOut } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { toast } from '@/hooks/use-toast';

interface OrganizerHeaderProps {
  collapsed: boolean;
}

export default function OrganizerHeader({ collapsed }: OrganizerHeaderProps) {
  const router = useRouter();
  
  const handleLogout = () => {
    localStorage.removeItem('user');
    toast({
      title: "Logged Out",
      description: "You have been logged out successfully",
    });
    router.push('/event');
  };

  return (
    <header className={`h-16 bg-secondary/30 glass-navbar-enhanced border-b border-secondary/20 fixed top-0 right-0 left-0 z-20 flex items-center justify-between px-6 transition-all duration-300 ${collapsed ? 'ml-20' : 'ml-64'}`}>
      <div className="flex items-center">
        <Image 
          src="/logo.svg"
          alt="SparkLab Logo"
          width={140}
          height={40}
          priority
          className="h-10 w-auto"
        />
      </div>
      
      <div className="flex items-center space-x-4">
        <Image 
          src="/2 (1).png"
          alt="SparkLab Icon"
          width={56}
          height={56}
          className="h-14 w-14"
        />
        
        <button 
          onClick={handleLogout}
          className="p-2 rounded-md hover:bg-secondary/50 transition-colors flex items-center space-x-2"
        >
          <LogOut className="w-5 h-5" />
          <span>Logout</span>
        </button>
      </div>
    </header>
  );
}