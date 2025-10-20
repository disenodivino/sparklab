'use client';

import Link from 'next/link';
import Image from 'next/image';
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
    href: '/event/organizer',
    icon: <Home className="w-5 h-5" />
  },
  {
    name: 'Teams & Participants',
    href: '/event/organizer/teams',
    icon: <Users className="w-5 h-5" />
  },
  {
    name: 'Checkpoints',
    href: '/event/organizer/checkpoints',
    icon: <Calendar className="w-5 h-5" />
  },
  {
    name: 'Messages',
    href: '/event/organizer/messages',
    icon: <MessageSquare className="w-5 h-5" />
  },
  {
    name: 'Submissions',
    href: '/event/organizer/submissions',
    icon: <FileText className="w-5 h-5" />
  }
];

interface OrganizerSidebarProps {
  collapsed: boolean;
  onToggle: () => void;
}

export default function OrganizerSidebar({ collapsed, onToggle }: OrganizerSidebarProps) {
  return (
    <div className={`bg-secondary/30 glass-navbar-enhanced border-r border-secondary/20 h-screen flex flex-col fixed top-0 left-0 transition-all duration-300 z-30 ${collapsed ? 'w-20' : 'w-64'}`}>
      <div className="flex items-center justify-between p-4 border-b border-secondary/20">
        {!collapsed && (
          <Link href="/event/organizer" className="flex items-center space-x-2">
            <span className="text-lg font-bold">Organizer Panel</span>
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
          {navItems.map((item) => (
            <li key={item.name}>
              <Link 
                href={item.href}
                className={`flex items-center px-4 py-3 rounded-md hover:bg-secondary/50 transition-colors ${
                  collapsed ? 'justify-center' : 'space-x-3'
                }`}
              >
                <span>{item.icon}</span>
                {!collapsed && <span>{item.name}</span>}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  );
}