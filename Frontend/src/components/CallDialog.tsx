import { useState, useEffect } from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Phone, PhoneOff, Video, VideoOff, Mic, MicOff } from 'lucide-react';
import { User } from '@/types/chat';

interface CallDialogProps {
  isOpen: boolean;
  onClose: () => void;
  user: User;
  callType: 'audio' | 'video';
  isIncoming?: boolean;
}

export const CallDialog = ({ isOpen, onClose, user, callType, isIncoming = false }: CallDialogProps) => {
  const [isConnected, setIsConnected] = useState(false);
  const [duration, setDuration] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOn, setIsVideoOn] = useState(callType === 'video');

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isConnected) {
      interval = setInterval(() => {
        setDuration(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isConnected]);

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleAccept = () => {
    setIsConnected(true);
  };

  const handleDecline = () => {
    onClose();
  };

  const handleEndCall = () => {
    setIsConnected(false);
    setDuration(0);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md bg-background/95 backdrop-blur">
        <div className="flex flex-col items-center space-y-6 py-8">
          {/* User Info */}
          <div className="text-center space-y-2">
            <Avatar className="w-24 h-24 mx-auto">
              <AvatarFallback className="bg-gradient-secondary text-white text-2xl">
                {user.avatar}
              </AvatarFallback>
            </Avatar>
            <h3 className="text-xl font-semibold">{user.name}</h3>
            <p className="text-sm text-muted-foreground">
              {isConnected ? formatDuration(duration) : 
               isIncoming ? `Incoming ${callType} call...` : 
               `${callType} calling...`}
            </p>
          </div>

          {/* Video Preview (for video calls) */}
          {callType === 'video' && isConnected && isVideoOn && (
            <div className="w-full h-48 bg-secondary rounded-lg flex items-center justify-center">
              <p className="text-muted-foreground">Video preview area</p>
            </div>
          )}

          {/* Call Controls */}
          <div className="flex items-center space-x-4">
            {!isConnected && isIncoming ? (
              <>
                <Button
                  size="lg"
                  variant="destructive"
                  onClick={handleDecline}
                  className="rounded-full w-16 h-16 p-0"
                >
                  <PhoneOff className="w-6 h-6" />
                </Button>
                <Button
                  size="lg"
                  onClick={handleAccept}
                  className="rounded-full w-16 h-16 p-0 bg-green-500 hover:bg-green-600"
                >
                  <Phone className="w-6 h-6" />
                </Button>
              </>
            ) : isConnected ? (
              <>
                <Button
                  size="lg"
                  variant={isMuted ? "destructive" : "secondary"}
                  onClick={() => setIsMuted(!isMuted)}
                  className="rounded-full w-12 h-12 p-0"
                >
                  {isMuted ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
                </Button>
                
                {callType === 'video' && (
                  <Button
                    size="lg"
                    variant={!isVideoOn ? "destructive" : "secondary"}
                    onClick={() => setIsVideoOn(!isVideoOn)}
                    className="rounded-full w-12 h-12 p-0"
                  >
                    {isVideoOn ? <Video className="w-5 h-5" /> : <VideoOff className="w-5 h-5" />}
                  </Button>
                )}
                
                <Button
                  size="lg"
                  variant="destructive"
                  onClick={handleEndCall}
                  className="rounded-full w-12 h-12 p-0"
                >
                  <PhoneOff className="w-5 h-5" />
                </Button>
              </>
            ) : (
              <Button
                size="lg"
                variant="destructive"
                onClick={handleEndCall}
                className="rounded-full w-16 h-16 p-0"
              >
                <PhoneOff className="w-6 h-6" />
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};