'use client';

import { useState, useEffect, useRef } from 'react';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { X, Send, Loader2 } from "lucide-react";
import { format } from 'date-fns';
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabase";
import { useRealtimeSubscription, sendMessage as sendMessageApi } from "@/lib/dashboard-utils";

interface ChatPopupProps {
  teamId: string;
  teamName: string;
  messages?: Message[];
  onClose: () => void;
}

interface Message {
  id: string;
  content: string;
  created_at: string;
  sender_name: string;
  sender_id: string;
  team_id: string | null;
  is_read: boolean;
}

export default function ChatPopup({ teamId, teamName, messages: initialMessages = [], onClose }: ChatPopupProps) {
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [newMessage, setNewMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // Scroll to bottom when messages change
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);
  
  // Subscribe to new messages for the team
  useRealtimeSubscription<Message>(
    'messages',
    'INSERT',
    { column: 'team_id', value: teamId },
    (newMessage) => {
      setMessages(prev => [newMessage, ...prev]);
      
      // Show toast for new messages from others
      if (newMessage.sender_id !== teamId) {
        toast({
          title: 'New Message',
          description: `${newMessage.sender_name}: ${newMessage.content.substring(0, 50)}${newMessage.content.length > 50 ? '...' : ''}`,
        });
      }
    }
  );
  
  // Also subscribe to global messages (null team_id)
  useRealtimeSubscription<Message>(
    'messages',
    'INSERT',
    { column: 'team_id', value: 'is.null' },
    (newMessage) => {
      setMessages(prev => [newMessage, ...prev]);
      
      toast({
        title: 'Announcement',
        description: `${newMessage.sender_name}: ${newMessage.content.substring(0, 50)}${newMessage.content.length > 50 ? '...' : ''}`,
      });
    }
  );
  
  const handleSendMessage = async () => {
    if (!newMessage.trim() || !teamId) {
      return;
    }
    
    setSending(true);
    
    try {
      await sendMessageApi(newMessage.trim(), teamId);
      setNewMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        title: 'Error',
        description: 'Failed to send message',
        variant: 'destructive',
      });
    } finally {
      setSending(false);
    }
  };
  
  const formatMessageTime = (timestamp: string) => {
    return format(new Date(timestamp), 'h:mm a');
  };

  return (
    <div className="fixed bottom-4 right-4 w-80 sm:w-96 z-50">
      <Card className="border-secondary/30 shadow-lg">
        <CardHeader className="flex flex-row items-center justify-between p-4 pb-2">
          <div>
            <CardTitle className="text-lg">Messages</CardTitle>
            <CardDescription>Chat with organizers and get updates</CardDescription>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose} className="h-8 w-8 p-0">
            <X className="h-4 w-4" />
            <span className="sr-only">Close</span>
          </Button>
        </CardHeader>
        
        <CardContent className="h-80 overflow-y-auto p-4">
          {loading ? (
            <div className="flex items-center justify-center h-full">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : messages.length === 0 ? (
            <div className="flex items-center justify-center h-full text-center text-muted-foreground">
              <p>No messages yet. Send a message to start a conversation with the organizers.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {messages.map((message) => (
                <div 
                  key={message.id}
                  className={`flex ${message.sender_id === teamId ? 'justify-end' : 'justify-start'}`}
                >
                  <div 
                    className={`max-w-[80%] rounded-lg p-3 ${
                      message.sender_id === teamId 
                        ? 'bg-primary/20 text-primary-foreground' 
                        : 'bg-secondary/20'
                    }`}
                  >
                    <p className="text-sm font-medium">{message.sender_name}</p>
                    <p className="text-sm break-words">{message.content}</p>
                    <p className="text-xs text-muted-foreground mt-1 text-right">
                      {formatMessageTime(message.created_at)}
                    </p>
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>
          )}
        </CardContent>
        
        <CardFooter className="border-t p-3">
          <form 
            className="flex w-full gap-2"
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
          >
            <Input 
              placeholder="Type a message..." 
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              disabled={loading || sending}
            />
            <Button 
              type="submit" 
              size="icon" 
              disabled={loading || sending || !newMessage.trim()}
            >
              {sending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
            </Button>
          </form>
        </CardFooter>
      </Card>
    </div>
  );
}