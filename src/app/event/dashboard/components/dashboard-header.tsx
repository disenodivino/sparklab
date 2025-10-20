'use client';

import { Button } from "@/components/ui/button";
import { MessageCircle, LogOut, Bell, Settings } from "lucide-react";
import ChatNotifications from './chat-notifications';

interface Message {
  id: string;
  content: string;
  created_at: string;
  sender_name: string;
  sender_id: string;
  team_id: string | null;
  is_read: boolean;
}

interface DashboardHeaderProps {
  teamName: string;
  teamId: string;
  messages: Message[];
  onLogout: () => void;
  onChatToggle: () => void;
}

export default function DashboardHeader({ 
  teamName, 
  teamId,
  messages, 
  onLogout, 
  onChatToggle 
}: DashboardHeaderProps) {
  const unreadCount = messages.filter(m => !m.is_read).length;

  return (
    <div className="relative backdrop-blur-xl bg-black/40 border border-secondary/20 rounded-lg shadow-2xl">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-r from-primary/10 to-purple-500/10 rounded-lg -z-10" />
      
      <div className="px-6 py-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
          {/* Left Section - Title and Welcome */}
          <div className="space-y-3">
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-purple-500 bg-clip-text text-transparent">
                Team Dashboard
              </h1>
              <p className="text-muted-foreground text-sm mt-1">Welcome back, you're doing great!</p>
            </div>
            <div className="pt-2">
              <p className="text-sm text-muted-foreground">Team:</p>
              <p className="text-2xl font-semibold text-foreground">{teamName}</p>
            </div>
          </div>
          
          {/* Right Section - Actions */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 w-full sm:w-auto">
            {/* Notification Badge */}
            <div className="relative">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={onChatToggle}
                className="relative flex items-center gap-2 w-full sm:w-auto"
              >
                <MessageCircle className="h-4 w-4" />
                <span>Messages</span>
                {unreadCount > 0 && (
                  <span className="ml-2 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white transform translate-x-1/2 -translate-y-1/2 bg-red-600 rounded-full">
                    {unreadCount}
                  </span>
                )}
              </Button>
            </div>
            
            <Button 
              variant="outline" 
              size="sm" 
              className="flex items-center gap-2 w-full sm:w-auto"
            >
              <Bell className="h-4 w-4" />
              <span>Notifications</span>
            </Button>
            
            <Button 
              variant="default" 
              size="sm" 
              onClick={onLogout}
              className="flex items-center gap-2 w-full sm:w-auto"
            >
              <LogOut className="h-4 w-4" />
              <span>Logout</span>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}