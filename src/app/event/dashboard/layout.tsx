'use client';

import { ReactNode, useState } from 'react';
import UserSidebar from '@/components/user-sidebar';
import UserHeader from '@/components/user-header';
import MessagePopup from '@/components/message-popup';

export default function DashboardLayout({ children }: { children: ReactNode }) {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className="min-h-screen w-full bg-background">
      <UserSidebar collapsed={collapsed} onToggle={() => setCollapsed(!collapsed)} />
      <UserHeader collapsed={collapsed} />
      <main className={`pt-20 transition-all duration-300 ${collapsed ? 'ml-20' : 'ml-64'}`}>
        <div className="container mx-auto py-6 px-6">
          {children}
        </div>
      </main>
      <MessagePopup />
    </div>
  );
}