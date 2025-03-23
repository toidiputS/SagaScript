
import React, { useState } from 'react';
import { Search, HelpCircle } from 'lucide-react';
import { 
  Sheet, 
  SheetContent, 
  SheetDescription, 
  SheetHeader, 
  SheetTitle, 
  SheetTrigger 
} from '@/components/ui/sheet';
import { Input } from '@/components/ui/input';
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ExternalLink } from 'lucide-react';

const VoiceAssistantHelp = () => {
  const [searchQuery, setSearchQuery] = useState('');
  
  // Filter content based on search query
  const filterContent = (content: string) => {
    if (!searchQuery) return true;
    return content.toLowerCase().includes(searchQuery.toLowerCase());
  };
  
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
              <Card>
                <CardHeader>
                  <CardTitle>Welcome to Saga Scribe</CardTitle>
                  <CardDescription>Your AI-powered writing assistant for series authors</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <section>
                    <h3 className="font-semibold mb-2">What is the Voice Assistant?</h3>
                    <p>The Voice Assistant is an AI-powered tool that allows you to interact with Saga Scribe using your voice. You can give commands, ask questions, and receive suggestions without typing.</p>
                  </section>
                  
                  <section>
                    <h3 className="font-semibold mb-2">Getting Started</h3>
                    <ol className="list-decimal pl-5 space-y-2">
                      <li>Click the microphone icon in the voice chat interface</li>
                      <li>Allow microphone access when prompted by your browser</li>
                      <li>Speak your command or question clearly</li>
                      <li>Wait for the AI to process and respond to your request</li>
                    </ol>
                  </section>
                  
                  <section className="border-t pt-4">
                    <h3 className="font-semibold mb-2">Key Features</h3>
                    <ul className="list-disc pl-5 space-y-2">
                      <li>Voice-to-text transcription</li>
                      <li>Natural language commands</li>
                      <li>Real-time response generation</li>
                      <li>Creative writing suggestions</li>
                      <li>Character and plot development assistance</li>
                    </ul>
                  </section>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="voice-commands" className="space-y-4">
              <Accordion type="single" collapsible className="w-full">
                <AccordionItem value="writing-commands">
                  <AccordionTrigger>Writing Commands</AccordionTrigger>
                  <AccordionContent>
                    <ul className="list-disc pl-5 space-y-2">
                      <li><strong>"Generate a plot idea for [book title]"</strong> - Creates a new plot suggestion</li>
                      <li><strong>"Help me develop [character name]"</strong> - Provides character development suggestions</li>
                      <li><strong>"What's a good setting for [scene type]"</strong> - Offers setting ideas</li>
                      <li><strong>"Write a description of [location/character/object]"</strong> - Creates descriptive text</li>
                    </ul>
                  </AccordionContent>
                </AccordionItem>
                
                <AccordionItem value="navigation-commands">
                  <AccordionTrigger>Navigation Commands</AccordionTrigger>
                  <AccordionContent>
                    <ul className="list-disc pl-5 space-y-2">
                      <li><strong>"Go to [dashboard/characters/timeline]"</strong> - Navigates to specific section</li>
                      <li><strong>"Open [book/chapter] [name/number]"</strong> - Opens specified content</li>
                      <li><strong>"Show me my progress stats"</strong> - Displays writing analytics</li>
                      <li><strong>"Create new [book/chapter/character]"</strong> - Initiates creation process</li>
                    </ul>
                  </AccordionContent>
                </AccordionItem>
                
                <AccordionItem value="editing-commands">
                  <AccordionTrigger>Editing Commands</AccordionTrigger>
                  <AccordionContent>
                    <ul className="list-disc pl-5 space-y-2">
                      <li><strong>"Check grammar in this chapter"</strong> - Runs grammar checking</li>
                      <li><strong>"Find consistency issues in [character name]"</strong> - Identifies continuity problems</li>
                      <li><strong>"How can I improve this dialog?"</strong> - Suggests dialog enhancements</li>
                      <li><strong>"Make this paragraph more [descriptive/emotional/tense]"</strong> - Style adjustments</li>
                    </ul>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </TabsContent>
            
            <TabsContent value="troubleshooting" className="space-y-4">
              <Accordion type="single" collapsible className="w-full">
                <AccordionItem value="mic-issues">
                  <AccordionTrigger>Microphone Not Working</AccordionTrigger>
                  <AccordionContent>
                    <ol className="list-decimal pl-5 space-y-2">
                      <li>Check that your browser has permission to access your microphone</li>
                      <li>Ensure your microphone is connected and selected as the input device</li>
                      <li>Try refreshing the page</li>
                      <li>Restart your browser</li>
                      <li>If issues persist, try a different browser</li>
                    </ol>
                  </AccordionContent>
                </AccordionItem>
                
                <AccordionItem value="assistant-not-responding">
                  <AccordionTrigger>Assistant Not Responding</AccordionTrigger>
                  <AccordionContent>
                    <ol className="list-decimal pl-5 space-y-2">
                      <li>Check your internet connection</li>
                      <li>Ensure you're speaking clearly and at a normal volume</li>
                      <li>Try using shorter, more direct commands</li>
                      <li>Refresh the page and try again</li>
                      <li>If you're on a free plan, check if you've reached your daily usage limit</li>
                    </ol>
                  </AccordionContent>
                </AccordionItem>
                
                <AccordionItem value="incorrect-transcription">
                  <AccordionTrigger>Incorrect Voice Transcription</AccordionTrigger>
                  <AccordionContent>
                    <ol className="list-decimal pl-5 space-y-2">
                      <li>Speak more slowly and clearly</li>
                      <li>Reduce background noise</li>
                      <li>Position your microphone closer</li>
                      <li>Try rephrasing your command</li>
                      <li>For character or location names, try spelling them out</li>
                    </ol>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </TabsContent>
            
            <TabsContent value="faq" className="space-y-4">
              <Accordion type="single" collapsible className="w-full">
                {[
                  {
                    id: "voice-limits",
                    question: "Are there limits to voice assistant usage?",
                    answer: "Usage limits depend on your subscription plan. Free users have access to 20 voice commands per day, while paid plans have higher or unlimited access."
                  },
                  {
                    id: "voice-privacy",
                    question: "Is my voice data stored or shared?",
                    answer: "Your voice recordings are not stored permanently. They are processed in real-time, converted to text, and then discarded. The text transcriptions are stored only to provide you with a history of your interactions."
                  },
                  {
                    id: "languages",
                    question: "What languages are supported?",
                    answer: "Currently, the voice assistant supports English only. We plan to add support for additional languages in future updates."
                  },
                  {
                    id: "offline-use",
                    question: "Can I use the voice assistant offline?",
                    answer: "No, the voice assistant requires an internet connection to function as the voice processing and AI responses are handled by our cloud servers."
                  },
                  {
                    id: "learning",
                    question: "Does the assistant learn from my writing?",
                    answer: "The assistant can adapt to your writing style and preferences over time, offering more personalized suggestions. However, your content is never used to train the general AI model."
                  }
                ].filter(item => filterContent(item.question + item.answer)).map(item => (
                  <AccordionItem key={item.id} value={item.id}>
                    <AccordionTrigger>{item.question}</AccordionTrigger>
                    <AccordionContent>{item.answer}</AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </TabsContent>
          </ScrollArea>
        </Tabs>
        
        <div className="mt-6 pt-4 border-t">
          <h3 className="font-semibold mb-2">Additional Resources</h3>
          <div className="grid grid-cols-2 gap-3">
            <Button variant="outline" className="justify-start" onClick={() => window.open('/documentation', '_blank')}>
              <span className="flex items-center">
                Documentation
                <ExternalLink className="ml-2 h-4 w-4" />
              </span>
            </Button>
            <Button variant="outline" className="justify-start" onClick={() => window.open('/tutorials', '_blank')}>
              <span className="flex items-center">
                Video Tutorials
                <ExternalLink className="ml-2 h-4 w-4" />
              </span>
            </Button>
            <Button variant="outline" className="justify-start" onClick={() => window.open('/community', '_blank')}>
              <span className="flex items-center">
                Community Forum
                <ExternalLink className="ml-2 h-4 w-4" />
              </span>
            </Button>
            <Button variant="outline" className="justify-start" onClick={() => window.open('/support', '_blank')}>
              <span className="flex items-center">
                Contact Support
                <ExternalLink className="ml-2 h-4 w-4" />
              </span>
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default VoiceAssistantHelp;
