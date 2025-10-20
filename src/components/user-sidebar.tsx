'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  Users, 
  Calendar, 
  MessageSquare, 
  FileText, 
  Menu, 
  X,
  Home
} from 'lucide-react';

const navItems = [
  {
    name: 'Dashboard',
    href: '/event/dashboard',
    icon: <Home className="w-5 h-5" />
  },
  {
    name: 'Team Info',
    href: '/event/dashboard/team',
    icon: <Users className="w-5 h-5" />
  },
  {
    name: 'Checkpoints',
    href: '/event/dashboard/checkpoints',
    icon: <Calendar className="w-5 h-5" />
  },
  {
    name: 'Announcements',
    href: '/event/dashboard/announcements',
    icon: <MessageSquare className="w-5 h-5" />
  },
  {
    name: 'Submissions',
    href: '/event/dashboard/submissions',
    icon: <FileText className="w-5 h-5" />
  }
];

interface UserSidebarProps {
  collapsed: boolean;
  onToggle: () => void;
}

export default function UserSidebar({ collapsed, onToggle }: UserSidebarProps) {
  const pathname = usePathname();
  
  return (
    <div className={`bg-secondary/30 glass-navbar-enhanced border-r border-secondary/20 h-screen flex flex-col fixed top-0 left-0 transition-all duration-300 z-30 ${collapsed ? 'w-20' : 'w-64'}`}>
      <div className="h-16 flex items-center justify-between px-4 border-b border-secondary/20">
        {!collapsed && (
          <Link href="/event/dashboard" className="flex items-center space-x-2">
            <span className="text-lg font-bold">Team Dashboard</span>
          </Link>
        )}
        <button 
          onClick={onToggle}
          className="p-2 rounded-md hover:bg-secondary/50 transition-colors"
        >
          {collapsed ? <Menu className="w-5 h-5" /> : <X className="w-5 h-5" />}
        </button>
      </div>
      
      <nav className="flex-1 overflow-y-auto py-4">
        <ul className="space-y-2 px-2">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <li key={item.name}>
                <Link 
                  href={item.href}
                  className={`flex items-center px-4 py-3 rounded-md transition-colors ${
                    collapsed ? 'justify-center' : 'space-x-3'
                  } ${
                    isActive 
                      ? 'bg-primary text-primary-foreground' 
                      : 'hover:bg-secondary/50'
                  }`}
                >
                  <span>{item.icon}</span>
                  {!collapsed && <span>{item.name}</span>}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
      
      <div className="p-4 border-t border-secondary/20">
        <div className={`px-4 py-2 text-sm text-muted-foreground ${
          collapsed ? 'text-center' : ''
        }`}>
          {!collapsed && <p>SparkLab 2025</p>}
        </div>
      </div>
    </div>
  );
}
