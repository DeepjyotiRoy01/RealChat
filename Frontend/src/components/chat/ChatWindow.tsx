import { useState, useRef, useEffect } from 'react';
import { Send, Paperclip, MoreVertical, Check, CheckCheck, Image, FileText, File } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { FileUploadDialog } from '@/components/FileUploadDialog';
import { ProfileDialog } from '@/components/ProfileDialog';
import { EmojiPickerComponent } from '@/components/EmojiPicker';
import { BackgroundSelector } from '@/components/BackgroundSelector';
import { User, Chat, Message } from '@/types/chat';

interface ChatWindowProps {
  chat: Chat;
  messages: Message[];
  currentUser: User;
  onSendMessage: (text: string) => void;
  onSendFile: (file: File, caption?: string) => void;
}

export const ChatWindow = ({ chat, messages, currentUser, onSendMessage, onSendFile }: ChatWindowProps) => {
  const [newMessage, setNewMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isFileDialogOpen, setIsFileDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isProfileDialogOpen, setIsProfileDialogOpen] = useState(false);
  const [chatBackground, setChatBackground] = useState('bg-chat-bg');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = () => {
    if (newMessage.trim()) {
      onSendMessage(newMessage);
      setNewMessage('');
    }
  };

  const handleFileUpload = (file: File, caption?: string) => {
    onSendFile(file, caption);
  };

  const handleAvatarClick = (user: User, isOwn: boolean = false) => {
    setSelectedUser(user);
    setIsProfileDialogOpen(true);
  };

  const handleEmojiSelect = (emoji: string) => {
    setNewMessage(prev => prev + emoji);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const formatDate = (date: Date) => {
    const today = new Date();
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString();
    }
  };

  const shouldShowDateDivider = (message: Message, index: number) => {
    if (index === 0) return true;
    const prevMessage = messages[index - 1];
    const currentDate = new Date(message.timestamp).toDateString();
    const prevDate = new Date(prevMessage.timestamp).toDateString();
    return currentDate !== prevDate;
  };

  const shouldShowAvatar = (message: Message, index: number) => {
    if (message.senderId === currentUser.id) return false;
    if (index === messages.length - 1) return true;
    const nextMessage = messages[index + 1];
    return nextMessage.senderId !== message.senderId;
  };

  const getMessageStatus = (message: Message) => {
    if (message.senderId !== currentUser.id) return null;
    
    const status = message.status || 'sent';
    switch (status) {
      case 'sent':
        return <Check className="w-4 h-4 text-muted-foreground" />;
      case 'delivered':
        return <CheckCheck className="w-4 h-4 text-muted-foreground" />;
      case 'read':
        return <CheckCheck className="w-4 h-4 text-primary" />;
      default:
        return null;
    }
  };

  return (
    <div className="flex-1 flex flex-col h-full">
      {/* Messages Area */}
      <div className={`flex-1 overflow-y-auto ${chatBackground} p-4 space-y-4 relative`}>
        {/* Background Selector */}
        <div className="absolute top-4 right-4 z-10">
          <BackgroundSelector 
            onBackgroundChange={setChatBackground}
            currentBackground={chatBackground}
          />
        </div>
        {messages.map((message, index) => {
          const isMe = message.senderId === currentUser.id;
          const showAvatar = shouldShowAvatar(message, index);
          const showDate = shouldShowDateDivider(message, index);
          const sender = chat.participants.find(p => p.id === message.senderId);

          return (
            <div key={message.id}>
              {showDate && (
                <div className="flex justify-center my-4">
                  <div className="bg-muted/50 px-3 py-1 rounded-full text-xs text-muted-foreground">
                    {formatDate(message.timestamp)}
                  </div>
                </div>
              )}
              
              <div className={`flex items-end space-x-2 animate-slide-up ${isMe ? 'justify-end' : 'justify-start'}`}>
                {!isMe && (
                  <div className="w-8">
                    {showAvatar && (
                      <Avatar 
                        className="w-8 h-8 cursor-pointer hover:ring-2 hover:ring-primary/50 transition-all"
                        onClick={() => sender && handleAvatarClick(sender)}
                      >
                        <AvatarFallback className="bg-gradient-secondary text-white text-sm">
                          {sender?.avatar || '👤'}
                        </AvatarFallback>
                      </Avatar>
                    )}
                  </div>
                )}
                
                <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-2xl shadow-message ${
                  isMe 
                    ? 'bg-gradient-message text-white rounded-br-sm' 
                    : 'bg-chat-bubble-received text-foreground rounded-bl-sm'
                }`}>
                  {!isMe && chat.type === 'group' && showAvatar && (
                    <p className="text-xs font-medium text-primary mb-1">{sender?.name}</p>
                  )}
                  
                  {message.type === 'text' ? (
                    <p className="text-sm leading-relaxed">{message.text}</p>
                  ) : message.type === 'image' ? (
                    <div className="space-y-2">
                      <div className="relative">
                        <img 
                          src={message.text} 
                          alt="Shared image" 
                          className="max-w-xs rounded-lg cursor-pointer hover:opacity-90 transition-opacity"
                          onClick={() => window.open(message.text, '_blank')}
                        />
                      </div>
                      {message.text !== message.text && (
                        <p className="text-sm">{message.text}</p>
                      )}
                    </div>
                  ) : (
                    <div className="flex items-center space-x-2 p-2 bg-white/10 rounded-lg">
                      <div className="text-white/70">
                        {message.type === 'file' ? <FileText className="w-4 h-4" /> : <File className="w-4 h-4" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{message.text}</p>
                        <p className="text-xs opacity-70">File</p>
                      </div>
                    </div>
                  )}
                  
                  <div className={`flex items-center justify-end space-x-1 mt-1 ${
                    isMe ? 'text-white/70' : 'text-muted-foreground'
                  }`}>
                    <span className="text-xs">{formatTime(message.timestamp)}</span>
                    {getMessageStatus(message)}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
        
        {isTyping && (
          <div className="flex items-center space-x-2 animate-pulse">
            <Avatar className="w-8 h-8">
              <AvatarFallback className="bg-gradient-secondary text-white text-sm">
                {chat.participants[0]?.avatar || '👤'}
              </AvatarFallback>
            </Avatar>
            <div className="bg-chat-bubble-received px-4 py-2 rounded-2xl rounded-bl-sm">
              <div className="flex space-x-1">
                <div className="w-2 h-2 bg-chat-typing rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-chat-typing rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                <div className="w-2 h-2 bg-chat-typing rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
              </div>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="border-t border-border bg-chat-sidebar p-4">
        <div className="flex items-center space-x-2">
          <Button 
            variant="ghost" 
            size="icon" 
            className="hover:bg-primary/10"
            onClick={() => setIsFileDialogOpen(true)}
          >
            <Paperclip className="w-5 h-5" />
          </Button>
          
          <div className="flex-1 relative">
            <Input
              placeholder="Type a message..."
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              className="pr-12 bg-chat-input border-border/50 focus:border-primary/50 rounded-2xl"
            />
            <div className="absolute right-1 top-1/2 transform -translate-y-1/2">
              <EmojiPickerComponent onEmojiSelect={handleEmojiSelect} />
            </div>
          </div>
          
          <Button
            onClick={handleSend}
            disabled={!newMessage.trim()}
            className="bg-gradient-primary hover:bg-gradient-primary/90 text-white rounded-full w-10 h-10 p-0 shadow-glow disabled:opacity-50 disabled:shadow-none"
          >
            <Send className="w-5 h-5" />
          </Button>
        </div>
      </div>

      {/* Dialogs */}
      <FileUploadDialog
        isOpen={isFileDialogOpen}
        onClose={() => setIsFileDialogOpen(false)}
        onSend={handleFileUpload}
      />
      
      <ProfileDialog
        user={selectedUser}
        isOpen={isProfileDialogOpen}
        onClose={() => {
          setIsProfileDialogOpen(false);
          setSelectedUser(null);
        }}
        isOwnProfile={selectedUser?.id === currentUser.id}
      />
    </div>
  );
};