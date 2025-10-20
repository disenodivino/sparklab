'use client';

import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';
import { Bell } from 'lucide-react';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogTrigger
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useRealtimeSubscription, markMessageAsRead } from '@/lib/dashboard-utils';
import { supabase } from '@/lib/supabase';

interface Message {
  id: string;
  content: string;
  created_at: string;
  sender_name: string;
  sender_id: string;
  team_id: string | null;
  is_read: boolean;
}

interface ChatNotificationsProps {
  teamId: string;
  initialMessages: Message[];
}

export default function ChatNotifications({ teamId, initialMessages }: ChatNotificationsProps) {
  const [messages, setMessages] = useState<Message[]>(initialMessages || []);
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [open, setOpen] = useState(false);
  const { toast } = useToast();

  // Count unread messages on mount and when messages change
  useEffect(() => {
    const count = messages.filter(msg => !msg.is_read).length;
    setUnreadCount(count);
  }, [messages]);

  // Subscribe to new messages for the team or global messages (null team_id)
  useRealtimeSubscription<Message>(
    'messages',
    'INSERT',
    undefined,
    (newMessage) => {
      if (newMessage.team_id === teamId || newMessage.team_id === null) {
        // Add the new message to the list
        setMessages(prev => [newMessage, ...prev]);
        
        // Show a toast notification for new messages
        toast({
          title: 'New Message',
          description: `${newMessage.sender_name}: ${newMessage.content.substring(0, 50)}${newMessage.content.length > 50 ? '...' : ''}`,
          variant: 'default',
        });
      }
    }
  );

  // Handle marking messages as read
  const handleMarkAsRead = async (messageId: string) => {
    try {
      await markMessageAsRead(messageId);
      setMessages(prev =>
        prev.map(msg =>
          msg.id === messageId ? { ...msg, is_read: true } : msg
        )
      );
    } catch (error) {
      console.error('Error marking message as read:', error);
    }
  };

  // Mark all messages as read
  const markAllAsRead = async () => {
    try {
      const unreadMessages = messages.filter(msg => !msg.is_read);
      for (const msg of unreadMessages) {
        await markMessageAsRead(msg.id);
      }
      
      setMessages(prev =>
        prev.map(msg => ({ ...msg, is_read: true }))
      );
      
      toast({
        title: 'Success',
        description: 'All messages marked as read',
        variant: 'default',
      });
    } catch (error) {
      console.error('Error marking all messages as read:', error);
      toast({
        title: 'Error',
        description: 'Failed to mark messages as read',
        variant: 'destructive',
      });
    }
  };

  // Format date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <Badge 
              variant="destructive" 
              className="absolute -top-2 -right-2 px-1 min-w-[20px] h-5 flex items-center justify-center"
            >
              {unreadCount}
            </Badge>
          )}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex justify-between items-center">
            <span>Notifications & Messages</span>
            {unreadCount > 0 && (
              <Button onClick={markAllAsRead} variant="outline" size="sm">
                Mark all as read
              </Button>
            )}
          </DialogTitle>
        </DialogHeader>
        <ScrollArea className="h-[500px] pr-4">
          {messages.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No messages yet
            </div>
          ) : (
            <div className="space-y-4">
              {messages.map((message) => (
                <div 
                  key={message.id}
                  className={`p-4 rounded-lg border ${!message.is_read ? 'bg-muted/50' : ''}`}
                  onClick={() => !message.is_read && handleMarkAsRead(message.id)}
                >
                  <div className="flex justify-between items-start">
                    <h4 className="font-semibold">{message.sender_name}</h4>
                    <span className="text-xs text-muted-foreground">
                      {formatDate(message.created_at)}
                    </span>
                  </div>
                  <p className="mt-1">{message.content}</p>
                  {!message.is_read && (
                    <Badge variant="secondary" className="mt-2">New</Badge>
                  )}
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}