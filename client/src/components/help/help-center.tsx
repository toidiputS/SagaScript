
import React, { useState } from 'react';
import { Search, Book, HelpCircle, MessageSquare, Video, FileText, PenTool, Star, Compass, AirplayIcon } from 'lucide-react';
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from '@/components/ui/tabs';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';

interface HelpArticle {
  id: string;
  title: string;
  category: string;
  content: string;
  tags: string[];
  updated: string;
}

const helpArticles: HelpArticle[] = [
  {
    id: 'getting-started',
    title: 'Getting Started with Saga Scribe',
    category: 'basics',
    content: `
      <h2>Welcome to Saga Scribe!</h2>
      <p>This guide will help you understand the basic features and get you started on your writing journey.</p>
      <h3>Step 1: Create Your First Series</h3>
      <p>Start by creating a new series. This is the top-level container for all your books.</p>
      <ul>
        <li>Click the "New Series" button on your dashboard</li>
        <li>Enter a title and description</li>
        <li>Choose a genre (optional)</li>
        <li>Click "Create"</li>
      </ul>
      <h3>Step 2: Add Your First Book</h3>
      <p>Within your series, you can add one or more books.</p>
      <ul>
        <li>Click on your series</li>
        <li>Select "Add Book"</li>
        <li>Enter the book title and other details</li>
        <li>Click "Create Book"</li>
      </ul>
      <h3>Step 3: Create Chapters</h3>
      <p>Now you can start adding chapters to your book.</p>
      <ul>
        <li>Open your book</li>
        <li>Click "Add Chapter"</li>
        <li>Enter a chapter title</li>
        <li>Begin writing in the editor</li>
      </ul>
    `,
    tags: ['beginner', 'setup', 'tutorial'],
    updated: '2025-03-15'
  },
  {
    id: 'world-building',
    title: 'World-Building Tools Guide',
    category: 'features',
    content: `
      <h2>World-Building Tools</h2>
      <p>Create rich, detailed worlds for your series with our specialized tools.</p>
      
      <h3>Living Timeline</h3>
      <p>The timeline tool helps you organize events in your story chronologically.</p>
      <ul>
        <li>Access the timeline via the "World" tab in your series</li>
        <li>Add events with dates/times</li>
        <li>Connect events to characters</li>
        <li>Visualize the flow of your narrative</li>
      </ul>
      
      <h3>Cultural Architect</h3>
      <p>Build detailed societies, languages, and traditions.</p>
      <ul>
        <li>Define cultural groups</li>
        <li>Create custom languages with the language generator</li>
        <li>Document traditions, ceremonies, and beliefs</li>
        <li>Link cultures to locations and characters</li>
      </ul>
      
      <h3>Setting Atlas</h3>
      <p>Map out your world visually from small rooms to entire universes.</p>
      <ul>
        <li>Create maps at different scales</li>
        <li>Add locations with descriptions</li>
        <li>Link locations to events and characters</li>
        <li>Use the built-in map editor or import existing maps</li>
      </ul>
    `,
    tags: ['world-building', 'advanced', 'maps', 'timeline', 'cultures'],
    updated: '2025-03-18'
  },
  {
    id: 'ai-companion',
    title: 'Using the Writer's Companion AI',
    category: 'features',
    content: `
      <h2>Writer's Companion AI Features</h2>
      <p>Your AI assistant for more productive and creative writing.</p>
      
      <h3>Context-Aware Suggestions</h3>
      <p>Get intelligent suggestions based on your established world and characters.</p>
      <ul>
        <li>Enable suggestions in the editor settings</li>
        <li>AI analyzes your existing content to provide relevant ideas</li>
        <li>Accept or modify suggestions as needed</li>
        <li>Request specific types of suggestions (plot twists, character actions, etc.)</li>
      </ul>
      
      <h3>Consistency Checker</h3>
      <p>Identify and fix continuity errors across your series.</p>
      <ul>
        <li>Run the consistency check from the "Tools" menu</li>
        <li>Review potential issues with character details, plot elements, or timelines</li>
        <li>Accept suggested fixes or address manually</li>
        <li>Schedule regular checks to maintain continuity</li>
      </ul>
      
      <h3>Voice Matching</h3>
      <p>Maintain consistent tone and style throughout your writing.</p>
      <ul>
        <li>Analyze your writing style in the "AI" section</li>
        <li>Get feedback on maintaining character voices</li>
        <li>Receive suggestions for keeping narrative tone consistent</li>
        <li>Compare writing style between chapters or books</li>
      </ul>
    `,
    tags: ['AI', 'assistant', 'suggestions', 'consistency', 'writing'],
    updated: '2025-03-20'
  },
  {
    id: 'subscription-tiers',
    title: 'Understanding Subscription Plans',
    category: 'account',
    content: `
      <h2>Saga Scribe Subscription Plans</h2>
      <p>Choose the right plan for your writing needs.</p>
      
      <h3>The Apprentice (Free)</h3>
      <p>Get started with basic features at no cost.</p>
      <ul>
        <li>1 active series with up to 3 books</li>
        <li>Up to 10 character profiles</li>
        <li>Up to 10 location entries</li>
        <li>Basic AI assistance (3 prompts per day)</li>
        <li>Basic daily word count tracking</li>
        <li>7-day streak visualization</li>
        <li>5GB cloud storage</li>
        <li>Weekly backups</li>
        <li>Basic export formats (TXT, DOC)</li>
        <li>Email support (48-hour response time)</li>
      </ul>
      
      <h3>The Wordsmith</h3>
      <p>For dedicated writers working on multiple projects.</p>
      <ul>
        <li>5 active series with unlimited books</li>
        <li>Unlimited character profiles</li>
        <li>Unlimited location entries</li>
        <li>Advanced AI assistance (50 prompts per day)</li>
        <li>Advanced character relationship mapping</li>
        <li>Personalized writing challenges</li>
        <li>20GB cloud storage</li>
        <li>Daily backups</li>
        <li>Priority email support (24-hour response time)</li>
      </ul>
      
      <h3>The Loremaster</h3>
      <p>Professional-grade tools for serious authors.</p>
      <ul>
        <li>Unlimited series</li>
        <li>Comprehensive timeline management</li>
        <li>Advanced multimedia integration</li>
        <li>Community collaboration features</li>
        <li>Premium AI writing tools (200 prompts per day)</li>
        <li>50GB cloud storage</li>
        <li>Hourly backups</li>
        <li>Live chat support</li>
      </ul>
      
      <h3>Upgrading Your Plan</h3>
      <p>To upgrade, visit the Subscriptions page in your account settings.</p>
    `,
    tags: ['subscription', 'pricing', 'plans', 'features', 'account'],
    updated: '2025-03-22'
  },
  {
    id: 'keyboard-shortcuts',
    title: 'Keyboard Shortcuts',
    category: 'basics',
    content: `
      <h2>Keyboard Shortcuts</h2>
      <p>Speed up your workflow with these handy shortcuts.</p>
      
      <h3>General Navigation</h3>
      <table>
        <tr><td><kbd>Ctrl</kbd> + <kbd>H</kbd></td><td>Home/Dashboard</td></tr>
        <tr><td><kbd>Ctrl</kbd> + <kbd>S</kbd></td><td>Series List</td></tr>
        <tr><td><kbd>Ctrl</kbd> + <kbd>C</kbd></td><td>Characters</td></tr>
        <tr><td><kbd>Ctrl</kbd> + <kbd>W</kbd></td><td>World-Building</td></tr>
        <tr><td><kbd>Ctrl</kbd> + <kbd>/</kbd></td><td>Search</td></tr>
      </table>
      
      <h3>Editor Shortcuts</h3>
      <table>
        <tr><td><kbd>Ctrl</kbd> + <kbd>B</kbd></td><td>Bold</td></tr>
        <tr><td><kbd>Ctrl</kbd> + <kbd>I</kbd></td><td>Italic</td></tr>
        <tr><td><kbd>Ctrl</kbd> + <kbd>U</kbd></td><td>Underline</td></tr>
        <tr><td><kbd>Ctrl</kbd> + <kbd>Z</kbd></td><td>Undo</td></tr>
        <tr><td><kbd>Ctrl</kbd> + <kbd>Y</kbd></td><td>Redo</td></tr>
        <tr><td><kbd>Ctrl</kbd> + <kbd>F</kbd></td><td>Find in chapter</td></tr>
        <tr><td><kbd>Ctrl</kbd> + <kbd>G</kbd></td><td>Go to line</td></tr>
        <tr><td><kbd>F5</kbd></td><td>Save</td></tr>
      </table>
      
      <h3>AI Assistant</h3>
      <table>
        <tr><td><kbd>Alt</kbd> + <kbd>A</kbd></td><td>Activate Voice Assistant</td></tr>
        <tr><td><kbd>Alt</kbd> + <kbd>S</kbd></td><td>Request Suggestion</td></tr>
        <tr><td><kbd>Alt</kbd> + <kbd>C</kbd></td><td>Check Consistency</td></tr>
      </table>
    `,
    tags: ['shortcuts', 'keyboard', 'productivity', 'tips'],
    updated: '2025-03-10'
  }
];

