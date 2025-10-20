'use client';

import Image from 'next/image';
import { LogOut, User } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { toast } from '@/hooks/use-toast';
import { useState, useEffect } from 'react';

interface UserHeaderProps {
  collapsed: boolean;
}

interface UserData {
  id: number;
  name?: string;
  username?: string;
  team_name?: string;
  role: string;
}

export default function UserHeader({ collapsed }: UserHeaderProps) {
  const router = useRouter();
  const [user, setUser] = useState<UserData | null>(null);
  
  useEffect(() => {
    const userString = localStorage.getItem('user');
    if (userString) {
      try {
        setUser(JSON.parse(userString));
      } catch (error) {
        console.error('Error parsing user data:', error);
      }
    }
  }, []);
  
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
      
      <div className="flex items-center space-x-3">
        {user && (
          <div className="flex items-center space-x-3 px-4 py-2 rounded-full bg-secondary/40 hover:bg-secondary/50 transition-colors border border-secondary/20">
            <div className="h-8 w-8 rounded-full bg-primary/10 border-2 border-primary/20 flex items-center justify-center">
              <User className="h-4 w-4 text-primary" />
            </div>
            <span className="text-sm font-medium">
              {user.team_name || user.name || user.username || 'Team Member'}
            </span>
          </div>
        )}
        
        <Image 
          src="/2 (1).png"
          alt="SparkLab Icon"
          width={48}
          height={48}
          className="h-12 w-12"
        />
        
        <button 
          onClick={handleLogout}
          className="p-2 rounded-full hover:bg-secondary/50 transition-colors flex items-center space-x-2 text-muted-foreground hover:text-foreground"
          title="Logout"
        >
          <LogOut className="w-5 h-5" />
        </button>
      </div>
    </header>
  );
}
