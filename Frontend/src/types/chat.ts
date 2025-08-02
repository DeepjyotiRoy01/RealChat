export interface User {
  id: number | string;
  name: string;
  avatar: string;
  phoneNumber?: string;
  isOnline: boolean;
  lastSeen: Date;
  isAdmin?: boolean;
}

export interface Chat {
  id: number;
  type: 'direct' | 'group';
  name?: string;
  participants: User[];
  lastMessage: {
    text: string;
    timestamp: Date;
    senderId: number | string;
  };
  unreadCount: number;
}

export interface Message {
  id: number;
  text: string;
  senderId: number | string;
  timestamp: Date;
  type: 'text' | 'image' | 'file';
  status?: 'sent' | 'delivered' | 'read';
}