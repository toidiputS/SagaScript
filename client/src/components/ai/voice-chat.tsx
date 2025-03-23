
import React, { useState } from 'react';
import { useConversation } from '@11labs/react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Mic, MicOff, Play, Square } from 'lucide-react';
import MicrophonePermission from './microphone-permission';
import { useFeatureAccess } from '@/lib/subscription';
import { FeatureGate } from '@/components/ui/feature-gate';

export default function VoiceChat() {
  const [inputText, setInputText] = useState('');
  const [hasMicrophonePermission, setHasMicrophonePermission] = useState(false);
  const { canAccess } = useFeatureAccess();
  
  const {
    history,
    isGenerating,
    generate,
    abort,
    startRecording,
    stopRecording,
    isRecording
  } = useConversation({
    // Use a default voice or get from user preferences
    voiceId: "21m00Tcm4TlvDq8ikWAM"
  });

  const handleSendMessage = async () => {
    if (!inputText.trim()) return;
    
    await generate(inputText);
    setInputText('');
  };

  const toggleRecording = () => {
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  };

  return (
    <Card className="w-full max-w-3xl mx-auto">
      <CardHeader>
        <CardTitle>AI Voice Assistant</CardTitle>
        <CardDescription>
          Chat with your writing assistant using voice or text
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {!hasMicrophonePermission && (
          <FeatureGate feature="customVoices" requiredTier="wordsmith">
            <MicrophonePermission 
              onPermissionGranted={() => setHasMicrophonePermission(true)} 
            />
          </FeatureGate>
        )}
        
        <div className="h-64 overflow-y-auto bg-muted p-4 rounded-md">
          {history.map((message, index) => (
            <div 
              key={index} 
              className={`mb-3 p-3 rounded-lg ${
                message.role === 'user' 
                  ? 'bg-primary/10 ml-auto max-w-[80%]' 
                  : 'bg-secondary/10 mr-auto max-w-[80%]'
              }`}
            >
              <p className="text-sm font-medium">
                {message.role === 'user' ? 'You' : 'Assistant'}
              </p>
              <p>{message.content}</p>
            </div>
          ))}
          {history.length === 0 && (
            <div className="text-center text-muted-foreground">
              <p>Your conversation will appear here</p>
            </div>
          )}
        </div>
        
        <div className="flex items-end gap-2">
          <Textarea
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Type your message here..."
            className="resize-none"
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSendMessage();
              }
            }}
          />
          <div className="flex flex-col gap-2">
            {hasMicrophonePermission && (
              <Button 
                variant="outline" 
                size="icon" 
                onClick={toggleRecording}
                className={isRecording ? "bg-red-100" : ""}
                disabled={!hasMicrophonePermission}
              >
                {isRecording ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
              </Button>
            )}
            
            {isGenerating ? (
              <Button variant="destructive" size="icon" onClick={abort}>
                <Square className="h-4 w-4" />
              </Button>
            ) : (
              <Button variant="default" size="icon" onClick={handleSendMessage}>
                <Play className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      </CardContent>
      
      <CardFooter className="text-xs text-muted-foreground">
        <p>Powered by Eleven Labs</p>
      </CardFooter>
    </Card>
  );
}
