import { useState } from 'react';
import { Phone, Video, MoreVertical, Menu, Search, Users, Sun, Moon, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useTheme } from '@/components/theme-provider';
import { User as UserType, Chat } from '@/types/chat';

interface ChatHeaderProps {
  chat: Chat;
  onToggleSidebar: () => void;
  isSidebarOpen: boolean;
  onCallClick: (type: 'audio' | 'video') => void;
}

export const ChatHeader = ({ chat, onToggleSidebar, isSidebarOpen, onCallClick }: ChatHeaderProps) => {
  const { theme, setTheme } = useTheme();
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  
  const chatName = chat.type === 'group' ? chat.name : chat.participants[0]?.name;
  const chatAvatar = chat.type === 'group' ? '👥' : chat.participants[0]?.avatar;
  const isOnline = chat.type === 'direct' ? chat.participants[0]?.isOnline : true;
  
  const getStatusText = () => {
    if (chat.type === 'group') {
      return `${chat.participants.length} members`;
    }
    if (isOnline) {
      return 'Online';
    }
    const user = chat.participants[0];
    const lastSeen = new Date(user.lastSeen);
    const now = new Date();
    const diff = now.getTime() - lastSeen.getTime();
    
    if (diff < 60000) return 'Last seen just now';
    if (diff < 3600000) return `Last seen ${Math.floor(diff / 60000)}m ago`;
    if (diff < 86400000) return `Last seen ${Math.floor(diff / 3600000)}h ago`;
    return `Last seen ${lastSeen.toLocaleDateString()}`;
  };

  const handleAvatarClick = () => {
    if (chat.type === 'direct') {
      setIsProfileOpen(true);
    }
  };

  return (
    <>
      <div className="h-16 bg-chat-sidebar border-b border-border flex items-center justify-between px-4 shadow-chat">
        <div className="flex items-center space-x-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={onToggleSidebar}
            className="hover:bg-primary/10 md:hidden"
          >
            <Menu className="w-5 h-5" />
          </Button>
          
          <div className="flex items-center space-x-3">
            <div className="relative">
              <Avatar 
                className={`w-10 h-10 ${chat.type === 'direct' ? 'cursor-pointer hover:ring-2 hover:ring-primary/20 transition-all duration-200' : ''}`}
                onClick={handleAvatarClick}
              >
                <AvatarFallback className="bg-gradient-secondary text-white">
                  {chatAvatar}
                </AvatarFallback>
              </Avatar>
              {isOnline && chat.type === 'direct' && (
                <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-chat-online rounded-full border-2 border-chat-sidebar"></div>
              )}
            </div>
            
            <div>
              <h1 className="font-semibold text-foreground">{chatName}</h1>
              <p className="text-sm text-muted-foreground">{getStatusText()}</p>
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <Button variant="ghost" size="icon" className="hover:bg-primary/10 hidden sm:flex">
            <Search className="w-5 h-5" />
          </Button>
          
          <Button 
            variant="ghost" 
            size="icon" 
            className="hover:bg-primary/10"
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          >
            {theme === "dark" ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </Button>
          
          <Button 
            variant="ghost" 
            size="icon" 
            className="hover:bg-primary/10 hidden sm:flex"
            onClick={() => onCallClick('audio')}
          >
            <Phone className="w-5 h-5" />
          </Button>
          
          <Button 
            variant="ghost" 
            size="icon" 
            className="hover:bg-primary/10 hidden sm:flex"
            onClick={() => onCallClick('video')}
          >
            <Video className="w-5 h-5" />
          </Button>
          
          <Button variant="ghost" size="icon" className="hover:bg-primary/10">
            <MoreVertical className="w-5 h-5" />
          </Button>
        </div>
      </div>

      {/* User Profile Dialog */}
      {chat.type === 'direct' && chat.participants[0] && (
        <Dialog open={isProfileOpen} onOpenChange={setIsProfileOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                User Profile
              </DialogTitle>
            </DialogHeader>
            
            <div className="space-y-4">
              <div className="text-center">
                <Avatar className="w-20 h-20 mx-auto mb-4">
                  <AvatarFallback className="text-3xl">
                    {chat.participants[0].avatar}
                  </AvatarFallback>
                </Avatar>
                <h3 className="text-xl font-semibold">{chat.participants[0].name}</h3>
                <p className="text-sm text-gray-500">{chat.participants[0].phoneNumber}</p>
                <div className="flex items-center justify-center gap-2 mt-2">
                  <div className={`w-2 h-2 rounded-full ${isOnline ? 'bg-green-500' : 'bg-gray-400'}`}></div>
                  <span className="text-sm text-gray-600">
                    {isOnline ? 'Online' : 'Offline'}
                  </span>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Last Seen:</span>
                  <span className="text-sm">
                    {new Date(chat.participants[0].lastSeen).toLocaleString()}
                  </span>
                </div>
                {chat.participants[0].isAdmin && (
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Role:</span>
                    <Badge variant="secondary">Admin</Badge>
                  </div>
                )}
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </>
  );
};