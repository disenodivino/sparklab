'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from '@/hooks/use-toast';

interface User {
  id: number;
  email: string;
  name: string;
  role: 'organizer' | 'participant';
  team_id: number | null;
}

export default function DashboardClient() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // Check if user is logged in
    const userString = localStorage.getItem('user');
    if (!userString) {
      toast({
        title: 'Not authenticated',
        description: 'Please log in to access this page',
        variant: 'destructive',
      });
      router.push('/event');
      return;
    }

    try {
      const userData = JSON.parse(userString);
      
      // If user is an organizer, redirect them to the organizer dashboard
      if (userData.role === 'organizer') {
        toast({
          title: 'Redirecting',
          description: 'Taking you to the organizer dashboard',
        });
        router.push('/event/organizer');
        return;
      }
      
      setUser(userData);
    } catch (error) {
      console.error('Error parsing user data:', error);
      localStorage.removeItem('user');
      router.push('/event');
    } finally {
      setLoading(false);
    }
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem('user');
    toast({
      title: 'Logged Out',
      description: 'You have been logged out successfully',
    });
    router.push('/event');
  };

  if (loading) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center">
        <div className="text-2xl">Loading...</div>
      </div>
    );
  }

  if (!user) {
    // This should not happen due to redirect in useEffect, but just in case
    return null;
  }

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center p-4 bg-background">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_120%,rgba(59,130,246,0.15),rgba(0,0,0,0.2)_25%,rgba(0,0,0,0)_50%)]" />
      
      <div className="relative z-10 w-full max-w-4xl">
        <div className="glass-navbar-enhanced p-8 rounded-lg">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold">Welcome, {user.name}</h1>
            <button 
              onClick={handleLogout} 
              className="bg-secondary hover:bg-secondary/80 px-4 py-2 rounded-md"
            >
              Logout
            </button>
          </div>
          
          <p className="text-xl mb-4">Role: {user.role.charAt(0).toUpperCase() + user.role.slice(1)}</p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
            <div className="bg-secondary/20 p-6 rounded-lg">
              <h2 className="text-xl font-semibold mb-2">Upcoming Checkpoints</h2>
              <p>View and submit your work for upcoming deadlines.</p>
            </div>
            
            <div className="bg-secondary/20 p-6 rounded-lg">
              <h2 className="text-xl font-semibold mb-2">Team Information</h2>
              <p>Manage your team details and view members.</p>
              {user.team_id ? (
                <p className="mt-2">Team ID: {user.team_id}</p>
              ) : (
                <p className="mt-2">No team assigned</p>
              )}
            </div>
            
            <div className="bg-secondary/20 p-6 rounded-lg">
              <h2 className="text-xl font-semibold mb-2">Messages</h2>
              <p>View important announcements and communications.</p>
            </div>
            
            <div className="bg-secondary/20 p-6 rounded-lg">
              <h2 className="text-xl font-semibold mb-2">Resources</h2>
              <p>Access helpful materials and guidelines.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}