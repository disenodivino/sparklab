'use client';

import { useEffect, useState } from 'react';
import LoginForm from '@/components/login-form';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // Check if user is already logged in
    const userString = localStorage.getItem('user');
    
    if (userString) {
      try {
        const user = JSON.parse(userString);
        
        // Redirect based on role
        if (user.role === 'organizer') {
          router.push('/event/organizer');
        } else if (user.role === 'team') {
          router.push('/event/team');
        } else {
          router.push('/event/dashboard');
        }
        return;
      } catch (error) {
        console.error('Error parsing user data:', error);
        localStorage.removeItem('user');
      }
    }
    
    setIsLoading(false);
  }, [router]);

  if (isLoading) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center">
        <div className="animate-spin h-12 w-12 border-t-2 border-primary border-opacity-50 rounded-full"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center p-4 bg-gradient-to-br from-background to-background/80">
      <h1 className="text-4xl font-bold mb-8 text-center">Welcome to SparkLab</h1>
      <div className="w-full max-w-md">
        <LoginForm />
      </div>
    </div>
  );
}