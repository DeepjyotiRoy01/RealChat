import { useState } from 'react';
import { Search, Plus, Settings, Users, MessageSquarePlus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { User, Chat } from '@/types/chat';
import { AvatarSelector } from '@/components/AvatarSelector';
import { toast } from 'sonner';

interface ChatSidebarProps {
  chats: Chat[];
  contacts: User[];
  selectedChat: Chat | null;
  onSelectChat: (chat: Chat) => void;
  currentUser: User;
  isOpen: boolean;
  onToggle: () => void;
  onAddContact: () => void;
  onAvatarChange?: (avatar: string) => void;
}

export const ChatSidebar = ({ 
  chats, 
  contacts,
  selectedChat, 
  onSelectChat, 
  currentUser, 
  isOpen,
  onAddContact,
  onAvatarChange
}: ChatSidebarProps) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'chats' | 'contacts'>('chats');
  const [isAvatarSelectorOpen, setIsAvatarSelectorOpen] = useState(false);

  const filteredChats = chats.filter(chat => {
    const chatName = chat.type === 'group' 
      ? chat.name 
      : chat.participants[0]?.name;
    return chatName?.toLowerCase().includes(searchQuery.toLowerCase());
  });

  const filteredContacts = contacts.filter(contact => 
    contact.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    contact.phoneNumber.includes(searchQuery)
  );

  const formatTime = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    
    if (diff < 60000) return 'now';
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}h`;
    return date.toLocaleDateString();
  };

  const handleAvatarClick = () => {
    setIsAvatarSelectorOpen(true);
  };

  const handleAvatarChange = async (newAvatar: string) => {
    try {
      const userData = localStorage.getItem('user');
      if (!userData) return;

      const user = JSON.parse(userData);
      const response = await fetch('http://localhost:5000/api/auth/profile', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${user.token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          avatar: newAvatar
        })
      });

      if (response.ok) {
        // Update local storage
        const updatedUser = { ...user, avatar: newAvatar };
        localStorage.setItem('user', JSON.stringify(updatedUser));
        
        // Call the parent callback if provided
        if (onAvatarChange) {
          onAvatarChange(newAvatar);
        }
        
        toast.success('Avatar updated successfully!');
      } else {
        toast.error('Failed to update avatar');
      }
    } catch (error) {
      console.error('Error updating avatar:', error);
      toast.error('Failed to update avatar');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="h-full bg-chat-sidebar border-r border-border flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-border">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <Avatar 
              className="w-10 h-10 ring-2 ring-primary/20 cursor-pointer hover:ring-primary/40 transition-all duration-200"
              onClick={handleAvatarClick}
            >
              <AvatarFallback className="bg-gradient-primary text-white font-semibold">
                {currentUser.avatar}
              </AvatarFallback>
            </Avatar>
            <div>
              <h2 className="font-semibold text-foreground">{currentUser.name}</h2>
              <div className="flex items-center space-x-1">
                <div className="w-2 h-2 bg-chat-online rounded-full animate-pulse-glow"></div>
                <span className="text-xs text-muted-foreground">Online</span>
                {currentUser.isAdmin && (
                  <Badge variant="secondary" className="ml-2 text-xs">
                    Admin
                  </Badge>
                )}
              </div>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Button 
              variant="ghost" 
              size="icon" 
              className="hover:bg-primary/10"
              onClick={onAddContact}
            >
              <Plus className="w-5 h-5" />
            </Button>
            <Button variant="ghost" size="icon" className="hover:bg-primary/10">
              <Settings className="w-5 h-5" />
            </Button>
          </div>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder={`Search ${activeTab}...`}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 bg-chat-input border-border/50 focus:border-primary/50 transition-colors"
          />
        </div>

        {/* Tabs */}
        <div className="flex space-x-1 mt-4 bg-chat-input rounded-lg p-1">
          <Button
            variant={activeTab === 'chats' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setActiveTab('chats')}
            className={`flex-1 ${
              activeTab === 'chats' 
                ? 'bg-primary text-primary-foreground' 
                : 'hover:bg-primary/10'
            }`}
          >
            Chats
          </Button>
          <Button
            variant={activeTab === 'contacts' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setActiveTab('contacts')}
            className={`flex-1 ${
              activeTab === 'contacts' 
                ? 'bg-primary text-primary-foreground' 
                : 'hover:bg-primary/10'
            }`}
          >
            Contacts
          </Button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        {activeTab === 'chats' ? (
          <div className="p-2">
            {filteredChats.length === 0 ? (
              <div className="text-center py-8">
                <MessageSquarePlus className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">No chats yet</p>
                <p className="text-sm text-muted-foreground">Start a conversation with your contacts</p>
              </div>
            ) : (
              filteredChats.map((chat) => (
                <div
                  key={chat.id}
                  onClick={() => onSelectChat(chat)}
                  className={`flex items-center space-x-3 p-3 rounded-lg cursor-pointer transition-colors ${
                    selectedChat?.id === chat.id
                      ? 'bg-primary/10 border border-primary/20'
                      : 'hover:bg-chat-hover'
                  }`}
                >
                  <Avatar className="w-12 h-12">
                    <AvatarFallback className="bg-gradient-primary text-white font-semibold">
                      {chat.type === 'group' 
                        ? chat.name?.charAt(0).toUpperCase() 
                        : chat.participants[0]?.avatar
                      }
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h3 className="font-medium text-foreground truncate">
                        {chat.type === 'group' 
                          ? chat.name 
                          : chat.participants[0]?.name
                        }
                      </h3>
                      <span className="text-xs text-muted-foreground">
                        {formatTime(chat.lastMessage.timestamp)}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground truncate">
                      {chat.lastMessage.text}
                    </p>
                  </div>
                  {chat.unreadCount > 0 && (
                    <Badge variant="destructive" className="ml-2">
                      {chat.unreadCount}
                    </Badge>
                  )}
                </div>
              ))
            )}
          </div>
        ) : (
          <div className="p-2">
            {filteredContacts.length === 0 ? (
              <div className="text-center py-8">
                <Users className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">No contacts yet</p>
                <p className="text-sm text-muted-foreground">Add contacts to start chatting</p>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="mt-4"
                  onClick={onAddContact}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Contact
                </Button>
              </div>
            ) : (
              filteredContacts.map((contact) => (
                <div
                  key={contact.id}
                  className="flex items-center space-x-3 p-3 rounded-lg hover:bg-chat-hover cursor-pointer transition-colors"
                >
                  <Avatar className="w-12 h-12">
                    <AvatarFallback className="bg-gradient-primary text-white font-semibold">
                      {contact.avatar}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h3 className="font-medium text-foreground truncate">
                        {contact.name}
                      </h3>
                      <div className="flex items-center space-x-1">
                        <div className={`w-2 h-2 rounded-full ${
                          contact.isOnline ? 'bg-chat-online animate-pulse-glow' : 'bg-muted-foreground'
                        }`}></div>
                        <span className="text-xs text-muted-foreground">
                          {contact.isOnline ? 'Online' : 'Offline'}
                        </span>
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground truncate">
                      {contact.phoneNumber}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>

      {/* Avatar Selector */}
      <AvatarSelector
        isOpen={isAvatarSelectorOpen}
        onClose={() => setIsAvatarSelectorOpen(false)}
        currentAvatar={currentUser.avatar}
        onAvatarChange={handleAvatarChange}
      />
    </div>
  );
};