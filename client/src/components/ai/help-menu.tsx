
import React, { useState } from 'react';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetClose,
  SheetDescription,
  SheetFooter,
} from "@/components/ui/sheet";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Search, HelpCircle, ChevronDown, Play, VideoIcon, Lightbulb, MessageSquare } from 'lucide-react';
import { ScrollArea } from "@/components/ui/scroll-area";

const VoiceAssistantHelp = () => {
  const [searchQuery, setSearchQuery] = useState('');
  
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="absolute top-3 right-3">
          <HelpCircle className="h-5 w-5" />
          <span className="sr-only">Help</span>
        </Button>
      </SheetTrigger>
      <SheetContent className="sm:max-w-md md:max-w-lg w-full overflow-y-auto">
        <SheetHeader className="mb-4">
          <SheetTitle>Voice Assistant Help</SheetTitle>
          <SheetDescription>
            Learn how to use the AI voice assistant features
          </SheetDescription>
        </SheetHeader>
        
        <div className="relative mb-4">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search for help..."
            className="pl-8"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        
        <Tabs defaultValue="getting-started" className="w-full">
          <TabsList className="w-full mb-4 grid grid-cols-4">
            <TabsTrigger value="getting-started">Getting Started</TabsTrigger>
            <TabsTrigger value="voice-commands">Voice Commands</TabsTrigger>
            <TabsTrigger value="troubleshooting">Troubleshooting</TabsTrigger>
            <TabsTrigger value="faq">FAQ</TabsTrigger>
          </TabsList>
          
          <ScrollArea className="h-[60vh]">
            <TabsContent value="getting-started" className="space-y-4">
              <div className="space-y-2">
                <h3 className="text-lg font-medium">Welcome to Voice Assistant</h3>
                <p className="text-sm text-muted-foreground">
                  The AI Voice Assistant helps you brainstorm ideas, develop characters, and create dialogue through natural conversation.
                </p>
                
                <div className="rounded-md bg-muted p-4 mt-4">
                  <h4 className="font-medium mb-2 flex items-center gap-2">
                    <Play className="h-4 w-4 text-primary" />
                    Quick Start Guide
                  </h4>
                  <ol className="list-decimal pl-5 space-y-2 text-sm">
                    <li>Click the "Start Session" button to begin a new conversation</li>
                    <li>Use the microphone button to speak to the assistant, or type your query</li>
                    <li>Adjust the voice and volume using the controls in the bottom right</li>
                    <li>End the session when you're finished</li>
                  </ol>
                </div>
                
                <Collapsible className="w-full mt-4 border rounded-md p-2">
                  <CollapsibleTrigger className="flex w-full items-center justify-between p-2">
                    <div className="flex items-center gap-2">
                      <VideoIcon className="h-4 w-4 text-primary" />
                      <span className="font-medium">Watch Tutorial Video</span>
                    </div>
                    <ChevronDown className="h-4 w-4" />
                  </CollapsibleTrigger>
                  <CollapsibleContent className="p-2">
                    <div className="rounded-md bg-muted p-4 flex items-center justify-center h-24">
                      <span className="text-muted-foreground">Tutorial video placeholder</span>
                    </div>
                  </CollapsibleContent>
                </Collapsible>
              </div>
            </TabsContent>
            
            <TabsContent value="voice-commands" className="space-y-4">
              <h3 className="text-lg font-medium">Voice Commands</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Here are some useful voice commands you can use with the assistant:
              </p>
              
              <div className="space-y-3">
                <div className="border rounded-md p-3">
                  <h4 className="font-medium mb-1 flex items-center gap-2">
                    <Lightbulb className="h-4 w-4 text-amber-500" />
                    Plot Ideas
                  </h4>
                  <p className="text-sm text-muted-foreground">Try saying:</p>
                  <ul className="list-disc pl-5 text-sm space-y-1 mt-1">
                    <li>"Give me a plot idea for a fantasy novel"</li>
                    <li>"Help me develop the central conflict in my story"</li>
                    <li>"Suggest a plot twist for my thriller"</li>
                  </ul>
                </div>
                
                <div className="border rounded-md p-3">
                  <h4 className="font-medium mb-1 flex items-center gap-2">
                    <MessageSquare className="h-4 w-4 text-indigo-500" />
                    Dialogue
                  </h4>
                  <p className="text-sm text-muted-foreground">Try saying:</p>
                  <ul className="list-disc pl-5 text-sm space-y-1 mt-1">
                    <li>"Write dialogue between two characters who are arguing"</li>
                    <li>"Help me create realistic dialogue for a teenager"</li>
                    <li>"Generate dialogue for a first-date scene"</li>
                  </ul>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="troubleshooting" className="space-y-4">
              <h3 className="text-lg font-medium">Troubleshooting</h3>
              
              <Collapsible className="w-full border rounded-md">
                <CollapsibleTrigger className="flex w-full items-center justify-between p-4">
                  <span className="font-medium">Microphone not working</span>
                  <ChevronDown className="h-4 w-4" />
                </CollapsibleTrigger>
                <CollapsibleContent className="p-4 pt-0 text-sm">
                  <ol className="list-decimal pl-5 space-y-2">
                    <li>Check that you've granted microphone permissions in your browser</li>
                    <li>Ensure no other application is using the microphone</li>
                    <li>Try refreshing the page</li>
                    <li>If the issue persists, try using a different browser</li>
                  </ol>
                </CollapsibleContent>
              </Collapsible>
              
              <Collapsible className="w-full border rounded-md">
                <CollapsibleTrigger className="flex w-full items-center justify-between p-4">
                  <span className="font-medium">No sound from the assistant</span>
                  <ChevronDown className="h-4 w-4" />
                </CollapsibleTrigger>
                <CollapsibleContent className="p-4 pt-0 text-sm">
                  <ol className="list-decimal pl-5 space-y-2">
                    <li>Check your device volume and ensure it's not muted</li>
                    <li>Verify that the volume slider in the app is not set to 0%</li>
                    <li>Ensure your browser has permission to play audio</li>
                    <li>Try ending and starting a new session</li>
                  </ol>
                </CollapsibleContent>
              </Collapsible>
              
              <Collapsible className="w-full border rounded-md">
                <CollapsibleTrigger className="flex w-full items-center justify-between p-4">
                  <span className="font-medium">Session won't start</span>
                  <ChevronDown className="h-4 w-4" />
                </CollapsibleTrigger>
                <CollapsibleContent className="p-4 pt-0 text-sm">
                  <ol className="list-decimal pl-5 space-y-2">
                    <li>Check your internet connection</li>
                    <li>Verify that you're logged in</li>
                    <li>Try refreshing the page</li>
                    <li>If you're using a VPN, try disabling it temporarily</li>
                  </ol>
                </CollapsibleContent>
              </Collapsible>
            </TabsContent>
            
            <TabsContent value="faq" className="space-y-4">
              <h3 className="text-lg font-medium">Frequently Asked Questions</h3>
              
              <div className="space-y-3">
                <Collapsible className="w-full border rounded-md">
                  <CollapsibleTrigger className="flex w-full items-center justify-between p-4">
                    <span className="font-medium">What voices are available?</span>
                    <ChevronDown className="h-4 w-4" />
                  </CollapsibleTrigger>
                  <CollapsibleContent className="p-4 pt-0">
                    <p className="text-sm">
                      The voice assistant offers several high-quality voices powered by Eleven Labs, including Rachel, Domi, Bella, Antoni, and Elli. You can select your preferred voice from the dropdown menu.
                    </p>
                  </CollapsibleContent>
                </Collapsible>
                
                <Collapsible className="w-full border rounded-md">
                  <CollapsibleTrigger className="flex w-full items-center justify-between p-4">
                    <span className="font-medium">How are my conversations stored?</span>
                    <ChevronDown className="h-4 w-4" />
                  </CollapsibleTrigger>
                  <CollapsibleContent className="p-4 pt-0">
                    <p className="text-sm">
                      Conversations are maintained for the duration of your session. When you end a session, the conversation history is cleared. We don't permanently store the audio recordings of your conversations.
                    </p>
                  </CollapsibleContent>
                </Collapsible>
                
                <Collapsible className="w-full border rounded-md">
                  <CollapsibleTrigger className="flex w-full items-center justify-between p-4">
                    <span className="font-medium">Is there a time limit for sessions?</span>
                    <ChevronDown className="h-4 w-4" />
                  </CollapsibleTrigger>
                  <CollapsibleContent className="p-4 pt-0">
                    <p className="text-sm">
                      Sessions can remain active as long as you need them. However, if your session is inactive for an extended period, it may automatically disconnect. Simply start a new session to continue.
                    </p>
                  </CollapsibleContent>
                </Collapsible>
                
                <Collapsible className="w-full border rounded-md">
                  <CollapsibleTrigger className="flex w-full items-center justify-between p-4">
                    <span className="font-medium">Can I save the assistant's responses to my project?</span>
                    <ChevronDown className="h-4 w-4" />
                  </CollapsibleTrigger>
                  <CollapsibleContent className="p-4 pt-0">
                    <p className="text-sm">
                      Currently, you need to manually copy the responses you want to save. We're working on a feature that will allow you to directly save valuable responses to your project notebooks or character sheets.
                    </p>
                  </CollapsibleContent>
                </Collapsible>
              </div>
            </TabsContent>
          </ScrollArea>
        </Tabs>
        
        <SheetFooter className="mt-6 flex-col sm:justify-between">
          <div className="text-xs text-muted-foreground mb-2">
            Can't find what you're looking for? Contact support at support@example.com
          </div>
          <SheetClose asChild>
            <Button variant="outline" className="w-full sm:w-auto">Close</Button>
          </SheetClose>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
};

export default VoiceAssistantHelp;
