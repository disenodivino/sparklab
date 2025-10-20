'use client';

import { ReactNode, useState } from 'react';
import Footer from '@/components/footer';
import UserSidebar from '@/components/user-sidebar';
import UserHeader from '@/components/user-header';
import MessagePopup from '@/components/message-popup';
import MovingGrid from '@/components/moving-grid';

export default function DashboardLayout({ children }: { children: ReactNode }) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const handleToggleSidebar = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };

  return (
    <div className="bg-background min-h-screen flex flex-col relative overflow-hidden">
      {/* Animated background gradient */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_120%,rgba(59,130,246,0.15),rgba(0,0,0,0.2)_25%,rgba(0,0,0,0)_50%)]" />
      {/* Moving grid animation */}
      <MovingGrid />
      <UserSidebar collapsed={sidebarCollapsed} onToggle={handleToggleSidebar} />
      <UserHeader collapsed={sidebarCollapsed} />
      <main className={`pt-24 px-6 py-6 transition-all duration-300 flex-grow relative z-10 ${sidebarCollapsed ? 'ml-20' : 'ml-64'}`}>
        {children}
      </main>
      <MessagePopup />
      {/* Footer with left margin to avoid sidebar overlap */}
      <div className={sidebarCollapsed ? 'ml-20' : 'ml-64'}>
        <Footer />
      </div>
    </div>
  );
}