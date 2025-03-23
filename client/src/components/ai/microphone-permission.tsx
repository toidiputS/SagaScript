
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Mic, ShieldAlert } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface MicrophonePermissionProps {
  onPermissionGranted: () => void;
}

export default function MicrophonePermission({ onPermissionGranted }: MicrophonePermissionProps) {
  const [permissionStatus, setPermissionStatus] = useState<'idle' | 'requesting' | 'granted' | 'denied'>('idle');
  const { toast } = useToast();

  const requestMicrophoneAccess = async () => {
    setPermissionStatus('requesting');
    try {
      // Request microphone access and explain why it's needed
      await navigator.mediaDevices.getUserMedia({ audio: true });
      
      setPermissionStatus('granted');
      toast({
        title: "Microphone access granted",
        description: "You can now use voice features in the application.",
      });
      onPermissionGranted();
    } catch (error) {
      console.error("Error accessing microphone:", error);
      setPermissionStatus('denied');
      toast({
        variant: "destructive",
        title: "Microphone access denied",
        description: "Voice features require microphone access. Please enable it in your browser settings.",
      });
    }
  };

  if (permissionStatus === 'granted') {
    return null;
  }

  return (
    <div className="space-y-4 mb-6">
      <Alert>
        <ShieldAlert className="h-4 w-4" />
        <AlertTitle>Microphone Permission Required</AlertTitle>
        <AlertDescription>
          <p className="mb-2">
            To use voice features with Eleven Labs, microphone access is needed for:
          </p>
          <ul className="list-disc pl-5 mb-3 space-y-1">
            <li>Recording your voice input for text-to-speech conversion</li>
            <li>Enabling natural voice conversations with the AI assistant</li>
            <li>Creating personalized voice responses based on your queries</li>
          </ul>
          <p className="text-sm text-muted-foreground">
            Your privacy is important. Audio is processed securely and not stored permanently.
          </p>
          
          <Button 
            onClick={requestMicrophoneAccess} 
            className="mt-3"
            disabled={permissionStatus === 'requesting'}
          >
            <Mic className="mr-2 h-4 w-4" />
            {permissionStatus === 'requesting' ? "Requesting Access..." : "Enable Microphone"}
          </Button>
          
          {permissionStatus === 'denied' && (
            <p className="mt-2 text-sm text-red-500">
              Microphone access was denied. Please enable it in your browser settings to use voice features.
            </p>
          )}
        </AlertDescription>
      </Alert>
    </div>
  );
}
