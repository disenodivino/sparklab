'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { toast } from '@/hooks/use-toast';
import { Send, MessageCircle, Bell, RefreshCw, MessageSquare, UserCircle } from 'lucide-react';
import Image from 'next/image';

// Mock data for initial development
const mockTeams = [
  { id: 1, name: 'Design Masters' },
  { id: 2, name: 'UX Warriors' },
  { id: 3, name: 'Creative Minds' },
  { id: 4, name: 'Innovation Squad' },
];

const mockMessages = [
  {
    id: 1,
    sender_id: 1,
    receiver_id: null, // broadcast
    content: 'Welcome to SparkLab! Make sure to check the resources section for design assets.',
    timestamp: '2025-10-18T09:30:00',
    sender_name: 'Admin Organizer',
    is_broadcast: true
  },
  {
    id: 2,
    sender_id: 5,
    receiver_id: 1, // to organizer
    content: 'When will the next checkpoint deadline be announced?',
    timestamp: '2025-10-18T10:15:00',
    sender_name: 'John Smith',
    team_name: 'Design Masters'
  },
  {
    id: 3,
    sender_id: 1,
    receiver_id: 5,
    content: 'The next checkpoint will be announced tomorrow morning. Stay tuned!',
    timestamp: '2025-10-18T10:20:00',
    sender_name: 'Admin Organizer'
  },
  {
    id: 4,
    sender_id: 7,
    receiver_id: 1,
    content: 'Where can we find the judging criteria document?',
    timestamp: '2025-10-18T11:05:00',
    sender_name: 'Michael Brown',
    team_name: 'UX Warriors'
  },
  {
    id: 5,
    sender_id: 1,
    receiver_id: 7,
    content: 'The judging criteria has been uploaded to the resources section. You can find it under "Event Guidelines".',
    timestamp: '2025-10-18T11:10:00',
    sender_name: 'Admin Organizer'
  }
];

export default function MessagesPage() {
  const [messages, setMessages] = useState(mockMessages);
  const [teams, setTeams] = useState(mockTeams);
  const [isSendingAnnouncement, setIsSendingAnnouncement] = useState(false);
  const [selectedConversation, setSelectedConversation] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  
  // Form states
  const [announcementMessage, setAnnouncementMessage] = useState('');
  const [selectedTeamId, setSelectedTeamId] = useState<number | null>(null);
  const [replyMessage, setReplyMessage] = useState('');
  
  // Helper to get unique conversations from messages
  const getUniqueConversations = () => {
    const conversations: {[key: number]: any} = {};
    
    messages.forEach(message => {
      if (message.sender_id !== 1 && !message.is_broadcast) { // Not from organizer or not a broadcast
        const participantId = message.sender_id;
        if (!conversations[participantId]) {
          conversations[participantId] = {
            id: participantId,
            name: message.sender_name,
            team_name: message.team_name,
            last_message: message.content,
            timestamp: message.timestamp
          };
        } else if (new Date(message.timestamp) > new Date(conversations[participantId].timestamp)) {
          conversations[participantId].last_message = message.content;
          conversations[participantId].timestamp = message.timestamp;
        }
      }
    });
    
    return Object.values(conversations).sort((a, b) => 
      new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );
  };
  
  const conversations = getUniqueConversations();
  
  // Filter messages for selected conversation
  const conversationMessages = selectedConversation 
    ? messages.filter(message => 
        (message.sender_id === 1 && message.receiver_id === selectedConversation) || 
        (message.sender_id === selectedConversation && message.receiver_id === 1)
      ).sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime())
    : [];
    
  // Filter broadcast messages
  const broadcastMessages = messages
    .filter(message => message.is_broadcast)
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    
  const handleSendAnnouncement = async () => {
    if (!announcementMessage.trim()) {
      toast({
        title: 'Error',
        description: 'Please enter a message',
        variant: 'destructive',
      });
      return;
    }
    
    setIsLoading(true);
    
    try {
      // In a real app, this would be an API call to add the message to the database
      
      // For now, we'll just update the local state
      const newMessage = {
        id: messages.length + 1,
        sender_id: 1, // Organizer ID
        receiver_id: selectedTeamId, // null for all teams
        content: announcementMessage,
        timestamp: new Date().toISOString(),
        sender_name: 'Admin Organizer',
        is_broadcast: selectedTeamId === null
      };
      
      setMessages([...messages, newMessage]);
      
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
    if (!replyMessage.trim() || !selectedConversation) {
      return;
    }
    
    try {
      // In a real app, this would be an API call to add the message to the database
      
      // For now, we'll just update the local state
      const newMessage = {
        id: messages.length + 1,
        sender_id: 1, // Organizer ID
        receiver_id: selectedConversation,
        content: replyMessage,
        timestamp: new Date().toISOString(),
        sender_name: 'Admin Organizer'
      };
      
      setMessages([...messages, newMessage]);
      setReplyMessage('');
      
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to send message',
        variant: 'destructive',
      });
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
                >
                  <option value="">All Participants (Broadcast)</option>
                  {teams.map((team) => (
                    <option key={team.id} value={team.id}>
                      {team.name}
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
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsSendingAnnouncement(false)}>Cancel</Button>
              <Button onClick={handleSendAnnouncement} disabled={isLoading}>
                {isLoading && <RefreshCw className="mr-2 h-4 w-4 animate-spin" />}
                Send Message
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
      
      <Tabs defaultValue="conversations" className="w-full">
        <TabsList>
          <TabsTrigger value="conversations" className="flex items-center">
            <MessageCircle className="mr-2 h-4 w-4" />
            Conversations
          </TabsTrigger>
          <TabsTrigger value="announcements" className="flex items-center">
            <Bell className="mr-2 h-4 w-4" />
            Announcements
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
                          className={`flex ${message.sender_id === 1 ? 'justify-end' : 'justify-start'}`}
                        >
                          <div 
                            className={`max-w-[70%] rounded-lg p-3 ${
                              message.sender_id === 1 
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
                    </div>
                  </CardContent>
                  <div className="p-4 border-t border-secondary/20">
                    <div className="flex items-center gap-2">
                      <Input 
                        placeholder="Type your message..."
                        value={replyMessage}
                        onChange={(e) => setReplyMessage(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' && !e.shiftKey) {
                            e.preventDefault();
                            handleSendReply();
                          }
                        }}
                      />
                      <Button size="icon" onClick={handleSendReply}>
                        <Send className="h-4 w-4" />
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
    </div>
  );
}