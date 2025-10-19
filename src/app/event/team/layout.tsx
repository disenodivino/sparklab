'use client';

import { ReactNode } from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';

export default function TeamLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  
  return (
    <div className="container mx-auto py-6 space-y-8">
      {children}
    </div>
  );
}