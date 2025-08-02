import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Palette, Check } from 'lucide-react';

interface BackgroundSelectorProps {
  onBackgroundChange: (background: string) => void;
  currentBackground: string;
}

const backgrounds = [
  { name: 'Default', value: 'bg-chat-bg', preview: 'hsl(var(--chat-bg))' },
  { name: 'Ocean', value: 'bg-gradient-to-br from-blue-400 via-blue-500 to-blue-600', preview: 'linear-gradient(135deg, #60a5fa, #3b82f6, #2563eb)' },
  { name: 'Sunset', value: 'bg-gradient-to-br from-orange-400 via-pink-500 to-purple-600', preview: 'linear-gradient(135deg, #fb923c, #ec4899, #9333ea)' },
  { name: 'Forest', value: 'bg-gradient-to-br from-green-400 via-green-500 to-green-600', preview: 'linear-gradient(135deg, #4ade80, #22c55e, #16a34a)' },
  { name: 'Night', value: 'bg-gradient-to-br from-gray-800 via-gray-900 to-black', preview: 'linear-gradient(135deg, #1f2937, #111827, #000000)' },
  { name: 'Rose', value: 'bg-gradient-to-br from-pink-300 via-purple-300 to-indigo-400', preview: 'linear-gradient(135deg, #f9a8d4, #c084fc, #818cf8)' },
];

export const BackgroundSelector = ({ onBackgroundChange, currentBackground }: BackgroundSelectorProps) => {
  const [isOpen, setIsOpen] = useState(false);

  const handleBackgroundSelect = (background: string) => {
    onBackgroundChange(background);
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
          <Palette className="w-5 h-5" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-64 p-4" side="top" align="end">
        <h3 className="font-medium mb-3">Chat Background</h3>
        <div className="grid grid-cols-2 gap-2">
          {backgrounds.map((bg) => (
            <button
              key={bg.name}
              onClick={() => handleBackgroundSelect(bg.value)}
              className="relative p-3 rounded-lg border border-border hover:border-primary/50 transition-colors group"
            >
              <div 
                className="w-full h-8 rounded mb-2"
                style={{ background: bg.preview }}
              />
              <span className="text-xs font-medium">{bg.name}</span>
              {currentBackground === bg.value && (
                <div className="absolute top-1 right-1 w-5 h-5 bg-primary rounded-full flex items-center justify-center">
                  <Check className="w-3 h-3 text-white" />
                </div>
              )}
            </button>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
};