import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { User } from '@/types/chat';
import { Camera, Upload } from 'lucide-react';

interface ProfileDialogProps {
  user: User | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdateProfile?: (user: User) => void;
  isOwnProfile?: boolean;
}

const avatarOptions = ['😊', '👨‍💻', '👩‍💼', '👨‍🚀', '👩‍🎨', '👩‍🔬', '👨‍🎨', '👩‍💻', '🧑‍💼', '👤'];

export const ProfileDialog = ({ user, isOpen, onClose, onUpdateProfile, isOwnProfile = false }: ProfileDialogProps) => {
  const [selectedAvatar, setSelectedAvatar] = useState(user?.avatar || '👤');
  const [name, setName] = useState(user?.name || '');

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // In a real app, you'd upload this to your backend
      const reader = new FileReader();
      reader.onload = (e) => {
        setSelectedAvatar(e.target?.result as string || '👤');
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = () => {
    if (isOwnProfile && onUpdateProfile && user) {
      onUpdateProfile({
        ...user,
        name,
        avatar: selectedAvatar
      });
    }
    onClose();
  };

  if (!user) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {isOwnProfile ? 'Edit Profile' : `${user.name}'s Profile`}
          </DialogTitle>
        </DialogHeader>
        
        <div className="flex flex-col items-center space-y-4 py-4">
          <div className="relative">
            <Avatar className="w-24 h-24">
              <AvatarFallback className="bg-gradient-secondary text-white text-2xl">
                {selectedAvatar.startsWith('data:') ? (
                  <img src={selectedAvatar} alt="Profile" className="w-full h-full object-cover rounded-full" />
                ) : (
                  selectedAvatar
                )}
              </AvatarFallback>
            </Avatar>
            {isOwnProfile && (
              <Button
                size="sm"
                className="absolute -bottom-2 -right-2 rounded-full w-8 h-8 p-0"
                onClick={() => document.getElementById('file-upload')?.click()}
              >
                <Camera className="w-4 h-4" />
              </Button>
            )}
          </div>

          {isOwnProfile && (
            <>
              <input
                id="file-upload"
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                className="hidden"
              />
              
              <div className="space-y-2">
                <Label>Name</Label>
                <Input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter your name"
                />
              </div>

              <div className="space-y-2">
                <Label>Choose Avatar</Label>
                <div className="grid grid-cols-5 gap-2">
                  {avatarOptions.map((avatar) => (
                    <Button
                      key={avatar}
                      variant={selectedAvatar === avatar ? "default" : "outline"}
                      size="sm"
                      onClick={() => setSelectedAvatar(avatar)}
                      className="w-12 h-12 text-lg p-0"
                    >
                      {avatar}
                    </Button>
                  ))}
                </div>
              </div>

              <Button onClick={handleSave} className="w-full">
                Save Changes
              </Button>
            </>
          )}

          {!isOwnProfile && (
            <div className="text-center space-y-2">
              <h3 className="text-lg font-semibold">{user.name}</h3>
              <p className="text-sm text-muted-foreground">
                {user.isOnline ? 'Online' : 'Offline'}
              </p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};