import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { User, UserPlus, Users, Clock, Check, X } from "lucide-react";
import { User as UserType } from '@/types/chat';
import { toast } from 'sonner';

interface ContactsDialogProps {
  isOpen: boolean;
  onClose: () => void;
  contacts: UserType[];
  onAddContact: (phoneNumber: string, name: string) => void;
  currentUser: UserType;
}

interface UserRequest {
  id: string;
  name: string;
  phoneNumber: string;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: Date;
}

export const ContactsDialog = ({ 
  isOpen, 
  onClose, 
  contacts, 
  onAddContact, 
  currentUser 
}: ContactsDialogProps) => {
  const [newContact, setNewContact] = useState({ name: '', phoneNumber: '' });
  const [userRequests, setUserRequests] = useState<UserRequest[]>([]);
  const [allUsers, setAllUsers] = useState<UserType[]>([]);

  useEffect(() => {
    if (isOpen) {
      loadUserRequests();
      if (currentUser.isAdmin) {
        loadAllUsers();
      }
    }
  }, [isOpen, currentUser.isAdmin]);

  const loadUserRequests = async () => {
    try {
      const userData = localStorage.getItem('user');
      if (!userData) return;

      const user = JSON.parse(userData);
      const response = await fetch('http://localhost:5000/api/users/requests', {
        headers: {
          'Authorization': `Bearer ${user.token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setUserRequests(data.requests);
      }
    } catch (error) {
      console.error('Error loading user requests:', error);
    }
  };

  const loadAllUsers = async () => {
    try {
      const userData = localStorage.getItem('user');
      if (!userData) return;

      const user = JSON.parse(userData);
      const response = await fetch('http://localhost:5000/api/users/all', {
        headers: {
          'Authorization': `Bearer ${user.token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setAllUsers(data.users);
      }
    } catch (error) {
      console.error('Error loading all users:', error);
    }
  };

  const handleAddContact = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newContact.name.trim() || !newContact.phoneNumber.trim()) {
      toast.error('Please fill in all fields');
      return;
    }
    onAddContact(newContact.phoneNumber, newContact.name);
    setNewContact({ name: '', phoneNumber: '' });
  };

  const handleApproveRequest = async (requestId: string) => {
    try {
      const userData = localStorage.getItem('user');
      if (!userData) return;

      const user = JSON.parse(userData);
      const response = await fetch(`http://localhost:5000/api/users/requests/${requestId}/approve`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${user.token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        toast.success('User request approved!');
        loadUserRequests();
      } else {
        toast.error('Failed to approve request');
      }
    } catch (error) {
      console.error('Error approving request:', error);
      toast.error('Failed to approve request');
    }
  };

  const handleRejectRequest = async (requestId: string) => {
    try {
      const userData = localStorage.getItem('user');
      if (!userData) return;

      const user = JSON.parse(userData);
      const response = await fetch(`http://localhost:5000/api/users/requests/${requestId}/reject`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${user.token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        toast.success('User request rejected!');
        loadUserRequests();
      } else {
        toast.error('Failed to reject request');
      }
    } catch (error) {
      console.error('Error rejecting request:', error);
      toast.error('Failed to reject request');
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            {currentUser.isAdmin ? 'User Management' : 'Contacts'}
          </DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="contacts" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="contacts">Contacts</TabsTrigger>
            <TabsTrigger value="add">Add Contact</TabsTrigger>
            {currentUser.isAdmin && (
              <TabsTrigger value="requests">Requests</TabsTrigger>
            )}
          </TabsList>

          <TabsContent value="contacts" className="space-y-4">
            <div className="space-y-2">
              {contacts.length === 0 ? (
                <p className="text-center text-gray-500 py-8">
                  No contacts yet. Add some contacts to start chatting!
                </p>
              ) : (
                contacts.map((contact) => (
                  <div
                    key={contact.id}
                    className="flex items-center justify-between p-3 rounded-lg border hover:bg-gray-50"
                  >
                    <div className="flex items-center gap-3">
                      <Avatar>
                        <AvatarFallback>{contact.avatar}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">{contact.name}</p>
                        <p className="text-sm text-gray-500">{contact.phoneNumber}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={contact.isOnline ? "default" : "secondary"}>
                        {contact.isOnline ? 'Online' : 'Offline'}
                      </Badge>
                    </div>
                  </div>
                ))
              )}
            </div>
          </TabsContent>

          <TabsContent value="add" className="space-y-4">
            <form onSubmit={handleAddContact} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Contact Name</Label>
                <Input
                  id="name"
                  value={newContact.name}
                  onChange={(e) => setNewContact(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Enter contact name"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phoneNumber">Phone Number</Label>
                <Input
                  id="phoneNumber"
                  value={newContact.phoneNumber}
                  onChange={(e) => setNewContact(prev => ({ ...prev, phoneNumber: e.target.value }))}
                  placeholder="Enter phone number"
                  required
                />
              </div>
              <Button type="submit" className="w-full">
                <UserPlus className="h-4 w-4 mr-2" />
                Add Contact
              </Button>
            </form>
          </TabsContent>

          {currentUser.isAdmin && (
            <TabsContent value="requests" className="space-y-4">
              <div className="space-y-2">
                {userRequests.length === 0 ? (
                  <p className="text-center text-gray-500 py-8">
                    No pending user requests
                  </p>
                ) : (
                  userRequests.map((request) => (
                    <div
                      key={request.id}
                      className="flex items-center justify-between p-3 rounded-lg border"
                    >
                      <div className="flex items-center gap-3">
                        <Avatar>
                          <AvatarFallback>
                            <User className="h-4 w-4" />
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">{request.name}</p>
                          <p className="text-sm text-gray-500">{request.phoneNumber}</p>
                          <p className="text-xs text-gray-400">
                            <Clock className="h-3 w-3 inline mr-1" />
                            {new Date(request.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {request.status === 'pending' ? (
                          <>
                            <Button
                              size="sm"
                              onClick={() => handleApproveRequest(request.id)}
                              className="bg-green-600 hover:bg-green-700"
                            >
                              <Check className="h-4 w-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => handleRejectRequest(request.id)}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </>
                        ) : (
                          <Badge variant={request.status === 'approved' ? 'default' : 'destructive'}>
                            {request.status}
                          </Badge>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </TabsContent>
          )}
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}; 