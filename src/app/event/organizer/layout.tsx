'use client';

import OrganizerSidebar from '@/components/organizer-sidebar';
import OrganizerHeader from '@/components/organizer-header';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from '@/hooks/use-toast';

export default function OrganizerLayout({ children }: { children: React.ReactNode }) {
  const [isLoading, setIsLoading] = useState(true);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const router = useRouter();

  useEffect(() => {
    // Check if user is logged in and is an organizer
    const userString = localStorage.getItem('user');
    
    if (!userString) {
      toast({
        title: 'Access Denied',
        description: 'Please log in to access the organizer dashboard',
        variant: 'destructive',
      });
      router.push('/event');
      return;
    }
    
    try {
      const user = JSON.parse(userString);
      
      if (user.role !== 'organizer') {
        toast({
          title: 'Access Denied',
          description: 'You do not have permission to access the organizer dashboard',
          variant: 'destructive',
        });
        router.push('/event/dashboard');
        return;
      }
      
      setIsLoading(false);
    } catch (error) {
      console.error('Error checking user role:', error);
      localStorage.removeItem('user');
      router.push('/event');
    }
  }, [router]);

  const handleToggleSidebar = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center">
        <div className="text-2xl">Loading...</div>
      </div>
    );
  }

  return (
    <div className="bg-background min-h-screen">
      <OrganizerSidebar collapsed={sidebarCollapsed} onToggle={handleToggleSidebar} />
      <OrganizerHeader collapsed={sidebarCollapsed} />
      <main className={`pt-16 px-6 py-6 transition-all duration-300 ${sidebarCollapsed ? 'ml-20' : 'ml-64'}`}>
        {children}
      </main>
    </div>
  );
}