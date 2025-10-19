'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function LoginRedirect() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to home page since login is removed
    router.push('/');
  }, [router]);

  return (
    <div className="min-h-screen w-full flex items-center justify-center">
      <div className="animate-spin h-12 w-12 border-t-2 border-primary border-opacity-50 rounded-full"></div>
    </div>
  );
}