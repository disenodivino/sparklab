'use client';

import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from '@/hooks/use-toast';
import { Send, MessageCircle, Bell, RefreshCw, MessageSquare, UserCircle, Loader2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';

interface Message {
  id: number;
  sender_team_id: number;
  receiver_id: number;
  content: string;
  timestamp: string;
  is_broadcast?: boolean;
  sender?: {
    team_name: string;
  };
  receiver?: {
    team_name: string;
  };
}

export default function TeamMessagesPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [organizerTeamId, setOrganizerTeamId] = useState<number | null>(null);
  const [teamId, setTeamId] = useState<number | null>(null);
  const [replyMessage, setReplyMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // Add router for navigation
  const router = useRouter();
  
  // Fetch messages
  useEffect(() => {
    checkAuth();
  }, []);
  
  // Scroll to bottom of messages when they change
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);
  
  // Auto setup with mock team
  const checkAuth = async () => {
    try {
      // Create mock team user if it doesn't exist
      let teamUser;
      const storedUser = localStorage.getItem('user');
      
      if (storedUser) {
        teamUser = JSON.parse(storedUser);
      } else {
        teamUser = {
          id: 2,
          team_name: 'Demo Team',
          role: 'team',
        };
        localStorage.setItem('user', JSON.stringify(teamUser));
      }
      
      // Check if the team exists in the database
      const { data: teamExists, error: teamCheckError } = await supabase
        .from('teams')
        .select('id')
        .eq('id', teamUser.id)
        .single();
      
      // If team doesn't exist, create it
      if (teamCheckError) {
        const { data: newTeam, error: createTeamError } = await supabase
          .from('teams')
          .insert([{ id: teamUser.id, team_name: teamUser.team_name }])
          .select()
          .single();
          
        if (createTeamError) {
          console.error('Error creating team:', createTeamError);
        } else {
          console.log('Created team:', newTeam);
        }
      }
      
      // Set the team ID and fetch data
      setTeamId(teamUser.id);
      fetchData(teamUser.id);
    } catch (error) {
      console.error('Setup error:', error);
      // Create a default team ID and try to continue
      setTeamId(2);
      fetchData(2);
    }
  };
  
  const fetchData = async (currentTeamId: number) => {
    setIsLoading(true);
    try {
      // Find the organizer team
      const { data: organizerData, error: organizerError } = await supabase
        .from('teams')
        .select('id')
        .eq('team_name', 'Organizer Team')
        .single();

      // If organizer team doesn't exist, create it
      if (organizerError) {
        console.log('Creating organizer team');
        const { data: newOrganizer, error: createError } = await supabase
          .from('teams')
          .insert([{ id: 1, team_name: 'Organizer Team' }])
          .select()
          .single();
          
        if (createError) throw createError;
        setOrganizerTeamId(newOrganizer.id);
        
        // Fetch all messages between the team and organizer
        if (currentTeamId && newOrganizer?.id) {
          const currentOrganizerId = newOrganizer.id;
          
          const { data: messagesData, error: messagesError } = await supabase
            .from('messages')
            .select('*, sender:sender_team_id(team_name), receiver:receiver_id(team_name)')
            .or(`and(sender_team_id.eq.${currentTeamId},receiver_id.eq.${currentOrganizerId}),and(sender_team_id.eq.${currentOrganizerId},receiver_id.eq.${currentTeamId})`)
            .order('timestamp', { ascending: true });
            
          if (messagesError) throw messagesError;
          setMessages(messagesData || []);
        }
      } else {
        // Organizer team exists
        if (organizerData) {
          setOrganizerTeamId(organizerData.id);
        }
  
        // Fetch all messages between the team and organizer
        if (currentTeamId && organizerData?.id) {
          const currentOrganizerId = organizerData.id;
          
          const { data: messagesData, error: messagesError } = await supabase
            .from('messages')
            .select('*, sender:sender_team_id(team_name), receiver:receiver_id(team_name)')
            .or(`and(sender_team_id.eq.${currentTeamId},receiver_id.eq.${currentOrganizerId}),and(sender_team_id.eq.${currentOrganizerId},receiver_id.eq.${currentTeamId})`)
            .order('timestamp', { ascending: true });
            
          if (messagesError) throw messagesError;
          setMessages(messagesData || []);
        }
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      toast({
        title: 'Error',
        description: 'Failed to load messages',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };
  
  const handleSendMessage = async () => {
    if (!replyMessage.trim() || !teamId || !organizerTeamId) {
      return;
    }
    
    setIsLoading(true);
    
    try {
      const { error } = await supabase.from('messages').insert({
        content: replyMessage.trim(),
        sender_team_id: teamId,
        receiver_id: organizerTeamId,
        timestamp: new Date().toISOString()
      });
      
      if (error) throw error;
      
      // Refresh data
      await fetchData(teamId);
      setReplyMessage('');
      
    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        title: 'Error',
        description: 'Failed to send message',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    });
  };
  
  // Get broadcasts (messages sent from organizer to this team)
  const getTeamMessages = () => {
    if (!teamId) return [];
    
    return messages.sort((a, b) => 
      new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
    );
  };
  
  const teamMessages = getTeamMessages();

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Messages</h1>
          <p className="text-muted-foreground">Contact the event organizers</p>
        </div>
        
        <Button 
          variant="outline" 
          onClick={() => { 
            if (teamId) {
              setIsRefreshing(true);
              fetchData(teamId);
            }
          }}
          disabled={isLoading || isRefreshing}
        >
          <RefreshCw className={`mr-2 h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>
      
      {isLoading && !isRefreshing ? (
        <div className="flex items-center justify-center p-12">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
            <p>Loading messages...</p>
          </div>
        </div>
      ) : (
        <Card className="md:h-[600px] flex flex-col">
          <CardHeader>
            <CardTitle>Conversation with Event Organizers</CardTitle>
            <CardDescription>
              Send messages to the organizers or view their responses
            </CardDescription>
          </CardHeader>
          
          <CardContent className="flex-1 overflow-y-auto p-4">
            <div className="space-y-4">
              {teamMessages.length === 0 ? (
                <div className="p-6 text-center text-muted-foreground">
                  No messages yet. Send a message to the organizers to start a conversation.
                </div>
              ) : (
                teamMessages.map((message) => (
                  <div 
                    key={message.id}
                    className={`flex ${message.sender_team_id === teamId ? 'justify-end' : 'justify-start'}`}
                  >
                    <div 
                      className={`max-w-[70%] rounded-lg p-3 ${
                        message.sender_team_id === teamId 
                          ? 'bg-primary/20 text-primary-foreground' 
                          : 'bg-secondary/20'
                      }`}
                    >
                      <p className="text-sm">{message.content}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {formatTimestamp(message.timestamp)}
                      </p>
                    </div>
                  </div>
                ))
              )}
              <div ref={messagesEndRef} />
            </div>
          </CardContent>
          
          <div className="p-4 border-t border-secondary/20">
            <div className="flex items-center gap-2">
              <Input 
                placeholder="Type your message to the organizers..."
                value={replyMessage}
                onChange={(e) => setReplyMessage(e.target.value)}
                disabled={isLoading}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSendMessage();
                  }
                }}
              />
              <Button 
                size="icon" 
                onClick={handleSendMessage}
                disabled={isLoading || !replyMessage.trim()}
              >
                {isLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}