import { useState } from 'react';
import EmojiPicker, { EmojiClickData } from 'emoji-picker-react';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Smile } from 'lucide-react';
import { useTheme } from '@/components/theme-provider';

interface EmojiPickerComponentProps {
  onEmojiSelect: (emoji: string) => void;
}

export const EmojiPickerComponent = ({ onEmojiSelect }: EmojiPickerComponentProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const { theme } = useTheme();

  const handleEmojiClick = (emojiData: EmojiClickData) => {
    onEmojiSelect(emojiData.emoji);
    setIsOpen(false);
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button 
          variant="ghost" 
          size="icon" 
          className="hover:bg-primary/10"
        >
          <Smile className="w-5 h-5" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="p-0 border-0 shadow-lg" side="top" align="end">
        <EmojiPicker
          onEmojiClick={handleEmojiClick}
          theme={theme === 'dark' ? 'dark' as any : 'light' as any}
          width={320}
          height={400}
          previewConfig={{ showPreview: false }}
          skinTonesDisabled
        />
      </PopoverContent>
    </Popover>
  );
};