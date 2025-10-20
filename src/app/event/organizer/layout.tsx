'use client';

import OrganizerSidebar from '@/components/organizer-sidebar';
import OrganizerHeader from '@/components/organizer-header';
import Footer from '@/components/footer';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from '@/hooks/use-toast';
import MovingGrid from '@/components/moving-grid';

export default function OrganizerLayout({ children }: { children: React.ReactNode }) {
  const [isLoading, setIsLoading] = useState(true);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [isAuthorized, setIsAuthorized] = useState(false);
  const router = useRouter();

  useEffect(() => {
    // Check for organizer authentication
    const userStr = typeof window !== 'undefined' ? localStorage.getItem('user') : null;
    let user = null;
    try {
      user = userStr ? JSON.parse(userStr) : null;
    } catch (e) {
      user = null;
    }
    if (user && user.role === 'organizer') {
      setIsAuthorized(true);
      setIsLoading(false);
    } else {
      setIsAuthorized(false);
      setIsLoading(false);
      router.replace('/event');
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
  if (!isAuthorized) {
    return null; // Or show an access denied message
  }
  return (
    <div className="bg-background min-h-screen flex flex-col relative overflow-hidden">
      {/* Animated background gradient */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_120%,rgba(59,130,246,0.15),rgba(0,0,0,0.2)_25%,rgba(0,0,0,0)_50%)]" />
      {/* Moving grid animation */}
      <MovingGrid />
      <OrganizerSidebar collapsed={sidebarCollapsed} onToggle={handleToggleSidebar} />
      <OrganizerHeader collapsed={sidebarCollapsed} />
      <main className={`pt-24 px-6 py-6 transition-all duration-300 flex-grow relative z-10 ${sidebarCollapsed ? 'ml-20' : 'ml-64'}`}>
        {children}
      </main>
      {/* Footer with left margin to avoid sidebar overlap */}
      <div className={sidebarCollapsed ? 'ml-20' : 'ml-64'}>
        <Footer />
      </div>
    </div>
  );
}