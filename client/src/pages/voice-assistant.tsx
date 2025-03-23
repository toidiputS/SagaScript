
import React from 'react';
import VoiceChat from '@/components/ai/voice-chat';
import { FeatureGate } from '@/components/ui/feature-gate';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { ShieldAlert } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useLocation } from 'wouter';

export default function VoiceAssistantPage() {
  const [_, setLocation] = useLocation();
  
  return (
    <div className="container mx-auto py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Voice Assistant</h1>
        <p className="text-muted-foreground">
          Get writing help and suggestions using natural voice conversations
        </p>
      </div>
      
      <FeatureGate 
        feature="customVoices"
        requiredTier="wordsmith"
        renderChildren={false}
      >
        <div className="mb-8">
          <Alert variant="destructive">
            <ShieldAlert className="h-4 w-4" />
            <AlertTitle>Premium Feature</AlertTitle>
            <AlertDescription>
              <p className="mb-3">
                The Voice Assistant feature requires a Wordsmith subscription or higher.
              </p>
              <Button 
                variant="outline" 
                onClick={() => setLocation('/subscription')}
              >
                View Subscription Options
              </Button>
            </AlertDescription>
          </Alert>
        </div>
        
        <div className="bg-muted/30 p-8 border border-border rounded-lg">
          <div className="text-center max-w-md mx-auto">
            <h2 className="text-xl font-semibold mb-3">Voice-Powered Writing Assistant</h2>
            <p className="text-muted-foreground mb-4">
              Upgrade to access our AI voice assistant that can help with plot ideas, character development, 
              dialogue suggestions, and more through natural conversation.
            </p>
          </div>
        </div>
      </FeatureGate>
      
      <FeatureGate 
        feature="customVoices"
        requiredTier="wordsmith"
      >
        <VoiceChat />
      </FeatureGate>
    </div>
  );
}
