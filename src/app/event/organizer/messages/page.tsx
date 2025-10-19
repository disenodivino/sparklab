'use client';

import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { toast } from '@/hooks/use-toast';
import { Send, MessageCircle, Bell, RefreshCw, MessageSquare, UserCircle, Loader2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';

interface Team {
  id: number;
  team_name: string;
}

interface Message {
  id: number;
  sender_team_id: number;
  receiver_id: number;
  content: string;
  timestamp: string;
  is_broadcast?: boolean; // Added for the UI to identify broadcasts
  sender?: {
    team_name: string;
  };
  receiver?: {
    team_name: string;
  };
}

interface Conversation {
  id: number;
  name: string;
  team_name: string;
  last_message: string;
  timestamp: string;
}

export default function MessagesPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [isSendingAnnouncement, setIsSendingAnnouncement] = useState(false);
  const [selectedConversation, setSelectedConversation] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [organizerTeamId, setOrganizerTeamId] = useState<number | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // Form states
  const [announcementMessage, setAnnouncementMessage] = useState('');
  const [selectedTeamId, setSelectedTeamId] = useState<number | null>(null);
  const [replyMessage, setReplyMessage] = useState('');
  
  // Fetch teams and messages
  useEffect(() => {
    fetchData();
  }, []);
  
  const fetchData = async () => {
    setIsLoading(true);
    try {
      // Find the organizer team
      const { data: organizerData, error: organizerError } = await supabase
        .from('teams')
        .select('id')
        .eq('team_name', 'Organizer Team')
        .single();

      if (organizerError) throw organizerError;
      
      if (organizerData) {
        setOrganizerTeamId(organizerData.id);
      }

      // Fetch all teams
      const { data: teamsData, error: teamsError } = await supabase
        .from('teams')
        .select('id, team_name')
        .order('team_name');

      if (teamsError) throw teamsError;
      
      setTeams(teamsData || []);
      
      // Fetch all messages
      const { data: messagesData, error: messagesError } = await supabase
        .from('messages')
        .select('*, sender:sender_team_id(team_name), receiver:receiver_id(team_name)')
        .order('timestamp', { ascending: true });
        
      if (messagesError) throw messagesError;
      
      setMessages(messagesData || []);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast({
        title: 'Error',
        description: 'Failed to load data',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };
  
  // Helper to get unique conversations from messages
  const getUniqueConversations = (): Conversation[] => {
    if (!organizerTeamId) return [];
    
    const conversations: {[key: number]: Conversation} = {};
    
    messages.forEach(message => {
      // If message is from another team to organizer
      if (message.sender_team_id !== organizerTeamId && message.receiver_id === organizerTeamId) {
        const teamId = message.sender_team_id;
        if (!conversations[teamId]) {
          conversations[teamId] = {
            id: teamId,
            name: message.sender?.team_name || 'Unknown Team',
            team_name: message.sender?.team_name || 'Unknown Team',
            last_message: message.content,
            timestamp: message.timestamp
          };
        } else if (new Date(message.timestamp) > new Date(conversations[teamId].timestamp)) {
          conversations[teamId].last_message = message.content;
          conversations[teamId].timestamp = message.timestamp;
        }
      }
      // If message is from organizer to another team
      else if (message.sender_team_id === organizerTeamId && message.receiver_id !== organizerTeamId) {
        const teamId = message.receiver_id;
        if (!conversations[teamId] && message.receiver) {
          conversations[teamId] = {
            id: teamId,
            name: message.receiver.team_name,
            team_name: message.receiver.team_name,
            last_message: message.content,
            timestamp: message.timestamp
          };
        } else if (message.receiver && conversations[teamId] && 
                  new Date(message.timestamp) > new Date(conversations[teamId].timestamp)) {
          conversations[teamId].last_message = message.content;
          conversations[teamId].timestamp = message.timestamp;
        }
      }
    });
    
    return Object.values(conversations).sort((a, b) => 
      new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );
  };
  
  const conversations = getUniqueConversations();
  
  // Filter messages for selected conversation
  const conversationMessages = selectedConversation && organizerTeamId
    ? messages.filter(message => 
        (message.sender_team_id === organizerTeamId && message.receiver_id === selectedConversation) || 
        (message.sender_team_id === selectedConversation && message.receiver_id === organizerTeamId)
      ).sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime())
    : [];
    
  // Get broadcast messages (sent from organizer to all teams)
  const getBroadcastMessages = () => {
    if (!organizerTeamId) return [];
    
    // Get unique teams excluding organizer
    const nonOrganizerTeams = teams.filter(team => team.id !== organizerTeamId);
    
    // Create a map to track broadcast message groups by content and timestamp
    const broadcastGroups = new Map<string, Message[]>();
    
    // Group messages that appear to be broadcasts (same content sent to multiple teams at same time)
    messages.forEach(message => {
      if (message.sender_team_id === organizerTeamId) {
        // Use content + timestamp (to the minute) as a group key
        const timestamp = new Date(message.timestamp);
        const groupKey = `${message.content}_${timestamp.getFullYear()}-${timestamp.getMonth()}-${timestamp.getDate()}_${timestamp.getHours()}-${timestamp.getMinutes()}`;
        
        if (!broadcastGroups.has(groupKey)) {
          broadcastGroups.set(groupKey, [message]);
        } else {
          broadcastGroups.get(groupKey)?.push(message);
        }
      }
    });
    
    // Filter to keep only groups that were sent to multiple teams (broadcasts)
    const broadcastMessages: Message[] = [];
    broadcastGroups.forEach((messages, key) => {
      if (messages.length > 1) {
        // Use the first message as the representative for this broadcast
        const broadcastMessage = {...messages[0], is_broadcast: true};
        broadcastMessages.push(broadcastMessage);
      }
    });
    
    return broadcastMessages.sort((a, b) => 
      new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );
  };
  
  const broadcastMessages = getBroadcastMessages();
    
    // Scroll to bottom of conversation when messages change
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [conversationMessages]);
  
  const handleSendAnnouncement = async () => {
    if (!announcementMessage.trim() || !organizerTeamId) {
      toast({
        title: 'Error',
        description: 'Please enter a message',
        variant: 'destructive',
      });
      return;
    }
    
    setIsLoading(true);
    
    try {
      if (selectedTeamId) {
        // Send to a specific team
        const { error } = await supabase.from('messages').insert({
          content: announcementMessage.trim(),
          sender_team_id: organizerTeamId,
          receiver_id: selectedTeamId,
          timestamp: new Date().toISOString()
        });
        
        if (error) throw error;
      } else {
        // Send to all teams (broadcast)
        // Get all teams except organizer
        const recipientTeams = teams.filter(team => team.id !== organizerTeamId);
        
        // Create a message for each team
        const promises = recipientTeams.map(team => {
          return supabase.from('messages').insert({
            content: announcementMessage.trim(),
            sender_team_id: organizerTeamId,
            receiver_id: team.id,
            timestamp: new Date().toISOString()
          });
        });
        
        await Promise.all(promises);
      }
      
      // Refresh data
      await fetchData();
      
      // Reset form
      setAnnouncementMessage('');
      setSelectedTeamId(null);
      setIsSendingAnnouncement(false);
      
      toast({
        title: 'Success',
        description: selectedTeamId 
          ? 'Message sent to selected team' 
          : 'Announcement sent to all participants',
      });
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
  
  const handleSendReply = async () => {
    if (!replyMessage.trim() || !selectedConversation || !organizerTeamId) {
      return;
    }
    
    setIsLoading(true);
    
    try {
      const { error } = await supabase.from('messages').insert({
        content: replyMessage.trim(),
        sender_team_id: organizerTeamId,
        receiver_id: selectedConversation,
        timestamp: new Date().toISOString()
      });
      
      if (error) throw error;
      
      // Refresh data
      await fetchData();
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
  
  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Messages</h1>
          <p className="text-muted-foreground">Manage communications with participants</p>
        </div>
        
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            onClick={() => { 
              setIsRefreshing(true);
              fetchData();
            }}
            disabled={isLoading || isRefreshing}
          >
            <RefreshCw className={`mr-2 h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          
          <Dialog open={isSendingAnnouncement} onOpenChange={setIsSendingAnnouncement}>
            <DialogTrigger asChild>
              <Button>
                <Bell className="mr-2 h-4 w-4" />
                Send Announcement
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle>Send Announcement</DialogTitle>
                <DialogDescription>
                  Send a message to all participants or to a specific team.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="team">Recipient</Label>
                  <select
                    id="team"
                    className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    value={selectedTeamId || ''}
                    onChange={(e) => setSelectedTeamId(e.target.value ? parseInt(e.target.value) : null)}
                    disabled={isLoading}
                  >
                    <option value="">All Participants (Broadcast)</option>
                    {teams
                      .filter(team => team.id !== organizerTeamId)
                      .map((team) => (
                        <option key={team.id} value={team.id}>
                          {team.team_name}
                        </option>
                    ))}
                  </select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="message">Message</Label>
                  <Textarea 
                    id="message" 
                    value={announcementMessage}
                    onChange={(e) => setAnnouncementMessage(e.target.value)}
                    placeholder="Enter your announcement message"
                    rows={4}
                    disabled={isLoading}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsSendingAnnouncement(false)} disabled={isLoading}>
                  Cancel
                </Button>
                <Button onClick={handleSendAnnouncement} disabled={isLoading || !announcementMessage.trim()}>
                  {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Send Message
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>
      
      {isLoading && !isRefreshing ? (
        <div className="flex items-center justify-center p-12">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
            <p>Loading messages...</p>
          </div>
        </div>
      ) : (
        <Tabs defaultValue="conversations" className="w-full">
          <TabsList>
            <TabsTrigger value="conversations" className="flex items-center">
              <MessageCircle className="mr-2 h-4 w-4" />
              Conversations ({conversations.length})
            </TabsTrigger>
            <TabsTrigger value="announcements" className="flex items-center">
              <Bell className="mr-2 h-4 w-4" />
              Announcements ({broadcastMessages.length})
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="conversations" className="mt-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="col-span-1 md:h-[600px] flex flex-col">
                <CardHeader>
                  <CardTitle>Conversations</CardTitle>
                  <CardDescription>Recent messages from participants</CardDescription>
                </CardHeader>
                <CardContent className="flex-1 overflow-y-auto p-0">
                  <div className="divide-y divide-secondary/20">
                    {conversations.length === 0 ? (
                      <div className="p-6 text-center text-muted-foreground">
                        No conversations yet
                      </div>
                    ) : (
                      conversations.map((conversation) => (
                        <div 
                          key={conversation.id}
                          className={`p-4 cursor-pointer hover:bg-secondary/10 ${selectedConversation === conversation.id ? 'bg-secondary/20' : ''}`}
                          onClick={() => setSelectedConversation(conversation.id)}
                        >
                          <div className="flex items-start gap-3">
                            <div className="bg-primary/10 rounded-full p-2">
                              <UserCircle className="h-6 w-6" />
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center justify-between">
                                <p className="font-medium">{conversation.name}</p>
                                <p className="text-xs text-muted-foreground">
                                  {formatTimestamp(conversation.timestamp)}
                                </p>
                              </div>
                              <p className="text-xs text-muted-foreground">{conversation.team_name}</p>
                              <p className="text-sm truncate mt-1">{conversation.last_message}</p>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </CardContent>
              </Card>
              
              <Card className="col-span-1 md:col-span-2 md:h-[600px] flex flex-col">
                {selectedConversation ? (
                  <>
                    <CardHeader className="border-b border-secondary/20">
                      {conversations.find(c => c.id === selectedConversation) && (
                        <>
                          <CardTitle>{conversations.find(c => c.id === selectedConversation)?.name}</CardTitle>
                          <CardDescription>{conversations.find(c => c.id === selectedConversation)?.team_name}</CardDescription>
                        </>
                      )}
                    </CardHeader>
                    <CardContent className="flex-1 overflow-y-auto p-4">
                      <div className="space-y-4">
                        {conversationMessages.map((message) => (
                          <div 
                            key={message.id}
                            className={`flex ${message.sender_team_id === organizerTeamId ? 'justify-end' : 'justify-start'}`}
                          >
                            <div 
                              className={`max-w-[70%] rounded-lg p-3 ${
                                message.sender_team_id === organizerTeamId 
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
                        ))}
                        <div ref={messagesEndRef} />
                      </div>
                    </CardContent>
                    <div className="p-4 border-t border-secondary/20">
                      <div className="flex items-center gap-2">
                        <Input 
                          placeholder="Type your message..."
                          value={replyMessage}
                          onChange={(e) => setReplyMessage(e.target.value)}
                          disabled={isLoading}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' && !e.shiftKey) {
                              e.preventDefault();
                              handleSendReply();
                            }
                          }}
                        />
                        <Button 
                          size="icon" 
                          onClick={handleSendReply}
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
                  </>
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <div className="text-center">
                      <MessageSquare className="h-12 w-12 mx-auto text-muted-foreground/50" />
                      <p className="mt-2 text-muted-foreground">Select a conversation to view messages</p>
                    </div>
                  </div>
                )}
              </Card>
            </div>
          </TabsContent>
          
          <TabsContent value="announcements" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Announcements</CardTitle>
                <CardDescription>Messages sent to all participants</CardDescription>
              </CardHeader>
              <CardContent>
                {broadcastMessages.length === 0 ? (
                  <div className="p-6 text-center text-muted-foreground border rounded-md">
                    No announcements yet
                  </div>
                ) : (
                  <div className="space-y-4">
                    {broadcastMessages.map((message) => (
                      <div key={message.id} className="border border-secondary/20 rounded-lg p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div className="bg-primary/10 rounded-full p-2">
                              <Bell className="h-4 w-4" />
                            </div>
                            <p className="font-medium">Announcement</p>
                          </div>
                          <p className="text-xs text-muted-foreground">
                            {formatTimestamp(message.timestamp)}
                          </p>
                        </div>
                        <p className="mt-2">{message.content}</p>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
}