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

  const [selectedVoice, setSelectedVoice] = useState("21m00Tcm4TlvDq8ikWAM"); // Default voice ID

  const conversation = useConversation();
  const [conversationSessionId, setConversationSessionId] = useState(null);

  const {
    history,
    isGenerating,
    generate,
    abort,
    startRecording,
    stopRecording,
    isRecording
  } = useConversation({
    voiceId: selectedVoice,
    onStart: () => {
      console.log("AI started generating response");
    },
    onFinish: () => {
      console.log("AI finished generating response");
    }
    // Note: Typically you'd use an API key from environment variables,
    // but in the FeatureGate component it seems this might be handled elsewhere
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
          {conversationSessionId && (
            <span className="block mt-1 text-sm text-primary">
              Session active with context URL
            </span>
          )}
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

      <CardFooter className="flex justify-between items-center">
        <p className="text-xs text-muted-foreground">Powered by Eleven Labs</p>
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground">Voice:</span>
          <select 
            className="text-xs p-1 rounded border border-input"
            value={selectedVoice}
            onChange={(e) => setSelectedVoice(e.target.value)}
            disabled={isGenerating || isRecording}
          >
            <option value="21m00Tcm4TlvDq8ikWAM">Rachel</option>
            <option value="AZnzlk1XvdvUeBnXmlld">Domi</option>
            <option value="EXAVITQu4vr4xnSDxMaL">Bella</option>
            <option value="ErXwobaYiN019PkySvjV">Antoni</option>
            <option value="MF3mGyEYCl7XYWbV9V6O">Elli</option>
          </select>
        </div>
      </CardFooter>
    </Card>
  );
}