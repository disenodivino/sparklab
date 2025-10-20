'use client';

import { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { MessageSquare, Send, Loader2, X } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { toast } from '@/hooks/use-toast';
import { formatDistanceToNow } from 'date-fns';

interface Message {
  id: number;
  sender_team_id: number;
  receiver_id: number | null;
  content: string;
  timestamp: string;
  seen_timestamp?: string | null;
}

export default function MessagePopup() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [currentTeamId, setCurrentTeamId] = useState<number | null>(null);
  const [unreadCount, setUnreadCount] = useState(0);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Get current team ID from localStorage
  useEffect(() => {
    const userString = localStorage.getItem('user');
    if (userString) {
      const userData = JSON.parse(userString);
      setCurrentTeamId(userData.id);
    }
  }, []);

  useEffect(() => {
    if (!currentTeamId) return;

    async function fetchMessages() {
      try {
        const { data: messagesData } = await supabase
          .from('messages')
          .select('*')
          .or(`sender_team_id.eq.${currentTeamId},receiver_id.eq.${currentTeamId}`)
          .order('timestamp', { ascending: true });

        const regularMessages = messagesData?.filter(m => !(m.sender_team_id === 1 && m.receiver_id === null)) || [];
        setMessages(regularMessages);
        
        // Calculate unread count based on seen_timestamp
        const unread = regularMessages.filter(m => 
          m.sender_team_id !== currentTeamId && !m.seen_timestamp
        ).length;
        setUnreadCount(unread);
      } catch (error) {
        console.error('Error fetching messages:', error);
      }
    }

    fetchMessages();

    const channel = supabase
      .channel('team_messages')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'messages' },
        (payload) => {
          const newMsg = payload.new as Message;
          if (newMsg.sender_team_id === currentTeamId || newMsg.receiver_id === currentTeamId) {
            if (!(newMsg.sender_team_id === 1 && newMsg.receiver_id === null)) {
              setMessages(prev => [...prev, newMsg]);
              // Only increment unread if message is from organizer and not seen
              if (newMsg.sender_team_id !== currentTeamId && !newMsg.seen_timestamp) {
                setUnreadCount(prev => prev + 1);
              }
            }
          }
        }
      )
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'messages' },
        (payload) => {
          const updatedMsg = payload.new as Message;
          if (updatedMsg.sender_team_id === currentTeamId || updatedMsg.receiver_id === currentTeamId) {
            setMessages(prev => 
              prev.map(m => m.id === updatedMsg.id ? updatedMsg : m)
            );
            // Recalculate unread count
            setMessages(current => {
              const unread = current.filter(m => 
                m.sender_team_id !== currentTeamId && !m.seen_timestamp
              ).length;
              setUnreadCount(unread);
              return current;
            });
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [currentTeamId]);

  useEffect(() => {
    if (isOpen && currentTeamId) {
      scrollToBottom();
      
      // Mark all unread messages as read when popup opens
      const unreadMessages = messages.filter(m => 
        m.sender_team_id !== currentTeamId && !m.seen_timestamp
      );
      
      if (unreadMessages.length > 0) {
        const markAsSeen = async () => {
          try {
            const unreadIds = unreadMessages.map(m => m.id);
            const { error } = await supabase
              .from('messages')
              .update({ seen_timestamp: new Date().toISOString() })
              .in('id', unreadIds);
            
            if (error) {
              console.error('Error marking messages as seen:', error);
            } else {
              // Update local state
              setMessages(prev => 
                prev.map(m => 
                  unreadIds.includes(m.id) 
                    ? { ...m, seen_timestamp: new Date().toISOString() }
                    : m
                )
              );
              setUnreadCount(0);
            }
          } catch (error) {
            console.error('Error marking messages as seen:', error);
          }
        };
        
        markAsSeen();
      }
    }
  }, [isOpen, currentTeamId]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !currentTeamId) return;

    setSending(true);
    const messageContent = newMessage;
    const timestamp = new Date().toISOString();
    
    try {
      const { data, error } = await supabase.from('messages').insert([{
        sender_team_id: currentTeamId,
        receiver_id: 1,
        content: messageContent,
        timestamp: timestamp
      }]).select();

      if (error) throw error;

      // Add the sent message to local state immediately
      if (data && data[0]) {
        setMessages(prev => [...prev, data[0]]);
        scrollToBottom();
      }

      setNewMessage('');
      toast({
        title: 'Success',
        description: 'Message sent'
      });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to send message',
        variant: 'destructive'
      });
    } finally {
      setSending(false);
    }
  };

  return (
    <>
      {/* Message Popup Button - Fixed at bottom right */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 w-14 h-14 rounded-full bg-gradient-to-br from-primary to-primary/80 text-primary-foreground shadow-lg hover:shadow-2xl transition-all duration-300 flex items-center justify-center z-40 hover:scale-105 group"
      >
        <MessageSquare className="h-6 w-6 group-hover:scale-110 transition-transform" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full min-w-[20px] h-5 px-1 flex items-center justify-center font-bold shadow-md animate-pulse">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {/* Message Popup Window */}
      {isOpen && (
        <div className="fixed bottom-24 right-6 w-[360px] h-[480px] rounded-2xl shadow-2xl z-40 flex flex-col bg-background border border-border overflow-hidden animate-in slide-in-from-bottom-4 duration-300">
          {/* Header */}
          <div className="bg-gradient-to-r from-primary to-primary/90 text-primary-foreground px-4 py-3 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="p-1.5 bg-white/20 rounded-lg">
                <MessageSquare className="h-4 w-4" />
              </div>
              <div>
                <h3 className="font-medium text-sm tracking-wide">Messages</h3>
                <p className="text-[11px] text-primary-foreground/80">Chat with organizers</p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="hover:bg-white/20 p-1.5 rounded-lg transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-3 space-y-2.5 bg-secondary/5">
            {messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
                <div className="p-3 bg-secondary/20 rounded-full mb-2">
                  <MessageSquare className="h-8 w-8" />
                </div>
                <p className="text-sm font-medium">No messages yet</p>
                <p className="text-xs mt-1">Start a conversation</p>
              </div>
            ) : (
              messages.map((message) => {
                const isFromMe = message.sender_team_id === currentTeamId;
                return (
                  <div
                    key={message.id}
                    className={`flex ${isFromMe ? 'justify-end' : 'justify-start'} animate-in fade-in slide-in-from-bottom-2 duration-300`}
                  >
                    <div className="flex flex-col max-w-[75%]">
                      <div
                        className={`rounded-2xl px-3 py-2 ${
                          isFromMe
                            ? 'bg-primary text-primary-foreground rounded-br-sm'
                            : 'bg-secondary text-secondary-foreground rounded-bl-sm'
                        }`}
                      >
                        {!isFromMe && (
                          <p className="text-[10px] font-semibold mb-0.5 text-muted-foreground">Organizer</p>
                        )}
                        <p className="text-sm whitespace-pre-wrap break-words leading-relaxed">{message.content}</p>
                      </div>
                      <p className={`text-[10px] mt-0.5 px-2 ${
                        isFromMe ? 'text-right text-muted-foreground' : 'text-left text-muted-foreground'
                      }`}>
                        {formatDistanceToNow(new Date(message.timestamp), { addSuffix: true })}
                      </p>
                    </div>
                  </div>
                );
              })
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="border-t border-border p-3 bg-background">
            <div className="space-y-2">
              <Textarea
                placeholder="Type your message..."
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSendMessage();
                  }
                }}
                className="resize-none text-sm border-secondary/50 focus:border-primary min-h-[50px] rounded-xl"
                rows={2}
              />
              <div className="flex items-center justify-between">
                <p className="text-[10px] text-muted-foreground">Enter to send</p>
                <Button
                  onClick={handleSendMessage}
                  disabled={sending || !newMessage.trim()}
                  size="sm"
                  className="rounded-lg px-3 shadow-sm h-8"
                >
                  {sending ? (
                    <>
                      <Loader2 className="h-3 w-3 animate-spin mr-1.5" />
                      <span className="text-xs">Sending</span>
                    </>
                  ) : (
                    <>
                      <Send className="h-3 w-3 mr-1.5" />
                      <span className="text-xs">Send</span>
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
