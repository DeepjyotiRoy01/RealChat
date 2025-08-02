import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Check } from "lucide-react";

interface AvatarSelectorProps {
  isOpen: boolean;
  onClose: () => void;
  currentAvatar: string;
  onAvatarChange: (avatar: string) => void;
}

const avatarOptions = [
  '😊', '😄', '😃', '😁', '😆', '😅', '😂', '🤣', '😉', '😋',
  '😎', '😍', '🥰', '😘', '😗', '😙', '😚', '🙂', '🤗', '🤔',
  '🤨', '😐', '😑', '😶', '🙄', '😏', '😣', '😥', '😮', '🤐',
  '😯', '😪', '😫', '😴', '😌', '😛', '😜', '😝', '🤤', '😒',
  '😓', '😔', '😕', '🙃', '🤑', '😲', '☹️', '🙁', '😖', '😞',
  '😟', '😤', '😢', '😭', '😦', '😧', '😨', '😩', '🤯', '😬',
  '😰', '😱', '🥵', '🥶', '😳', '🤪', '😵', '😡', '😠', '🤬',
  '😷', '🤒', '🤕', '🤢', '🤮', '🤧', '😇', '🥳', '🥴', '🥺',
  '🤠', '🤡', '🤥', '🤫', '🤭', '🧐', '🤓', '😈', '👿', '👹',
  '👺', '💀', '👻', '👽', '🤖', '💩', '😺', '😸', '😹', '😻'
];

export const AvatarSelector = ({ 
  isOpen, 
  onClose, 
  currentAvatar, 
  onAvatarChange 
}: AvatarSelectorProps) => {
  const [selectedAvatar, setSelectedAvatar] = useState(currentAvatar);

  const handleAvatarSelect = (avatar: string) => {
    setSelectedAvatar(avatar);
  };

  const handleSave = () => {
    onAvatarChange(selectedAvatar);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Choose Your Avatar</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          {/* Current Avatar Display */}
          <div className="text-center">
            <p className="text-sm text-gray-600 mb-2">Current Avatar</p>
            <Avatar className="w-16 h-16 mx-auto">
              <AvatarFallback className="text-2xl">
                {currentAvatar}
              </AvatarFallback>
            </Avatar>
          </div>

          {/* Avatar Grid */}
          <div className="grid grid-cols-8 gap-2 max-h-64 overflow-y-auto">
            {avatarOptions.map((avatar, index) => (
              <Button
                key={index}
                variant={selectedAvatar === avatar ? "default" : "outline"}
                size="sm"
                className="w-12 h-12 p-0 text-xl hover:scale-110 transition-transform"
                onClick={() => handleAvatarSelect(avatar)}
              >
                {avatar}
                {selectedAvatar === avatar && (
                  <Check className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 text-white rounded-full p-0.5" />
                )}
              </Button>
            ))}
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end space-x-2 pt-4">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button onClick={handleSave}>
              Save Avatar
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}; 