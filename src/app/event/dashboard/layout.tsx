'use client';

import { ReactNode, useState } from 'react';
import Footer from '@/components/footer';
import UserSidebar from '@/components/user-sidebar';
import UserHeader from '@/components/user-header';

export default function DashboardLayout({ children }: { children: ReactNode }) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const handleToggleSidebar = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };

  return (
    <div className="bg-background min-h-screen flex flex-col">
      <UserSidebar collapsed={sidebarCollapsed} onToggle={handleToggleSidebar} />
      <UserHeader collapsed={sidebarCollapsed} />
      <main className={`pt-24 px-6 py-6 transition-all duration-300 flex-grow ${sidebarCollapsed ? 'ml-20' : 'ml-64'}`}>
        {children}
      </main>
      <Footer />
    </div>
  );
}