import { useState, useEffect } from 'react';
import { ChatSidebar } from './chat/ChatSidebar';
import { ChatWindow } from './chat/ChatWindow';
import { ChatHeader } from './chat/ChatHeader';
import { CallDialog } from './CallDialog';
import { ContactsDialog } from './ContactsDialog';
import { User, Chat, Message } from '@/types/chat';
import { Button } from '@/components/ui/button';
import { Plus, Users, LogOut } from 'lucide-react';
import { toast } from 'sonner';

export const ChatApp = () => {
  const [selectedChat, setSelectedChat] = useState<Chat | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [messages, setMessages] = useState<{ [key: string]: Message[] }>({});
  const [contacts, setContacts] = useState<User[]>([]);
  const [chats, setChats] = useState<Chat[]>([]);
  const [isContactsDialogOpen, setIsContactsDialogOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [callDialog, setCallDialog] = useState<{
    isOpen: boolean;
    user: User | null;
    type: 'audio' | 'video';
    isIncoming: boolean;
  }>({
    isOpen: false,
    user: null,
    type: 'audio',
    isIncoming: false
  });

  useEffect(() => {
    // Get current user from localStorage
    const userData = localStorage.getItem('user');
    if (userData) {
      const user = JSON.parse(userData);
      setCurrentUser({
        id: user.id,
        name: user.name,
        phoneNumber: user.phoneNumber,
        avatar: user.avatar || '😊',
        isOnline: true,
        lastSeen: new Date(),
        isAdmin: user.isAdmin || false
      });
    }

    // Load initial data
    loadContacts();
    loadChats();
  }, []);

  const loadContacts = async () => {
    try {
      const userData = localStorage.getItem('user');
      if (!userData) return;

      const user = JSON.parse(userData);
      const response = await fetch(`http://localhost:5000/api/users/contacts`, {
        headers: {
          'Authorization': `Bearer ${user.token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setContacts(data.contacts);
      }
    } catch (error) {
      console.error('Error loading contacts:', error);
    }
  };

  const loadChats = async () => {
    try {
      const userData = localStorage.getItem('user');
      if (!userData) return;

      const user = JSON.parse(userData);
      const response = await fetch(`http://localhost:5000/api/chats`, {
        headers: {
          'Authorization': `Bearer ${user.token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setChats(data.chats);
        if (data.chats.length > 0 && !selectedChat) {
          setSelectedChat(data.chats[0]);
        }
      }
    } catch (error) {
      console.error('Error loading chats:', error);
    }
  };

  const handleSendMessage = async (text: string) => {
    if (!selectedChat || !currentUser) return;

    const newMessage: Message = {
      id: Date.now(),
      text,
      senderId: currentUser.id,
      timestamp: new Date(),
      type: 'text',
      status: 'sent'
    };

    // Optimistic update
    setMessages(prev => ({
      ...prev,
      [selectedChat.id]: [...(prev[selectedChat.id] || []), newMessage]
    }));

    try {
      const userData = localStorage.getItem('user');
      if (!userData) return;

      const user = JSON.parse(userData);
      const response = await fetch('http://localhost:5000/api/messages', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${user.token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          chatId: selectedChat.id,
          content: text,
          type: 'text'
        })
      });

      if (!response.ok) {
        toast.error('Failed to send message');
      }
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error('Failed to send message');
    }
  };

  const handleSendFile = async (file: File, caption?: string) => {
    if (!selectedChat || !currentUser) return;

    const messageType = file.type.startsWith('image/') ? 'image' : 'file';
    
    const newMessage: Message = {
      id: Date.now(),
      text: caption || file.name,
      senderId: currentUser.id,
      timestamp: new Date(),
      type: messageType,
      status: 'sent'
    };

    setMessages(prev => ({
      ...prev,
      [selectedChat.id]: [...(prev[selectedChat.id] || []), newMessage]
    }));

    // TODO: Implement file upload to backend
    toast.info('File upload feature coming soon!');
  };

  const handleCallClick = (type: 'audio' | 'video') => {
    if (!selectedChat) return;
    
    const otherUser = selectedChat.participants[0];
    if (otherUser) {
      setCallDialog({
        isOpen: true,
        user: otherUser,
        type,
        isIncoming: false
      });
    }
  };

  const handleCloseCall = () => {
    setCallDialog({
      isOpen: false,
      user: null,
      type: 'audio',
      isIncoming: false
    });
  };

  const handleAddContact = async (phoneNumber: string, name: string) => {
    try {
      const userData = localStorage.getItem('user');
      if (!userData) return;

      const user = JSON.parse(userData);
      const response = await fetch('http://localhost:5000/api/users/contacts', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${user.token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ phoneNumber, name })
      });

      if (response.ok) {
        toast.success('Contact added successfully!');
        loadContacts();
        setIsContactsDialogOpen(false);
      } else {
        const data = await response.json();
        toast.error(data.message || 'Failed to add contact');
      }
    } catch (error) {
      console.error('Error adding contact:', error);
      toast.error('Failed to add contact');
    }
  };

  const handleAvatarChange = (newAvatar: string) => {
    if (currentUser) {
      setCurrentUser(prev => prev ? { ...prev, avatar: newAvatar } : null);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('tempUser');
    window.location.href = '/';
  };

  if (!currentUser) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900 flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-gradient-bg flex overflow-hidden">
      {/* Sidebar */}
      <div className={`${isSidebarOpen ? 'w-80' : 'w-0'} transition-all duration-300 ease-in-out`}>
        <ChatSidebar
          chats={chats}
          contacts={contacts}
          selectedChat={selectedChat}
          onSelectChat={setSelectedChat}
          currentUser={currentUser}
          isOpen={isSidebarOpen}
          onToggle={() => setIsSidebarOpen(!isSidebarOpen)}
          onAddContact={() => setIsContactsDialogOpen(true)}
          onAvatarChange={handleAvatarChange}
        />
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {selectedChat ? (
          <>
            <ChatHeader
              chat={selectedChat}
              onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
              isSidebarOpen={isSidebarOpen}
              onCallClick={handleCallClick}
            />
            <ChatWindow
              chat={selectedChat}
              messages={messages[selectedChat.id] || []}
              currentUser={currentUser}
              onSendMessage={handleSendMessage}
              onSendFile={handleSendFile}
            />
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <h2 className="text-2xl font-semibold text-gray-600 mb-4">
                Welcome to RealChat2
              </h2>
              <p className="text-gray-500 mb-6">
                Select a chat to start messaging
              </p>
              <div className="space-y-2">
                <Button
                  onClick={() => setIsContactsDialogOpen(true)}
                  className="w-full"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Contact
                </Button>
                {currentUser.isAdmin && (
                  <Button
                    variant="outline"
                    onClick={() => setIsContactsDialogOpen(true)}
                    className="w-full"
                  >
                    <Users className="h-4 w-4 mr-2" />
                    Manage Users
                  </Button>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Top Right Actions */}
      <div className="absolute top-4 right-4 flex space-x-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setIsContactsDialogOpen(true)}
        >
          <Users className="h-4 w-4" />
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={handleLogout}
        >
          <LogOut className="h-4 w-4" />
        </Button>
      </div>

      {/* Call Dialog */}
      {callDialog.isOpen && callDialog.user && (
        <CallDialog
          isOpen={callDialog.isOpen}
          onClose={handleCloseCall}
          user={callDialog.user}
          callType={callDialog.type}
          isIncoming={callDialog.isIncoming}
        />
      )}

      {/* Contacts Dialog */}
      {isContactsDialogOpen && (
        <ContactsDialog
          isOpen={isContactsDialogOpen}
          onClose={() => setIsContactsDialogOpen(false)}
          contacts={contacts}
          onAddContact={handleAddContact}
          currentUser={currentUser}
        />
      )}
    </div>
  );
};