export default function HelpCenter() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedArticle, setSelectedArticle] = useState<HelpArticle | null>(null);
  
  // Filter articles based on search query
  const filteredArticles = helpArticles.filter(article => 
    searchQuery === '' || 
    article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    article.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
    article.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
  );
  
  // Group articles by category
  const articlesByCategory = filteredArticles.reduce((acc, article) => {
    if (!acc[article.category]) {
      acc[article.category] = [];
    }
    acc[article.category].push(article);
    return acc;
  }, {} as Record<string, HelpArticle[]>);
  
  const openArticle = (article: HelpArticle) => {
    setSelectedArticle(article);
  };
  
  const closeArticle = () => {
    setSelectedArticle(null);
  };
  
  const categoryIcons = {
    basics: <Book className="h-5 w-5" />,
    features: <Star className="h-5 w-5" />,
    account: <AirplayIcon className="h-5 w-5" />,
    troubleshooting: <HelpCircle className="h-5 w-5" />
  };
  
  const handleHelpClick = (e: React.MouseEvent<HTMLElement>) => {
    e.preventDefault();
    // Handle help click
  };

  const handleSupportClick = (e: React.MouseEvent<HTMLElement>) => {
    e.preventDefault();
    // Handle support click
  };

  return (
    <div className="container mx-auto py-6 px-4 max-w-6xl">
      <div className="flex flex-col space-y-4">
        <div className="flex flex-col space-y-2">
          <h1 className="text-3xl font-bold">Help Center</h1>
          <p className="text-muted-foreground">Find answers, tutorials, and guides for Saga Scribe</p>
        </div>
        
        <div className="relative">
          <Search className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
          <Input 
            placeholder="Search for help..."
            className="pl-10 py-6 text-lg"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        
        {selectedArticle ? (
          <div className="bg-card rounded-lg border shadow-sm">
            <div className="p-6">
              <Button 
                variant="ghost" 
                onClick={closeArticle}
                className="mb-4"
              >
                ← Back to Help Center
              </Button>
              
              <h1 className="text-2xl font-bold mb-2">{selectedArticle.title}</h1>
              
              <div className="flex flex-wrap gap-2 mb-4">
                {selectedArticle.tags.map(tag => (
                  <Badge key={tag} variant="secondary">{tag}</Badge>
                ))}
              </div>
              
              <p className="text-sm text-muted-foreground mb-6">
                Last updated: {selectedArticle.updated}
              </p>
              
              <div 
                className="prose prose-slate max-w-none dark:prose-invert"
                dangerouslySetInnerHTML={{ __html: selectedArticle.content }}
              />
              
              <div className="mt-8 pt-6 border-t">
                <h3 className="font-semibold mb-4">Was this article helpful?</h3>
                <div className="flex gap-2">
                  <Button variant="outline">Yes, it helped</Button>
                  <Button variant="outline">No, I need more help</Button>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              <Card className="cursor-pointer hover:bg-accent/10 transition-colors" onClick={() => setSearchQuery('basics')}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Getting Started</CardTitle>
                  <Book className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">Basic guides for new users</p>
                </CardContent>
              </Card>
              
              <Card className="cursor-pointer hover:bg-accent/10 transition-colors" onClick={() => setSearchQuery('features')}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Features & Tools</CardTitle>
                  <PenTool className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">Learn about all available features</p>
                </CardContent>
              </Card>
              
              <Card className="cursor-pointer hover:bg-accent/10 transition-colors" onClick={() => setSearchQuery('troubleshooting')}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Troubleshooting</CardTitle>
                  <HelpCircle className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">Solve common issues</p>
                </CardContent>
              </Card>
              
              <Card className="cursor-pointer hover:bg-accent/10 transition-colors" onClick={() => setSearchQuery('account')}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Account & Billing</CardTitle>
                  <AirplayIcon className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">Manage your subscription</p>
                </CardContent>
              </Card>
            </div>
            
            <Tabs defaultValue="articles" className="w-full">
              <TabsList className="mb-4">
                <TabsTrigger value="articles">Articles</TabsTrigger>
                <TabsTrigger value="videos">Video Tutorials</TabsTrigger>
                <TabsTrigger value="faq">FAQ</TabsTrigger>
              </TabsList>
              
              <TabsContent value="articles">
                <ScrollArea className="h-[60vh]">
                  {Object.entries(articlesByCategory).map(([category, articles]) => (
                    <div key={category} className="mb-8">
                      <div className="flex items-center gap-2 mb-4">
                        {categoryIcons[category as keyof typeof categoryIcons]}
                        <h2 className="text-xl font-semibold capitalize">{category}</h2>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {articles.map(article => (
                          <Card 
                            key={article.id} 
                            className="cursor-pointer hover:bg-accent/10 transition-colors"
                            onClick={() => openArticle(article)}
                          >
                            <CardHeader>
                              <CardTitle>{article.title}</CardTitle>
                              <CardDescription>
                                {article.tags.slice(0, 3).map(tag => (
                                  <Badge key={tag} variant="outline" className="mr-1">
                                    {tag}
                                  </Badge>
                                ))}
                              </CardDescription>
                            </CardHeader>
                            <CardFooter>
                              <p className="text-sm text-muted-foreground">
                                Updated: {article.updated}
                              </p>
                            </CardFooter>
                          </Card>
                        ))}
                      </div>
                    </div>
                  ))}
                  
                  {Object.keys(articlesByCategory).length === 0 && (
                    <div className="flex flex-col items-center justify-center py-12">
                      <p className="text-muted-foreground mb-4">No articles found matching your search</p>
                      <Button onClick={() => setSearchQuery('')}>Clear Search</Button>
                    </div>
                  )}
                </ScrollArea>
              </TabsContent>
              
              <TabsContent value="videos">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader>
                      <div className="aspect-video bg-muted rounded-md flex items-center justify-center">
                        <Video className="h-12 w-12 text-muted-foreground" />
                      </div>
                      <CardTitle className="mt-4">Getting Started with Saga Scribe</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p>Learn the basics of creating your first series and books.</p>
                    </CardContent>
                    <CardFooter>
                      <Button className="w-full">Watch Video</Button>
                    </CardFooter>
                  </Card>
                  
                  <Card>
                    <CardHeader>
                      <div className="aspect-video bg-muted rounded-md flex items-center justify-center">
                        <Video className="h-12 w-12 text-muted-foreground" />
                      </div>
                      <CardTitle className="mt-4">World-Building Tools Tutorial</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p>A comprehensive guide to using timeline, cultural tools, and maps.</p>
                    </CardContent>
                    <CardFooter>
                      <Button className="w-full">Watch Video</Button>
                    </CardFooter>
                  </Card>
                  
                  <Card>
                    <CardHeader>
                      <div className="aspect-video bg-muted rounded-md flex items-center justify-center">
                        <Video className="h-12 w-12 text-muted-foreground" />
                      </div>
                      <CardTitle className="mt-4">AI Assistant Features</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p>Master all the AI-powered features to enhance your writing.</p>
                    </CardContent>
                    <CardFooter>
                      <Button className="w-full">Watch Video</Button>
                    </CardFooter>
                  </Card>
                  
                  <Card>
                    <CardHeader>
                      <div className="aspect-video bg-muted rounded-md flex items-center justify-center">
                        <Video className="h-12 w-12 text-muted-foreground" />
                      </div>
                      <CardTitle className="mt-4">Character Development Tools</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p>Learn how to create and manage memorable characters.</p>
                    </CardContent>
                    <CardFooter>
                      <Button className="w-full">Watch Video</Button>
                    </CardFooter>
                  </Card>
                </div>
              </TabsContent>
              
              <TabsContent value="faq">
                <Accordion type="single" collapsible className="w-full">
                  <AccordionItem value="faq-1">
                    <AccordionTrigger>How do I create a new series?</AccordionTrigger>
                    <AccordionContent>
                      <p>To create a new series:</p>
                      <ol className="list-decimal ml-5 mt-2">
                        <li>Go to your dashboard</li>
                        <li>Click the "New Series" button</li>
                        <li>Enter a title and description</li>
                        <li>Click "Create"</li>
                      </ol>
                    </AccordionContent>
                  </AccordionItem>
                  
                  <AccordionItem value="faq-2">
                    <AccordionTrigger>What's the difference between subscription tiers?</AccordionTrigger>
                    <AccordionContent>
                      <p>Saga Scribe offers three subscription tiers:</p>
                      <ul className="list-disc ml-5 mt-2">
                        <li><strong>The Apprentice (Free)</strong>: Basic features with limited series and books</li>
                        <li><strong>The Journeyman</strong>: More series, unlimited books, and advanced AI tools</li>
                        <li><strong>The Master</strong>: Unlimited everything, plus premium features like voice dictation</li>
                      </ul>
                      <p className="mt-2">Visit the <a href="/subscriptions" className="text-primary underline">Subscriptions page</a> to see a detailed comparison.</p>
                    </AccordionContent>
                  </AccordionItem>
                  
                  <AccordionItem value="faq-3">
                    <AccordionTrigger>Can I export my work to other formats?</AccordionTrigger>
                    <AccordionContent>
                      <p>Yes, Saga Scribe allows you to export your work in several formats:</p>
                      <ul className="list-disc ml-5 mt-2">
                        <li>PDF</li>
                        <li>EPUB (for e-readers)</li>
                        <li>DOCX (Microsoft Word)</li>
                        <li>Markdown</li>
                        <li>Plain Text</li>
                      </ul>
                      <p className="mt-2">Export options can be found in the "Export" menu when viewing a book or chapter.</p>
                    </AccordionContent>
                  </AccordionItem>
                  
                  <AccordionItem value="faq-4">
                    <AccordionTrigger>Is my data secure and backed up?</AccordionTrigger>
                    <AccordionContent>
                      <p>Yes, your data is secure and regularly backed up:</p>
                      <ul className="list-disc ml-5 mt-2">
                        <li>All data is encrypted both in transit and at rest</li>
                        <li>Automatic backups occur every 24 hours</li>
                        <li>You can create manual backups at any time</li>
                        <li>Data is stored redundantly across multiple secure servers</li>
                      </ul>
                      <p className="mt-2">For additional security, we recommend periodically exporting your work as a local backup.</p>
                    </AccordionContent>
                  </AccordionItem>
                  
                  <AccordionItem value="faq-5">
                    <AccordionTrigger>How do I get help if I encounter an issue?</AccordionTrigger>
                    <AccordionContent>
                      <p>If you need assistance, you have several options:</p>
                      <ul className="list-disc ml-5 mt-2">
                        <li>Check this Help Center for guides and tutorials</li>
                        <li>Visit our <a href="/community" className="text-primary underline">Community Forum</a> to ask questions</li>
                        <li>Contact our support team via the <a href="/support" className="text-primary underline cursor-pointer" onClick={handleSupportClick}>Support page</a></li>
                        <li>Premium subscribers have access to priority support</li>
                      </ul>
                      <p className="mt-2">Our support team typically responds within 24 hours (faster for premium subscribers).</p>
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              </TabsContent>
            </Tabs>
          </>
        )}
        
        <div className="mt-6 pt-6 border-t">
          <h3 className="text-lg font-semibold mb-4">Still need help?</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <MessageSquare className="mr-2 h-5 w-5" />
                  Contact Support
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">Get personalized help from our support team</p>
              </CardContent>
              <CardFooter>
                <Button variant="outline" className="w-full">Contact Us</Button>
              </CardFooter>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Compass className="mr-2 h-5 w-5" />
                  Community Forum
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">Connect with other users and share tips</p>
              </CardContent>
              <CardFooter>
                <Button variant="outline" className="w-full">Visit Forum</Button>
              </CardFooter>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <FileText className="mr-2 h-5 w-5" />
                  Documentation
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">Browse our complete documentation</p>
              </CardContent>
              <CardFooter>
                <Button variant="outline" className="w-full">View Docs</Button>
              </CardFooter>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
