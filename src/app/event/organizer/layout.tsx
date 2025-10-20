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
    // Auto-login as organizer since login functionality is removed
    async function setupOrganizer() {
      try {
        // Import supabase
        const { supabase } = await import('@/lib/supabase');
        
        // Create mock organizer user - use ID 1 which is expected to be the Organizer Team ID in Supabase
        const organizerUser = {
          id: 1,
          username: 'organizer',
          name: 'Event Organizer',
          role: 'organizer',
        };
        
        // Check if the Organizer Team exists in the database
        const { data: teamExists, error: teamCheckError } = await supabase
          .from('teams')
          .select('id')
          .eq('id', organizerUser.id)
          .single();
        
        // If organizer team doesn't exist, create it
        if (teamCheckError) {
          const { data: newTeam, error: createTeamError } = await supabase
            .from('teams')
            .insert([{ id: organizerUser.id, team_name: 'Organizer Team' }])
            .select()
            .single();
            
          if (createTeamError) {
            console.error('Error creating organizer team:', createTeamError);
          } else {
            console.log('Created organizer team:', newTeam);
          }
        }
        
        // Save to localStorage
        localStorage.setItem('user', JSON.stringify(organizerUser));
      } catch (error) {
        console.error('Error setting up organizer user:', error);
      } finally {
        setIsLoading(false);
      }
    }
    
    setupOrganizer();
  }, []);

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
      <main className={`pt-24 px-6 py-6 transition-all duration-300 ${sidebarCollapsed ? 'ml-20' : 'ml-64'}`}>
        {children}
      </main>
    </div>
  );
}